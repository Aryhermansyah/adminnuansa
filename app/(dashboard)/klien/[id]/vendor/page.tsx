import { Suspense } from "react"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataLoading } from "@/components/data-loading"
import { BookVendorClient } from "./client-component"

// Konfigurasi dynamic rendering
export const dynamic = "force-dynamic"

export default async function BookVendorPage(props) {
  const clientId = Number(props.params.id)
  
  return (
    <Suspense fallback={<DataLoading title="Memuat Data Vendor" />}>
      <BookVendorClient clientId={clientId} />
    </Suspense>
  )
}
