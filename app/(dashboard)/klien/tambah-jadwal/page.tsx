"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CalendarIcon, Clock, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useData } from "@/contexts/data-context"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"

export default function TambahJadwalPage() {
  const router = useRouter()
  const { clients, addEvent, refreshData } = useData()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedClient, setSelectedClient] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState("")
  const [eventType, setEventType] = useState("")
  const [location, setLocation] = useState("")
  const [notes, setNotes] = useState("")
  const [services, setServices] = useState<string[]>([])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  // Memuat data klien yang dipilih
  useEffect(() => {
    if (selectedClient) {
      const client = clients.find((c) => c.id === selectedClient)
      if (client) {
        setLocation(client.location || "")
        setEventType(client.eventType || "")
        setServices(client.services || [])
      }
    }
  }, [selectedClient, clients])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validasi form
    if (!selectedClient) {
      setError("Silakan pilih klien terlebih dahulu")
      return
    }
    
    if (!selectedDate) {
      setError("Tanggal acara wajib diisi")
      return
    }
    
    if (!time) {
      setError("Waktu acara wajib diisi")
      return
    }
    
    if (!location) {
      setError("Lokasi acara wajib diisi")
      return
    }
    
    if (!eventType) {
      setError("Jenis acara wajib diisi")
      return
    }
    
    try {
      setIsSubmitting(true)
      setError(null)
      
      const client = clients.find((c) => c.id === selectedClient)
      
      if (!client) {
        throw new Error("Klien tidak ditemukan")
      }
      
      // Persiapkan data acara
      const eventData = {
        clientId: selectedClient,
        clientName: client.name,
        eventDate: selectedDate.toISOString(),
        time,
        location,
        type: eventType,
        services,
        status: "pending" as "pending" | "confirmed" | "completed" | "cancelled",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      // Simpan data acara
      await addEvent(eventData)
      
      // Kembali ke halaman jadwal
      router.push("/klien")
    } catch (err) {
      console.error("Error menambahkan jadwal:", err)
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat menambahkan jadwal")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" asChild className="mr-2">
          <Link href="/klien">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-pink-900">Tambah Roundwoon Acara</h1>
          <p className="text-muted-foreground">Tambahkan jadwal acara baru untuk klien</p>
        </div>
      </div>
      
      <Card className="border-pink-100">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-xl text-pink-900">Detail Acara</CardTitle>
            <CardDescription>Isi data lengkap acara yang akan dijadwalkan</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm">{error}</div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="client">Pilih Klien</Label>
              <Select 
                value={selectedClient?.toString() || ""} 
                onValueChange={(value) => setSelectedClient(parseInt(value, 10))}
              >
                <SelectTrigger id="client" className="border-pink-200">
                  <SelectValue placeholder="Pilih klien..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id?.toString() || ""}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Tanggal Acara</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-pink-200",
                        !selectedDate && "text-muted-foreground"
                      )}
                      id="date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "EEEE, d MMMM yyyy", { locale: id })
                      ) : (
                        <span>Pilih tanggal</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Waktu Acara</Label>
                <div className="flex items-center">
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="border-pink-200"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="eventType">Jenis Acara</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger id="eventType" className="border-pink-200">
                  <SelectValue placeholder="Pilih jenis acara..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pernikahan">Pernikahan</SelectItem>
                  <SelectItem value="Prewedding">Prewedding</SelectItem>
                  <SelectItem value="Engagement">Engagement</SelectItem>
                  <SelectItem value="Lamaran">Lamaran</SelectItem>
                  <SelectItem value="Siraman">Siraman</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Lokasi Acara</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border-pink-200"
                placeholder="Masukkan lokasi acara..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="services">Layanan yang Digunakan</Label>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="makeup"
                    checked={services.includes("Makeup")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setServices([...services, "Makeup"])
                      } else {
                        setServices(services.filter((s) => s !== "Makeup"))
                      }
                    }}
                    className="rounded border-pink-300 text-pink-600 focus:ring-pink-500"
                  />
                  <label htmlFor="makeup" className="text-sm">Makeup</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="dekorasi"
                    checked={services.includes("Dekorasi")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setServices([...services, "Dekorasi"])
                      } else {
                        setServices(services.filter((s) => s !== "Dekorasi"))
                      }
                    }}
                    className="rounded border-pink-300 text-pink-600 focus:ring-pink-500"
                  />
                  <label htmlFor="dekorasi" className="text-sm">Dekorasi</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="busana"
                    checked={services.includes("Busana")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setServices([...services, "Busana"])
                      } else {
                        setServices(services.filter((s) => s !== "Busana"))
                      }
                    }}
                    className="rounded border-pink-300 text-pink-600 focus:ring-pink-500"
                  />
                  <label htmlFor="busana" className="text-sm">Busana</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="fotografi"
                    checked={services.includes("Fotografi")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setServices([...services, "Fotografi"])
                      } else {
                        setServices(services.filter((s) => s !== "Fotografi"))
                      }
                    }}
                    className="rounded border-pink-300 text-pink-600 focus:ring-pink-500"
                  />
                  <label htmlFor="fotografi" className="text-sm">Fotografi</label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan Tambahan</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="border-pink-200 min-h-[100px]"
                placeholder="Tambahkan catatan jika diperlukan..."
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t border-pink-100 pt-4">
            <Button variant="outline" type="button" onClick={() => router.back()} className="border-pink-200">
              Batal
            </Button>
            <Button type="submit" className="bg-pink-600 hover:bg-pink-700" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 