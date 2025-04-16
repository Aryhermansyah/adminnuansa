"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Calendar, Users, Shirt, UserPlus, Plus, ArrowRight, Clock, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RealTimeClock } from "@/components/real-time-clock"
import { useData } from "@/contexts/data-context"
import { DataLoading } from "@/components/data-loading"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const { clients, events, team, vendors, isLoading, refreshData } = useData()
  const [error, setError] = useState<Error | null>(null)
  const [dailyTasks, setDailyTasks] = useState<any[]>([])

  useEffect(() => {
    // Hanya refresh data saat komponen pertama kali mount
    refreshData(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // Generate daily tasks for admin
    const tasks = [
      {
        id: 1,
        title: "Konfirmasi vendor untuk acara Anisa & Budi",
        priority: "high",
        time: "09:00",
        completed: true,
        assignedTo: "Admin",
      },
      {
        id: 2,
        title: "Persiapan dekorasi untuk acara besok",
        priority: "high",
        time: "10:30",
        completed: false,
        assignedTo: "Tim Dekorasi",
      },
      {
        id: 3,
        title: "Meeting dengan calon klien baru",
        priority: "medium",
        time: "13:00",
        completed: false,
        assignedTo: "Admin",
      },
      {
        id: 4,
        title: "Fitting baju pengantin Dina & Eko",
        priority: "medium",
        time: "15:00",
        completed: false,
        assignedTo: "Tim MUA",
      },
      {
        id: 5,
        title: "Konfirmasi pembayaran dari klien Fira & Gilang",
        priority: "high",
        time: "16:30",
        completed: false,
        assignedTo: "Admin",
      },
      {
        id: 6,
        title: "Persiapan makeup untuk acara besok",
        priority: "medium",
        time: "17:00",
        completed: false,
        assignedTo: "Tim MUA",
      },
    ]

    setDailyTasks(tasks)
  }, [])

  const toggleTaskCompletion = (taskId: number) => {
    setDailyTasks(dailyTasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))
  }

  if (isLoading) {
    return <DataLoading loading={true} error={null} loadingText="Memuat Data Dashboard">
        Loading...
      </DataLoading>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-red-600">Terjadi Kesalahan</h2>
          <p className="text-muted-foreground">{error.message}</p>
          <Button onClick={() => refreshData()} className="bg-pink-600 hover:bg-pink-700">
            Coba Lagi
          </Button>
        </div>
      </div>
    )
  }

  // Hitung jumlah klien aktif
  const activeClients = clients.filter((client) => client.status === "Aktif").length

  // Hitung jumlah event hari ini
  const today = new Date().toISOString().split("T")[0]
  const todayEvents = events.filter((event) => {
    if (event.eventDate) {
      return event.eventDate.startsWith(today)
    }
    return false
  }).length

  // Hitung jumlah tim
  const teamCount = team.length

  // Hitung jumlah vendor
  const vendorCount = vendors.length

  // Dapatkan event mendatang (7 hari ke depan)
  const upcomingEvents = events
    .filter((event) => {
      if (!event.eventDate) return false
      
      const eventDate = new Date(event.eventDate)
      const now = new Date()
      const sevenDaysLater = new Date()
      sevenDaysLater.setDate(now.getDate() + 7)
      return eventDate >= now && eventDate <= sevenDaysLater
    })
    .sort((a, b) => {
      return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    })
    .slice(0, 3)

  // Format tanggal
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-pink-900">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Selamat datang kembali, Admin NuansaWedding!</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <RealTimeClock />
          <Button asChild className="bg-pink-600 hover:bg-pink-700 h-10 text-sm w-full sm:w-auto">
            <Link href="/klien/tambah">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Klien
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="border-pink-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3">
            <CardTitle className="text-xs sm:text-sm font-medium">Klien Aktif</CardTitle>
            <Users className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-pink-900">{activeClients}</div>
            <Button variant="link" className="p-0 h-auto text-xs text-pink-600" asChild>
              <Link href="/klien">
                Lihat semua klien <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-pink-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3">
            <CardTitle className="text-xs sm:text-sm font-medium">Event Hari Ini</CardTitle>
            <Calendar className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-pink-900">{todayEvents}</div>
            <Button variant="link" className="p-0 h-auto text-xs text-pink-600" asChild>
              <Link href="/jadwal">
                Lihat jadwal <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-pink-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3">
            <CardTitle className="text-xs sm:text-sm font-medium">Tim & Vendor</CardTitle>
            <UserPlus className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-pink-900">{teamCount + vendorCount}</div>
            <Button variant="link" className="p-0 h-auto text-xs text-pink-600" asChild>
              <Link href="/tim-vendor">
                Kelola tim & vendor <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-pink-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3">
            <CardTitle className="text-xs sm:text-sm font-medium">Sewa Baju</CardTitle>
            <Shirt className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-pink-900">0</div>
            <Button variant="link" className="p-0 h-auto text-xs text-pink-600" asChild>
              <Link href="/sewa-baju">
                Kelola sewa baju <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="daily-tasks" className="space-y-4">
        <TabsList className="bg-pink-100/50 w-full flex overflow-x-auto no-scrollbar">
          <TabsTrigger value="daily-tasks" className="data-[state=active]:bg-white flex-1">
            Tugas Harian
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-white flex-1">
            Jadwal Mendatang
          </TabsTrigger>
          <TabsTrigger value="clients" className="data-[state=active]:bg-white flex-1">
            Klien Terbaru
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily-tasks" className="space-y-4">
          <Card className="border-pink-100">
            <CardHeader className="flex flex-row items-center justify-between px-4 py-3">
              <div>
                <CardTitle className="text-base">Tugas Harian Admin</CardTitle>
                <CardDescription className="text-xs">Daftar tugas untuk hari ini</CardDescription>
              </div>
              <Button size="sm" className="bg-pink-600 hover:bg-pink-700">
                <Plus className="h-4 w-4 mr-1" /> Tambah Tugas
              </Button>
            </CardHeader>
            <CardContent className="px-4 py-2">
              <div className="space-y-3">
                {dailyTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-start space-x-3 rounded-md border p-3 ${
                      task.completed
                        ? "border-green-200 bg-green-50/50"
                        : task.priority === "high"
                          ? "border-pink-200 bg-pink-50/30"
                          : "border-pink-100"
                    }`}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-6 w-6 rounded-full ${
                        task.completed ? "text-green-600" : "text-gray-400 hover:text-pink-600"
                      }`}
                      onClick={() => toggleTaskCompletion(task.id)}
                    >
                      {task.completed ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-current" />
                      )}
                    </Button>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-sm font-medium leading-none ${task.completed ? "line-through text-gray-500" : "text-pink-900"}`}
                        >
                          {task.title}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            task.priority === "high"
                              ? "border-red-200 text-red-700"
                              : "border-orange-200 text-orange-700"
                          }`}
                        >
                          {task.priority === "high" ? "Prioritas Tinggi" : "Prioritas Sedang"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3 flex-shrink-0" />
                          <span>{task.time}</span>
                        </div>
                        <span>Ditugaskan ke: {task.assignedTo}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card className="border-pink-100">
            <CardHeader className="px-4 py-3">
              <CardTitle className="text-base">Jadwal Event Mendatang</CardTitle>
              <CardDescription className="text-xs">Event yang akan datang dalam 7 hari ke depan</CardDescription>
            </CardHeader>
            <CardContent className="px-4 py-2">
              <div className="space-y-3">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-start space-x-3 rounded-md border border-pink-100 p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100">
                        <Calendar className="h-4 w-4 text-pink-600" />
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <p className="text-sm font-medium leading-none text-pink-900 truncate">{event.clientName}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3 flex-shrink-0" />
                          <span className="truncate">
                            {formatDate(event.eventDate)}, {event.time}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{event.location}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-pink-200 text-xs h-8 px-2 flex-shrink-0"
                        asChild
                      >
                        <Link href={`/jadwal/${event.id}`}>Detail</Link>
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">Tidak ada event mendatang dalam 7 hari ke depan</p>
                    <Button variant="link" className="mt-2" asChild>
                      <Link href="/jadwal/tambah">Tambah jadwal baru</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card className="border-pink-100">
            <CardHeader className="px-4 py-3">
              <CardTitle className="text-base">Klien Terbaru</CardTitle>
              <CardDescription className="text-xs">Klien yang baru ditambahkan</CardDescription>
            </CardHeader>
            <CardContent className="px-4 py-2">
              <div className="space-y-3">
                {clients.length > 0 ? (
                  clients
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 3)
                    .map((client) => (
                      <div key={client.id} className="flex items-start space-x-3 rounded-md border border-pink-100 p-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100">
                          <Users className="h-4 w-4 text-pink-600" />
                        </div>
                        <div className="flex-1 space-y-1 min-w-0">
                          <p className="text-sm font-medium leading-none text-pink-900 truncate">{client.name}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="mr-1 h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{formatDate(client.eventDate)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{client.location}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-pink-200 text-xs h-8 px-2 flex-shrink-0"
                          asChild
                        >
                          <Link href={`/klien/${client.id}`}>Detail</Link>
                        </Button>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">Belum ada klien yang ditambahkan</p>
                    <Button variant="link" className="mt-2" asChild>
                      <Link href="/klien/tambah">Tambah klien baru</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
