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

// Konfigurasi dynamic rendering
export const dynamic = "force-dynamic"

export default async function ClientDetailPage(props) {
  const clientId = Number(props.params.id)
  
  return (
    <Suspense fallback={<DataLoading title="Memuat Data Klien" />}>
      <ClientDetailClient clientId={clientId} />
    </Suspense>
  )
}
