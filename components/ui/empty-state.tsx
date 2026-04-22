import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      "col-span-full flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-dashed border-gray-200 animate-in fade-in zoom-in-95 duration-500",
      className
    )}>
      <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 border border-gray-100 shadow-sm">
        <Icon size={32} className="text-gray-300" />
      </div>
      <h3 className="text-sm font-bold text-gray-800 mb-1">{title}</h3>
      {description && (
        <p className="text-xs font-medium text-gray-400 max-w-[200px] leading-relaxed italic">{description}</p>
      )}
    </div>
  );
}
