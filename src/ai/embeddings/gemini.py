from functools import lru_cache
from langchain_google_genai import (GoogleGenerativeAIEmbeddings)
from src.ai.config import (get_env,get_int)


@lru_cache(maxsize=1)
def get_embedding_model():
    return GoogleGenerativeAIEmbeddings(
        model=get_env("EMBEDDING_MODEL","gemini-embedding-001",),
        output_dimensionality=get_int("EMBEDDING_DIMENSION",768),
    )

def get_embedding_version() -> str:
    model = get_env("EMBEDDING_MODEL","gemini-embedding-001")
    dimension = get_int("EMBEDDING_DIMENSION",768)
    return f"{model}:{dimension}"