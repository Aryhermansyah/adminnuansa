"use client"

import type React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DataProvider, useData } from "@/contexts/data-context"

function DashboardContent({ children }: { children: React.ReactNode }) {
  // Data loading sudah ditangani oleh DataProvider
  return <>{children}</>
}

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
      <DashboardLayout>
        <DashboardContent>{children}</DashboardContent>
      </DashboardLayout>
    </DataProvider>
  )
}
