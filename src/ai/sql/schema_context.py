import re
from functools import lru_cache
from src.ai.config import get_env
from src.ai.db.snowflake import get_text_to_sql_connection

IDENTIFIER_PATTERN = re.compile(r"^[A-Za-z_][A-Za-z0-9_$]*$")

def _safe_identifier(value: str) -> str:
    if not IDENTIFIER_PATTERN.fullmatch(value):
        raise ValueError(f"Invalid Snowflake identifier: {value}")
    return value.upper()


@lru_cache(maxsize=1)
def get_schema_context() -> str:
    database = _safe_identifier(get_env("SQL_ALLOWED_DATABASE", "ZOMATO"))
    schema = _safe_identifier(get_env("SQL_ALLOWED_SCHEMA", "MARTS"))
    conn = get_text_to_sql_connection()
    cursor = conn.cursor()
    try:
        query = f"""SELECT
            c.TABLE_NAME, t.TABLE_TYPE, c.COLUMN_NAME, c.DATA_TYPE,
            c.ORDINAL_POSITION, c.COMMENT
        FROM {database}.INFORMATION_SCHEMA.COLUMNS c
        JOIN {database}.INFORMATION_SCHEMA.TABLES t
          ON c.TABLE_SCHEMA = t.TABLE_SCHEMA AND c.TABLE_NAME = t.TABLE_NAME
        WHERE c.TABLE_SCHEMA = %s
        ORDER BY c.TABLE_NAME, c.ORDINAL_POSITION"""
        cursor.execute(query, (schema,))
        rows = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

    if not rows:
        raise RuntimeError(f"No tables found in {database}.{schema}")

    tables = {}
    for table_name, table_type, column_name, data_type, _, comment in rows:
        if table_name not in tables:
            tables[table_name] = {"type": table_type, "columns": []}
        description = f"- {column_name} {data_type}"
        if comment:
            description += f" -- {comment}"
        tables[table_name]["columns"].append(description)

    sections = []
    for table_name, table_data in tables.items():
        full_name = f"{database}.{schema}.{table_name}"
        sections.append(
            f"TABLE: {full_name}\nTYPE: {table_data['type']}\n\n"
            f"COLUMNS:\n{chr(10).join(table_data['columns'])}"
        )
    return "\n\n".join(sections)


def refresh_schema_context():
    get_schema_context.cache_clear()