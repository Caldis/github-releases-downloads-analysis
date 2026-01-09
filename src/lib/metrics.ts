import type { GitHubRelease, RepoData } from './types'

export type ReleaseInsight = {
  id: number
  tag: string
  name: string
  date: string
  downloads: number
  assets: number
  size: number
  semverGroup: 'major' | 'minor' | 'patch' | 'other'
  prerelease: boolean
  url: string
}

export type AssetInsight = {
  id: number
  name: string
  downloads: number
  size: number
  type: string
  os: string
  arch: string
  releaseTag: string
  releaseDate: string
  url: string
}

export type Metrics = {
  releases: ReleaseInsight[]
  assets: AssetInsight[]
  impactSpeed: {
    name: string
    value: number
    date: string
    downloads: number
    daysSince: number
    assets: number
  }[]
  semverDownloads: { name: string; value: number }[]
  semverCounts: { name: string; value: number }[]
  paretoCurve: { rank: number; name: string; downloads: number; cumulative: number }[]
  releaseLagBuckets: { name: string; value: number }[]
  releaseLagByRelease: { name: string; value: number; date: string }[]
  adoptionBuckets: { name: string; value: number }[]
  assetFreshnessBuckets: { name: string; value: number }[]
  assetEfficiencyTop: { name: string; value: number; downloads: number; size: number }[]
  assetChurn: { name: string; added: number; removed: number }[]
  anomalies: { name: string; downloads: number; zScore: number; date: string }[]
  coverageMatrix: {
    releases: { tag: string; date: string }[]
    rows: { key: string; os: string; arch: string; values: number[] }[]
    maxValue: number
  }
  unknownShare: {
    os: number
    arch: number
  }
  totals: {
    downloads: number
    assets: number
    size: number
    releases: number
    prereleases: number
    drafts: number
  }
  releaseDates: {
    first: string | null
    latest: string | null
    cadenceMedianDays: number | null
  }
  downloadsByRelease: { name: string; value: number; date: string }[]
  downloadsByMonth: { name: string; value: number; date: string }[]
  releasesByMonth: { name: string; value: number; date: string }[]
  cadenceDays: { name: string; value: number }[]
  assetsByType: { name: string; value: number }[]
  assetsByOs: { name: string; value: number }[]
  assetsByArch: { name: string; value: number }[]
}

const getReleaseDate = (release: GitHubRelease) => release.published_at || release.created_at

const normalizeRelease = (release: GitHubRelease): Omit<ReleaseInsight, 'semverGroup'> => {
  const downloads = release.assets.reduce((sum, asset) => sum + asset.download_count, 0)
  const size = release.assets.reduce((sum, asset) => sum + asset.size, 0)
  return {
    id: release.id,
    tag: release.tag_name,
    name: release.name || release.tag_name,
    date: getReleaseDate(release),
    downloads,
    assets: release.assets.length,
    size,
    prerelease: release.prerelease,
    url: release.html_url,
  }
}

const parseSemver = (tag: string) => {
  const match = tag.replace(/^v/i, '').match(/(\d+)\.(\d+)\.(\d+)/)
  if (!match) return null
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  }
}

const classifySemverGroup = (
  current: ReturnType<typeof parseSemver>,
  previous: ReturnType<typeof parseSemver>,
): ReleaseInsight['semverGroup'] => {
  if (!current) return 'other'
  if (!previous) return 'major'
  if (current.major > previous.major) return 'major'
  if (current.minor > previous.minor) return 'minor'
  if (current.patch > previous.patch) return 'patch'
  return 'other'
}

const detectAssetType = (name: string) => {
  const lower = name.toLowerCase()
  if (lower.endsWith('.tar.gz') || lower.endsWith('.tgz')) return 'tar.gz'
  if (lower.endsWith('.tar.xz')) return 'tar.xz'
  if (lower.endsWith('.zip')) return 'zip'
  if (lower.endsWith('.dmg')) return 'dmg'
  if (lower.endsWith('.pkg')) return 'pkg'
  if (lower.endsWith('.msi')) return 'msi'
  if (lower.endsWith('.exe')) return 'exe'
  if (lower.endsWith('.appimage')) return 'appimage'
  if (lower.endsWith('.deb')) return 'deb'
  if (lower.endsWith('.rpm')) return 'rpm'
  if (lower.endsWith('.apk')) return 'apk'
  if (lower.endsWith('.ipa')) return 'ipa'
  if (lower.endsWith('.jar')) return 'jar'
  if (lower.endsWith('.whl')) return 'whl'
  if (lower.endsWith('.sig') || lower.endsWith('.asc')) return 'signature'
  if (lower.includes('checksum') || lower.endsWith('.sha256') || lower.endsWith('.sha512')) return 'checksum'
  return 'other'
}

