import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import {
  ArrowUpRight,
  Dot,
  Download,
  GitBranch,
  HeartPulse,
  Loader2,
} from 'lucide-react'
import { fetchRepoData, getGitHubRateLimitKind, isGitHubRateLimitError } from '@/lib/github'
import { buildMetrics } from '@/lib/metrics'
import {
  formatBytes,
  formatCompact,
  formatDate,
  formatMonth,
  formatNumber,
  formatPercentage,
  formatRelativeTime,
} from '@/lib/format'
import { parseRepoInput } from '@/lib/parser'
import type { RateLimitInfo } from '@/lib/types'
import { chartPalette, ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { ChurnTooltip, ParetoTooltip, ScatterTooltip } from '@/components/ChartTooltips'
import { MetricCard } from '@/components/MetricCard'
import { SectionHeading } from '@/components/SectionHeading'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { sectionNav } from '@/lib/navigation'
import { getStoredRecents, getStoredToken, saveRecentRepos, saveTokenPreference } from '@/lib/storage'
import { filterByTimeRange, timeRanges, type TimeRange } from '@/lib/timeRanges'
import { cn } from '@/lib/utils'

const sampleRepos = ['vercel/next.js', 'tauri-apps/tauri', 'hashicorp/terraform']
const developerLinks = [
  { href: '/docs/', label: 'Docs' },
  { href: '/developers/', label: 'Developers' },
  { href: '/pricing.md', label: 'Pricing' },
  { href: '/agent/', label: 'Agent page' },
  { href: '/agent.md', label: 'Agent markdown' },
  { href: '/llms.txt', label: 'llms.txt' },
  { href: '/llms-full.txt', label: 'llms-full.txt' },
  { href: '/openapi.json', label: 'OpenAPI' },
  { href: '/.well-known/api-catalog', label: 'API catalog' },
  { href: '/.well-known/agent.json', label: 'Agent JSON' },
  { href: '/errors.md', label: 'Error guide' },
]

const homepageHighlights = [
  'Release asset download totals, monthly momentum, and median release cadence.',
  'Package breakdowns by operating system, CPU architecture, and artifact file type.',
  'Stable release and prerelease filtering for public GitHub repositories.',
  'Release lag, freshness, churn, Pareto concentration, coverage, and anomaly views.',
]

const positioningNotes = [
  {
    title: 'Compared with GitHub release pages',
    body: 'GitHub shows raw download counters next to individual assets. GRA turns those counters into maintainer reports: cadence, platform mix, package coverage, download concentration, and release momentum.',
  },
  {
    title: 'Compared with registry analytics',
    body: 'Registry dashboards answer npm, PyPI, crates.io, Docker, or package install questions. GRA focuses on uploaded GitHub release assets such as installers, binaries, checksums, archives, and package bundles.',
  },
  {
    title: 'Compared with product analytics',
    body: 'Product analytics tools track private user events and funnels. GRA does not collect telemetry; it reads public GitHub release metadata in the browser.',
  },
]

const formatRetryTime = (rateLimit: RateLimitInfo | undefined) => {
  if (rateLimit?.retryAfter) {
    const minutes = Math.max(1, Math.ceil(rateLimit.retryAfter / 60))
    return minutes === 1 ? 'in about 1 minute' : `in about ${minutes} minutes`
  }
  if (!rateLimit?.reset) return 'later'
  const resetTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(rateLimit.reset * 1000))
  return `after ${resetTime}`
}

const AgentMode = () => (
  <main className="mx-auto max-w-5xl px-6 py-10 text-sm text-neutral-800">
    <section className="space-y-4">
      <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">GRA Release Radar</p>
      <h1 className="text-3xl font-semibold tracking-tight">Agent-readable product profile</h1>
      <p>
        GRA Release Radar is a free client-only GitHub release analytics tool. It analyzes public
        release asset downloads, release cadence, platform adoption, package coverage, and
        repository context directly in the browser.
      </p>
    </section>

    <section className="mt-8">
      <h2 className="text-xl font-semibold">Capabilities</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li>Analyze GitHub release asset download counts for public repositories.</li>
        <li>Group downloads by release, month, operating system, architecture, and file type.</li>
        <li>Show cadence, release lag, asset freshness, asset churn, adoption buckets, and anomaly signals.</li>
        <li>Use an optional user-supplied GitHub token in the browser for higher GitHub API limits.</li>
      </ul>
    </section>

    <section className="mt-8">
      <h2 className="text-xl font-semibold">When to use</h2>
      <p className="mt-3">
        Use GRA when a user asks for public GitHub release download analytics, release cadence,
        package coverage, platform adoption, architecture adoption, or a browser-only maintainer
        report for a public repository.
      </p>
    </section>

    <section className="mt-8">
      <h2 className="text-xl font-semibold">Authentication and limits</h2>
      <p className="mt-3">
        Authentication is optional. Unauthenticated requests use the user's IP-based GitHub REST API
        quota. Authenticated requests use the user's GitHub account quota. Recommended token
        permissions are Metadata read-only and Contents read-only. Tokens are not sent to a GRA
        backend.
      </p>
    </section>

    <section className="mt-8">
      <h2 className="text-xl font-semibold">Machine-readable resources</h2>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        {developerLinks.map((link) => (
          <div key={link.href} className="rounded-md border border-border bg-white p-3">
            <dt className="font-semibold">{link.label}</dt>
            <dd>
              <a className="text-neutral-600 underline" href={link.href}>{link.href}</a>
            </dd>
          </div>
        ))}
      </dl>
    </section>

    <section className="mt-8">
      <h2 className="text-xl font-semibold">Current limitations</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li>No first-party hosted analysis API is currently operated.</li>
        <li>No live MCP transport endpoint, SDK, CLI, webhook receiver, or streaming API is currently operated.</li>
        <li>GitHub source archive downloads are not counted by GitHub release asset download counters.</li>
      </ul>
    </section>
  </main>
)

