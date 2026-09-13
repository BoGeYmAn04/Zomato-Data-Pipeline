import os
from dotenv import load_dotenv
from src.ai.chains.enrichment import get_enrichment_chain
from src.ai.db.snowflake import get_connection

load_dotenv()

BATCH_SIZE = int(os.getenv("ENRICH_BATCH_SIZE", "5"))

MODEL = os.getenv("LLM_MODEL", "gemini-3.5-flash-lite")
def get_reviews_to_enrich(cursor):
    query = """
        SELECT
            r.REVIEW_ID,
            r.COMMENT
        FROM ZOMATO.STAGING.STG_REVIEWS r
        WHERE NOT EXISTS (
            SELECT 1
            FROM ZOMATO.AI.REVIEW_ENRICHED e
            WHERE e.REVIEW_ID = r.REVIEW_ID
        )
        AND r.COMMENT IS NOT NULL
        LIMIT %s
    """
    cursor.execute(query, (BATCH_SIZE,))
    return cursor.fetchall()

def save_results(cursor, results):
    if not results:
        return
    query = """
        INSERT INTO ZOMATO.AI.REVIEW_ENRICHED
        (
            REVIEW_ID,
            SENTIMENT_LABEL,
            SENTIMENT_SCORE,
            TOPIC,
            KEY_ISSUE,
            MODEL
        )
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    cursor.executemany(
        query,
        results,
    )

def main():
    conn = get_connection()
    cursor = conn.cursor()
    try:
        reviews = get_reviews_to_enrich(cursor)
        if not reviews:
            print("No new reviews to enrich.")
            return
        print(f"Found {len(reviews)} reviews to enrich.")
        chain = get_enrichment_chain()
        results = []
        for review_id, comment in reviews:
            print(f"\nEnriching review: {review_id}")
            try:
                enrichment = chain.invoke({"review": comment,})
                print(enrichment)
                results.append(
                    (
                        review_id,
                        enrichment["sentiment_label"],
                        enrichment["sentiment_score"],
                        enrichment["topic"],
                        enrichment.get("key_issue"),
                        MODEL,
                    )
                )
            except Exception as exc:
                print(f"Failed review {review_id}: {exc}")
        save_results(cursor,results,)
        conn.commit()
        print(f"\nSaved {len(results)} enriched reviews.")
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main()

