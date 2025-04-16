"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Plus } from "lucide-react"
import { DBService } from "@/lib/db/db-service"
import { useToast } from "@/components/ui/use-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function TambahTimPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("info")
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    status: "",
    phone: "",
    email: "",
    address: "",
    joinDate: "",
    skills: "",
    notes: "",
    bank: "",
    accountNumber: "",
    accountName: "",
  })
  const [avatar, setAvatar] = useState("/placeholder.svg?height=40&width=40")

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validasi form
      if (!formData.name || !formData.role || !formData.status || !formData.phone) {
        toast({
          title: "Validasi gagal",
          description: "Harap isi semua field yang wajib diisi: Nama, Posisi, Status, dan Nomor Telepon",
          variant: "destructive",
        });
        return;
      }
      
      // Persiapkan data anggota tim
      const teamMemberData = {
        ...formData,
        skills: formData.skills ? formData.skills.split(",").map((skill) => skill.trim()) : [],
        avatar
      };
      
      // Log data untuk debugging
      console.log("Data tim yang akan disimpan:", teamMemberData);
      
      // Simpan ke database
      const dbService = DBService.getInstance();
      const teamMemberId = await dbService.add('team', teamMemberData);
      
      console.log("Anggota tim berhasil disimpan dengan ID:", teamMemberId);
      
      if (teamMemberId && teamMemberId > 0) {
        // Tampilkan notifikasi sukses
        toast({
          title: "Anggota tim berhasil ditambahkan",
          description: `${formData.name} telah berhasil ditambahkan sebagai anggota tim dengan ID: ${teamMemberId}`,
          variant: "default",
        });
        
        // Navigasi ke halaman daftar tim
        setTimeout(() => {
          router.push("/tim-vendor");
        }, 1500);
      } else {
        throw new Error("Gagal mendapatkan ID anggota tim yang valid");
      }
    } catch (error) {
      console.error("Error menyimpan anggota tim:", error);
      toast({
        title: "Gagal menambahkan anggota tim",
        description: "Terjadi kesalahan saat menyimpan data anggota tim: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-pink-900">Tambah Anggota Tim</h1>
          <p className="text-muted-foreground">Isi informasi anggota tim baru</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-pink-100/50">
          <TabsTrigger value="info" className="data-[state=active]:bg-white">
            Informasi Pribadi
          </TabsTrigger>
          <TabsTrigger value="skills" className="data-[state=active]:bg-white">
            Keahlian & Catatan
          </TabsTrigger>
          <TabsTrigger value="payment" className="data-[state=active]:bg-white">
            Pembayaran
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="info" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-pink-100">
                <CardHeader>
                  <CardTitle>Informasi Pribadi</CardTitle>
                  <CardDescription>Masukkan informasi dasar anggota tim</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={avatar || "/placeholder.svg"} alt="Avatar" />
                        <AvatarFallback className="bg-pink-200 text-pink-700 text-xl">
                          {formData.name ? formData.name[0] : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        type="button"
                        size="sm"
                        className="absolute bottom-0 right-0 rounded-full bg-pink-600 hover:bg-pink-700 h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama</Label>
                    <Input
                      id="name"
                      placeholder="Masukkan nama lengkap"
                      className="border-pink-200"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Posisi</Label>
                    <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)} required>
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
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange("status", value)}
                      required
                    >
                      <SelectTrigger id="status" className="border-pink-200">
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tetap">Tetap</SelectItem>
                        <SelectItem value="Freelance">Freelance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-pink-100">
                <CardHeader>
                  <CardTitle>Kontak</CardTitle>
                  <CardDescription>Masukkan informasi kontak</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone_v2">Nomor Telepon</Label>
                    <div className="flex">
                      <div className="flex items-center justify-center px-3 border border-r-0 rounded-l-md border-pink-200 bg-gray-50 text-sm text-gray-500">
                        +62
                      </div>
                      <Input
                        id="phone_v2"
                        placeholder="8123456789 (tanpa angka 0 di depan)"
                        className="border-pink-200 rounded-l-none"
                        value={formData.phone}
                        onChange={(e) => {
                          // Hapus non-digit dan 0 di depan jika ada
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.startsWith('0')) {
                            value = value.substring(1);
                          }
                          handleInputChange("phone", value);
                        }}
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="text-green-500">✓</span> 
                      Format: +62 diikuti nomor tanpa angka 0 di depan (contoh: 812xxxx bukan 0812xxxx)
                    </p>
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
                  <div className="space-y-2">
                    <Label htmlFor="address">Alamat</Label>
                    <Textarea
                      id="address"
                      placeholder="Alamat lengkap"
                      className="border-pink-200 resize-none"
                      rows={3}
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="joinDate">Tanggal Bergabung</Label>
                    <Input
                      id="joinDate"
                      placeholder="contoh: 15 Januari 2022"
                      className="border-pink-200"
                      value={formData.joinDate}
                      onChange={(e) => handleInputChange("joinDate", e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" className="border-pink-200" onClick={() => router.back()}>
                Batal
              </Button>
              <Button type="button" className="bg-pink-600 hover:bg-pink-700" onClick={() => setActiveTab("skills")}>
                Selanjutnya
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4">
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle>Keahlian & Catatan</CardTitle>
                <CardDescription>Masukkan keahlian dan catatan tambahan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="skills">Keahlian (pisahkan dengan koma)</Label>
                  <Textarea
                    id="skills"
                    placeholder="contoh: Makeup Natural, Makeup Bold, Hairdo"
                    className="border-pink-200 resize-none"
                    rows={3}
                    value={formData.skills}
                    onChange={(e) => handleInputChange("skills", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan</Label>
                  <Textarea
                    id="notes"
                    placeholder="Catatan tambahan tentang anggota tim"
                    className="border-pink-200 resize-none"
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                  />
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
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-pink-200"
                  onClick={() => setActiveTab("skills")}
                >
                  Kembali
                </Button>
                <Button type="submit" className="bg-pink-600 hover:bg-pink-700">
                  Simpan
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </form>
      </Tabs>
    </div>
  )
}
