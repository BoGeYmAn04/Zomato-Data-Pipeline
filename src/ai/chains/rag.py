from functools import lru_cache
from langchain_core.output_parsers import StrOutputParser
from src.ai.llm.gemini import get_llm
from src.ai.prompts.rag import RAG_PROMPT

@lru_cache(maxsize=1)
def get_rag_chain():
    return (RAG_PROMPT | get_llm() | StrOutputParser())