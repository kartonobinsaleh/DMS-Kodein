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
        return "bg-green-600 text-white";
      case "BORROWED":
      case "NOT_RETURNED":
        return "bg-red-600 text-white";
      case "LATE":
      case "MAINTENANCE":
        return "bg-amber-500 text-white";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case "AVAILABLE": return "Ready";
      case "BORROWED": return "In Use";
      case "ON_TIME": return "On Time";
      case "LATE": return "Late";
      case "RETURNED": return "Returned";
      case "NOT_RETURNED": return "Missing";
      default: return status;
    }
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight whitespace-nowrap shadow-sm",
      getStatusStyles(status),
      className
    )}>
      {getLabel(status)}
    </span>
  );
}
