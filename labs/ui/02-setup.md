# Task 2: Setting Up a Foundry Project — Portal Walkthrough

This guide walks you through creating and configuring a Microsoft Foundry project using the Azure portal and Foundry Portal UI.

## Step 1 — Create a Foundry Project

1. Navigate to [ai.azure.com](https://ai.azure.com) and sign in with your Azure account.
2. Click **+ New project** from the home page.
3. Enter a **project name** (e.g., `zava-diy-quest2`).
4. Select or create a **resource group** and **region**.

5. Click **Create** and wait for provisioning to complete.

![Step 1 — Create project](../docs/assets/02/create-project.png)

> **What you should see:** A project overview page with your project name, endpoint, and resource details.

## Step 2 — Find Your Project Endpoint

1. From your project overview, locate the **Project endpoint** field.
2. It should look like: `https://<account>.services.ai.azure.com/api/projects/<project>`
3. Copy this value — you'll need it for your `.env` file.

![Step 2 — Project endpoint](../docs/assets/02/project-endpoint.png)

## Step 3 — View Connections

1. In the left navigation, click **Management** → **Connections**.
2. You should see at least one connection of type **AzureOpenAI**.
3. Note the connection name and target endpoint.

![Step 3 — Connections](../docs/assets/02/connections-list.png)

> **What you should see:** A list of connections showing their name, type, and target URL.

## Step 4 — View Deployments

1. In the left navigation, click **Models + endpoints** → **Deployments**.
2. If you haven't deployed any models yet, this list will be empty (we'll deploy in Task 3).
3. If you already have deployments, note the deployment name and model.

![Step 4 — Deployments](../docs/assets/02/deployments-list.png)

## Step 5 — Test the Playground

1. Click **Playgrounds** → **Chat** in the left navigation.
2. Select a deployed model (if available).
3. Type a test message: "Hello, what can you help me with?"
4. Verify you get a response.

![Step 5 — Playground test](../docs/assets/02/playground-test.png)

> **What you should see:** A chat response from the model in the playground.

## Checkpoint

✅ You should now have:

- [ ] A Foundry project created in the portal
- [ ] Your project endpoint copied
- [ ] Connections visible in the portal
- [ ] (Optional) A working playground chat

---

**Next → [Task 3: Selecting a Base Model](../docs/03-selection.md)**
