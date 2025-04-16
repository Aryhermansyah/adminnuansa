"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, Save, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { useData } from "@/contexts/data-context"
import { DataLoading } from "@/components/data-loading"
import { FormStatus } from "@/components/form-status"

export function EditClientClient() {
  const router = useRouter()
  const params = useParams()
  const clientId = Number(params.id)
  const { clients, loading, error, updateClient, deleteClient, refreshData } = useData()
  const { toast } = useToast()

  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [formError, setFormError] = useState<string | null>(null)

  // Client form state
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [eventType, setEventType] = useState("")
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined)
  const [location, setLocation] = useState("")
  const [budget, setBudget] = useState("")
  const [status, setStatus] = useState("Aktif")
  const [notes, setNotes] = useState("")
  const [referenceSource, setReferenceSource] = useState("")

  // Services checkboxes
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const availableServices = [
    "Wedding Organizer",
    "Dokumentasi",
    "Dekorasi",
    "Katering",
    "Sewa Baju",
    "Makeup",
    "Entertainment",
  ]

  // Palette colors
  const [palette, setPalette] = useState<string[]>([])
  const [newColor, setNewColor] = useState("#ffffff")

  // Photos
  const [attirePhotos, setAttirePhotos] = useState<string[]>([])
  const [moodboards, setMoodboards] = useState<string[]>([])

  // Load client data
  useEffect(() => {
    refreshData()
  }, [refreshData])

  useEffect(() => {
    if (!loading && clients.length > 0) {
      const client = clients.find((c) => c.id === clientId)
      if (client) {
        setName(client.name || "")
        setPhone(client.phone || "")
        setEmail(client.email || "")
        setAddress(client.address || "")
        setEventType(client.eventType || "")
        setEventDate(client.eventDate ? new Date(client.eventDate) : undefined)
        setLocation(client.location || "")
        setBudget(client.budget ? client.budget.toString() : "")
        setStatus(client.status || "Aktif")
        setNotes(client.notes || "")
        setReferenceSource(client.referenceSource || "")
        setSelectedServices(client.services || [])
        setPalette(client.palette || [])
        setAttirePhotos(client.attirePhotos || [])
        setMoodboards(client.moodboards || [])
      }
    }
  }, [loading, clients, clientId])

  // Handle service checkbox change
  const handleServiceChange = (service: string, checked: boolean) => {
    if (checked) {
      setSelectedServices([...selectedServices, service])
    } else {
      setSelectedServices(selectedServices.filter((s) => s !== service))
    }
  }

  // Handle adding a color to palette
  const handleAddColor = () => {
    if (newColor && !palette.includes(newColor)) {
      setPalette([...palette, newColor])
      setNewColor("#ffffff")
    }
  }

  // Handle removing a color from palette
  const handleRemoveColor = (color: string) => {
    setPalette(palette.filter((c) => c !== color))
  }

  // Handle adding a photo URL
  const handleAddAttirePhoto = (url: string) => {
    if (url && !attirePhotos.includes(url)) {
      setAttirePhotos([...attirePhotos, url])
    }
  }

  // Handle adding a moodboard URL
  const handleAddMoodboard = (url: string) => {
    if (url && !moodboards.includes(url)) {
      setMoodboards([...moodboards, url])
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setFormStatus("submitting")
      setFormError(null)

      // Validate form
      if (!name || !phone || !eventType || !eventDate || !location) {
        setFormError("Mohon lengkapi semua field yang wajib diisi")
        setFormStatus("error")
        return
      }

      // Get client to update
      const clientToUpdate = clients.find((c) => c.id === clientId)
      if (!clientToUpdate) {
        setFormError("Klien tidak ditemukan")
        setFormStatus("error")
        return
      }

      // Update client
      const updatedClient = {
        ...clientToUpdate,
        name,
        phone,
        email,
        address,
        eventType,
        eventDate: eventDate?.toISOString() || new Date().toISOString(),
        location,
        budget: budget ? Number(budget) : undefined,
        status,
        notes,
        referenceSource,
        services: selectedServices,
        palette,
        attirePhotos,
        moodboards,
        updatedAt: new Date().toISOString(),
      }

      await updateClient(updatedClient)

      setFormStatus("success")
      toast({
        title: "Klien berhasil diperbarui",
        description: `Data klien ${name} telah diperbarui`,
      })

      // Redirect to client detail page
      setTimeout(() => {
        router.push(`/klien/${clientId}`)
      }, 1500)
    } catch (error) {
      console.error("Error updating client:", error)
      setFormError(error instanceof Error ? error.message : "Terjadi kesalahan saat memperbarui klien")
      setFormStatus("error")
    }
  }

  // Handle client deletion
  const handleDelete = async () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus klien ini? Tindakan ini tidak dapat dibatalkan.")) {
      try {
        await deleteClient(clientId)
        toast({
          title: "Klien berhasil dihapus",
          description: `Data klien ${name} telah dihapus`,
        })
        router.push("/klien")
      } catch (error) {
        console.error("Error deleting client:", error)
        toast({
          title: "Gagal menghapus klien",
          description: error instanceof Error ? error.message : "Terjadi kesalahan saat menghapus klien",
          variant: "destructive",
        })
      }
    }
  }

  // Loading state
  if (loading) {
    return <DataLoading title="Memuat Data Klien" />
  }

  // Error state
  if (error || !clients) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-red-600">Terjadi Kesalahan</h2>
          <p className="text-muted-foreground">{error?.message || "Klien tidak ditemukan"}</p>
          <Button onClick={() => router.push("/klien")} className="bg-pink-600 hover:bg-pink-700">
            Kembali ke Daftar Klien
          </Button>
        </div>
      </div>
    )
  }

  // Client not found
  const client = clients.find((c) => c.id === clientId)
  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-red-600">Klien Tidak Ditemukan</h2>
          <p className="text-muted-foreground">Data klien dengan ID {clientId} tidak ditemukan</p>
          <Button onClick={() => router.push("/klien")} className="bg-pink-600 hover:bg-pink-700">
            Kembali ke Daftar Klien
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
        <h2 className="text-2xl font-semibold">Edit Klien: {name}</h2>
        <div className="ml-auto">
          <Button variant="destructive" onClick={handleDelete}>
            <Trash className="h-4 w-4 mr-2" />
            Hapus Klien
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle>Informasi Klien</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Klien<span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-pink-200"
                  placeholder="Masukkan nama klien"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon<span className="text-red-500">*</span></Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border-pink-200"
                  placeholder="Masukkan nomor telepon"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-pink-200"
                  placeholder="Masukkan email (opsional)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="border-pink-200"
                  placeholder="Masukkan alamat (opsional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referenceSource">Sumber Referensi</Label>
                <Select value={referenceSource} onValueChange={setReferenceSource}>
                  <SelectTrigger id="referenceSource" className="border-pink-200">
                    <SelectValue placeholder="Pilih sumber referensi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Google">Google</SelectItem>
                    <SelectItem value="Friend">Teman/Keluarga</SelectItem>
                    <SelectItem value="Vendor">Vendor Partner</SelectItem>
                    <SelectItem value="Other">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle>Detail Acara</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="eventType">Jenis Acara<span className="text-red-500">*</span></Label>
                <Select value={eventType} onValueChange={setEventType} required>
                  <SelectTrigger id="eventType" className="border-pink-200">
                    <SelectValue placeholder="Pilih jenis acara" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pernikahan">Pernikahan</SelectItem>
                    <SelectItem value="Prewedding">Prewedding</SelectItem>
                    <SelectItem value="Engagement">Engagement</SelectItem>
                    <SelectItem value="Lamaran">Lamaran</SelectItem>
                    <SelectItem value="Siraman">Siraman</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="eventDate">Tanggal Acara<span className="text-red-500">*</span></Label>
                <DatePicker
                  id="eventDate"
                  selectedDate={eventDate}
                  onSelect={setEventDate}
                  className="border-pink-200"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Lokasi Acara<span className="text-red-500">*</span></Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="border-pink-200"
                  placeholder="Masukkan lokasi acara"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="budget">Budget (Rp)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="border-pink-200"
                  placeholder="Masukkan budget (opsional)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status Klien</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status" className="border-pink-200">
                    <SelectValue placeholder="Pilih status klien" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="booked">Booked</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 border-pink-100">
          <CardHeader>
            <CardTitle>Layanan yang Dibutuhkan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {availableServices.map((service) => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox
                    id={`service-${service}`}
                    checked={selectedServices.includes(service)}
                    onCheckedChange={(checked) => handleServiceChange(service, !!checked)}
                  />
                  <Label
                    htmlFor={`service-${service}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {service}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 border-pink-100">
          <CardHeader>
            <CardTitle>Catatan</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border-pink-200 min-h-[150px]"
              placeholder="Tambahkan catatan tentang preferensi klien, kebutuhan khusus, atau informasi penting lainnya..."
            />
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-between">
          <Button
            type="button"
            variant="outline"
            className="border-pink-200"
            onClick={() => router.back()}
          >
            Batal
          </Button>
          <Button
            type="submit"
            className="bg-pink-600 hover:bg-pink-700"
            disabled={formStatus === "submitting"}
          >
            {formStatus === "submitting" ? "Menyimpan..." : (
              <>
                <Save className="h-4 w-4 mr-2" /> Simpan Perubahan
              </>
            )}
          </Button>
        </div>

        {formStatus === "error" && formError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{formError}</p>
          </div>
        )}

        <FormStatus
          status={formStatus}
          message={formStatus === "success" ? "Data klien berhasil diperbarui!" : formError || ""}
          onReset={() => setFormStatus("idle")}
        />
      </form>
    </div>
  )
} 