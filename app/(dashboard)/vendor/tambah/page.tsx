"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Plus, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

export default function TambahVendorPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("info")
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    phone: "",
    email: "",
    address: "",
    price: "",
    description: "",
    services: [] as string[],
    notes: "",
    bank: "",
    accountNumber: "",
    accountName: "",
  })
  const [newService, setNewService] = useState("")
  const [portfolio, setPortfolio] = useState<string[]>([])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddService = () => {
    if (newService.trim() === "") return
    setFormData((prev) => ({
      ...prev,
      services: [...prev.services, newService],
    }))
    setNewService("")
  }

  const handleRemoveService = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }))
  }

  const handleAddPortfolio = () => {
    // Simulasi penambahan foto
    setPortfolio([...portfolio, "/placeholder.svg?height=200&width=200"])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulasi penyimpanan data
    console.log({
      ...formData,
      portfolio,
    })
    router.push("/vendor")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-pink-900">Tambah Vendor Baru</h1>
          <p className="text-muted-foreground">Isi informasi vendor dan detail layanan</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-pink-100/50">
          <TabsTrigger value="info" className="data-[state=active]:bg-white">
            Informasi Dasar
          </TabsTrigger>
          <TabsTrigger value="services" className="data-[state=active]:bg-white">
            Layanan & Portfolio
          </TabsTrigger>
          <TabsTrigger value="payment" className="data-[state=active]:bg-white">
            Pembayaran & Catatan
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="info" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-pink-100">
                <CardHeader>
                  <CardTitle>Informasi Vendor</CardTitle>
                  <CardDescription>Masukkan informasi dasar vendor</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Vendor</Label>
                    <Input
                      id="name"
                      placeholder="contoh: John Studio"
                      className="border-pink-200"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange("category", value)}
                      required
                    >
                      <SelectTrigger id="category" className="border-pink-200">
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fotografer">Fotografer</SelectItem>
                        <SelectItem value="MC">MC</SelectItem>
                        <SelectItem value="Band">Band</SelectItem>
                        <SelectItem value="Videografer">Videografer</SelectItem>
                        <SelectItem value="Venue">Venue</SelectItem>
                        <SelectItem value="Catering">Catering</SelectItem>
                        <SelectItem value="MUA Lepas">MUA Lepas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Nomor Telepon</Label>
                    <Input
                      id="phone"
                      placeholder="contoh: 081234567890"
                      className="border-pink-200"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                    />
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
                </CardContent>
              </Card>

              <Card className="border-pink-100">
                <CardHeader>
                  <CardTitle>Detail Lokasi</CardTitle>
                  <CardDescription>Masukkan informasi lokasi vendor</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Alamat</Label>
                    <Textarea
                      id="address"
                      placeholder="Alamat lengkap vendor"
                      className="border-pink-200 resize-none"
                      rows={3}
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Harga</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="contoh: 5000000"
                      className="border-pink-200"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      required
                    />
                    {formData.category === "Catering" && <p className="text-xs text-muted-foreground">Harga per pax</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea
                      id="description"
                      placeholder="Deskripsi singkat tentang vendor dan layanannya"
                      className="border-pink-200 resize-none"
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" className="border-pink-200" onClick={() => router.back()}>
                Batal
              </Button>
              <Button type="button" className="bg-pink-600 hover:bg-pink-700" onClick={() => setActiveTab("services")}>
                Selanjutnya
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle>Layanan yang Ditawarkan</CardTitle>
                <CardDescription>Tambahkan layanan yang ditawarkan oleh vendor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Masukkan layanan"
                    className="border-pink-200"
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                  />
                  <Button type="button" onClick={handleAddService} className="bg-pink-600 hover:bg-pink-700">
                    <Plus className="h-4 w-4 mr-1" /> Tambah
                  </Button>
                </div>

                <div className="space-y-2">
                  {formData.services.length > 0 ? (
                    <div className="space-y-2">
                      {formData.services.map((service, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border border-pink-100 rounded-md"
                        >
                          <span>{service}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveService(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            Hapus
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">Belum ada layanan yang ditambahkan</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-pink-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Portfolio</CardTitle>
                  <CardDescription>Tambahkan foto portfolio vendor</CardDescription>
                </div>
                <Button size="sm" className="bg-pink-600 hover:bg-pink-700" onClick={handleAddPortfolio}>
                  <Plus className="h-4 w-4 mr-1" /> Tambah
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {portfolio.map((photo, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square overflow-hidden rounded-md border border-pink-100 bg-pink-50/50 flex items-center justify-center">
                        <img
                          src={photo || "/placeholder.svg"}
                          alt={`Portfolio ${index + 1}`}
                          className="object-cover h-full w-full"
                        />
                      </div>
                    </div>
                  ))}
                  {portfolio.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-pink-200 rounded-md bg-pink-50/30">
                      <Upload className="h-10 w-10 text-pink-300 mb-2" />
                      <p className="text-sm text-pink-600 font-medium">Klik tombol tambah untuk mengunggah foto</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG atau JPEG hingga 5MB</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" className="border-pink-200" onClick={() => setActiveTab("info")}>
                Kembali
              </Button>
              <Button type="button" className="bg-pink-600 hover:bg-pink-700" onClick={() => setActiveTab("payment")}>
                Selanjutnya
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4">
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle>Informasi Pembayaran</CardTitle>
                <CardDescription>Detail rekening bank untuk pembayaran</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bank">Bank</Label>
                  <Select value={formData.bank} onValueChange={(value) => handleInputChange("bank", value)}>
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
                    placeholder="Masukkan nomor rekening"
                    className="border-pink-200"
                    value={formData.accountNumber}
                    onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountName">Nama Pemilik Rekening</Label>
                  <Input
                    id="accountName"
                    placeholder="Masukkan nama pemilik rekening"
                    className="border-pink-200"
                    value={formData.accountName}
                    onChange={(e) => handleInputChange("accountName", e.target.value)}
                  />
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan Tambahan</Label>
                  <Textarea
                    id="notes"
                    placeholder="Masukkan catatan tambahan tentang vendor"
                    className="border-pink-200 resize-none min-h-[150px]"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-pink-200"
                  onClick={() => setActiveTab("services")}
                >
                  Kembali
                </Button>
                <Button type="submit" className="bg-pink-600 hover:bg-pink-700">
                  Simpan Vendor
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </form>
      </Tabs>
    </div>
  )
}
