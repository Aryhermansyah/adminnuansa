import { Suspense } from "react"
import type { SimplePageProps } from "@/lib/next-types"
import { TambahJadwalMakeupClient } from "./client-component"

// Komponen loading saat data sedang dimuat
function DataLoading() {
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-pink-900 mb-2">
          Memuat data...
        </h2>
        <p className="text-muted-foreground">Harap tunggu sebentar</p>
      </div>
    </div>
  )
}

// Konfigurasi rendering
export const dynamic = "force-dynamic"

// Halaman server 
export default function TambahJadwalMakeupPage(props: SimplePageProps) {
  const clientId = parseInt(props.params.id, 10)
  
  return (
    <Suspense fallback={<DataLoading />}>
      <TambahJadwalMakeupClient clientId={clientId} />
    </Suspense>
  )
} 