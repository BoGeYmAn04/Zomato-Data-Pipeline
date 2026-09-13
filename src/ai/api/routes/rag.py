from fastapi import APIRouter, HTTPException
from src.ai.schemas.api_schema import RagChatRequest, RagChatResponse
from src.ai.services.rag_service import ask_reviews

router = APIRouter(prefix="/api/rag", tags=["RAG"])

@router.post("/chat", response_model=RagChatResponse)
def rag_chat(request: RagChatRequest):
    try:
        return ask_reviews(question=request.question, top_k=request.top_k)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc