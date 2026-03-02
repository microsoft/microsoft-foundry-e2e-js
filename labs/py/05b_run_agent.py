# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""
Task 05b — Run Agent: Send customer questions to Cora and handle tool calls.

Creates a conversation, sends customer questions to the Cora agent, handles
function tool calls (product search, stock check), and displays responses.

Prerequisites:
    - Run 05a_create_agent.py first to create the Cora agent.

Run:
    python 05b_run_agent.py
"""

import json
import os
from dotenv import load_dotenv
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential
import importlib.util
import pathlib

_spec = importlib.util.spec_from_file_location("tools_05c", pathlib.Path(__file__).parent / "05c_tools.py")
_tools = importlib.util.module_from_spec(_spec)  # type: ignore[arg-type]
_spec.loader.exec_module(_tools)  # type: ignore[union-attr]
execute_tool = _tools.execute_tool

load_dotenv()

project_endpoint = os.environ.get("AZURE_AI_PROJECT_ENDPOINT", "<project endpoint>")
AGENT_NAME = "cora-zava-diy"

CUSTOMER_QUESTIONS = [
    "What paint should I use for my bathroom?",
    "Is the Interior Semi-Gloss Paint in stock?",
    "I need something eco-friendly for my baby's nursery.",
]


def main() -> None:
    credential = DefaultAzureCredential()
    project = AIProjectClient(endpoint=project_endpoint, credential=credential)
    openai_client = project.get_openai_client()

    print("💬 Running Cora agent conversations…\n")

    for question in CUSTOMER_QUESTIONS:
        print(f'👤 Customer: "{question}"')

        # Create a conversation with the customer's message
        conversation = openai_client.conversations.create(
            items=[{"type": "message", "role": "user", "content": question}],
        )

        # Generate a response using the Cora agent
        response = openai_client.responses.create(
            conversation=conversation.id,
            extra_body={"agent": {"name": AGENT_NAME, "type": "agent_reference"}},
            input="",
        )

        # Handle tool calls — the agent may request function calls
        iterations = 0
        while iterations < 5:
            function_calls = [item for item in response.output if item.type == "function_call"]
            if not function_calls:
                break

            tool_results = []
            for call in function_calls:
                args = json.loads(call.arguments)
                print(f"   🔧 Tool call: {call.name}({json.dumps(args)})")

                result = execute_tool(call.name, args)
                print(f"   📋 Result: {result[:100]}…")

                tool_results.append({
                    "type": "function_call_output",
                    "call_id": call.call_id,
                    "output": result,
                })

            # Submit tool results back to the agent
            response = openai_client.responses.create(
                input=tool_results,
                previous_response_id=response.id,
                extra_body={"agent": {"name": AGENT_NAME, "type": "agent_reference"}},
            )
            iterations += 1

        print(f"🤖 Cora: {response.output_text}")
        print("─" * 60)

        # Clean up conversation
        openai_client.conversations.delete(conversation_id=conversation.id)

    print("\n✅ Agent conversations complete!")
    print("💡 Notice how Cora uses tools to search products and check stock before responding.")


if __name__ == "__main__":
    try:
        main()
    except Exception as err:
        print(f"The sample encountered an error: {err}")
