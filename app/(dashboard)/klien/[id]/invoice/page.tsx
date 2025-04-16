import { Suspense } from "react"
import ClientInvoice from "./client-invoice"

// This function runs on the server at build time
export async function generateStaticParams() {
  // Replace with actual client IDs in production
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' }
  ]
}

export default function InvoicePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientInvoice />
    </Suspense>
  )
}
