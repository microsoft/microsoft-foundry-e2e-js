// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Task 05c — Tools: Product search and stock check implementations.
 *
 * This module provides the tool functions that Cora uses to answer
 * customer questions. It reads the Zava DIY product catalog from CSV.
 *
 * @summary Tool implementations for the Cora AI agent.
 */

import * as fs from "fs";
import * as path from "path";

export interface Product {
  name: string;
  sku: string;
  price: number;
  description: string;
  stock_level: number;
  main_category: string;
  subcategory: string;
}

let _products: Product[] | null = null;

/** Load and cache the product catalog. */
function getProducts(): Product[] {
  if (_products) return _products;
  const csvPath = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "docs",
    "data",
    "products.csv",
  );
  const raw = fs.readFileSync(csvPath, "utf-8");
  const lines = raw.trim().split("\n");
  const headers = lines[0].split(",");

  _products = lines.slice(1).map((line) => {
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
  return _products;
}

/**
 * Search the product catalog by keyword query.
 * Returns up to 5 matching products with name, SKU, price, and description.
 */
export function searchProducts(query: string): string {
  const products = getProducts();
  const terms = query.toLowerCase().split(/\s+/);
  const results = products
    .map((p) => {
      const text =
        `${p.name} ${p.description} ${p.main_category} ${p.subcategory}`.toLowerCase();
      const score = terms.filter((t) => text.includes(t)).length;
      return { product: p, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(
      (r) =>
        `${r.product.name} (SKU: ${r.product.sku}, $${r.product.price.toFixed(2)}) — ${r.product.description} [Stock: ${r.product.stock_level}]`,
    );

  return results.length > 0
    ? results.join("\n")
    : "No products found matching your query.";
}

/**
 * Check stock level for a specific product SKU.
 * Returns the product name, SKU, and current stock level.
 */
export function checkStock(sku: string): string {
  const products = getProducts();
  const product = products.find(
    (p) => p.sku.toLowerCase() === sku.toLowerCase(),
  );
  if (!product) {
    return `Product with SKU "${sku}" not found in catalog.`;
  }
  const status =
    product.stock_level === 0
      ? "OUT OF STOCK"
      : product.stock_level < 5
        ? "LOW STOCK"
        : "IN STOCK";
  return `${product.name} (SKU: ${product.sku}) — ${status} (${product.stock_level} units available), $${product.price.toFixed(2)}`;
}

/** Tool function definitions for the Foundry Agent Service. */
export const toolDefinitions = [
  {
    type: "function" as const,
    name: "search_products",
    description:
      "Search the Zava DIY product catalog by keyword. Returns matching products with name, SKU, price, and description.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Search keywords (e.g., 'bathroom paint', 'exterior primer', 'eco-friendly')",
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    type: "function" as const,
    name: "check_stock",
    description:
      "Check the current stock level for a specific product by SKU number.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        sku: {
          type: "string",
          description: "The product SKU (e.g., 'PFIP000001')",
        },
      },
      required: ["sku"],
      additionalProperties: false,
    },
  },
];

/**
 * Execute a tool call by name and return the result.
 */
export function executeTool(name: string, args: Record<string, string>): string {
  switch (name) {
    case "search_products":
      return searchProducts(args["query"]);
    case "check_stock":
      return checkStock(args["sku"]);
    default:
      return `Unknown tool: ${name}`;
  }
}
