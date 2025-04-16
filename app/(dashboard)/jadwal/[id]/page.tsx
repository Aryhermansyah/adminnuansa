"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  Calendar,
  MapPin,
  Edit,
  Trash2,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  Save,
  X,
  Plus,
  MessageSquare,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useData } from "@/contexts/data-context"

// Konfigurasi dynamic rendering
export const dynamic = "force-dynamic"

// Dummy event data (would come from API in real app)
const eventData = {
  id: 1,
  clientName: "Anisa & Budi",
  date: "15 Juni 2024",
  time: "08:00 - 14:00",
  location: "Hotel Grand Mercure, Jakarta",
  type: "Pernikahan",
  services: ["Makeup", "Dekorasi"],
  status: "Confirmed",
  team: [
    { id: 1, name: "Rina", role: "MUA", status: "Confirmed" },
    { id: 2, name: "Dani", role: "Asisten MUA", status: "Confirmed" },
    { id: 3, name: "Tono", role: "Dekorasi", status: "Confirmed" },
    { id: 4, name: "Bima", role: "Asisten Dekorasi", status: "Confirmed" },
  ],
  tasks: [
    { id: 1, title: "Setup dekorasi", assignedTo: "Tono", time: "06:00 - 08:00", completed: false },
    { id: 2, title: "Makeup pengantin", assignedTo: "Rina", time: "08:00 - 10:00", completed: false },
    { id: 3, title: "Makeup keluarga", assignedTo: "Dani", time: "08:00 - 10:00", completed: false },
    { id: 4, title: "Touch-up makeup", assignedTo: "Rina", time: "11:00 - 12:00", completed: false },
  ],
  notes: "Klien menginginkan tema garden party dengan warna pastel. Makeup natural.",
  contactPerson: "Anisa",
  contactPhone: "081234567890",
}

// Available team members for assignment
const availableTeamMembers = [
  { id: 5, name: "Sinta", role: "MUA", status: "Available" },
  { id: 6, name: "Lia", role: "Asisten MUA", status: "Available" },
  { id: 7, name: "Agus", role: "Dekorasi", status: "Available" },
  { id: 8, name: "Rudi", role: "Asisten Dekorasi", status: "Available" },
]

