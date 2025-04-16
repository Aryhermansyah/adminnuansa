"use client"

import type React from "react"
import { useViewportScale } from "@/hooks/use-viewport-scale"
import { cn } from "@/lib/utils"

interface ResponsiveWrapperProps {
  children: React.ReactNode
  className?: string
  enableScaling?: boolean
}

export function ResponsiveWrapper({ children, className, enableScaling = true }: ResponsiveWrapperProps) {
  const { scale, viewportWidth } = useViewportScale()

  return <div className={cn("w-full", enableScaling && scale < 1 ? "scale-content" : "", className)}>{children}</div>
}
