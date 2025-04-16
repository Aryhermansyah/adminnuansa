import { Suspense } from "react"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataLoading } from "@/components/data-loading"
import { BookVendorClient } from "./client-component"

// Konfigurasi dynamic rendering
export const dynamic = "force-dynamic"

export default function BookVendorPage({ params }: { params: { id: string } }) {
  const clientId = Number(params.id)
  
  return (
    <Suspense fallback={<DataLoading title="Memuat Data Vendor" />}>
      <BookVendorClient clientId={clientId} />
    </Suspense>
  )
}
