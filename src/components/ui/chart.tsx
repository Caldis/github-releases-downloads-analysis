import * as React from 'react'
import type { TooltipProps } from 'recharts'
import { cn } from '@/lib/utils'

export const chartPalette = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

export function ChartContainer({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={cn('h-[320px] w-full', className)}>{children}</div>
}

type ChartTooltipContentProps = TooltipProps<number, string> & {
  valueFormatter?: (value: number) => string
  labelFormatter?: (label: string) => string
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  valueFormatter,
  labelFormatter,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-md border border-border bg-white px-3 py-2 text-xs shadow-lg">
      <div className="mb-2 text-[11px] uppercase tracking-wide text-neutral-500">
        {labelFormatter ? labelFormatter(String(label)) : label}
      </div>
      <div className="flex flex-col gap-1">
        {payload.map((entry, index) => (
          <div key={`${entry.name}-${index}`} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: entry.color || chartPalette[index % chartPalette.length] }}
              />
              <span className="text-neutral-700">{entry.name}</span>
            </div>
            <span className="font-semibold text-black">
              {valueFormatter && typeof entry.value === 'number'
                ? valueFormatter(entry.value)
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
