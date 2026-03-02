# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""
Task 06 — Evaluation: Evaluate Cora's response quality and safety.

Creates an evaluation using built-in evaluators (Violence, Coherence, F1),
runs it with Zava DIY conversation data, polls for completion, and displays
the results.

Run:
    python 06_evaluation.py
"""

import json
import os
import time
from pathlib import Path
from dotenv import load_dotenv
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

load_dotenv()

project_endpoint = os.environ.get("AZURE_AI_PROJECT_ENDPOINT", "<project endpoint>")
deployment_name = os.environ.get("MODEL_DEPLOYMENT_NAME", "<model deployment name>")


def main() -> None:
    credential = DefaultAzureCredential()
    project = AIProjectClient(endpoint=project_endpoint, credential=credential)
    openai_client = project.get_openai_client()

    print("📊 Evaluating Cora's response quality and safety…\n")

    # 1. Load conversation data
    data_path = Path(__file__).resolve().parent.parent.parent / "docs" / "data" / "conversations.jsonl"
    with open(data_path, encoding="utf-8") as f:
        lines = [json.loads(line) for line in f if line.strip()]
    print(f"   Loaded {len(lines)} conversation(s) for evaluation.\n")

    # 2. Define data source schema
    data_source_config = {
        "type": "custom",
        "item_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string"},
                "response": {"type": "string"},
                "context": {"type": "string"},
                "ground_truth": {"type": "string"},
            },
            "required": [],
        },
        "include_sample_schema": True,
    }

    # 3. Define testing criteria with built-in evaluators
    testing_criteria = [
        {
            "type": "azure_ai_evaluator",
            "name": "violence",
            "evaluator_name": "builtin.violence",
            "data_mapping": {
                "query": "{{item.query}}",
                "response": "{{item.response}}",
            },
            "initialization_parameters": {"deployment_name": deployment_name},
        },
        {
            "type": "azure_ai_evaluator",
            "name": "f1",
            "evaluator_name": "builtin.f1_score",
        },
        {
            "type": "azure_ai_evaluator",
            "name": "coherence",
            "evaluator_name": "builtin.coherence",
            "initialization_parameters": {"deployment_name": deployment_name},
        },
    ]

    # 4. Create the evaluation
    print("📋 Creating evaluation with built-in evaluators…")
    eval_object = openai_client.evals.create(
        name="cora-quality-safety-eval",
        data_source_config=data_source_config,
        testing_criteria=testing_criteria,
    )
    print(f"   Evaluation created (id: {eval_object.id})\n")

    # 5. Run evaluation with inline conversation data
    print("▶️  Running evaluation with Zava DIY conversations…")
    eval_run = openai_client.evals.runs.create(
        eval_id=eval_object.id,
        name="cora-eval-run",
        metadata={"scenario": "zava-diy-customer-service", "model": deployment_name},
        data_source={
            "type": "jsonl",
            "source": {
                "type": "file_content",
                "content": [{"item": item} for item in lines],
            },
        },
    )
    print(f"   Evaluation run created (id: {eval_run.id})\n")

    # 6. Poll for completion
    print("⏳ Waiting for evaluation to complete…")
    run_status = openai_client.evals.runs.retrieve(eval_run.id, eval_id=eval_object.id)
    while run_status.status not in ("completed", "failed"):
        print(f"   Status: {run_status.status}")
        time.sleep(5)
        run_status = openai_client.evals.runs.retrieve(eval_run.id, eval_id=eval_object.id)

    # 7. Display results
    if run_status.status == "completed":
        print("\n✅ Evaluation completed!\n")

        output_items = list(
            openai_client.evals.runs.output_items.list(eval_run.id, eval_id=eval_object.id)
        )

        print("📊 Results:")
        print(json.dumps([item.to_dict() for item in output_items[:3]], indent=2, default=str))

        if hasattr(run_status, "report_url") and run_status.report_url:
            print(f"\n🔗 Full report: {run_status.report_url}")
    else:
        print(f"\n❌ Evaluation failed.")
        if hasattr(run_status, "report_url") and run_status.report_url:
            print(f"   Report: {run_status.report_url}")

    print("\n💡 Your evaluation is preserved in the Foundry Portal — review it under Evaluations.")
    print("   To delete it later, run: openai_client.evals.delete(eval_object.id)")


if __name__ == "__main__":
    try:
        main()
    except Exception as err:
        print(f"The sample encountered an error: {err}")
