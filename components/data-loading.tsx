"use client"

import type React from "react"

import { Loader } from "lucide-react"

interface DataLoadingProps {
  title?: string;
}

export function DataLoading({ title = "Memuat Data" }: DataLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-center space-y-4">
        <Loader className="h-8 w-8 text-pink-600 animate-spin mx-auto" />
        <h2 className="text-xl font-semibold text-pink-600">{title}</h2>
        <p className="text-muted-foreground">Mohon tunggu sementara data dimuat...</p>
      </div>
    </div>
  )
}
