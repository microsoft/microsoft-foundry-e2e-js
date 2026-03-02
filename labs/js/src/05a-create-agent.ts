// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Task 05a — Create Agent: Define and register the Cora AI agent.
 *
 * This script creates Cora as a Foundry agent with:
 * - A system prompt defining her persona and rules
 * - Function tools for product search and stock checking
 *
 * @summary Create the Cora AI agent with instructions and tools.
 *
 * Run:
 *   npm run build && node dist/05a-create-agent.js
 */

import { AIProjectClient } from "@azure/ai-projects";
import { DefaultAzureCredential } from "@azure/identity";
import { toolDefinitions } from "./05c-tools";
import "dotenv/config";

const projectEndpoint =
  process.env["AZURE_AI_PROJECT_ENDPOINT"] || "<project endpoint>";
const deploymentName =
  process.env["MODEL_DEPLOYMENT_NAME"] || "<model deployment name>";

const CORA_INSTRUCTIONS = `You are Cora, the friendly and knowledgeable AI customer service assistant for Zava DIY, a home improvement retail store.

## Your Role
- Help customers find the right products for their home improvement projects.
- Answer questions about paint, primers, tools, and supplies.
- Provide specific product recommendations with SKU and price.

## Tools Available
- **search_products**: Search the Zava DIY catalog by keyword. Use this when customers ask about products.
- **check_stock**: Check stock availability for a specific SKU. Use this when customers ask about availability.

## Rules
1. ALWAYS use the search_products tool before recommending products.
2. Reference products by name, SKU, and price.
3. If stock is low (< 5 units), warn the customer.
4. Never discuss topics outside home improvement.
5. If you can't help, suggest visiting a Zava DIY store.
6. Keep responses friendly, concise, and under 150 words.

## Response Format
- Start with a direct answer.
- Include specific product recommendations.
- Mention stock availability when relevant.
- End with a helpful tip when appropriate.`;

export async function main(): Promise<void> {
  const project = new AIProjectClient(
    projectEndpoint,
    new DefaultAzureCredential(),
  );

  console.log("🤖 Creating Cora agent…");
  console.log(`   Model: ${deploymentName}`);
  console.log(`   Tools: ${toolDefinitions.map((t) => t.name).join(", ")}\n`);

  // Create the agent with instructions and tools
  const agent = await project.agents.createVersion("cora-zava-diy", {
    kind: "prompt",
    model: deploymentName,
    instructions: CORA_INSTRUCTIONS,
    tools: toolDefinitions,
  });

  console.log("✅ Agent created!");
  console.log(`   ID:      ${agent.id}`);
  console.log(`   Name:    ${agent.name}`);
  console.log(`   Version: ${agent.version}`);
  console.log(
    `\n💡 Save the agent name "${agent.name}" — you'll need it in 05b-run-agent.ts`,
  );
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
