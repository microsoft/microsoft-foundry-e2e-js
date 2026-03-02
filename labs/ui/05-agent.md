# Task 5: Designing the AI Agent — Portal Walkthrough

This guide walks you through creating and testing the Cora agent using the Foundry Portal.

## Step 1 — Navigate to Agent Builder

1. Open [ai.azure.com](https://ai.azure.com) → your project.
2. Click **Agents** in the left navigation.
3. Click **+ New agent** to start building.

![Step 1 — Agent Builder](../docs/assets/05/agent-builder.png)

> **What you should see:** The Agent Builder interface with fields for name, instructions, model, and tools.

## Step 2 — Configure the Agent

1. **Name**: Enter `cora-zava-diy`.
2. **Model**: Select your **gpt-4.1** deployment.
3. **Instructions**: Paste Cora's instructions:

```
You are Cora, the friendly and knowledgeable AI customer service assistant for Zava DIY.
Help customers find the right products. Always use the search_products tool before recommending products.
Reference products by name, SKU, and price. Keep responses under 150 words.
```

![Step 2 — Agent configuration](../docs/assets/05/agent-config.png)

## Step 3 — Add Function Tools

1. Click **+ Add tool** → **Function**.
2. Add the **search_products** tool:
   - Name: `search_products`
   - Description: "Search the Zava DIY product catalog by keyword."
   - Parameters: `{"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]}`
3. Add the **check_stock** tool:
   - Name: `check_stock`
   - Description: "Check stock availability for a specific product SKU."
   - Parameters: `{"type": "object", "properties": {"sku": {"type": "string"}}, "required": ["sku"]}`

![Step 3 — Function tools](../docs/assets/05/function-tools.png)

> **What you should see:** Two function tools listed under the agent configuration.

## Step 4 — Test the Agent

1. Click **Test** or open the agent playground.
2. Type: *"What paint should I use for my bathroom?"*
3. The agent should attempt to call the `search_products` tool.
4. In the portal, you can simulate tool responses or let the agent respond without tools.

![Step 4 — Agent test](../docs/assets/05/agent-test.png)

> **What you should see:** The agent making a function call request, then composing a response based on the tool output.

## Step 5 — Test Multi-Turn Conversations

1. After the first response, ask a follow-up: *"Is that in stock?"*
2. The agent should call `check_stock` with the relevant SKU.
3. Observe how the agent maintains conversation context.

![Step 5 — Multi-turn](../docs/assets/05/multi-turn.png)

## Checkpoint

✅ You should now have:

- [ ] Created the Cora agent in the portal
- [ ] Added search_products and check_stock tools
- [ ] Tested single and multi-turn conversations
- [ ] Observed the agent's tool call behavior

---

**Next → [Task 6: Evaluating the Agent](../docs/06-evaluation.md)**
