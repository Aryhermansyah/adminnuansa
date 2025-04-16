"use client"

import Link from "next/link"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Calendar, Search, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useData } from "@/contexts/data-context"
import { DataLoading } from "@/components/data-loading"

// Data dummy untuk koleksi baju
const dressCollection = [
  {
    id: "WD-001",
    name: "Gaun Pengantin Putih Mewah",
    category: "Wedding Dress",
    size: ["S", "M", "L"],
    color: "White",
    price: 2500000,
    deposit: 1000000,
    status: "Tersedia",
    bookedDates: [],
    images: ["/placeholder.svg?height=300&width=200"],
    description: "Gaun pengantin putih dengan detail payet dan ekor panjang",
  },
  {
    id: "WD-002",
    name: "Jas Pengantin Premium",
    category: "Wedding Suit",
    size: ["M", "L", "XL"],
    color: "Navy Blue",
    price: 1800000,
    deposit: 800000,
    status: "Tersedia",
    bookedDates: [],
    images: ["/placeholder.svg?height=300&width=200"],
    description: "Jas pengantin premium dengan detail bordir dan kancing emas",
  },
  {
    id: "WD-003",
    name: "Gaun Prewedding Merah",
    category: "Prewedding Dress",
    size: ["S", "M"],
    color: "Red",
    price: 1500000,
    deposit: 700000,
    status: "Tersedia",
    bookedDates: [],
    images: ["/placeholder.svg?height=300&width=200"],
    description: "Gaun prewedding merah dengan detail payet dan belahan tinggi",
  },
  {
    id: "WD-004",
    name: "Kebaya Modern Hijau",
    category: "Traditional",
    size: ["S", "M", "L"],
    color: "Green",
    price: 1200000,
    deposit: 500000,
    status: "Tersedia",
    bookedDates: [],
    images: ["/placeholder.svg?height=300&width=200"],
    description: "Kebaya modern hijau dengan detail bordir dan payet",
  },
  {
    id: "WD-005",
    name: "Gaun Pesta Gold",
    category: "Evening Dress",
    size: ["S", "M"],
    color: "Gold",
    price: 1800000,
    deposit: 800000,
    status: "Tersedia",
    bookedDates: [],
    images: ["/placeholder.svg?height=300&width=200"],
    description: "Gaun pesta gold dengan detail payet dan ekor pendek",
  },
]

