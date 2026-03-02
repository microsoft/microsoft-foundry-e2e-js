// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Task 04b — Context Engineering: Ground Cora's responses in real product data.
 *
 * This script loads the Zava DIY product catalog (products.csv), builds
 * context from relevant products, and injects it into the prompt so Cora
 * can recommend specific products with accurate SKUs and prices.
 *
 * @summary Use product catalog data to ground model responses.
 *
 * Run:
 *   npm run build && node dist/04b-context-engineering.js
 */

import { AIProjectClient } from "@azure/ai-projects";
import { DefaultAzureCredential } from "@azure/identity";
import * as fs from "fs";
import * as path from "path";
import "dotenv/config";

const projectEndpoint =
  process.env["AZURE_AI_PROJECT_ENDPOINT"] || "<project endpoint>";
const deploymentName =
  process.env["MODEL_DEPLOYMENT_NAME"] || "<model deployment name>";

interface Product {
  name: string;
  sku: string;
  price: number;
  description: string;
  stock_level: number;
  main_category: string;
  subcategory: string;
}

/** Load products from CSV file. */
function loadProducts(csvPath: string): Product[] {
  const raw = fs.readFileSync(csvPath, "utf-8");
  const lines = raw.trim().split("\n");
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    // Handle quoted CSV fields
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    values.push(current.trim());

    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h.trim()] = values[i] || "";
    });
    return {
      name: obj["name"],
      sku: obj["sku"],
      price: parseFloat(obj["price"]),
      description: obj["description"],
      stock_level: parseInt(obj["stock_level"], 10),
      main_category: obj["main_category"],
      subcategory: obj["subcategory"],
    };
  });
}

/** Simple keyword search to find relevant products. */
function searchProducts(products: Product[], query: string): Product[] {
  const terms = query.toLowerCase().split(/\s+/);
  return products
    .map((p) => {
      const text =
        `${p.name} ${p.description} ${p.main_category} ${p.subcategory}`.toLowerCase();
      const score = terms.filter((t) => text.includes(t)).length;
      return { product: p, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((r) => r.product);
}

/** Format products as context for the prompt. */
function formatProductContext(products: Product[]): string {
  if (products.length === 0) return "No matching products found in catalog.";
  return products
    .map(
      (p) =>
        `• ${p.name} (SKU: ${p.sku}, $${p.price.toFixed(2)}) — ${p.description} [Stock: ${p.stock_level}]`,
    )
    .join("\n");
}

const CORA_SYSTEM_PROMPT = `You are Cora, the friendly AI assistant for Zava DIY home improvement store.
Help customers find the right products. Always reference specific products by name, SKU, and price.
Be polite, concise, and helpful. Keep responses under 150 words.`;

const testQuestions = [
  "What paint should I use for my bathroom?",
  "I need something eco-friendly for my baby's room",
  "What's the cheapest option for painting my ceiling?",
];

export async function main(): Promise<void> {
  // Load the product catalog
  const catalogPath = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "docs",
    "data",
    "products.csv",
  );
  console.log(`📦 Loading product catalog from ${catalogPath}…`);
  const products = loadProducts(catalogPath);
  console.log(`   Loaded ${products.length} products.\n`);

  const project = new AIProjectClient(
    projectEndpoint,
    new DefaultAzureCredential(),
  );
  const openAIClient = await project.getOpenAIClient();

  for (const question of testQuestions) {
    console.log(`👤 Customer: "${question}"`);

    // Search for relevant products
    const relevant = searchProducts(products, question);
    const context = formatProductContext(relevant);
    console.log(`   📋 Found ${relevant.length} relevant product(s)`);

    // Build context-enriched prompt
    const contextPrompt = `${CORA_SYSTEM_PROMPT}

## Available Products (from Zava DIY catalog)
${context}

Use ONLY the products listed above to make recommendations. Include SKU and price.`;

    const response = await openAIClient.responses.create({
      model: deploymentName,
      instructions: contextPrompt,
      input: question,
    });

    console.log(`🤖 Cora: ${response.output_text}`);
    console.log("─".repeat(60));
  }

  console.log("\n✅ Context engineering complete!");
  console.log(
    "💡 Notice: Cora now references specific Zava DIY products with SKUs and prices.",
  );
  console.log(
    "   Next, we'll fine-tune gpt-4.1-mini to bake this knowledge in (04c).",
  );
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
