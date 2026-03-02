# 2. Setup The Foundry Project

In this task you'll create a Microsoft Foundry project, configure authentication, and verify that your development environment can talk to the cloud.

## Learning Objectives

By the end of this task you will be able to:

- Explain what a Microsoft Foundry **project** is and how it organizes AI resources.
- Authenticate using **Entra ID** (`DefaultAzureCredential`) instead of API keys.
- List project **connections** and **model deployments** programmatically.

## Prerequisites

| Requirement | Details |
|---|---|
| Azure subscription | With Foundry Models quota enabled |
| Azure CLI | Logged in (`az login`) |
| Node.js ≥ 20 | Installed via devcontainer |
| Labs dependencies | `cd labs/js && npm install` |

## Concepts

### What Is a Foundry Project?

A **Foundry project** is the top-level container inside Microsoft Foundry. It groups together:

- **Model deployments** — the AI models you've deployed (e.g., gpt-4.1).
- **Connections** — links to Azure OpenAI, Azure AI Search, storage, and other services.
- **Agents** — the intelligent assistants you build (we'll create Cora later!).
- **Evaluations & Traces** — quality and observability data.

Every SDK call starts with the **project endpoint**, which looks like:

```
https://<account>.services.ai.azure.com/api/projects/<project>
```

### Authentication: Entra ID vs API Keys

Microsoft Foundry supports two authentication methods:

| Method | When to use |
|---|---|
| `DefaultAzureCredential` (Entra ID) | ✅ Recommended. Uses your Azure login, managed identity, or service principal. |
| API key | Quick demos only. Not recommended for production. |

The SDK makes Entra ID easy:

```typescript
import { AIProjectClient } from "@azure/ai-projects";
import { DefaultAzureCredential } from "@azure/identity";

const project = new AIProjectClient(endpoint, new DefaultAzureCredential());
```

## Hands-On Steps

### Step 1 — Create Your Foundry Project in the Portal

The Foundry project must be created through the [Foundry Portal](https://ai.azure.com) so the SDK data plane can access it.

1. Open [ai.azure.com](https://ai.azure.com) and sign in with your Azure account
2. Click **+ Create project**
3. Create a new **AI Services** resource (or select an existing one):
   - Kind: **AI Services**
   - Enable **project management**
   - Choose a region (e.g., `swedencentral`)
4. Name your project and click **Create**
5. Once created, deploy models from the **Model catalog**:
   - **gpt-4.1** (GlobalStandard SKU, capacity 10K TPM)
   - **gpt-4.1-mini** (GlobalStandard SKU, capacity 10K TPM)
6. Add an **Application Insights** resource for tracing (Task 7):
   - In the Portal, go to your project → **Settings** → **Tracing**
   - Click **Connect** and create a new Application Insights resource
   - Or create one in [Azure Portal](https://portal.azure.com) → **Create a resource** → **Application Insights** in the same resource group

> 🔗 See [labs/ui/02-setup.md](../labs/ui/02-setup.md) for a step-by-step portal walkthrough with screenshots.

### Step 2 — Populate `.env` with the Setup Script

Once your project exists in the Portal, run the setup script to auto-detect all configuration:

```bash
./labs/scripts/setup-env.sh
```

Choose **(B)** and enter your resource group name. The script discovers:

| Value | Source |
|---|---|
| Project endpoint | From Foundry project listing |
| Model deployment name | First GPT deployment found |
| Model endpoint | Built from AI Services account |
| API key | From AI Services account keys |
| App Insights connection string | From Application Insights resource |
| Subscription / RG / Account | From resource group metadata |

It writes `.env` to both `labs/js/` and `labs/py/`.

> 💡 **Manual alternative:** `cd labs/js && cp sample.env .env` — then fill in values from the Portal.

### Step 3 — Verify Your Setup

Build and run:

```bash
cd labs/js
npm run build
node dist/02-setup.js
```

You should see a checklist of environment variables followed by:

```
✅ Foundry project is reachable and responding.
🎉 Setup verified — you're ready for Quest 2!
```

## Checkpoint

✅ You should now have:

- [ ] A Foundry project created in the Portal with gpt-4.1 and gpt-4.1-mini deployed
- [ ] A `.env` file auto-populated by the setup script
- [ ] The verification script (`02-setup.js`) runs without errors

## Summary

You've connected to Microsoft Foundry using `AIProjectClient` with Entra ID authentication. Your environment is configured and ready for the next task: **selecting a base model** for Cora, the Zava DIY AI agent.

---

**[← Task 1: Overview](./01-overview.md)** | **Next → [Task 3: Selecting a Base Model](./03-selection.md)**