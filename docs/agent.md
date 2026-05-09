# GRA Release Radar agent view

GRA Release Radar is a free, client-only GitHub release analytics tool for maintainers and teams. It analyzes public release asset downloads, release cadence, package coverage, platform adoption, and repository context from the user's browser.

## When to use

- Public GitHub release asset download analytics.
- Release cadence and monthly momentum review.
- Operating system, CPU architecture, and artifact type breakdowns.
- Browser-only reporting for a public repository supplied as `owner/repo` or a GitHub repository URL.

## When not to use

- Do not use it as a hosted analysis API. No such API is currently operated.
- Do not use it as a package registry analytics service for npm, PyPI, crates.io, or container pulls.
- Do not claim it counts GitHub source archive downloads.
- Do not claim live MCP, SDK, CLI, OAuth, webhook, or streaming support.

## Authentication

Authentication is optional. Public repositories work without authentication until GitHub API limits are reached. A user can paste a GitHub personal access token in the browser for higher GitHub API quota or repository access allowed by that token.

## Discovery

- Web app: https://gra.caldis.me/
- llms.txt: https://gra.caldis.me/llms.txt
- Full context: https://gra.caldis.me/llms-full.txt
- Developer docs: https://gra.caldis.me/developers/
- Pricing: https://gra.caldis.me/pricing.md
- OpenAPI: https://gra.caldis.me/openapi.json
- API catalog: https://gra.caldis.me/.well-known/api-catalog
- Agent discovery JSON: https://gra.caldis.me/.well-known/agent.json
- A2A agent card: https://gra.caldis.me/.well-known/agent-card.json
