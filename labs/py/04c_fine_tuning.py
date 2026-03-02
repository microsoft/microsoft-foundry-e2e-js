# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""
Task 04c — Fine-Tuning: Distill gpt-4.1 knowledge into gpt-4.1-mini.

Uploads training/validation data, creates a supervised fine-tuning job to
customize gpt-4.1-mini with Zava DIY product knowledge, and monitors the job.

Prerequisites:
    - Set AZURE_AI_PROJECTS_AZURE_SUBSCRIPTION_ID, RESOURCE_GROUP, AOAI_ACCOUNT in .env

Run:
    python 04c_fine_tuning.py
"""

import os
import time
from pathlib import Path
from dotenv import load_dotenv
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential
from azure.mgmt.cognitiveservices import CognitiveServicesManagementClient

load_dotenv()

project_endpoint = os.environ.get("AZURE_AI_PROJECT_ENDPOINT", "<project endpoint>")
base_model = "gpt-4.1-mini"

data_dir = Path(__file__).resolve().parent.parent.parent / "docs" / "data"
training_file_path = str(data_dir / "sft_training_set.jsonl")
validation_file_path = str(data_dir / "sft_validation_set.jsonl")

subscription_id = os.environ.get("AZURE_AI_PROJECTS_AZURE_SUBSCRIPTION_ID", "<subscription id>")
resource_group = os.environ.get("AZURE_AI_PROJECTS_AZURE_RESOURCE_GROUP", "<resource group>")
account_name = os.environ.get("AZURE_AI_PROJECTS_AZURE_AOAI_ACCOUNT", "<AOAI account>")


def main() -> None:
    credential = DefaultAzureCredential()
    project = AIProjectClient(endpoint=project_endpoint, credential=credential)
    openai_client = project.get_openai_client()

    print("📚 Fine-tuning gpt-4.1-mini with Zava DIY product knowledge\n")

    # 1. Upload training and validation files
    print("📤 Uploading training data…")
    with open(training_file_path, "rb") as f:
        training_file = openai_client.files.create(file=f, purpose="fine-tune")
    print(f"   Training file uploaded (id: {training_file.id})")

    print("📤 Uploading validation data…")
    with open(validation_file_path, "rb") as f:
        validation_file = openai_client.files.create(file=f, purpose="fine-tune")
    print(f"   Validation file uploaded (id: {validation_file.id})")

    # 2. Wait for file processing
    print("⏳ Waiting for file processing…")
    openai_client.files.wait_for_processing(training_file.id)
    openai_client.files.wait_for_processing(validation_file.id)
    print("   Files processed.\n")

    # 3. Create a supervised fine-tuning job
    print(f"🔧 Creating fine-tuning job ({base_model})…")
    job = openai_client.fine_tuning.jobs.create(
        training_file=training_file.id,
        validation_file=validation_file.id,
        model=base_model,
        method={
            "type": "supervised",
            "supervised": {
                "hyperparameters": {
                    "n_epochs": 3,
                    "batch_size": 1,
                    "learning_rate_multiplier": 1.0,
                },
            },
        },
    )
    print(f"   Job created (id: {job.id}, status: {job.status})")

    # 4. Poll for completion
    print("\n⏳ Monitoring fine-tuning progress…")
    current_job = openai_client.fine_tuning.jobs.retrieve(job.id)
    while current_job.status not in ("succeeded", "failed", "cancelled"):
        print(f"   Status: {current_job.status}")
        time.sleep(30)
        current_job = openai_client.fine_tuning.jobs.retrieve(job.id)

    if current_job.status == "succeeded":
        print(f"\n✅ Fine-tuning succeeded!")
        print(f"   Fine-tuned model: {current_job.fine_tuned_model}")

        # 5. List training events
        print("\n📊 Training events:")
        events = openai_client.fine_tuning.jobs.list_events(job.id, limit=5)
        for event in events.data:
            print(f"   {event.message}")

        # 6. Optionally deploy the fine-tuned model
        if current_job.fine_tuned_model and subscription_id != "<subscription id>":
            print("\n🚀 Deploying fine-tuned model…")
            ft_deployment_name = "gpt-4-1-mini-cora"
            cognitive_client = CognitiveServicesManagementClient(credential, subscription_id)
            cognitive_client.deployments.begin_create_or_update(
                resource_group_name=resource_group,
                account_name=account_name,
                deployment_name=ft_deployment_name,
                deployment={
                    "sku": {"name": "GlobalStandard", "capacity": 50},
                    "properties": {
                        "model": {
                            "format": "OpenAI",
                            "name": current_job.fine_tuned_model,
                            "version": "1",
                        },
                    },
                },
            )
            print(f'   Deployment "{ft_deployment_name}" initiated.')
    else:
        print(f"\n❌ Fine-tuning {current_job.status}.")

    # 7. Clean up uploaded files
    print("\n🧹 Cleaning up uploaded files…")
    openai_client.files.delete(training_file.id)
    openai_client.files.delete(validation_file.id)
    print("   Files deleted.")


if __name__ == "__main__":
    try:
        main()
    except Exception as err:
        print(f"The sample encountered an error: {err}")
