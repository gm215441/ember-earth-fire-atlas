#!/usr/bin/env bash
set -euo pipefail
command -v codex >/dev/null || { echo 'Codex CLI missing'; exit 1; }
command -v npx >/dev/null || { echo 'Node.js npx missing'; exit 1; }
echo 'Review servers to add: Playwright MCP and Context7 MCP. Authentication may be required.'
read -r -p 'Configure Playwright + Context7? Type YES: ' okay
[[ "$okay" == 'YES' ]] || { echo 'No changes made'; exit 0; }
current="$(codex mcp list)"
if ! grep -q 'playwright' <<< "$current"; then codex mcp add playwright -- npx -y @playwright/mcp@latest; fi
if ! grep -q 'context7' <<< "$current"; then npx ctx7 setup --codex; fi
echo 'Figma optional: codex mcp add figma --url https://mcp.figma.com/mcp'
codex mcp list
