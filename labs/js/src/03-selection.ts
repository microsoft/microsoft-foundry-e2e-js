// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Task 03 — Selection: List deployments and test a model with a Zava DIY prompt.
 *
 * This script lists available model deployments, filters by publisher,
 * and sends a test product question to gpt-4.1 using the Responses API.
 *
 * @summary Browse deployments and test inference with a Zava DIY question.
 *
 * Prerequisites:
 *   - Deploy gpt-4.1 (or your chosen model) in the Foundry portal first.
 *   - Set MODEL_DEPLOYMENT_NAME in your .env file.
 *
 * Run:
 *   npm run build && node dist/03-selection.js
 */

import type { ModelDeployment } from "@azure/ai-projects";
import { AIProjectClient } from "@azure/ai-projects";
import { DefaultAzureCredential } from "@azure/identity";
import "dotenv/config";

const projectEndpoint =
  process.env["AZURE_AI_PROJECT_ENDPOINT"] || "<project endpoint>";
const deploymentName =
  process.env["MODEL_DEPLOYMENT_NAME"] || "<model deployment name>";

export async function main(): Promise<void> {
  const project = new AIProjectClient(
    projectEndpoint,
    new DefaultAzureCredential(),
  );

  // 1. List all model deployments (may fail on newly created projects)
  console.log("📋 Listing model deployments…");
  try {
    const deployments: ModelDeployment[] = [];
    for await (const dep of project.deployments.list()) {
      if (
        dep.type === "ModelDeployment" &&
        "modelName" in dep &&
        "modelPublisher" in dep
      ) {
        deployments.push(dep);
        console.log(
          `  • ${dep.name}  |  ${dep.modelPublisher} / ${dep.modelName} v${dep.modelVersion}`,
        );
      }
    }
    console.log(`  Total: ${deployments.length} deployment(s)\n`);
  } catch (e: any) {
    if (e?.statusCode === 404 || e?.status === 404) {
      console.log("  ⚠️  Could not list deployments (project may still be propagating).");
      console.log(`  Continuing with configured deployment: ${deploymentName}\n`);
    } else {
      throw e;
    }
  }

  // 2. Get the OpenAI client for inference
  const openAIClient = await project.getOpenAIClient();

  // 3. Send a test prompt — a typical Zava DIY customer question
  console.log(`🧪 Testing deployment "${deploymentName}" with a product question…\n`);

  const response = await openAIClient.responses.create({
    model: deploymentName,
    input: "What kind of paint should I use for a bathroom renovation?",
  });
  console.log("🤖 Model response:");
  console.log(response.output_text);

  // 4. Test with a follow-up using conversation context
  console.log("\n💬 Follow-up question (with context)…");
  const followUp = await openAIClient.responses.create({
    model: deploymentName,
    input: "And do I need a primer first?",
    previous_response_id: response.id,
  });
  console.log("🤖 Follow-up response:");
  console.log(followUp.output_text);

  console.log("\n✅ Model selection verified — inference is working!");
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
