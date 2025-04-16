import { Suspense } from "react"
import { ChevronLeft, Calendar, MapPin, Phone, Mail, Home, Edit, Plus, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Client, Event, VendorBooking } from "@/lib/db/db-service"
import { ClientDetailClient } from "./client-component"
import { DataLoading } from "@/components/data-loading"

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

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const clientId = Number(params.id)
  
  return (
    <Suspense fallback={<DataLoading title="Memuat Data Klien" />}>
      <ClientDetailClient clientId={clientId} />
    </Suspense>
  )
}
