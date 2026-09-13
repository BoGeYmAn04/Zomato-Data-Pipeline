import os
import snowflake.connector
from src.ai.config import get_env

def get_connection():
    return snowflake.connector.connect(
        account=get_env("SNOWFLAKE_ACCOUNT",required=True,),
        user=get_env("SNOWFLAKE_USER",required=True,),
        password=get_env("SNOWFLAKE_PASSWORD",required=True,),
        warehouse=get_env("SNOWFLAKE_WAREHOUSE",required=True,),
        database=get_env("SNOWFLAKE_DATABASE","ZOMATO",),
        role=get_env("SNOWFLAKE_ROLE","DBT_ROLE",),
    )


def get_reviews_to_index(index_version: str,batch_size: int):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        query = f"""
        WITH prepared AS
        (
            SELECT
                r.REVIEW_ID,
                r.CITY,
                r.RATING,
                r.COMMENT,
                e.SENTIMENT_LABEL,
                e.SENTIMENT_SCORE,
                e.TOPIC,
                e.KEY_ISSUE,
                MD5(CONCAT_WS('|',COALESCE(r.COMMENT,''),COALESCE(r.CITY,''),COALESCE(TO_VARCHAR(r.RATING),''),COALESCE(e.SENTIMENT_LABEL,''),COALESCE(e.TOPIC,''),COALESCE(e.KEY_ISSUE,''))) AS CONTENT_HASH
            FROM ZOMATO.STAGING.STG_REVIEWS r
            INNER JOIN ZOMATO.AI.REVIEW_ENRICHED e
            ON r.REVIEW_ID = e.REVIEW_ID
            WHERE r.COMMENT IS NOT NULL AND TRIM(r.COMMENT) <> ''
        )

        SELECT
            p.*
        FROM prepared p
        LEFT JOIN ZOMATO.AI.RAG_INDEX_STATE s
        ON p.REVIEW_ID = s.REVIEW_ID
        WHERE
            s.REVIEW_ID IS NULL
            OR s.CONTENT_HASH <> p.CONTENT_HASH
            OR s.INDEX_VERSION <> %s
        ORDER BY p.REVIEW_ID
        LIMIT {int(batch_size)}
        """
        cursor.execute(query,(index_version))
        column_names = [column[0].lower() for column in cursor.description]
        rows = []
        for row in cursor.fetchall():
            rows.append(dict(zip(column_names,row)))
        return rows
    finally:
        cursor.close()
        conn.close()

def save_rag_index_state(states: list[tuple[str, str, str]],):
    if not states:
        return
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            CREATE OR REPLACE TEMP TABLE
            ZOMATO.AI.TMP_RAG_INDEX_STATE
            (
                REVIEW_ID STRING,
                CONTENT_HASH STRING,
                INDEX_VERSION STRING
            )
        """)
        cursor.executemany(
            """
            INSERT INTO ZOMATO.AI.TMP_RAG_INDEX_STATE
            (
                REVIEW_ID,
                CONTENT_HASH,
                INDEX_VERSION
            )
            VALUES (%s, %s, %s)
            """,
            states,
        )
        cursor.execute("""
            MERGE INTO ZOMATO.AI.RAG_INDEX_STATE target
            USING ZOMATO.AI.TMP_RAG_INDEX_STATE source
            ON target.REVIEW_ID = source.REVIEW_ID

            WHEN MATCHED THEN
                UPDATE SET
                    target.CONTENT_HASH = source.CONTENT_HASH,
                    target.INDEX_VERSION = source.INDEX_VERSION,
                    target.INDEXED_AT = CURRENT_TIMESTAMP()

            WHEN NOT MATCHED THEN
                INSERT
                (
                    REVIEW_ID,
                    CONTENT_HASH,
                    INDEX_VERSION,
                    INDEXED_AT
                )
                VALUES
                (
                    source.REVIEW_ID,
                    source.CONTENT_HASH,
                    source.INDEX_VERSION,
                    CURRENT_TIMESTAMP()
                )
        """)
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()