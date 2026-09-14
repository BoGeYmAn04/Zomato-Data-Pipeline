import os
import snowflake.connector
from src.ai.config import get_env,get_int
from decimal import Decimal
from datetime import date, datetime

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

def get_text_to_sql_connection():
    return snowflake.connector.connect(
        account=get_env("SNOWFLAKE_ACCOUNT", required=True),
        user=get_env("SNOWFLAKE_USER", required=True),
        password=get_env("SNOWFLAKE_PASSWORD", required=True),
        warehouse=get_env("SNOWFLAKE_WAREHOUSE", "ZOMATO_WH"),
        database=get_env("SQL_ALLOWED_DATABASE", "ZOMATO"),
        schema=get_env("SQL_ALLOWED_SCHEMA", "MARTS"),
        role=get_env("SNOWFLAKE_SQL_ROLE", "TEXT_TO_SQL_ROLE"),
        session_parameters={
            "QUERY_TAG": "zomato_text_to_sql",
            "STATEMENT_TIMEOUT_IN_SECONDS": get_int("SQL_STATEMENT_TIMEOUT_SECONDS", 30),
        },
    )

def _json_safe_value(value):
    if value is None:
        return None
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    return value

def execute_text_to_sql_query(sql: str):
    max_rows = get_int("SQL_MAX_RESULT_ROWS", 200)
    conn = get_text_to_sql_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(sql)
        if cursor.description is None:
            return {"columns": [], "rows": [], "truncated": False}
        columns = [column[0] for column in cursor.description]
        fetched_rows = cursor.fetchmany(max_rows + 1)
        truncated = len(fetched_rows) > max_rows
        rows = [[_json_safe_value(value) for value in row]
                for row in fetched_rows[:max_rows]]
        return {"columns": columns, "rows": rows, "truncated": truncated}
    finally:
        cursor.close()
        conn.close()