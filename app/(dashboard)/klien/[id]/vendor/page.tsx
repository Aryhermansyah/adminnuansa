import { Suspense } from "react"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataLoading } from "@/components/data-loading"
import { BookVendorClient } from "./client-component"

// Untuk mendukung output: export
export const dynamic = "force-static"

// Fungsi generateStaticParams diperlukan untuk rute dinamis dengan output: export
export async function generateStaticParams() {
  // Dalam aplikasi produksi, Anda akan mengambil ID klien dari database
  // Untuk sekarang, kita akan mengembalikan ID dummy
  return Array.from({ length: 10 }, (_, i) => ({
    id: String(i + 1),
  }))
}

export default function BookVendorPage({ params }: { params: { id: string } }) {
  const clientId = Number(params.id)
  
  return (
    <Suspense fallback={<DataLoading title="Memuat Data Vendor" />}>
      <BookVendorClient clientId={clientId} />
    </Suspense>
  )
}
