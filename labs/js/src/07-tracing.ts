// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Task 07 — Tracing: Instrument Cora's agent execution with Azure Monitor OpenTelemetry.
 *
 * This script enables telemetry, creates a tracer, runs agent operations
 * with custom spans, and sends trace data to Application Insights.
 *
 * @summary Trace agent execution with Azure Monitor OpenTelemetry.
 *
 * Prerequisites:
 *   - Set TELEMETRY_CONNECTION_STRING in .env (Application Insights connection string).
 *
 * Run:
 *   npm run build && node dist/07-tracing.js
 */

import {
  useAzureMonitor,
  shutdownAzureMonitor,
} from "@azure/monitor-opentelemetry";
import type { AzureMonitorOpenTelemetryOptions } from "@azure/monitor-opentelemetry";
import { SpanKind } from "@opentelemetry/api";
import "dotenv/config";

const TELEMETRY_CONNECTION_STRING =
  process.env["TELEMETRY_CONNECTION_STRING"] || "";

if (!TELEMETRY_CONNECTION_STRING) {
  console.error(
    "❌ TELEMETRY_CONNECTION_STRING is not set in .env.\n" +
    "   This script requires an Application Insights connection string.\n" +
    "   Find it in Azure Portal → Application Insights → Overview → Connection String.\n" +
    "   Then add it to your .env file.",
  );
  process.exit(1);
}

const options: AzureMonitorOpenTelemetryOptions = {
  azureMonitorExporterOptions: {
    connectionString: TELEMETRY_CONNECTION_STRING,
  },
};

// Initialize Azure Monitor BEFORE importing SDK clients
useAzureMonitor(options);

import { trace, SpanStatusCode } from "@opentelemetry/api";
import { AIProjectClient } from "@azure/ai-projects";
import { DefaultAzureCredential } from "@azure/identity";

const projectEndpoint =
  process.env["AZURE_AI_PROJECT_ENDPOINT"] || "<project endpoint>";
const deploymentName =
  process.env["MODEL_DEPLOYMENT_NAME"] || "<model deployment name>";

export async function main(): Promise<void> {
  const tracer = trace.getTracer("cora-zava-diy", "1.0.0");
  const project = new AIProjectClient(
    projectEndpoint,
    new DefaultAzureCredential(),
  );

  console.log("📡 Tracing enabled — sending telemetry to Application Insights…\n");

  // Trace agent creation
  await tracer.startActiveSpan(
    "cora.agent.create",
    {
      kind: SpanKind.CLIENT,
      attributes: {
        "gen_ai.system": "az.ai.agents",
        "gen_ai.provider.name": "microsoft.agents",
        model: deploymentName,
        "http.method": "POST",
        projectEndpoint: projectEndpoint,
      },
    },
    async (span) => {
      try {
        // Create the agent within a traced span
        await tracer.startActiveSpan(
          "agents.createVersion",
          { kind: SpanKind.CLIENT },
          async (agentSpan) => {
            try {
              agentSpan.setAttribute("deploymentName", deploymentName);
              agentSpan.setAttribute("model", deploymentName);
              agentSpan.setAttribute(
                "instructions",
                "You are Cora, Zava DIY assistant",
              );

              const res = await project.agents.createVersion(
                "cora-traced-agent",
                {
                  kind: "prompt",
                  model: deploymentName,
                  instructions:
                    "You are Cora, the friendly AI assistant for Zava DIY home improvement store.",
                },
              );

              agentSpan.setAttribute("agent.version", res.version);
              agentSpan.setAttribute("agent.id", res.id);
              agentSpan.setAttribute("agent.name", res.name);
              agentSpan.setStatus({ code: SpanStatusCode.OK });

              console.log(`✅ Agent created (name: ${res.name}, version: ${res.version})`);
              return res;
            } catch (e) {
              agentSpan.setStatus({
                code: SpanStatusCode.ERROR,
                message: String(e),
              });
              throw e;
            } finally {
              agentSpan.end();
            }
          },
        );

        // Trace a test inference
        await tracer.startActiveSpan(
          "cora.inference",
          { kind: SpanKind.CLIENT },
          async (inferenceSpan) => {
            try {
              const openAIClient = await project.getOpenAIClient();
              inferenceSpan.setAttribute("query", "What paint for my bathroom?");

              const response = await openAIClient.responses.create({
                model: deploymentName,
                instructions: "You are Cora, a helpful Zava DIY assistant.",
                input: "What paint should I use for my bathroom?",
              });

              inferenceSpan.setAttribute(
                "response.length",
                response.output_text.length,
              );
              inferenceSpan.setStatus({ code: SpanStatusCode.OK });

              console.log(`\n🤖 Response: ${response.output_text.substring(0, 200)}…`);
            } catch (e) {
              inferenceSpan.setStatus({
                code: SpanStatusCode.ERROR,
                message: String(e),
              });
              throw e;
            } finally {
              inferenceSpan.end();
            }
          },
        );

        // The traced agent is preserved for review — it will be cleaned up in Task 9 (teardown).
        console.log("\n💡 Traced agent preserved. View it in the Foundry Portal under Agents.");

        span.setAttribute("http.status_code", 200);
        span.setStatus({ code: SpanStatusCode.OK });
      } catch (e) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: String(e) });
        span.recordException(e as Error);
        span.setAttribute("http.status_code", 500);
        throw e;
      } finally {
        span.end();
      }
    },
  );

  console.log("\n📡 Telemetry sent successfully!");
  console.log(
    "   View traces in Azure Portal → Application Insights → Transaction search",
  );
  console.log(
    '   Filter by: customDimensions["gen_ai.system"] = "az.ai.agents"',
  );

  await shutdownAzureMonitor();
}

main().catch(async (err) => {
  console.error("The sample encountered an error:", err);

  // Flush any pending telemetry before shutdown
  const provider = (trace as any).getTracerProvider?.();
  if (provider && typeof provider.forceFlush === "function") {
    await provider.forceFlush();
  }
  await new Promise((resolve) => setTimeout(resolve, 5000));

  await shutdownAzureMonitor();
});
