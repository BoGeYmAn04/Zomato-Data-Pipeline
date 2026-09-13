from src.ai.config import get_int
from src.ai.chains.rag import get_rag_chain
from src.ai.vectorstores.chroma import get_vector_store

def _format_context(results) -> str:
    sections = []
    for index, (document, score) in enumerate(results,start=1,):
        metadata = document.metadata
        sections.append(f""" 
        [R{index}]
        Review ID:{metadata.get("review_id", "unknown")}
        City:{metadata.get("city", "unknown")}
        Rating:{metadata.get("rating", "unknown")}
        Sentiment:{metadata.get("sentiment_label", "unknown")}
        Topic:{metadata.get("topic", "unknown")}
        Key Issue:{metadata.get("key_issue", "none")}
        Review:{document.page_content}
        """.strip())
    return "\n\n".join(sections)

def ask_reviews(question: str,top_k: int | None = None,):
    if not question.strip():
        raise ValueError("Question cannot be empty.")
    if top_k is None:
        top_k = get_int("RAG_TOP_K",6)
    vector_store = get_vector_store()
    results = (vector_store.similarity_search_with_score(query=question,k=top_k,))
    if not results:
        return {
            "answer": (
                "I could not find any relevant "
                "reviews for that question."
            ),
            "sources": [],
        }
    context = _format_context(results)
    chain = get_rag_chain()
    answer = chain.invoke({"question": question,"context": context})
    sources = []
    for index, (document, score) in enumerate(results,start=1,):
        metadata = document.metadata
        sources.append(
            {
                "label": f"R{index}",
                "review_id": metadata.get("review_id"),
                "city": metadata.get("city"),
                "rating": metadata.get("rating"),
                "sentiment_label": metadata.get("sentiment_label"),
                "topic": metadata.get("topic"),
                "key_issue": metadata.get("key_issue"),
                "comment": document.page_content,
            }
        )
    return {
        "answer": answer,
        "sources": sources,
    }