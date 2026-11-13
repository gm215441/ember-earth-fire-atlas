# EMBER / Codex Windows MCP bootstrap — optional, run in PowerShell.
# Prerequisites: codex CLI, Node.js/npx, internet; approval/login may be required.
$ErrorActionPreference = 'Stop'
if (-not (Get-Command codex -ErrorAction SilentlyContinue)) { throw 'Codex CLI not found. Install Codex CLI first or configure servers in the Codex app.' }
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) { throw 'Node.js npx not found. Install Node.js LTS.' }
Write-Host 'Review these servers before installation: Playwright browser MCP, Context7 docs MCP.'
$go = Read-Host 'Configure Playwright + Context7 now? Type YES'
if ($go -ne 'YES') { Write-Host 'No changes made'; exit 0 }
$current = (codex mcp list | Out-String)
if ($current -notmatch 'playwright') { codex mcp add playwright -- npx -y '@playwright/mcp@latest' }
if ($current -notmatch 'context7') { npx ctx7 setup --codex }
Write-Host 'Figma is optional; add ONLY when you have a real Figma design: codex mcp add figma --url https://mcp.figma.com/mcp'
codex mcp list
