import { Suspense } from "react"

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

// Konfigurasi dynamic rendering
export const dynamic = "force-dynamic"

// Halaman utama
export default function TambahJadwalMakeupPage({ params }: { params: { id: string } }) {
  const clientId = parseInt(params.id, 10)
  
  return (
    <Suspense fallback={<DataLoading />}>
      <TambahJadwalMakeupClient clientId={clientId} />
    </Suspense>
  )
} 