"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, Search, Star, Calendar, MapPin, Phone, MessageSquare, Check } from "lucide-react"

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Event } from "@/lib/db/db-service"
import { DBService } from "@/lib/db/db-service"

// Konfigurasi dynamic rendering
export const dynamic = "force-dynamic"

export default function BookMakeupPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = Number(params.id)
  const { clients, team, refreshData, addEvent, isLoading, error } = useData()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("MUA")
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState("")

  // Makeup booking details
  const [selectedArtist, setSelectedArtist] = useState<number | null>(null)
  const [bookingDate, setBookingDate] = useState<Date>(new Date())
  const [eventDate, setEventDate] = useState<Date>(new Date())
  const [time, setTime] = useState("")
  const [location, setLocation] = useState("")
  const [notes, setNotes] = useState("")
  const [services, setServices] = useState<string[]>(["Makeup"])

  // Get client data
  const client = clients.find((c) => c.id === clientId)

  // Refresh data when component mounts
  useEffect(() => {
    refreshData(true)
    
    // Prefill event date and location from client if available
    if (client) {
      try {
        const clientEventDate = new Date(client.eventDate)
        setEventDate(clientEventDate)
        setLocation(client.location)
      } catch (error) {
        console.error("Error setting default date:", error)
      }
    }
  }, [refreshData, client])

  // Filter MUAs based on search and role
  const filteredTeam = team.filter((member) => {
    const matchesSearch =
      searchTerm === "" ||
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.skills && member.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())))

    // Filter hanya menampilkan MUA dan Asisten MUA
    const matchesRole = 
      (filterRole === "all") || 
      (filterRole === member.role) || 
      (member.role === "MUA" || member.role === "Asisten MUA")

    return matchesSearch && matchesRole
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

  // Generate WhatsApp link with pre-filled message
  const generateWhatsAppLink = (artist: any) => {
    if (!artist || !client) return "#";
    
    // Check if artist has a phone number
    if (!artist.phone) {
      return "#";
    }
    
    // Format phone number (remove any non-digit characters and ensure it starts with proper format)
    let phoneNumber = artist.phone.replace(/\D/g, "");
    if (phoneNumber.startsWith("0")) {
      phoneNumber = "62" + phoneNumber.substring(1);
    } else if (!phoneNumber.startsWith("62")) {
      phoneNumber = "62" + phoneNumber;
    }
    
    // Create message template
    const message = encodeURIComponent(
      `Hallo ${artist.name}, saya ingin booking jasa makeup untuk acara ${client.eventType || "pernikahan"} tanggal ${formatDate(eventDate)}, lokasi di ${location || "TBD"}. Mohon konfirmasi jika ${formatDate(eventDate)} masih tersedia. Terima kasih.`
    );
    
    return `https://wa.me/${phoneNumber}?text=${message}`;
  };

  // Handle booking submission
  const handleBookMakeup = async () => {
    if (!selectedArtist || !client) {
      setFormStatus("error")
      setStatusMessage("Silakan pilih makeup artist terlebih dahulu")
      return
    }

    if (!time) {
      setFormStatus("error")
      setStatusMessage("Silakan isi waktu acara")
      return
    }

    if (!location) {
      setFormStatus("error")
      setStatusMessage("Silakan isi lokasi acara")
      return
    }

    try {
      setFormStatus("loading")
      setStatusMessage("Menyimpan pemesanan makeup artist...")

      const artist = team.find((a) => a.id === selectedArtist)

      if (!artist) {
        throw new Error("Makeup artist tidak ditemukan")
      }

      // Prepare event data for makeup booking
      const eventData: Omit<Event, "id" | "createdAt" | "updatedAt"> = {
        clientId: clientId,
        clientName: client.name,
        eventDate: eventDate.toISOString(),
        time: time,
        location: location,
        type: "Makeup - " + (artist.role || "MUA"),
        services: services,
        team: [artist.name],
        status: "pending",
        notes: notes,
      }

      // Add event to database
      const dbService = DBService.getInstance()
      const eventId = await dbService.add<Event>("events", eventData as Event)
      
      // Set form status to success
      setFormStatus("success")
      setStatusMessage(`Pemesanan makeup artist berhasil disimpan!`)
      
      // Create WhatsApp link
      const whatsappLink = generateWhatsAppLink(artist)
      
      // Open WhatsApp link automatically
      window.open(whatsappLink, '_blank')
      
      // Refresh data again before navigation to ensure latest data
      await refreshData(true)
      
      // After 1.5 seconds, redirect to client page
      setTimeout(() => {
        router.push(`/klien/${clientId}?tab=events`)
      }, 1500)
      
    } catch (error) {
      console.error("Error booking makeup artist:", error)
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
          <h1 className="text-2xl font-bold tracking-tight text-pink-900">Pesan Makeup Artist</h1>
          <p className="text-muted-foreground">Pesan makeup artist untuk {client.name}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle>Pilih Makeup Artist</CardTitle>
              <CardDescription>Pilih makeup artist untuk acara klien</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Cari makeup artist..."
                    className="pl-8 border-pink-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-[180px]">
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="border-pink-200">
                      <SelectValue placeholder="Tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="MUA">MUA</SelectItem>
                      <SelectItem value="Asisten MUA">Asisten MUA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {filteredTeam.length > 0 ? (
                  filteredTeam
                    .filter(artist => artist.role === "MUA" || artist.role === "Asisten MUA")
                    .map((artist) => (
                    <div
                      key={artist.id}
                      className={cn(
                        "p-3 border rounded-lg transition-colors cursor-pointer",
                        selectedArtist === artist.id
                          ? "border-pink-500 bg-pink-50"
                          : "border-pink-100 hover:bg-pink-50/50"
                      )}
                      onClick={() => setSelectedArtist(artist.id || null)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={artist.avatar || "/placeholder-user.jpg"} alt={artist.name} />
                            <AvatarFallback className="bg-pink-200 text-pink-700">
                              {artist.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{artist.name}</h3>
                            <p className="text-sm text-muted-foreground">{artist.role}</p>

                            <div className="flex items-center mt-1">
                              <Badge variant="outline" className="text-xs border-pink-200 text-pink-800">
                                {artist.status}
                              </Badge>
                            </div>

                            <div className="mt-2 flex flex-wrap gap-1">
                              {artist.skills && artist.skills.map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs border-pink-200 text-pink-800">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Tidak ada makeup artist yang ditemukan</p>
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
              <CardDescription>Informasi pemesanan makeup artist</CardDescription>
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
                  <Label htmlFor="time">Waktu Acara</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="border-pink-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Lokasi Acara</Label>
                  <Input
                    id="location"
                    placeholder="Masukkan lokasi acara"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="border-pink-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan</Label>
                  <Textarea
                    id="notes"
                    placeholder="Masukkan catatan atau permintaan khusus"
                    className="border-pink-200 resize-none min-h-[100px]"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-2">Makeup Artist Terpilih</h3>
                {selectedArtist ? (
                  <div className="p-3 border border-pink-100 rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage 
                            src={team.find((a) => a.id === selectedArtist)?.avatar || "/placeholder-user.jpg"} 
                            alt="MUA" 
                          />
                          <AvatarFallback className="bg-pink-200 text-pink-700">
                            {team.find((a) => a.id === selectedArtist)?.name?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{team.find((a) => a.id === selectedArtist)?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {team.find((a) => a.id === selectedArtist)?.role}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-pink-100">
                      <Button 
                        variant="outline"
                        size="sm"
                        className="w-full text-green-600 border-green-200 hover:bg-green-50"
                        asChild
                      >
                        <a 
                          href={generateWhatsAppLink(team.find((a) => a.id === selectedArtist))}
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
                    <p>Belum ada makeup artist yang dipilih</p>
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
                onClick={handleBookMakeup}
                disabled={!selectedArtist || formStatus === "loading" || formStatus === "success"}
              >
                {formStatus === "loading" ? "Menyimpan..." : "Pesan Makeup Artist"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <FormStatus status={formStatus} message={statusMessage} onReset={() => setFormStatus("idle")} />
    </div>
  )
} 