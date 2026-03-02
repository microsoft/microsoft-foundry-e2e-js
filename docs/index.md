# The AI Engineer's Journey With Microsoft Foundry

Welcome to **Quest 2** — Building AI Agents End-to-End on Microsoft Foundry! In this hands-on workshop you'll build **Cora**, an AI customer service agent for Zava DIY, a fictitious home improvement store.

## Quickstart

Follow these steps to get your development environment ready and start the quest.

### 1. Fork the Repository

Click the **Fork** button at the top-right of the GitHub page to create your own copy:

> [github.com/nitya/microsoft-foundry-e2e-js](https://github.com/nitya/microsoft-foundry-e2e-js) → **Fork**

### 2. Launch GitHub Codespaces

From **your fork**, click the green **Code** button → **Codespaces** → **Create codespace on main**.

This spins up a fully configured dev container with:
- ✅ Node.js 20+ and TypeScript
- ✅ Azure CLI (pre-authenticated if you're signed in)
- ✅ GitHub Copilot CLI
- ✅ All npm dependencies installed automatically

> ⏳ The first launch takes 1–2 minutes while the container builds and runs `post-create.sh`.

### 3. Sign In to Azure

Once the Codespace is ready, open the terminal and sign in:

```bash
az login
```

You'll need an Azure subscription with **Microsoft Foundry Models quota** enabled.

### 4. Create Your Foundry Project

Create your Azure resources in the [Foundry Portal](https://ai.azure.com):

1. Open [ai.azure.com](https://ai.azure.com) and sign in with your Azure account
2. Click **+ Create project**
3. Create or select an **AI Services** resource (with project management enabled)
4. Deploy **gpt-4.1** and **gpt-4.1-mini** models (GlobalStandard SKU)
5. Add an **Application Insights** resource for tracing (project Settings → Tracing → Connect)

> 🔗 See [Task 2: Setup](./02-setup.md) for a detailed walkthrough with screenshots.

### 5. Configure Your Environment

Once your Foundry project exists in the Portal, run the setup script to auto-populate `.env`:

```bash
./labs/scripts/setup-env.sh
```

Choose **(B)** and enter your resource group name. The script auto-detects your AI Services account, project endpoint, model deployments, API key, and Application Insights connection string — then writes `.env` for both `labs/js/` and `labs/py/`.

> 💡 You can also configure manually: `cd labs/js && cp sample.env .env` and edit the values.

### 6. Verify Your Setup

```bash
cd labs/js
npm run build
node dist/02-setup.js
```

If you see `🎉 Setup verified — you're ready for Quest 2!` then you're good to go.

### 6. Start the Quest!

Work through the tasks in order. Each task has three components:

| Component | Location | Description |
|---|---|---|
| 📖 **Guide** | `docs/0X-*.md` | Concepts, learning objectives, and hands-on steps |
| 💻 **Code (TypeScript)** | `labs/js/src/0X-*.ts` | TypeScript scripts to build and run |
| 🖥️ **Portal** | `labs/ui/0X-*.md` | Step-by-step Foundry Portal walkthrough |

> 🐍 **Python developers:** Equivalent Python scripts are available in `labs/py/` for reference. Run them with `cd labs/py && cp sample.env .env && python 02_setup.py`. The workshop guides focus on TypeScript, but the Python code follows the same structure and SDK patterns.

**Quest tasks:**

1. [Understand Foundry capabilities](./01-overview.md) ✅
2. [Setting up a Foundry project](./02-setup.md)
3. [Selecting a base model](./03-selection.md)
4. [Customizing the base model](./04-customization.md)
5. [Designing the AI Agent](./05-agent.md)
6. [Evaluating the agent responses](./06-evaluation.md)
7. [Tracing the agent execution](./07-tracing.md)
8. [Running a Red-Teaming scan](./08-red-teaming.md)
9. [Teardown and cleanup](./09-teardown.md)

## Prerequisites

| Requirement | Details |
|---|---|
| **GitHub account** | To fork the repo and use Codespaces |
| **Azure subscription** | With Foundry Models quota enabled |
| **Browser** | For Codespaces and the Foundry Portal at [ai.azure.com](https://ai.azure.com) |

> 💡 **No local setup required!** Everything runs in GitHub Codespaces. Just fork, launch, and go.