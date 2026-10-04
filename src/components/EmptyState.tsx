interface EmptyStateProps {
  title?: string
  description?: string
}

export function EmptyState({
  title = 'Nothing here yet',
  description,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[12rem] flex-col items-center justify-center gap-2 px-4 text-center">
      <p className="text-base font-medium text-foreground">{title}</p>
      {description ? (
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}
