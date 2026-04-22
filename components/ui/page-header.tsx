import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  category?: string;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  icon,
  action,
  category,
  className
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row justify-between items-start md:items-center gap-6", className)}>
      <div className="space-y-1">
        {category && (
          <div className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-widest text-[10px]">
            {icon && icon}
            <span>{category}</span>
          </div>
        )}
        <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm font-medium text-slate-500 tracking-tight">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="shrink-0 w-full md:w-auto">
          {action}
        </div>
      )}
    </div>
  );
}
