# 5. Design Your AI Agent

Time to bring Cora to life! In this task you'll build a full AI agent using the Foundry Agent Service, complete with **instructions**, **function tools**, and **conversation management**.

## Learning Objectives

- Understand the **Agent = Model + Instructions + Tools** architecture.
- Define **function tool schemas** for product search and stock checking.
- Create and manage **conversations** with the Foundry Agent Service.
- Handle **function call** loops: agent requests → execute tool → return result.

## Prerequisites

| Requirement | Details |
|---|---|
| Task 4 complete | System prompt and context engineering working |
| gpt-4.1 deployed | Or your chosen model |

## Concepts

### What Makes an Agent?

An AI agent is more than a chat model. It's an autonomous system that:

```
Customer Question → Agent Brain (LLM) → Tool Calls → Final Response
                        ↑                    ↓
                   Instructions          Execute tools
                   (persona, rules)      (search, stock check)
```

In Foundry, an agent consists of:

| Component | Purpose | Example |
|---|---|---|
| **Model** | The LLM "brain" | gpt-4.1 |
| **Instructions** | Persona and rules | "You are Cora, be polite, use SKUs…" |
| **Tools** | Actions the agent can take | `search_products()`, `check_stock()` |

### Function Tools

Function tools let the agent call your code. You define the tool schema, and when the agent decides it needs to use a tool, it returns a `function_call` output that you execute locally.

```typescript
const searchTool = {
  type: "function",
  name: "search_products",
  description: "Search the Zava DIY catalog by keyword.",
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search keywords" },
    },
    required: ["query"],
  },
};
```

### The Agent Loop

The conversation follows this loop:

1. **User message** → Create conversation with customer question.
2. **Agent response** → May include `function_call` items.
3. **Execute tools** → Run the function locally with the provided arguments.
4. **Submit results** → Send `function_call_output` back to the agent.
5. **Final response** → Agent uses tool results to compose the answer.

## Hands-On Steps

### Step 1 — Review the Tools (05c)

Open `labs/js/src/05c-tools.ts` to understand the tool implementations:

- **`searchProducts(query)`** — Keyword search against `products.csv`, returns top 5 matches.
- **`checkStock(sku)`** — Looks up a product by SKU, returns stock status.

### Step 2 — Create the Agent (05a)

```bash
npm run build
node dist/05a-create-agent.js
```

This registers Cora with the Foundry Agent Service, including her instructions and tool definitions.

### Step 3 — Run Conversations (05b)

```bash
node dist/05b-run-agent.js
```

Watch as Cora:
1. Receives a customer question.
2. Decides which tool(s) to call.
3. You execute the tool and return results.
4. Cora composes a response with specific product recommendations.

> 🔗 See [labs/ui/05-agent.md](../labs/ui/05-agent.md) for the portal walkthrough.

## Checkpoint

✅ You should now have:

- [ ] The Cora agent created in Foundry Agent Service
- [ ] Tool calls working: search_products and check_stock
- [ ] Multi-turn conversations with tool-grounded responses

## Summary

Cora is now a full AI agent with function tools! She can search the product catalog and check stock before responding to customers. But how do we know her responses are **good enough** for production? In the next task, we'll **evaluate** her quality and safety.

---

**[← Task 4: Customization](./04-customization.md)** | **Next → [Task 6: Evaluating the Agent](./06-evaluation.md)**