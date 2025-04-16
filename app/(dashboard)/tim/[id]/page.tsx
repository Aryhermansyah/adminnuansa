"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Edit, Phone, MapPin, Calendar, Save, X, Trash2, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Sample team member data
const teamMemberData = {
  id: 1,
  name: "Rina",
  role: "MUA",
  phone: "081234567890",
  email: "rina@example.com",
  address: "Jl. Kemang Raya No. 10, Jakarta Selatan",
  status: "Tetap",
  avatar: "/placeholder.svg?height=40&width=40",
  joinDate: "15 Januari 2022",
  skills: ["Makeup Natural", "Makeup Bold", "Hairdo"],
  notes: "Spesialis makeup natural dan hairdo untuk pernikahan.",
  events: [
    {
      id: 1,
      clientName: "Anisa & Budi",
      date: "15 Juni 2024",
      time: "08:00 - 14:00",
      location: "Hotel Grand Mercure, Jakarta",
      status: "Upcoming",
    },
    {
      id: 2,
      clientName: "Citra & Dani",
      date: "12 Juni 2024",
      time: "09:00 - 15:00",
      location: "Balai Kartini, Jakarta",
      status: "Upcoming",
    },
    {
      id: 3,
      clientName: "Hana & Irfan",
      date: "12 Mei 2024",
      time: "07:00 - 11:00",
      location: "Kebun Raya Bogor",
      status: "Completed",
    },
  ],
  bankAccount: {
    bank: "BCA",
    accountNumber: "1234567890",
    accountName: "Rina",
  },
}

// Konfigurasi dynamic rendering
export const dynamic = "force-dynamic"

