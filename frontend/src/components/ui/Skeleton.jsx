export function Skeleton({ className = '' }) {
  return (
    <div
      className={`rounded-lg animate-pulse skeleton-pulse ${className}`}
      style={{ minHeight: '0.5rem' }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}
