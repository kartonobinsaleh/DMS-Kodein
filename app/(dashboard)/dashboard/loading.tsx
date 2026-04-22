import { CardSkeleton, TableSkeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-md bg-gray-200" />
        <div className="h-4 w-64 animate-pulse rounded-md bg-gray-100" />
      </div>

      {/* Stats Cards Skeleton */}
      <CardSkeleton />

      {/* Chart/Table Area Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-[200px] w-full animate-pulse rounded bg-gray-50" />
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <TableSkeleton rows={4} />
        </div>
      </div>
    </div>
  );
}
