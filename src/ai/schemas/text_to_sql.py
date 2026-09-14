from pydantic import BaseModel, Field

class SQLGeneration(BaseModel):
    can_answer: bool = Field(description="Whether the question can be answered using the provided database schema.")
    sql: str | None = Field(default=None, description="One read-only Snowflake SQL query.")
    explanation: str = Field(description="Short explanation of what the query does.")
    tables_used: list[str] = Field(default_factory=list, description="Fully-qualified database tables used.")
    reason: str | None = Field(default=None, description="Why the question cannot be answered when can_answer is false.")