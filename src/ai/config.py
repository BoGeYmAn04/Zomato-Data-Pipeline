import os
from dotenv import load_dotenv

load_dotenv()

def get_env(name: str,default: str | None = None,required: bool = False) -> str | None:
    value = os.getenv(name, default)
    if required and not value:
        raise RuntimeError(f"Required environment variable '{name}' is missing.")
    return value

def get_int(name: str,default: int) -> int:
    return int(os.getenv(name, str(default)))