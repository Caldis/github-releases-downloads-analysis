export const timeRanges = [
  { value: 'all', label: 'All time' },
  { value: '12m', label: 'Last 12 months' },
  { value: '6m', label: 'Last 6 months' },
]

export type TimeRange = (typeof timeRanges)[number]['value']

export const filterByTimeRange = <T,>(
  items: T[],
  getDate: (item: T) => string,
  range: TimeRange,
) => {
  if (range === 'all') return items
  const now = new Date()
  const months = range === '12m' ? 12 : 6
  const threshold = new Date(now.getFullYear(), now.getMonth() - months, now.getDate())
  return items.filter((item) => new Date(getDate(item)).getTime() >= threshold.getTime())
}
