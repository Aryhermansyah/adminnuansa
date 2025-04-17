"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ChevronLeft, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useData } from "@/contexts/data-context"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditJadwalPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = Number(params.id)
  const eventId = Number(params.eventId)
  const { toast } = useToast()
  const { clients, teamMembers, events, updateEvent, isLoading, error, refreshData } = useData()
  
  const [formData, setFormData] = useState({
    type: "",
    teamMemberId: 0,
    teamMemberName: "",
    teamMemberRole: "",
    eventDate: "",
    time: "",
    location: "",
    notes: ""
  })
  
  const client = clients?.find((c) => c.id === clientId)
  const event = events?.find((e) => e.id === eventId)
  
  // Load event data when component mounts
  useEffect(() => {
    refreshData(true)
    
    if (event) {
      setFormData({
        type: event.type || "",
        teamMemberId: event.teamMemberId || 0,
        teamMemberName: (event as any).teamMemberName || "",
        teamMemberRole: (event as any).teamMemberRole || "",
        eventDate: event.eventDate || "",
        time: event.time || "",
        location: event.location || "",
        notes: event.notes || ""
      })
    }
  }, [event, refreshData])
  
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
      
      // Update event
      await updateEvent(eventId, {
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
        updatedAt: new Date().toISOString()
      })
      
      toast({
        title: "Jadwal berhasil diperbarui",
        description: "Jadwal makeup telah berhasil diperbarui",
        variant: "default",
      })
      
      // Redirect kembali ke halaman detail klien
      router.push(`/klien/${clientId}?tab=events`)
    } catch (error) {
      console.error("Error updating event:", error)
      toast({
        title: "Gagal memperbarui jadwal",
        description: "Terjadi kesalahan saat memperbarui jadwal makeup",
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
      const selectedMember = teamMembers?.find(m => m.id === Number(value))
      if (selectedMember) {
        setFormData(prev => ({
          ...prev,
          teamMemberName: selectedMember.name,
          teamMemberRole: selectedMember.role
        }))
      }
    }
  }
  
  // Loading state
  if (isLoading || !event) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Skeleton className="h-10 w-10 mr-2" />
          <div>
            <Skeleton className="h-8 w-48 mb-1" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }
  
  // Error state
  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-red-600">Terjadi Kesalahan</h2>
          <p className="text-muted-foreground">{error?.message || "Jadwal tidak ditemukan"}</p>
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
          <h1 className="text-2xl font-bold tracking-tight">Edit Jadwal Makeup</h1>
          <p className="text-muted-foreground">{client?.name || "Klien"}</p>
        </div>
      </div>
      
      <Card className="border-pink-100">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Informasi Jadwal</CardTitle>
            <CardDescription>Edit detail jadwal makeup</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Jenis Makeup</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleInputChange("type", value)}
                required
              >
                <SelectTrigger id="type" className="border-pink-200">
                  <SelectValue placeholder="Pilih jenis makeup" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Makeup Trial">Makeup Trial</SelectItem>
                  <SelectItem value="Makeup">Makeup</SelectItem>
                  <SelectItem value="Prewedding">Prewedding</SelectItem>
                  <SelectItem value="Engagement">Engagement</SelectItem>
                  <SelectItem value="Wedding">Wedding</SelectItem>
                  <SelectItem value="Siraman">Siraman</SelectItem>
                  <SelectItem value="Family Makeup">Family Makeup</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-date">Tanggal</Label>
                <Input 
                  id="event-date" 
                  type="date" 
                  className="border-pink-200" 
                  value={formData.eventDate}
                  onChange={(e) => handleInputChange("eventDate", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Waktu</Label>
                <Input 
                  id="time" 
                  type="time" 
                  className="border-pink-200" 
                  value={formData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Lokasi</Label>
              <Input 
                id="location" 
                className="border-pink-200" 
                placeholder="Masukkan lokasi"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="team-member">Pilih Team</Label>
              <Select 
                value={formData.teamMemberId ? formData.teamMemberId.toString() : ""}
                onValueChange={(value) => handleInputChange("teamMemberId", parseInt(value))}
              >
                <SelectTrigger id="team-member" className="border-pink-200">
                  <SelectValue placeholder="Pilih anggota tim" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Belum Ditentukan</SelectItem>
                  {teamMembers?.map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.name} - {member.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan Tambahan</Label>
              <Textarea 
                id="notes" 
                className="border-pink-200 resize-none" 
                placeholder="Masukkan catatan tambahan"
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
            >
              Batal
            </Button>
            <div className="space-x-2">
              <Button 
                type="submit"
                className="bg-pink-600 hover:bg-pink-700"
              >
                Simpan Perubahan
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 