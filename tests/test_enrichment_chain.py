from src.ai.chains.enrichment import get_enrichment_chain

def test_enrichment_chain():
    chain = get_enrichment_chain()
    result = chain.invoke({"review": ("The biryani was delicious but the delivery arrived 45 minutes late.")})
    print(result)
    assert result is not None
    assert "sentiment_label" in result
    assert "sentiment_score" in result
    assert "topic" in result