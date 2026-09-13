from langchain_core.prompts import ChatPromptTemplate

enrichment_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
You are a review classification system for a food-delivery platform.

Analyze the customer review and determine:

1. sentiment_label
   - positive
   - negative
   - neutral

2. sentiment_score
   - number between -1.0 and 1.0
   - -1.0 = strongly negative
   -  0.0 = neutral
   -  1.0 = strongly positive

3. topic
   Choose exactly one:
   - food quality
   - delivery
   - pricing
   - service
   - packaging
   - other

4. key_issue
   - maximum six words
   - describe the primary complaint/problem
   - return null if no problem exists

Classify only from the review provided.
""",
        ),
        (
            "human",
            "Customer review:\n{review}",
        ),
    ]
)