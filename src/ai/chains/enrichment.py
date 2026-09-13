from src.ai.llm.gemini import get_llm
from src.ai.prompts.enrichment import enrichment_prompt
from src.ai.schemas.enrichment import ReviewEnrichment


def get_enrichment_chain():
    llm = get_llm()

    structured_llm = llm.with_structured_output(
        schema=ReviewEnrichment.model_json_schema(),
        method="json_schema",
    )

    return enrichment_prompt | structured_llm