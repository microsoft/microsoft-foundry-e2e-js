// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Task 09 — Teardown: Clean up all resources created during the quest.
 *
 * This script deletes the Cora agent, lists remaining deployments,
 * and provides guidance on cleaning up Azure resources.
 *
 * @summary Clean up agents, evaluations, and Azure resources.
 *
 * Run:
 *   npm run build && node dist/09-teardown.js
 */

import { AIProjectClient } from "@azure/ai-projects";
import { DefaultAzureCredential } from "@azure/identity";
import "dotenv/config";

const projectEndpoint =
  process.env["AZURE_AI_PROJECT_ENDPOINT"] || "<project endpoint>";

const AGENT_NAME = "cora-zava-diy";

export async function main(): Promise<void> {
  const project = new AIProjectClient(
    projectEndpoint,
    new DefaultAzureCredential(),
  );

  console.log("🧹 Tearing down Quest 2 resources…\n");

  // 1. Delete agent versions (all Cora agents created during the quest)
  console.log("🤖 Cleaning up agents…");
  const agentNames = [AGENT_NAME, "cora-traced-agent", "cora-redteam-agent"];
  try {
    for await (const agent of project.agents.list()) {
      if (agentNames.includes(agent.name)) {
        const latestVersion = agent.versions?.latest?.version ?? "1";
        console.log(
          `   Deleting agent: ${agent.name} (version: ${latestVersion})`,
        );
        await project.agents.deleteVersion(agent.name, latestVersion);
      }
    }
    console.log("   Agent cleanup done.");
  } catch {
    console.log("   No agents found or already deleted.");
  }

  // 2. Clean up evaluations
  console.log("\n📊 Cleaning up evaluations…");
  try {
    const openAIClient = await project.getOpenAIClient();
    const evals = [];
    for await (const evalObj of openAIClient.evals.list()) {
      evals.push(evalObj);
      console.log(`   Deleting evaluation: ${evalObj.name || evalObj.id}`);
      await openAIClient.evals.delete(evalObj.id);
    }
    console.log(`   Deleted ${evals.length} evaluation(s).`);
  } catch {
    console.log("   No evaluations found or already deleted.");
  }

  // 3. List remaining deployments (informational)
  console.log("\n🚀 Remaining deployments (delete manually if needed):");
  for await (const dep of project.deployments.list()) {
    if (
      dep.type === "ModelDeployment" &&
      "modelName" in dep &&
      "modelPublisher" in dep
    ) {
      console.log(
        `   • ${dep.name}  (${dep.modelPublisher} / ${dep.modelName})`,
      );
    }
  }

  // 4. List remaining Red Team scans (informational)
  console.log("\n🔴 Red Team scans (kept for reference):");
  try {
    for await (const scan of project.beta.redTeams.list()) {
      console.log(`   • ${scan.name} — ${scan.status}`);
    }
  } catch {
    console.log("   No red team scans found.");
  }

  console.log("\n✅ Automated cleanup complete!");
  console.log("\n📌 Manual cleanup (if needed):");
  console.log("   1. Delete model deployments in Foundry Portal → Deployments");
  console.log("   2. Delete the Foundry project in Azure Portal → Resource groups");
  console.log(
    "   3. Delete the resource group if no longer needed",
  );
  console.log(
    "\n🎉 Congratulations on completing Quest 2! You've built an end-to-end AI agent with Microsoft Foundry.",
  );
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
