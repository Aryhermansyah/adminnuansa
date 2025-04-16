"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Edit, Trash, Phone, Mail, MapPin, Package, Calendar, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ResponsiveTable } from "@/components/responsive-table"
import { useResponsiveScale } from "@/hooks/use-responsive-scale"

// Konfigurasi dynamic rendering
export const dynamic = "force-dynamic"

// Dummy data untuk detail vendor
const vendorData = {
  id: "1",
  name: "Bunga Indah Florist",
  category: "Bunga & Dekorasi",
  location: "Jakarta Selatan",
  address: "Jl. Kemang Raya No. 123, Jakarta Selatan",
  phone: "0812-3456-7890",
  email: "info@bungaindah.com",
  status: "Aktif",
  joinDate: "12 Januari 2023",
  products: [
    { id: "p1", name: "Bunga Mawar Merah", price: "Rp 25.000 / tangkai" },
    { id: "p2", name: "Bunga Lily Putih", price: "Rp 35.000 / tangkai" },
    { id: "p3", name: "Paket Dekorasi Standar", price: "Rp 5.000.000" },
    { id: "p4", name: "Paket Dekorasi Premium", price: "Rp 8.500.000" },
  ],
  orders: [
    { id: "o1", date: "15 Mei 2023", client: "Anisa & Budi", amount: "Rp 5.500.000", status: "Selesai" },
    { id: "o2", date: "22 Juni 2023", client: "Dian & Eko", amount: "Rp 8.700.000", status: "Selesai" },
    { id: "o3", date: "10 Juli 2023", client: "Fira & Gilang", amount: "Rp 6.200.000", status: "Proses" },
  ],
}

// Client component tidak bisa async karena menggunakan hooks
export default function VendorDetailPage(props) {
  const [activeTab, setActiveTab] = useState("info")
  const scale = useResponsiveScale()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link href="/vendor">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Kembali</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-scale-xl font-bold text-pink-900">{vendorData.name}</h1>
            <p className="text-scale-sm text-muted-foreground">{vendorData.category}</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" className="flex-1 sm:flex-none">
            <Trash className="mr-2 h-4 w-4" />
            Hapus
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3 h-auto p-1">
          <TabsTrigger value="info" className="text-xs sm:text-sm py-2">
            Informasi
          </TabsTrigger>
          <TabsTrigger value="products" className="text-xs sm:text-sm py-2">
            Produk
          </TabsTrigger>
          <TabsTrigger value="orders" className="text-xs sm:text-sm py-2">
            Riwayat Pesanan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4 space-y-4">
          <Card className="mobile-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-scale-base">Detail Vendor</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Telepon</p>
                      <p className="text-sm">{vendorData.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm">{vendorData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Alamat</p>
                      <p className="text-sm">{vendorData.address}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Kategori</p>
                      <p className="text-sm">{vendorData.category}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Bergabung Sejak</p>
                      <p className="text-sm">{vendorData.joinDate}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge
                        variant={vendorData.status === "Aktif" ? "default" : "outline"}
                        className={
                          vendorData.status === "Aktif"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "text-muted-foreground"
                        }
                      >
                        {vendorData.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="mt-4 space-y-4">
          <Card className="mobile-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-scale-base">Daftar Produk</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-3">
                {vendorData.products.map((product) => (
                  <div key={product.id} className="mobile-list-item">
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-right">{product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-4 space-y-4">
          <Card className="mobile-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-scale-base">Riwayat Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ResponsiveTable>
                <table className="responsive-table">
                  <thead>
                    <tr>
                      <th className="table-header table-cell">Tanggal</th>
                      <th className="table-header table-cell">Klien</th>
                      <th className="table-header table-cell">Jumlah</th>
                      <th className="table-header table-cell">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-100">
                    {vendorData.orders.map((order) => (
                      <tr key={order.id}>
                        <td className="table-cell">{order.date}</td>
                        <td className="table-cell">{order.client}</td>
                        <td className="table-cell">{order.amount}</td>
                        <td className="table-cell">
                          <Badge
                            variant={order.status === "Selesai" ? "default" : "outline"}
                            className={
                              order.status === "Selesai"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                            }
                          >
                            {order.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ResponsiveTable>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
