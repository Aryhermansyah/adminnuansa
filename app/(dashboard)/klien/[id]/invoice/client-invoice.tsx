"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, Printer, Download, Send, Clock, Calendar, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useData } from "@/contexts/data-context"
import { DataLoading } from "@/components/data-loading"

// Type definition for payment data
type PaymentData = {
  id: number;
  tanggal: string;
  jumlah: number;
  metodePembayaran: string;
  keterangan: string;
  buktiPembayaran?: string;
};

export default function ClientInvoice() {
  const router = useRouter()
  const params = useParams()
  const clientId = Number(params.id)
  const { clients, events, vendorBookings, error, refreshData } = useData()
  const [invoiceData, setInvoiceData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [storedInvoiceData, setStoredInvoiceData] = useState<any>(null)
  const [storedPayments, setStoredPayments] = useState<PaymentData[]>([])

  useEffect(() => {
    refreshData()
    
    // Load invoice data from localStorage
    try {
      const savedInvoiceData = localStorage.getItem(`invoiceData_${clientId}`);
      if (savedInvoiceData) {
        setStoredInvoiceData(JSON.parse(savedInvoiceData));
      }
      
      const savedPayments = localStorage.getItem(`terminPembayaran_${clientId}`);
      if (savedPayments) {
        setStoredPayments(JSON.parse(savedPayments));
      }
    } catch (error) {
      console.error("Error loading stored invoice data:", error);
    }
    
    setIsLoading(false)
  }, [refreshData, clientId])

  useEffect(() => {
    if (clients.length > 0 && events.length > 0 && vendorBookings.length > 0) {
      const client = clients.find((c) => c.id === clientId)
      const clientEvents = events.filter((e) => e.clientId === clientId)
      const clientVendorBookings = vendorBookings.filter((b) => b.clientId === clientId)

      if (client) {
        // Get total price from stored invoice data if available, or calculate
        const basePackagePrice = 15000000 // Harga paket dasar
        const vendorTotalPrice = clientVendorBookings.reduce((total, booking) => total + booking.price, 0)
        const totalPrice = storedInvoiceData?.totalHarga || (basePackagePrice + vendorTotalPrice)

        // Get payment info from stored data or use defaults
        const paidAmount = storedPayments.reduce((total, payment) => total + payment.jumlah, 0)
        const remainingAmount = totalPrice - paidAmount
        const paymentStatus = remainingAmount <= 0 ? "Lunas" : "Belum Lunas"

        // Buat data invoice
        setInvoiceData({
          invoiceNumber: `INV-${clientId}-${new Date().getFullYear()}`,
          date: new Date().toISOString(),
          dueDate: (() => {
            const date = new Date()
            date.setDate(date.getDate() + 14)
            return date.toISOString()
          })(),
          client,
          events: clientEvents,
          vendorBookings: clientVendorBookings,
          basePackagePrice,
          vendorTotalPrice,
          totalPrice,
          paidAmount,
          remainingAmount,
          status: paymentStatus,
          paymentHistory: storedPayments.length > 0 ? storedPayments : [
            {
              id: 1,
              tanggal: (() => {
                const date = new Date()
                date.setDate(date.getDate() - 30)
                return date.toISOString().split('T')[0]
              })(),
              jumlah: 5000000,
              metodePembayaran: "Transfer Bank",
              keterangan: "Down Payment",
            },
            {
              id: 2,
              tanggal: (() => {
                const date = new Date()
                date.setDate(date.getDate() - 15)
                return date.toISOString().split('T')[0]
              })(),
              jumlah: 5000000,
              metodePembayaran: "Transfer Bank",
              keterangan: "Pembayaran Kedua",
            },
          ],
          notes: storedInvoiceData?.catatanPembayaran || "",
        })
      }
    }
  }, [clients, events, vendorBookings, clientId, storedInvoiceData, storedPayments])

  // Loading state
  if (isLoading) {
    return <DataLoading title="Memuat Data Invoice" />
  }

  // Error state
  if (error || !invoiceData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-red-600">Terjadi Kesalahan</h2>
          <p className="text-muted-foreground">{error?.message || "Data invoice tidak ditemukan"}</p>
          <Button onClick={() => router.push(`/klien/${clientId}`)} className="bg-pink-600 hover:bg-pink-700">
            Kembali ke Detail Klien
          </Button>
        </div>
      </div>
    )
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  // Format currency
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
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-pink-900">Invoice</h1>
            <p className="text-muted-foreground">{invoiceData.invoiceNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-pink-200" size="sm">
            <Printer className="h-4 w-4 mr-2" /> Cetak
          </Button>
          <Button variant="outline" className="border-pink-200" size="sm">
            <Download className="h-4 w-4 mr-2" /> Unduh PDF
          </Button>
          <Button className="bg-pink-600 hover:bg-pink-700" size="sm">
            <Send className="h-4 w-4 mr-2" /> Kirim
          </Button>
        </div>
      </div>

      <Card className="border-pink-100">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-pink-900">NuansaWedding Office</h2>
              <p className="text-sm text-muted-foreground mt-1">Jl. Kemang Raya No. 123</p>
              <p className="text-sm text-muted-foreground">Jakarta Selatan, 12730</p>
              <p className="text-sm text-muted-foreground">Telp: (021) 123-4567</p>
              <p className="text-sm text-muted-foreground">Email: info@nuansawedding.com</p>
            </div>
            <div className="text-right">
              <div className="inline-block bg-pink-50 px-4 py-2 rounded-md border border-pink-100">
                <h3 className="text-lg font-semibold text-pink-900">Invoice</h3>
                <p className="text-sm font-medium">{invoiceData.invoiceNumber}</p>
                <div className="flex items-center mt-2 text-sm">
                  <Calendar className="h-4 w-4 mr-1 text-pink-600" />
                  <span>Tanggal: {formatDate(invoiceData.date)}</span>
                </div>
                <div className="flex items-center mt-1 text-sm">
                  <Clock className="h-4 w-4 mr-1 text-pink-600" />
                  <span>Jatuh Tempo: {formatDate(invoiceData.dueDate)}</span>
                </div>
                <div className="mt-2">
                  <Badge
                    className={
                      invoiceData.status === "Lunas" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {invoiceData.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Klien</h3>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
              <h4 className="font-medium text-pink-900">{invoiceData.client.name}</h4>
              <p className="text-sm text-muted-foreground mt-1">{invoiceData.client.phone}</p>
              {invoiceData.client.email && <p className="text-sm text-muted-foreground">{invoiceData.client.email}</p>}
              {invoiceData.client.address && (
                <p className="text-sm text-muted-foreground">{invoiceData.client.address}</p>
              )}
              <div className="flex items-center mt-2 text-sm">
                <Calendar className="h-4 w-4 mr-1 text-pink-600" />
                <span>Tanggal Acara: {formatDate(invoiceData.client.eventDate)}</span>
              </div>
              <div className="flex items-center mt-1 text-sm">
                <MapPin className="h-4 w-4 mr-1 text-pink-600" />
                <span>Lokasi: {invoiceData.client.location}</span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Rincian Layanan</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-pink-50 text-left">
                    <th className="px-4 py-2 border border-pink-100 text-pink-900">Deskripsi</th>
                    <th className="px-4 py-2 border border-pink-100 text-pink-900">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-3 border border-pink-100">
                      <p className="font-medium">Paket Wedding Organizer</p>
                      <p className="text-sm text-muted-foreground">
                        Termasuk koordinasi acara, dekorasi, dan makeup pengantin
                      </p>
                    </td>
                    <td className="px-4 py-3 border border-pink-100 font-medium">
                      {formatRupiah(invoiceData.basePackagePrice)}
                    </td>
                  </tr>
                  {invoiceData.vendorBookings.map((booking: any) => (
                    <tr key={booking.id}>
                      <td className="px-4 py-3 border border-pink-100">
                        <p className="font-medium">{booking.vendorName}</p>
                        <p className="text-sm text-muted-foreground">{booking.vendorCategory}</p>
                      </td>
                      <td className="px-4 py-3 border border-pink-100 font-medium">{formatRupiah(booking.price)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-pink-50">
                    <td className="px-4 py-3 border border-pink-100 font-semibold text-right">Total</td>
                    <td className="px-4 py-3 border border-pink-100 font-bold text-pink-900">
                      {formatRupiah(invoiceData.totalPrice)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Status Pembayaran</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold text-pink-900">{formatRupiah(invoiceData.totalPrice)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                <p className="text-sm text-muted-foreground">Sudah Dibayar</p>
                <p className="text-xl font-bold text-green-600">{formatRupiah(invoiceData.paidAmount)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                <p className="text-sm text-muted-foreground">Sisa Pembayaran</p>
                <p className="text-xl font-bold text-red-600">{formatRupiah(Math.max(0, invoiceData.remainingAmount))}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Riwayat Pembayaran</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-pink-50 text-left">
                    <th className="px-4 py-2 border border-pink-100 text-pink-900">Tanggal</th>
                    <th className="px-4 py-2 border border-pink-100 text-pink-900">Deskripsi</th>
                    <th className="px-4 py-2 border border-pink-100 text-pink-900">Metode</th>
                    <th className="px-4 py-2 border border-pink-100 text-pink-900">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.paymentHistory.map((payment: PaymentData) => (
                    <tr key={payment.id}>
                      <td className="px-4 py-3 border border-pink-100">{formatDate(payment.tanggal)}</td>
                      <td className="px-4 py-3 border border-pink-100">{payment.keterangan}</td>
                      <td className="px-4 py-3 border border-pink-100">{payment.metodePembayaran}</td>
                      <td className="px-4 py-3 border border-pink-100 font-medium">{formatRupiah(payment.jumlah)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {invoiceData.notes && (
            <>
              <Separator className="my-8" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Catatan Khusus</h3>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                  <p className="text-sm text-muted-foreground">{invoiceData.notes}</p>
                </div>
              </div>
            </>
          )}

          <Separator className="my-8" />

          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-pink-900 mb-2">Catatan:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Pembayaran dapat dilakukan melalui transfer bank ke rekening berikut:</li>
              <li>Bank BCA: 1234567890 a.n. NuansaWedding Office</li>
              <li>Harap menyertakan nomor invoice pada keterangan pembayaran</li>
              <li>Bukti pembayaran dapat dikirimkan melalui WhatsApp ke 081234567890</li>
            </ol>
          </div>
        </CardContent>
        <CardFooter className="bg-pink-50 p-4 text-center text-sm text-muted-foreground">
          Terima kasih telah mempercayakan acara spesial Anda kepada NuansaWedding Office
        </CardFooter>
      </Card>
    </div>
  )
} 