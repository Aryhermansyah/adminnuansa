"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, ChevronLeft, Upload, Plus } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FormStatus } from "@/components/form-status"
import { useData } from "@/contexts/data-context"
import { DBInitStatus } from "@/components/db-init-status"

export default function TambahKlienPage() {
  const router = useRouter()
  const { addClient, addEvent, clients } = useData()
  const [date, setDate] = useState<Date>(new Date()) // Default to today
  const [time, setTime] = useState("10:00") // Default time
  const [activeTab, setActiveTab] = useState("info")
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState("")

  const [formData, setFormData] = useState({
    clientName: "",
    phone: "",
    email: "",
    address: "",
    eventType: "",
    location: "",
    notes: "",
    services: [] as string[],
    budget: "",
    referenceSource: "",
  })
  const [attirePhotos, setAttirePhotos] = useState<string[]>([])
  const [moodboards, setMoodboards] = useState<string[]>([])
  const [colorPalette, setColorPalette] = useState<string[]>(["#F8E2E4", "#C9E6DF", "#F9F9EB", "#D0F0FF"])

  useEffect(() => {
    console.log("DataContext loaded:", { addClient, clients })
  }, [addClient, clients])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleServiceToggle = (service: string) => {
    setFormData((prev) => {
      const services = [...prev.services]
      if (services.includes(service)) {
        return { ...prev, services: services.filter((s) => s !== service) }
      } else {
        return { ...prev, services: [...services, service] }
      }
    })
  }

  const handleAddAttirePhoto = () => {
    // Simulasi penambahan foto
    setAttirePhotos([...attirePhotos, "/placeholder.svg?height=200&width=200"])
  }

  const handleAddMoodboard = () => {
    // Simulasi penambahan moodboard
    setMoodboards([...moodboards, "/placeholder.svg?height=200&width=200"])
  }

  const handleAddColor = () => {
    // Tambahkan warna default baru
    setColorPalette([...colorPalette, "#FFFFFF"])
  }

  const handleColorChange = (index: number, color: string) => {
    const newPalette = [...colorPalette]
    newPalette[index] = color
    setColorPalette(newPalette)
  }

  const handleRemoveColor = (index: number) => {
    setColorPalette(colorPalette.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.clientName || !formData.phone || !formData.eventType || !date) {
      setFormStatus("error")
      setStatusMessage("Mohon lengkapi data yang diperlukan")
      return
    }

    try {
      setFormStatus("loading")
      setStatusMessage("Menyimpan data klien dan jadwal acara...")

      // Prepare client data with all required fields
      const clientData = {
        name: formData.clientName,
        phone: formData.phone,
        email: formData.email || "",
        address: formData.address || "",
        eventType: formData.eventType,
        eventDate: date.toISOString(),
        location: formData.location || "",
        services: formData.services.length > 0 ? formData.services : ["Umum"],
        status: "Aktif",
        notes: formData.notes || "",
        palette: colorPalette,
        attirePhotos: attirePhotos,
        moodboards: moodboards,
        budget: formData.budget || "0",
        referenceSource: formData.referenceSource || "Lainnya",
      }

      console.log("Saving client data:", clientData)

      // Save to database
      const clientId = await addClient(clientData)
      console.log("Client saved with ID:", clientId)

      // Tambahkan otomatis ke jadwal (events)
      const eventData = {
        clientId: clientId,
        clientName: formData.clientName,
        eventDate: date.toISOString(),
        time: time,
        location: formData.location || "",
        type: formData.eventType,
        services: formData.services.length > 0 ? formData.services : ["Umum"],
        status: "pending" as "pending" | "confirmed" | "completed" | "cancelled",
        notes: formData.notes || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Simpan jadwal acara
      const eventId = await addEvent(eventData)
      console.log("Event automatically scheduled with ID:", eventId)

      setFormStatus("success")
      setStatusMessage("Data klien dan jadwal acara berhasil disimpan!")

      // Redirect after successful save
      setTimeout(() => {
        router.push("/klien")
      }, 1500)
    } catch (error) {
      console.error("Error saving client:", error)
      setFormStatus("error")
      setStatusMessage("Terjadi kesalahan saat menyimpan data. Silakan coba lagi.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-pink-900">Tambah Klien Baru</h1>
          <p className="text-muted-foreground">Isi informasi klien dan detail acara</p>
        </div>
      </div>

      <DBInitStatus />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-pink-100/50">
          <TabsTrigger value="info" className="data-[state=active]:bg-white">
            Informasi Dasar
          </TabsTrigger>
          <TabsTrigger value="design" className="data-[state=active]:bg-white">
            Desain & Referensi
          </TabsTrigger>
          <TabsTrigger value="budget" className="data-[state=active]:bg-white">
            Anggaran & Catatan
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="info" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-pink-100">
                <CardHeader>
                  <CardTitle>Informasi Klien</CardTitle>
                  <CardDescription>Masukkan informasi dasar klien</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Nama Klien (Pasangan)</Label>
                    <Input
                      id="clientName"
                      placeholder="contoh: Anisa & Budi"
                      className="border-pink-200"
                      value={formData.clientName}
                      onChange={(e) => handleInputChange("clientName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone_v2">Nomor WhatsApp</Label>
                    <div className="flex">
                      <div className="flex items-center justify-center px-3 border border-r-0 rounded-l-md border-pink-200 bg-gray-50 text-sm text-gray-500">
                        +62
                      </div>
                      <Input
                        id="phone_v2"
                        placeholder="8123456789 (tanpa angka 0 di depan)"
                        className="border-pink-200 rounded-l-none"
                        value={formData.phone}
                        onChange={(e) => {
                          // Hapus non-digit dan 0 di depan jika ada
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.startsWith('0')) {
                            value = value.substring(1);
                          }
                          handleInputChange("phone", value);
                        }}
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="text-green-500">✓</span> 
                      Format: +62 diikuti nomor tanpa angka 0 di depan (contoh: 812xxxx bukan 0812xxxx)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (opsional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contoh: email@example.com"
                      className="border-pink-200"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Alamat</Label>
                    <Textarea
                      id="address"
                      placeholder="Alamat lengkap klien"
                      className="border-pink-200 resize-none"
                      rows={3}
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="referenceSource">Sumber Referensi</Label>
                    <Select
                      value={formData.referenceSource}
                      onValueChange={(value) => handleInputChange("referenceSource", value)}
                    >
                      <SelectTrigger id="referenceSource" className="border-pink-200">
                        <SelectValue placeholder="Darimana mengetahui kami?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="friend">Teman/Keluarga</SelectItem>
                        <SelectItem value="google">Google</SelectItem>
                        <SelectItem value="other">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-pink-100">
                <CardHeader>
                  <CardTitle>Detail Acara</CardTitle>
                  <CardDescription>Masukkan informasi acara</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventType">Jenis Acara</Label>
                    <Select value={formData.eventType} onValueChange={(value) => handleInputChange("eventType", value)}>
                      <SelectTrigger id="eventType" className="border-pink-200">
                        <SelectValue placeholder="Pilih jenis acara" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pernikahan">Pernikahan</SelectItem>
                        <SelectItem value="Lamaran">Lamaran</SelectItem>
                        <SelectItem value="Prewedding">Prewedding</SelectItem>
                        <SelectItem value="Engagement">Engagement</SelectItem>
                        <SelectItem value="Siraman">Siraman</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Tanggal Acara</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full text-left font-normal border-pink-200",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? (
                            format(date, "PPP", { locale: id })
                          ) : (
                            <span>Pilih tanggal acara</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(newDate) => newDate && setDate(newDate)}
                          disabled={(date) => date < new Date("1900-01-01")}
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
                      className="border-pink-200"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Lokasi Acara</Label>
                    <Input
                      id="location"
                      placeholder="Masukkan lokasi acara"
                      className="border-pink-200"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Layanan</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="makeup"
                          checked={formData.services.includes("Makeup")}
                          onCheckedChange={() => handleServiceToggle("Makeup")}
                        />
                        <label
                          htmlFor="makeup"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Makeup
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="dekorasi"
                          checked={formData.services.includes("Dekorasi")}
                          onCheckedChange={() => handleServiceToggle("Dekorasi")}
                        />
                        <label
                          htmlFor="dekorasi"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Dekorasi
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="busana"
                          checked={formData.services.includes("Busana")}
                          onCheckedChange={() => handleServiceToggle("Busana")}
                        />
                        <label
                          htmlFor="busana"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Busana
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="fotografi"
                          checked={formData.services.includes("Fotografi")}
                          onCheckedChange={() => handleServiceToggle("Fotografi")}
                        />
                        <label
                          htmlFor="fotografi"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Fotografi
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between items-center">
              <Button type="button" variant="outline" onClick={() => router.back()} className="border-pink-200">
                Batal
              </Button>
              <div className="flex items-center gap-4">
                <Button type="button" variant="outline" onClick={() => setActiveTab("design")} className="border-pink-200">
                  Selanjutnya
                </Button>
                <Button type="submit" className="bg-pink-600 hover:bg-pink-700">
                  Simpan
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="design" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-pink-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Foto Busana</CardTitle>
                    <CardDescription>Referensi busana untuk acara</CardDescription>
                  </div>
                  <Button size="sm" className="bg-pink-600 hover:bg-pink-700" onClick={handleAddAttirePhoto}>
                    <Plus className="h-4 w-4 mr-1" /> Tambah
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {attirePhotos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square overflow-hidden rounded-md border border-pink-100 bg-pink-50/50 flex items-center justify-center">
                          <img
                            src={photo || "/placeholder.svg"}
                            alt={`Busana ${index + 1}`}
                            className="object-cover h-full w-full"
                          />
                        </div>
                      </div>
                    ))}
                    {attirePhotos.length === 0 && (
                      <div className="col-span-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-pink-200 rounded-md bg-pink-50/30">
                        <Upload className="h-10 w-10 text-pink-300 mb-2" />
                        <p className="text-sm text-pink-600 font-medium">Klik tombol tambah untuk mengunggah foto</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG atau JPEG hingga 5MB</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-pink-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Mood Board Dekorasi</CardTitle>
                    <CardDescription>Referensi dekorasi untuk acara</CardDescription>
                  </div>
                  <Button size="sm" className="bg-pink-600 hover:bg-pink-700" onClick={handleAddMoodboard}>
                    <Plus className="h-4 w-4 mr-1" /> Tambah
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {moodboards.map((photo, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square overflow-hidden rounded-md border border-pink-100 bg-pink-50/50 flex items-center justify-center">
                          <img
                            src={photo || "/placeholder.svg"}
                            alt={`Mood Board ${index + 1}`}
                            className="object-cover h-full w-full"
                          />
                        </div>
                      </div>
                    ))}
                    {moodboards.length === 0 && (
                      <div className="col-span-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-pink-200 rounded-md bg-pink-50/30">
                        <Upload className="h-10 w-10 text-pink-300 mb-2" />
                        <p className="text-sm text-pink-600 font-medium">Klik tombol tambah untuk mengunggah foto</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG atau JPEG hingga 5MB</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-pink-100 md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Palette Warna</CardTitle>
                    <CardDescription>Pilihan warna untuk tema acara</CardDescription>
                  </div>
                  <Button size="sm" className="bg-pink-600 hover:bg-pink-700" onClick={handleAddColor}>
                    <Plus className="h-4 w-4 mr-1" /> Tambah
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {colorPalette.map((color, index) => (
                      <div key={index} className="relative group">
                        <div
                          className="h-12 w-12 rounded-md border border-gray-200 cursor-pointer"
                          style={{ backgroundColor: color }}
                        >
                          <input
                            type="color"
                            value={color}
                            onChange={(e) => handleColorChange(index, e.target.value)}
                            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                          />
                        </div>
                        {colorPalette.length > 1 && (
                          <button
                            type="button"
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveColor(index)}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" className="border-pink-200" onClick={() => setActiveTab("info")}>
                Kembali
              </Button>
              <Button type="button" className="bg-pink-600 hover:bg-pink-700" onClick={() => setActiveTab("budget")}>
                Selanjutnya
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="budget" className="space-y-4">
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle>Anggaran & Preferensi</CardTitle>
                <CardDescription>Informasi anggaran dan preferensi klien</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Anggaran (Rp)</Label>
                  <Input
                    id="budget"
                    placeholder="contoh: 50000000"
                    className="border-pink-200"
                    value={formData.budget}
                    onChange={(e) => handleInputChange("budget", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Masukkan perkiraan anggaran klien untuk seluruh acara</p>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan & Preferensi Khusus</Label>
                  <Textarea
                    id="notes"
                    placeholder="Masukkan catatan khusus atau preferensi klien"
                    className="border-pink-200 resize-none min-h-[150px]"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                  />
                </div>

                <div className="pt-4">
                  <h3 className="text-sm font-medium mb-2">Layanan yang Dipilih:</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.services.length > 0 ? (
                      formData.services.map((service, index) => (
                        <Badge key={index} variant="outline" className="border-pink-200 text-pink-800">
                          {service}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Belum ada layanan yang dipilih</p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-pink-200"
                  onClick={() => setActiveTab("design")}
                >
                  Kembali
                </Button>
                <Button type="submit" className="bg-pink-600 hover:bg-pink-700" disabled={formStatus === "loading"}>
                  {formStatus === "loading" ? "Menyimpan..." : "Simpan Klien"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </form>
      </Tabs>

      <FormStatus status={formStatus} message={statusMessage} onReset={() => setFormStatus("idle")} />
    </div>
  )
}