// Client component tidak bisa async karena menggunakan hooks
export default function TeamMemberDetailPage(props) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [member, setMember] = useState(teamMemberData)
  const [editedMember, setEditedMember] = useState(teamMemberData)
  const [activeTab, setActiveTab] = useState("info")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Simulate fetching team member data
  useEffect(() => {
    // In a real app, you would fetch team member data based on props.params.id
    console.log("Fetching team member with ID:", props.params.id)
  }, [props.params.id])

  const handleInputChange = (field: string, value: any) => {
    setEditedMember((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    // In a real app, you would save the changes to the API
    setMember(editedMember)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedMember(member)
    setIsEditing(false)
  }

  const handleDelete = () => {
    // In a real app, you would delete the team member from the database
    console.log(`Deleting team member with ID: ${props.params.id}`)
    router.push("/tim")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback className="bg-pink-200 text-pink-700">{member.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-pink-900">{member.name}</h1>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-pink-200 text-pink-800">
                  {member.role}
                </Badge>
                <Badge
                  className={
                    member.status === "Tetap"
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                  }
                >
                  {member.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        {!isEditing ? (
          <div className="flex gap-2">
            <Button onClick={() => setIsEditing(true)} className="bg-pink-600 hover:bg-pink-700">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </Button>
          </div>
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
            Informasi Pribadi
          </TabsTrigger>
          <TabsTrigger value="events" className="data-[state=active]:bg-white">
            Jadwal Event
          </TabsTrigger>
          <TabsTrigger value="payment" className="data-[state=active]:bg-white">
            Pembayaran
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isEditing ? (
              <>
                <Card className="border-pink-100">
                  <CardHeader>
                    <CardTitle>Informasi Pribadi</CardTitle>
                    <CardDescription>Detail informasi dasar anggota tim</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama</Label>
                      <Input
                        id="name"
                        value={editedMember.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="border-pink-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Posisi</Label>
                      <Select value={editedMember.role} onValueChange={(value) => handleInputChange("role", value)}>
                        <SelectTrigger id="role" className="border-pink-200">
                          <SelectValue placeholder="Pilih posisi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MUA">MUA</SelectItem>
                          <SelectItem value="Asisten MUA">Asisten MUA</SelectItem>
                          <SelectItem value="Dekorasi">Dekorasi</SelectItem>
                          <SelectItem value="Asisten Dekorasi">Asisten Dekorasi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={editedMember.status} onValueChange={(value) => handleInputChange("status", value)}>
                        <SelectTrigger id="status" className="border-pink-200">
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tetap">Tetap</SelectItem>
                          <SelectItem value="Freelance">Freelance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Nomor Telepon</Label>
                      <Input
                        id="phone"
                        value={editedMember.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="border-pink-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editedMember.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="border-pink-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Alamat</Label>
                      <Textarea
                        id="address"
                        value={editedMember.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        className="border-pink-200"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-pink-100">
                  <CardHeader>
                    <CardTitle>Keahlian & Catatan</CardTitle>
                    <CardDescription>Detail keahlian dan catatan tambahan</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="skills">Keahlian (pisahkan dengan koma)</Label>
                      <Textarea
                        id="skills"
                        value={editedMember.skills.join(", ")}
                        onChange={(e) => handleInputChange("skills", e.target.value.split(", "))}
                        className="border-pink-200"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="joinDate">Tanggal Bergabung</Label>
                      <Input
                        id="joinDate"
                        value={editedMember.joinDate}
                        onChange={(e) => handleInputChange("joinDate", e.target.value)}
                        className="border-pink-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Catatan</Label>
                      <Textarea
                        id="notes"
                        value={editedMember.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        className="border-pink-200"
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card className="border-pink-100">
                  <CardHeader>
                    <CardTitle>Informasi Pribadi</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-y-4">
                      <div className="flex items-start">
                        <Phone className="h-5 w-5 mr-3 text-pink-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Nomor Telepon</p>
                          <p className="text-sm text-muted-foreground">{member.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 mr-3 text-pink-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Alamat</p>
                          <p className="text-sm text-muted-foreground">{member.address}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 mr-3 text-pink-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Tanggal Bergabung</p>
                          <p className="text-sm text-muted-foreground">{member.joinDate}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-pink-100">
                  <CardHeader>
                    <CardTitle>Keahlian & Catatan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="pt-2">
                      <p className="font-medium mb-2">Keahlian</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {member.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="border-pink-200 text-pink-800">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <p className="font-medium mb-2">Catatan</p>
                      <p className="text-sm text-muted-foreground">{member.notes}</p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle>Jadwal Event</CardTitle>
              <CardDescription>Daftar event yang ditangani</CardDescription>
            </CardHeader>
            <CardContent>
              {member.events.length > 0 ? (
                <div className="space-y-4">
                  {member.events.map((event) => (
                    <div key={event.id} className="flex items-start space-x-3 rounded-md border border-pink-100 p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100">
                        <Calendar className="h-4 w-4 text-pink-600" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">{event.clientName}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-1 h-3.5 w-3.5" />
                          <span className="ml-1">{event.date}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-3.5 w-3.5" />
                          <span className="ml-1">{event.time}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="mr-1 h-3.5 w-3.5" />
                          <span className="ml-1">{event.location}</span>
                        </div>
                        <Badge
                          className={
                            event.status === "Completed"
                              ? "bg-gray-100 text-gray-800 hover:bg-gray-100 mt-1"
                              : "bg-green-100 text-green-800 hover:bg-green-100 mt-1"
                          }
                        >
                          {event.status === "Completed" ? "Selesai" : "Akan Datang"}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm" className="border-pink-200" asChild>
                        <a href={`/jadwal/${event.id}`}>Detail</a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Belum ada event yang ditangani</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle>Informasi Pembayaran</CardTitle>
              <CardDescription>Detail rekening bank untuk pembayaran</CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank">Bank</Label>
                    <Select
                      value={editedMember.bankAccount.bank}
                      onValueChange={(value) =>
                        setEditedMember({
                          ...editedMember,
                          bankAccount: { ...editedMember.bankAccount, bank: value },
                        })
                      }
                    >
                      <SelectTrigger id="bank" className="border-pink-200">
                        <SelectValue placeholder="Pilih bank" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BCA">BCA</SelectItem>
                        <SelectItem value="BNI">BNI</SelectItem>
                        <SelectItem value="BRI">BRI</SelectItem>
                        <SelectItem value="Mandiri">Mandiri</SelectItem>
                        <SelectItem value="CIMB Niaga">CIMB Niaga</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Nomor Rekening</Label>
                    <Input
                      id="accountNumber"
                      value={editedMember.bankAccount.accountNumber}
                      onChange={(e) =>
                        setEditedMember({
                          ...editedMember,
                          bankAccount: { ...editedMember.bankAccount, accountNumber: e.target.value },
                        })
                      }
                      className="border-pink-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountName">Nama Pemilik Rekening</Label>
                    <Input
                      id="accountName"
                      value={editedMember.bankAccount.accountName}
                      onChange={(e) =>
                        setEditedMember({
                          ...editedMember,
                          bankAccount: { ...editedMember.bankAccount, accountName: e.target.value },
                        })
                      }
                      className="border-pink-200"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 border border-pink-100 rounded-lg bg-pink-50/50">
                    <p className="font-medium">Informasi Rekening Bank</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm">
                        <span className="text-muted-foreground">Bank:</span> {member.bankAccount.bank}
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Nomor Rekening:</span>{" "}
                        {member.bankAccount.accountNumber}
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Atas Nama:</span> {member.bankAccount.accountName}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Anggota Tim</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus anggota tim ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
