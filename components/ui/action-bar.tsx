import * as React from "react"
import { cn } from "@/lib/utils"

export interface ActionBarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ActionBar({ children, className, ...props }: ActionBarProps) {
  return (
    <div 
      className={cn("sticky top-0 z-10 bg-gray-50/80 backdrop-blur-md pb-4 pt-1 sm:pt-0 -mx-4 px-4 sm:mx-0 sm:px-0", className)} 
      {...props}
    >
      <div className="flex flex-col sm:flex-row gap-3">
         {children} 
      </div>
    </div>
  )
}
