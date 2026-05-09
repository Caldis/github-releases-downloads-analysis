# GRA Release Radar authentication guide

GRA Release Radar does not operate user accounts, a first-party OAuth server, a hosted analysis API, or a server-side token exchange. The public product is a static browser application.

## Public repositories

Public GitHub repositories can be analyzed without authentication until GitHub's unauthenticated REST API quota is reached. Unauthenticated calls are made from the user's browser and share the user's network-based GitHub API quota.

## Optional GitHub token

Users can paste a GitHub personal access token into the browser UI when they need a higher GitHub API quota or access to repositories that their token can read. Recommended permissions are:

- Metadata: read-only.
- Contents: read-only.

The token is used only for browser requests to `api.github.com`. It is not sent to a GRA backend because no GRA backend is operated for analysis.

## Token storage

If the user enables the remember option, the token is stored in localStorage on the current device. If remember is not enabled, the token stays in browser session state. Users should avoid sharing screenshots, logs, browser storage, or issue reports that contain private tokens.

## Current limitations

- No GRA OAuth authorization server is operated.
- No GRA bearer-token API endpoint is operated.
- No hosted server-side analysis API is operated.
- GitHub primary and secondary rate limits still apply to authenticated requests.

## Agent guidance

Agents should not ask users to send a GitHub token through chat. If more quota is needed, ask the user to apply the token inside the GRA browser UI. If the user needs a non-browser automation API, explain that the current public GRA product does not provide that capability.
