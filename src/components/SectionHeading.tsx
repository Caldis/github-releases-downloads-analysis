type SectionHeadingProps = {
  title: string
  description?: string
}

export const SectionHeading = ({ title, description }: SectionHeadingProps) => (
  <div className="mb-6">
    <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
    {description ? <p className="mt-2 text-sm text-muted">{description}</p> : null}
  </div>
)
