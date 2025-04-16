"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Search, Filter, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useResponsiveScale } from "@/hooks/use-responsive-scale"

// Dummy data untuk vendor
const vendors = [
  {
    id: "1",
    name: "Bunga Indah Florist",
    category: "Bunga & Dekorasi",
    location: "Jakarta Selatan",
    status: "Aktif",
    lastOrder: "2 hari lalu",
  },
  {
    id: "2",
    name: "Catering Nikmat",
    category: "Katering",
    location: "Jakarta Barat",
    status: "Aktif",
    lastOrder: "1 minggu lalu",
  },
  {
    id: "3",
    name: "Gedung Serba Guna",
    category: "Venue",
    location: "Jakarta Pusat",
    status: "Tidak Aktif",
    lastOrder: "3 bulan lalu",
  },
  {
    id: "4",
    name: "Foto Kenangan",
    category: "Fotografi",
    location: "Depok",
    status: "Aktif",
    lastOrder: "3 hari lalu",
  },
  {
    id: "5",
    name: "Musik Merdu",
    category: "Hiburan",
    location: "Tangerang",
    status: "Aktif",
    lastOrder: "2 minggu lalu",
  },
]

export default function VendorPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const scale = useResponsiveScale()

  // Filter vendors berdasarkan pencarian
  const filteredVendors = vendors.filter((vendor) => vendor.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-scale-2xl font-bold text-pink-900">Vendor</h1>
          <p className="text-scale-sm text-muted-foreground">Kelola vendor dan supplier untuk bisnis Anda</p>
        </div>
        <Button asChild className="action-button-primary w-full sm:w-auto">
          <Link href="/vendor/tambah">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Vendor
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari vendor..."
            className="pl-8 mobile-input w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="mobile-button">
          <Filter className="h-4 w-4" />
          <span className="sr-only">Filter</span>
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1">
        {filteredVendors.length > 0 ? (
          filteredVendors.map((vendor) => (
            <Link href={`/vendor/${vendor.id}`} key={vendor.id} className="block">
              <Card className="mobile-card hover:border-pink-200 transition-colors">
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-pink-100 p-2 rounded-md">
                          <Store className="h-5 w-5 text-pink-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-scale-base">{vendor.name}</h3>
                          <p className="text-xs text-muted-foreground">{vendor.category}</p>
                        </div>
                      </div>
                      <Badge
                        variant={vendor.status === "Aktif" ? "default" : "outline"}
                        className={
                          vendor.status === "Aktif"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "text-muted-foreground"
                        }
                      >
                        {vendor.status}
                      </Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Lokasi</p>
                        <p>{vendor.location}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Pesanan Terakhir</p>
                        <p>{vendor.lastOrder}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <Card className="mobile-card">
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground">Tidak ada vendor yang ditemukan</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
