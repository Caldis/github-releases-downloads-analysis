import type { TooltipProps } from 'recharts'

import { formatNumber, formatPercentage } from '@/lib/format'

export const ScatterTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null
  const data = payload[0]?.payload as {
    name: string
    value: number
    downloads: number
    daysSince: number
  }
  if (!data) return null
  return (
    <div className="rounded-md border border-border bg-white px-3 py-2 text-xs shadow-lg">
      <div className="mb-2 text-[11px] uppercase tracking-wide text-neutral-500">{data.name}</div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-neutral-700">Downloads/day</span>
          <span className="font-semibold text-black">{formatNumber(Math.round(data.value))}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-neutral-700">Total downloads</span>
          <span className="font-semibold text-black">{formatNumber(data.downloads)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-neutral-700">Days since</span>
          <span className="font-semibold text-black">{formatNumber(data.daysSince)}</span>
        </div>
      </div>
    </div>
  )
}

export const ParetoTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null
  const entry = payload[0]?.payload as { name: string; downloads: number; cumulative: number }
  if (!entry) return null
  return (
    <div className="rounded-md border border-border bg-white px-3 py-2 text-xs shadow-lg">
      <div className="mb-2 text-[11px] uppercase tracking-wide text-neutral-500">{entry.name}</div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-neutral-700">Downloads</span>
          <span className="font-semibold text-black">{formatNumber(entry.downloads)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-neutral-700">Cumulative share</span>
          <span className="font-semibold text-black">{formatPercentage(entry.cumulative / 100)}</span>
        </div>
      </div>
    </div>
  )
}

export const ChurnTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null
  const entry = payload[0]?.payload as { name: string; added: number; removed: number }
  if (!entry) return null
  return (
    <div className="rounded-md border border-border bg-white px-3 py-2 text-xs shadow-lg">
      <div className="mb-2 text-[11px] uppercase tracking-wide text-neutral-500">{entry.name}</div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-neutral-700">Added</span>
          <span className="font-semibold text-black">{formatNumber(entry.added)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-neutral-700">Removed</span>
          <span className="font-semibold text-black">{formatNumber(Math.abs(entry.removed))}</span>
        </div>
      </div>
    </div>
  )
}
