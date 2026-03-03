#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Quest 2 — Environment Setup Script
#
# This script automates .env configuration for the workshop labs (JS & Python).
# It populates .env from an existing Foundry resource group.
#
# Prerequisites: Azure CLI (az) installed and logged in.
#
# Usage:
#   chmod +x labs/scripts/setup-env.sh
#   ./labs/scripts/setup-env.sh
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# Suppress Azure CLI warnings and only show errors
export AZURE_CORE_ONLY_SHOW_ERRORS=true

# ── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info()  { echo -e "${BLUE}ℹ️  $1${NC}"; }
ok()    { echo -e "${GREEN}✅ $1${NC}"; }
warn()  { echo -e "${YELLOW}⚠️  $1${NC}"; }
err()   { echo -e "${RED}❌ $1${NC}"; exit 1; }

# ── Find repo root ──────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

JS_DIR="$REPO_ROOT/labs/js"

# ── Step 0: Check Azure CLI login ──────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 Quest 2 — Environment Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if ! command -v az &> /dev/null; then
  err "Azure CLI (az) not found. Install it: https://aka.ms/install-azure-cli"
fi

info "Checking Azure CLI login status…"
if ! az account show &> /dev/null; then
  warn "Not logged in. Running 'az login'…"
  az login --use-device-code || err "Azure login failed."
fi

# Enable auto-install of CLI extensions and allow preview extensions
az config set extension.use_dynamic_install=yes_without_prompt 2>/dev/null || true
az config set extension.dynamic_install_allow_preview=true 2>/dev/null || true

ACCOUNT_NAME=$(az account show --query "user.name" -o tsv 2>/dev/null || echo "unknown")
SUBSCRIPTION_ID=$(az account show --query "id" -o tsv)
SUBSCRIPTION_NAME=$(az account show --query "name" -o tsv)
ok "Logged in as: $ACCOUNT_NAME"
ok "Subscription: $SUBSCRIPTION_NAME ($SUBSCRIPTION_ID)"
echo ""

# ── Step 1: Get existing resource group ───────────────────────────────────
echo ""
read -rp "Existing resource group name: " RESOURCE_GROUP
if [[ -z "$RESOURCE_GROUP" ]]; then
  err "Resource group name is required."
fi

# Verify resource group exists
if ! az group show --name "$RESOURCE_GROUP" &> /dev/null; then
  err "Resource group '$RESOURCE_GROUP' not found in subscription."
fi
ok "Resource group '$RESOURCE_GROUP' found."
echo ""

# ── Step 2: Retrieve all configuration values ──────────────────────────────
info "Retrieving configuration from resource group: $RESOURCE_GROUP…"
echo ""

# Find AI Services account
AI_ACCOUNT_NAME=$(az cognitiveservices account list \
  --resource-group "$RESOURCE_GROUP" \
  --query "[?kind=='AIServices'].name | [0]" -o tsv 2>/dev/null || echo "")

if [[ -z "$AI_ACCOUNT_NAME" ]]; then
  # Fallback: try OpenAI kind
  AI_ACCOUNT_NAME=$(az cognitiveservices account list \
    --resource-group "$RESOURCE_GROUP" \
    --query "[0].name" -o tsv 2>/dev/null || echo "")
fi

if [[ -z "$AI_ACCOUNT_NAME" ]]; then
  err "No AI Services / Cognitive Services account found in $RESOURCE_GROUP."
fi
ok "AI account: $AI_ACCOUNT_NAME"

