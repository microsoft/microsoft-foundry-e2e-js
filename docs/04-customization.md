# 4. Customize The Base Model

Now that you've selected gpt-4.1, it's time to customize it for Cora's specific use case. You'll progress through three levels of customization: **prompt engineering**, **context engineering**, and **fine-tuning**.

## Learning Objectives

- Engineer a **system prompt** that defines Cora's personality and rules.
- Use **context engineering** to ground responses in Zava DIY's product catalog.
- **Fine-tune** gpt-4.1-mini by distilling knowledge from gpt-4.1.

## Prerequisites

| Requirement | Details |
|---|---|
| Task 3 complete | gpt-4.1 deployed and tested |
| Fine-tuning quota | For gpt-4.1-mini fine-tuning (Task 04c only) |

## Concepts

### The Customization Spectrum

Model customization is a spectrum from simple to complex:

```
Prompt Engineering → Context Engineering → Fine-Tuning → Pre-Training
  (minutes)            (hours)              (hours–days)    (weeks)
  (no cost)            (low cost)           (medium cost)   (high cost)
```

For most use cases, you'll use the first two. Fine-tuning is for when you need to **distill** a larger model's behavior into a smaller, cheaper one.

### Level 1: Prompt Engineering

A **system prompt** defines the model's persona, rules, and response format. This is the fastest way to customize behavior — no training required.

```typescript
const systemPrompt = `You are Cora, the friendly AI assistant for Zava DIY.
Rules:
1. Always reference specific products by name, SKU, and price.
2. Keep responses under 150 words.
3. Never discuss topics outside home improvement.`;
```

### Level 2: Context Engineering

**Context engineering** injects relevant data into the prompt at runtime. For Cora, this means searching the product catalog and including matching products in the system prompt.

```
Customer: "What paint for my bathroom?"
    ↓ search catalog
Context: [Interior Semi-Gloss ($47), Zero VOC ($52)]
    ↓ inject into prompt
Model: "I recommend Interior Semi-Gloss (SKU: PFIP000003, $47)…"
```

### Level 3: Fine-Tuning for Distillation

**Distillation** fine-tunes a smaller model (gpt-4.1-mini) using high-quality responses from a larger model (gpt-4.1). The result: a cheaper model that behaves like the expensive one.

The training data format is JSONL with chat messages:

```json
{"messages": [
  {"role": "system", "content": "You are Cora…"},
  {"role": "user", "content": "What paint for my ceiling?"},
  {"role": "assistant", "content": "I recommend Premium Interior Latex Flat (SKU: PFIP000001, $40)…"}
]}
```

## Hands-On Steps

### Step 1 — Prompt Engineering (04a)

Run the prompt engineering script to test Cora's system prompt:

```bash
npm run build
node dist/04a-prompt-engineering.js
```

Notice how Cora responds in character but gives **generic** product advice (she doesn't know the actual catalog).

### Step 2 — Context Engineering (04b)

Run the context engineering script to ground responses in real product data:

```bash
node dist/04b-context-engineering.js
```

Now Cora references **specific Zava DIY products** with real SKUs and prices!

### Step 3 — Fine-Tuning (04c)

> ⚠️ This step requires fine-tuning quota and takes time to complete.

Run the fine-tuning script to distill gpt-4.1 knowledge into gpt-4.1-mini:

```bash
node dist/04c-fine-tuning.js
```

The script uploads training data, creates a supervised fine-tuning job, and monitors progress.

> 🔗 See [labs/ui/04-customization.md](../labs/ui/04-customization.md) for the portal walkthrough.

## Checkpoint

✅ You should now have:

- [ ] A system prompt that defines Cora's persona and rules
- [ ] Context engineering that grounds responses in the product catalog
- [ ] (Optional) A fine-tuned gpt-4.1-mini model with Zava DIY knowledge

## Summary

You've customized the model at three levels: prompt engineering for persona, context engineering for product grounding, and fine-tuning for cost optimization. Next, you'll build Cora as a full **AI agent** with tools and conversation management.

---

**[← Task 3: Selection](./03-selection.md)** | **Next → [Task 5: Designing the AI Agent](./05-agent.md)**