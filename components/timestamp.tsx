"use client"

import { useState, useEffect } from "react"
import { timeService } from "@/lib/time-service"

interface TimestampProps {
  date: string
  format?: "relative" | "date" | "time" | "datetime"
  className?: string
}

export function Timestamp({ date, format = "relative", className }: TimestampProps) {
  const [formattedDate, setFormattedDate] = useState<string>("")

  useEffect(() => {
    if (!date) return

    switch (format) {
      case "relative":
        setFormattedDate(timeService.getRelativeTime(date))
        break
      case "date":
        setFormattedDate(timeService.formatDate(date))
        break
      case "time":
        setFormattedDate(timeService.formatTime(date))
        break
      case "datetime":
        setFormattedDate(timeService.formatDateTime(date))
        break
    }

    // Update relative timestamps periodically
    if (format === "relative") {
      const interval = setInterval(() => {
        setFormattedDate(timeService.getRelativeTime(date))
      }, 60000) // Update every minute

      return () => clearInterval(interval)
    }
  }, [date, format])

  return <span className={className}>{formattedDate}</span>
}
