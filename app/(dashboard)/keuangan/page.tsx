"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { CalendarIcon, Download, Filter, Search, TrendingUp, DollarSign, Users, Percent, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useData } from "@/contexts/data-context"
import { DataLoading } from "@/components/data-loading"

export default function KeuanganPage() {
  const { clients = [], events = [], loading, error, refreshData } = useData()
  const [date, setDate] = useState<Date>()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [salaryData, setExpenseData] = useState<any[]>([])
  const [filterSource, setFilterSource] = useState("all")
  
  // Karena vendorBookings tidak tersedia dari context, kita buat dummy data
  const vendorBookings = [
    { id: 1, clientId: 1, vendorId: 1, price: 2000000 },
    { id: 2, clientId: 2, vendorId: 2, price: 1500000 },
    { id: 3, clientId: 3, vendorId: 3, price: 1800000 },
  ]

  useEffect(() => {
    refreshData()
  }, [refreshData])

  useEffect(() => {
    if (clients && clients.length > 0 && events && events.length > 0) {
      // Generate revenue data based on clients and dress rentals
      const revenue = clients.map((client) => {
        // Calculate vendor bookings for this client
        const clientVendorBookings = vendorBookings.filter((b) => b.clientId === client.id)
        const vendorTotal = clientVendorBookings.reduce((total, booking) => total + booking.price, 0)

        // Base package price varies by event type
        let basePackage = 15000000 // Default for wedding
        if (client.eventType === "Engagement") basePackage = 8000000
        if (client.eventType === "Pre-wedding") basePackage = 5000000

        const total = basePackage + vendorTotal

        // Payment status based on client status
        const paymentStatus =
          client.status === "Completed" ? "Lunas" : client.status === "In Progress" ? "DP 50%" : "Belum Bayar"

        return {
          id: client.id,
          client: client.name,
          date: new Date(client.eventDate).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          eventType: client.eventType,
          services: client.services || [],
          amount: total,
          status: paymentStatus,
          source: "Paket Acara",
        }
      })

      // Add dress rental revenue if available in the database
      // This is a placeholder - in a real app, you would fetch from the dress rental database
      const dressRentals = [
        {
          id: 101,
          client: "Anisa Rahma",
          date: new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          eventType: "Sewa Gaun",
          services: ["Gaun Pengantin"],
          amount: 3500000,
          status: "Lunas",
          source: "Sewa Baju",
        },
        {
          id: 102,
          client: "Dian Sastro",
          date: new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          eventType: "Sewa Gaun",
          services: ["Gaun Pesta"],
          amount: 2000000,
          status: "DP 50%",
          source: "Sewa Baju",
        },
        {
          id: 103,
          client: "Raisa Andriana",
          date: new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          eventType: "Sewa Gaun",
          services: ["Gaun Pengantin", "Aksesoris"],
          amount: 4500000,
          status: "Lunas",
          source: "Sewa Baju",
        },
      ]

      // Combine client revenue with dress rental revenue
      const combinedRevenue = [...revenue, ...dressRentals]
      setRevenueData(combinedRevenue)

      // Generate expense data (salaries and vendor payments)
      const expenses = [
        {
          id: 1,
          name: "Rina",
          role: "MUA",
          month: "Juni 2024",
          baseSalary: 5000000,
          bonus: 1500000,
          totalSalary: 6500000,
          status: "Belum Dibayar",
        },
        {
          id: 2,
          name: "Sinta",
          role: "MUA",
          month: "Juni 2024",
          baseSalary: 5000000,
          bonus: 1200000,
          totalSalary: 6200000,
          status: "Belum Dibayar",
        },
        {
          id: 3,
          name: "Dani",
          role: "Asisten MUA",
          month: "Juni 2024",
          baseSalary: 3500000,
          bonus: 800000,
          totalSalary: 4300000,
          status: "Belum Dibayar",
        },
        {
          id: 4,
          name: "Tono",
          role: "Dekorasi",
          month: "Juni 2024",
          baseSalary: 4500000,
          bonus: 1000000,
          totalSalary: 5500000,
          status: "Belum Dibayar",
        },
        {
          id: 5,
          name: "Agus",
          role: "Dekorasi",
          month: "Juni 2024",
          baseSalary: 4500000,
          bonus: 900000,
          totalSalary: 5400000,
          status: "Belum Dibayar",
        },
      ]

      setExpenseData(expenses)
    }
  }, [clients, events])

  // Loading state
  if (loading) {
    return <DataLoading title="Memuat Data Keuangan" />
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

  // Menghitung total pendapatan
  const totalRevenue = revenueData.reduce((total, item) => total + item.amount, 0)

  // Menghitung total pengeluaran gaji
  const totalSalary = salaryData.reduce((total, item) => total + item.totalSalary, 0)

  // Menghitung profit
  const profit = totalRevenue - totalSalary

  // Menghitung margin
  const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0

  // Filter data pendapatan
  const filteredRevenue = revenueData.filter((revenue) => {
    const matchesSearch = revenue.client.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || revenue.status === filterStatus
    const matchesSource = filterSource === "all" || revenue.source === filterSource

    return matchesSearch && matchesStatus && matchesSource
  })

  // Format angka ke format rupiah
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-pink-900">Keuangan</h1>
          <p className="text-muted-foreground">Kelola pendapatan dan pengeluaran bisnis</p>
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("border-pink-200", !date && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? (
                  date.toLocaleDateString("id-ID", {
                    month: "long",
                    year: "numeric",
                  })
                ) : (
                  <span>Pilih bulan</span>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-pink-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <DollarSign className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-900">{formatRupiah(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Bulan Juni 2024</p>
          </CardContent>
        </Card>
        <Card className="border-pink-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            <Users className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-900">{formatRupiah(totalSalary)}</div>
            <p className="text-xs text-muted-foreground">Gaji & Bonus Tim</p>
          </CardContent>
        </Card>
        <Card className="border-pink-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-900">{formatRupiah(profit)}</div>
            <p className="text-xs text-muted-foreground">Pendapatan - Pengeluaran</p>
          </CardContent>
        </Card>
        <Card className="border-pink-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margin</CardTitle>
            <Percent className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-900">{margin.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Profit / Pendapatan</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="bg-pink-100/50">
          <TabsTrigger value="revenue" className="data-[state=active]:bg-white">
            Pendapatan
          </TabsTrigger>
          <TabsTrigger value="salary" className="data-[state=active]:bg-white">
            Gaji & Bonus
          </TabsTrigger>
          <TabsTrigger value="invoices" className="data-[state=active]:bg-white">
            Invoice
          </TabsTrigger>
        </TabsList>
        <TabsContent value="revenue" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari nama klien..."
                className="pl-8 border-pink-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-40">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="border-pink-200">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="Lunas">Lunas</SelectItem>
                  <SelectItem value="DP 50%">DP 50%</SelectItem>
                  <SelectItem value="Belum Bayar">Belum Bayar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-40">
              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger className="border-pink-200">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sumber" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Sumber</SelectItem>
                  <SelectItem value="Paket Acara">Paket Acara</SelectItem>
                  <SelectItem value="Sewa Baju">Sewa Baju</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="border-pink-100">
            <CardHeader className="px-6 py-4">
              <CardTitle className="text-lg">Daftar Pendapatan</CardTitle>
              <CardDescription>Pendapatan dari klien bulan Juni 2024</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-w-full">
                <div className="min-w-[800px]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-pink-100 bg-pink-50/50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Klien
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Tanggal
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Jenis Acara
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Layanan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Jumlah
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Sumber
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pink-100">
                      {filteredRevenue.map((revenue) => (
                        <tr key={revenue.id} className="hover:bg-pink-50/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-pink-900">{revenue.client}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{revenue.date}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{revenue.eventType}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{revenue.services.join(", ")}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-pink-900">{formatRupiah(revenue.amount)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                revenue.status === "Lunas"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {revenue.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                revenue.source === "Paket Acara"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {revenue.source}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Button variant="link" size="sm" className="text-pink-600 p-0 h-auto" asChild>
                              <Link
                                href={
                                  revenue.source === "Paket Acara"
                                    ? `/klien/${revenue.id}/invoice`
                                    : `/sewa-baju/invoice/${revenue.id}`
                                }
                              >
                                Lihat Invoice
                              </Link>
                            </Button>
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
        <TabsContent value="salary" className="space-y-4">
          <Card className="border-pink-100">
            <CardHeader className="px-6 py-4">
              <CardTitle className="text-lg">Daftar Gaji & Bonus</CardTitle>
              <CardDescription>Gaji dan bonus tim bulan Juni 2024</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-w-full">
                <div className="min-w-[800px]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-pink-100 bg-pink-50/50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Nama
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Posisi
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Gaji Pokok
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Bonus
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pink-100">
                      {salaryData.map((salary) => (
                        <tr key={salary.id} className="hover:bg-pink-50/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-pink-900">{salary.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{salary.role}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{formatRupiah(salary.baseSalary)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{formatRupiah(salary.bonus)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-pink-900">{formatRupiah(salary.totalSalary)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
                              {salary.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Button variant="outline" size="sm" className="border-pink-200 text-xs">
                              Bayar
                            </Button>
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
        <TabsContent value="invoices" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Cari invoice..." className="pl-8 border-pink-200" />
            </div>
            <Button className="bg-pink-600 hover:bg-pink-700">
              <Plus className="h-4 w-4 mr-2" /> Buat Invoice
            </Button>
          </div>

          <Card className="border-pink-100">
            <CardHeader className="px-6 py-4">
              <CardTitle className="text-lg">Daftar Invoice</CardTitle>
              <CardDescription>Semua invoice yang telah dibuat</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-w-full">
                <div className="min-w-[800px]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-pink-100 bg-pink-50/50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          No. Invoice
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Klien
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Tanggal
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Jatuh Tempo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pink-100">
                      {clients.slice(0, 5).map((client) => {
                        const invoiceNumber = `INV-${client.id}-${new Date().getFullYear()}`
                        const invoiceDate = new Date().toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                        const dueDate = new Date()
                        dueDate.setDate(dueDate.getDate() + 14)
                        const dueDateFormatted = dueDate.toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                        const total = 15000000 + Math.floor(Math.random() * 10000000)
                        const status = Math.random() > 0.5 ? "Lunas" : "Belum Lunas"

                        return (
                          <tr key={client.id} className="hover:bg-pink-50/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-pink-900">{invoiceNumber}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">{client.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">{invoiceDate}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">{dueDateFormatted}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-pink-900">{formatRupiah(total)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  status === "Lunas" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Button variant="link" size="sm" className="text-pink-600 p-0 h-auto" asChild>
                                <Link href={`/klien/${client.id}/invoice`}>Lihat</Link>
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
