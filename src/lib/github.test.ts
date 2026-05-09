import { describe, expect, it } from 'vitest'
import {
  getGitHubRateLimitKind,
  isGitHubNonRetryableError,
  isGitHubRateLimitError,
} from './github'
import type { RateLimitInfo } from './types'

const makeGitHubError = (
  message: string,
  status: number,
  rateLimit: Partial<RateLimitInfo> = {},
) => {
  const error = new Error(message) as Error & {
    status?: number
    rateLimit?: RateLimitInfo
  }
  error.status = status
  error.rateLimit = {
    remaining: rateLimit.remaining ?? null,
    reset: rateLimit.reset ?? null,
    retryAfter: rateLimit.retryAfter ?? null,
  }
  return error
}

describe('GitHub API error classification', () => {
  it('classifies exhausted primary rate limits from response headers', () => {
    const error = makeGitHubError('API rate limit exceeded', 403, {
      remaining: 0,
      reset: 1_770_000_000,
    })

    expect(isGitHubRateLimitError(error)).toBe(true)
    expect(getGitHubRateLimitKind(error)).toBe('primary')
    expect(isGitHubNonRetryableError(error)).toBe(true)
  })

  it('classifies secondary rate limits without requiring remaining to be zero', () => {
    const error = makeGitHubError('You have exceeded a secondary rate limit', 429, {
      remaining: 42,
      retryAfter: 120,
    })

    expect(isGitHubRateLimitError(error)).toBe(true)
    expect(getGitHubRateLimitKind(error)).toBe('secondary')
    expect(isGitHubNonRetryableError(error)).toBe(true)
  })

  it('does not classify unrelated forbidden responses as rate limits', () => {
    const error = makeGitHubError('Resource not accessible by personal access token', 403, {
      remaining: 4999,
    })

    expect(isGitHubRateLimitError(error)).toBe(false)
    expect(getGitHubRateLimitKind(error)).toBe('none')
    expect(isGitHubNonRetryableError(error)).toBe(true)
  })
})
