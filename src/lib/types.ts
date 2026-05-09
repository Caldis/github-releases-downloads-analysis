export type GitHubRelease = {
  id: number
  tag_name: string
  name: string | null
  draft: boolean
  prerelease: boolean
  created_at: string
  published_at: string | null
  html_url: string
  assets: GitHubAsset[]
  author?: GitHubUser
}

export type GitHubAsset = {
  id: number
  name: string
  size: number
  download_count: number
  content_type: string
  created_at: string
  updated_at: string
  browser_download_url: string
}

export type GitHubUser = {
  login: string
  avatar_url: string
  html_url: string
}

export type GitHubRepo = {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  subscribers_count: number
  watchers_count: number
  language: string | null
  created_at: string
  updated_at: string
  pushed_at: string
  license: { spdx_id: string | null } | null
}

export type GitHubContributor = {
  id: number
  login: string
  avatar_url: string
  html_url: string
  contributions: number
}

export type GitHubCommitActivityWeek = {
  total: number
  week: number
  days: number[]
}

export type RateLimitInfo = {
  limit?: number | null
  remaining: number | null
  reset: number | null
  used?: number | null
  retryAfter?: number | null
}

export type RepoData = {
  repo: GitHubRepo
  releases: GitHubRelease[]
  languages: Record<string, number>
  contributors: GitHubContributor[]
  commitActivity: GitHubCommitActivityWeek[] | null
  rateLimit: RateLimitInfo
  truncated: boolean
  cache?: {
    hit: boolean
    stale: boolean
    ageMs: number
  }
}
