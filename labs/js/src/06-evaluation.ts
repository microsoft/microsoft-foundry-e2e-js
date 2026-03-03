// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Task 06 — Evaluation: Evaluate Cora's response quality and safety.
 *
 * This script creates an evaluation using built-in evaluators (Violence,
 * Coherence, F1 Score), runs it with Zava DIY conversation data, polls
 * for completion, and displays the results.
 *
 * @summary Evaluate Cora's responses with built-in quality and safety evaluators.
 *
 * Run:
 *   npm run build && node dist/06-evaluation.js
 */

import { AIProjectClient } from "@azure/ai-projects";
import { AzureCliCredential } from "@azure/identity";
import * as fs from "fs";
import * as path from "path";
import "dotenv/config";

const projectEndpoint =
  process.env["AZURE_AI_PROJECT_ENDPOINT"] || "<project endpoint>";
const deploymentName =
  process.env["MODEL_DEPLOYMENT_NAME"] || "<model deployment name>";

export async function main(): Promise<void> {
  const project = new AIProjectClient(
    projectEndpoint,
    new AzureCliCredential(),
  );
  const openAIClient = await project.getOpenAIClient();

  console.log("📊 Evaluating Cora's response quality and safety…\n");

  // 1. Load conversation data
  const dataPath = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "docs",
    "data",
    "conversations.jsonl",
  );
  const lines = fs
    .readFileSync(dataPath, "utf-8")
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));

  console.log(`   Loaded ${lines.length} conversation(s) for evaluation.\n`);

  // 2. Define data source schema
  const dataSourceConfig = {
    type: "custom" as const,
    item_schema: {
      type: "object",
      properties: {
        query: { type: "string" },
        response: { type: "string" },
        context: { type: "string" },
        ground_truth: { type: "string" },
      },
      required: [],
    },
    include_sample_schema: true,
  };

  // 3. Define testing criteria with built-in evaluators
  const testingCriteria = [
    {
      type: "azure_ai_evaluator" as const,
      name: "violence",
      evaluator_name: "builtin.violence",
      data_mapping: {
        query: "{{item.query}}",
        response: "{{item.response}}",
      },
      initialization_parameters: { deployment_name: deploymentName },
    },
    {
      type: "azure_ai_evaluator" as const,
      name: "f1",
      evaluator_name: "builtin.f1_score",
    },
    {
      type: "azure_ai_evaluator" as const,
      name: "coherence",
      evaluator_name: "builtin.coherence",
      initialization_parameters: { deployment_name: deploymentName },
    },
  ];

  // 4. Create the evaluation
  console.log("📋 Creating evaluation with built-in evaluators…");
  const evalObject = await openAIClient.evals.create({
    name: "cora-quality-safety-eval",
    data_source_config: dataSourceConfig,
    testing_criteria: testingCriteria as any,
  });
  console.log(`   Evaluation created (id: ${evalObject.id})\n`);

  // 5. Run evaluation with inline conversation data
  console.log("▶️  Running evaluation with Zava DIY conversations…");
  const evalRun = await openAIClient.evals.runs.create(evalObject.id, {
    name: "cora-eval-run",
    metadata: { scenario: "zava-diy-customer-service", model: deploymentName },
    data_source: {
      type: "jsonl" as const,
      source: {
        type: "file_content" as const,
        content: lines.map((item) => ({ item })),
      },
    },
  });
  console.log(`   Evaluation run created (id: ${evalRun.id})\n`);

  // 6. Poll for completion
  console.log("⏳ Waiting for evaluation to complete…");
  let runStatus = await openAIClient.evals.runs.retrieve(evalRun.id, {
    eval_id: evalObject.id,
  });

  while (!["completed", "failed"].includes(runStatus.status)) {
    console.log(`   Status: ${runStatus.status}`);
    await new Promise((resolve) => setTimeout(resolve, 5_000));
    runStatus = await openAIClient.evals.runs.retrieve(evalRun.id, {
      eval_id: evalObject.id,
    });
  }

  // 7. Display results
  if (runStatus.status === "completed") {
    console.log("\n✅ Evaluation completed!\n");

    const outputItems = [];
    for await (const item of openAIClient.evals.runs.outputItems.list(
      evalRun.id,
      { eval_id: evalObject.id },
    )) {
      outputItems.push(item);
    }

    console.log("📊 Results:");
    console.log(JSON.stringify(outputItems.slice(0, 3), null, 2));

    if (runStatus.report_url) {
      console.log(`\n🔗 Full report: ${runStatus.report_url}`);
    }
  } else {
    console.log(`\n❌ Evaluation failed.`);
    if (runStatus.report_url) {
      console.log(`   Report: ${runStatus.report_url}`);
    }
  }

  console.log(
    "\n💡 Your evaluation is preserved in the Foundry Portal — review it under Evaluations.",
  );
  console.log("   To delete it later, run: openAIClient.evals.delete(evalObject.id)");
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
