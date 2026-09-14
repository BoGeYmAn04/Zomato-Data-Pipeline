import sqlglot
from sqlglot import expressions as exp
from src.ai.config import get_env


class SQLValidationError(ValueError):
    pass
FORBIDDEN_EXPRESSION_NAMES = {
    "INSERT",
    "UPDATE",
    "DELETE",
    "MERGE",
    "CREATE",
    "DROP",
    "ALTER",
    "COMMAND",
    "COPY",
    "GRANT",
    "REVOKE",
    "TRANSACTION",
    "SET",
    "USE",
    "CALL",
    "PUT",
    "GET",
}

def validate_sql(sql: str) -> list[str]:
    if not sql:
        raise SQLValidationError("SQL query is empty.")
    try:
        statements = sqlglot.parse(sql, read="snowflake")
    except Exception as exc:
        raise SQLValidationError(f"SQL could not be parsed: {exc}") from exc
    if len(statements) != 1:
        raise SQLValidationError("Only one SQL statement is allowed.")
    tree = statements[0]
    if tree.find(exp.Select) is None:
        raise SQLValidationError("Only SELECT queries are allowed.")
    for node in tree.walk():
        node_name = type(node).__name__.upper()
        if node_name in FORBIDDEN_EXPRESSION_NAMES:
            raise SQLValidationError(f"Forbidden SQL operation: {node_name}")
    allowed_database = get_env("SQL_ALLOWED_DATABASE", "ZOMATO").upper()
    allowed_schema = get_env("SQL_ALLOWED_SCHEMA", "MARTS").upper()
    cte_names = {cte.alias_or_name.upper() for cte in tree.find_all(exp.CTE)}
    tables_used = set()
    for table in tree.find_all(exp.Table):
        table_name = (table.name or "").upper()
        database = (table.catalog or "").upper()
        schema = (table.db or "").upper()

        # CTE references are not physical tables.
        if not database and not schema and table_name in cte_names:
            continue
        if not database or not schema:
            raise SQLValidationError("Every physical table must be fully qualified as DATABASE.SCHEMA.TABLE.")
        if database != allowed_database:
            raise SQLValidationError(f"Database '{database}' is not allowed.")
        if schema != allowed_schema:
            raise SQLValidationError(f"Schema '{schema}' is not allowed.")
        tables_used.add(f"{database}.{schema}.{table_name}")
    if not tables_used:
        raise SQLValidationError("The query must reference at least one allowed MARTS table.")
    return sorted(tables_used)