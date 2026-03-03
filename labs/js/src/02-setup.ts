// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Task 02 — Setup: Verify your environment configuration.
 *
 * This script checks that all required environment variables are set,
 * creates an AIProjectClient to verify authentication, and runs a
 * quick inference call to confirm the model deployment is working.
 *
 * @summary Validate .env configuration and test Foundry connectivity.
 *
 * Before running:
 *   ./labs/scripts/setup-env.sh   # or manually: cp sample.env .env
 *   npm run build && node dist/02-setup.js
 */

import { AIProjectClient } from "@azure/ai-projects";
import { AzureCliCredential } from "@azure/identity";
import "dotenv/config";

export async function main(): Promise<void> {
  // 1. Validate required environment variables
  console.log("🔍 Checking environment variables…\n");

  const required: Record<string, string | undefined> = {
    AZURE_AI_PROJECT_ENDPOINT: process.env["AZURE_AI_PROJECT_ENDPOINT"],
    MODEL_DEPLOYMENT_NAME: process.env["MODEL_DEPLOYMENT_NAME"],
  };

  const optional: Record<string, string | undefined> = {
    MODEL_ENDPOINT: process.env["MODEL_ENDPOINT"],
    MODEL_API_KEY: process.env["MODEL_API_KEY"],
    TELEMETRY_CONNECTION_STRING: process.env["TELEMETRY_CONNECTION_STRING"],
    AZURE_AI_PROJECTS_AZURE_SUBSCRIPTION_ID: process.env["AZURE_AI_PROJECTS_AZURE_SUBSCRIPTION_ID"],
    AZURE_AI_PROJECTS_AZURE_RESOURCE_GROUP: process.env["AZURE_AI_PROJECTS_AZURE_RESOURCE_GROUP"],
    AZURE_AI_PROJECTS_AZURE_AOAI_ACCOUNT: process.env["AZURE_AI_PROJECTS_AZURE_AOAI_ACCOUNT"],
  };

  let allSet = true;
  for (const [key, value] of Object.entries(required)) {
    if (value && !value.startsWith("<")) {
      console.log(`  ✅ ${key}`);
    } else {
      console.log(`  ❌ ${key} — not set`);
      allSet = false;
    }
  }

  console.log("");
  for (const [key, value] of Object.entries(optional)) {
    if (value && !value.startsWith("<")) {
      console.log(`  ✅ ${key}`);
    } else {
      console.log(`  ⬜ ${key} — not set (optional)`);
    }
  }

  if (!allSet) {
    console.log("\n❌ Required environment variables missing. Run ./labs/scripts/setup-env.sh or edit .env.");
    return;
  }

  // 2. Create the AI Project client and verify authentication
  const projectEndpoint = required.AZURE_AI_PROJECT_ENDPOINT!;
  const deploymentName = required.MODEL_DEPLOYMENT_NAME!;

  console.log("\n🔐 Connecting to Microsoft Foundry…");
  console.log(`   Endpoint: ${projectEndpoint}`);
  const project = new AIProjectClient(
    projectEndpoint,
    new AzureCliCredential(),
  );

  // 3. Test inference with a simple prompt
  console.log(`\n🚀 Testing model deployment: ${deploymentName}…`);

  const openAIClient = await project.getOpenAIClient();

  try {
    const response = await openAIClient.responses.create({
      model: deploymentName,
      input: "Say 'Hello from Foundry!' in exactly those words.",
      max_output_tokens: 20,
    });

    const output = response.output_text?.trim();
    console.log(`   Model response: "${output}"`);
    console.log("\n✅ Foundry project is reachable and responding.");
  } catch (e: any) {
    if (e?.status === 404) {
      console.log("\n⚠️  Project data plane returned 404 — this is normal for newly created projects.");
      console.log("   The project may take 5–15 minutes to propagate after creation.");
      console.log("   Try again shortly, or open the project in https://ai.azure.com to trigger sync.");
      console.log("\n✅ Environment variables are correctly configured.");
    } else {
      throw e;
    }
  } 

  console.log("🎉 Setup verified — you're ready for Quest 2!");
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
