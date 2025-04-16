"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, Search, Star, Calendar, MapPin, Phone, MessageSquare, MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { FormStatus } from "@/components/form-status"
import { useData } from "@/contexts/data-context"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { DBService } from "@/lib/db/db-service"
import type { VendorBooking } from "@/lib/db/db-service"

// Konfigurasi dynamic rendering 
export const dynamic = "force-dynamic"

export default function BookVendorPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = Number(params.id)
  const { clients, vendors, refreshData, addVendorBooking, isLoading, error } = useData()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState("")

  // Selected vendor and booking details
  const [selectedVendor, setSelectedVendor] = useState<number | null>(null)
  const [bookingDate, setBookingDate] = useState<Date>(new Date())
  const [eventDate, setEventDate] = useState<Date>(new Date())
  const [notes, setNotes] = useState("")

  // Get client data
  const client = clients.find((c) => c.id === clientId)

  // Refresh data when component mounts
  useEffect(() => {
    refreshData(true)
  }, [refreshData])

  // Filter vendors based on search and category
  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      searchTerm === "" ||
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.services.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = categoryFilter === "all" || vendor.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  // Format currency
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  // Check if vendor is already booked for the selected date
  const isVendorBooked = (vendorId: number) => {
    // Semua vendor selalu tersedia untuk semua klien
    // Tidak perlu memeriksa apakah vendor sudah dibooking
    return false;
  }

  // Generate WhatsApp link with pre-filled message
  const generateWhatsAppLink = (vendor: any) => {
    if (!vendor || !client) return "#";
    
    // Check if vendor has a phone number
    if (!vendor.phone) {
      return "#";
    }
    
    // Format phone number (remove any non-digit characters and ensure it starts with proper format)
    let phoneNumber = vendor.phone.replace(/\D/g, "");
    if (phoneNumber.startsWith("0")) {
      phoneNumber = "62" + phoneNumber.substring(1);
    } else if (!phoneNumber.startsWith("62")) {
      phoneNumber = "62" + phoneNumber;
    }
    
    // Create message template
    const message = encodeURIComponent(
      `Hallo ${vendor.name} mau booking ${vendor.category} untuk acara ${client.eventType || "pernikahan"} untuk tanggal ${formatDate(eventDate)}, mohon konfirmasi jika ${formatDate(eventDate)} masih tersedia`
    );
    
    return `https://wa.me/${phoneNumber}?text=${message}`;
  };

  // Handle booking submission
  const handleBookVendor = async () => {
    if (!selectedVendor || !client) {
      setFormStatus("error")
      setStatusMessage("Silakan pilih vendor terlebih dahulu")
      return
    }

    try {
      setFormStatus("loading")
      setStatusMessage("Menyimpan pemesanan vendor...")

      const vendor = vendors.find((v) => v.id === selectedVendor)

      if (!vendor) {
        throw new Error("Vendor tidak ditemukan")
      }

      const bookingData: Omit<VendorBooking, "id" | "createdAt" | "updatedAt"> = {
        clientId: clientId,
        clientName: client.name,
        vendorId: vendor.id!,
        vendorName: vendor.name,
        vendorCategory: vendor.category,
        eventDate: eventDate.toISOString(),
        bookingDate: bookingDate.toISOString(),
        price: vendor.price,
        status: "pending",
        notes: notes,
        paymentStatus: "unpaid",
      }

      // Menggunakan addVendorBooking dari context
      await addVendorBooking(bookingData)
      
      // Set form status ke success (tidak perlu menunggu refresh data)
      setFormStatus("success")
      setStatusMessage(`Pemesanan vendor berhasil disimpan!`)
      
      // Buat WhatsApp link
      const whatsappLink = generateWhatsAppLink(vendor)
      
      // Buka WhatsApp link secara otomatis
      window.open(whatsappLink, '_blank')
      
      // Refresh data kembali sebelum navigasi untuk memastikan data terbaru
      await refreshData(true)
      
      // Setelah 1.5 detik, redirect ke halaman klien
      setTimeout(() => {
        router.push(`/klien/${clientId}?tab=vendors`)
      }, 1500)
      
    } catch (error) {
      console.error("Error booking vendor:", error)
      setFormStatus("error")
      setStatusMessage("Terjadi kesalahan saat menyimpan pemesanan")
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Skeleton className="h-10 w-10 mr-2" />
          <div>
            <Skeleton className="h-8 w-48 mb-1" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    )
  }

  // Error state
  if (error || !client) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-red-600">Terjadi Kesalahan</h2>
          <p className="text-muted-foreground">{error?.message || "Klien tidak ditemukan"}</p>
          <Button onClick={() => router.back()} className="bg-pink-600 hover:bg-pink-700">
            Kembali
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-pink-900">Pesan Vendor</h1>
          <p className="text-muted-foreground">Pesan vendor untuk {client.name}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle>Pilih Vendor</CardTitle>
              <CardDescription>Pilih vendor untuk acara klien</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Cari vendor..."
                    className="pl-8 border-pink-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-[180px]">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="border-pink-200">
                      <SelectValue placeholder="Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kategori</SelectItem>
                      <SelectItem value="Fotografi">Fotografi</SelectItem>
                      <SelectItem value="Videografi">Videografi</SelectItem>
                      <SelectItem value="Katering">Katering</SelectItem>
                      <SelectItem value="Dekorasi">Dekorasi</SelectItem>
                      <SelectItem value="Musik">Musik</SelectItem>
                      <SelectItem value="MC">MC</SelectItem>
                      <SelectItem value="MUA">MUA</SelectItem>
                      <SelectItem value="Venue">Venue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {filteredVendors.length > 0 ? (
                  filteredVendors.map((vendor) => {
                    const isBooked = isVendorBooked(vendor.id || 0)

                    return (
                      <div
                        key={vendor.id}
                        className={cn(
                          "p-3 border rounded-lg transition-colors cursor-pointer",
                          selectedVendor === vendor.id
                            ? "border-pink-500 bg-pink-50"
                            : "border-pink-100 hover:bg-pink-50/50",
                          isBooked && "opacity-50",
                        )}
                        onClick={() => !isBooked && setSelectedVendor(vendor.id || null)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-medium">{vendor.name}</h3>
                              {isBooked && (
                                <Badge variant="outline" className="ml-2 border-yellow-200 text-yellow-800">
                                  Sudah Dibooking
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{vendor.category}</p>

                            <div className="flex items-center mt-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3.5 w-3.5 ${
                                      i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="ml-1 text-xs text-gray-600">4.0</span>
                            </div>

                            <div className="mt-2 flex flex-wrap gap-1">
                              {vendor.services.map((service, index) => (
                                <Badge key={index} variant="outline" className="border-pink-200 text-pink-800">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-medium text-pink-900">{formatRupiah(vendor.price)}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Tidak ada vendor yang ditemukan</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle>Detail Pemesanan</CardTitle>
              <CardDescription>Informasi pemesanan vendor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-pink-50 rounded-lg">
                <h3 className="font-medium text-pink-900">Informasi Klien</h3>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-sm">
                    <span className="font-medium w-24">Nama:</span>
                    <span>{client.name}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-medium w-24">Jenis Acara:</span>
                    <span>{client.eventType}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-pink-600 flex-shrink-0" />
                    <span>
                      {new Date(client.eventDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-pink-600 flex-shrink-0" />
                    <span>{client.location}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-pink-600 flex-shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tanggal Pemesanan</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-pink-200",
                          !bookingDate && "text-muted-foreground",
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {bookingDate ? formatDate(bookingDate) : <span>Pilih tanggal</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={bookingDate}
                        onSelect={(date) => date && setBookingDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Tanggal Acara</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-pink-200",
                          !eventDate && "text-muted-foreground",
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {eventDate ? formatDate(eventDate) : <span>Pilih tanggal</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={eventDate}
                        onSelect={(date) => date && setEventDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan</Label>
                  <Textarea
                    id="notes"
                    placeholder="Masukkan catatan atau instruksi khusus"
                    className="border-pink-200 resize-none min-h-[100px]"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-2">Vendor Terpilih</h3>
                {selectedVendor ? (
                  <div className="p-3 border border-pink-100 rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{vendors.find((v) => v.id === selectedVendor)?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {vendors.find((v) => v.id === selectedVendor)?.category}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-pink-900">
                        {formatRupiah(vendors.find((v) => v.id === selectedVendor)?.price || 0)}
                      </p>
                    </div>
                    
                    <div className="pt-2 border-t border-pink-100">
                      <Button 
                        variant="outline"
                        size="sm"
                        className="w-full text-green-600 border-green-200 hover:bg-green-50"
                        asChild
                      >
                        <a 
                          href={generateWhatsAppLink(vendors.find((v) => v.id === selectedVendor))}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Chat WhatsApp
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>Belum ada vendor yang dipilih</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button type="button" variant="outline" className="border-pink-200" onClick={() => router.back()}>
                Batal
              </Button>
              <Button
                type="button"
                className="bg-pink-600 hover:bg-pink-700"
                onClick={handleBookVendor}
                disabled={!selectedVendor || formStatus === "loading" || formStatus === "success"}
              >
                {formStatus === "loading" ? "Menyimpan..." : "Pesan Vendor"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <FormStatus status={formStatus} message={statusMessage} onReset={() => setFormStatus("idle")} />
    </div>
  )
}
