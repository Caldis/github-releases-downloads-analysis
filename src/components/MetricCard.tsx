type MetricCardProps = {
  label: string
  value: string
  hint?: string
}

export const MetricCard = ({ label, value, hint }: MetricCardProps) => (
  <div className="rounded-lg border border-border bg-white/80 p-4">
    <div className="text-xs uppercase tracking-wide text-neutral-500">{label}</div>
    <div className="mt-2 text-xl font-semibold text-black font-mono">{value}</div>
    {hint ? <div className="mt-1 text-xs text-neutral-500">{hint}</div> : null}
  </div>
)