export default function TambahSewaBajuPage() {
  const router = useRouter()
  const { clients, loading, error, refreshData } = useData()
  const [activeTab, setActiveTab] = useState("client")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [selectedDress, setSelectedDress] = useState<any>(null)
  const [rentDate, setRentDate] = useState<Date>(new Date())
  const [returnDate, setReturnDate] = useState<Date>(() => {
    const date = new Date()
    date.setDate(date.getDate() + 7) // Default 7 hari
    return date
  })
  const [formData, setFormData] = useState({
    size: "",
    notes: "",
    additionalPrice: "",
    discount: "",
    deposit: "",
  })

  useEffect(() => {
    refreshData()
  }, [refreshData])

  useEffect(() => {
    // Update deposit when dress is selected
    if (selectedDress) {
      setFormData((prev) => ({
        ...prev,
        deposit: selectedDress.deposit.toString(),
      }))
    }
  }, [selectedDress])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedClient || !selectedDress || !rentDate || !returnDate) {
      alert("Mohon lengkapi data yang diperlukan")
      return
    }

    // Simulasi penyimpanan data
    console.log({
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      dressId: selectedDress.id,
      dressName: selectedDress.name,
      rentDate: rentDate.toISOString(),
      returnDate: returnDate.toISOString(),
      size: formData.size,
      notes: formData.notes,
      price: selectedDress.price,
      additionalPrice: formData.additionalPrice ? Number.parseInt(formData.additionalPrice) : 0,
      discount: formData.discount ? Number.parseInt(formData.discount) : 0,
      deposit: formData.deposit ? Number.parseInt(formData.deposit) : selectedDress.deposit,
      status: "Disewa",
    })

    // Redirect ke halaman sewa baju
    router.push("/sewa-baju")
  }

  if (loading) {
    return <DataLoading title="Memuat Data" />
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

  // Filter klien berdasarkan pencarian
  const filteredClients = clients.filter((client) => client.name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Filter baju berdasarkan pencarian
  const filteredDresses = dressCollection.filter(
    (dress) =>
      dress.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dress.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dress.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Format currency
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Hitung total harga
  const calculateTotal = () => {
    if (!selectedDress) return 0

    const basePrice = selectedDress.price
    const additionalPrice = formData.additionalPrice ? Number.parseInt(formData.additionalPrice) : 0
    const discount = formData.discount ? Number.parseInt(formData.discount) : 0

    return basePrice + additionalPrice - discount
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-pink-900">Tambah Sewa Baju</h1>
          <p className="text-muted-foreground">Isi informasi penyewaan baju</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-pink-100/50">
          <TabsTrigger value="client" className="data-[state=active]:bg-white">
            Pilih Klien
          </TabsTrigger>
          <TabsTrigger value="dress" className="data-[state=active]:bg-white">
            Pilih Baju
          </TabsTrigger>
          <TabsTrigger value="details" className="data-[state=active]:bg-white">
            Detail Sewa
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="client" className="space-y-4">
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle>Pilih Klien</CardTitle>
                <CardDescription>Pilih klien yang akan menyewa baju</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Cari nama klien..."
                    className="pl-8 border-pink-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-1">
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                      <div
                        key={client.id}
                        className={`p-3 border rounded-md cursor-pointer transition-colors ${
                          selectedClient?.id === client.id
                            ? "border-pink-500 bg-pink-50"
                            : "border-pink-100 hover:border-pink-200 hover:bg-pink-50/50"
                        }`}
                        onClick={() => setSelectedClient(client)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-pink-900">{client.name}</h3>
                            <p className="text-sm text-muted-foreground">{client.phone}</p>
                          </div>
                          {selectedClient?.id === client.id && (
                            <Badge className="bg-pink-500">
                              <Check className="h-3 w-3 mr-1" /> Terpilih
                            </Badge>
                          )}
                        </div>
                        <div className="mt-2 text-sm">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-pink-600" />
                            <span>
                              {new Date(client.eventDate).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 border border-dashed border-pink-200 rounded-md">
                      <p className="text-muted-foreground mb-2">Tidak ada klien yang ditemukan</p>
                      <Button variant="link" asChild>
                        <Link href="/klien/tambah">Tambah klien baru</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" className="border-pink-200" onClick={() => router.back()}>
                  Batal
                </Button>
                <Button
                  type="button"
                  className="bg-pink-600 hover:bg-pink-700"
                  onClick={() => setActiveTab("dress")}
                  disabled={!selectedClient}
                >
                  Selanjutnya
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="dress" className="space-y-4">
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle>Pilih Baju</CardTitle>
                <CardDescription>Pilih baju yang akan disewa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Cari nama atau kode baju..."
                    className="pl-8 border-pink-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 max-h-[500px] overflow-y-auto pr-1">
                  {filteredDresses.length > 0 ? (
                    filteredDresses.map((dress) => (
                      <div
                        key={dress.id}
                        className={`border rounded-md overflow-hidden cursor-pointer transition-colors ${
                          selectedDress?.id === dress.id ? "border-pink-500" : "border-pink-100 hover:border-pink-200"
                        }`}
                        onClick={() => setSelectedDress(dress)}
                      >
                        <div className="aspect-[3/2] relative">
                          <img
                            src={dress.images[0] || "/placeholder.svg?height=300&width=200"}
                            alt={dress.name}
                            className="object-cover w-full h-full"
                          />
                          <div className="absolute top-2 left-2">
                            <Badge
                              className={
                                dress.status === "Tersedia"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {dress.status}
                            </Badge>
                          </div>
                          <div className="absolute top-2 right-2">
                            <Badge variant="outline" className="bg-white border-pink-200">
                              {dress.id}
                            </Badge>
                          </div>
                          {selectedDress?.id === dress.id && (
                            <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center">
                              <Badge className="bg-pink-500">
                                <Check className="h-4 w-4 mr-1" /> Terpilih
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-pink-900">{dress.name}</h3>
                          <p className="text-xs text-muted-foreground">{dress.category}</p>

                          <div className="mt-2 flex justify-between items-center">
                            <div>
                              <span className="text-xs text-muted-foreground">Ukuran:</span>
                              <div className="flex gap-1 mt-1">
                                {dress.size.map((s) => (
                                  <Badge key={s} variant="outline" className="border-pink-200 text-xs">
                                    {s}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-muted-foreground">Harga Sewa:</span>
                              <p className="font-medium text-pink-900">{formatRupiah(dress.price)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-6 border border-dashed border-pink-200 rounded-md">
                      <p className="text-muted-foreground mb-2">Tidak ada baju yang ditemukan</p>
                      <Button variant="link" asChild>
                        <Link href="/sewa-baju/tambah-koleksi">Tambah koleksi baru</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  className="border-pink-200"
                  onClick={() => setActiveTab("client")}
                >
                  Kembali
                </Button>
                <Button
                  type="button"
                  className="bg-pink-600 hover:bg-pink-700"
                  onClick={() => setActiveTab("details")}
                  disabled={!selectedDress}
                >
                  Selanjutnya
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-pink-100">
                <CardHeader>
                  <CardTitle>Detail Penyewaan</CardTitle>
                  <CardDescription>Isi detail penyewaan baju</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tanggal Sewa</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal border-pink-200",
                            !rentDate && "text-muted-foreground",
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {rentDate ? (
                            rentDate.toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={rentDate}
                          onSelect={(date) => date && setRentDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Tanggal Kembali</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal border-pink-200",
                            !returnDate && "text-muted-foreground",
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {returnDate ? (
                            returnDate.toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={returnDate}
                          onSelect={(date) => date && setReturnDate(date)}
                          initialFocus
                          disabled={(date) => date < rentDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="size">Ukuran</Label>
                    <select
                      id="size"
                      className="w-full h-10 rounded-md border border-pink-200 bg-white px-3 py-2 text-sm"
                      value={formData.size}
                      onChange={(e) => handleInputChange("size", e.target.value)}
                      required
                    >
                      <option value="">Pilih ukuran</option>
                      {selectedDress?.size.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Catatan</Label>
                    <Textarea
                      id="notes"
                      placeholder="Catatan tambahan tentang penyewaan"
                      className="border-pink-200 resize-none"
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-pink-100">
                <CardHeader>
                  <CardTitle>Pembayaran</CardTitle>
                  <CardDescription>Detail pembayaran penyewaan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-pink-50 rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">Klien:</p>
                        <p className="text-base font-semibold text-pink-900">{selectedClient?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Baju:</p>
                        <p className="text-base font-semibold text-pink-900">{selectedDress?.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="basePrice">Harga Sewa</Label>
                    <Input
                      id="basePrice"
                      value={selectedDress ? formatRupiah(selectedDress.price) : ""}
                      className="border-pink-200"
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additionalPrice">Biaya Tambahan (opsional)</Label>
                    <Input
                      id="additionalPrice"
                      type="number"
                      placeholder="0"
                      className="border-pink-200"
                      value={formData.additionalPrice}
                      onChange={(e) => handleInputChange("additionalPrice", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Biaya tambahan untuk aksesori, dll.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount">Diskon (opsional)</Label>
                    <Input
                      id="discount"
                      type="number"
                      placeholder="0"
                      className="border-pink-200"
                      value={formData.discount}
                      onChange={(e) => handleInputChange("discount", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deposit">Deposit</Label>
                    <Input
                      id="deposit"
                      type="number"
                      className="border-pink-200"
                      value={formData.deposit}
                      onChange={(e) => handleInputChange("deposit", e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Deposit akan dikembalikan saat baju dikembalikan dalam kondisi baik
                    </p>
                  </div>

                  <div className="p-3 bg-pink-50 rounded-md mt-4">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Total Harga:</p>
                      <p className="text-lg font-bold text-pink-900">{formatRupiah(calculateTotal())}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-pink-200"
                    onClick={() => setActiveTab("dress")}
                  >
                    Kembali
                  </Button>
                  <Button type="submit" className="bg-pink-600 hover:bg-pink-700">
                    Simpan Penyewaan
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </form>
      </Tabs>
    </div>
  )
}
