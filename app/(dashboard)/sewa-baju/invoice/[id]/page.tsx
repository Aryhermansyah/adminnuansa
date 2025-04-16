"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Download, Printer, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useData } from "@/contexts/data-context"
import { DataLoading } from "@/components/data-loading"

export default function SewaBajuInvoicePage() {
  const params = useParams()
  const router = useRouter()
  const { clients, loading, error } = useData()
  const [invoice, setInvoice] = useState<any | null>(null)

  useEffect(() => {
    // Simulasi data invoice sewa baju
    // Dalam aplikasi nyata, ini akan diambil dari database
    const dressRentals = [
      {
        id: 101,
        client: "Anisa Rahma",
        address: "Jl. Merdeka No. 123, Jakarta Selatan",
        phone: "081234567890",
        email: "anisa@example.com",
        date: new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        items: [
          {
            name: "Gaun Pengantin Putih",
            description: "Gaun pengantin model mermaid dengan ekor panjang",
            price: 2500000,
            quantity: 1,
          },
          {
            name: "Aksesoris Kepala",
            description: "Tiara dan kerudung",
            price: 500000,
            quantity: 1,
          },
          {
            name: "Sepatu Pengantin",
            description: "Sepatu high heels putih",
            price: 500000,
            quantity: 1,
          },
        ],
        status: "Lunas",
        paymentMethod: "Transfer Bank",
        notes: "Pengambilan H-1 acara, pengembalian H+2 acara",
      },
      {
        id: 102,
        client: "Dian Sastro",
        address: "Jl. Sudirman No. 45, Jakarta Pusat",
        phone: "087654321098",
        email: "dian@example.com",
        date: new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        items: [
          {
            name: "Gaun Pesta Merah",
            description: "Gaun pesta model A-line",
            price: 1500000,
            quantity: 1,
          },
          {
            name: "Clutch Bag",
            description: "Tas pesta kecil dengan payet",
            price: 500000,
            quantity: 1,
          },
        ],
        status: "DP 50%",
        paymentMethod: "Transfer Bank",
        notes: "Pengambilan H-1 acara, pengembalian H+1 acara",
      },
      {
        id: 103,
        client: "Raisa Andriana",
        address: "Jl. Gatot Subroto No. 78, Jakarta Selatan",
        phone: "089876543210",
        email: "raisa@example.com",
        date: new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        items: [
          {
            name: "Gaun Pengantin Gold",
            description: "Gaun pengantin model ball gown",
            price: 3000000,
            quantity: 1,
          },
          {
            name: "Aksesoris Lengkap",
            description: "Tiara, kerudung, kalung, anting",
            price: 1000000,
            quantity: 1,
          },
          {
            name: "Sepatu Pengantin",
            description: "Sepatu high heels gold",
            price: 500000,
            quantity: 1,
          },
        ],
        status: "Lunas",
        paymentMethod: "Transfer Bank",
        notes: "Pengambilan H-2 acara, pengembalian H+2 acara",
      },
    ]

    const id = Number(params.id)
    const foundInvoice = dressRentals.find((invoice) => invoice.id === id)

    if (foundInvoice) {
      setInvoice(foundInvoice)
    } else {
      // Jika tidak ditemukan, kembali ke halaman keuangan
      router.push("/keuangan")
    }
  }, [params.id, router])

  // Loading state
  if (loading || !invoice) {
    return <DataLoading title="Memuat Data Invoice" />
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-red-600">Terjadi Kesalahan</h2>
          <p className="text-muted-foreground">{error.message}</p>
          <Button onClick={() => router.push("/keuangan")} className="bg-pink-600 hover:bg-pink-700">
            Kembali
          </Button>
        </div>
      </div>
    )
  }

  // Hitung subtotal
  const subtotal = invoice.items.reduce((total: number, item: any) => total + item.price * item.quantity, 0)

  // Hitung pajak (11%)
  const tax = subtotal * 0.11

  // Hitung total
  const total = subtotal + tax

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
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-pink-900">Invoice Sewa Baju</h1>
            <p className="text-muted-foreground">Detail invoice untuk penyewaan baju</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-pink-200">
            <Printer className="mr-2 h-4 w-4" />
            Cetak
          </Button>
          <Button variant="outline" className="border-pink-200">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button className="bg-pink-600 hover:bg-pink-700">
            <Send className="mr-2 h-4 w-4" />
            Kirim
          </Button>
        </div>
      </div>

      <Card className="border-pink-100">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-pink-900">Invoice #{invoice.id}</CardTitle>
              <CardDescription>Nuansa Wedding Office</CardDescription>
              <div className="mt-4 space-y-1 text-sm">
                <p>Jl. Raya Bogor Km 30</p>
                <p>Jakarta Timur, DKI Jakarta</p>
                <p>Indonesia, 13710</p>
                <p>+62 812-3456-7890</p>
                <p>info@nuansawedding.com</p>
              </div>
            </div>
            <div className="text-right">
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Tanggal Invoice:</span> {invoice.date}
                </p>
                <p>
                  <span className="font-medium">Jatuh Tempo:</span> {invoice.dueDate}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      invoice.status === "Lunas" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {invoice.status}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Metode Pembayaran:</span> {invoice.paymentMethod}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-pink-900">Klien</h3>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{invoice.client}</p>
              <p>{invoice.address}</p>
              <p>{invoice.phone}</p>
              <p>{invoice.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium text-pink-900">Detail Penyewaan</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-pink-100 bg-pink-50/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider">
                      Deskripsi
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-pink-900 uppercase tracking-wider">
                      Harga
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-pink-900 uppercase tracking-wider">
                      Jumlah
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-pink-900 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-100">
                  {invoice.items.map((item: any, index: number) => (
                    <tr key={index} className="hover:bg-pink-50/50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-pink-900">{item.name}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{item.description}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                        {formatRupiah(item.price)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-700">{item.quantity}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-medium text-pink-900">
                        {formatRupiah(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-2">
            <Separator className="my-4 bg-pink-100" />
            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium text-pink-900">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">PPN (11%):</span>
                  <span className="font-medium text-pink-900">{formatRupiah(tax)}</span>
                </div>
                <Separator className="my-2 bg-pink-100" />
                <div className="flex justify-between text-base font-medium">
                  <span className="text-pink-900">Total:</span>
                  <span className="text-pink-900">{formatRupiah(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-pink-900">Catatan</h3>
              <p className="text-sm text-gray-700">{invoice.notes}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t border-pink-100 pt-6">
          <div className="text-sm text-muted-foreground">
            <p>Terima kasih telah mempercayakan kebutuhan baju pesta Anda kepada kami.</p>
            <p>Untuk pertanyaan, silakan hubungi kami di +62 812-3456-7890 atau info@nuansawedding.com</p>
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="font-medium">Instruksi Pembayaran:</p>
            <p>Bank BCA: 1234567890 a/n PT Nuansa Wedding</p>
            <p>Bank Mandiri: 0987654321 a/n PT Nuansa Wedding</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
