from fastapi import APIRouter, HTTPException
from src.ai.schemas.api_schema import TextToSQLRequest,TextToSQLResponse
from src.ai.services.text_to_sql import run_text_to_sql

router = APIRouter(prefix="/api/sql", tags=["Text to SQL"])

@router.post("/query", response_model=TextToSQLResponse)
def text_to_sql_query(request: TextToSQLRequest):
    try:
        return run_text_to_sql(request.question)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc