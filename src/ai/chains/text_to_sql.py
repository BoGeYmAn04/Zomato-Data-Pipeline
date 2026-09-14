from functools import lru_cache
from src.ai.llm.gemini import get_llm
from src.ai.prompts.text_to_sql import SQL_GENERATION_PROMPT,SQL_REPAIR_PROMPT
from src.ai.schemas.text_to_sql import SQLGeneration

def _structured_llm():
    return get_llm().with_structured_output(schema=SQLGeneration.model_json_schema(),method="json_schema")

@lru_cache(maxsize=1)
def get_sql_generation_chain():
    return SQL_GENERATION_PROMPT|_structured_llm()

@lru_cache(maxsize=1)
def get_sql_repair_chain():
    return SQL_REPAIR_PROMPT|_structured_llm()