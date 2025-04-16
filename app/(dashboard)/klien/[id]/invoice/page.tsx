import { Suspense } from "react"
import ClientInvoice from "./client-invoice"

// Konfigurasi dynamic rendering
export const dynamic = "force-dynamic"

export default function InvoicePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientInvoice />
    </Suspense>
  )
}
