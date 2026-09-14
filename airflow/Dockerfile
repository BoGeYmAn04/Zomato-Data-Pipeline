# Airflow 3 + Snowflake + Gemini/LangChain + Chroma + dbt

FROM apache/airflow:3.0.3
# ------------------------------------------------------
# Airflow providers + AI runtime
# ------------------------------------------------------
RUN pip install --no-cache-dir \
    apache-airflow-providers-snowflake \
    apache-airflow-providers-fab \
    apache-airflow-providers-standard \
    langchain \
    langchain-core \
    langchain-google-genai \
    langchain-chroma \
    chromadb \
    pydantic \
    python-dotenv
# ------------------------------------------------------
# dbt isolated environment
# ------------------------------------------------------
RUN python -m venv /opt/airflow/dbt_venv && \
    /opt/airflow/dbt_venv/bin/pip install \
        --no-cache-dir \
        "dbt-snowflake==1.8.*"