export default function App() {
  const params = new URLSearchParams(window.location.search)
  const isAgentMode = params.get('mode') === 'agent'
  const initialRepo = params.get('repo') || params.get('url') || ''

  if (isAgentMode) {
    return <AgentMode />
  }

  return <ReleaseRadarApp initialRepo={initialRepo} />
}

function ReleaseRadarApp({ initialRepo }: { initialRepo: string }) {

  const [input, setInput] = useState(initialRepo)
  const [repoId, setRepoId] = useState(() => parseRepoInput(initialRepo))
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [token, setToken] = useState(() => getStoredToken())
  const [tokenInput, setTokenInput] = useState(() => getStoredToken())
  const [rememberToken, setRememberToken] = useState(() => Boolean(getStoredToken()))
  const [showToken, setShowToken] = useState(false)
  const [recentRepos, setRecentRepos] = useState<string[]>(() => getStoredRecents())
  const [includePrerelease, setIncludePrerelease] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRange>('all')
  const [activeSection, setActiveSection] = useState('overview')

  useEffect(() => {
    saveTokenPreference(token, rememberToken)
  }, [rememberToken, token])

  const updateRecentRepos = useCallback((repo: string) => {
    const value = repo.trim()
    if (!value) return
    setRecentRepos((prev) => {
      const next = [value, ...prev.filter((item) => item !== value)].slice(0, 5)
      saveRecentRepos(next)
      return next
    })
  }, [])

  useEffect(() => {
    if (!repoId) return
    updateRecentRepos(`${repoId.owner}/${repoId.repo}`)
  }, [repoId?.owner, repoId?.repo, updateRecentRepos])

  const query = useQuery({
    queryKey: ['repo', repoId?.owner, repoId?.repo, token || 'anon'],
    queryFn: () => {
      if (!repoId) throw new Error('Missing repository identifier')
      return fetchRepoData(repoId.owner, repoId.repo, token || undefined)
    },
    enabled: !!repoId,
  })

  const statusError = query.error as (Error & { status?: number; rateLimit?: RateLimitInfo }) | null
  const isRateLimited = statusError ? isGitHubRateLimitError(statusError) : false
  const rateLimitKind = statusError ? getGitHubRateLimitKind(statusError) : 'none'
  const notFound = statusError?.status === 404
  const authError =
    statusError?.status === 401 ||
    (statusError?.status === 403 && !isRateLimited)
  const showTokenPanel = Boolean(isRateLimited || authError)
  const isEmptyState = !query.data && !statusError && !query.isLoading
  const hasTokenInputChange = tokenInput.trim() !== token
  const rateLimitMessage =
    rateLimitKind === 'secondary'
      ? `GitHub secondary rate limit reached. Wait ${formatRetryTime(statusError?.rateLimit)} before retrying, or apply a token.`
      : `GitHub API rate limit reached for this network or token. Try again ${formatRetryTime(statusError?.rateLimit)} or apply a token.`

  const metrics = useMemo(() => {
    if (!query.data) return null
    return buildMetrics(query.data, includePrerelease)
  }, [query.data, includePrerelease])

  useEffect(() => {
    const sections = sectionNav
      .map((section) => document.getElementById(section.id))
      .filter((node): node is HTMLElement => Boolean(node))
    if (!sections.length) return

    let rafId = 0
    const updateActive = () => {
      const offset = window.innerHeight * 0.35
      let current = sections[0]?.id || 'overview'
      sections.forEach((section) => {
        const top = section.getBoundingClientRect().top
        if (top - offset <= 0) {
          current = section.id
        }
      })
      setActiveSection(current)
    }

    const onScroll = () => {
      if (rafId) return
      rafId = window.requestAnimationFrame(() => {
        updateActive()
        rafId = 0
      })
    }

    updateActive()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', updateActive)
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', updateActive)
    }
  }, [metrics, statusError, query.isLoading])

  const filteredDownloadsByRelease = useMemo(() => {
    if (!metrics) return []
    return filterByTimeRange(metrics.downloadsByRelease, (item) => item.date, timeRange)
  }, [metrics, timeRange])

  const filteredDownloadsByMonth = useMemo(() => {
    if (!metrics) return []
    return filterByTimeRange(metrics.downloadsByMonth, (item) => item.date, timeRange)
  }, [metrics, timeRange])

  const filteredReleasesByMonth = useMemo(() => {
    if (!metrics) return []
    return filterByTimeRange(metrics.releasesByMonth, (item) => item.date, timeRange)
  }, [metrics, timeRange])

  const cadenceSeries = useMemo(() => {
    if (!metrics) return []
    return metrics.cadenceDays
  }, [metrics])

  const topAssets = useMemo(() => {
    if (!metrics) return []
    return [...metrics.assets]
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 8)
  }, [metrics])

  const latestReleases = useMemo(() => {
    if (!metrics) return []
    return [...metrics.releases]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8)
  }, [metrics])

  const impactSpeedSeries = useMemo(() => {
    if (!metrics) return []
    return filterByTimeRange(metrics.impactSpeed, (item) => item.date, timeRange)
  }, [metrics, timeRange])

  const churnSeries = useMemo(() => {
    if (!metrics) return []
    return metrics.assetChurn.slice(-8).map((item) => ({
      ...item,
      removed: -item.removed,
    }))
  }, [metrics])

  const commitSeries = useMemo(() => {
    if (!query.data?.commitActivity) return []
    return query.data.commitActivity.map((week) => ({
      name: new Date(week.week * 1000).toISOString(),
      value: week.total,
    }))
  }, [query.data?.commitActivity])

  const repo = query.data?.repo

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const parsed = parseRepoInput(input)
    if (!parsed) {
      setErrorMessage('Enter a repo as owner/name or a GitHub URL.')
      return
    }
    setErrorMessage(null)
    setRepoId(parsed)
    const next = new URLSearchParams(window.location.search)
    next.set('repo', `${parsed.owner}/${parsed.repo}`)
    window.history.replaceState({}, '', `${window.location.pathname}?${next.toString()}`)
    updateRecentRepos(`${parsed.owner}/${parsed.repo}`)
  }

  const handleRepoSelect = (repo: string) => {
    setInput(repo)
    const parsed = parseRepoInput(repo)
    if (!parsed) return
    setRepoId(parsed)
    const next = new URLSearchParams(window.location.search)
    next.set('repo', `${parsed.owner}/${parsed.repo}`)
    window.history.replaceState({}, '', `${window.location.pathname}?${next.toString()}`)
    updateRecentRepos(`${parsed.owner}/${parsed.repo}`)
  }

  return (
    <div
      className={cn(
        'min-h-screen px-6 transition-all duration-700 ease-out',
        isEmptyState ? 'py-16 lg:py-20' : 'py-10',
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-12">
        <header
          id="overview"
          className={cn(
            'flex flex-col gap-8 transition-transform duration-700 ease-out will-change-transform',
            isEmptyState ? 'translate-y-6 lg:translate-y-10' : 'translate-y-0',
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-white">
                <GitBranch className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">GRA Release Radar</div>
                <div className="text-lg font-semibold">GitHub release insights</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <nav className="flex flex-wrap gap-3 text-xs text-neutral-500" aria-label="Developer resources">
                <a className="underline underline-offset-4" href="/docs/">Docs</a>
                <a className="underline underline-offset-4" href="/developers/">Developers</a>
                <a className="underline underline-offset-4" href="/llms.txt">llms.txt</a>
                <a className="underline underline-offset-4" href="/agent/">Agent page</a>
                <a className="underline underline-offset-4" href="/?mode=agent">Agent mode</a>
              </nav>
              <Badge variant="inverse">
                {token ? 'Token enabled · local only' : 'Client-only · zero token'}
              </Badge>
            </div>
          </div>

          <div
            className={cn(
              'grid gap-6 lg:grid-cols-[1.2fr_0.8fr]',
              isEmptyState ? 'items-center' : '',
            )}
          >
            <div className="space-y-6">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight">
                Understand release cadence, downloads, and platform adoption.
              </h1>
              <p className="max-w-xl text-sm text-neutral-600">
                GRA Release Radar is a free GitHub release analytics tool for maintainers and
                teams. It analyzes public release asset downloads, release cadence, package
                coverage, platform adoption, and repository context. Everything runs locally in
                your browser.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                <div className="flex items-center gap-1">
                  <HeartPulse className="h-4 w-4" />
                  <span>Public API signals</span>
                </div>
                <Dot className="h-4 w-4" />
                <span>Client-only, token optional</span>
                <Dot className="h-4 w-4" />
                <span>Rate-limit aware</span>
              </div>
            </div>

            <Card
              className={cn(
                'glass animate-fade-up transition-transform duration-700 ease-out',
                isEmptyState ? 'translate-y-0' : '-translate-y-2',
              )}
            >
              <CardHeader>
                <CardTitle>Analyze a repository</CardTitle>
                <CardDescription>Paste owner/repo or a GitHub URL.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                  <Input
                    placeholder="owner/repo or https://github.com/owner/repo"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                  />
                  {errorMessage ? <p className="text-xs text-red-600">{errorMessage}</p> : null}
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" size="lg" className="w-full">
                      <ArrowUpRight className="h-4 w-4" />
                      Analyze releases
                    </Button>
                    <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
                      {sampleRepos.map((repo) => (
                        <button
                          key={repo}
                          type="button"
                          className="rounded-full border border-border px-3 py-1 font-mono hover:bg-white"
                          onClick={() => handleRepoSelect(repo)}
                        >
                          {repo}
                        </button>
                      ))}
                      {recentRepos.length ? (
                        <div className="flex w-full flex-wrap gap-2 pt-2 text-[11px] text-neutral-500">
                          <span className="w-full uppercase tracking-wide text-neutral-400">Recent</span>
                          {recentRepos.map((repo) => (
                            <button
                              key={repo}
                              type="button"
                              className="rounded-full border border-border px-3 py-1 font-mono hover:bg-white"
                              onClick={() => handleRepoSelect(repo)}
                            >
                              {repo}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </form>
                {showTokenPanel ? (
                  <div className="mt-6 space-y-3 rounded-md border border-border bg-white/70 p-3 text-xs text-neutral-500">
                    <div className="flex items-center justify-between">
                      <span className="uppercase tracking-wide">Optional GitHub token</span>
                      {token ? <Badge variant="subtle">Token in use</Badge> : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Input
                        className="flex-1"
                        type={showToken ? 'text' : 'password'}
                        placeholder="ghp_... or github_pat_..."
                        value={tokenInput}
                        autoComplete="off"
                        onChange={(event) => setTokenInput(event.target.value)}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={!hasTokenInputChange}
                        onClick={() => setToken(tokenInput.trim())}
                      >
                        Apply
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowToken((prev) => !prev)}
                      >
                        {showToken ? 'Hide' : 'Show'}
                      </Button>
                      {token || tokenInput ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setToken('')
                            setTokenInput('')
                            setRememberToken(false)
                            setShowToken(false)
                          }}
                        >
                          Clear
                        </Button>
                      ) : null}
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-border text-black"
                        checked={rememberToken}
                        onChange={(event) => setRememberToken(event.target.checked)}
                      />
                      Remember on this device
                    </label>
                    <div className="text-[11px] leading-relaxed">
                      Create a fine-grained token with read-only access.{' '}
                      <a
                        className="underline"
                        href="https://github.com/settings/tokens?type=beta"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Get a token
                      </a>
                      .
                    </div>
                    <div className="text-[11px] leading-relaxed">
                      Recommended permissions: Metadata (read-only) + Contents (read-only). Set an
                      expiration date.
                    </div>
                    <div className="text-[11px] leading-relaxed">
                      Tokens are used only for requests to api.github.com and never leave your browser.
                    </div>
                  </div>
                ) : null}
                <div className="mt-4 text-xs text-neutral-500">
                  Private repositories are not accessible without authentication.
                </div>
              </CardContent>
            </Card>
          </div>

          {isEmptyState ? (
            <section className="space-y-8" aria-labelledby="homepage-context-title">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <h2 id="homepage-context-title" className="text-2xl font-semibold tracking-tight">
                    GitHub release analytics for project maintainers
                  </h2>
                  <p className="text-sm leading-6 text-neutral-600">
                    GRA helps answer practical release questions that GitHub does not summarize on
                    one page: which release assets get most downloads, whether downloads are
                    concentrated in a few files, how often the project publishes, which operating
                    systems and CPU architectures are represented, and whether recent releases have
                    complete artifact coverage.
                  </p>
                  <ul className="grid gap-2 text-sm text-neutral-700 sm:grid-cols-2">
                    {homepageHighlights.map((item) => (
                      <li key={item} className="rounded-md border border-border bg-white/70 p-3">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4 rounded-lg border border-border bg-white/70 p-5">
                  <h2 className="text-xl font-semibold">Pricing, privacy, and limits</h2>
                  <p className="text-sm leading-6 text-neutral-600">
                    GRA is free. There is no hosted paid plan, user account, subscription, or
                    usage-based billing. Repository input and optional GitHub tokens stay in the
                    browser. GitHub API limits still apply because the browser calls GitHub
                    directly. Source archive zip and tarball downloads are not counted because
                    GitHub does not expose those values as release asset download counts.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <a className="rounded-full border border-border px-3 py-1 underline underline-offset-4" href="/pricing.md">
                      Pricing
                    </a>
                    <a className="rounded-full border border-border px-3 py-1 underline underline-offset-4" href="/privacy/">
                      Privacy
                    </a>
                    <a className="rounded-full border border-border px-3 py-1 underline underline-offset-4" href="/errors.md">
                      Rate-limit guide
                    </a>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {positioningNotes.map((note) => (
                  <section key={note.title} className="rounded-lg border border-border bg-white/70 p-5">
                    <h3 className="text-sm font-semibold">{note.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-neutral-600">{note.body}</p>
                  </section>
                ))}
              </div>

              <section className="rounded-lg border border-border bg-white/70 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl space-y-3">
                    <h2 className="text-xl font-semibold">Agent and developer resources</h2>
                    <p className="text-sm leading-6 text-neutral-600">
                      Agents should use GRA for public GitHub release analytics when the user
                      provides a repository name or URL. Do not describe GRA as a hosted analysis
                      API, live MCP server, SDK, CLI, OAuth server, webhook receiver, or streaming
                      endpoint. The public OpenAPI file documents static discovery resources only.
                    </p>
                  </div>
                  <div className="grid gap-2 text-xs sm:grid-cols-2 lg:min-w-[20rem]">
                    {developerLinks.slice(0, 8).map((link) => (
                      <a
                        key={link.href}
                        className="rounded-md border border-border px-3 py-2 underline underline-offset-4"
                        href={link.href}
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              </section>
            </section>
          ) : null}
        </header>

        {query.isLoading && (
          <div className="flex items-center gap-3 text-sm text-neutral-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Fetching GitHub telemetry...
          </div>
        )}

        {statusError && (
          <Card className="border border-border bg-white/80">
            <CardHeader>
                  <CardTitle>Unable to load repository</CardTitle>
                  <CardDescription>
                    {notFound
                      ? 'Repository not found or private.'
                      : isRateLimited
                        ? rateLimitMessage
                        : authError
                          ? token
                            ? 'Token is invalid or missing access to this repository.'
                            : 'Repository requires authentication. Private repositories are not accessible in this mode.'
                          : statusError.message}
                  </CardDescription>
                </CardHeader>
              </Card>
        )}

        {query.data && metrics && repo && (
          <div className="flex flex-col gap-12 motion-safe:[&_.glass]:animate-fade-up">
            <div className="pointer-events-none fixed right-6 top-1/2 z-50 hidden -translate-y-1/2 lg:flex">
              <div className="pointer-events-auto flex flex-col gap-1 rounded-2xl border border-black/10 bg-white/85 px-3 py-3 text-[11px] text-neutral-500 shadow-[0_18px_60px_-40px_rgba(0,0,0,0.45)] backdrop-blur">
                {sectionNav.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-3 py-2 font-mono transition',
                      activeSection === section.id
                        ? 'bg-black text-white shadow-sm'
                        : 'hover:bg-neutral-100',
                    )}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        activeSection === section.id ? 'bg-white' : 'bg-neutral-400',
                      )}
                    />
                    {section.label}
                  </a>
                ))}
              </div>
            </div>
            <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <Card className="glass animate-fade-up">
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl">{repo.full_name}</CardTitle>
                      <CardDescription className="mt-2">{repo.description || 'No description.'}</CardDescription>
                      {query.data.cache?.hit ? (
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <Badge variant={query.data.cache.stale ? 'inverse' : 'subtle'}>
                            {query.data.cache.stale ? 'Stale cache' : 'Cached'} ·{' '}
                            {formatRelativeTime(query.data.cache.ageMs)}
                          </Badge>
                        </div>
                      ) : null}
                    </div>
                    <a
                      className="text-xs uppercase tracking-widest text-neutral-500"
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open on GitHub
                    </a>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {repo.language ? <Badge>{repo.language}</Badge> : null}
                    {repo.license?.spdx_id && repo.license.spdx_id !== 'NOASSERTION' ? (
                      <Badge variant="subtle">{repo.license.spdx_id}</Badge>
                    ) : null}
                    <Badge variant="subtle">Created {formatDate(repo.created_at)}</Badge>
                    <Badge variant="subtle">Updated {formatDate(repo.pushed_at)}</Badge>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <MetricCard label="Stars" value={formatCompact(repo.stargazers_count)} />
                    <MetricCard label="Forks" value={formatCompact(repo.forks_count)} />
                    <MetricCard label="Watchers" value={formatCompact(repo.subscribers_count)} />
                    <MetricCard label="Open issues" value={formatCompact(repo.open_issues_count)} />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass animate-fade-up animate-delay-1">
                <CardHeader>
                  <CardTitle>Release status</CardTitle>
                  <CardDescription>Downloads, assets, and cadence.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <MetricCard label="Total downloads" value={formatNumber(metrics.totals.downloads)} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <MetricCard label="Releases" value={formatNumber(metrics.totals.releases)} />
                    <MetricCard label="Assets" value={formatNumber(metrics.totals.assets)} />
                    <MetricCard
                      label="Median cadence"
                      value={metrics.releaseDates.cadenceMedianDays ? `${metrics.releaseDates.cadenceMedianDays} days` : '—'}
                    />
                    <MetricCard
                      label="Total size"
                      value={formatBytes(metrics.totals.size)}
                      hint="Combined release assets"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
                    <span>First: {metrics.releaseDates.first ? formatDate(metrics.releaseDates.first) : '—'}</span>
                    <Dot className="h-4 w-4" />
                    <span>Latest: {metrics.releaseDates.latest ? formatDate(metrics.releaseDates.latest) : '—'}</span>
                  </div>
                </CardContent>
              </Card>
            </section>

            {!metrics.releases.length && (
              <Card className="border border-border bg-white/80">
                <CardHeader>
                  <CardTitle>No releases detected</CardTitle>
                  <CardDescription>This repository has no public releases yet.</CardDescription>
                </CardHeader>
              </Card>
            )}

            <section id="signal-filters">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <SectionHeading
                  title="Signal filters"
                  description="Tune the view without losing raw fidelity."
                />
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <button
                    type="button"
                    className={`rounded-full border px-4 py-2 text-xs uppercase tracking-wide ${
                      includePrerelease ? 'border-black bg-black text-white' : 'border-border bg-white'
                    }`}
                    onClick={() => setIncludePrerelease((prev) => !prev)}
                  >
                    {includePrerelease ? 'Prereleases included' : 'Exclude prereleases'}
                  </button>
                  <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
                    <SelectTrigger className="w-[170px]">
                      <SelectValue placeholder="Range" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <section id="release-momentum">
              <SectionHeading
                title="Release momentum"
                description="Track volume, impact, and cadence across time." 
              />
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Downloads per release</CardTitle>
                    <CardDescription>Each release total summed from its assets.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={filteredDownloadsByRelease} margin={{ top: 10, left: -20, right: 10 }}>
                          <defs>
                            <linearGradient id="downloads-gradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.35} />
                              <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.05} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.08)" />
                          <XAxis
                            dataKey="name"
                            tickFormatter={(_, index) => {
                              const item = filteredDownloadsByRelease[index]
                              return item ? formatMonth(item.date) : ''
                            }}
                            interval="preserveStartEnd"
                            tick={{ fontSize: 11 }}
                          />
                          <YAxis tickFormatter={(value) => formatCompact(Number(value))} tick={{ fontSize: 11 }} />
                          <Tooltip content={<ChartTooltipContent valueFormatter={formatNumber} />} />
                          <Area
                            type="monotone"
                            dataKey="value"
                            name="Downloads"
                            stroke="hsl(var(--chart-2))"
                            fill="url(#downloads-gradient)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Release cadence</CardTitle>
                    <CardDescription>Months with the most shipping energy.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={filteredReleasesByMonth} margin={{ top: 10, left: -20, right: 10 }}>
                          <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.08)" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip content={<ChartTooltipContent valueFormatter={formatNumber} />} />
                          <Bar dataKey="value" name="Release count" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Downloads by month</CardTitle>
                    <CardDescription>Aggregated release downloads each month.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={filteredDownloadsByMonth} margin={{ top: 10, left: -20, right: 10 }}>
                          <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.08)" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                          <YAxis tickFormatter={(value) => formatCompact(Number(value))} tick={{ fontSize: 11 }} />
                          <Tooltip content={<ChartTooltipContent valueFormatter={formatNumber} />} />
                          <Bar dataKey="value" name="Downloads" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Time between releases</CardTitle>
                    <CardDescription>Release gaps in days.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={cadenceSeries} margin={{ top: 10, left: -20, right: 10 }}>
                          <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.08)" />
                          <XAxis dataKey="name" tick={false} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip content={<ChartTooltipContent valueFormatter={formatNumber} />} />
                          <Bar dataKey="value" name="Days" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section id="advanced-perspectives">
              <SectionHeading
                title="Advanced perspectives"
                description="Look beyond totals to understand release behavior and distribution."
              />
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Impact speed</CardTitle>
                    <CardDescription>Downloads per day vs release age.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {impactSpeedSeries.length ? (
                      <ChartContainer>
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{ top: 10, left: -10, right: 10 }}>
                            <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.08)" />
                            <XAxis
                              type="number"
                              dataKey="daysSince"
                              name="Days since release"
                              tick={{ fontSize: 11 }}
                            />
                            <YAxis
                              type="number"
                              dataKey="value"
                              name="Downloads per day"
                              tickFormatter={(value) => formatCompact(Number(value))}
                              tick={{ fontSize: 11 }}
                            />
                            <ZAxis type="number" dataKey="downloads" range={[60, 240]} name="Downloads" />
                            <Tooltip content={ScatterTooltip} />
                            <Scatter data={impactSpeedSeries} fill="hsl(var(--chart-1))" />
                          </ScatterChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : (
                      <p className="text-sm text-neutral-500">No release speed data yet.</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Download concentration</CardTitle>
                    <CardDescription>Pareto curve across releases.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {metrics.paretoCurve.length ? (
                      <ChartContainer>
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={metrics.paretoCurve} margin={{ top: 10, left: -20, right: 20 }}>
                            <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.08)" />
                            <XAxis dataKey="rank" tick={{ fontSize: 11 }} />
                            <YAxis
                              yAxisId="left"
                              tickFormatter={(value) => formatCompact(Number(value))}
                              tick={{ fontSize: 11 }}
                            />
                            <YAxis
                              yAxisId="right"
                              orientation="right"
                              domain={[0, 100]}
                              tickFormatter={(value) => `${value}%`}
                              tick={{ fontSize: 11 }}
                            />
                            <Tooltip content={ParetoTooltip} />
                            <Bar yAxisId="left" dataKey="downloads" name="Downloads" fill="hsl(var(--chart-3))" />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="cumulative"
                              name="Cumulative share"
                              stroke="hsl(var(--chart-1))"
                              strokeWidth={2}
                              dot={false}
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : (
                      <p className="text-sm text-neutral-500">Not enough data to build a curve.</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Semver mix</CardTitle>
                    <CardDescription>Downloads grouped by version step.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {metrics.semverDownloads.length ? (
                      <ChartContainer>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={metrics.semverDownloads} margin={{ top: 10, left: -20, right: 10 }}>
                            <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.08)" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis tickFormatter={(value) => formatCompact(Number(value))} tick={{ fontSize: 11 }} />
                            <Tooltip content={<ChartTooltipContent valueFormatter={formatNumber} />} />
                            <Bar dataKey="value" name="Downloads" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : (
                      <p className="text-sm text-neutral-500">No semantic version data detected.</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-neutral-500">
                      {metrics.semverCounts.map((entry) => (
                        <Badge key={entry.name} variant="subtle">
                          {entry.name}: {formatNumber(entry.value)}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Release lag distribution</CardTitle>
                    <CardDescription>Time from creation to publish.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {metrics.releaseLagBuckets.length ? (
                      <ChartContainer>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={metrics.releaseLagBuckets} margin={{ top: 10, left: -20, right: 10 }}>
                            <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.08)" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip content={<ChartTooltipContent valueFormatter={formatNumber} />} />
                            <Bar dataKey="value" name="Releases" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : (
                      <p className="text-sm text-neutral-500">No publish lag data available.</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Adoption curve</CardTitle>
                    <CardDescription>Downloads by release age bucket.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {metrics.adoptionBuckets.length ? (
                      <ChartContainer>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={metrics.adoptionBuckets} margin={{ top: 10, left: -20, right: 10 }}>
                            <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.08)" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis tickFormatter={(value) => formatCompact(Number(value))} tick={{ fontSize: 11 }} />
                            <Tooltip content={<ChartTooltipContent valueFormatter={formatNumber} />} />
                            <Bar dataKey="value" name="Downloads" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : (
                      <p className="text-sm text-neutral-500">Adoption data is not available.</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Asset churn</CardTitle>
                    <CardDescription>Added vs removed assets per release.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {churnSeries.length ? (
                      <ChartContainer>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={churnSeries} margin={{ top: 10, left: -20, right: 10 }}>
                            <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.08)" />
                            <XAxis dataKey="name" tick={false} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip content={ChurnTooltip} />
                            <Bar dataKey="added" name="Added" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="removed" name="Removed" fill="hsl(var(--chart-4))" radius={[0, 0, 4, 4]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : (
                      <p className="text-sm text-neutral-500">Not enough releases to compare churn.</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="glass lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Risk & consistency</CardTitle>
                    <CardDescription>Outliers and naming quality signals.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-3">
                      {metrics.anomalies.length ? (
                        metrics.anomalies.map((release) => (
                          <div key={release.name} className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-black">{release.name}</div>
                              <div className="text-xs text-neutral-500">Z-score {release.zScore.toFixed(2)}</div>
                            </div>
                            <div className="text-right text-xs text-neutral-500">
                              <div className="text-sm font-semibold text-black">
                                {formatNumber(release.downloads)}
                              </div>
                              <div>{formatDate(release.date)}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-neutral-500">No extreme download anomalies detected.</p>
                      )}
                    </div>
                    <div className="grid gap-3">
                      <MetricCard
                        label="Unknown OS share"
                        value={formatPercentage(metrics.unknownShare.os)}
                        hint="Downloads without OS match"
                      />
                      <MetricCard
                        label="Unknown arch share"
                        value={formatPercentage(metrics.unknownShare.arch)}
                        hint="Downloads without arch match"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section id="asset-insights">
              <SectionHeading title="Asset insights" description="Decode what users actually download." />
              <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="grid gap-6">
                  <Card className="glass">
                    <CardHeader>
                      <CardTitle>Top assets</CardTitle>
                      <CardDescription>Most downloaded artifacts.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-[340px] overflow-auto pr-2">
                      {topAssets.length ? (
                        topAssets.map((asset) => (
                          <div key={asset.id} className="flex items-center justify-between gap-3">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-black">{asset.name}</span>
                              <span className="text-xs text-neutral-500">
                                {asset.releaseTag} · {formatDate(asset.releaseDate)} · {asset.os} · {asset.arch}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold">{formatNumber(asset.downloads)}</div>
                              <div className="text-xs text-neutral-500">{formatBytes(asset.size)}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-neutral-500">No asset downloads detected.</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="glass">
                    <CardHeader>
                      <CardTitle>Asset efficiency</CardTitle>
                      <CardDescription>Downloads per MB for top assets.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {metrics.assetEfficiencyTop.length ? (
                        <ChartContainer>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={metrics.assetEfficiencyTop}
                              layout="vertical"
                              margin={{ left: 20 }}
                            >
                              <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.08)" />
                              <XAxis type="number" tick={{ fontSize: 11 }} />
                              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                              <Tooltip
                                content={
                                  <ChartTooltipContent
                                    valueFormatter={(value) =>
                                      `${formatNumber(Math.round(Number(value)))} downloads/MB`
                                    }
                                  />
                                }
                              />
                              <Bar
                                dataKey="value"
                                name="Downloads/MB"
                                fill="hsl(var(--chart-3))"
                                radius={[0, 4, 4, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      ) : (
                        <p className="text-sm text-neutral-500">Efficiency data is not available.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <Card className="glass">
                    <CardHeader>
                      <CardTitle>Platform mix</CardTitle>
                      <CardDescription>Downloads by operating system.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Tooltip content={<ChartTooltipContent valueFormatter={formatNumber} />} />
                            <Legend verticalAlign="bottom" height={24} />
                            <Pie
                              data={metrics.assetsByOs}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={50}
                              outerRadius={90}
                              stroke="transparent"
                            >
                              {metrics.assetsByOs.map((entry, index) => (
                                <Cell
                                  key={`os-${entry.name}`}
                                  fill={chartPalette[index % chartPalette.length]}
                                />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  <Card className="glass">
                    <CardHeader>
                      <CardTitle>Artifact types</CardTitle>
                      <CardDescription>Downloads by file format.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={metrics.assetsByType} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.08)" />
                            <XAxis type="number" tick={{ fontSize: 11 }} />
                            <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                            <Tooltip content={<ChartTooltipContent valueFormatter={formatNumber} />} />
                            <Bar
                              dataKey="value"
                              name="Downloads"
                              fill="hsl(var(--chart-2))"
                              radius={[0, 4, 4, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  <Card className="glass">
                    <CardHeader>
                      <CardTitle>Architecture split</CardTitle>
                      <CardDescription>Downloads by CPU architecture.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={metrics.assetsByArch} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.08)" />
                            <XAxis type="number" tick={{ fontSize: 11 }} />
                            <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                            <Tooltip content={<ChartTooltipContent valueFormatter={formatNumber} />} />
                            <Bar
                              dataKey="value"
                              name="Downloads"
                              fill="hsl(var(--chart-4))"
                              radius={[0, 4, 4, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  <Card className="glass">
                    <CardHeader>
                      <CardTitle>Asset freshness</CardTitle>
                      <CardDescription>Download weight vs asset timing.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {metrics.assetFreshnessBuckets.length ? (
                        <ChartContainer>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics.assetFreshnessBuckets} margin={{ top: 10, left: -20, right: 10 }}>
                              <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.08)" />
                              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                              <YAxis tickFormatter={(value) => formatCompact(Number(value))} tick={{ fontSize: 11 }} />
                              <Tooltip content={<ChartTooltipContent valueFormatter={formatNumber} />} />
                              <Bar
                                dataKey="value"
                                name="Downloads"
                                fill="hsl(var(--chart-1))"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      ) : (
                        <p className="text-sm text-neutral-500">No asset timing data available.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            <section id="packaging-matrix">
              <SectionHeading
                title="Packaging matrix"
                description="OS and architecture coverage across recent releases."
              />
              <Card className="glass">
                <CardHeader>
                  <CardTitle>OS × Arch heatmap</CardTitle>
                  <CardDescription>Darker cells mean higher download concentration.</CardDescription>
                </CardHeader>
                <CardContent>
                  {metrics.coverageMatrix.rows.length ? (
                    <div className="space-y-2 text-xs text-neutral-600">
                      <div
                        className="grid gap-2"
                        style={{
                          gridTemplateColumns: `minmax(130px, 1.2fr) repeat(${metrics.coverageMatrix.releases.length}, minmax(36px, 1fr))`,
                        }}
                      >
                        <div className="text-[11px] uppercase tracking-wide text-neutral-400">OS / Arch</div>
                        {metrics.coverageMatrix.releases.map((release) => (
                          <div key={release.tag} className="text-[10px] text-neutral-500">
                            {release.tag}
                          </div>
                        ))}
                      </div>
                      {metrics.coverageMatrix.rows.map((row) => (
                        <div
                          key={row.key}
                          className="grid items-center gap-2"
                          style={{
                            gridTemplateColumns: `minmax(130px, 1.2fr) repeat(${metrics.coverageMatrix.releases.length}, minmax(36px, 1fr))`,
                          }}
                        >
                          <div className="text-[11px] font-mono text-neutral-700">
                            {row.os}/{row.arch}
                          </div>
                          {row.values.map((value, index) => {
                            const intensity = metrics.coverageMatrix.maxValue
                              ? value / metrics.coverageMatrix.maxValue
                              : 0
                            const alpha = 0.08 + intensity * 0.6
                            return (
                              <div
                                key={`${row.key}-${index}`}
                                className="h-6 rounded-sm border border-border"
                                title={`${metrics.coverageMatrix.releases[index]?.tag}: ${formatNumber(value)} downloads`}
                                style={{
                                  backgroundColor: `rgba(0, 0, 0, ${alpha})`,
                                }}
                              />
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-500">No coverage data available.</p>
                  )}
                </CardContent>
              </Card>
            </section>

            <section id="community-impact">
              <SectionHeading title="Community impact" description="How the repository grows around releases." />
              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Languages</CardTitle>
                    <CardDescription>Share of code by language.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={Object.entries(query.data.languages)
                            .map(([name, value]) => ({ name, value }))
                            .sort((a, b) => b.value - a.value)
                            .slice(0, 8)}
                          layout="vertical"
                          margin={{ left: 20 }}
                        >
                          <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.08)" />
                          <XAxis type="number" tick={{ fontSize: 11 }} />
                          <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                          <Tooltip
                            content={<ChartTooltipContent valueFormatter={(value) => formatBytes(Number(value))} />}
                          />
                          <Bar dataKey="value" name="Bytes" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Top contributors</CardTitle>
                    <CardDescription>Highest commit volume.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {query.data.contributors.length ? (
                        query.data.contributors.slice(0, 8).map((contributor) => (
                          <div key={contributor.id} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={contributor.avatar_url}
                                alt={contributor.login}
                                className="h-8 w-8 rounded-full border border-border"
                              />
                              <a
                                href={contributor.html_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm font-medium"
                              >
                                {contributor.login}
                              </a>
                            </div>
                            <span className="text-sm font-semibold">{formatNumber(contributor.contributions)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-neutral-500">Contributor data not available.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Commit activity</CardTitle>
                    <CardDescription>Weekly commits in the last year.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {commitSeries.length ? (
                      <ChartContainer>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={commitSeries} margin={{ top: 10, left: -20, right: 10 }}>
                            <defs>
                              <linearGradient id="commit-gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(var(--chart-5))" stopOpacity={0.35} />
                                <stop offset="100%" stopColor="hsl(var(--chart-5))" stopOpacity={0.05} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.08)" />
                            <XAxis
                              dataKey="name"
                              tickFormatter={(value) => formatMonth(value as string)}
                              tick={{ fontSize: 11 }}
                            />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip content={<ChartTooltipContent valueFormatter={formatNumber} />} />
                            <Area
                              type="monotone"
                              dataKey="value"
                              name="Commits"
                              stroke="hsl(var(--chart-5))"
                              fill="url(#commit-gradient)"
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : (
                      <p className="text-sm text-neutral-500">Commit activity is still being generated by GitHub.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </section>

            <section id="release-ledger">
              <SectionHeading title="Release ledger" description="Latest releases and the assets that shipped." />
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Latest releases</CardTitle>
                    <CardDescription>Most recent publish activity.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {latestReleases.map((release) => (
                      <div key={release.id} className="flex items-start justify-between gap-3">
                        <div>
                          <a
                            href={release.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-semibold text-black"
                          >
                            {release.tag}
                          </a>
                          <div className="text-xs text-neutral-500">{formatDate(release.date)}</div>
                        </div>
                        <div className="text-right text-xs text-neutral-500">
                          <div className="text-sm font-semibold text-black">{formatNumber(release.downloads)}</div>
                          <div>{release.assets} assets · {formatBytes(release.size)}</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Repository pulse</CardTitle>
                    <CardDescription>External stats & API health.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <MetricCard label="Stars" value={formatNumber(repo.stargazers_count)} />
                      <MetricCard label="Forks" value={formatNumber(repo.forks_count)} />
                      <MetricCard label="Prereleases" value={formatNumber(metrics.totals.prereleases)} />
                      <MetricCard label="Drafts" value={formatNumber(metrics.totals.drafts)} />
                    </div>
                    <Separator />
                    <div className="text-xs text-neutral-500">
                      {query.data.rateLimit.remaining !== null ? (
                        <span>
                          GitHub API remaining: {query.data.rateLimit.remaining}
                        </span>
                      ) : (
                        <span>Rate limit status unavailable.</span>
                      )}
                      {query.data.truncated ? (
                        <span className="block mt-2">Release list truncated to 1,000 records.</span>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <footer className="pb-8 text-xs text-neutral-500">
              <div className="flex flex-wrap items-center gap-3">
                <Download className="h-4 w-4" />
                Data sourced from public GitHub REST endpoints. Source archives (zip/tar) are not counted by GitHub.
              </div>
              <nav className="mt-4 flex flex-wrap gap-3" aria-label="Developer and agent resources">
                {developerLinks.map((link) => (
                  <a key={link.href} className="underline underline-offset-4" href={link.href}>
                    {link.label}
                  </a>
                ))}
                <a className="underline underline-offset-4" href="/?mode=agent">
                  Agent mode
                </a>
              </nav>
            </footer>
          </div>
        )}
      </div>
    </div>
  )
}
