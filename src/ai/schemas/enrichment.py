from typing import Literal
from pydantic import BaseModel, Field


class ReviewEnrichment(BaseModel):
    sentiment_label: Literal["positive","negative","neutral"]
    sentiment_score: float = Field(ge=-1.0,le=1.0)
    topic: Literal["food quality","delivery","pricing","service","packaging","other"]
    key_issue: str | None = Field(default=None,description=("Main issue in six words or fewer. Null when there is no issue."))


