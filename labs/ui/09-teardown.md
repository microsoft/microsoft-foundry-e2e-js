# Task 9: Teardown and Cleanup — Portal Walkthrough

This guide walks you through cleaning up the resources created during Quest 2.

## Step 1 — Delete Agent Versions

1. Open [ai.azure.com](https://ai.azure.com) → your project.
2. Navigate to **Agents**.
3. Find `cora-zava-diy` in the agent list.
4. Click the **⋮** menu → **Delete**.
5. Repeat for any other agents created (e.g., `cora-traced-agent`).

![Step 1 — Delete agents](../docs/assets/09/delete-agents.png)

> **What you should see:** The agent removed from the list.

## Step 2 — Delete Model Deployments

1. Navigate to **Models + endpoints** → **Deployments**.
2. For each deployment you want to remove:
   - Click the deployment name.
   - Click **Delete deployment**.
   - Confirm deletion.
3. Keep any deployments you want to continue using.

![Step 2 — Delete deployments](../docs/assets/09/delete-deployments.png)

## Step 3 — Delete Fine-Tuned Models (Optional)

1. If you created fine-tuned models in Task 4:
   - Navigate to **Fine-tuning** → **Jobs**.
   - Find your completed job.
   - Click the **⋮** menu → **Delete model**.

![Step 3 — Delete fine-tuned model](../docs/assets/09/delete-fine-tuned.png)

## Step 4 — Delete the Foundry Project (Optional)

If you want to completely remove all resources:

1. Open [portal.azure.com](https://portal.azure.com).
2. Navigate to **Resource groups**.
3. Find the resource group containing your Foundry project.
4. Click **Delete resource group**.
5. Type the resource group name to confirm.

![Step 4 — Delete resource group](../docs/assets/09/delete-resource-group.png)

> ⚠️ **Warning:** This deletes ALL resources in the resource group, not just the Foundry project.

## Step 5 — Verify Cleanup

1. Check **Cost Management** in Azure Portal.
2. Verify no unexpected charges are accruing.
3. Confirm deleted resources no longer appear.

![Step 5 — Verify cleanup](../docs/assets/09/verify-cleanup.png)

## 🎉 Quest Complete!

Congratulations on completing Quest 2! You've experienced the full end-to-end developer journey with Microsoft Foundry:

1. ✅ Set up a Foundry project
2. ✅ Selected and deployed a model
3. ✅ Customized with prompts, context, and fine-tuning
4. ✅ Built an AI agent with tools
5. ✅ Evaluated response quality and safety
6. ✅ Traced agent execution
7. ✅ Red-teamed for vulnerabilities
8. ✅ Cleaned up resources

---

**← Back to [README](../README.md)**
