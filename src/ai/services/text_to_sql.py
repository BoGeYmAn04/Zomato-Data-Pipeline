import json
from snowflake.connector.errors import Error as SnowflakeError
from src.ai.config import get_int
from src.ai.chains.text_to_sql import get_sql_generation_chain,get_sql_repair_chain
from src.ai.chains.sql_answer import get_sql_answer_chain
from src.ai.db.snowflake import execute_text_to_sql_query
from src.ai.sql.schema_context import get_schema_context
from src.ai.sql.relationships import get_relationship_context
from src.ai.sql.validator import SQLValidationError,validate_sql

def _clean_sql(sql:str|None)->str:
    if not sql:
        return ""
    sql=sql.strip()
    if sql.startswith("```sql"):
        sql=sql[6:]
    elif sql.startswith("```"):
        sql=sql[3:]
    if sql.endswith("```"):
        sql=sql[:-3]
    return sql.strip().rstrip(";").strip()

def run_text_to_sql(question:str):
    question=question.strip()
    if not question:
        raise ValueError("Question cannot be empty.")
    schema_context=get_schema_context()
    relationship_context=get_relationship_context()
    generation=get_sql_generation_chain().invoke({"question":question,
                                                  "schema_context":schema_context,
                                                  "relationship_context":relationship_context})
    if not generation.get("can_answer",False):
        return {"question":question,"answer":generation.get("reason") or "The available MARTS schema cannot answer this question.","sql":None,"explanation":generation.get("explanation"),"columns":[],"rows":[],"tables_used":[],"repaired":False,"truncated":False}
    sql=_clean_sql(generation.get("sql"))
    max_retries=get_int("SQL_MAX_RETRIES",1)
    repaired=False
    tables_used=[]
    result=None
    for attempt in range(max_retries+1):
        try:
            tables_used=validate_sql(sql)
            result=execute_text_to_sql_query(sql)
            break
        except (SQLValidationError,SnowflakeError) as exc:
            if attempt >= max_retries:
                raise RuntimeError("Unable to generate a valid SQL query after repair.") from exc
            repaired_generation=get_sql_repair_chain().invoke({"question":question,
                                                               "schema_context":schema_context,
                                                               "relationship_context":relationship_context,
                                                               "failed_sql":sql,
                                                               "error":str(exc)[:2000]})
            if not repaired_generation.get("can_answer",False):
                raise RuntimeError(repaired_generation.get("reason") or "The SQL could not be safely repaired.")
            sql=_clean_sql(repaired_generation.get("sql"))
            generation=repaired_generation
            repaired=True
    if result is None:
        raise RuntimeError("SQL execution failed.")
    rows=result["rows"][:get_int("SQL_SUMMARY_MAX_ROWS",50)]
    answer=get_sql_answer_chain().invoke({"question":question,
                                          "sql":sql,
                                          "columns":json.dumps(result["columns"],default=str),
                                          "rows":json.dumps(rows,default=str),
                                          "truncated":result["truncated"]})
    return {"question":question,
            "answer":answer,
            "sql":sql,
            "explanation":generation.get("explanation"),
            "columns":result["columns"],
            "rows":result["rows"],
            "tables_used":tables_used,
            "repaired":repaired,
            "truncated":result["truncated"]
        }