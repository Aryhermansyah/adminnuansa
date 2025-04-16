"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"
import { TimeService } from "@/lib/time-service"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface LastUpdatedProps {
  timestamp: number | Date
  className?: string
}

export function LastUpdated({ timestamp, className = "" }: LastUpdatedProps) {
  const [relativeTime, setRelativeTime] = useState<string>("")
  const [absoluteTime, setAbsoluteTime] = useState<string>("")

  useEffect(() => {
    // Convert timestamp to Date if it's a number
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp)

    // Set initial times
    setRelativeTime(TimeService.formatRelativeTime(date))
    setAbsoluteTime(TimeService.formatDateTime(date))

    // Update relative time every minute
    const interval = setInterval(() => {
      setRelativeTime(TimeService.formatRelativeTime(date))
    }, 60000)

    return () => clearInterval(interval)
  }, [timestamp])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center text-xs text-muted-foreground ${className}`}>
            <Clock className="mr-1 h-3 w-3" />
            <span>Diperbarui {relativeTime}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{absoluteTime}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
