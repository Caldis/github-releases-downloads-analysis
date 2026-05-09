import type {
  GitHubCommitActivityWeek,
  GitHubContributor,
  GitHubRelease,
  GitHubRepo,
  RateLimitInfo,
  RepoData,
} from './types'

const API_BASE = 'https://api.github.com'
const API_HEADERS = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
}

const DEFAULT_RATE_LIMIT: RateLimitInfo = {
  limit: null,
  remaining: null,
  reset: null,
  used: null,
  retryAfter: null,
}
const CACHE_KEY_PREFIX = 'release-radar:repo:'
const CACHE_TTL_MS = 1000 * 60 * 30
const PRIMARY_RATE_LIMIT_MESSAGE_RE = /api rate limit/i
const RATE_LIMIT_MESSAGE_RE = /\brate limit\b/i
const SECONDARY_RATE_LIMIT_MESSAGE_RE = /secondary rate limit/i

type RepoCache = {
  timestamp: number
  data: RepoData
}

type GitHubApiError = Error & {
  status?: number
  rateLimit?: RateLimitInfo
}

const hasStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const readCache = (key: string): RepoCache | null => {
  if (!hasStorage()) return null
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as RepoCache
    if (!parsed?.timestamp || !parsed?.data) return null
    return parsed
  } catch (error) {
    return null
  }
}

const writeCache = (key: string, data: RepoData) => {
  if (!hasStorage()) return
  try {
    const payload: RepoCache = { timestamp: Date.now(), data: { ...data, cache: undefined } }
    window.localStorage.setItem(key, JSON.stringify(payload))
  } catch (error) {
    // Ignore storage write failures (quota, privacy mode, etc.)
  }
}

const isRateLimitStatus = (status: number | undefined) => status === 403 || status === 429

export type GitHubRateLimitKind = 'primary' | 'secondary' | 'unknown' | 'none'

export const getGitHubRateLimitKind = (error: unknown): GitHubRateLimitKind => {
  if (!(error instanceof Error)) return 'none'
  const apiError = error as GitHubApiError
  if (!isRateLimitStatus(apiError.status)) return 'none'

  const message = error.message.toLowerCase()
  if (SECONDARY_RATE_LIMIT_MESSAGE_RE.test(message)) return 'secondary'
  if (apiError.rateLimit?.remaining === 0) return 'primary'
  if (PRIMARY_RATE_LIMIT_MESSAGE_RE.test(message)) return 'primary'
  if (apiError.rateLimit?.retryAfter) return 'unknown'
  if (RATE_LIMIT_MESSAGE_RE.test(message)) return 'unknown'
  return 'none'
}

export const isGitHubRateLimitError = (error: unknown) =>
  getGitHubRateLimitKind(error) !== 'none'

export const isGitHubNonRetryableError = (error: unknown) => {
  if (!(error instanceof Error)) return false
  const status = (error as GitHubApiError).status
  return isGitHubRateLimitError(error) || status === 401 || status === 403 || status === 404 || status === 429
}

const isRateLimitError = (error: unknown) => isGitHubRateLimitError(error)

