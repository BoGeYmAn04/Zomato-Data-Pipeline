from src.ai.config import get_env
from langchain_google_genai import ChatGoogleGenerativeAI
from functools import lru_cache

@lru_cache(maxsize=1)
def get_llm() -> ChatGoogleGenerativeAI:
    model_name = get_env(
        "LLM_MODEL",
        "gemini-3.5-flash-lite",
    )
    return ChatGoogleGenerativeAI(model=model_name,temperature=0)