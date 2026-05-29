import { Card } from '@/components/ui'

function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-white/[0.08] ${className}`} />
}

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <SkeletonBlock className="h-4 w-24 bg-primary/25" />
        <SkeletonBlock className="h-10 w-full max-w-md" />
        <SkeletonBlock className="h-5 w-full max-w-2xl" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="space-y-4 p-5">
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="h-9 w-16" />
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-4 p-5">
          <SkeletonBlock className="h-6 w-40" />
          <SkeletonBlock className="h-72 w-full" />
        </Card>
        <Card className="space-y-4 p-5">
          <SkeletonBlock className="h-6 w-36" />
          <SkeletonBlock className="h-72 w-full" />
        </Card>
      </div>
    </div>
  )
}
