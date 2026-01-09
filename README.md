# Release Radar

Client-only GitHub release insights for maintainers and teams.

## Features
- Release download analytics with time-range filters
- Asset insights (OS, arch, file types, top artifacts)
- Release cadence and monthly momentum
- Community signals (languages, contributors)
- Client-only privacy with rate-limit awareness

## Getting Started

```bash
npm install
npm run dev
```

## GitHub Pages
- `npm run build` outputs to `docs/` (GitHub Pages ready).
- Custom domain is configured via `public/CNAME`.

## Usage
- Open `https://gra.caldis.me` and enter `owner/repo` or a GitHub URL.
- Direct query example: `https://gra.caldis.me?repo=owner/repo`.

## Optional GitHub Token
- Use a fine-grained PAT for higher rate limits or private repositories.
- Create one at `https://github.com/settings/tokens?type=beta`.
- Recommended permissions: `Metadata (read-only)` + `Contents (read-only)`.
- Set an expiration date and only grant access to the repos you need.
- Tokens are kept in the browser; they are only stored locally if you opt in.

## Limits
- Private repositories require authentication (not supported here).
- GitHub REST API limits unauthenticated requests.
- GitHub does not count source archive downloads (zip/tar) in release assets.
