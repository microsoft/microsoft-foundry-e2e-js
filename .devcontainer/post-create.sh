#!/bin/bash
set -e

echo "Upgrading Azure CLI to latest version..."
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

echo "Installing GitHub Copilot CLI..."
npm install -g @github/copilot

echo "Installing the Microsoft Foundry SDK ..."
cd labs/js && npm install
cd ../..

echo "Installing Python dependencies ..."
cd labs/py && pip install -r requirements.txt --quiet
cd ../..

echo "Post-create setup complete."