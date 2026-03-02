// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Task 05b — Run Agent: Send customer questions to Cora and handle tool calls.
 *
 * This script creates a conversation, sends customer questions to the
 * Cora agent, handles function tool calls (product search, stock check),
 * and displays the final responses.
 *
 * @summary Interact with the Cora agent, handling function calls end-to-end.
 *
 * Prerequisites:
 *   - Run 05a-create-agent.ts first to create the Cora agent.
 *
 * Run:
 *   npm run build && node dist/05b-run-agent.js
 */

import { AIProjectClient } from "@azure/ai-projects";
import { DefaultAzureCredential } from "@azure/identity";
import { executeTool } from "./05c-tools";
import "dotenv/config";

const projectEndpoint =
  process.env["AZURE_AI_PROJECT_ENDPOINT"] || "<project endpoint>";

const AGENT_NAME = "cora-zava-diy";

const customerQuestions = [
  "What paint should I use for my bathroom?",
  "Is the Interior Semi-Gloss Paint in stock?",
  "I need something eco-friendly for my baby's nursery.",
];

export async function main(): Promise<void> {
  const project = new AIProjectClient(
    projectEndpoint,
    new DefaultAzureCredential(),
  );
  const openAIClient = await project.getOpenAIClient();

  console.log("💬 Running Cora agent conversations…\n");

  for (const question of customerQuestions) {
    console.log(`👤 Customer: "${question}"`);

    // Create a conversation with the customer's message
    const conversation = await openAIClient.conversations.create({
      items: [{ type: "message", role: "user", content: question }],
    });

    // Generate a response using the Cora agent
    let response = await openAIClient.responses.create(
      { conversation: conversation.id },
      {
        body: { agent: { name: AGENT_NAME, type: "agent_reference" } },
      },
    );

    // Handle tool calls — the agent may request function calls
    let iterations = 0;
    while (iterations < 5) {
      const functionCalls = response.output.filter(
        (item) => item.type === "function_call",
      );

      if (functionCalls.length === 0) break;

      // Execute each function call and collect results
      const toolResults: Array<{
        type: "function_call_output";
        call_id: string;
        output: string;
      }> = [];

      for (const call of functionCalls) {
        if (call.type === "function_call") {
          const args = JSON.parse(call.arguments);
          console.log(`   🔧 Tool call: ${call.name}(${JSON.stringify(args)})`);

          const result = executeTool(call.name, args);
          console.log(`   📋 Result: ${result.substring(0, 100)}…`);

          toolResults.push({
            type: "function_call_output",
            call_id: call.call_id,
            output: result,
          });
        }
      }

      // Submit tool results back to the agent
      response = await openAIClient.responses.create(
        {
          input: toolResults,
          previous_response_id: response.id,
        },
        {
          body: { agent: { name: AGENT_NAME, type: "agent_reference" } },
        },
      );

      iterations++;
    }

    console.log(`🤖 Cora: ${response.output_text}`);
    console.log("─".repeat(60));

    // Clean up conversation
    await openAIClient.conversations.delete(conversation.id);
  }

  console.log("\n✅ Agent conversations complete!");
  console.log(
    "💡 Notice how Cora uses tools to search products and check stock before responding.",
  );
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
