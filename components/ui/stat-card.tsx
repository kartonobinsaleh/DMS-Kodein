import * as React from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconColorClass?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconColorClass = "text-gray-400",
  className,
  ...props
}: StatCardProps) {
  return (
    <Card className={cn("flex-shrink-0 p-4 min-w-[170px] transition-all hover:border-gray-300", className)} {...props}>
      <div className="flex items-center justify-between mb-2">
         <Icon size={18} className={iconColorClass} />
         <span className="text-xs font-semibold text-gray-500 uppercase tracking-tight">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
    </Card>
  )
}
