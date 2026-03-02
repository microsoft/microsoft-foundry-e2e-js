# 7. Trace Your AI Agent

When Cora is in production, you need visibility into **what's happening under the hood**: how long each call takes, how many tokens are used, and where errors occur. That's what tracing is for.

## Learning Objectives

- Set up **Azure Monitor OpenTelemetry** with Foundry.
- Create custom **spans** for agent operations.
- Analyze traces for **latency**, **token usage**, and **errors**.

## Prerequisites

| Requirement | Details |
|---|---|
| Task 5 complete | Cora agent working |
| Application Insights | Connection string in `.env` (`TELEMETRY_CONNECTION_STRING`) |

## Concepts

### What Is Tracing?

Tracing captures the **full execution flow** of an agent interaction:

```
Customer Message
  └─ Agent Span (total: 2.3s)
       ├─ Tool Call: search_products (0.1s)
       ├─ Model Call: gpt-4.1 (1.8s, 450 tokens)
       └─ Response Generation (0.4s)
```

### Azure Monitor OpenTelemetry

Foundry integrates with OpenTelemetry via `@azure/monitor-opentelemetry`:

1. **Initialize** — `useAzureMonitor()` before any SDK imports.
2. **Create a tracer** — `trace.getTracer("my-app")`.
3. **Wrap operations** — `tracer.startActiveSpan("operation", async (span) => { ... })`.
4. **Shutdown** — `shutdownAzureMonitor()` to flush pending data.

### Gen AI Semantic Conventions

Use these span attributes to enable Foundry-specific filtering:

```typescript
{
  "gen_ai.system": "az.ai.agents",
  "gen_ai.provider.name": "microsoft.agents",
  "model": deploymentName,
}
```

## Hands-On Steps

### Step 1 — Configure Application Insights

Set `TELEMETRY_CONNECTION_STRING` in your `.env` file. You can find this in Azure Portal → Application Insights → Overview → Connection String.

### Step 2 — Run the Tracing Script

```bash
npm run build
node dist/07-tracing.js
```

The script creates a traced agent, runs an inference with custom spans, and sends telemetry to Application Insights.

### Step 3 — View Traces in Azure Portal

1. Open Azure Portal → Application Insights → **Transaction search**.
2. Filter by custom dimension: `gen_ai.system = "az.ai.agents"`.
3. Click into a trace to see the span waterfall.

> 🔗 See [labs/ui/07-tracing.md](../labs/ui/07-tracing.md) for the portal walkthrough.

## Checkpoint

✅ You should now have:

- [ ] Telemetry flowing to Application Insights
- [ ] Custom spans for agent create + inference operations
- [ ] Traces visible in the Azure Portal

## Summary

You've instrumented Cora with OpenTelemetry tracing, giving you visibility into latency, token usage, and errors. Next, you'll **red-team** Cora to test her defenses against adversarial attacks.

---

**[← Task 6: Evaluation](./06-evaluation.md)** | **Next → [Task 8: Red-Teaming the Agent](./08-red-teaming.md)**