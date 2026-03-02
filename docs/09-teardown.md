# 9. Tear It Down

You've completed the full developer journey! Before you go, let's clean up the Azure resources created during this quest to avoid unnecessary charges.

## Learning Objectives

- Identify all resources created during the quest.
- Clean up agents, deployments, and project resources.
- Understand what to keep vs. what to delete.

## What Was Created

During this quest, you created:

| Resource | Task | Clean Up |
|---|---|---|
| Foundry Project | Task 2 | Keep or delete |
| gpt-4.1 deployment | Task 3 | Delete if not needed |
| Fine-tuned model | Task 4 (optional) | Delete if not needed |
| Cora agent versions | Task 5 | Auto-cleaned by script |
| Evaluation runs | Task 6 | Auto-cleaned by script |
| Telemetry data | Task 7 | Retained in App Insights |
| Red Team scans | Task 8 | Retained for reference |

## Hands-On Steps

### Step 1 — Run the Teardown Script

```bash
npm run build
node dist/09-teardown.js
```

This deletes agent versions and lists remaining resources that need manual cleanup.

### Step 2 — Manual Cleanup (Portal)

For resources that can't be deleted via SDK:

1. **Model deployments** — Foundry Portal → Models + endpoints → Delete each deployment.
2. **Foundry project** — Azure Portal → Resource groups → Delete the resource group.
3. **Application Insights** — Delete if no longer needed.

> 🔗 See [labs/ui/09-teardown.md](../labs/ui/09-teardown.md) for the portal walkthrough.

## Checkpoint

✅ Verify cleanup:

- [ ] Agent versions deleted
- [ ] Model deployments removed (or kept intentionally)
- [ ] No unexpected charges in your Azure subscription

## 🎉 Congratulations!

You've completed Quest 2 — the end-to-end developer journey with Microsoft Foundry!

### What You Accomplished

1. **Model Selection** — Chose gpt-4.1 from the catalog using benchmarks.
2. **Model Customization** — Engineered prompts, grounded in product data, fine-tuned to gpt-4.1-mini.
3. **Agent Design** — Built Cora with function tools and conversation management.
4. **Evaluation** — Measured quality and safety with built-in evaluators.
5. **Tracing** — Instrumented execution with OpenTelemetry.
6. **Red-Teaming** — Tested against adversarial attacks.

### Next Steps

Now, think about how to apply these skills to your own projects:

1. **Write a custom evaluator** — What metrics matter for your use case?
2. **Extend Cora's tools** — Add inventory management, order tracking, or return policies.
3. **Fine-tune with your data** — Use real customer conversations for better distillation.
4. **Deploy to production** — Add content filtering, rate limiting, and monitoring.

---

**[← Task 8: Red-Teaming](./08-red-teaming.md)** | **← Back to [README](../README.md)**