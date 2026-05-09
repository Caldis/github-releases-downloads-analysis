# Agent instructions for GRA Release Radar

Use plain, direct engineering language. Prefer factual statements and concrete file references over broad product claims.

## Project shape

- This repository builds a static Vite + React app.
- The production site is published from `docs/`.
- Static discovery files should be authored in `public/` and copied into `docs/` by `npm run build`.
- The app is client-only. Do not describe it as a hosted analysis API unless such an API exists in the repository and is deployed.

## Safety rules

- Do not commit private GitHub tokens, analytics exports, or browser storage dumps.
- Do not invent pricing tiers, customer names, testimonials, contact emails, postal addresses, phone numbers, or third-party integrations.
- When documenting MCP, API, SDK, CLI, or streaming support, distinguish live capabilities from planned or unavailable capabilities.

## Verification

Before claiming a change is complete, run:

```bash
npm test
npm run typecheck
npm run build
```

For public discovery work, also verify the built files under `docs/` and check important URLs after deployment.
