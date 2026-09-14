from src.ai.chains.enrichment import get_enrichment_chain
from src.ai.config import get_env, get_int
from src.ai.db.snowflake import get_connection

BATCH_SIZE = get_int("ENRICH_BATCH_SIZE", 5)
MAX_PER_RUN = get_int("ENRICH_MAX_PER_RUN",20,)
MODEL = get_env("LLM_MODEL","gemini-3.5-flash-lite",)

def get_reviews_to_enrich(cursor,limit: int,failed_ids: set,):
    query = """
        SELECT
            r.REVIEW_ID,
            r.COMMENT
        FROM ZOMATO.STAGING.STG_REVIEWS r
        WHERE NOT EXISTS
        (
            SELECT 1
            FROM ZOMATO.AI.REVIEW_ENRICHED e
            WHERE
                e.REVIEW_ID = r.REVIEW_ID
        )
        AND r.COMMENT IS NOT NULL
        AND TRIM(r.COMMENT) <> ''
    """
    params = []
    # Prevent permanently failing reviews from being
    # selected repeatedly during the same Airflow run.
    if failed_ids:
        placeholders = ", ".join(["%s"] * len(failed_ids))
        query += f"""
            AND r.REVIEW_ID NOT IN ({placeholders})
        """
        params.extend(list(failed_ids))
    query += """ORDER BY r.REVIEW_ID LIMIT %s"""
    params.append(limit)
    cursor.execute(query,tuple(params),)
    return cursor.fetchall()

def save_results(cursor,results,):
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
        VALUES
        (%s,%s,%s,%s,%s,%s)
    """
    cursor.executemany(query,results)

def main():
    conn = get_connection()
    cursor = conn.cursor()
    chain = get_enrichment_chain()
    total_attempted = 0
    total_saved = 0
    total_failed = 0
    failed_ids = set()
    print(f"Batch size: {BATCH_SIZE}")
    print(f"Maximum reviews this run: "+ ("unlimited" if MAX_PER_RUN == 0 else str(MAX_PER_RUN)))
    try:
        while True:
            if (MAX_PER_RUN > 0 and total_attempted >= MAX_PER_RUN):
                print(f"\nReached maximum of {MAX_PER_RUN} reviews.")
                break
            current_batch_size = BATCH_SIZE
            if MAX_PER_RUN > 0:
                remaining = (MAX_PER_RUN - total_attempted)
                current_batch_size = min(BATCH_SIZE,remaining)
            reviews = get_reviews_to_enrich(
                cursor=cursor,
                limit=current_batch_size,
                failed_ids=failed_ids,
            )
            if not reviews:
                print("\nNo new reviews to enrich.")
                break
            print(f"\nFound {len(reviews)} reviews to enrich.")
            results = []
            for review_id, comment in reviews:
                total_attempted += 1
                print(f"\nEnriching review: {review_id}")
                try:
                    enrichment = chain.invoke({"review": comment})
                    print(enrichment)
                    results.append((
                            review_id,
                            enrichment["sentiment_label"],
                            enrichment["sentiment_score"],
                            enrichment["topic"],
                            enrichment.get("key_issue"),
                            MODEL,
                        ))
                except Exception as exc:
                    total_failed += 1
                    failed_ids.add(review_id)
                    print(f"Failed review {review_id}: {exc}")
            if results:
                save_results(cursor,results)
                conn.commit()
                total_saved += len(results)
                print(f"\nSaved {len(results)} enriched reviews.")
            else:
                print("\nNo reviews from this batch were successfully enriched.")

        print(
            "\n"
            "=============================\n"
            "Enrichment job complete\n"
            "============================="
        )
        print(f"Attempted : {total_attempted}")
        print(f"Saved     : {total_saved}")
        print(f"Failed    : {total_failed}")
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main()