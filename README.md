# Building AI Agents E2E On Microsoft Foundry

_The repository was setup for the [2026 JSBuildathon](https://developer.microsoft.com/en-us/reactor/events/26773/) and showcases the Microsoft Foundry UI and SDK for JS/TS developers. These are evolving rapidly, so you may encounter some breaking changes. If you do, please [file an issue](https://github.com/microsoft/microsoft-foundry-e2e-js/issues/new) and let us know._

> [!IMPORTANT]
> This quest has tasks for fine-tuning, red-teaming and evaluations that can incur non-trivial costs and time to complete on your own. In these cases, we have provided a _read-only_ version of the task where you can explore the code and execution results from a previous run, to familiarize yourself with the concept and workflow. You should be able to run the code if you choose to - but just be aware of the potential costs and remember to clean up the project to avoid additional charges.

<br/>

## What We'll Do

In a previous quest, you explored [Foundry Local](https://www.foundrylocal.ai/) and learned to deploy and explore large language models for **on-device** AI development.

In this quest, we move from local device to the cloud, and explore the end-to-end development journey for building & deploying AI agents using [Microsoft Foundry models](https://ai.azure.com/catalog)

- We'll start our journey at the new [Microsoft Foundry portal](https://ai.azure.com) - and use a low-code (UI-first) approach to setting up our Foundry project and deploy required models.
- Then, we'll move to our development environment - and use the _latest_ [Microsoft Foundry SDK](https://learn.microsoft.com/en-us/azure/foundry/quickstarts/get-started-code?tabs=typescript) to create agents, customize models, and evaluate our solutions for quality, safety and performance.

By completing the quest, you will learn how to:

1. Setup a new Microsoft Foundry project from scratch
1. Discover & compare Microsoft Foundry models in the UI
1. Deploy & use Microsoft Foundry models for inference
1. Create & test a simple AI agent with models and data
1. Customize the model with supervised fine-tuning
1. Evaluate your agent for quality, safety & performance
1. Assess vulnerability to attacks with red-teaming
1. Use Microsoft Foundry portal to monitor for insights

Most importantly, you will walk away with a sandbox you can use to continue exploring the platform on your own, with your own data or scenarios in mind.

<br/>

## What We'll Build

It helps to have a real-world scenario in mind as you walk through the quest. Imagine that you are an AI engineer working for _Zava_, a fictitious enterprise retail company selling products to DIY enthusiasts.

You have been asked to build _Cora_, a customer service AI agent that answers shoppers' questions about products in [this sample catalog](./docs/data/products.csv). Project Cora has three requirements:

1. **Be polite and helpful** in interactions. _Think about the response tone and format that the customer support agent should have_.
1. **Be cost-effective to operate**. _Think about system performance, and optimize for response latency, token costs and compute_.
1. **Be trustworthy** in responses. _Think about user experience, and ensuring our responses are safe, accurate, and performant_. 

You need to go from _planning_ ("I have product data") to _prototype_ ("I have a working agent!") to _production_ ("It's ready for real users!"). So, where do we start?


<br/>

## How We'll Build It

The Microsoft Foundry platform provides all the tools and capabilities (e.g., _Models, Agents, Evaluation, Tracng, Fine-Tuning_) that you need to build this solution end-to-end. And, it provides a _unified API_ as shown below, allowing you to access these features in multiple ways:

1. **Foundry portal** - for a UI-first low-code solution in the browser.
1. **Foundry SDK** - for a code-first solution using your favorite IDE.
1. **AI Toolkit** - for an VSCode-first experience that combines both.

In this quest we focus on (1) and (2) - and you'll get to explore (3) in a future quest in this series.

![API](./docs/assets/01/7-Foundry-API-SDK.png)


<br/>

## Getting Started

Click on [SETUP.md](./SETUP.md) and follow instructions to fork the repo, launch GitHub Codespaces, setup a Microsoft Foundry project - then complete coding tasks with the Microsoft Foundry SDK.

<br/>

## Recap & Next Steps

In this quest, you completed a speed run through the end-to-end development journey for building an AI agent using Microsoft Foundry models. You should now have an intuition for four key phases of your AI solution development workflows:

1. **Model Selection** - picking the right base model for your requirements
1. **Model Optimization** - fine-tuning the model to improve cost or behavior
1. **Observability** - tracing and evaluating models to assess performance
1. **Security** - running a red-teaming scan to assess vulnerability to attack

Use this repository as a sandbox to explore these ideas in more depth:

1. Write a custom evaluator - what are you measuring, and how?
1. Write custom prompts for red-teaming - what attacks worked?
1. Fine-tune your base model for a new behavior - what worked or didn't?

Remember that Microsoft Foundry provides a unified API that you can access via the Foundry Portal (UI-first, low-code) or Foundry SDK (code-first, language specific). Once you complete this quest, take a minute to explore the _Discover_, _Build_ and _Operate_ tabs in the portal, and build your intuition for what each does - and the additional features or tools you can unlock for your AI development.