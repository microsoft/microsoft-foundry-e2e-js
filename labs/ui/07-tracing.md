# Task 7: Tracing the Agent — Portal Walkthrough

This guide walks you through viewing agent traces in Azure Portal using Application Insights.

## Step 1 — Open Application Insights

1. Open [portal.azure.com](https://portal.azure.com).
2. Navigate to your **Application Insights** resource (created with your Foundry project or separately).
3. Click **Transaction search** in the left navigation.

![Step 1 — Application Insights](../docs/assets/07/app-insights.png)

## Step 2 — Find Agent Traces

1. In the search bar, filter by:
   - **Event type**: Request, Dependency
   - **Custom property**: `gen_ai.system = "az.ai.agents"`
2. You should see traces from the `07-tracing.ts` script.

![Step 2 — Transaction search](../docs/assets/07/transaction-search.png)

> **What you should see:** Trace entries with names like "cora.agent.create" and "cora.inference".

## Step 3 — Analyze a Trace

1. Click on a trace entry to see the **end-to-end transaction**.
2. View the span waterfall:
   - Parent span: `cora.agent.create`
   - Child span: `agents.createVersion`
   - Child span: `cora.inference`
3. Check the **duration** of each span to identify bottlenecks.

![Step 3 — Span waterfall](../docs/assets/07/span-waterfall.png)

> **What you should see:** A timeline showing nested spans with their durations and attributes.

## Step 4 — View Span Attributes

1. Click on an individual span.
2. Review the custom attributes:
   - `model`: The deployment name
   - `agent.name`: The agent name
   - `agent.version`: The agent version
   - `response.length`: Length of the generated response

![Step 4 — Span attributes](../docs/assets/07/span-attributes.png)

## Step 5 — Set Up Alerts (Optional)

1. Navigate to **Alerts** in Application Insights.
2. Create a new alert rule:
   - **Signal**: Custom metric or log query
   - **Condition**: e.g., average duration > 5 seconds
   - **Action**: Send email or trigger webhook

![Step 5 — Alerts](../docs/assets/07/alerts.png)

## Checkpoint

✅ You should now have:

- [ ] Traces visible in Application Insights
- [ ] Span waterfall showing agent execution flow
- [ ] Understanding of latency per operation

---

**Next → [Task 8: Red-Teaming the Agent](../docs/08-red-teaming.md)**
