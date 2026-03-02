# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""
Task 08 — Red-Teaming: Run an adversarial scan against Cora.

Creates a Red Team scan targeting Cora's model deployment, configures
attack strategies and risk categories, and monitors results.

Prerequisites:
    - Set MODEL_ENDPOINT and MODEL_API_KEY in .env (for red-teaming target).

Run:
    python 08_red_teaming.py
"""

import os
import time
from dotenv import load_dotenv
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

load_dotenv()

project_endpoint = os.environ.get("AZURE_AI_PROJECT_ENDPOINT", "<project endpoint>")
model_endpoint = os.environ.get("MODEL_ENDPOINT", "<model endpoint>")
model_api_key = os.environ.get("MODEL_API_KEY", "<model api key>")
deployment_name = os.environ.get("MODEL_DEPLOYMENT_NAME", "<model deployment name>")


def main() -> None:
    credential = DefaultAzureCredential()
    project = AIProjectClient(endpoint=project_endpoint, credential=credential)

    print("🔴 Running Red Team scan against Cora's deployment…\n")

    # 1. Configure the Red Team scan
    red_team_config = {
        "name": "",
        "displayName": "cora-red-team-scan",
        "attackStrategies": ["base64", "flip"],
        "riskCategories": ["Violence", "HateUnfairness"],
        "target": {
            "type": "AzureOpenAIModel",
            "modelDeploymentName": deployment_name,
        },
    }

    print("📋 Scan configuration:")
    print(f"   Target:     {deployment_name}")
    print(f"   Attacks:    {', '.join(red_team_config['attackStrategies'])}")
    print(f"   Risks:      {', '.join(red_team_config['riskCategories'])}\n")

    # 2. Create and start the scan
    print("▶️  Creating Red Team scan…")
    scan_result = project.red_teams.create(
        red_team_config,
        headers={
            "model-endpoint": model_endpoint,
            "model-api-key": model_api_key,
        },
    )
    print(f"   Scan created (name: {scan_result.name})\n")

    # 3. Poll for scan status
    print("⏳ Monitoring scan progress…")
    scan_status = project.red_teams.get(scan_result.name)
    while scan_status.status not in ("Completed", "Failed"):
        print(f"   Status: {scan_status.status}")
        time.sleep(10)
        scan_status = project.red_teams.get(scan_result.name)

    # 4. Display results
    if scan_status.status == "Completed":
        print("\n✅ Red Team scan completed!")
        print(scan_status)
    else:
        print(f"\n❌ Red Team scan {scan_status.status}.")

    # 5. List all scans
    print("\n📋 All Red Team scans:")
    for scan in project.red_teams.list():
        print(f"   • {scan.name} — {scan.status}")

    print("\n💡 Review the results to identify vulnerabilities.")
    print("   Consider adding safety system messages and content filters to harden Cora.")


if __name__ == "__main__":
    try:
        main()
    except Exception as err:
        print(f"The sample encountered an error: {err}")
