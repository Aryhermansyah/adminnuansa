"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

export function RealTimeClock() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date())

  useEffect(() => {
    // Update time every second using local device time
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  }

  return (
    <div className="flex items-center text-sm text-muted-foreground">
      <Clock className="mr-2 h-4 w-4 text-pink-500" />
      <div>
        <div className="font-medium">{formatTime(currentTime)}</div>
        <div className="text-xs">{formatDate(currentTime)}</div>
      </div>
    </div>
  )
}
