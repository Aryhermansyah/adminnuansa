"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { 
  Plus, Search, Filter, Calendar, MapPin, Phone, MoreHorizontal,
  ChevronLeft, ChevronRight, CalendarIcon, Clock, AlertCircle, 
  CheckCircle, CheckCheck, XCircle, Users
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useData } from "@/contexts/data-context"
import { format, isSameDay, isSameMonth, isToday, addMonths, subMonths, differenceInDays } from "date-fns"
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"

// Tambahkan import CSS
import "react-day-picker/dist/style.css"

// Komponen alert informasi
const InfoAlert = ({ children, variant = "info" }: { children: React.ReactNode, variant?: "info" | "warning" | "success" | "error" }) => {
  const bgColor = {
    info: "bg-blue-50 border-blue-200",
    warning: "bg-yellow-50 border-yellow-200",
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
  }
  
  const textColor = {
    info: "text-blue-800",
    warning: "text-yellow-800",
    success: "text-green-800",
    error: "text-red-800",
  }
  
  const icon = {
    info: <AlertCircle className="h-4 w-4 text-blue-500" />,
    warning: <AlertCircle className="h-4 w-4 text-yellow-500" />,
    success: <CheckCircle className="h-4 w-4 text-green-500" />,
    error: <AlertCircle className="h-4 w-4 text-red-500" />,
  }
  
  return (
    <div className={`text-sm p-3 rounded-lg border ${bgColor[variant]}`}>
      <div className="flex items-center gap-2">
        {icon[variant]}
        <div className={textColor[variant]}>{children}</div>
      </div>
    </div>
  )
}

// Menambahkan helper function untuk memeriksa tanggal dalam 30 hari ke depan
const isDateWithin30Days = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 && diffDays <= 30;
};

