"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { MobileNav } from "@/components/mobile-nav"
import { Sidebar } from "@/components/sidebar"
import { RealTimeClock } from "@/components/real-time-clock"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div className="h-full relative">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:flex h-full w-64 flex-col fixed inset-y-0 z-50">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="md:pl-64 pb-20 md:pb-0 min-h-screen bg-gray-50">
        <main className="p-4 md:p-6 max-w-6xl mx-auto">{children}</main>
        <footer className="p-4 text-center text-xs text-muted-foreground mt-8 mb-20 md:mb-0">
          <div className="flex justify-center items-center gap-2">
            <RealTimeClock />
          </div>
          <p className="mt-2">© 2025 NuansaWedding Office . Create by Ary Hermansyah</p>
        </footer>
      </div>

      {/* Mobile navigation - visible only on mobile */}
      <MobileNav />
    </div>
  )
}
