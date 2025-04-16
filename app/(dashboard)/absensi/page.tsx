"use client"

import { useState } from "react"
import { CalendarIcon, Camera, Clock, Download, MapPin, Search, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// Data dummy absensi
const attendanceData = [
  {
    id: 1,
    name: "Rina",
    role: "MUA",
    date: "12 Juni 2024",
    checkIn: "07:30",
    checkOut: "16:45",
    location: "Kantor Pusat",
    status: "Hadir",
    photo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Sinta",
    role: "MUA",
    date: "12 Juni 2024",
    checkIn: "07:45",
    checkOut: "16:30",
    location: "Kantor Pusat",
    status: "Hadir",
    photo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Dani",
    role: "Asisten MUA",
    date: "12 Juni 2024",
    checkIn: "08:10",
    checkOut: "16:20",
    location: "Kantor Pusat",
    status: "Terlambat",
    photo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Tono",
    role: "Dekorasi",
    date: "12 Juni 2024",
    checkIn: "07:15",
    checkOut: "17:00",
    location: "Kantor Pusat",
    status: "Hadir",
    photo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "Agus",
    role: "Dekorasi",
    date: "12 Juni 2024",
    checkIn: "-",
    checkOut: "-",
    location: "-",
    status: "Tidak Hadir",
    photo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 6,
    name: "Bima",
    role: "Asisten Dekorasi",
    date: "12 Juni 2024",
    checkIn: "07:50",
    checkOut: "16:40",
    location: "Kantor Pusat",
    status: "Hadir",
    photo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 7,
    name: "Lia",
    role: "Asisten MUA",
    date: "12 Juni 2024",
    checkIn: "08:05",
    checkOut: "16:15",
    location: "Kantor Pusat",
    status: "Terlambat",
    photo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 8,
    name: "Rudi",
    role: "Asisten Dekorasi",
    date: "12 Juni 2024",
    checkIn: "07:40",
    checkOut: "16:50",
    location: "Kantor Pusat",
    status: "Hadir",
    photo: "/placeholder.svg?height=40&width=40",
  },
]

export default function AbsensiPage() {
  const [date, setDate] = useState<Date>()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterRole, setFilterRole] = useState("all")

  // Filter data absensi
  const filteredAttendance = attendanceData.filter((attendance) => {
    const matchesSearch = attendance.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || attendance.status === filterStatus
    const matchesRole = filterRole === "all" || attendance.role === filterRole

    return matchesSearch && matchesStatus && matchesRole
  })

  // Fungsi untuk mendapatkan warna badge berdasarkan status
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Hadir":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Terlambat":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "Tidak Hadir":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-pink-900">Absensi Pegawai</h1>
          <p className="text-muted-foreground">Kelola dan pantau kehadiran pegawai</p>
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("border-pink-200", !date && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? (
                  date.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                ) : (
                  <span>Pilih tanggal</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
          <Button variant="outline" className="border-pink-200">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList className="bg-pink-100/50">
          <TabsTrigger value="list" className="data-[state=active]:bg-white">
            Daftar Absensi
          </TabsTrigger>
          <TabsTrigger value="camera" className="data-[state=active]:bg-white">
            Ambil Absensi
          </TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari nama pegawai..."
                className="pl-8 border-pink-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="w-40">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="border-pink-200">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="Hadir">Hadir</SelectItem>
                    <SelectItem value="Terlambat">Terlambat</SelectItem>
                    <SelectItem value="Tidak Hadir">Tidak Hadir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-40">
                <Select value={filterRole} onValueChange={setFilterRole}>
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
          </div>

          <Card className="border-pink-100">
            <CardHeader className="px-6 py-4">
              <CardTitle className="text-lg">Rekap Absensi - 12 Juni 2024</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-w-full">
                <div className="min-w-[800px]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-pink-100 bg-pink-50/50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Pegawai
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Posisi
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Jam Masuk
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Jam Keluar
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Lokasi
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pink-100">
                      {filteredAttendance.map((attendance) => (
                        <tr key={attendance.id} className="hover:bg-pink-50/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <img
                                  className="h-8 w-8 rounded-full"
                                  src={attendance.photo || "/placeholder.svg"}
                                  alt=""
                                />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-pink-900">{attendance.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{attendance.role}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{attendance.checkIn}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{attendance.checkOut}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{attendance.location}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusBadgeColor(attendance.status)}>{attendance.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="camera" className="space-y-4">
          <Card className="border-pink-100">
            <CardHeader className="text-center">
              <CardTitle>Absensi Hari Ini</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
              <div className="relative w-64 h-64 border-2 border-dashed border-pink-200 rounded-lg flex items-center justify-center bg-pink-50/50">
                <Camera className="h-16 w-16 text-pink-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground text-center px-4">
                    Klik tombol di bawah untuk mengambil foto selfie
                  </p>
                </div>
              </div>

              <div className="space-y-4 w-full max-w-xs">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-pink-600" />
                    <span className="text-sm font-medium">Admin Glam</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-pink-600" />
                    <span className="text-sm">12 Juni 2024, 07:30</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-pink-600" />
                    <span className="text-sm">Kantor Pusat</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button className="bg-pink-600 hover:bg-pink-700">Absen Masuk</Button>
                  <Button variant="outline" className="border-pink-200">
                    Absen Pulang
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
