import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

def get_llm() -> ChatGoogleGenerativeAI:
    model_name = os.getenv(
        "LLM_MODEL",
        "gemini-3.5-flash-lite",
    )
    return ChatGoogleGenerativeAI(model=model_name,temperature=0,)