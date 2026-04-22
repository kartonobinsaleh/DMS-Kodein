import { cn } from "@/lib/utils";

interface BadgeProps {
  status: "AVAILABLE" | "BORROWED" | "MAINTENANCE" | "ACTIVE" | "COMPLETED";
  children?: React.ReactNode;
  className?: string;
}

export function StatusBadge({ status, children, className }: BadgeProps) {
  const styles = {
    AVAILABLE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    BORROWED: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    MAINTENANCE: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    ACTIVE: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    COMPLETED: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium shadow-sm transition-colors",
        styles[status],
        className
      )}
    >
      {children || status.charAt(0) + status.slice(1).toLowerCase().replace("_", " ")}
    </span>
  );
}
