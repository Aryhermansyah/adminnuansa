"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, UserPlus, Store } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useData } from "@/contexts/data-context"
import { DataLoading } from "@/components/data-loading"

export default function TimVendorPage() {
  const { team, vendors, loading, error, refreshData } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTeamRole, setFilterTeamRole] = useState("all")
  const [filterVendorCategory, setFilterVendorCategory] = useState("all")
  const [activeTab, setActiveTab] = useState("team")

  useEffect(() => {
    // Periksa localStorage untuk vendor baru
    const checkForUpdates = () => {
      const newVendorAdded = localStorage.getItem('newVendorAdded');
      if (newVendorAdded === 'true') {
        console.log('Vendor baru terdeteksi, memuat ulang data...');
        refreshData();
        // Hapus flag setelah data dimuat ulang
        localStorage.removeItem('newVendorAdded');
        localStorage.removeItem('vendorUpdateTime');
      }
    };
    
    // Jalankan saat komponen dimuat
    checkForUpdates();
    
    // Atur polling setiap 2 detik untuk memeriksa perubahan
    const intervalId = setInterval(checkForUpdates, 2000);
    
    // Jalankan refresh data ketika komponen dimuat
    refreshData();
    
    return () => {
      clearInterval(intervalId);
    };
  }, [refreshData]);

  if (loading) {
    return <DataLoading title="Memuat Data Tim & Vendor" />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-red-600">Terjadi Kesalahan</h2>
          <p className="text-muted-foreground">{error.message}</p>
          <Button onClick={() => refreshData()} className="bg-pink-600 hover:bg-pink-700">
            Coba Lagi
          </Button>
        </div>
      </div>
    )
  }

  // Filter tim berdasarkan pencarian dan filter
  const filteredTeam = team.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterTeamRole === "all" || member.role === filterTeamRole
    return matchesSearch && matchesRole
  })

  // Filter vendor berdasarkan pencarian dan filter
  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterVendorCategory === "all" || vendor.category === filterVendorCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-pink-900">Tim & Vendor</h1>
          <p className="text-sm text-muted-foreground">Kelola anggota tim internal dan vendor rekanan</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            asChild
            className={`bg-pink-600 hover:bg-pink-700 flex-1 ${activeTab === "team" ? "" : "opacity-80"}`}
          >
            <Link href="/tim-vendor/tambah-tim">
              <UserPlus className="mr-2 h-4 w-4" />
              Tambah Tim
            </Link>
          </Button>
          <Button
            asChild
            className={`bg-pink-600 hover:bg-pink-700 flex-1 ${activeTab === "vendors" ? "" : "opacity-80"}`}
          >
            <Link href="/tim-vendor/tambah-vendor">
              <Store className="mr-2 h-4 w-4" />
              Tambah Vendor
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-pink-100/50">
          <TabsTrigger value="team" className="data-[state=active]:bg-white">
            Tim Internal
          </TabsTrigger>
          <TabsTrigger value="vendors" className="data-[state=active]:bg-white">
            Vendor Rekanan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari anggota tim..."
                className="pl-8 mobile-input w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <select
                className="w-full h-10 rounded-md border border-pink-200 bg-white px-3 py-2 text-sm"
                value={filterTeamRole}
                onChange={(e) => setFilterTeamRole(e.target.value)}
              >
                <option value="all">Semua Posisi</option>
                <option value="MUA">MUA</option>
                <option value="Asisten MUA">Asisten MUA</option>
                <option value="Dekorasi">Dekorasi</option>
                <option value="Asisten Dekorasi">Asisten Dekorasi</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTeam.length > 0 ? (
              filteredTeam.map((member) => (
                <Link href={`/tim-vendor/tim/${member.id}`} key={member.id} className="block">
                  <Card className="mobile-card hover:border-pink-200 transition-colors">
                    <CardContent className="p-0">
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={member.avatar || "/placeholder-user.jpg"} alt={member.name} />
                              <AvatarFallback className="bg-pink-200 text-pink-700">
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium text-base">{member.name}</h3>
                              <p className="text-xs text-muted-foreground">{member.role}</p>
                            </div>
                          </div>
                          <Badge
                            variant={member.status === "Tetap" ? "default" : "outline"}
                            className={
                              member.status === "Tetap"
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                : "bg-orange-100 text-orange-800 hover:bg-orange-100"
                            }
                          >
                            {member.status}
                          </Badge>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">Telepon</p>
                            <p>{member.phone}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Bergabung</p>
                            <p>{member.joinDate}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full">
                <Card className="mobile-card">
                  <CardContent className="p-4 text-center">
                    <p className="text-muted-foreground">Tidak ada anggota tim yang ditemukan</p>
                    <Button variant="link" className="mt-2" asChild>
                      <Link href="/tim-vendor/tambah-tim">Tambah anggota tim baru</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari vendor..."
                className="pl-8 mobile-input w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <select
                className="w-full h-10 rounded-md border border-pink-200 bg-white px-3 py-2 text-sm"
                value={filterVendorCategory}
                onChange={(e) => setFilterVendorCategory(e.target.value)}
              >
                <option value="all">Semua Kategori</option>
                <option value="Fotografer">Fotografer</option>
                <option value="MC">MC</option>
                <option value="Band">Band</option>
                <option value="Videografer">Videografer</option>
                <option value="Venue">Venue</option>
                <option value="Catering">Catering</option>
                <option value="MUA Lepas">MUA Lepas</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVendors.length > 0 ? (
              filteredVendors.map((vendor) => (
                <Link href={`/tim-vendor/vendor/${vendor.id}`} key={vendor.id} className="block">
                  <Card className="mobile-card hover:border-pink-200 transition-colors">
                    <CardContent className="p-0">
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-pink-100 p-2 rounded-md">
                              <Store className="h-5 w-5 text-pink-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-base">{vendor.name}</h3>
                              <p className="text-xs text-muted-foreground">{vendor.category}</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">Lokasi</p>
                            <p>{vendor.address.split(",")[0]}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Harga</p>
                            <p>
                              {new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                                maximumFractionDigits: 0,
                              }).format(vendor.price)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full">
                <Card className="mobile-card">
                  <CardContent className="p-4 text-center">
                    <p className="text-muted-foreground">Tidak ada vendor yang ditemukan</p>
                    <Button variant="link" className="mt-2" asChild>
                      <Link href="/tim-vendor/tambah-vendor">Tambah vendor baru</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
