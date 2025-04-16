"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Search, Shirt, ArrowRight, ArrowLeft, Barcode, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useData } from "@/contexts/data-context"
import { DataLoading } from "@/components/data-loading"

// Data dummy untuk sewa baju
const rentalData = [
  {
    id: 1,
    clientName: "Anisa & Budi",
    clientId: 1,
    dressCode: "WD-001",
    dressName: "Gaun Pengantin Putih Mewah",
    rentDate: "2024-06-10",
    returnDate: "2024-06-17",
    status: "Disewa",
    price: 2500000,
    deposit: 1000000,
    notes: "Ukuran S, termasuk aksesoris lengkap",
  },
  {
    id: 2,
    clientName: "Citra & Dani",
    clientId: 2,
    dressCode: "WD-002",
    dressName: "Jas Pengantin Premium",
    rentDate: "2024-06-08",
    returnDate: "2024-06-15",
    status: "Disewa",
    price: 1800000,
    deposit: 800000,
    notes: "Ukuran M, warna navy blue",
  },
  {
    id: 3,
    clientName: "Dina & Eko",
    clientId: 3,
    dressCode: "WD-003",
    dressName: "Gaun Prewedding Merah",
    rentDate: "2024-05-20",
    returnDate: "2024-05-27",
    status: "Dikembalikan",
    price: 1500000,
    deposit: 700000,
    notes: "Ukuran M, kondisi baik",
  },
]

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
    status: "Disewa",
    bookedDates: [{ start: "2024-06-10", end: "2024-06-17" }],
    images: ["/placeholder.svg?height=300&width=200"],
    description: "Gaun pengantin putih dengan detail payet dan ekor panjang",
    measurements: {
      bust: "88-92 cm",
      waist: "68-72 cm",
      hips: "92-96 cm",
      length: "150 cm",
    },
    fittingNotes: "Terdapat kancing di bagian belakang. Penutup resleting halus. Padding di bagian dada tersedia."
  },
  {
    id: "WD-002",
    name: "Jas Pengantin Premium",
    category: "Wedding Suit",
    size: ["M", "L", "XL"],
    color: "Navy Blue",
    price: 1800000,
    deposit: 800000,
    status: "Disewa",
    bookedDates: [{ start: "2024-06-08", end: "2024-06-15" }],
    images: ["/placeholder.svg?height=300&width=200"],
    description: "Jas pengantin premium dengan detail bordir dan kancing emas",
    measurements: {
      chest: "102-106 cm",
      shoulders: "46-48 cm",
      sleeves: "64 cm",
      length: "74 cm",
    },
    fittingNotes: "Jas disertai rompi. Cocok untuk bentuk badan proporsional. Tersedia setelan lengkap."
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
    bookedDates: [{ start: "2024-05-20", end: "2024-05-27" }],
    images: ["/placeholder.svg?height=300&width=200"],
    description: "Gaun prewedding merah dengan detail payet dan belahan tinggi",
    measurements: {
      bust: "86-90 cm",
      waist: "66-70 cm",
      hips: "90-94 cm",
      length: "140 cm",
    },
    fittingNotes: "Terdapat belahan hingga paha. Bagian belakang model terbuka. Material kain tidak terlalu stretch."
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
    measurements: {
      bust: "88-92 cm",
      waist: "68-72 cm",
      shoulders: "38-40 cm",
      length: "70 cm",
    },
    fittingNotes: "Disertai rok batik. Aksesoris selendang tersedia. Padding di bagian bahu untuk bentuk yang lebih baik."
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
    measurements: {
      bust: "86-90 cm",
      waist: "66-70 cm",
      hips: "90-94 cm",
      length: "130 cm",
    },
    fittingNotes: "Model mermaid, disarankan untuk tubuh berisi. Terdapat tali penyesuai di bagian punggung."
  },
]

