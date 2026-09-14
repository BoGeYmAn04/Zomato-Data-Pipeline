RELATIONSHIPS = """
Use relationships only when the involved key columns
actually exist in the supplied schema.
Prefer joins using matching business keys such as:

ORDER_ID
USER_ID
RESTAURANT_ID
FOOD_ID

Do not invent relationships between tables.

If a join cannot be supported by the schema,
do not generate that join.
"""


def get_relationship_context() -> str:

    return RELATIONSHIPS.strip()