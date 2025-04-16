"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Plus, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function TambahKoleksiBajuPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("info")
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    category: "",
    description: "",
    price: "",
    deposit: "",
    condition: "Baru",
    purchaseDate: "",
    purchasePrice: "",
    notes: "",
    measurements: {
      bust: "",
      waist: "",
      hips: "",
      shoulders: "",
      length: "",
      sleeves: "",
      chest: ""
    },
    fittingNotes: ""
  })
  const [sizes, setSizes] = useState<string[]>([])
  const [newSize, setNewSize] = useState("")
  const [colors, setColors] = useState<string[]>([])
  const [newColor, setNewColor] = useState("")
  const [photos, setPhotos] = useState<string[]>([])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleMeasurementChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [field]: value
      }
    }))
  }

  const handleAddSize = () => {
    if (newSize && !sizes.includes(newSize)) {
      setSizes([...sizes, newSize])
      setNewSize("")
    }
  }

  const handleRemoveSize = (size: string) => {
    setSizes(sizes.filter((s) => s !== size))
  }

  const handleAddColor = () => {
    if (newColor && !colors.includes(newColor)) {
      setColors([...colors, newColor])
      setNewColor("")
    }
  }

  const handleRemoveColor = (color: string) => {
    setColors(colors.filter((c) => c !== color))
  }

  const handleAddPhoto = () => {
    // Simulasi penambahan foto
    setPhotos([...photos, "/placeholder.svg?height=300&width=200"])
  }

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.id ||
      !formData.name ||
      !formData.category ||
      !formData.price ||
      !formData.deposit ||
      sizes.length === 0
    ) {
      alert("Mohon lengkapi data yang diperlukan")
      return
    }

    // Simulasi penyimpanan data
    console.log({
      ...formData,
      sizes,
      colors,
      photos,
    })

    // Redirect ke halaman sewa baju
    router.push("/sewa-baju")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-pink-900">Tambah Koleksi Baju</h1>
          <p className="text-muted-foreground">Tambahkan baju baru ke koleksi penyewaan</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-pink-100/50">
          <TabsTrigger value="info" className="data-[state=active]:bg-white">
            Informasi Dasar
          </TabsTrigger>
          <TabsTrigger value="details" className="data-[state=active]:bg-white">
            Detail & Ukuran
          </TabsTrigger>
          <TabsTrigger value="photos" className="data-[state=active]:bg-white">
            Foto & Catatan
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="info" className="space-y-4">
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle>Informasi Dasar</CardTitle>
                <CardDescription>Masukkan informasi dasar baju</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="id">Kode Baju</Label>
                  <Input
                    id="id"
                    placeholder="contoh: WD-001"
                    className="border-pink-200"
                    value={formData.id}
                    onChange={(e) => handleInputChange("id", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Baju</Label>
                  <Input
                    id="name"
                    placeholder="contoh: Gaun Pengantin Putih Mewah"
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
                      <SelectItem value="Wedding Dress">Gaun Pengantin</SelectItem>
                      <SelectItem value="Wedding Suit">Jas Pengantin</SelectItem>
                      <SelectItem value="Prewedding Dress">Gaun Prewedding</SelectItem>
                      <SelectItem value="Evening Dress">Gaun Pesta</SelectItem>
                      <SelectItem value="Traditional">Busana Tradisional</SelectItem>
                      <SelectItem value="Accessories">Aksesoris</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    placeholder="Deskripsi singkat tentang baju"
                    className="border-pink-200 resize-none"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button type="button" variant="outline" className="border-pink-200" onClick={() => router.back()}>
                  Batal
                </Button>
                <Button type="button" className="bg-pink-600 hover:bg-pink-700" onClick={() => setActiveTab("details")}>
                  Selanjutnya
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-pink-100">
                <CardHeader>
                  <CardTitle>Ukuran & Warna</CardTitle>
                  <CardDescription>Tambahkan ukuran dan warna yang tersedia</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Ukuran</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Tambahkan ukuran"
                        className="border-pink-200"
                        value={newSize}
                        onChange={(e) => setNewSize(e.target.value)}
                      />
                      <Button type="button" onClick={handleAddSize} className="bg-pink-600 hover:bg-pink-700">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {sizes.length > 0 ? (
                        sizes.map((size) => (
                          <Badge key={size} variant="outline" className="border-pink-200 py-1 px-2">
                            {size}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 ml-1"
                              onClick={() => handleRemoveSize(size)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Belum ada ukuran yang ditambahkan</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Warna</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Tambahkan warna"
                        className="border-pink-200"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                      />
                      <Button type="button" onClick={handleAddColor} className="bg-pink-600 hover:bg-pink-700">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {colors.length > 0 ? (
                        colors.map((color) => (
                          <Badge key={color} variant="outline" className="border-pink-200 py-1 px-2">
                            {color}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 ml-1"
                              onClick={() => handleRemoveColor(color)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Belum ada warna yang ditambahkan</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 mt-4 pt-4 border-t border-dashed border-pink-100">
                    <h3 className="text-sm font-medium">Detail Ukuran</h3>
                    <p className="text-xs text-muted-foreground">Tambahkan detail ukuran spesifik dalam cm</p>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="bust" className="text-xs">Bust (Dada)</Label>
                        <Input
                          id="bust"
                          placeholder="mis: 88-92 cm"
                          className="border-pink-200"
                          value={formData.measurements.bust}
                          onChange={(e) => handleMeasurementChange('bust', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="waist" className="text-xs">Waist (Pinggang)</Label>
                        <Input
                          id="waist"
                          placeholder="mis: 68-72 cm"
                          className="border-pink-200"
                          value={formData.measurements.waist}
                          onChange={(e) => handleMeasurementChange('waist', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="hips" className="text-xs">Hips (Pinggul)</Label>
                        <Input
                          id="hips"
                          placeholder="mis: 90-94 cm"
                          className="border-pink-200"
                          value={formData.measurements.hips}
                          onChange={(e) => handleMeasurementChange('hips', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="length" className="text-xs">Length (Panjang)</Label>
                        <Input
                          id="length"
                          placeholder="mis: 140 cm"
                          className="border-pink-200"
                          value={formData.measurements.length}
                          onChange={(e) => handleMeasurementChange('length', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="shoulders" className="text-xs">Shoulders (Bahu)</Label>
                        <Input
                          id="shoulders"
                          placeholder="mis: 38-40 cm"
                          className="border-pink-200"
                          value={formData.measurements.shoulders}
                          onChange={(e) => handleMeasurementChange('shoulders', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sleeves" className="text-xs">Sleeves (Lengan)</Label>
                        <Input
                          id="sleeves"
                          placeholder="mis: 64 cm"
                          className="border-pink-200"
                          value={formData.measurements.sleeves}
                          onChange={(e) => handleMeasurementChange('sleeves', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-pink-100">
                <CardHeader>
                  <CardTitle>Harga & Kondisi</CardTitle>
                  <CardDescription>Masukkan informasi harga dan kondisi baju</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Harga Sewa (Rp)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="contoh: 2500000"
                      className="border-pink-200"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deposit">Deposit (Rp)</Label>
                    <Input
                      id="deposit"
                      type="number"
                      placeholder="contoh: 1000000"
                      className="border-pink-200"
                      value={formData.deposit}
                      onChange={(e) => handleInputChange("deposit", e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Deposit akan dikembalikan saat baju dikembalikan dalam kondisi baik
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="condition">Kondisi</Label>
                    <Select value={formData.condition} onValueChange={(value) => handleInputChange("condition", value)}>
                      <SelectTrigger id="condition" className="border-pink-200">
                        <SelectValue placeholder="Pilih kondisi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Baru">Baru</SelectItem>
                        <SelectItem value="Sangat Baik">Sangat Baik</SelectItem>
                        <SelectItem value="Baik">Baik</SelectItem>
                        <SelectItem value="Cukup Baik">Cukup Baik</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchaseDate">Tanggal Pembelian</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      className="border-pink-200"
                      value={formData.purchaseDate}
                      onChange={(e) => handleInputChange("purchaseDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchasePrice">Harga Beli (Rp)</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      placeholder="contoh: 5000000"
                      className="border-pink-200"
                      value={formData.purchasePrice}
                      onChange={(e) => handleInputChange("purchasePrice", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" className="border-pink-200" onClick={() => setActiveTab("info")}>
                Kembali
              </Button>
              <Button type="button" className="bg-pink-600 hover:bg-pink-700" onClick={() => setActiveTab("photos")}>
                Selanjutnya
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="photos" className="space-y-4">
            <Card className="border-pink-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Foto Baju</CardTitle>
                  <CardDescription>Tambahkan foto baju dari berbagai sisi</CardDescription>
                </div>
                <Button size="sm" className="bg-pink-600 hover:bg-pink-700" onClick={handleAddPhoto}>
                  <Plus className="h-4 w-4 mr-1" /> Tambah Foto
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-[3/4] overflow-hidden rounded-md border border-pink-100 bg-pink-50/50 flex items-center justify-center">
                        <img
                          src={photo || "/placeholder.svg"}
                          alt={`Foto Baju ${index + 1}`}
                          className="object-cover h-full w-full"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemovePhoto(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {photos.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-pink-200 rounded-md bg-pink-50/30">
                      <Upload className="h-10 w-10 text-pink-300 mb-2" />
                      <p className="text-sm text-pink-600 font-medium">Klik tombol tambah untuk mengunggah foto</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG atau JPEG hingga 5MB</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle>Catatan Tambahan</CardTitle>
                <CardDescription>Tambahkan catatan khusus tentang baju</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fittingNotes">Catatan Fitting</Label>
                  <Textarea
                    id="fittingNotes"
                    placeholder="Catatan untuk fitting baju, misalnya: Terdapat belahan tinggi, model terbuka, material tidak stretch, dll."
                    className="border-pink-200 resize-none"
                    rows={3}
                    value={formData.fittingNotes}
                    onChange={(e) => handleInputChange('fittingNotes', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Catatan ini akan ditampilkan di bawah foto baju untuk membantu klien dalam fitting
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan Internal</Label>
                  <Textarea
                    id="notes"
                    placeholder="Catatan tambahan tentang baju (hanya untuk internal)"
                    className="border-pink-200 resize-none"
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  className="border-pink-200"
                  onClick={() => setActiveTab("details")}
                >
                  Kembali
                </Button>
                <Button type="submit" className="bg-pink-600 hover:bg-pink-700">
                  Simpan Koleksi
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </form>
      </Tabs>
    </div>
  )
}
