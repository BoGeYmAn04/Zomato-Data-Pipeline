from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.ai.config import get_env
from src.ai.api.routes.rag import router as rag_router
from src.ai.api.routes.text_to_sql import router as text_to_sql_router


app=FastAPI(title="Zomato AI API",version="1.0.0")
frontend_origin=get_env("FRONTEND_ORIGIN","http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
app.include_router(rag_router)
app.include_router(text_to_sql_router)

@app.get("/health")
def health():
    return {"status":"ok"}