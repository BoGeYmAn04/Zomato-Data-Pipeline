from pydantic import BaseModel, Field

class RagChatRequest(BaseModel):
    question: str = Field(min_length=2, max_length=1000)
    top_k: int | None = Field(default=None, ge=1, le=20)

class RagSource(BaseModel):
    label: str
    review_id: str | None = None
    city: str | None = None
    rating: float | None = None
    sentiment_label: str | None = None
    topic: str | None = None
    key_issue: str | None = None
    comment: str

class RagChatResponse(BaseModel):
    answer: str
    sources: list[RagSource]