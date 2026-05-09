import { describe, expect, it } from 'vitest'

import { buildMetrics } from './metrics'
import type { GitHubAsset, GitHubRelease, RepoData } from './types'

const makeAsset = (
  id: number,
  name: string,
  downloadCount: number,
  size: number,
  createdAt: string,
): GitHubAsset => ({
  id,
  name,
  size,
  download_count: downloadCount,
  content_type: 'application/octet-stream',
  created_at: createdAt,
  updated_at: createdAt,
  browser_download_url: `https://github.com/acme/tool/releases/download/${name}`,
})

const makeRelease = (
  id: number,
  tagName: string,
  createdAt: string,
  assets: GitHubAsset[],
  options: Partial<Pick<GitHubRelease, 'draft' | 'prerelease' | 'published_at'>> = {},
): GitHubRelease => ({
  id,
  tag_name: tagName,
  name: tagName,
  draft: options.draft ?? false,
  prerelease: options.prerelease ?? false,
  created_at: createdAt,
  published_at: options.published_at ?? createdAt,
  html_url: `https://github.com/acme/tool/releases/tag/${tagName}`,
  assets,
})

const makeRepoData = (): RepoData => ({
  repo: {
    id: 1,
    name: 'tool',
    full_name: 'acme/tool',
    description: null,
    html_url: 'https://github.com/acme/tool',
    stargazers_count: 0,
    forks_count: 0,
    open_issues_count: 0,
    subscribers_count: 0,
    watchers_count: 0,
    language: 'TypeScript',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    pushed_at: '2024-01-01T00:00:00Z',
    license: null,
  },
  releases: [
    makeRelease(1, 'v1.0.0', '2024-01-01T00:00:00Z', [
      makeAsset(11, 'tool-v1.0.0-linux-x64.tar.gz', 100, 1024, '2024-01-01T01:00:00Z'),
      makeAsset(12, 'tool-v1.0.0-win-x64.exe', 50, 2048, '2024-01-01T01:00:00Z'),
    ]),
    makeRelease(
      2,
      'v1.1.0-beta.1',
      '2024-02-01T00:00:00Z',
      [makeAsset(21, 'tool-beta-portable.bin', 25, 4096, '2024-02-01T01:00:00Z')],
      { prerelease: true },
    ),
    makeRelease(
      3,
      'v2.0.0',
      '2024-03-01T00:00:00Z',
      [makeAsset(31, 'tool-v2.0.0-linux-x64.tar.gz', 999, 8192, '2024-03-01T01:00:00Z')],
      { draft: true },
    ),
  ],
  languages: {},
  contributors: [],
  commitActivity: null,
  rateLimit: { remaining: null, reset: null },
  truncated: false,
})

describe('buildMetrics', () => {
  it('builds basic release and asset totals without drafts', () => {
    const metrics = buildMetrics(makeRepoData(), false)

    expect(metrics.totals).toMatchObject({
      downloads: 150,
      assets: 2,
      size: 3072,
      releases: 1,
      prereleases: 1,
      drafts: 1,
    })
    expect(metrics.downloadsByRelease).toEqual([
      { name: 'v1.0.0', value: 150, date: '2024-01-01T00:00:00Z' },
    ])
    expect(metrics.releaseDates).toMatchObject({
      first: '2024-01-01T00:00:00Z',
      latest: '2024-01-01T00:00:00Z',
    })
  })

  it('filters prerelease assets unless they are explicitly included', () => {
    const stableOnly = buildMetrics(makeRepoData(), false)
    const withPrerelease = buildMetrics(makeRepoData(), true)

    expect(stableOnly.releases.map((release) => release.tag)).toEqual(['v1.0.0'])
    expect(stableOnly.assets.map((asset) => asset.releaseTag)).toEqual(['v1.0.0', 'v1.0.0'])
    expect(withPrerelease.releases.map((release) => release.tag)).toEqual([
      'v1.0.0',
      'v1.1.0-beta.1',
    ])
    expect(withPrerelease.totals.downloads).toBe(175)
  })

  it('classifies assets and reports unknown OS and architecture share by downloads', () => {
    const metrics = buildMetrics(makeRepoData(), true)

    expect(metrics.assetsByType).toEqual([
      { name: 'tar.gz', value: 100 },
      { name: 'exe', value: 50 },
      { name: 'other', value: 25 },
    ])
    expect(metrics.assetsByOs).toEqual([
      { name: 'linux', value: 100 },
      { name: 'windows', value: 50 },
      { name: 'unknown', value: 25 },
    ])
    expect(metrics.unknownShare).toEqual({
      os: 25 / 175,
      arch: 25 / 175,
    })
  })
})