export default function EventDetailPage() {
  const router = useRouter()
  const [eventId, setEventId] = useState<string>("")
  const [event, setEvent] = useState(eventData)
  const [isEditing, setIsEditing] = useState(false)
  const [editedEvent, setEditedEvent] = useState(eventData)
  const [activeTab, setActiveTab] = useState("info")
  const [showAddTeamMember, setShowAddTeamMember] = useState(false)
  const [selectedMember, setSelectedMember] = useState("")

  // Get the event ID from the URL
  useEffect(() => {
    const pathSegments = window.location.pathname.split('/')
    const id = pathSegments[pathSegments.length - 1]
    setEventId(id)
    console.log("Fetching event with ID:", id)
  }, [])

  const handleInputChange = (field: string, value: any) => {
    setEditedEvent((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    // In a real app, you would save the changes to the API
    setEvent(editedEvent)
    setIsEditing(false)
    setShowAddTeamMember(false)
  }

  const handleCancel = () => {
    setEditedEvent(event)
    setIsEditing(false)
    setShowAddTeamMember(false)
  }

  const handleAddTeamMember = () => {
    if (selectedMember) {
      const memberToAdd = availableTeamMembers.find((m) => m.id.toString() === selectedMember)
      if (memberToAdd) {
        setEditedEvent((prev) => ({
          ...prev,
          team: [...prev.team, { ...memberToAdd, status: "Pending" }],
        }))
        setSelectedMember("")
        setShowAddTeamMember(false)
      }
    }
  }

  const handleRemoveTeamMember = (id: number) => {
    setEditedEvent((prev) => ({
      ...prev,
      team: prev.team.filter((member) => member.id !== id),
    }))
  }

  const handleToggleTaskCompletion = (taskId: number) => {
    setEditedEvent((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)),
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-pink-900">{event.clientName}</h1>
            <p className="text-muted-foreground">
              {event.type} • {event.date}
            </p>
          </div>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="bg-pink-600 hover:bg-pink-700">
            <Edit className="mr-2 h-4 w-4" />
            Edit Jadwal
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} className="border-pink-200">
              <X className="mr-2 h-4 w-4" />
              Batal
            </Button>
            <Button onClick={handleSave} className="bg-pink-600 hover:bg-pink-700">
              <Save className="mr-2 h-4 w-4" />
              Simpan
            </Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-pink-100/50">
          <TabsTrigger value="info" className="data-[state=active]:bg-white">
            Informasi Acara
          </TabsTrigger>
          <TabsTrigger value="team" className="data-[state=active]:bg-white">
            Tim & Tugas
          </TabsTrigger>
          <TabsTrigger value="notes" className="data-[state=active]:bg-white">
            Catatan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          {isEditing ? (
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle>Edit Informasi Acara</CardTitle>
                <CardDescription>Ubah detail acara</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Nama Klien</Label>
                  <Input
                    id="clientName"
                    value={editedEvent.clientName}
                    onChange={(e) => handleInputChange("clientName", e.target.value)}
                    className="border-pink-200"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Tanggal</Label>
                    <Input
                      id="date"
                      value={editedEvent.date}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                      className="border-pink-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Waktu</Label>
                    <Input
                      id="time"
                      value={editedEvent.time}
                      onChange={(e) => handleInputChange("time", e.target.value)}
                      className="border-pink-200"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Lokasi</Label>
                  <Input
                    id="location"
                    value={editedEvent.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="border-pink-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Jenis Acara</Label>
                  <Select value={editedEvent.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger id="type" className="border-pink-200">
                      <SelectValue placeholder="Pilih jenis acara" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pernikahan">Pernikahan</SelectItem>
                      <SelectItem value="Prewedding">Prewedding</SelectItem>
                      <SelectItem value="Engagement">Lamaran</SelectItem>
                      <SelectItem value="Other">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Layanan</Label>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="makeup"
                        checked={editedEvent.services.includes("Makeup")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleInputChange("services", [...editedEvent.services, "Makeup"])
                          } else {
                            handleInputChange(
                              "services",
                              editedEvent.services.filter((s) => s !== "Makeup"),
                            )
                          }
                        }}
                      />
                      <Label htmlFor="makeup" className="font-normal">
                        Makeup
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="decoration"
                        checked={editedEvent.services.includes("Dekorasi")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleInputChange("services", [...editedEvent.services, "Dekorasi"])
                          } else {
                            handleInputChange(
                              "services",
                              editedEvent.services.filter((s) => s !== "Dekorasi"),
                            )
                          }
                        }}
                      />
                      <Label htmlFor="decoration" className="font-normal">
                        Dekorasi
                      </Label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={editedEvent.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger id="status" className="border-pink-200">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Confirmed">Confirmed</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Canceled">Canceled</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input
                      id="contactPerson"
                      value={editedEvent.contactPerson}
                      onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                      className="border-pink-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Nomor Telepon</Label>
                    <Input
                      id="contactPhone"
                      value={editedEvent.contactPhone}
                      onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                      className="border-pink-200"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle>Informasi Acara</CardTitle>
                <CardDescription>Detail lengkap acara</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 mr-3 text-pink-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Tanggal & Waktu</p>
                        <p className="text-sm text-muted-foreground">
                          {event.date}, {event.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-3 text-pink-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Lokasi</p>
                        <p className="text-sm text-muted-foreground">{event.location}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <User className="h-5 w-5 mr-3 text-pink-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Jenis Acara</p>
                        <p className="text-sm text-muted-foreground">{event.type}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex mt-0.5 mr-3">
                        <span className="h-5 w-5 flex items-center justify-center bg-pink-600 text-white text-xs rounded-full">
                          S
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">Status</p>
                        <Badge className="mt-1 bg-green-100 text-green-800 hover:bg-green-100">{event.status}</Badge>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex mt-0.5 mr-3">
                        <span className="h-5 w-5 flex items-center justify-center bg-pink-600 text-white text-xs rounded-full">
                          L
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">Layanan</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {event.services.map((service, index) => (
                            <Badge key={index} variant="outline" className="border-pink-200 text-pink-800">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 mr-3 text-pink-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Kontak</p>
                        <p className="text-sm text-muted-foreground">
                          {event.contactPerson}: {event.contactPhone}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" className="border-pink-200">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Hubungi Client
                  </Button>
                  <Button variant="outline" className="border-pink-200">
                    <User className="mr-2 h-4 w-4" />
                    Lihat Data Klien
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card className="border-pink-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Tim yang Ditugaskan</CardTitle>
                <CardDescription>Daftar personel yang bertugas pada acara ini</CardDescription>
              </div>
              {isEditing && !showAddTeamMember && (
                <Button onClick={() => setShowAddTeamMember(true)} className="bg-pink-600 hover:bg-pink-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Anggota
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {showAddTeamMember && (
                <div className="mb-6 p-4 border border-pink-100 rounded-lg bg-pink-50/50">
                  <h3 className="font-medium mb-3">Tambah Anggota Tim</h3>
                  <div className="space-y-4">
                    <Select value={selectedMember} onValueChange={setSelectedMember}>
                      <SelectTrigger className="border-pink-200">
                        <SelectValue placeholder="Pilih anggota tim" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTeamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id.toString()}>
                            {member.name} ({member.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowAddTeamMember(false)} className="border-pink-200">
                        Batal
                      </Button>
                      <Button onClick={handleAddTeamMember} className="bg-pink-600 hover:bg-pink-700">
                        Tambahkan
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {(isEditing ? editedEvent.team : event.team).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between border-b border-pink-100 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg?height=40&width=40" alt={member.name} />
                        <AvatarFallback className="bg-pink-200 text-pink-700">{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          member.status === "Confirmed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {member.status}
                      </Badge>
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTeamMember(member.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Daftar Tugas</CardTitle>
                <CardDescription>Tugas-tugas yang harus dilakukan tim pada acara ini</CardDescription>
              </div>
              {isEditing && (
                <Button className="bg-pink-600 hover:bg-pink-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Tugas
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(isEditing ? editedEvent.tasks : event.tasks).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start justify-between border-b border-pink-100 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start gap-3">
                      {isEditing ? (
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => handleToggleTaskCompletion(task.id)}
                          className="mt-1"
                        />
                      ) : task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      )}
                      <div>
                        <div className="flex items-center">
                          <p className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                            {task.title}
                          </p>
                          <Badge className="ml-2 text-xs" variant="outline">
                            {task.assignedTo}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{task.time}</p>
                      </div>
                    </div>
                    {isEditing && (
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-100">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle>Catatan Acara</CardTitle>
              <CardDescription>Catatan khusus untuk acara ini</CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editedEvent.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="min-h-[200px] border-pink-200"
                  placeholder="Tambahkan catatan untuk acara ini..."
                />
              ) : (
                <p className="text-sm text-muted-foreground">{event.notes}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
