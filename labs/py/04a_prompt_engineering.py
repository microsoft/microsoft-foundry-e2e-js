# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""
Task 04a — Prompt Engineering: Craft and test Cora's system prompt.

Defines Cora's personality, rules, and response format via a system prompt,
then tests it with Zava DIY customer questions.

Run:
    python 04a_prompt_engineering.py
"""

import os
from dotenv import load_dotenv
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

load_dotenv()

project_endpoint = os.environ.get("AZURE_AI_PROJECT_ENDPOINT", "<project endpoint>")
deployment_name = os.environ.get("MODEL_DEPLOYMENT_NAME", "<model deployment name>")

# Cora's system prompt — this is where the magic happens
CORA_SYSTEM_PROMPT = """You are Cora, the friendly and knowledgeable AI customer service assistant for Zava DIY, a home improvement retail store.

## Your Role
- Help customers find the right products for their projects.
- Answer questions about paint, primers, and home improvement supplies.
- Always be polite, encouraging, and concise.

## Rules
1. Always reference specific products by name, SKU, and price when available.
2. If you don't know the answer, say so honestly and suggest visiting the store.
3. Never provide advice on topics outside home improvement.
4. If a customer seems frustrated, acknowledge their concern and offer to help.
5. Keep responses under 150 words unless the customer asks for detailed information.

## Response Format
- Start with a direct answer to the question.
- Include specific product recommendations with SKU and price.
- End with a helpful tip or next step when appropriate."""

TEST_QUESTIONS = [
    "What paint should I use for my bathroom?",
    "Do you have anything eco-friendly?",
    "How much would it cost to paint a 12x12 room?",
    "Can you help me pick a color for my living room?",
]


def main() -> None:
    credential = DefaultAzureCredential()
    project = AIProjectClient(endpoint=project_endpoint, credential=credential)
    openai_client = project.get_openai_client()

    print("🎨 Testing Cora's system prompt with gpt-4.1…\n")
    print("System prompt:")
    print("─" * 60)
    print(CORA_SYSTEM_PROMPT)
    print("─" * 60)

    for question in TEST_QUESTIONS:
        print(f'\n👤 Customer: "{question}"')

        response = openai_client.responses.create(
            model=deployment_name,
            instructions=CORA_SYSTEM_PROMPT,
            input=question,
        )

        print(f"🤖 Cora: {response.output_text}")
        print("─" * 60)

    print("\n✅ Prompt engineering complete!")
    print("💡 Notice: Cora responds in character but doesn't know specific Zava products yet.")
    print("   Next, we'll add product context (04b) and fine-tune the model (04c).")


if __name__ == "__main__":
    try:
        main()
    except Exception as err:
        print(f"The sample encountered an error: {err}")
