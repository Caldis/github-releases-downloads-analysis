const TOKEN_STORAGE_KEY = 'release-radar:token'
const RECENT_REPOS_KEY = 'release-radar:recent-repos'

export const getStoredToken = () => {
  if (typeof window === 'undefined') return ''
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? ''
  } catch (error) {
    return ''
  }
}

export const getStoredRecents = () => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(RECENT_REPOS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as string[]
    return Array.isArray(parsed) ? parsed.slice(0, 5) : []
  } catch (error) {
    return []
  }
}

export const saveTokenPreference = (token: string, rememberToken: boolean) => {
  if (typeof window === 'undefined') return
  if (!rememberToken || !token) {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY)
    return
  }
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export const saveRecentRepos = (repos: string[]) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(RECENT_REPOS_KEY, JSON.stringify(repos))
}
