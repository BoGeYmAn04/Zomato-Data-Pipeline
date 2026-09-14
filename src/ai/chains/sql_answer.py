from functools import lru_cache
from langchain_core.output_parsers import StrOutputParser
from src.ai.llm.gemini import get_llm
from src.ai.prompts.text_to_sql import SQL_ANSWER_PROMPT


@lru_cache(maxsize=1)
def get_sql_answer_chain():
    return SQL_ANSWER_PROMPT | get_llm() | StrOutputParser()