// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Task 04a — Prompt Engineering: Craft and test Cora's system prompt.
 *
 * This script defines Cora's personality, rules, and response format
 * via a system prompt, then tests it with Zava DIY customer questions.
 *
 * @summary Engineer a system prompt for the Cora customer service agent.
 *
 * Run:
 *   npm run build && node dist/04a-prompt-engineering.js
 */

import { AIProjectClient } from "@azure/ai-projects";
import { AzureCliCredential } from "@azure/identity";
import "dotenv/config";

const projectEndpoint =
  process.env["AZURE_AI_PROJECT_ENDPOINT"] || "<project endpoint>";
const deploymentName =
  process.env["MODEL_DEPLOYMENT_NAME"] || "<model deployment name>";

// Cora's system prompt — this is where the magic happens
const CORA_SYSTEM_PROMPT = `You are Cora, the friendly and knowledgeable AI customer service assistant for Zava DIY, a home improvement retail store.

## Your Role
- Help customers find the right products for their projects.
- Answer questions about paint, primers, and home improvement supplies.
- Always be polite, encouraging, and concise.

## Rules
1. Always reference specific products by name, SKU, and price when available.
2. If you don't know the answer, say so honestly and suggest visiting the store.
3. Never provide advice on topics outside home improvement.
4. If a customer seems frustrated, acknowledge their concern and offer to help.
5. Keep responses under 150 words unless the customer asks for detailed information.

## Response Format
- Start with a direct answer to the question.
- Include specific product recommendations with SKU and price.
- End with a helpful tip or next step when appropriate.`;

const testQuestions = [
  "What paint should I use for my bathroom?",
  "Do you have anything eco-friendly?",
  "How much would it cost to paint a 12x12 room?",
  "Can you help me pick a color for my living room?",
];

export async function main(): Promise<void> {
  const project = new AIProjectClient(
    projectEndpoint,
    new AzureCliCredential(),
  );
  const openAIClient = await project.getOpenAIClient();

  console.log("🎨 Testing Cora's system prompt with gpt-4.1…\n");
  console.log("System prompt:");
  console.log("─".repeat(60));
  console.log(CORA_SYSTEM_PROMPT);
  console.log("─".repeat(60));

  for (const question of testQuestions) {
    console.log(`\n👤 Customer: "${question}"`);

    const response = await openAIClient.responses.create({
      model: deploymentName,
      instructions: CORA_SYSTEM_PROMPT,
      input: question,
    });

    console.log(`🤖 Cora: ${response.output_text}`);
    console.log("─".repeat(60));
  }

  console.log("\n✅ Prompt engineering complete!");
  console.log(
    "💡 Notice: Cora responds in character but doesn't know specific Zava products yet.",
  );
  console.log(
    "   Next, we'll add product context (04b) and fine-tune the model (04c).",
  );
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
