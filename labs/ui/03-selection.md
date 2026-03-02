# Task 3: Selecting a Base Model — Portal Walkthrough

This guide walks you through browsing the model catalog, comparing models, and deploying gpt-4.1 using the Foundry Portal.

## Step 1 — Browse the Model Catalog

1. Open [ai.azure.com](https://ai.azure.com) and navigate to your project.
2. Click **Model catalog** in the left navigation.
3. Browse the available models — notice the categories: OpenAI, Meta, Microsoft, and more.

![Step 1 — Model catalog](../docs/assets/03/model-catalog.png)

> **What you should see:** A grid of models with cards showing name, publisher, and capabilities.

## Step 2 — Compare Models

1. Search for **gpt-4.1** in the catalog.
2. Click on the model card to see benchmarks, pricing, and capabilities.
3. Compare with **gpt-4.1-mini** — notice the quality vs cost tradeoff.

![Step 2 — Model comparison](../docs/assets/03/model-comparison.png)

> **What you should see:** Model cards with benchmark scores, pricing per 1K tokens, and supported capabilities.

## Step 3 — Deploy gpt-4.1

1. From the gpt-4.1 model card, click **Deploy**.
2. Choose a deployment name (e.g., `gpt-4.1`).
3. Select your **tokens-per-minute** quota (start with 10K TPM for testing).
4. Click **Deploy** and wait for the deployment to complete.

![Step 3 — Deploy model](../docs/assets/03/deploy-model.png)

> **What you should see:** A deployment confirmation with the deployment name and endpoint.

## Step 4 — Test in the Playground

1. Navigate to **Playgrounds** → **Chat**.
2. Select your new **gpt-4.1** deployment from the model dropdown.
3. Try these Zava DIY customer questions:
   - *"What paint should I use for a bathroom?"*
   - *"Do you have any eco-friendly paint options?"*
   - *"What's the difference between flat and eggshell paint?"*
4. Notice the model gives general answers — it doesn't know about Zava DIY's specific products yet.

![Step 4 — Playground test](../docs/assets/03/playground-test.png)

> **What you should see:** Reasonable but generic responses about paint types without specific product recommendations.

## Step 5 — Check the Leaderboard

1. Navigate back to **Model catalog**.
2. Click **Leaderboard** tab (if available).
3. Compare models across different benchmarks.
4. Note how gpt-4.1 ranks vs gpt-4.1-mini on quality metrics.

![Step 5 — Leaderboard](../docs/assets/03/leaderboard.png)

## Checkpoint

✅ You should now have:

- [ ] Browsed the model catalog and compared models
- [ ] Deployed gpt-4.1 to your project
- [ ] Tested the model in the playground
- [ ] Noted that responses are generic (no Zava DIY product knowledge)

---

**Next → [Task 4: Customizing the Base Model](../docs/04-customization.md)**
