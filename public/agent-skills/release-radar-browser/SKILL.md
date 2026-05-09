---
name: release-radar-browser
description: Use GRA Release Radar to inspect public GitHub release downloads in a browser-only workflow.
---

# GRA Release Radar browser workflow

Use this skill when a user asks for public GitHub release asset download analytics, release cadence, platform adoption, architecture adoption, package coverage, or anomaly review for a public GitHub repository.

## Workflow

1. Normalize the repository input to `owner/repo`.
2. Open `https://gra.caldis.me/?repo=owner/repo` in a browser.
3. Read the summary metrics, release charts, platform and architecture breakdowns, package matrix, and anomaly tables.
4. If GitHub returns a rate-limit error, explain the reset or retry guidance and ask whether the user wants to apply a GitHub token in the browser.

## Constraints

- Do not claim that GRA has a hosted analysis API.
- Do not claim that GRA has a live MCP transport, OAuth server, CLI, SDK, webhook endpoint, or streaming endpoint.
- Do not count GitHub source archive downloads; GitHub does not expose those counts as release asset downloads.
- Use `/llms-full.txt` for full product context and `/errors.md` for retry guidance.
