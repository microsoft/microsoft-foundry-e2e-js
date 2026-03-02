# 3. Select a Base Model For Project

Choosing the right base model is the foundation of your AI solution. In this task you'll explore the model catalog, understand benchmarks, deploy **gpt-4.1**, and test it with Zava DIY customer questions.

## Learning Objectives

- Navigate the Microsoft Foundry **model catalog** and compare models.
- Understand **benchmarks and leaderboards** for model selection.
- Deploy a model and test it via the **Responses API**.

## Prerequisites

| Requirement | Details |
|---|---|
| Task 2 complete | Foundry project set up and `.env` configured |
| Quota available | Sufficient tokens-per-minute for gpt-4.1 |

## Concepts

### Why Model Selection Matters

Different models trade off **quality**, **speed**, and **cost**:

| Model | Strength | Tradeoff |
|---|---|---|
| gpt-4.1 | Highest quality, best reasoning | Higher cost per token |
| gpt-4.1-mini | Fast, cost-effective | Slightly lower quality |
| gpt-4o | Multimodal, great all-rounder | Mid-range cost |

For Cora, we'll start with **gpt-4.1** (best quality) and later **distill to gpt-4.1-mini** via fine-tuning to reduce costs.

### Benchmarks & Leaderboards

The Foundry model catalog provides:

- **Quality benchmarks** — MMLU, HumanEval, and task-specific scores.
- **Speed metrics** — tokens per second, time to first token.
- **Cost** — price per 1K input/output tokens.

> 💡 **Tip:** Don't just pick the "best" model. Pick the model that meets your **quality requirements** at the **lowest cost**.

### The Responses API

The simplest way to test a model is the Responses API:

```typescript
const response = await openAIClient.responses.create({
  model: deploymentName,
  input: "What paint should I use for my deck?",
});
console.log(response.output_text);
```

You can chain follow-up questions using `previous_response_id` for conversational context.

## Hands-On Steps

### Step 1 — Deploy gpt-4.1

If you haven't deployed gpt-4.1 yet:

1. Open Foundry Portal → **Model catalog**.
2. Search for **gpt-4.1**.
3. Click **Deploy** → choose a deployment name (e.g., `gpt-4.1`).
4. Set your tokens-per-minute quota.

Update your `.env`:

```env
MODEL_DEPLOYMENT_NAME="gpt-4.1"
```

### Step 2 — Run the Selection Script

```bash
npm run build
node dist/03-selection.js
```

The script lists all your deployments, sends a Zava DIY customer question, and tests follow-up context.

### Step 3 — Experiment in the Playground

Try these Zava DIY questions in the portal playground:

- *"What paint should I use for my deck?"*
- *"Do you have any low-VOC options?"*
- *"What's the cheapest primer you carry?"*

> 🔗 See [labs/ui/03-selection.md](../labs/ui/03-selection.md) for a portal walkthrough.

## Checkpoint

✅ You should now have:

- [ ] gpt-4.1 deployed in your Foundry project
- [ ] `MODEL_DEPLOYMENT_NAME` set in `.env`
- [ ] The selection script runs and returns valid responses
- [ ] You've tested questions in the playground

## Summary

You've deployed **gpt-4.1** and verified it can answer customer questions. But notice the responses are generic — the model doesn't know about Zava DIY's specific products. In the next task, we'll **customize the model** with prompt engineering, product context, and fine-tuning.

---

**[← Task 2: Setup](./02-setup.md)** | **Next → [Task 4: Customizing the Base Model](./04-customization.md)**