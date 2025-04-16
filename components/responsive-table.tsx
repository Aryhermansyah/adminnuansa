import type React from "react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ResponsiveTableProps {
  children: React.ReactNode
  className?: string
  maxHeight?: string
}

export function ResponsiveTable({ children, className, maxHeight }: ResponsiveTableProps) {
  return (
    <div className={cn("w-full overflow-hidden rounded-md border border-pink-100", className)}>
      <ScrollArea className={maxHeight ? `max-h-[${maxHeight}]` : ""}>
        <div className="w-full overflow-x-auto">{children}</div>
      </ScrollArea>
    </div>
  )
}
