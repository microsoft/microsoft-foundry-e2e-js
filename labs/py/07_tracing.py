# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""
Task 07 — Tracing: Instrument Cora's agent execution with Azure Monitor OpenTelemetry.

Enables telemetry, creates a tracer, runs agent operations with custom spans,
and sends trace data to Application Insights.

Prerequisites:
    - Set TELEMETRY_CONNECTION_STRING in .env (Application Insights connection string).

Run:
    python 07_tracing.py
"""

import os
from dotenv import load_dotenv

load_dotenv()

TELEMETRY_CONNECTION_STRING = os.environ.get("TELEMETRY_CONNECTION_STRING", "")

if not TELEMETRY_CONNECTION_STRING:
    print(
        "❌ TELEMETRY_CONNECTION_STRING is not set in .env.\n"
        "   This script requires an Application Insights connection string.\n"
        "   Find it in Azure Portal → Application Insights → Overview → Connection String.\n"
        "   Then add it to your .env file."
    )
    raise SystemExit(1)

# Initialize Azure Monitor BEFORE importing SDK clients
from azure.monitor.opentelemetry import configure_azure_monitor

configure_azure_monitor(connection_string=TELEMETRY_CONNECTION_STRING)

from opentelemetry import trace
from opentelemetry.trace import SpanKind, StatusCode
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import PromptAgentDefinition
from azure.identity import DefaultAzureCredential

project_endpoint = os.environ.get("AZURE_AI_PROJECT_ENDPOINT", "<project endpoint>")
deployment_name = os.environ.get("MODEL_DEPLOYMENT_NAME", "<model deployment name>")


def main() -> None:
    tracer = trace.get_tracer("cora-zava-diy", "1.0.0")
    credential = DefaultAzureCredential()
    project = AIProjectClient(endpoint=project_endpoint, credential=credential)

    print("📡 Tracing enabled — sending telemetry to Application Insights…\n")

    # Trace agent creation
    with tracer.start_as_current_span(
        "cora.agent.create",
        kind=SpanKind.CLIENT,
        attributes={
            "gen_ai.system": "az.ai.agents",
            "gen_ai.provider.name": "microsoft.agents",
            "model": deployment_name,
            "projectEndpoint": project_endpoint,
        },
    ) as parent_span:
        try:
            # Create the agent within a traced span
            with tracer.start_as_current_span(
                "agents.createVersion",
                kind=SpanKind.CLIENT,
                attributes={"model": deployment_name, "instructions": "You are Cora, Zava DIY assistant"},
            ) as agent_span:
                agent = project.agents.create_version(
                    agent_name="cora-traced-agent",
                    definition=PromptAgentDefinition(
                        model=deployment_name,
                        instructions="You are Cora, the friendly AI assistant for Zava DIY home improvement store.",
                    ),
                )
                agent_span.set_attribute("agent.version", agent.version)
                agent_span.set_attribute("agent.id", agent.id)
                agent_span.set_attribute("agent.name", agent.name)
                agent_span.set_status(StatusCode.OK)
                print(f"✅ Agent created (name: {agent.name}, version: {agent.version})")

            # Trace a test inference
            with tracer.start_as_current_span(
                "cora.inference",
                kind=SpanKind.CLIENT,
                attributes={"query": "What paint for my bathroom?"},
            ) as inference_span:
                openai_client = project.get_openai_client()
                response = openai_client.responses.create(
                    model=deployment_name,
                    instructions="You are Cora, a helpful Zava DIY assistant.",
                    input="What paint should I use for my bathroom?",
                )
                inference_span.set_attribute("response.length", len(response.output_text))
                inference_span.set_status(StatusCode.OK)
                print(f"\n🤖 Response: {response.output_text[:200]}…")

            # The traced agent is preserved for review — it will be cleaned up in Task 9 (teardown).
            print("\n💡 Traced agent preserved. View it in the Foundry Portal under Agents.")

            parent_span.set_status(StatusCode.OK)
        except Exception as e:
            parent_span.set_status(StatusCode.ERROR, str(e))
            parent_span.record_exception(e)
            raise

    print("\n📡 Telemetry sent successfully!")
    print("   View traces in Azure Portal → Application Insights → Transaction search")
    print('   Filter by: customDimensions["gen_ai.system"] = "az.ai.agents"')


if __name__ == "__main__":
    try:
        main()
    except Exception as err:
        print(f"The sample encountered an error: {err}")
