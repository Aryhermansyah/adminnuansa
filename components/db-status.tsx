"use client"

import { useEffect, useState } from "react"
import { Wifi, WifiOff } from "lucide-react"

export function DBStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine)

    // Set up event listeners for online/offline status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Set last sync time
    setLastSync(new Date())

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return (
    <div className="flex items-center justify-center gap-2 text-xs">
      {isOnline ? <Wifi className="h-3 w-3 text-green-500" /> : <WifiOff className="h-3 w-3 text-red-500" />}
      <span>
        {isOnline ? "Online" : "Offline"}
        {lastSync && ` • Terakhir disinkronkan: ${lastSync.toLocaleTimeString()}`}
      </span>
    </div>
  )
}
