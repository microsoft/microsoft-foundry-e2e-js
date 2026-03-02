# 6. Evaluate Your AI Agent

Cora is up and running, but how do you know her responses are **safe** and **high-quality**? In this task you'll use Foundry's built-in evaluators to measure Cora's performance systematically.

## Learning Objectives

- Understand the difference between **quality** and **safety** evaluators.
- Run **batch evaluations** with the OpenAI-compatible Evals API.
- Interpret evaluation **scores and reports**.

## Prerequisites

| Requirement | Details |
|---|---|
| Task 5 complete | Cora agent created and tested |
| Conversation data | `docs/data/conversations.jsonl` (provided) |

## Concepts

### Why Evaluate?

Manual testing ("it seems fine") doesn't scale. Evaluations give you **quantitative scores** across hundreds of conversations, catching issues you'd miss manually.

### Built-In Evaluators

Foundry provides evaluators out of the box:

| Evaluator | Type | What It Measures |
|---|---|---|
| `builtin.violence` | Safety | Does the response contain violent content? |
| `builtin.coherence` | Quality | Is the response logically coherent? |
| `builtin.f1_score` | Quality | How well does the response match the ground truth? |
| `builtin.groundedness` | Quality | Is the response grounded in the provided context? |

### Evaluation Data Format

Each evaluation item needs:

```json
{
  "query": "What paint for my bathroom?",
  "response": "I recommend Interior Semi-Gloss…",
  "context": "Products: Interior Semi-Gloss ($47)…",
  "ground_truth": "Recommend moisture-resistant paint…"
}
```

### The Evaluation Flow

```
Create Eval → Define Evaluators → Run with Data → Poll → View Results
```

## Hands-On Steps

### Step 1 — Review the Test Data

Open `docs/data/conversations.jsonl` to see the 12 Zava DIY conversation samples with query, response, context, and ground truth.

### Step 2 — Run the Evaluation

```bash
npm run build
node dist/06-evaluation.js
```

The script creates an evaluation with Violence, Coherence, and F1 Score evaluators, runs it with the conversation data, and displays results.

### Step 3 — Review Results

Look at the output for each conversation:
- **Violence score** — should be very low (0 = safe).
- **Coherence score** — higher is better (1–5 scale).
- **F1 score** — measures overlap with ground truth.

> 🔗 See [labs/ui/06-evaluation.md](../labs/ui/06-evaluation.md) for the portal walkthrough.

## Checkpoint

✅ You should now have:

- [ ] An evaluation run with built-in evaluators
- [ ] Scores for violence, coherence, and F1
- [ ] An understanding of which conversations scored well and which need improvement

## Summary

You've evaluated Cora's responses for quality and safety using Foundry's built-in evaluators. Next, you'll **trace** her agent execution to understand performance characteristics like latency and token usage.

---

**[← Task 5: Agent](./05-agent.md)** | **Next → [Task 7: Tracing the Agent](./07-tracing.md)**