export default function SewaBajuPage() {
  const { clients, loading, error, refreshData } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [activeTab, setActiveTab] = useState("rentals")

  useEffect(() => {
    refreshData()
  }, [refreshData])

  if (loading) {
    return <DataLoading title="Memuat Data Sewa Baju" />
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

  // Filter data sewa berdasarkan pencarian dan filter
  const filteredRentals = rentalData.filter((rental) => {
    const matchesSearch =
      rental.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.dressCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.dressName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || rental.status === filterStatus

    return matchesSearch && matchesStatus
  })

  // Filter koleksi baju berdasarkan pencarian
  const filteredCollection = dressCollection.filter((dress) => {
    return (
      dress.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dress.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dress.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Format tanggal
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  // Format currency
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-pink-900">Sewa Baju</h1>
          <p className="text-sm text-muted-foreground">Kelola penyewaan baju dan koleksi</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button asChild className="bg-pink-600 hover:bg-pink-700 flex-1 sm:flex-none">
            <Link href="/sewa-baju/tambah">
              <Plus className="mr-2 h-4 w-4" />
              Sewa Baru
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-pink-200 flex-1 sm:flex-none">
            <Link href="/sewa-baju/tambah-koleksi">
              <Shirt className="mr-2 h-4 w-4" />
              Tambah Koleksi
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-pink-100/50">
          <TabsTrigger value="rentals" className="data-[state=active]:bg-white">
            Penyewaan
          </TabsTrigger>
          <TabsTrigger value="collection" className="data-[state=active]:bg-white">
            Koleksi Baju
          </TabsTrigger>
          <TabsTrigger value="calendar" className="data-[state=active]:bg-white">
            Kalender
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rentals" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari nama klien atau kode baju..."
                className="pl-8 mobile-input w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <select
                className="w-full h-10 rounded-md border border-pink-200 bg-white px-3 py-2 text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Semua Status</option>
                <option value="Disewa">Disewa</option>
                <option value="Dikembalikan">Dikembalikan</option>
                <option value="Terlambat">Terlambat</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {filteredRentals.length > 0 ? (
              filteredRentals.map((rental) => (
                <Card key={rental.id} className="border-pink-100">
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-pink-900">{rental.clientName}</h3>
                          <div className="flex items-center mt-1">
                            <Barcode className="h-4 w-4 mr-1 text-pink-600" />
                            <span className="text-sm font-medium">{rental.dressCode}</span>
                          </div>
                          <p className="text-sm mt-1">{rental.dressName}</p>
                        </div>
                        <Badge
                          className={
                            rental.status === "Disewa"
                              ? "bg-blue-100 text-blue-800"
                              : rental.status === "Dikembalikan"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {rental.status}
                        </Badge>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <ArrowRight className="h-4 w-4 mr-1 text-pink-600" />
                          <span>Sewa: {formatDate(rental.rentDate)}</span>
                        </div>
                        <div className="flex items-center">
                          <ArrowLeft className="h-4 w-4 mr-1 text-pink-600" />
                          <span>Kembali: {formatDate(rental.returnDate)}</span>
                        </div>
                      </div>

                      <div className="mt-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">Harga Sewa:</span>
                          <span>{formatRupiah(rental.price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Deposit:</span>
                          <span>{formatRupiah(rental.deposit)}</span>
                        </div>
                      </div>

                      {rental.notes && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <p className="font-medium">Catatan:</p>
                          <p>{rental.notes}</p>
                        </div>
                      )}

                      <div className="mt-3 flex justify-end">
                        <Button variant="outline" size="sm" className="border-pink-200" asChild>
                          <Link href={`/sewa-baju/${rental.id}`}>Detail</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <Card className="border-pink-100">
                  <CardContent className="p-4 text-center">
                    <p className="text-muted-foreground">Tidak ada data penyewaan yang ditemukan</p>
                    <Button variant="link" className="mt-2" asChild>
                      <Link href="/sewa-baju/tambah">Tambah penyewaan baru</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="collection" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari nama atau kode baju..."
                className="pl-8 mobile-input w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCollection.length > 0 ? (
              filteredCollection.map((dress) => (
                <Card key={dress.id} className="border-pink-100 overflow-hidden">
                  <div className="aspect-[3/4] relative">
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
                            : dress.status === "Disewa"
                              ? "bg-blue-100 text-blue-800"
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
                    <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-80 px-2 py-1">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {dress.size.map((s) => (
                          <Badge key={s} className="bg-pink-100 text-pink-800 text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-pink-900 truncate">{dress.name}</h3>
                    <p className="text-xs text-muted-foreground">{dress.category}</p>

                    <div className="mt-2 pt-2 border-t border-dashed border-pink-100">
                      <h4 className="text-xs font-semibold text-pink-900 mb-1">Ukuran Detail:</h4>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        {dress.measurements && Object.entries(dress.measurements).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <span className="capitalize">{key}:</span> <span className="font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {dress.fittingNotes && (
                      <div className="mt-2 text-xs">
                        <h4 className="font-semibold text-pink-900 mb-1">Catatan Fitting:</h4>
                        <p className="text-gray-600 italic text-xs">{dress.fittingNotes}</p>
                      </div>
                    )}

                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Harga Sewa:</span>
                      <p className="font-medium text-pink-900">{formatRupiah(dress.price)}</p>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <Button variant="outline" size="sm" className="border-pink-200" asChild>
                        <Link href={`/sewa-baju/koleksi/${dress.id}`}>Detail</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <Card className="border-pink-100">
                  <CardContent className="p-4 text-center">
                    <p className="text-muted-foreground">Tidak ada koleksi baju yang ditemukan</p>
                    <Button variant="link" className="mt-2" asChild>
                      <Link href="/sewa-baju/tambah-koleksi">Tambah koleksi baru</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle>Kalender Penyewaan</CardTitle>
              <CardDescription>Jadwal penyewaan dan pengembalian baju</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto text-pink-300 mb-4" />
                <h3 className="text-lg font-medium text-pink-900 mb-2">Kalender Penyewaan</h3>
                <p className="text-muted-foreground mb-4">
                  Fitur kalender penyewaan sedang dalam pengembangan. Segera hadir!
                </p>
                <Button className="bg-pink-600 hover:bg-pink-700" asChild>
                  <Link href="/sewa-baju/tambah">Tambah Penyewaan Baru</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