const detectAssetOs = (name: string) => {
  const lower = name.toLowerCase()
  if (/(windows|win32|win64|msi|exe)/.test(lower)) return 'windows'
  if (/(macos|mac|osx|darwin|dmg|pkg)/.test(lower)) return 'macos'
  if (/(linux|ubuntu|debian|fedora|centos|appimage|snap|rpm|deb)/.test(lower)) return 'linux'
  if (/(android|apk)/.test(lower)) return 'android'
  if (/(ios|ipa)/.test(lower)) return 'ios'
  return 'unknown'
}

const detectAssetArch = (name: string) => {
  const lower = name.toLowerCase()
  if (/(arm64|aarch64)/.test(lower)) return 'arm64'
  if (/(armv7|armv6|armhf)/.test(lower)) return 'arm'
  if (/(x86_64|amd64|x64)/.test(lower)) return 'x64'
  if (/(x86|i386|i686|ia32)/.test(lower)) return 'x86'
  if (/universal/.test(lower)) return 'universal'
  return 'unknown'
}

const groupSum = (items: { name: string; value: number }[]) => {
  const map = new Map<string, number>()
  items.forEach((item) => {
    map.set(item.name, (map.get(item.name) || 0) + item.value)
  })
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
}

const median = (values: number[]) => {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

const average = (values: number[]) => {
  if (!values.length) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

const stddev = (values: number[], mean: number) => {
  if (values.length < 2) return 0
  const variance =
    values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length
  return Math.sqrt(variance)
}

const toMonthKey = (date: string) => {
  const dt = new Date(date)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
}

export const buildMetrics = (data: RepoData, includePrerelease: boolean): Metrics => {
  const releasesAll = data.releases
  const draftCount = releasesAll.filter((release) => release.draft).length
  const prereleaseCount = releasesAll.filter((release) => release.prerelease).length

  const releases = releasesAll.filter((release) => !release.draft)
  const filteredReleases = includePrerelease
    ? releases
    : releases.filter((release) => !release.prerelease)

  const releaseBase = filteredReleases
    .map(normalizeRelease)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const semverParsed = releaseBase.map((release) => parseSemver(release.tag))
  const releaseInsights: ReleaseInsight[] = releaseBase.map((release, index) => ({
    ...release,
    semverGroup: classifySemverGroup(semverParsed[index], semverParsed[index - 1]),
  }))

  const assets = filteredReleases.flatMap((release) =>
    release.assets.map((asset) => ({
      id: asset.id,
      name: asset.name,
      downloads: asset.download_count,
      size: asset.size,
      type: detectAssetType(asset.name),
      os: detectAssetOs(asset.name),
      arch: detectAssetArch(asset.name),
      releaseTag: release.tag_name,
      releaseDate: getReleaseDate(release),
      url: asset.browser_download_url,
    })),
  )

  const now = Date.now()
  const impactSpeed = releaseInsights.map((release) => {
    const daysSince = Math.max(
      1,
      Math.round((now - new Date(release.date).getTime()) / (1000 * 60 * 60 * 24)),
    )
    return {
      name: release.tag,
      value: release.downloads / daysSince,
      date: release.date,
      downloads: release.downloads,
      daysSince,
      assets: release.assets,
    }
  })

  const semverDownloads = groupSum(
    releaseInsights.map((release) => ({ name: release.semverGroup, value: release.downloads })),
  )
  const semverCounts = groupSum(
    releaseInsights.map((release) => ({ name: release.semverGroup, value: 1 })),
  )

  const downloadsByRelease = releaseInsights.map((release) => ({
    name: release.tag,
    value: release.downloads,
    date: release.date,
  }))

  const downloadsByMonth = groupSum(
    releaseInsights.map((release) => ({
      name: toMonthKey(release.date),
      value: release.downloads,
    })),
  )
    .map((entry) => ({
      ...entry,
      date: `${entry.name}-01`,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const releasesByMonth = groupSum(
    releaseInsights.map((release) => ({
      name: toMonthKey(release.date),
      value: 1,
    })),
  )
    .map((entry) => ({
      ...entry,
      date: `${entry.name}-01`,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const releaseDatesSorted = releaseInsights
    .map((release) => new Date(release.date).getTime())
    .sort((a, b) => a - b)

  const cadenceDays = releaseDatesSorted
    .slice(1)
    .map((value, index) => Math.round((value - releaseDatesSorted[index]) / (1000 * 60 * 60 * 24)))

  const cadenceMedianDays = median(cadenceDays)

  const cadenceSeries = cadenceDays.map((value, index) => ({
    name: `Gap ${index + 1}`,
    value,
  }))

  const releaseLagByRelease = filteredReleases
    .filter((release) => Boolean(release.published_at))
    .map((release) => {
      const created = new Date(release.created_at).getTime()
      const published = new Date(release.published_at || release.created_at).getTime()
      const lagDays = Math.max(0, (published - created) / (1000 * 60 * 60 * 24))
      return {
        name: release.tag_name,
        value: Number(lagDays.toFixed(2)),
        date: getReleaseDate(release),
      }
    })

  const releaseLagBuckets = (() => {
    const buckets = [
      { name: 'Same day', min: 0, max: 1, value: 0 },
      { name: '1-3d', min: 1, max: 3, value: 0 },
      { name: '3-7d', min: 3, max: 7, value: 0 },
      { name: '7-14d', min: 7, max: 14, value: 0 },
      { name: '14d+', min: 14, max: Infinity, value: 0 },
    ]
    releaseLagByRelease.forEach((release) => {
      const bucket = buckets.find((item) => release.value >= item.min && release.value < item.max)
      if (bucket) bucket.value += 1
    })
    return buckets.map(({ name, value }) => ({ name, value }))
  })()

  const adoptionBuckets = (() => {
    const buckets = [
      { name: '0-30d', min: 0, max: 30, value: 0 },
      { name: '31-90d', min: 31, max: 90, value: 0 },
      { name: '91-180d', min: 91, max: 180, value: 0 },
      { name: '181-365d', min: 181, max: 365, value: 0 },
      { name: '365d+', min: 366, max: Infinity, value: 0 },
    ]
    releaseInsights.forEach((release) => {
      const daysSince = Math.max(
        0,
        Math.round((now - new Date(release.date).getTime()) / (1000 * 60 * 60 * 24)),
      )
      const bucket = buckets.find((item) => daysSince >= item.min && daysSince <= item.max)
      if (bucket) bucket.value += release.downloads
    })
    return buckets.map(({ name, value }) => ({ name, value }))
  })()

  const assetFreshnessBuckets = (() => {
    const buckets = [
      { name: 'Before release', min: -Infinity, max: 0, value: 0 },
      { name: '0-1d', min: 0, max: 1, value: 0 },
      { name: '1-3d', min: 1, max: 3, value: 0 },
      { name: '3-7d', min: 3, max: 7, value: 0 },
      { name: '7d+', min: 7, max: Infinity, value: 0 },
    ]
    filteredReleases.forEach((release) => {
      const releaseDate = getReleaseDate(release)
      release.assets.forEach((asset) => {
        const deltaDays =
          (new Date(asset.created_at).getTime() - new Date(releaseDate).getTime()) /
          (1000 * 60 * 60 * 24)
        const bucket = buckets.find((item) => deltaDays >= item.min && deltaDays < item.max)
        if (bucket) bucket.value += asset.download_count
      })
    })
    return buckets.map(({ name, value }) => ({ name, value }))
  })()

  const assetEfficiencyTop = assets
    .map((asset) => {
      const sizeMb = asset.size / (1024 * 1024)
      if (!sizeMb || !asset.downloads) return null
      return {
        name: asset.name,
        value: asset.downloads / sizeMb,
        downloads: asset.downloads,
        size: asset.size,
      }
    })
    .filter((item): item is { name: string; value: number; downloads: number; size: number } => Boolean(item))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  const assetChurn = (() => {
    const churn: { name: string; added: number; removed: number }[] = []
    const releasesSorted = [...filteredReleases].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )
    for (let i = 1; i < releasesSorted.length; i += 1) {
      const prev = new Set(releasesSorted[i - 1].assets.map((asset) => asset.name))
      const current = new Set(releasesSorted[i].assets.map((asset) => asset.name))
      let added = 0
      let removed = 0
      current.forEach((name) => {
        if (!prev.has(name)) added += 1
      })
      prev.forEach((name) => {
        if (!current.has(name)) removed += 1
      })
      churn.push({
        name: releasesSorted[i].tag_name,
        added,
        removed,
      })
    }
    return churn
  })()

  const downloadsSorted = [...releaseInsights].sort((a, b) => b.downloads - a.downloads)
  const totalDownloadsByRelease = downloadsSorted.reduce((sum, release) => sum + release.downloads, 0)
  let cumulative = 0
  const paretoCurve = downloadsSorted.map((release, index) => {
    cumulative += release.downloads
    return {
      rank: index + 1,
      name: release.tag,
      downloads: release.downloads,
      cumulative: totalDownloadsByRelease ? (cumulative / totalDownloadsByRelease) * 100 : 0,
    }
  })

  const meanDownloads = average(releaseInsights.map((release) => release.downloads))
  const stdDownloads = stddev(
    releaseInsights.map((release) => release.downloads),
    meanDownloads,
  )
  const anomalies = releaseInsights
    .map((release) => {
      const zScore = stdDownloads ? (release.downloads - meanDownloads) / stdDownloads : 0
      return { name: release.tag, downloads: release.downloads, zScore, date: release.date }
    })
    .filter((release) => release.zScore >= 2)
    .sort((a, b) => b.zScore - a.zScore)
    .slice(0, 6)

  const assetsByType = groupSum(assets.map((asset) => ({ name: asset.type, value: asset.downloads }))).sort(
    (a, b) => b.value - a.value,
  )
  const assetsByOs = groupSum(assets.map((asset) => ({ name: asset.os, value: asset.downloads }))).sort(
    (a, b) => b.value - a.value,
  )
  const assetsByArch = groupSum(assets.map((asset) => ({ name: asset.arch, value: asset.downloads }))).sort(
    (a, b) => b.value - a.value,
  )

  const totalDownloads = assets.reduce((sum, asset) => sum + asset.downloads, 0)
  const totalAssets = assets.length
  const totalSize = assets.reduce((sum, asset) => sum + asset.size, 0)

  const unknownShare = {
    os: totalDownloads ? (assetsByOs.find((item) => item.name === 'unknown')?.value || 0) / totalDownloads : 0,
    arch: totalDownloads ? (assetsByArch.find((item) => item.name === 'unknown')?.value || 0) / totalDownloads : 0,
  }

  const coverageMatrix = (() => {
    const releasesLatest = [...releaseInsights]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-8)
    if (!releasesLatest.length) {
      return { releases: [], rows: [], maxValue: 0 }
    }
    const releaseKeys = releasesLatest.map((release) => release.tag)
    const releaseIndex = new Map<string, number>()
    releaseKeys.forEach((tag, index) => releaseIndex.set(tag, index))

    const comboTotals = new Map<string, { os: string; arch: string; total: number; values: number[] }>()
    assets.forEach((asset) => {
      const idx = releaseIndex.get(asset.releaseTag)
      if (idx === undefined) return
      const key = `${asset.os}/${asset.arch}`
      if (!comboTotals.has(key)) {
        comboTotals.set(key, {
          os: asset.os,
          arch: asset.arch,
          total: 0,
          values: Array(releaseKeys.length).fill(0),
        })
      }
      const entry = comboTotals.get(key)
      if (!entry) return
      entry.total += asset.downloads
      entry.values[idx] += asset.downloads
    })
    const rows = Array.from(comboTotals.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 10)
      .map(([key, entry]) => ({
        key,
        os: entry.os,
        arch: entry.arch,
        values: entry.values,
      }))
    const maxValue = rows.reduce(
      (max, row) => Math.max(max, ...row.values),
      0,
    )
    return {
      releases: releasesLatest.map((release) => ({ tag: release.tag, date: release.date })),
      rows,
      maxValue,
    }
  })()

  return {
    releases: releaseInsights,
    assets,
    impactSpeed,
    semverDownloads,
    semverCounts,
    paretoCurve,
    releaseLagBuckets,
    releaseLagByRelease,
    adoptionBuckets,
    assetFreshnessBuckets,
    assetEfficiencyTop,
    assetChurn,
    anomalies,
    coverageMatrix,
    unknownShare,
    totals: {
      downloads: totalDownloads,
      assets: totalAssets,
      size: totalSize,
      releases: releaseInsights.length,
      prereleases: prereleaseCount,
      drafts: draftCount,
    },
    releaseDates: {
      first: releaseInsights[0]?.date || null,
      latest: releaseInsights[releaseInsights.length - 1]?.date || null,
      cadenceMedianDays,
    },
    downloadsByRelease,
    downloadsByMonth,
    releasesByMonth,
    cadenceDays: cadenceSeries,
    assetsByType,
    assetsByOs,
    assetsByArch,
  }
}
