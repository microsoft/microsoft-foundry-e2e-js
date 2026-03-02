# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""
Task 05a — Create Agent: Define and register the Cora AI agent.

Creates Cora as a Foundry agent with a system prompt defining her persona
and rules, plus function tools for product search and stock checking.

Run:
    python 05a_create_agent.py
"""

import os
from dotenv import load_dotenv
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import PromptAgentDefinition
from azure.identity import DefaultAzureCredential
import importlib.util
import pathlib

_spec = importlib.util.spec_from_file_location("tools_05c", pathlib.Path(__file__).parent / "05c_tools.py")
_tools = importlib.util.module_from_spec(_spec)  # type: ignore[arg-type]
_spec.loader.exec_module(_tools)  # type: ignore[union-attr]
TOOL_DEFINITIONS = _tools.TOOL_DEFINITIONS

load_dotenv()

project_endpoint = os.environ.get("AZURE_AI_PROJECT_ENDPOINT", "<project endpoint>")
deployment_name = os.environ.get("MODEL_DEPLOYMENT_NAME", "<model deployment name>")

CORA_INSTRUCTIONS = """You are Cora, the friendly and knowledgeable AI customer service assistant for Zava DIY, a home improvement retail store.

## Your Role
- Help customers find the right products for their home improvement projects.
- Answer questions about paint, primers, tools, and supplies.
- Provide specific product recommendations with SKU and price.

## Tools Available
- **search_products**: Search the Zava DIY catalog by keyword. Use this when customers ask about products.
- **check_stock**: Check stock availability for a specific SKU. Use this when customers ask about availability.

## Rules
1. ALWAYS use the search_products tool before recommending products.
2. Reference products by name, SKU, and price.
3. If stock is low (< 5 units), warn the customer.
4. Never discuss topics outside home improvement.
5. If you can't help, suggest visiting a Zava DIY store.
6. Keep responses friendly, concise, and under 150 words.

## Response Format
- Start with a direct answer.
- Include specific product recommendations.
- Mention stock availability when relevant.
- End with a helpful tip when appropriate."""


def main() -> None:
    credential = DefaultAzureCredential()
    project = AIProjectClient(endpoint=project_endpoint, credential=credential)

    print("🤖 Creating Cora agent…")
    print(f"   Model: {deployment_name}")
    print(f"   Tools: {', '.join(t['name'] for t in TOOL_DEFINITIONS)}\n")

    # Create the agent with instructions and tools
    agent = project.agents.create_version(
        agent_name="cora-zava-diy",
        definition=PromptAgentDefinition(
            model=deployment_name,
            instructions=CORA_INSTRUCTIONS,
            tools=TOOL_DEFINITIONS,
        ),
    )

    print("✅ Agent created!")
    print(f"   ID:      {agent.id}")
    print(f"   Name:    {agent.name}")
    print(f"   Version: {agent.version}")
    print(f'\n💡 Save the agent name "{agent.name}" — you\'ll need it in 05b_run_agent.py')


if __name__ == "__main__":
    try:
        main()
    except Exception as err:
        print(f"The sample encountered an error: {err}")
