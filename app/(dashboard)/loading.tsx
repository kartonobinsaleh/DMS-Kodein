import { TableSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-md bg-gray-200" />
        <div className="h-4 w-64 animate-pulse rounded-md bg-gray-100" />
      </div>
      
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <TableSkeleton rows={6} />
      </div>
    </div>
  );
}

