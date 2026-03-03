// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Task 04c — Fine-Tuning: Distill gpt-4.1 knowledge into gpt-4.1-mini.
 *
 * This script uploads training/validation data, creates a supervised
 * fine-tuning job to customize gpt-4.1-mini with Zava DIY product
 * knowledge (distilled from gpt-4.1 responses), and monitors the job.
 *
 * @summary Fine-tune gpt-4.1-mini using supervised learning with Zava DIY data.
 *
 * Prerequisites:
 *   - Set AZURE_AI_PROJECTS_AZURE_SUBSCRIPTION_ID, AZURE_AI_PROJECTS_AZURE_RESOURCE_GROUP, AZURE_AI_PROJECTS_AZURE_AOAI_ACCOUNT in .env
 *
 * Run:
 *   npm run build && node dist/04c-fine-tuning.js
 */

import { AIProjectClient } from "@azure/ai-projects";
import { AzureCliCredential } from "@azure/identity";
import {
  CognitiveServicesManagementClient,
  type Deployment,
} from "@azure/arm-cognitiveservices";
import type { JobCreateParams } from "openai/resources/fine-tuning/jobs";
import * as fs from "fs";
import * as path from "path";
import "dotenv/config";

const projectEndpoint =
  process.env["AZURE_AI_PROJECT_ENDPOINT"] || "<project endpoint>";
const baseModel = "gpt-4.1-mini"; // the model we're fine-tuning

const trainingFilePath = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "docs",
  "data",
  "sft_training_set.jsonl",
);
const validationFilePath = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "docs",
  "data",
  "sft_validation_set.jsonl",
);

// For deployment after fine-tuning
const subscriptionId =
  process.env["AZURE_AI_PROJECTS_AZURE_SUBSCRIPTION_ID"] || "<subscription id>";
const resourceGroup =
  process.env["AZURE_AI_PROJECTS_AZURE_RESOURCE_GROUP"] || "<resource group>";
const accountName =
  process.env["AZURE_AI_PROJECTS_AZURE_AOAI_ACCOUNT"] || "<AOAI account>";

export async function main(): Promise<void> {
  const project = new AIProjectClient(
    projectEndpoint,
    new AzureCliCredential(),
  );
  const openAIClient = await project.getOpenAIClient();

  console.log("📚 Fine-tuning gpt-4.1-mini with Zava DIY product knowledge\n");

  // 1. Upload training and validation files
  console.log("📤 Uploading training data…");
  const trainingFile = await openAIClient.files.create({
    file: fs.createReadStream(trainingFilePath),
    purpose: "fine-tune",
  });
  console.log(`   Training file uploaded (id: ${trainingFile.id})`);

  console.log("📤 Uploading validation data…");
  const validationFile = await openAIClient.files.create({
    file: fs.createReadStream(validationFilePath),
    purpose: "fine-tune",
  });
  console.log(`   Validation file uploaded (id: ${validationFile.id})`);

  // 2. Wait for file processing
  console.log("⏳ Waiting for file processing…");
  await openAIClient.files.waitForProcessing(trainingFile.id);
  await openAIClient.files.waitForProcessing(validationFile.id);
  console.log("   Files processed.\n");

  // 3. Create a supervised fine-tuning job
  console.log(`🔧 Creating fine-tuning job (${baseModel})…`);
  const job = await openAIClient.fineTuning.jobs.create(
    {} as JobCreateParams,
    {
      body: {
        trainingType: "Standard",
        training_file: trainingFile.id,
        validation_file: validationFile.id,
        model: baseModel,
        method: {
          type: "supervised",
          supervised: {
            hyperparameters: {
              n_epochs: 3,
              batch_size: 1,
              learning_rate_multiplier: 1.0,
            },
          },
        },
      },
    },
  );
  console.log(`   Job created (id: ${job.id}, status: ${job.status})`);

  // 4. Poll for completion
  console.log("\n⏳ Monitoring fine-tuning progress…");
  let currentJob = await openAIClient.fineTuning.jobs.retrieve(job.id);
  while (!["succeeded", "failed", "cancelled"].includes(currentJob.status)) {
    console.log(`   Status: ${currentJob.status}`);
    await new Promise((resolve) => setTimeout(resolve, 30_000));
    currentJob = await openAIClient.fineTuning.jobs.retrieve(job.id);
  }

  if (currentJob.status === "succeeded") {
    console.log(`\n✅ Fine-tuning succeeded!`);
    console.log(`   Fine-tuned model: ${currentJob.fine_tuned_model}`);

    // 5. List training events
    console.log("\n📊 Training events:");
    const events = await openAIClient.fineTuning.jobs.listEvents(job.id, {
      limit: 5,
    });
    for (const event of events.data) {
      console.log(`   ${event.message}`);
    }

    // 6. Optionally deploy the fine-tuned model
    if (currentJob.fine_tuned_model && subscriptionId !== "<subscription id>") {
      console.log("\n🚀 Deploying fine-tuned model…");
      const ftDeploymentName = "gpt-4-1-mini-cora";
      const deploymentConfig: Deployment = {
        sku: { name: "GlobalStandard", capacity: 50 },
        properties: {
          model: {
            format: "OpenAI",
            name: currentJob.fine_tuned_model,
            version: "1",
          },
        },
      };

      const cognitiveClient = new CognitiveServicesManagementClient(
        new AzureCliCredential(),
        subscriptionId,
      );
      await cognitiveClient.deployments.beginCreateOrUpdate(
        resourceGroup,
        accountName,
        ftDeploymentName,
        deploymentConfig,
      );
      console.log(`   Deployment "${ftDeploymentName}" initiated.`);
    }
  } else {
    console.log(`\n❌ Fine-tuning ${currentJob.status}.`);
  }

  // 7. Clean up uploaded files
  console.log("\n🧹 Cleaning up uploaded files…");
  await openAIClient.files.delete(trainingFile.id);
  await openAIClient.files.delete(validationFile.id);
  console.log("   Files deleted.");
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
