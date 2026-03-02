# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""
Task 09 — Teardown: Clean up all resources created during the quest.

Deletes the Cora agent, lists remaining deployments, and provides guidance
on cleaning up Azure resources.

Run:
    python 09_teardown.py
"""

import os
from dotenv import load_dotenv
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

load_dotenv()

project_endpoint = os.environ.get("AZURE_AI_PROJECT_ENDPOINT", "<project endpoint>")
AGENT_NAME = "cora-zava-diy"


def main() -> None:
    credential = DefaultAzureCredential()
    project = AIProjectClient(endpoint=project_endpoint, credential=credential)

    print("🧹 Tearing down Quest 2 resources…\n")

    # 1. Delete the Cora agent (all versions)
    print("🤖 Cleaning up agents…")
    try:
        agents = [
            agent for agent in project.agents.list()
            if agent.name in (AGENT_NAME, "cora-traced-agent")
        ]
        for agent in agents:
            latest_version = getattr(getattr(getattr(agent, "versions", None), "latest", None), "version", "1")
            print(f"   Deleting agent: {agent.name} (version: {latest_version})")
            project.agents.delete_version(agent_name=agent.name, agent_version=latest_version)
        print(f"   Deleted {len(agents)} agent version(s).")
    except Exception:
        print("   No agents found or already deleted.")

    # 2. Clean up evaluations
    print("\n📊 Cleaning up evaluations…")
    try:
        openai_client = project.get_openai_client()
        evals = list(openai_client.evals.list())
        for eval_obj in evals:
            print(f"   Deleting evaluation: {getattr(eval_obj, 'name', None) or eval_obj.id}")
            openai_client.evals.delete(eval_obj.id)
        print(f"   Deleted {len(evals)} evaluation(s).")
    except Exception:
        print("   No evaluations found or already deleted.")

    # 3. List remaining deployments (informational)
    print("\n🚀 Remaining deployments (delete manually if needed):")
    for dep in project.deployments.list():
        if dep.type == "ModelDeployment" and hasattr(dep, "model_name") and hasattr(dep, "model_publisher"):
            print(f"   • {dep.name}  ({dep.model_publisher} / {dep.model_name})")

    # 4. List remaining Red Team scans (informational)
    print("\n🔴 Red Team scans (kept for reference):")
    try:
        for scan in project.red_teams.list():
            print(f"   • {scan.name} — {scan.status}")
    except Exception:
        print("   No red team scans found.")

    print("\n✅ Automated cleanup complete!")
    print("\n📌 Manual cleanup (if needed):")
    print("   1. Delete model deployments in Foundry Portal → Deployments")
    print("   2. Delete the Foundry project in Azure Portal → Resource groups")
    print("   3. Delete the resource group if no longer needed")
    print("\n🎉 Congratulations on completing Quest 2! You've built an end-to-end AI agent with Microsoft Foundry.")


if __name__ == "__main__":
    try:
        main()
    except Exception as err:
        print(f"The sample encountered an error: {err}")
