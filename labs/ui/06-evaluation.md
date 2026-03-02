# Task 6: Evaluating the Agent — Portal Walkthrough

This guide walks you through running evaluations on Cora using the Foundry Portal.

## Step 1 — Navigate to Evaluations

1. Open [ai.azure.com](https://ai.azure.com) → your project.
2. Click **Evaluation** in the left navigation.
3. Click **+ New evaluation**.

![Step 1 — Evaluations](../docs/assets/06/evaluations-page.png)

> **What you should see:** The evaluation configuration page.

## Step 2 — Configure the Evaluation

1. **Name**: Enter `cora-quality-eval`.
2. **Model**: Select your **gpt-4.1** deployment (used by AI-assisted evaluators).
3. **Evaluators**: Select:
   - ✅ Violence (safety)
   - ✅ Coherence (quality)
   - ✅ F1 Score (quality)

![Step 2 — Evaluator selection](../docs/assets/06/evaluator-selection.png)

## Step 3 — Upload Test Data

1. Click **Upload data**.
2. Upload `docs/data/conversations.jsonl`.
3. Map the fields:
   - `query` → Query
   - `response` → Response
   - `context` → Context
   - `ground_truth` → Ground Truth

![Step 3 — Data upload](../docs/assets/06/data-upload.png)

> **What you should see:** The data preview showing your conversation samples.

## Step 4 — Run the Evaluation

1. Click **Run evaluation**.
2. Wait for the evaluation to complete (this may take a few minutes).
3. Monitor the progress bar.

![Step 4 — Running](../docs/assets/06/evaluation-running.png)

## Step 5 — Review Results Dashboard

1. Once complete, click **View results**.
2. Review the scores for each evaluator:
   - **Violence**: Should be very low (0 = safe)
   - **Coherence**: Higher is better (1–5 scale)
   - **F1 Score**: Measures overlap with ground truth
3. Click individual rows to see per-conversation scores.

![Step 5 — Results dashboard](../docs/assets/06/results-dashboard.png)

> **What you should see:** An evaluation report with aggregate scores and per-item breakdowns.

## Checkpoint

✅ You should now have:

- [ ] An evaluation run completed in the portal
- [ ] Scores for violence, coherence, and F1
- [ ] Per-conversation score breakdowns

---

**Next → [Task 7: Tracing the Agent](../docs/07-tracing.md)**
