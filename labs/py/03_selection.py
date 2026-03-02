# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""
Task 03 — Selection: List deployments and test a model with a Zava DIY prompt.

Lists available model deployments, filters by publisher, and sends a test
product question to gpt-4.1 using the Responses API.

Prerequisites:
    - Deploy gpt-4.1 (or your chosen model) in the Foundry portal first.
    - Set MODEL_DEPLOYMENT_NAME in your .env file.

Run:
    python 03_selection.py
"""

import os
from dotenv import load_dotenv
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

load_dotenv()

project_endpoint = os.environ.get("AZURE_AI_PROJECT_ENDPOINT", "<project endpoint>")
deployment_name = os.environ.get("MODEL_DEPLOYMENT_NAME", "<model deployment name>")


def main() -> None:
    credential = DefaultAzureCredential()
    project = AIProjectClient(endpoint=project_endpoint, credential=credential)

    # 1. List all model deployments
    print("📋 Listing model deployments…")
    deployments = [
        dep for dep in project.deployments.list()
        if dep.type == "ModelDeployment"
        and hasattr(dep, "model_name")
        and hasattr(dep, "model_publisher")
    ]
    for dep in deployments:
        print(f"  • {dep.name}  |  {dep.model_publisher} / {dep.model_name} v{dep.model_version}")
    print(f"  Total: {len(deployments)} deployment(s)\n")

    # 2. Get the OpenAI client for inference
    openai_client = project.get_openai_client()

    # 3. Send a test prompt — a typical Zava DIY customer question
    print(f'🧪 Testing deployment "{deployment_name}" with a product question…\n')
    response = openai_client.responses.create(
        model=deployment_name,
        input="What kind of paint should I use for a bathroom renovation?",
    )
    print("🤖 Model response:")
    print(response.output_text)

    # 4. Test with a follow-up using conversation context
    print("\n💬 Follow-up question (with context)…")
    follow_up = openai_client.responses.create(
        model=deployment_name,
        input="And do I need a primer first?",
        previous_response_id=response.id,
    )
    print("🤖 Follow-up response:")
    print(follow_up.output_text)

    print("\n✅ Model selection verified — inference is working!")


if __name__ == "__main__":
    try:
        main()
    except Exception as err:
        print(f"The sample encountered an error: {err}")
