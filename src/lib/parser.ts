export type RepoIdentifier = { owner: string; repo: string }

export const parseRepoInput = (value: string): RepoIdentifier | null => {
  const trimmed = value.trim()
  if (!trimmed) return null

  let ownerRepo = trimmed
  if (trimmed.includes('github.com')) {
    try {
      const normalized = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
      const url = new URL(normalized)
      const segments = url.pathname.split('/').filter(Boolean)
      if (segments.length >= 2) {
        ownerRepo = `${segments[0]}/${segments[1]}`
      }
    } catch (error) {
      return null
    }
  }

  const match = ownerRepo.match(/^([\w.-]+)\/([\w.-]+)$/)
  if (!match) return null

  const owner = match[1]
  const repo = match[2].replace(/\.git$/, '')
  return { owner, repo }
}