const parseHeaderNumber = (value: string | null) => {
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const getRateLimit = (headers: Headers): RateLimitInfo => {
  return {
    limit: parseHeaderNumber(headers.get('x-ratelimit-limit')),
    remaining: parseHeaderNumber(headers.get('x-ratelimit-remaining')),
    reset: parseHeaderNumber(headers.get('x-ratelimit-reset')),
    used: parseHeaderNumber(headers.get('x-ratelimit-used')),
    retryAfter: parseHeaderNumber(headers.get('retry-after')),
  }
}

const parseErrorMessage = async (response: Response) => {
  try {
    const body = await response.json()
    if (body?.message) return body.message as string
  } catch (error) {
    return response.statusText
  }
  return response.statusText
}

const buildHeaders = (token?: string) =>
  token ? { ...API_HEADERS, Authorization: `Bearer ${token}` } : API_HEADERS

const fetchJson = async <T>(
  url: string,
  token?: string,
): Promise<{ data: T; rateLimit: RateLimitInfo }> => {
  const response = await fetch(url, { headers: buildHeaders(token) })
  const rateLimit = getRateLimit(response.headers)

  if (!response.ok) {
    const message = await parseErrorMessage(response)
    const error = new Error(message)
    ;(error as Error & { status?: number; rateLimit?: RateLimitInfo }).status = response.status
    ;(error as Error & { status?: number; rateLimit?: RateLimitInfo }).rateLimit = rateLimit
    throw error
  }

  return { data: (await response.json()) as T, rateLimit }
}

const fetchReleases = async (owner: string, repo: string, token?: string) => {
  const perPage = 100
  const maxPages = 10
  let page = 1
  let all: GitHubRelease[] = []
  let rateLimit: RateLimitInfo = DEFAULT_RATE_LIMIT
  let truncated = false

  while (page <= maxPages) {
    const { data, rateLimit: rl } = await fetchJson<GitHubRelease[]>(
      `${API_BASE}/repos/${owner}/${repo}/releases?per_page=${perPage}&page=${page}`,
      token,
    )
    rateLimit = rl
    all = all.concat(data)
    if (data.length < perPage) {
      return { releases: all, rateLimit, truncated }
    }
    page += 1
  }

  truncated = true
  return { releases: all, rateLimit, truncated }
}

const fetchRepo = (owner: string, repo: string, token?: string) =>
  fetchJson<GitHubRepo>(`${API_BASE}/repos/${owner}/${repo}`, token)

const fetchLanguages = (owner: string, repo: string, token?: string) =>
  fetchJson<Record<string, number>>(`${API_BASE}/repos/${owner}/${repo}/languages`, token)

const fetchContributors = (owner: string, repo: string, token?: string) =>
  fetchJson<GitHubContributor[]>(
    `${API_BASE}/repos/${owner}/${repo}/contributors?per_page=12&anon=false`,
    token,
  )

const fetchCommitActivity = async (owner: string, repo: string, token?: string) => {
  const response = await fetch(`${API_BASE}/repos/${owner}/${repo}/stats/commit_activity`, {
    headers: buildHeaders(token),
  })

  const rateLimit = getRateLimit(response.headers)
  if (response.status === 202) {
    return { data: null, rateLimit }
  }

  if (!response.ok) {
    const message = await parseErrorMessage(response)
    const error = new Error(message)
    ;(error as Error & { status?: number; rateLimit?: RateLimitInfo }).status = response.status
    ;(error as Error & { status?: number; rateLimit?: RateLimitInfo }).rateLimit = rateLimit
    throw error
  }

  return { data: (await response.json()) as GitHubCommitActivityWeek[], rateLimit }
}

export const fetchRepoData = async (
  owner: string,
  repo: string,
  token?: string,
): Promise<RepoData> => {
  const cacheKey = `${CACHE_KEY_PREFIX}${owner}/${repo}`
  const allowCache = !token
  const cached = allowCache ? readCache(cacheKey) : null
  const cacheAge = cached ? Date.now() - cached.timestamp : null

  if (allowCache && cached && cacheAge !== null && cacheAge < CACHE_TTL_MS) {
    return {
      ...cached.data,
      cache: { hit: true, stale: false, ageMs: cacheAge },
    }
  }

  let repoResult: { data: GitHubRepo; rateLimit: RateLimitInfo }
  try {
    repoResult = await fetchRepo(owner, repo, token)
  } catch (error) {
    if (allowCache && cached && isRateLimitError(error)) {
      return {
        ...cached.data,
        cache: { hit: true, stale: true, ageMs: cacheAge ?? 0 },
      }
    }
    throw error
  }

  const [releasesResult, languagesResult, contributorsResult, commitActivityResult] =
    await Promise.allSettled([
      fetchReleases(owner, repo, token),
      fetchLanguages(owner, repo, token),
      fetchContributors(owner, repo, token),
      fetchCommitActivity(owner, repo, token),
    ])

  const releasesValue =
    releasesResult.status === 'fulfilled'
      ? releasesResult.value
      : { releases: [], rateLimit: repoResult.rateLimit, truncated: false }

  const languagesValue =
    languagesResult.status === 'fulfilled' ? languagesResult.value.data : {}

  const contributorsValue =
    contributorsResult.status === 'fulfilled' ? contributorsResult.value.data : []

  const commitActivityValue =
    commitActivityResult.status === 'fulfilled' ? commitActivityResult.value.data : null

  const rateLimit = [
    repoResult.rateLimit,
    releasesResult.status === 'fulfilled' ? releasesResult.value.rateLimit : DEFAULT_RATE_LIMIT,
    languagesResult.status === 'fulfilled' ? languagesResult.value.rateLimit : DEFAULT_RATE_LIMIT,
    contributorsResult.status === 'fulfilled' ? contributorsResult.value.rateLimit : DEFAULT_RATE_LIMIT,
    commitActivityResult.status === 'fulfilled' ? commitActivityResult.value.rateLimit : DEFAULT_RATE_LIMIT,
  ].reduce<RateLimitInfo>((acc, item) => {
    if (item.remaining !== null) {
      return item
    }
    return acc
  }, DEFAULT_RATE_LIMIT)

  const result: RepoData = {
    repo: repoResult.data,
    releases: releasesValue.releases,
    languages: languagesValue,
    contributors: contributorsValue,
    commitActivity: commitActivityValue,
    rateLimit,
    truncated: releasesValue.truncated,
  }
  if (allowCache) {
    writeCache(cacheKey, result)
  }
  return result
}
