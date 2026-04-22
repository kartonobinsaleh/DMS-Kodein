import * as React from "react"
import { cn } from "@/lib/utils"

export interface SummaryStripProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function SummaryStrip({ children, className, ...props }: SummaryStripProps) {
  return (
    <div 
      className={cn("flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0", className)} 
      {...props}
    >
      {children}
    </div>
  )
}