# Get Foundry API endpoint (used for PROJECT_ENDPOINT detection)
AI_ENDPOINT=$(az cognitiveservices account show \
  --name "$AI_ACCOUNT_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query 'properties.endpoints."AI Foundry API"' -o tsv 2>/dev/null || echo "")
AI_ENDPOINT="${AI_ENDPOINT%/}"

# Build MODEL_ENDPOINT (OpenAI-compatible endpoint for red-teaming)
# Format: https://<account>.cognitiveservices.azure.com/openai/deployments/<model>/chat/completions?api-version=2024-05-01-preview
MODEL_ENDPOINT="https://${AI_ACCOUNT_NAME}.cognitiveservices.azure.com/openai/deployments/gpt-4.1/chat/completions?api-version=2024-05-01-preview"
ok "AI endpoint: $AI_ENDPOINT"
ok "Model endpoint: $MODEL_ENDPOINT"

# Get API key
API_KEY=$(az cognitiveservices account keys list \
  --name "$AI_ACCOUNT_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query "key1" -o tsv 2>/dev/null || echo "")
if [[ -n "$API_KEY" ]]; then
  ok "API key: retrieved ✓"
else
  warn "Could not retrieve API key."
fi

# Discover project endpoint (skip if already set by Mode A)
if [[ -z "${PROJECT_ENDPOINT:-}" ]]; then
  PROJECT_ENDPOINT=""

  # Use native az CLI to list projects under the AI Services account
  info "Looking for Foundry projects…"
  PROJECT_ENDPOINTS=$(az cognitiveservices account project list \
    --name "$AI_ACCOUNT_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --query '[].properties.endpoints."AI Foundry API"' -o tsv 2>/dev/null || echo "")

  if [[ -n "$PROJECT_ENDPOINTS" ]]; then
    PROJECT_COUNT=$(echo "$PROJECT_ENDPOINTS" | wc -l)
    if [[ "$PROJECT_COUNT" -eq 1 ]]; then
      PROJECT_ENDPOINT=$(echo "$PROJECT_ENDPOINTS" | head -1)
      ok "Project found: $PROJECT_ENDPOINT"
    else
      echo "   Multiple projects found:"
      echo "$PROJECT_ENDPOINTS" | while read -r p; do echo "     • $p"; done
      read -rp "   Enter full project endpoint to use: " PROJECT_ENDPOINT
    fi
  else
    # Fallback: construct from Foundry API host
    FOUNDRY_HOST=$(az cognitiveservices account show \
      --name "$AI_ACCOUNT_NAME" \
      --resource-group "$RESOURCE_GROUP" \
      --query 'properties.endpoints."AI Foundry API"' -o tsv 2>/dev/null || echo "")
    FOUNDRY_HOST="${FOUNDRY_HOST%/}"

    if [[ -n "$FOUNDRY_HOST" ]]; then
      warn "No projects found. Your endpoint format is: ${FOUNDRY_HOST}/api/projects/<project-name>"
      read -rp "   Enter project name (or press Enter to skip): " PROJECT_NAME
      if [[ -n "$PROJECT_NAME" ]]; then
        PROJECT_ENDPOINT="${FOUNDRY_HOST}/api/projects/${PROJECT_NAME}"
      fi
    else
      warn "Could not find AI Foundry API endpoint for $AI_ACCOUNT_NAME."
      read -rp "   Enter full project endpoint (or press Enter to skip): " PROJECT_ENDPOINT
    fi
  fi
fi

if [[ -n "$PROJECT_ENDPOINT" ]]; then
  ok "Project endpoint: $PROJECT_ENDPOINT"
fi

# Find first model deployment name
DEPLOYMENT_NAME=$(az cognitiveservices account deployment list \
  --name "$AI_ACCOUNT_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query "[?contains(properties.model.name, 'gpt')].name | [0]" -o tsv 2>/dev/null || echo "gpt-4.1")
ok "Model deployment: $DEPLOYMENT_NAME"

# Get Application Insights connection string
APPINSIGHTS_CONN=""
APPINSIGHTS_APP=$(az resource list \
  --resource-group "$RESOURCE_GROUP" \
  --resource-type "Microsoft.Insights/components" \
  --query "[0].name" -o tsv 2>/dev/null || echo "")

if [[ -n "$APPINSIGHTS_APP" ]]; then
  APPINSIGHTS_CONN=$(az monitor app-insights component show \
    --app "$APPINSIGHTS_APP" \
    --resource-group "$RESOURCE_GROUP" \
    --query "connectionString" -o tsv 2>/dev/null || echo "")
fi

if [[ -z "$APPINSIGHTS_CONN" ]]; then
  warn "No Application Insights found in $RESOURCE_GROUP."
  read -rp "   Enter Application Insights connection string (or press Enter to skip): " APPINSIGHTS_CONN
fi

if [[ -n "$APPINSIGHTS_CONN" ]]; then
  ok "Application Insights: retrieved ✓"
fi

# ── Step 3: Write .env files ───────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📝 Writing .env files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

write_env_file() {
  local TARGET_DIR="$1"
  local TARGET_FILE="$TARGET_DIR/.env"
  local SAMPLE_FILE="$TARGET_DIR/sample.env"
  local LAB_NAME="$2"

  if [[ ! -f "$SAMPLE_FILE" ]]; then
    warn "No sample.env found in $TARGET_DIR — skipping."
    return
  fi

  if [[ -f "$TARGET_FILE" ]]; then
    warn "$LAB_NAME .env already exists. Backing up to .env.bak"
    cp "$TARGET_FILE" "$TARGET_FILE.bak"
  fi

  # Start from sample.env
  cp "$SAMPLE_FILE" "$TARGET_FILE"

  # Replace values using sed
  sed -i "s|AZURE_AI_PROJECT_ENDPOINT=.*|AZURE_AI_PROJECT_ENDPOINT=\"${PROJECT_ENDPOINT}\"|" "$TARGET_FILE"
  sed -i "s|MODEL_DEPLOYMENT_NAME=.*|MODEL_DEPLOYMENT_NAME=\"${DEPLOYMENT_NAME}\"|" "$TARGET_FILE"
  sed -i "s|MODEL_ENDPOINT=.*|MODEL_ENDPOINT=\"${MODEL_ENDPOINT}\"|" "$TARGET_FILE"
  sed -i "s|MODEL_API_KEY=.*|MODEL_API_KEY=\"${API_KEY}\"|" "$TARGET_FILE"
  sed -i "s|TELEMETRY_CONNECTION_STRING=.*|TELEMETRY_CONNECTION_STRING=\"${APPINSIGHTS_CONN}\"|" "$TARGET_FILE"
  sed -i "s|AZURE_AI_PROJECTS_AZURE_SUBSCRIPTION_ID=.*|AZURE_AI_PROJECTS_AZURE_SUBSCRIPTION_ID=\"${SUBSCRIPTION_ID}\"|" "$TARGET_FILE"
  sed -i "s|AZURE_AI_PROJECTS_AZURE_RESOURCE_GROUP=.*|AZURE_AI_PROJECTS_AZURE_RESOURCE_GROUP=\"${RESOURCE_GROUP}\"|" "$TARGET_FILE"
  sed -i "s|AZURE_AI_PROJECTS_AZURE_AOAI_ACCOUNT=.*|AZURE_AI_PROJECTS_AZURE_AOAI_ACCOUNT=\"${AI_ACCOUNT_NAME}\"|" "$TARGET_FILE"

  ok "$LAB_NAME .env written → $TARGET_FILE"
}

# Write JS .env
write_env_file "$JS_DIR" "TypeScript"

# ── Step 4: Summary ────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📋 Configuration Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Subscription:      $SUBSCRIPTION_NAME"
echo "  Resource Group:    $RESOURCE_GROUP"
echo "  AI Account:        $AI_ACCOUNT_NAME"
echo "  Project Endpoint:  ${PROJECT_ENDPOINT:-⚠️ Not set — update .env manually}"
echo "  Model Deployment:  $DEPLOYMENT_NAME"
echo "  Model Endpoint:    ${MODEL_ENDPOINT:-⚠️ Not set}"
echo "  API Key:           ${API_KEY:+✓ Set}${API_KEY:-⚠️ Not set}"
echo "  App Insights:      ${APPINSIGHTS_CONN:+✓ Set}${APPINSIGHTS_CONN:-⚠️ Not set — tracing will be skipped}"
echo ""
echo "  .env files:"
[[ -f "$JS_DIR/.env" ]] && echo "    ✅ $JS_DIR/.env"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🎉 Setup complete! You're ready to start the quest."
echo ""
echo "  Next steps:"
echo "    cd labs/js && npm run build && node dist/02-setup.js"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
