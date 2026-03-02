# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""
Task 04b — Context Engineering: Ground Cora's responses in real product data.

Loads the Zava DIY product catalog (products.csv), builds context from
relevant products, and injects it into the prompt so Cora can recommend
specific products with accurate SKUs and prices.

Run:
    python 04b_context_engineering.py
"""

import csv
import os
from pathlib import Path
from dotenv import load_dotenv
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

load_dotenv()

project_endpoint = os.environ.get("AZURE_AI_PROJECT_ENDPOINT", "<project endpoint>")
deployment_name = os.environ.get("MODEL_DEPLOYMENT_NAME", "<model deployment name>")


def load_products(csv_path: str) -> list[dict]:
    """Load products from CSV file."""
    products = []
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            products.append({
                "name": row["name"],
                "sku": row["sku"],
                "price": float(row["price"]),
                "description": row["description"],
                "stock_level": int(row["stock_level"]),
                "main_category": row["main_category"],
                "subcategory": row["subcategory"],
            })
    return products


def search_products(products: list[dict], query: str) -> list[dict]:
    """Simple keyword search to find relevant products."""
    terms = query.lower().split()
    scored = []
    for p in products:
        text = f"{p['name']} {p['description']} {p['main_category']} {p['subcategory']}".lower()
        score = sum(1 for t in terms if t in text)
        if score > 0:
            scored.append((p, score))
    scored.sort(key=lambda x: x[1], reverse=True)
    return [p for p, _ in scored[:5]]


def format_product_context(products: list[dict]) -> str:
    """Format products as context for the prompt."""
    if not products:
        return "No matching products found in catalog."
    return "\n".join(
        f"• {p['name']} (SKU: {p['sku']}, ${p['price']:.2f}) — {p['description']} [Stock: {p['stock_level']}]"
        for p in products
    )


CORA_SYSTEM_PROMPT = """You are Cora, the friendly AI assistant for Zava DIY home improvement store.
Help customers find the right products. Always reference specific products by name, SKU, and price.
Be polite, concise, and helpful. Keep responses under 150 words."""

TEST_QUESTIONS = [
    "What paint should I use for my bathroom?",
    "I need something eco-friendly for my baby's room",
    "What's the cheapest option for painting my ceiling?",
]


def main() -> None:
    # Load the product catalog
    catalog_path = Path(__file__).resolve().parent.parent.parent / "docs" / "data" / "products.csv"
    print(f"📦 Loading product catalog from {catalog_path}…")
    products = load_products(str(catalog_path))
    print(f"   Loaded {len(products)} products.\n")

    credential = DefaultAzureCredential()
    project = AIProjectClient(endpoint=project_endpoint, credential=credential)
    openai_client = project.get_openai_client()

    for question in TEST_QUESTIONS:
        print(f'👤 Customer: "{question}"')

        # Search for relevant products
        relevant = search_products(products, question)
        context = format_product_context(relevant)
        print(f"   📋 Found {len(relevant)} relevant product(s)")

        # Build context-enriched prompt
        context_prompt = f"""{CORA_SYSTEM_PROMPT}

## Available Products (from Zava DIY catalog)
{context}

Use ONLY the products listed above to make recommendations. Include SKU and price."""

        response = openai_client.responses.create(
            model=deployment_name,
            instructions=context_prompt,
            input=question,
        )

        print(f"🤖 Cora: {response.output_text}")
        print("─" * 60)

    print("\n✅ Context engineering complete!")
    print("💡 Notice: Cora now references specific Zava DIY products with SKUs and prices.")
    print("   Next, we'll fine-tune gpt-4.1-mini to bake this knowledge in (04c).")


if __name__ == "__main__":
    try:
        main()
    except Exception as err:
        print(f"The sample encountered an error: {err}")
