"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, ArrowLeft, Search, Star, MessageSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useData } from "@/contexts/data-context"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { FormStatus } from "@/components/form-status"

export function TambahJadwalMakeupClient({ clientId }: { clientId: number }) {
  const router = useRouter()
  const { clients, team, addEvent, isLoading } = useData()
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState("")
  const [location, setLocation] = useState("")
  const [eventType, setEventType] = useState("Pernikahan")
  const [services, setServices] = useState<string[]>(["Makeup"])
  const [notes, setNotes] = useState("")
  
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState("")
  
  // Tim internal
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTeamRole, setFilterTeamRole] = useState("all")
  const [selectedTeamMember, setSelectedTeamMember] = useState<number | null>(null)
  
  // Get client data
  const client = clients.find((c) => c.id === clientId)
  
  // Prefill some data if client exists
  useEffect(() => {
    if (client) {
      setLocation(client.location || "")
      setEventType(client.eventType || "Pernikahan")
      if (client.eventDate) {
        setSelectedDate(new Date(client.eventDate))
      }
    }
  }, [client])

  // Filter tim berdasarkan pencarian dan filter
  const filteredTeam = team.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterTeamRole === "all" || member.role === filterTeamRole
    return matchesSearch && matchesRole
  })

  // Generate WhatsApp link with pre-filled message
  const generateWhatsAppLink = (teamMember: any) => {
    if (!teamMember || !client) return "#";
    
    // Check if teamMember has a phone number
    if (!teamMember.phone) {
      return "#";
    }
    
    // Format phone number (remove any non-digit characters and ensure it starts with proper format)
    let phoneNumber = teamMember.phone.replace(/\D/g, "");
    if (phoneNumber.startsWith("0")) {
      phoneNumber = "62" + phoneNumber.substring(1);
    } else if (!phoneNumber.startsWith("62")) {
      phoneNumber = "62" + phoneNumber;
    }
    
    // Create message template
    const message = encodeURIComponent(
      `Hallo ${teamMember.name} ada jadwal makeup untuk acara ${eventType} untuk klien ${client.name} pada tanggal ${selectedDate ? format(selectedDate, "EEEE, d MMMM yyyy", { locale: id }) : "-"} jam ${time || "-"} di ${location || "-"}. Mohon konfirmasi ketersediaan.`
    );
    
    return `https://wa.me/${phoneNumber}?text=${message}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validasi form
    if (!clientId) {
      setFormStatus("error")
      setStatusMessage("ID Klien tidak valid")
      return
    }
    
    if (!selectedDate) {
      setFormStatus("error")
      setStatusMessage("Tanggal acara wajib diisi")
      return
    }
    
    if (!time) {
      setFormStatus("error")
      setStatusMessage("Waktu acara wajib diisi")
      return
    }
    
    if (!location) {
      setFormStatus("error")
      setStatusMessage("Lokasi acara wajib diisi")
      return
    }
    
    if (!eventType) {
      setFormStatus("error")
      setStatusMessage("Jenis acara wajib diisi")
      return
    }

    if (!selectedTeamMember) {
      setFormStatus("error")
      setStatusMessage("Anggota tim wajib dipilih")
      return
    }
    
    try {
      setFormStatus("loading")
      setStatusMessage("Menyimpan jadwal makeup...")
      
      if (!client) {
        throw new Error("Klien tidak ditemukan")
      }
      
      const teamMember = team.find((t) => t.id === selectedTeamMember)
      
      if (!teamMember) {
        throw new Error("Anggota tim tidak ditemukan")
      }
      
      // Persiapkan data acara
      const eventData = {
        clientId: clientId,
        clientName: client.name,
        eventDate: selectedDate.toISOString(),
        time,
        location,
        type: eventType,
        services,
        status: "pending" as "pending" | "confirmed" | "completed" | "cancelled",
        notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        teamMemberId: teamMember.id, // Tambahkan ID anggota tim
        teamMemberName: teamMember.name, // Tambahkan nama anggota tim
        teamMemberRole: teamMember.role, // Tambahkan peran anggota tim
        title: `Makeup - ${teamMember.name}` // Tambahkan judul event dengan nama anggota tim
      }
      
      // Simpan data acara
      await addEvent(eventData)
      
      // Set success message
      setFormStatus("success")
      setStatusMessage(`Pemesanan jadwal makeup berhasil disimpan! <br/>Anda juga dapat menghubungi ${teamMember.name} via WhatsApp untuk konfirmasi lebih lanjut.`)
      
      // Tidak langsung kembali ke halaman klien
      // router.push(`/klien/${clientId}`)
    } catch (err) {
      console.error("Error menambahkan jadwal:", err)
      setFormStatus("error")
      setStatusMessage(err instanceof Error ? err.message : "Terjadi kesalahan saat menambahkan jadwal")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle service selection toggle
  const toggleService = (service: string) => {
    setServices(prev => {
      if (prev.includes(service)) {
        return prev.filter(s => s !== service)
      } else {
        return [...prev, service]
      }
    })
  }

  // Loading state or client not found
  if (isLoading || !client) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-pink-900 mb-2">
            {isLoading ? "Memuat data..." : "Klien tidak ditemukan"}
          </h2>
          <Button variant="outline" onClick={() => router.back()}>
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
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-pink-900">Tambah Jadwal Make Up</h1>
          <p className="text-muted-foreground">Tambahkan jadwal makeup untuk {client.name}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle>Pilih Tim Makeup</CardTitle>
              <CardDescription>Pilih anggota tim untuk melakukan makeup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Cari anggota tim..."
                    className="pl-8 border-pink-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-[180px]">
                  <Select value={filterTeamRole} onValueChange={setFilterTeamRole}>
                    <SelectTrigger className="border-pink-200">
                      <SelectValue placeholder="Posisi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Posisi</SelectItem>
                      <SelectItem value="MUA">MUA</SelectItem>
                      <SelectItem value="Asisten MUA">Asisten MUA</SelectItem>
                      <SelectItem value="Dekorasi">Dekorasi</SelectItem>
                      <SelectItem value="Asisten Dekorasi">Asisten Dekorasi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {filteredTeam.length > 0 ? (
                  filteredTeam.map((member) => (
                    <div
                      key={member.id}
                      className={cn(
                        "p-3 border rounded-lg transition-colors cursor-pointer",
                        selectedTeamMember === member.id
                          ? "border-pink-500 bg-pink-50"
                          : "border-pink-100 hover:bg-pink-50/50"
                      )}
                      onClick={() => setSelectedTeamMember(member.id || null)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{member.name}</h3>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                          <Badge variant="outline" className="mt-1 border-blue-200 text-blue-800">
                            {member.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Tidak ada anggota tim yang ditemukan</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <form onSubmit={handleSubmit}>
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle>Detail Jadwal</CardTitle>
                <CardDescription>Masukkan informasi jadwal acara</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
                      <span className="font-medium w-24">Tanggal Acara:</span>
                      <span>
                        {client.eventDate && new Date(client.eventDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="font-medium w-24">Lokasi:</span>
                      <span>{client.location}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="font-medium w-24">Telepon:</span>
                      <span>{client.phone}</span>
                    </div>
                  </div>
                </div>

                <Separator />

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
                    <Input
                      id="time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="border-pink-200"
                    />
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
                  <Label htmlFor="services">Layanan</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {["Makeup", "Hairdo", "Gown Fitting", "Konsultasi"].map((service) => (
                      <Button
                        key={service}
                        type="button"
                        variant={services.includes(service) ? "default" : "outline"}
                        className={services.includes(service) ? "bg-pink-600" : "border-pink-200"}
                        onClick={() => toggleService(service)}
                      >
                        {service}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tambahkan catatan khusus jika diperlukan..."
                    className="min-h-[100px] border-pink-200"
                  />
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium mb-2">Tim Makeup Terpilih</h3>
                  {selectedTeamMember ? (
                    <div className="p-3 border border-pink-100 rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{team.find((t) => t.id === selectedTeamMember)?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {team.find((t) => t.id === selectedTeamMember)?.role}
                          </p>
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
                            href={generateWhatsAppLink(team.find((t) => t.id === selectedTeamMember))}
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
                      <p>Belum ada tim yang dipilih</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" className="border-pink-200" onClick={() => router.back()}>
                  Batal
                </Button>
                {formStatus === "success" && selectedTeamMember && (
                  <Button
                    type="button"
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                    onClick={() => window.open(generateWhatsAppLink(team.find(t => t.id === selectedTeamMember)), '_blank')}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Hubungi via WhatsApp
                  </Button>
                )}
                <Button 
                  type="submit" 
                  className="bg-pink-600 hover:bg-pink-700" 
                  disabled={formStatus === "loading" || formStatus === "success"}
                >
                  {formStatus === "loading" ? "Menyimpan..." : "Simpan Jadwal"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>

      <FormStatus status={formStatus} message={statusMessage} onReset={() => {
        setFormStatus("idle")
        if (formStatus === "success") {
          router.push(`/klien/${clientId}?tab=events`)
        }
      }} />
    </div>
  )
} 