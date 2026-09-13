from langchain_core.documents import Document
from src.ai.config import get_int
from src.ai.db.snowflake import get_reviews_to_index, save_rag_index_state
from src.ai.embeddings.gemini import get_embedding_version
from src.ai.vectorstores.chroma import get_collection_name, upsert_documents

def build_document(row: dict) -> Document:
    return Document(
        page_content=row["comment"].strip(),
        metadata={
            "review_id": str(row["review_id"]),
            "city": row.get("city"),
            "rating": row.get("rating"),
            "sentiment_label": row.get("sentiment_label"),
            "sentiment_score": row.get("sentiment_score"),
            "topic": row.get("topic"),
            "key_issue": row.get("key_issue"),
        },
    )

def main():
    batch_size = get_int("RAG_INDEX_BATCH_SIZE", 20)
    max_per_run = get_int("RAG_MAX_PER_RUN", 20)
    index_version = f"{get_collection_name()}:{get_embedding_version()}"
    total_indexed = 0

    print(f"Index version: {index_version}")
    print(f"Maximum reviews this run: {'unlimited' if max_per_run == 0 else max_per_run}")

    while max_per_run == 0 or total_indexed < max_per_run:
        current_batch_size = batch_size if max_per_run == 0 else min(batch_size, max_per_run - total_indexed)
        rows = get_reviews_to_index(index_version=index_version, batch_size=current_batch_size)
        if not rows:
            print("\nNo reviews left to index.")
            break

        print(f"\nIndexing batch of {len(rows)} reviews...")
        upsert_documents([build_document(row) for row in rows])
        save_rag_index_state([
            (str(row["review_id"]), row["content_hash"], index_version)
            for row in rows
        ])
        total_indexed += len(rows)
        print(f"Indexed {len(rows)} reviews.")
        print(f"Total indexed this run: {total_indexed}")

    if max_per_run > 0 and total_indexed >= max_per_run:
        print(f"\nReached maximum of {max_per_run} reviews.")
    print(f"\nRAG indexing complete.\nTotal indexed: {total_indexed}")


if __name__ == "__main__":
    main()

    