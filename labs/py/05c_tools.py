# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""
Task 05c — Tools: Product search and stock check implementations.

This module provides the tool functions that Cora uses to answer customer
questions. It reads the Zava DIY product catalog from CSV.
"""

import csv
import json
from pathlib import Path
from typing import Any


_products: list[dict] | None = None


def _get_products() -> list[dict]:
    """Load and cache the product catalog."""
    global _products
    if _products is not None:
        return _products

    csv_path = Path(__file__).resolve().parent.parent.parent / "docs" / "data" / "products.csv"
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        _products = [
            {
                "name": row["name"],
                "sku": row["sku"],
                "price": float(row["price"]),
                "description": row["description"],
                "stock_level": int(row["stock_level"]),
                "main_category": row["main_category"],
                "subcategory": row["subcategory"],
            }
            for row in reader
        ]
    return _products


def search_products(query: str) -> str:
    """Search the product catalog by keyword query.
    Returns up to 5 matching products with name, SKU, price, and description.
    """
    products = _get_products()
    terms = query.lower().split()
    scored = []
    for p in products:
        text = f"{p['name']} {p['description']} {p['main_category']} {p['subcategory']}".lower()
        score = sum(1 for t in terms if t in text)
        if score > 0:
            scored.append((p, score))
    scored.sort(key=lambda x: x[1], reverse=True)
    results = [
        f"{p['name']} (SKU: {p['sku']}, ${p['price']:.2f}) — {p['description']} [Stock: {p['stock_level']}]"
        for p, _ in scored[:5]
    ]
    return "\n".join(results) if results else "No products found matching your query."


def check_stock(sku: str) -> str:
    """Check stock level for a specific product SKU."""
    products = _get_products()
    product = next((p for p in products if p["sku"].lower() == sku.lower()), None)
    if not product:
        return f'Product with SKU "{sku}" not found in catalog.'
    if product["stock_level"] == 0:
        status = "OUT OF STOCK"
    elif product["stock_level"] < 5:
        status = "LOW STOCK"
    else:
        status = "IN STOCK"
    return f"{product['name']} (SKU: {product['sku']}) — {status} ({product['stock_level']} units available), ${product['price']:.2f}"


# Tool function definitions for the Foundry Agent Service
TOOL_DEFINITIONS = [
    {
        "type": "function",
        "name": "search_products",
        "description": "Search the Zava DIY product catalog by keyword. Returns matching products with name, SKU, price, and description.",
        "strict": True,
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Search keywords (e.g., 'bathroom paint', 'exterior primer', 'eco-friendly')",
                },
            },
            "required": ["query"],
            "additionalProperties": False,
        },
    },
    {
        "type": "function",
        "name": "check_stock",
        "description": "Check the current stock level for a specific product by SKU number.",
        "strict": True,
        "parameters": {
            "type": "object",
            "properties": {
                "sku": {
                    "type": "string",
                    "description": "The product SKU (e.g., 'PFIP000001')",
                },
            },
            "required": ["sku"],
            "additionalProperties": False,
        },
    },
]


def execute_tool(name: str, args: dict[str, Any]) -> str:
    """Execute a tool call by name and return the result."""
    if name == "search_products":
        return search_products(args["query"])
    elif name == "check_stock":
        return check_stock(args["sku"])
    else:
        return f"Unknown tool: {name}"
