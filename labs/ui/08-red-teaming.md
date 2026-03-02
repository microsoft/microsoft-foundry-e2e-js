# Task 8: Red-Teaming the Agent — Portal Walkthrough

This guide walks you through running a red-teaming scan using the Foundry Portal.

## Step 1 — Navigate to Safety Evaluation

1. Open [ai.azure.com](https://ai.azure.com) → your project.
2. Click **Evaluation** → **Red Teaming** in the left navigation.
3. Click **+ New scan**.

![Step 1 — Red teaming](../docs/assets/08/red-teaming-page.png)

## Step 2 — Configure the Scan

1. **Name**: Enter `cora-red-team`.
2. **Target**: Select your **gpt-4.1** deployment.
3. **Risk categories**: Select:
   - ✅ Violence
   - ✅ Hate/Unfairness
4. **Attack strategies**: Select:
   - ✅ Base64 encoding
   - ✅ Character flip

![Step 2 — Scan configuration](../docs/assets/08/scan-config.png)

> **What you should see:** Configuration form with risk categories and attack strategy options.

## Step 3 — Run the Scan

1. Click **Start scan**.
2. Wait for the scan to complete (this may take several minutes).
3. Monitor the progress indicator.

![Step 3 — Scan running](../docs/assets/08/scan-running.png)

## Step 4 — Review Findings

1. Once complete, review the results:
   - **Attack success rate** — percentage of attacks that bypassed safety guardrails.
   - **Per-category breakdown** — which risk categories had vulnerabilities.
   - **Individual findings** — specific prompts that succeeded.
2. Click on individual findings to see the attack prompt and model response.

![Step 4 — Scan results](../docs/assets/08/scan-results.png)

> **What you should see:** A results dashboard showing which attacks were blocked and which succeeded.

## Step 5 — Harden the Agent

Based on the findings:

1. Navigate to your deployment → **Content filters**.
2. Enable or strengthen content filters for identified risk categories.
3. Update Cora's system prompt with additional safety instructions.
4. Re-run the scan to verify improvements.

![Step 5 — Content filters](../docs/assets/08/content-filters.png)

## Checkpoint

✅ You should now have:

- [ ] A red-teaming scan completed
- [ ] Understanding of which attacks succeeded
- [ ] Content filters or safety prompts updated

---

**Next → [Task 9: Teardown and Cleanup](../docs/09-teardown.md)**
