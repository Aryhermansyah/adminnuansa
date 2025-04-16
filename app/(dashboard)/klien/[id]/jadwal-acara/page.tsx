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

// Untuk mendukung output: export
export const dynamic = "force-static"

// Fungsi untuk menghasilkan parameter statis untuk export statis
export async function generateStaticParams() {
  // Untuk keperluan static export, kita bisa mengembalikan array dummy client IDs
  // yang akan digunakan untuk membuat halaman statis pada saat build
  return Array.from({ length: 10 }, (_, i) => ({
    id: String(i + 1),
  }))
}

// Halaman utama
export default function TambahJadwalMakeupPage({ params }: { params: { id: string } }) {
  const clientId = parseInt(params.id, 10)
  
  return (
    <Suspense fallback={<DataLoading />}>
      <TambahJadwalMakeupClient clientId={clientId} />
    </Suspense>
  )
} 