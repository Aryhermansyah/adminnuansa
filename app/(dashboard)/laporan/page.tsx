"use client"

import Link from "next/link"

import { useState, useEffect } from "react"
import { CalendarIcon, Download, Filter, Search, PieChart, BarChart3, TrendingUp, ArrowUpDown } from "lucide-react"

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

export default function LaporanPage() {
  const { clients, events, vendorBookings, loading, error, refreshData } = useData()
  const [date, setDate] = useState<Date>()
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [reportType, setReportType] = useState("monthly")
  const [reportData, setReportData] = useState<any>({
    revenue: [],
    expenses: [],
    profit: [],
    summary: {
      totalRevenue: 0,
      totalExpenses: 0,
      totalProfit: 0,
      profitMargin: 0,
    },
  })

  useEffect(() => {
    refreshData()
  }, [refreshData])

  useEffect(() => {
    if (clients.length > 0) {
      // Generate monthly report data
      const months = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ]

      const revenue = months.map((month, index) => {
        // Simulate revenue data
        const amount = Math.floor(Math.random() * 50000000) + 10000000
        return {
          month,
          amount,
        }
      })

      const expenses = months.map((month, index) => {
        // Simulate expenses data (usually less than revenue)
        const amount = Math.floor(Math.random() * 30000000) + 5000000
        return {
          month,
          amount,
        }
      })

      const profit = months.map((month, index) => {
        return {
          month,
          amount: revenue[index].amount - expenses[index].amount,
        }
      })

      // Calculate summary
      const totalRevenue = revenue.reduce((sum, item) => sum + item.amount, 0)
      const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0)
      const totalProfit = totalRevenue - totalExpenses
      const profitMargin = (totalProfit / totalRevenue) * 100

      setReportData({
        revenue,
        expenses,
        profit,
        summary: {
          totalRevenue,
          totalExpenses,
          totalProfit,
          profitMargin,
        },
      })
    }
  }, [clients])

  // Loading state
  if (loading) {
    return <DataLoading title="Memuat Data Laporan" />
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
          <h1 className="text-2xl font-bold tracking-tight text-pink-900">Laporan Keuangan</h1>
          <p className="text-muted-foreground">Analisis pendapatan, pengeluaran, dan profit bisnis</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[180px] border-pink-200">
              <SelectValue placeholder="Jenis Laporan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Laporan Bulanan</SelectItem>
              <SelectItem value="quarterly">Laporan Kuartalan</SelectItem>
              <SelectItem value="yearly">Laporan Tahunan</SelectItem>
              <SelectItem value="custom">Periode Kustom</SelectItem>
            </SelectContent>
          </Select>

          {reportType === "custom" ? (
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("border-pink-200", !startDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? startDate.toLocaleDateString() : <span>Tanggal Mulai</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("border-pink-200", !endDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? endDate.toLocaleDateString() : <span>Tanggal Akhir</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          ) : (
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
                    <span>Pilih Periode</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          )}

          <Button variant="outline" className="border-pink-200">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-pink-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <TrendingUp className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-900">{formatRupiah(reportData.summary.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Tahun 2024</p>
          </CardContent>
        </Card>
        <Card className="border-pink-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-900">{formatRupiah(reportData.summary.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">Tahun 2024</p>
          </CardContent>
        </Card>
        <Card className="border-pink-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <BarChart3 className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-900">{formatRupiah(reportData.summary.totalProfit)}</div>
            <p className="text-xs text-muted-foreground">Tahun 2024</p>
          </CardContent>
        </Card>
        <Card className="border-pink-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margin Profit</CardTitle>
            <PieChart className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-900">{reportData.summary.profitMargin.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Tahun 2024</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="monthly" className="space-y-4">
        <TabsList className="bg-pink-100/50">
          <TabsTrigger value="monthly" className="data-[state=active]:bg-white">
            Laporan Bulanan
          </TabsTrigger>
          <TabsTrigger value="category" className="data-[state=active]:bg-white">
            Laporan Kategori
          </TabsTrigger>
          <TabsTrigger value="client" className="data-[state=active]:bg-white">
            Laporan per Klien
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-4">
          <Card className="border-pink-100">
            <CardHeader className="px-6 py-4">
              <CardTitle className="text-lg">Laporan Bulanan 2024</CardTitle>
              <CardDescription>Pendapatan, pengeluaran, dan profit per bulan</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-w-full">
                <div className="min-w-[800px]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-pink-100 bg-pink-50/50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Bulan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Pendapatan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Pengeluaran
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Profit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Margin
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pink-100">
                      {reportData.revenue.map((item, index) => {
                        const expense = reportData.expenses[index]
                        const profit = reportData.profit[index]
                        const margin = ((profit.amount / item.amount) * 100).toFixed(1)

                        return (
                          <tr key={item.month} className="hover:bg-pink-50/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-pink-900">{item.month}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">{formatRupiah(item.amount)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">{formatRupiah(expense.amount)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-pink-900">{formatRupiah(profit.amount)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">{margin}%</div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-pink-50/50 font-semibold">
                        <td className="px-6 py-3 text-pink-900">Total</td>
                        <td className="px-6 py-3 text-pink-900">{formatRupiah(reportData.summary.totalRevenue)}</td>
                        <td className="px-6 py-3 text-pink-900">{formatRupiah(reportData.summary.totalExpenses)}</td>
                        <td className="px-6 py-3 text-pink-900">{formatRupiah(reportData.summary.totalProfit)}</td>
                        <td className="px-6 py-3 text-pink-900">{reportData.summary.profitMargin.toFixed(1)}%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-pink-100">
              <CardHeader className="px-6 py-4">
                <CardTitle className="text-lg">Tren Pendapatan</CardTitle>
                <CardDescription>Grafik pendapatan bulanan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-end justify-between gap-2">
                  {reportData.revenue.map((item) => {
                    const height = (item.amount / reportData.summary.totalRevenue) * 100 * 2
                    return (
                      <div key={item.month} className="flex flex-col items-center gap-2">
                        <div
                          className="w-8 bg-pink-400 rounded-t"
                          style={{ height: `${Math.max(height, 10)}px` }}
                        ></div>
                        <span className="text-xs text-muted-foreground">{item.month.substring(0, 3)}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-pink-100">
              <CardHeader className="px-6 py-4">
                <CardTitle className="text-lg">Perbandingan Profit</CardTitle>
                <CardDescription>Grafik profit bulanan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-end justify-between gap-2">
                  {reportData.profit.map((item) => {
                    const maxProfit = Math.max(...reportData.profit.map((p) => p.amount))
                    const height = (item.amount / maxProfit) * 100 * 2
                    return (
                      <div key={item.month} className="flex flex-col items-center gap-2">
                        <div
                          className="w-8 bg-green-400 rounded-t"
                          style={{ height: `${Math.max(height, 10)}px` }}
                        ></div>
                        <span className="text-xs text-muted-foreground">{item.month.substring(0, 3)}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="category" className="space-y-4">
          <Card className="border-pink-100">
            <CardHeader className="px-6 py-4">
              <CardTitle className="text-lg">Laporan per Kategori</CardTitle>
              <CardDescription>Pendapatan berdasarkan kategori layanan</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-w-full">
                <div className="min-w-[600px]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-pink-100 bg-pink-50/50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Kategori
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Jumlah Transaksi
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Total Pendapatan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Persentase
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pink-100">
                      {[
                        { category: "Wedding Organizer", count: 24, amount: 120000000 },
                        { category: "Makeup & Hairdo", count: 36, amount: 90000000 },
                        { category: "Dekorasi", count: 18, amount: 72000000 },
                        { category: "Dokumentasi", count: 15, amount: 60000000 },
                        { category: "Sewa Baju", count: 12, amount: 36000000 },
                      ].map((item) => {
                        const percentage = ((item.amount / 378000000) * 100).toFixed(1)
                        return (
                          <tr key={item.category} className="hover:bg-pink-50/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-pink-900">{item.category}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">{item.count}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-pink-900">{formatRupiah(item.amount)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">{percentage}%</div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-pink-50/50 font-semibold">
                        <td className="px-6 py-3 text-pink-900">Total</td>
                        <td className="px-6 py-3 text-pink-900">105</td>
                        <td className="px-6 py-3 text-pink-900">{formatRupiah(378000000)}</td>
                        <td className="px-6 py-3 text-pink-900">100%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-pink-100">
              <CardHeader className="px-6 py-4">
                <CardTitle className="text-lg">Distribusi Pendapatan</CardTitle>
                <CardDescription>Persentase pendapatan per kategori</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <div className="relative h-[250px] w-[250px] rounded-full border-8 border-pink-100 flex items-center justify-center">
                    <div
                      className="absolute top-0 left-0 h-full w-full rounded-full"
                      style={{
                        background:
                          "conic-gradient(#f472b6 0% 31.7%, #60a5fa 31.7% 55.5%, #a78bfa 55.5% 74.6%, #4ade80 74.6% 90.5%, #fbbf24 90.5% 100%)",
                        clipPath: "circle(50% at center)",
                      }}
                    ></div>
                    <div className="absolute h-[150px] w-[150px] rounded-full bg-white"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-pink-400"></div>
                    <span className="text-xs">Wedding Organizer (31.7%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-400"></div>
                    <span className="text-xs">Makeup & Hairdo (23.8%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-purple-400"></div>
                    <span className="text-xs">Dekorasi (19.1%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-400"></div>
                    <span className="text-xs">Dokumentasi (15.9%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                    <span className="text-xs">Sewa Baju (9.5%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-pink-100">
              <CardHeader className="px-6 py-4">
                <CardTitle className="text-lg">Jumlah Transaksi</CardTitle>
                <CardDescription>Jumlah transaksi per kategori</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Wedding Organizer</span>
                      <span className="text-sm text-muted-foreground">24 transaksi</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div className="h-2 rounded-full bg-pink-400" style={{ width: "22.9%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Makeup & Hairdo</span>
                      <span className="text-sm text-muted-foreground">36 transaksi</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div className="h-2 rounded-full bg-blue-400" style={{ width: "34.3%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Dekorasi</span>
                      <span className="text-sm text-muted-foreground">18 transaksi</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div className="h-2 rounded-full bg-purple-400" style={{ width: "17.1%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Dokumentasi</span>
                      <span className="text-sm text-muted-foreground">15 transaksi</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div className="h-2 rounded-full bg-green-400" style={{ width: "14.3%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Sewa Baju</span>
                      <span className="text-sm text-muted-foreground">12 transaksi</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div className="h-2 rounded-full bg-yellow-400" style={{ width: "11.4%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="client" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Cari nama klien..." className="pl-8 border-pink-200" />
            </div>
            <div className="w-40">
              <Select defaultValue="all">
                <SelectTrigger className="border-pink-200">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Klien</SelectItem>
                  <SelectItem value="active">Klien Aktif</SelectItem>
                  <SelectItem value="completed">Klien Selesai</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="border-pink-100">
            <CardHeader className="px-6 py-4">
              <CardTitle className="text-lg">Laporan per Klien</CardTitle>
              <CardDescription>Pendapatan berdasarkan klien</CardDescription>
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
                          Tanggal Acara
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Jenis Acara
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Layanan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                          Total Pendapatan
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
                      {clients.slice(0, 10).map((client) => {
                        const revenue = Math.floor(Math.random() * 20000000) + 10000000
                        const status = Math.random() > 0.5 ? "Lunas" : "Belum Lunas"
                        return (
                          <tr key={client.id} className="hover:bg-pink-50/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-pink-900">{client.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">
                                {new Date(client.eventDate).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">{client.eventType || "Pernikahan"}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">
                                {client.services?.join(", ") || "Wedding Organizer, Makeup"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-pink-900">{formatRupiah(revenue)}</div>
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
                                <Link href={`/klien/${client.id}/invoice`}>Lihat Invoice</Link>
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
