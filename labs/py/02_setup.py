# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""
Task 02 — Setup: Verify your Foundry project connection.

Creates an AIProjectClient, lists all project connections and model
deployments, and confirms that your environment is ready for the quest.

Before running:
    cp sample.env .env   # then fill in your values
    python 02_setup.py
"""

import os
from dotenv import load_dotenv
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

load_dotenv()

project_endpoint = os.environ.get("AZURE_AI_PROJECT_ENDPOINT", "<project endpoint>")


def main() -> None:
    # 1. Create the AI Project client using Entra ID auth
    print("🔐 Connecting to Microsoft Foundry…")
    credential = DefaultAzureCredential()
    project = AIProjectClient(endpoint=project_endpoint, credential=credential)

    # 2. List all connections in the project
    print("\n📡 Project connections:")
    connections = list(project.connections.list())
    for conn in connections:
        print(f"  • {conn.name}  ({conn.type})")
    print(f"  Total: {len(connections)} connection(s)")

    # 3. List model deployments
    print("\n🚀 Model deployments:")
    deployments = [
        dep for dep in project.deployments.list()
        if dep.type == "ModelDeployment"
        and hasattr(dep, "model_name")
        and hasattr(dep, "model_publisher")
    ]
    for dep in deployments:
        print(f"  • {dep.name}  ({dep.model_publisher} / {dep.model_name})")
    print(f"  Total: {len(deployments)} deployment(s)")

    # 4. Quick smoke test
    if connections or deployments:
        print("\n✅ Foundry project is reachable and responding.")
    else:
        print("\n⚠️  No connections or deployments found — verify your project endpoint and permissions.")

    print("\n🎉 Setup verified — you're ready for Quest 2!")


if __name__ == "__main__":
    try:
        main()
    except Exception as err:
        print(f"The sample encountered an error: {err}")
