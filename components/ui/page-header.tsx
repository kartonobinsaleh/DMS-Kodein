"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  action,
  className
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4 mb-6", className)}>
      <div>
        <h1 className="text-lg font-semibold text-gray-800 leading-none">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 mt-1 leading-none">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
