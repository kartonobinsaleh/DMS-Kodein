import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "AVAILABLE" | "BORROWED" | "MAINTENANCE" | "ON_TIME" | "LATE" | "NOT_RETURNED" | "RETURNED" | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = (status: string) => {
    switch (status.toUpperCase()) {
      case "AVAILABLE":
      case "ON_TIME":
      case "RETURNED":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "BORROWED":
      case "NOT_RETURNED":
        return "bg-rose-100 text-rose-700 border-rose-200";
      case "LATE":
      case "MAINTENANCE":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case "AVAILABLE": return "Tersedia";
      case "BORROWED": return "Dipakai";
      case "ON_TIME": return "Tepat Waktu";
      case "LATE": return "Terlambat";
      case "RETURNED": return "Kembali";
      case "NOT_RETURNED": return "Belum Kembali";
      default: return status;
    }
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider",
      getStatusStyles(status),
      className
    )}>
      {getLabel(status)}
    </span>
  );
}