export default function KlienPage() {
  const { clients, events, isLoading, refreshData } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterService, setFilterService] = useState("all")
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [error, setError] = useState<Error | null>(null)

  // Refresh data when component mounts
  useEffect(() => {
    try {
    refreshData()
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Terjadi kesalahan saat memuat data'))
    }
  }, [refreshData])

  // Dalam fungsi komponen KlienPage, tambahkan useEffect untuk debugging
  useEffect(() => {
    if (events && events.length > 0) {
      console.log("Total events:", events.length);
      
      // Log event dalam 30 hari ke depan
      const eventsIn30Days = events.filter(event => {
        const eventDate = new Date(event.eventDate);
        return isDateWithin30Days(eventDate);
      });
      
      console.log("Events in next 30 days:", eventsIn30Days.length);
    }
  }, [events]);

  // Filter klien berdasarkan pencarian dan filter
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || client.status === filterStatus

    const matchesService = filterService === "all" || client.services.some((service) => service === filterService)

    return matchesSearch && matchesStatus && matchesService
  })

  // Fungsi untuk mendapatkan tanggal dengan event
  const getDaysWithEvents = (day: Date) => {
    if (!events || events.length === 0) return false;
    
    return events.some((event) => {
      try {
        const eventDate = new Date(event.eventDate);
        return isSameDay(eventDate, day);
      } catch (error) {
        console.error("Error comparing dates in getDaysWithEvents:", error);
        return false;
      }
    });
  }
  
  // Fungsi untuk menghitung jumlah event per tanggal
  const getEventCountForDay = (day: Date) => {
    if (!events || events.length === 0) return 0;
    
    return events.filter(event => {
      try {
        const eventDate = new Date(event.eventDate);
        return isSameDay(eventDate, day);
      } catch (error) {
        console.error("Error comparing dates in getEventCountForDay:", error);
        return false;
      }
    }).length;
  }

  // Filter events berdasarkan tanggal yang dipilih
  const filteredEvents = useMemo(() => {
    if (!events) return []
    
    return events.filter((event) => {
      if (!event.eventDate) return false
      
      try {
        // Pastikan kita bekerja dengan objek Date
        const eventDate = new Date(event.eventDate)
        
        // Bandingkan tanggal dengan membandingkan string tanggal saja (YYYY-MM-DD)
        const eventDateStr = eventDate.toISOString().split('T')[0]
        const currentDateStr = currentDate.toISOString().split('T')[0]
        
        const dateMatch = eventDateStr === currentDateStr
        
        const serviceMatch = filterService === "all" || 
          (event.services && event.services.some(service => service === filterService))
          
        const statusMatch = filterStatus === "all" || event.status === filterStatus
        
        return dateMatch && serviceMatch && statusMatch
      } catch (error) {
        console.error("Error comparing dates:", error)
        return false
      }
    })
  }, [events, currentDate, filterService, filterStatus])

  // Fungsi untuk mendapatkan warna badge berdasarkan status
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Confirmed":
      case "Aktif":
      case "confirmed":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "In Progress":
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "Completed":
      case "completed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    } catch (error) {
      return dateString
    }
  }

  // Mendapatkan ikon status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
      case "pending":
        return <Clock className="h-3.5 w-3.5 text-amber-500" />
      case "completed":
        return <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
      case "cancelled":
        return <XCircle className="h-3.5 w-3.5 text-rose-500" />
      default:
        return null
    }
  }

  // Mendapatkan teks status
  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Dikonfirmasi"
      case "pending":
        return "Menunggu"
      case "completed":
        return "Selesai"
      case "cancelled":
        return "Dibatalkan"
      default:
        return status
    }
  }

  // Menghitung waktu yang tersisa hingga acara
  const getTimeLeft = (dateString: string) => {
    const eventDate = new Date(dateString)
    const daysLeft = differenceInDays(eventDate, new Date())
    
    if (daysLeft < 0) {
      return "Sudah lewat"
    } else if (daysLeft === 0) {
      return "Hari ini"
    } else if (daysLeft === 1) {
      return "Besok"
    } else {
      return `${daysLeft} hari lagi`
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-pink-900">Manajemen Klien</h1>
            <p className="text-sm text-muted-foreground">Kelola data klien dan jadwal</p>
          </div>
          <Skeleton className="h-10 w-full md:w-40" />
        </div>

        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <Skeleton className="h-10 w-[140px] flex-shrink-0" />
            <Skeleton className="h-10 w-[140px] flex-shrink-0" />
          </div>
        </div>

        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    )
  }

  // Error state
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-pink-900">Manajemen Klien & Jadwal</h1>
          <p className="text-sm text-muted-foreground">Kelola data klien dan jadwal acara</p>
        </div>
        <div className="flex gap-2">
        <Button asChild className="bg-pink-600 hover:bg-pink-700 w-full md:w-auto">
          <Link href="/klien/tambah">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Klien
          </Link>
        </Button>
          <Button asChild variant="outline" className="border-pink-200 w-full md:w-auto">
            <Link href="/klien/tambah-jadwal">
              <Calendar className="mr-2 h-4 w-4" />
              Roundwoon Acara
            </Link>
          </Button>
        </div>
      </div>

      {/* Filter section */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari nama klien atau lokasi..."
            className="pl-8 border-pink-200 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <div className="w-[140px] flex-shrink-0">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="border-pink-200 h-10">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="Aktif">Aktif</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-[140px] flex-shrink-0">
            <Select value={filterService} onValueChange={setFilterService}>
              <SelectTrigger className="border-pink-200 h-10">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Layanan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Layanan</SelectItem>
                <SelectItem value="Makeup">Makeup</SelectItem>
                <SelectItem value="Dekorasi">Dekorasi</SelectItem>
                <SelectItem value="Busana">Busana</SelectItem>
                <SelectItem value="Fotografi">Fotografi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main content - Combined calendar and client list */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mt-4">
        {/* Calendar section - full width */}
        <Card className="border-pink-100 shadow-sm">
          <CardHeader className="p-3 md:px-6 bg-pink-50/50 flex flex-row justify-between items-center">
            <CardTitle className="text-lg text-pink-900">
              Kalender {format(currentDate, "MMMM yyyy", { locale: id })}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 border-pink-200"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Bulan Sebelumnya</span>
              </Button>
              <Button
                variant="outline"
                className="h-7 border-pink-200"
                onClick={() => setCurrentDate(new Date())}
              >
                Hari Ini
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 border-pink-200"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Bulan Berikutnya</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 py-2">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Calendar in landscape mode */}
              <div className="w-full md:w-3/4 px-2">
                <div className="calendar-landscape">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="p-2 text-center text-xs font-medium text-muted-foreground">Sen</th>
                        <th className="p-2 text-center text-xs font-medium text-muted-foreground">Sel</th>
                        <th className="p-2 text-center text-xs font-medium text-muted-foreground">Rab</th>
                        <th className="p-2 text-center text-xs font-medium text-muted-foreground">Kam</th>
                        <th className="p-2 text-center text-xs font-medium text-muted-foreground">Jum</th>
                        <th className="p-2 text-center text-xs font-medium text-muted-foreground">Sab</th>
                        <th className="p-2 text-center text-xs font-medium text-muted-foreground">Min</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        // Mendapatkan hari pertama bulan ini
                        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                        // Mendapatkan jumlah hari dalam bulan ini
                        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
                        // Mendapatkan hari dalam seminggu (0 = Minggu, 1 = Senin, dst.)
                        let dayOfWeek = firstDay.getDay();
                        // Mengubah format hari (1 = Senin, ... 7 = Minggu)
                        dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                        
                        // Membangun array untuk semua hari dalam bulan
                        const days: (Date | null)[] = [];
                        
                        // Menambahkan array kosong untuk offset hari pertama bulan
                        for (let i = 0; i < dayOfWeek; i++) {
                          days.push(null);
                        }
                        
                        // Menambahkan semua hari dalam bulan
                        for (let i = 1; i <= daysInMonth; i++) {
                          days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
                        }
                        
                        // Membuat rows dari array hari
                        const rows: (Date | null)[][] = [];
                        let cells: (Date | null)[] = [];
                        
                        days.forEach((day, i) => {
                          if (i % 7 === 0 && i > 0) {
                            rows.push(cells);
                            cells = [];
                          }
                          cells.push(day);
                          if (i === days.length - 1) {
                            // Menambahkan hari kosong di akhir bulan jika diperlukan
                            while (cells.length < 7) {
                              cells.push(null);
                            }
                            rows.push(cells);
                          }
                        });
                        
                        return rows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.map((day: Date | null, dayIndex: number) => {
                              if (day === null) {
                                return <td key={dayIndex} className="p-2"></td>;
                              }
                              
                              const dayNum = day.getDate();
                              const isSelectedDay = isSameDay(day, currentDate);
                              const isTodayDate = isToday(day);
                              const hasEvent = getDaysWithEvents(day);
                              const eventCount = getEventCountForDay(day);
                              
                              return (
                                <td key={dayIndex} className="relative">
                                  <button 
                                    className={cn(
                                      "w-full p-2 text-center rounded-md hover:bg-pink-50",
                                      isSelectedDay && "bg-pink-200 font-semibold",
                                      isTodayDate && !isSelectedDay && "bg-pink-100 font-semibold",
                                      hasEvent && !isSelectedDay && "font-medium text-pink-700"
                                    )}
                                    onClick={() => {
                                      // Membuat objek tanggal baru dengan jam yang sama
                                      const newDate = new Date(day);
                                      // Memperbarui state tanggal yang dipilih
                                      setCurrentDate(newDate);
                                    }}
                                  >
                                    {dayNum}
                                    {eventCount > 0 && (
                                      <div className="w-5 h-5 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center absolute -top-1 -right-1">
                                        {eventCount}
                                      </div>
                                    )}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Selected day events */}
              <div className="w-full md:w-1/4 h-[300px]">
                <div className="bg-pink-50/30 p-4 rounded-md h-full">
                  <h3 className="text-md font-medium text-pink-900 mb-2">
                    {format(currentDate, "EEEE, d MMMM yyyy", { locale: id })}
                  </h3>
                  <ScrollArea className="h-[250px]">
                    {filteredEvents.length > 0 ? (
                      <div className="space-y-3">
                        {filteredEvents.map((event) => (
                          <Card key={event.id} className={cn(
                            "border-pink-100 transition-all hover:shadow-md", 
                            isDateWithin30Days(new Date(event.eventDate)) && 
                            "border-l-4 border-l-pink-600 bg-gradient-to-r from-pink-50 to-transparent shadow-sm"
                          )}>
                            <CardContent className="p-3">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-pink-900 text-sm">{event.clientName}</h4>
                                  <Badge className={cn("text-xs", getStatusBadgeColor(event.status))}>
                                    {getStatusText(event.status)}
                                  </Badge>
                                </div>
                                <div className="space-y-1 text-xs">
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1.5 text-pink-500" />
                                    <span>{event.time}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <MapPin className="h-3 w-3 mr-1.5 text-pink-500" />
                                    <span className="truncate">{event.location}</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-2">
                        <Calendar className="h-8 w-8 text-pink-200 mb-2" />
                        <p className="text-muted-foreground text-center text-xs">
                          Tidak ada acara dijadwalkan
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client list section */}
        <Card className="border-pink-100 shadow-sm overflow-hidden">
          <CardHeader className="p-3 md:px-6 pb-2 flex flex-row items-center justify-between bg-pink-50/50 border-b border-pink-100">
            <div>
              <CardTitle className="text-lg text-pink-900">
                Daftar Klien
              </CardTitle>
              <CardDescription>
                {filteredClients.length} klien ditemukan
              </CardDescription>
            </div>
            <AlertCircle className="h-5 w-5 text-pink-500" />
          </CardHeader>
          <CardContent className="p-4 overflow-auto" style={{ maxHeight: "calc(100vh - 700px)" }}>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <Card key={client.id} className={cn(
                    "border-pink-100 overflow-hidden shadow-sm hover:shadow transition-all",
                    isDateWithin30Days(new Date(client.eventDate)) && 
                    "ring-1 ring-pink-500"
                  )}>
            <CardContent className="p-0">
                      <div className={cn(
                        "p-3",
                        isDateWithin30Days(new Date(client.eventDate))
                          ? "bg-gradient-to-r from-pink-200 to-pink-50" 
                          : "bg-gradient-to-r from-pink-50 to-white"
                      )}>
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-pink-900">{client.name}</h3>
                  <Badge className={getStatusBadgeColor(client.status)}>{client.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{client.eventType}</p>

                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-pink-600 flex-shrink-0" />
                            <span className="truncate">
                              {formatDate(client.eventDate)}
                              {isDateWithin30Days(new Date(client.eventDate)) && (
                                <span className="ml-2 text-xs font-medium bg-pink-600 text-white px-1.5 py-0.5 rounded shadow-sm">
                                  {getTimeLeft(client.eventDate)}
                                </span>
                              )}
                            </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-pink-600 flex-shrink-0" />
                    <span className="truncate">{client.location}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-pink-600 flex-shrink-0" />
                    <span className="truncate">{client.phone}</span>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {client.services.map((service, index) => (
                    <Badge key={index} variant="outline" className="border-pink-200 text-pink-800">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex border-t border-pink-100">
                <Link
                  href={`/klien/${client.id}`}
                  className="flex-1 py-2 text-center text-sm font-medium text-pink-700 hover:bg-pink-50 transition-colors"
                >
                  Lihat Detail
                </Link>
                <div className="border-l border-pink-100"></div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-9 w-9 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/klien/${client.id}/edit`}>Edit</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/klien/${client.id}/vendor`}>Pesan Vendor</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Hapus</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-8">
                  <Users className="h-12 w-12 text-pink-200 mb-2" />
                  <p className="text-muted-foreground text-center px-4">
                    Tidak ada klien ditemukan dengan filter yang dipilih
                  </p>
                  <Button asChild variant="link" className="mt-2 text-pink-600">
                    <Link href="/klien/tambah">Tambah Klien Baru</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
