import type React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

interface ResponsiveCardProps {
  children: React.ReactNode
  className?: string
  header?: React.ReactNode
  footer?: React.ReactNode
}

export function ResponsiveCard({ children, className, header, footer }: ResponsiveCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {header && <CardHeader className="p-3 sm:p-4 md:p-6">{header}</CardHeader>}
      <CardContent className="p-3 sm:p-4 md:p-6">{children}</CardContent>
      {footer && <CardFooter className="p-3 sm:p-4 md:p-6">{footer}</CardFooter>}
    </Card>
  )
}
