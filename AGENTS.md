# Agents

This repository includes custom GitHub Copilot agents to help learners navigate the workshop and troubleshoot issues.

## Repository Overview

This workshop teaches developers how to build AI agents end-to-end on Microsoft Foundry. Each task (02–09) has three components:

| Path | Description |
|---|---|
| `docs/01–09` | Educational guides with concepts, learning objectives, and hands-on steps |
| `labs/js/` | **TypeScript labs** — primary code path using `@azure/ai-projects` v2-beta SDK |
| `labs/py/` | **Python labs** — equivalent implementations using `azure-ai-projects==2.0.0b3` |
| `labs/ui/` | **Portal walkthroughs** — step-by-step Foundry Portal guides with screenshot placeholders |
| `docs/data/` | Shared data files — product catalog, eval conversations, fine-tuning data, red-team prompts |

## Available Agents

| Agent | Scope | How to invoke |
|---|---|---|
| **JS-Buildathon-Agent** | TypeScript labs (`labs/js/`) + Portal UI (`labs/ui/`) | `@JS-Buildathon-Agent` in Copilot Chat |
| **PY-Buildathon-Agent** | Python labs (`labs/py/`) | `@PY-Buildathon-Agent` in Copilot Chat |
| **UI-Buildathon-Agent** | Portal walkthroughs (`labs/ui/`) | `@UI-Buildathon-Agent` in Copilot Chat |

## Usage

In GitHub Copilot Chat (VS Code or Codespaces), mention the agent by name:

```
@JS-Buildathon-Agent I'm getting an error when running 05b-run-agent.ts
@PY-Buildathon-Agent How do I set up the Python environment?
@UI-Buildathon-Agent Walk me through deploying a model in the Portal
```

Each agent is scoped to a specific learning path and will only provide guidance for that path. Pick the agent that matches how you want to work through the quest.

## Documentation & Links

When providing links or references to Microsoft Foundry documentation, agents should use the **Microsoft Docs MCP server** (`microsoft-docs`) to search for and fetch up-to-date documentation. This ensures all links are current and accurate rather than hardcoded URLs that may go stale.

Available MCP tools:
- `microsoft_docs_search` — Search official Microsoft/Azure documentation by topic
- `microsoft_docs_fetch` — Fetch full content from a Microsoft Learn documentation page
- `microsoft_code_sample_search` — Search for official code samples by SDK, method, or pattern
