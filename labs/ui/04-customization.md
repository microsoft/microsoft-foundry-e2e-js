# Task 4: Customizing the Base Model — Portal Walkthrough

This guide walks you through customizing gpt-4.1 for Cora using the Foundry Portal.

## Step 1 — Edit the System Prompt in the Playground

1. Open [ai.azure.com](https://ai.azure.com) → your project → **Playgrounds** → **Chat**.
2. Select your **gpt-4.1** deployment.
3. Click **System message** (or the gear icon).
4. Paste Cora's system prompt:

```
You are Cora, the friendly and knowledgeable AI customer service assistant for Zava DIY, a home improvement retail store.

Rules:
1. Always reference specific products by name, SKU, and price when available.
2. If you don't know the answer, say so honestly.
3. Never provide advice on topics outside home improvement.
4. Keep responses under 150 words.
```

5. Click **Apply changes**.
6. Test with: *"What paint should I use for my bathroom?"*

![Step 1 — System prompt](../docs/assets/04/system-prompt.png)

> **What you should see:** Cora responding in character with a polite, focused answer about bathroom paint.

## Step 2 — Test Without Product Context

1. Ask: *"What's the cheapest primer you carry?"*
2. Notice the model gives a generic answer — it doesn't know Zava DIY's specific products.

![Step 2 — Generic response](../docs/assets/04/generic-response.png)

> **What you should see:** A reasonable but generic primer recommendation without specific SKUs.

## Step 3 — Add Product Context Manually

1. Update the system prompt to include product data:

```
Available Products:
• Universal Bonding Primer (SKU: PFPR000011, $32.00) — High-adhesion primer for all surfaces
• Stain-Blocking Primer (SKU: PFPR000012, $40.00) — Heavy-duty, blocks water stains and crayon
```

2. Ask the same question: *"What's the cheapest primer you carry?"*
3. Notice Cora now references specific products!

![Step 3 — Grounded response](../docs/assets/04/grounded-response.png)

> **What you should see:** Cora recommending the Universal Bonding Primer at $32.00 with the correct SKU.

## Step 4 — Upload Fine-Tuning Data (Optional)

1. Navigate to **Fine-tuning** in the left navigation.
2. Click **+ Create fine-tuning job**.
3. Select **gpt-4.1-mini** as the base model.
4. Upload `docs/data/sft_training_set.jsonl` as training data.
5. Upload `docs/data/sft_validation_set.jsonl` as validation data.
6. Configure hyperparameters: 3 epochs, batch size 1.
7. Click **Submit** and monitor the job progress.

![Step 4 — Fine-tuning job](../docs/assets/04/fine-tuning-job.png)

> **What you should see:** A fine-tuning job in progress with status updates and training metrics.

## Step 5 — Deploy the Fine-Tuned Model (Optional)

1. Once the fine-tuning job completes, click **Deploy**.
2. Name the deployment `gpt-4-1-mini-cora`.
3. Test in the playground with the same questions.
4. Compare responses: the fine-tuned model should give Cora-style answers without needing explicit product context.

![Step 5 — Fine-tuned deployment](../docs/assets/04/fine-tuned-deploy.png)

## Checkpoint

✅ You should now have:

- [ ] Tested Cora's system prompt in the playground
- [ ] Seen the difference between generic and context-grounded responses
- [ ] (Optional) Started a fine-tuning job for gpt-4.1-mini
- [ ] (Optional) Deployed the fine-tuned model

---

**Next → [Task 5: Designing the AI Agent](../docs/05-agent.md)**
