import { describe, expect, it } from 'vitest'

import { formatBytes, formatRelativeTime } from './format'

describe('formatBytes', () => {
  it('formats bytes using binary units', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(1536)).toBe('1.5 KB')
    expect(formatBytes(10 * 1024)).toBe('10 KB')
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB')
  })
})

describe('formatRelativeTime', () => {
  it('formats finite durations into the largest useful unit', () => {
    expect(formatRelativeTime(59_000)).toBe('59s ago')
    expect(formatRelativeTime(60_000)).toBe('1m ago')
    expect(formatRelativeTime(2 * 60 * 60 * 1000)).toBe('2h ago')
    expect(formatRelativeTime(3 * 24 * 60 * 60 * 1000)).toBe('3d ago')
  })

  it('handles invalid and negative durations safely', () => {
    expect(formatRelativeTime(Number.NaN)).toBe('—')
    expect(formatRelativeTime(-1000)).toBe('0s ago')
  })
})
