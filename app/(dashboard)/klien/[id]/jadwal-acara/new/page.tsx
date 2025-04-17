"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ChevronLeft, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useData } from "@/contexts/data-context"
import { useToast } from "@/components/ui/use-toast"

interface TeamMember {
  id: number;
  name: string;
  role: string;
}

interface Client {
  id: number;
  name: string;
  eventDate?: string;
  location?: string;
  phone?: string;
  eventType?: string;
}

interface EventData {
  id: number;
  clientId: number;
  clientName: string;
  type: string;
  eventDate: string;
  time: string;
  location: string;
  notes: string;
  teamMemberId: number;
  teamMemberName: string;
  teamMemberRole: string;
  services?: string;
  createdAt: string;
  updatedAt: string;
}

export default function NewJadwalPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = Number(params.id)
  const { toast } = useToast()
  const { clients, events, addEvent } = useData()
  
  const [selectedServices, setSelectedServices] = useState<string[]>(["Makeup"])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  
  const [formData, setFormData] = useState({
    type: "Pernikahan",
    teamMemberId: 0,
    teamMemberName: "",
    teamMemberRole: "",
    eventDate: new Date().toISOString().split('T')[0],
    time: "08:00",
    location: "",
    notes: ""
  })
  
  const client = clients?.find((c) => c.id === clientId) as Client | undefined
  
  // Fetch team members from the context
  useEffect(() => {
    // Ideally this would come from context, but for now we'll use dummy data
    setTeamMembers([
      { id: 1, name: "Anisa", role: "MUA" },
      { id: 2, name: "Ranti", role: "Hairstylist" },
      { id: 3, name: "Budi", role: "Assistant" }
    ])
  }, [])
  
  useEffect(() => {
    if (client && client.location) {
      setFormData(prev => ({
        ...prev,
        location: client.location || ""
      }))
    }
  }, [client])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Validasi data
      if (!formData.type || !formData.eventDate || !formData.time || !formData.location) {
        toast({
          title: "Form tidak lengkap",
          description: "Harap isi semua field yang diperlukan",
          variant: "destructive",
        })
        return
      }
      
      // Tambahkan event baru
      await addEvent({
        clientId: clientId,
        clientName: client?.name || "",
        type: formData.type,
        eventDate: formData.eventDate,
        time: formData.time,
        location: formData.location,
        notes: formData.notes,
        teamMemberId: formData.teamMemberId,
        teamMemberName: formData.teamMemberName,
        teamMemberRole: formData.teamMemberRole,
        services: selectedServices.join(", "),
        status: "scheduled" // Default status for new events
      })
      
      toast({
        title: "Jadwal berhasil ditambahkan",
        description: "Jadwal makeup telah berhasil ditambahkan",
        variant: "default",
      })
      
      // Redirect kembali ke halaman detail klien
      router.push(`/klien/${clientId}?tab=events`)
    } catch (error) {
      console.error("Error adding event:", error)
      toast({
        title: "Gagal menambahkan jadwal",
        description: "Terjadi kesalahan saat menambahkan jadwal makeup",
        variant: "destructive",
      })
    }
  }
  
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Jika memilih team member, isi nama dan peran secara otomatis
    if (field === "teamMemberId" && value > 0) {
      const selectedMember = teamMembers.find(m => m.id === Number(value))
      if (selectedMember) {
        setFormData(prev => ({
          ...prev,
          teamMemberName: selectedMember.name,
          teamMemberRole: selectedMember.role
        }))
      }
    }
  }
  
  const toggleService = (service: string) => {
    setSelectedServices(prev => {
      if (prev.includes(service)) {
        return prev.filter(s => s !== service)
      } else {
        return [...prev, service]
      }
    })
  }
  
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
    return date.toLocaleDateString('id-ID', options)
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tambah Jadwal Make Up</h1>
          <p className="text-muted-foreground">Tambahkan jadwal makeup untuk {client?.name || "klien"}</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pilih Tim Makeup */}
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle>Pilih Tim Makeup</CardTitle>
              <p className="text-sm text-muted-foreground">Pilih anggota tim untuk melakukan makeup</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search" 
                    placeholder="Cari anggota tim..." 
                    className="pl-8 border-pink-200"
                  />
                </div>
                
                <Select 
                  value={formData.teamMemberId ? formData.teamMemberId.toString() : ""}
                  onValueChange={(value) => handleInputChange("teamMemberId", parseInt(value))}
                >
                  <SelectTrigger className="border-pink-200">
                    <SelectValue placeholder="Semua Posisi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Semua Posisi</SelectItem>
                    <SelectItem value="1">MUA</SelectItem>
                    <SelectItem value="2">Hairstylist</SelectItem>
                    <SelectItem value="3">Assistant</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center justify-center h-32 border border-dashed border-pink-200 rounded-md">
                  <p className="text-muted-foreground text-sm">Tidak ada anggota tim yang ditemukan</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Detail Jadwal */}
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle>Detail Jadwal</CardTitle>
              <p className="text-sm text-muted-foreground">Masukkan informasi jadwal acara</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Informasi Klien */}
              <div className="bg-pink-50 p-4 rounded-md space-y-2">
                <h3 className="text-sm font-medium text-pink-900">Informasi Klien</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div className="text-muted-foreground">Nama:</div>
                  <div>{client?.name}</div>
                  <div className="text-muted-foreground">Jenis Acara:</div>
                  <div>{client?.eventType || "Pernikahan"}</div>
                  <div className="text-muted-foreground">Tanggal Acara:</div>
                  <div>{client?.eventDate ? formatDate(client.eventDate) : formatDate(new Date().toISOString())}</div>
                  <div className="text-muted-foreground">Lokasi:</div>
                  <div>{client?.location || "-"}</div>
                  <div className="text-muted-foreground">Telepon:</div>
                  <div>{client?.phone || "-"}</div>
                </div>
              </div>
              
              {/* Tanggal dan Waktu */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tanggal Acara</label>
                  <div className="relative">
                    <Input 
                      type="date" 
                      className="border-pink-200" 
                      value={formData.eventDate}
                      onChange={(e) => handleInputChange("eventDate", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Waktu Acara</label>
                  <div className="relative">
                    <Input 
                      type="time" 
                      className="border-pink-200" 
                      value={formData.time}
                      onChange={(e) => handleInputChange("time", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Jenis Acara */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Jenis Acara</label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => handleInputChange("type", value)}
                  required
                >
                  <SelectTrigger className="border-pink-200">
                    <SelectValue placeholder="Pilih jenis acara" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pernikahan">Pernikahan</SelectItem>
                    <SelectItem value="Prewedding">Prewedding</SelectItem>
                    <SelectItem value="Engagement">Engagement</SelectItem>
                    <SelectItem value="Siraman">Siraman</SelectItem>
                    <SelectItem value="Makeup Trial">Makeup Trial</SelectItem>
                    <SelectItem value="Family Makeup">Family Makeup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Lokasi Acara */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Lokasi Acara</label>
                <Input 
                  className="border-pink-200" 
                  placeholder="Masukkan lokasi"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  required
                />
              </div>
              
              {/* Layanan */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Layanan</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={selectedServices.includes("Makeup") ? "default" : "outline"}
                    className={selectedServices.includes("Makeup") ? "bg-pink-600 hover:bg-pink-700" : "border-pink-200"}
                    onClick={() => toggleService("Makeup")}
                  >
                    Makeup
                  </Button>
                  <Button
                    type="button"
                    variant={selectedServices.includes("Hairdo") ? "default" : "outline"}
                    className={selectedServices.includes("Hairdo") ? "bg-pink-600 hover:bg-pink-700" : "border-pink-200"}
                    onClick={() => toggleService("Hairdo")}
                  >
                    Hairdo
                  </Button>
                  <Button
                    type="button"
                    variant={selectedServices.includes("Gown Fitting") ? "default" : "outline"}
                    className={selectedServices.includes("Gown Fitting") ? "bg-pink-600 hover:bg-pink-700" : "border-pink-200"}
                    onClick={() => toggleService("Gown Fitting")}
                  >
                    Gown Fitting
                  </Button>
                  <Button
                    type="button"
                    variant={selectedServices.includes("Konsultasi") ? "default" : "outline"}
                    className={selectedServices.includes("Konsultasi") ? "bg-pink-600 hover:bg-pink-700" : "border-pink-200"}
                    onClick={() => toggleService("Konsultasi")}
                  >
                    Konsultasi
                  </Button>
                </div>
              </div>
              
              {/* Catatan */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Catatan</label>
                <Textarea 
                  className="border-pink-200 resize-none" 
                  placeholder="Tambahkan catatan khusus jika diperlukan..."
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Footer Buttons */}
        <div className="flex justify-end mt-6 space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
          >
            Batal
          </Button>
          <Button 
            type="submit"
            className="bg-pink-600 hover:bg-pink-700"
          >
            Simpan Jadwal
          </Button>
        </div>
      </form>
    </div>
  )
} 