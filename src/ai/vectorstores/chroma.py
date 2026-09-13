from functools import lru_cache
import chromadb
from langchain_chroma import Chroma
from langchain_core.documents import Document
from src.ai.config import get_env
from src.ai.embeddings.gemini import (get_embedding_model)

@lru_cache(maxsize=1)
def get_chroma_client():
    api_key = get_env("CHROMA_API_KEY", required=True)
    tenant = get_env("CHROMA_TENANT", required=True)
    database = get_env("CHROMA_DATABASE", required=True)
    return chromadb.CloudClient(api_key=api_key, tenant=tenant, database=database)

def get_collection_name() -> str:
    return get_env("CHROMA_COLLECTION","zomato_reviews_v1")

@lru_cache(maxsize=1)
def get_chroma_collection():
    client = get_chroma_client()
    return client.get_or_create_collection(
        name=get_collection_name(),
        configuration={
            "hnsw": {
                "space": "cosine"
            }
        },
    )

@lru_cache(maxsize=1)
def get_vector_store():
    client = get_chroma_client()
    get_chroma_collection()
    return Chroma(
        client=client,
        collection_name=get_collection_name(),
        embedding_function=get_embedding_model(),
    )

def _clean_metadata(metadata: dict) -> dict:
    clean = {}
    for key, value in metadata.items():
        if value is None:
            continue
        # Snowflake sometimes returns Decimal values.
        if hasattr(value, "as_integer_ratio"):
            try:
                value = float(value)
            except Exception:
                pass
        if not isinstance(
            value,
            (str, int, float, bool),
        ):
            value = str(value)
        clean[key] = value
    return clean

def upsert_documents(documents: list[Document]) -> None:
    if not documents:
        return
    ids = []
    texts = []
    metadatas = []
    for document in documents:
        review_id = str(document.metadata["review_id"])
        ids.append(review_id)
        texts.append(document.page_content)
        metadatas.append(_clean_metadata(document.metadata))

    embedding_model = get_embedding_model()
    embeddings = embedding_model.embed_documents(texts)
    collection = get_chroma_collection()
    collection.upsert(
        ids=ids,
        documents=texts,
        metadatas=metadatas,
        embeddings=embeddings,
    )