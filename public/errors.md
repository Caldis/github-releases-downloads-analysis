# GRA Release Radar error and retry guide

GRA Release Radar is a client-only browser app. It calls the public GitHub REST API from the user's browser and does not proxy requests through a GRA server.

## Common error codes

| Code | Meaning | Recovery |
| --- | --- | --- |
| `github_primary_rate_limit` | GitHub returned a primary REST API rate-limit response, usually with `x-ratelimit-remaining: 0`. | Wait until the `x-ratelimit-reset` time or use a browser-supplied GitHub token with higher quota. |
| `github_secondary_rate_limit` | GitHub returned an abuse or secondary rate-limit response. | Slow down requests and wait for the `retry-after` value if GitHub supplied one. |
| `github_not_found` | The repository does not exist, is private, or the token cannot read it. | Check the owner and repository name. For private repositories, use a token in the browser that has access. |
| `github_bad_credentials` | GitHub rejected the token. | Remove the token or paste a valid fine-grained token with read-only repository access. |
| `static_page_not_found` | GitHub Pages returned a static 404 page. | Check the URL against `/sitemap.xml`, `/llms.txt`, and `/developers/`. |

## Retry behavior

The app avoids automatic retry for non-retryable GitHub responses such as 401, 403, 404, 429, primary rate limits, and secondary rate limits. This prevents a single browser session from making a rate-limit problem worse.

## Headers agents should read

- `x-ratelimit-limit`
- `x-ratelimit-remaining`
- `x-ratelimit-reset`
- `retry-after`

These headers come from GitHub, not from a GRA server. The public GRA site is hosted on GitHub Pages, so unknown paths may return an HTML 404 page instead of a JSON error body.
