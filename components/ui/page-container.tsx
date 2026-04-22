import * as React from "react"
import { cn } from "@/lib/utils"

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageContainer({ children, className, ...props }: PageContainerProps) {
  return (
    <div className={cn("space-y-4 page-fade-in pb-10 sm:pb-20", className)} {...props}>
      {children}
    </div>
  )
}
