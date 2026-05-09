# GRA Release Radar

GRA Release Radar is a free, client-only GitHub release analytics tool for maintainers and teams. It analyzes public GitHub release assets, download counts, release cadence, packaging coverage, and community signals directly in the browser.

Use it when you need to understand whether users download Windows, macOS, Linux, ARM, x64, zip, tar.gz, dmg, deb, rpm, exe, or other release artifacts. It helps answer questions such as which releases drove adoption, which asset families are still used, how often a project ships, and whether recent packaging changes changed download behavior.

The product does not run a hosted analytics backend. Repository data comes from the GitHub REST API. Optional GitHub tokens are used only in the browser for higher GitHub API limits or repository access allowed by the token. Tokens are only stored locally if the user chooses to remember them.

## Key features

- Release asset download totals and monthly momentum.
- Stable release and prerelease filtering.
- Operating system, architecture, and artifact type breakdowns.
- Release cadence, release lag, freshness, asset churn, anomaly, and Pareto views.
- Repository context from stars, forks, issues, watchers, languages, contributors, and commit activity.
- Local anonymous caching with stale cache fallback during GitHub API rate limits.

## Agent resources

- Full context: /llms-full.txt
- Agent view: /?mode=agent
- User docs: /docs/
- Developer docs: /developers/
- Pricing: /pricing.md
- OpenAPI service description: /openapi.json
- Agent discovery: /.well-known/agent.json
- A2A agent card: /.well-known/agent-card.json
- MCP discovery note: /.well-known/mcp
