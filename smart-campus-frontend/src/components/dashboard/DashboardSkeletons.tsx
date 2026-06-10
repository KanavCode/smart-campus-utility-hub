import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardStatsCardSkeleton() {
  return (
    <Card className="glass border-muted">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="mb-3 h-8 w-12" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

export function DashboardStatsGridSkeleton() {
  return (
    <>
      {[...Array(4)].map((_, index) => (
        <div key={`stat-skeleton-${index}`} className="h-full">
          <DashboardStatsCardSkeleton />
        </div>
      ))}
    </>
  );
}

export function DashboardEventsSkeleton() {
  return (
    <Card className="glass border-muted">
      <CardHeader className="flex flex-row items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={`event-skeleton-${index}`}
              className="flex items-center justify-between rounded-lg bg-accent/10 p-4"
            >
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="space-y-2 text-right">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardNoticeBoardSkeleton() {
  return (
    <Card className="glass border-muted">
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
    </Card>
  );
}

export function DashboardUtilityBookingSkeleton() {
  return (
    <Card className="glass border-muted">
      <CardHeader>
        <Skeleton className="h-6 w-44" />
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[...Array(4)].map((_, index) => (
          <div key={`utility-skeleton-${index}`} className="rounded-lg border border-muted/40 bg-muted/10 p-4">
            <Skeleton className="mb-4 h-4 w-32" />
            <Skeleton className="h-16 rounded-2xl" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function DashboardActivityFeedSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, index) => (
        <div key={`activity-skeleton-${index}`} className="flex gap-3 animate-pulse">
          <div className="h-8 w-8 rounded-full bg-accent/50" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-accent/50" />
            <div className="h-3 w-1/2 rounded bg-accent/50" />
          </div>
        </div>
      ))}
    </div>
  );
}