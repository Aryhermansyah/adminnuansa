"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Calendar, MapPin, Phone, Mail, Home, Edit, Plus, Check, Trash2, MessageSquare, Camera, Upload, AlertTriangle, X, Eye, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useData } from "@/contexts/data-context"
import { DataLoading } from "@/components/data-loading"
import type { Client, Event, VendorBooking, Vendor } from "@/lib/db/db-service"
import { useToast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

// Memperluas tipe Event untuk termasuk properti teamMember
type ExtendedEvent = Event & {
  title?: string;
  teamMemberName?: string;
  teamMemberRole?: string;
  date?: string; // Untuk kompatibilitas ke belakang
}

export function ClientDetailClient({ clientId }: { clientId: number }) {
  const router = useRouter()
  const { clients, events, vendorBookings, vendors, isLoading, error, refreshData, deleteEvent, deleteVendorBooking } = useData()
  const [activeTab, setActiveTab] = useState("info")
  const { toast } = useToast()
  
  // State untuk data keuangan/invoice
  const [invoiceData, setInvoiceData] = useState({
    totalHarga: 0,
    downPayment: 0,
    sisaPembayaran: 0,
    statusPembayaran: "Belum Lunas",
    catatanPembayaran: ""
  });

  // State untuk termin pembayaran
  const [terminPembayaran, setTerminPembayaran] = useState<Array<{
    id: number;
    tanggal: string;
    jumlah: number;
    metodePembayaran: string;
    keterangan: string;
    buktiPembayaran?: string;
  }>>([]);

  // State untuk form pembayaran baru
  const [newPayment, setNewPayment] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    jumlah: 0,
    metodePembayaran: "Transfer Bank",
    keterangan: "",
    buktiPembayaran: ""
  });

  // State untuk bukti pembayaran
  const [paymentProofImage, setPaymentProofImage] = useState<string | null>(null);
  const paymentFileInputRef = useRef<HTMLInputElement>(null);

  // State untuk data fitting baju
  const [fittingData, setFittingData] = useState({
    namaBaju: "",
    gender: "",
    bust: "",
    waist: "",
    hips: "",
    shoulders: "",
    length: "",
    sleeves: "",
    fittingNotes: ""
  })
  
  // Array ukuran baju standar
  const standardSizes = ["XS", "S", "M", "L", "XL", "XXL"]
  const [selectedSize, setSelectedSize] = useState("")
  
  // State untuk foto fitting
  const [fittingPhotos, setFittingPhotos] = useState<string[]>([])
  
  // State untuk streaming kamera
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // State untuk daftar baju yang tersimpan
  const [savedClothes, setSavedClothes] = useState<Array<{
    id: number;
    namaBaju: string;
    ukuran: string;
    bust: string;
    waist: string;
    hips: string;
    shoulders: string;
    length: string;
    sleeves: string;
    fittingNotes: string;
    gender?: string;
  }>>([])
  
  // State untuk detail tambahan
  const [detailData, setDetailData] = useState({
    readyDekorasi: "",
    manggulan: "",
    soundNyala: "",
    soundNyalaJam: "",
    soundMati: "",
    soundMatiJam: "",
    kirimGerabah: "",
    kirimJenang: "",
    pembongkaran: "",
    panggungPanjang: "",
    panggungLebar: "",
    tendaDapurPanjang: "",
    tendaDapurLebar: "",
    kursiTamu: "",
    meja: "",
    kembarMayang: "",
    alatPrasmanan: "",
    gerabah: "",
    customBarang: [{ nama: "", jumlah: "" }]
  })
  
  // State untuk field yang sedang dalam mode edit
  const [editingFields, setEditingFields] = useState<Record<string, boolean>>({})
  
  // State untuk data ukuran tenda
  const [tendaData, setTendaData] = useState({
    panjang: "",
    lebar: "",
    jenis: "",
    catatan: ""
  })
  
  // State untuk daftar tenda yang tersimpan
  const [listTenda, setListTenda] = useState<Array<{
    id: number;
    panjang: string;
    lebar: string;
    jenis: string;
    catatan: string;
  }>>([])
  
  // Timeout untuk auto-save
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null)
  
  // Tambah state untuk modal preview baju
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedCloth, setSelectedCloth] = useState<(typeof savedClothes)[0] | null>(null)
  
  // Refresh data when component mounts
  useEffect(() => {
    refreshData(true)
    // Load data tenda saat komponen mount
    loadTendaData()
    // Load data detail tambahan
    loadDetailData()
    // Load data fitting baju
    loadFittingData()
    // Load data keuangan
    loadInvoiceData()
    // Load data termin pembayaran
    loadTerminPembayaran()
  }, [refreshData])
  
  // Cek parameter tab di URL dan atur activeTab
  useEffect(() => {
    // Dapatkan parameter tab dari URL
    const searchParams = new URLSearchParams(window.location.search)
    const tabParam = searchParams.get('tab')
    
    // Atur activeTab jika parameter ada
    if (tabParam && ['info', 'events', 'vendors', 'design', 'keuangan'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [])

  // Get client data
  const client = clients?.find((c) => c.id === clientId)

  // Get client events
  const clientEvents = events?.filter((e) => e.clientId === clientId) || [] as ExtendedEvent[]

  // Get client vendor bookings
  const clientVendorBookings = vendorBookings?.filter((b) => b.clientId === clientId) || []

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

  // Generate WhatsApp link for team member
  const generateWhatsAppLink = (event: ExtendedEvent) => {
    if (!event.teamMemberName || !client) return "#";
    
    // Check if event has phone number from team member
    // For now we will use a workaround as we don't store the phone in event
    // In a real implementation, either store the phone in event or fetch from team data
    
    // Generate a message for the team member
    const message = encodeURIComponent(
      `Hallo ${event.teamMemberName}, konfirmasi jadwal makeup untuk acara ${event.type} klien ${client.name} pada tanggal ${formatDate(event.eventDate)} jam ${event.time} di ${event.location}.`
    );
    
    // For demo purposes, we'll just use a placeholder phone number if not available
    // Typically, you would fetch the team member's phone number from your database
    const phoneNumber = "6281234567890"; // Replace with actual team member phone lookup
    
    return `https://wa.me/${phoneNumber}?text=${message}`;
  };

  // Handle event deletion
  const handleDeleteEvent = async (eventId: number) => {
    try {
      if (confirm("Anda yakin ingin menghapus jadwal ini?")) {
        await deleteEvent(eventId);
        toast({
          title: "Jadwal berhasil dihapus",
          description: "Jadwal makeup telah dihapus dari sistem",
          variant: "default",
        });
        refreshData(true);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Gagal menghapus jadwal",
        description: "Terjadi kesalahan saat menghapus jadwal",
        variant: "destructive",
      });
    }
  };

  // Generate WhatsApp link for vendor
  const generateVendorWhatsAppLink = (booking: VendorBooking, vendor?: Vendor) => {
    if (!vendor || !client) return "#";
    
    // Check if vendor has a phone number
    if (!vendor.phone) {
      return "#";
    }
    
    // Format phone number (remove any non-digit characters and ensure it starts with proper format)
    let phoneNumber = vendor.phone.replace(/\D/g, "");
    if (phoneNumber.startsWith("0")) {
      phoneNumber = "62" + phoneNumber.substring(1);
    } else if (!phoneNumber.startsWith("62")) {
      phoneNumber = "62" + phoneNumber;
    }
    
    // Create message template
    const message = encodeURIComponent(
      `Hallo ${vendor.name}, konfirmasi booking ${vendor.category} untuk acara ${client.eventType} klien ${client.name} pada tanggal ${formatDate(booking.eventDate)}. Mohon konfirmasi ketersediaan.`
    );
    
    return `https://wa.me/${phoneNumber}?text=${message}`;
  };

  // Handle vendor booking deletion
  const handleDeleteVendorBooking = async (bookingId: number) => {
    try {
      if (confirm("Anda yakin ingin menghapus pesanan vendor ini?")) {
        await deleteVendorBooking(bookingId);
        toast({
          title: "Pesanan vendor berhasil dihapus",
          description: "Pesanan vendor telah dihapus dari sistem",
          variant: "default",
        });
        refreshData(true);
      }
    } catch (error) {
      console.error("Error deleting vendor booking:", error);
      toast({
        title: "Gagal menghapus pesanan vendor",
        description: "Terjadi kesalahan saat menghapus pesanan vendor",
        variant: "destructive",
      });
    }
  };

  // Handle auto-save for detail tambahan
  const handleDetailChange = (field: string, value: string) => {
    setDetailData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear previous timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }
    
    // Set new timeout for auto-save
    const timeout = setTimeout(() => {
      saveDetailData({
        ...detailData,
        [field]: value
      })
      
      // Exit edit mode for this field after saving
      if (editingFields[field]) {
        setEditingFields(prev => ({
          ...prev,
          [field]: false
        }))
      }
    }, 1000) // 1 second delay for debounce
    
    setSaveTimeout(timeout)
  }
  
  // Handle auto-save for nested objects (custom barang)
  const handleCustomBarangChange = (index: number, field: string, value: string) => {
    const updatedCustomBarang = [...detailData.customBarang]
    updatedCustomBarang[index] = {
      ...updatedCustomBarang[index],
      [field]: value
    }
    
    setDetailData(prev => ({
      ...prev,
      customBarang: updatedCustomBarang
    }))
    
    // Clear previous timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }
    
    // Set new timeout for auto-save
    const timeout = setTimeout(() => {
      saveDetailData({
        ...detailData,
        customBarang: updatedCustomBarang
      })
    }, 1000) // 1 second delay for debounce
    
    setSaveTimeout(timeout)
  }
  
  // Add new custom barang item
  const addCustomBarang = () => {
    const updatedCustomBarang = [...detailData.customBarang, { nama: "", jumlah: "" }]
    
    setDetailData(prev => ({
      ...prev,
      customBarang: updatedCustomBarang
    }))
    
    // Auto-save
    saveDetailData({
      ...detailData,
      customBarang: updatedCustomBarang
    })
  }
  
  // Remove custom barang item
  const removeCustomBarang = (index: number) => {
    const updatedCustomBarang = detailData.customBarang.filter((_, i) => i !== index)
    
    setDetailData(prev => ({
      ...prev,
      customBarang: updatedCustomBarang
    }))
    
    // Auto-save
    saveDetailData({
      ...detailData,
      customBarang: updatedCustomBarang
    })
  }
  
  // Function to actually save the data
  const saveDetailData = async (data: typeof detailData) => {
    try {
      // In a real app, you'd make an API call here to save the data
      // For example: await updateClientDetail(clientId, data)
      
      // Simpan data ke localStorage untuk mencegah kehilangan data saat refresh
      localStorage.setItem(`detail-${clientId}`, JSON.stringify(data))
      
      // Show mini toast notification
      toast({
        title: "Data tersimpan",
        description: "Detail tambahan berhasil disimpan otomatis",
        variant: "default",
        duration: 2000,
      })
    } catch (error) {
      console.error("Error saving detail data:", error)
      toast({
        title: "Gagal menyimpan data",
        description: "Terjadi kesalahan saat menyimpan detail tambahan",
        variant: "destructive",
      })
    }
  }
  
  // Function to load detail data from localStorage
  const loadDetailData = () => {
    try {
      const savedData = localStorage.getItem(`detail-${clientId}`)
      if (savedData) {
        setDetailData(JSON.parse(savedData))
      }
    } catch (error) {
      console.error("Error loading detail data:", error)
    }
  }
  
  // Fungsi untuk memuat data tenda dari database
  const loadTendaData = async () => {
    try {
      // Di implementasi sebenarnya, panggil API untuk mendapatkan data
      // Contoh: const response = await fetch(`/api/clients/${clientId}/tenda`);
      // const data = await response.json();
      
      // Coba ambil data dari localStorage terlebih dahulu
      const savedTendaData = localStorage.getItem(`tenda-list-${clientId}`)
      if (savedTendaData) {
        setListTenda(JSON.parse(savedTendaData))
        return
      }
      
      // Jika tidak ada data di localStorage, gunakan data dummy
      // Dalam implementasi nyata, data ini akan berasal dari database
      setListTenda([
        {
          id: 1,
          panjang: "4",
          lebar: "6",
          jenis: "Tenda Dekorasi",
          catatan: "Untuk area utama"
        }
      ])
    } catch (error) {
      console.error("Error loading tenda data:", error)
      toast({
        title: "Gagal memuat data tenda",
        description: "Terjadi kesalahan saat memuat data ukuran tenda",
        variant: "destructive",
      })
    }
  }
  
  // Handle perubahan input tenda
  const handleTendaChange = (field: string, value: string) => {
    setTendaData(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  // Fungsi untuk menyimpan data tenda
  const saveTendaData = async () => {
    try {
      // Validasi input
      if (!tendaData.panjang || !tendaData.lebar || !tendaData.jenis) {
        toast({
          title: "Input tidak lengkap",
          description: "Mohon lengkapi data panjang, lebar, dan jenis tenda",
          variant: "destructive",
        })
        return
      }
      
      // Di implementasi sebenarnya, panggil API untuk menyimpan data
      // Contoh: await fetch(`/api/clients/${clientId}/tenda`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(tendaData)
      // });
      
      // Generate ID unik untuk data baru
      const newId = Math.max(0, ...listTenda.map(t => t.id)) + 1
      
      // Tambahkan data baru ke list
      const newTenda = {
        id: newId,
        ...tendaData
      }
      
      const updatedList = [...listTenda, newTenda];
      setListTenda(updatedList)
      
      // Simpan data ke localStorage
      localStorage.setItem(`tenda-list-${clientId}`, JSON.stringify(updatedList))
      
      // Reset form
      setTendaData({
        panjang: "",
        lebar: "",
        jenis: "",
        catatan: ""
      })
      
      toast({
        title: "Data tenda tersimpan",
        description: "Data ukuran tenda berhasil ditambahkan",
        variant: "default",
      })
    } catch (error) {
      console.error("Error saving tenda data:", error)
      toast({
        title: "Gagal menyimpan data tenda",
        description: "Terjadi kesalahan saat menyimpan data ukuran tenda",
        variant: "destructive",
      })
    }
  }
  
  // Fungsi untuk menghapus data tenda
  const deleteTendaData = async (id: number) => {
    try {
      if (confirm("Anda yakin ingin menghapus data tenda ini?")) {
        // Di implementasi sebenarnya, panggil API untuk menghapus data
        // Contoh: await fetch(`/api/clients/${clientId}/tenda/${id}`, {
        //   method: 'DELETE'
        // });
        
        // Hapus data dari list
        const updatedList = listTenda.filter(tenda => tenda.id !== id);
        setListTenda(updatedList)
        
        // Update localStorage
        localStorage.setItem(`tenda-list-${clientId}`, JSON.stringify(updatedList))
        
        toast({
          title: "Data tenda dihapus",
          description: "Data ukuran tenda berhasil dihapus",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Error deleting tenda data:", error)
      toast({
        title: "Gagal menghapus data tenda",
        description: "Terjadi kesalahan saat menghapus data ukuran tenda",
        variant: "destructive",
      })
    }
  }
  
  // State untuk mengedit tenda
  const [editingTenda, setEditingTenda] = useState<number | null>(null)
  
  // Fungsi untuk memulai edit tenda
  const startEditTenda = (tenda: typeof listTenda[0]) => {
    setEditingTenda(tenda.id)
    setTendaData({
      panjang: tenda.panjang,
      lebar: tenda.lebar,
      jenis: tenda.jenis,
      catatan: tenda.catatan
    })
  }
  
  // Fungsi untuk update data tenda
  const updateTendaData = async () => {
    try {
      if (!editingTenda) return
      
      // Validasi input
      if (!tendaData.panjang || !tendaData.lebar || !tendaData.jenis) {
        toast({
          title: "Input tidak lengkap",
          description: "Mohon lengkapi data panjang, lebar, dan jenis tenda",
          variant: "destructive",
        })
        return
      }
      
      // Di implementasi sebenarnya, panggil API untuk update data
      // Contoh: await fetch(`/api/clients/${clientId}/tenda/${editingTenda}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(tendaData)
      // });
      
      // Update data di list
      const updatedList = listTenda.map(tenda => 
        tenda.id === editingTenda ? { ...tenda, ...tendaData } : tenda
      )
      
      setListTenda(updatedList)
      
      // Update localStorage
      localStorage.setItem(`tenda-list-${clientId}`, JSON.stringify(updatedList))
      
      // Reset form dan editing state
      setTendaData({
        panjang: "",
        lebar: "",
        jenis: "",
        catatan: ""
      })
      setEditingTenda(null)
      
      toast({
        title: "Data tenda diperbarui",
        description: "Data ukuran tenda berhasil diperbarui",
        variant: "default",
      })
    } catch (error) {
      console.error("Error updating tenda data:", error)
      toast({
        title: "Gagal memperbarui data tenda",
        description: "Terjadi kesalahan saat memperbarui data ukuran tenda",
        variant: "destructive",
      })
    }
  }
  
  // Fungsi untuk membatalkan edit
  const cancelEdit = () => {
    setEditingTenda(null)
    setTendaData({
      panjang: "",
      lebar: "",
      jenis: "",
      catatan: ""
    })
  }

  // Toggle edit mode for a field
  const toggleEditField = (field: string) => {
    setEditingFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  // Check if a field has value
  const hasValue = (field: string) => {
    return detailData[field as keyof typeof detailData] !== ""
  }

  // Render input field with appropriate state
  const renderInputField = (field: string, label: string, inputType = "text", placeholder = "") => {
    const isEditing = editingFields[field] || !hasValue(field)
    const fieldValue = detailData[field as keyof typeof detailData] as string
    
    return (
      <div className="space-y-2">
        <Label htmlFor={field}>{label}</Label>
        <div className="relative">
          <Input 
            type={inputType}
            id={field}
            className={`${hasValue(field) && !isEditing ? 'bg-green-50 border-green-200 text-green-700 font-semibold' : 'border-pink-200'}`}
            placeholder={placeholder}
            value={fieldValue}
            onChange={(e) => handleDetailChange(field, e.target.value)}
            disabled={!isEditing && hasValue(field)}
          />
          {hasValue(field) && !isEditing && (
            <>
              <div className="absolute inset-y-0 right-10 flex items-center pr-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="absolute inset-y-0 right-0 h-full px-2 text-black hover:text-gray-700"
                onClick={() => toggleEditField(field)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </Button>
            </>
          )}
        </div>
      </div>
    )
  }

  // Handle perubahan data fitting baju
  const handleFittingChange = (field: string, value: string) => {
    setFittingData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Auto-save setelah perubahan
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }
    
    const timeout = setTimeout(() => {
      saveFittingData({
        ...fittingData,
        [field]: value
      })
    }, 1000)
    
    setSaveTimeout(timeout)
  }
  
  // Simpan data fitting baju
  const saveFittingData = async (data: typeof fittingData) => {
    try {
      // Simulasi penyimpanan ke API
      // await fetch(`/api/clients/${clientId}/fitting`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // })
      
      // Simpan ke localStorage untuk persistensi data
      localStorage.setItem(`fitting-${clientId}`, JSON.stringify(data))
      
      toast({
        title: "Data tersimpan",
        description: "Ukuran baju berhasil disimpan",
        variant: "default",
        duration: 2000,
      })
    } catch (error) {
      console.error("Error saving fitting data:", error)
      toast({
        title: "Gagal menyimpan data",
        description: "Terjadi kesalahan saat menyimpan ukuran baju",
        variant: "destructive",
      })
    }
  }
  
  // Load data fitting baju
  const loadFittingData = () => {
    try {
      // Load formulir data
      const savedData = localStorage.getItem(`fitting-${clientId}`)
      if (savedData) {
        setFittingData(JSON.parse(savedData))
      }
      
      // Load daftar baju
      const savedClothesList = localStorage.getItem(`clothes-list-${clientId}`)
      if (savedClothesList) {
        setSavedClothes(JSON.parse(savedClothesList))
      }
    } catch (error) {
      console.error("Error loading fitting data:", error)
    }
  }
  
  // Fungsi untuk upload foto dari penyimpanan internal
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      console.log("Tidak ada file yang dipilih");
      return;
    }
    
    const file = files[0];
    
    // Validasi tipe file
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      console.error("Tipe file tidak valid:", file.type);
      toast({
        title: "Format Tidak Didukung",
        description: "Silakan unggah gambar dalam format JPG, PNG, GIF, atau WebP",
        variant: "destructive",
      });
      return;
    }
    
    // Validasi ukuran file (maks 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.error("Ukuran file terlalu besar:", file.size);
      toast({
        title: "File Terlalu Besar",
        description: "Ukuran gambar maksimal adalah 5MB",
        variant: "destructive",
      });
      return;
    }
    
    // Baca dan proses file
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        // Buat gambar untuk mendapatkan dimensi
        const img = new Image();
        img.onload = () => {
          try {
            // Buat canvas untuk memproses gambar
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              throw new Error("Tidak dapat membuat context canvas");
            }
            
            // Atur ukuran canvas - jaga aspek rasio, maks 1280px
            let width = img.width;
            let height = img.height;
            const maxDimension = 1280;
            
            if (width > height && width > maxDimension) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else if (height > maxDimension) {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Gambar ke canvas
            ctx.drawImage(img, 0, 0, width, height);
            
            // Konversi ke format yang lebih kecil
            const compressedImage = canvas.toDataURL('image/jpeg', 0.8);
            
            // Tambahkan ke state
            setFittingPhotos(prevPhotos => {
              const newPhotos = [...prevPhotos, compressedImage];
              
              // Simpan ke localStorage
              try {
                localStorage.setItem(`fitting-photos-${clientId}`, JSON.stringify(newPhotos));
                console.log(`Berhasil menyimpan ${newPhotos.length} foto`);
              } catch (storageError) {
                console.error("Error menyimpan ke localStorage:", storageError);
                toast({
                  title: "Peringatan",
                  description: "Foto berhasil diunggah tetapi gagal disimpan ke penyimpanan lokal",
                  variant: "default",
                });
              }
              
              return newPhotos;
            });
            
            toast({
              title: "Berhasil",
              description: "Foto berhasil diunggah dan ditambahkan ke galeri",
              variant: "default",
              duration: 2000,
            });
          } catch (error) {
            console.error("Error memproses gambar:", error);
            toast({
              title: "Error",
              description: "Gagal memproses gambar yang diunggah",
              variant: "destructive",
            });
          }
        };
        
        img.onerror = () => {
          console.error("Error membaca gambar");
          toast({
            title: "Error",
            description: "Gagal memuat gambar yang diunggah",
            variant: "destructive",
          });
        };
        
        img.src = result;
      } else {
        console.error("Hasil bukan string");
        toast({
          title: "Error",
          description: "Gagal mengunggah foto",
          variant: "destructive",
        });
      }
    };
    
    reader.onerror = () => {
      console.error("Error membaca file");
      toast({
        title: "Error",
        description: "Gagal membaca file gambar",
        variant: "destructive",
      });
    };
    
    // Mulai membaca file
    try {
      reader.readAsDataURL(file);
    } catch (readError) {
      console.error("Error membaca file:", readError);
      toast({
        title: "Error",
        description: "Gagal membaca file gambar",
        variant: "destructive",
      });
    }
    
    // Reset input file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Fungsi untuk menambahkan foto fitting baju
  const addFittingPhoto = () => {
    console.log("Memicu dialog unggah foto");
    // Buka dialog pemilihan file
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error("File input reference tidak ditemukan");
      toast({
        title: "Error",
        description: "Tidak dapat membuka dialog unggah file",
        variant: "destructive",
      });
    }
  };

  // Fungsi untuk menyimpan foto fitting ke localStorage
  const saveFittingPhotos = () => {
    try {
      console.log("Menyimpan foto...", fittingPhotos.length);
      if (fittingPhotos.length > 0) {
        const storageKey = `fitting-photos-${clientId}`;
        const dataToStore = JSON.stringify(fittingPhotos);
        localStorage.setItem(storageKey, dataToStore);
        console.log(`Berhasil menyimpan ${fittingPhotos.length} foto dengan kunci: ${storageKey}`);
      }
    } catch (error) {
      console.error("Error saving fitting photos:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan foto ke penyimpanan lokal",
        variant: "destructive",
      });
    }
  };

  // Fungsi untuk memuat foto fitting dari localStorage
  const loadFittingPhotos = () => {
    try {
      const storageKey = `fitting-photos-${clientId}`;
      const savedPhotos = localStorage.getItem(storageKey);
      console.log(`Memuat foto dari kunci: ${storageKey}`);
      
      if (savedPhotos) {
        try {
          const parsedPhotos = JSON.parse(savedPhotos);
          console.log(`Berhasil memuat ${parsedPhotos.length} foto`);
          setFittingPhotos(parsedPhotos);
        } catch (parseError) {
          console.error("Error parsing JSON dari localStorage:", parseError);
          toast({
            title: "Error",
            description: "Format data foto tidak valid",
            variant: "destructive",
          });
        }
      } else {
        console.log("Tidak ada foto tersimpan untuk client ini");
        setFittingPhotos([]);
      }
    } catch (error) {
      console.error("Error loading fitting photos:", error);
      toast({
        title: "Error",
        description: "Gagal memuat foto dari penyimpanan lokal",
        variant: "destructive",
      });
    }
  };

  // Memuat foto saat komponen mount
  useEffect(() => {
    console.log(`UseEffect: memuat foto fitting untuk client ID: ${clientId}`);
    loadFittingPhotos();
  }, [clientId]);

  // Simpan foto ketika berubah - tidak diperlukan lagi karena kita menyimpan langsung setelah perubahan
  // useEffect(() => {
  //   if (fittingPhotos.length > 0) {
  //     console.log("UseEffect: menyimpan foto fitting", fittingPhotos.length);
  //     saveFittingPhotos();
  //   }
  // }, [fittingPhotos]);

  // Fungsi untuk menampilkan preview baju
  const showPreview = (cloth: typeof savedClothes[0]) => {
    setSelectedCloth(cloth)
    setPreviewOpen(true)
  }

  // Loading state
  if (isLoading || !client) {
    return <DataLoading title="Memuat Data Klien" />
  }

  // Error state
  if (error || !client) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-red-600">Terjadi Kesalahan</h2>
          <p className="text-muted-foreground">{error?.message || "Klien tidak ditemukan"}</p>
          <Button onClick={() => router.push("/klien")} className="bg-pink-600 hover:bg-pink-700">
            Kembali ke Daftar Klien
          </Button>
        </div>
      </div>
    )
  }

  // Perbaikan untuk menghapus foto fitting
  const removePhoto = (index: number) => {
    try {
      setFittingPhotos(prevPhotos => {
        const newPhotos = prevPhotos.filter((_, i) => i !== index);
        console.log(`Menghapus foto, total sekarang: ${newPhotos.length}`);
        
        // Simpan langsung ke localStorage
        try {
          localStorage.setItem(`fitting-photos-${clientId}`, JSON.stringify(newPhotos));
          console.log(`Foto berhasil disimpan setelah penghapusan: ${newPhotos.length} foto`);
        } catch (storageError) {
          console.error("Error menyimpan ke localStorage setelah penghapusan:", storageError);
        }
        
        return newPhotos;
      });
      
      toast({
        title: "Foto dihapus",
        description: "Foto berhasil dihapus dari galeri",
        variant: "default",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error menghapus foto:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus foto",
        variant: "destructive",
      });
    }
  };

  // Fungsi untuk membuka kamera dan mengambil foto
  const startCamera = () => {
    console.log("Memulai kamera...");
    
    // Periksa apakah browser mendukung API MediaDevices
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("Browser tidak mendukung API MediaDevices");
      toast({
        title: "Browser Tidak Didukung",
        description: "Browser Anda tidak mendukung akses kamera. Silakan gunakan upload file sebagai alternatif.",
        variant: "destructive",
        duration: 5000,
      });
      // Fallback ke upload file
      addFittingPhoto();
      return;
    }
    
    // Buat elemen video dan canvas
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      console.error("Tidak dapat membuat context canvas");
      toast({
        title: "Error",
        description: "Browser tidak mendukung canvas 2D. Silakan gunakan upload file sebagai alternatif.",
        variant: "destructive",
        duration: 5000,
      });
      // Fallback ke upload file
      addFittingPhoto();
      return;
    }
    
    // Atur dimensi video dan canvas
    video.width = 640;
    video.height = 480;
    canvas.width = 640;
    canvas.height = 480;
    
    // Coba akses kamera
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then((stream) => {
        console.log("Kamera berhasil diakses");
        video.srcObject = stream;
        video.play();
        
        // Tampilkan dialog kamera (bisa ditambahkan UI kustom di sini)
        const cameraDialog = document.createElement('div');
        cameraDialog.style.position = 'fixed';
        cameraDialog.style.top = '0';
        cameraDialog.style.left = '0';
        cameraDialog.style.width = '100%';
        cameraDialog.style.height = '100%';
        cameraDialog.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        cameraDialog.style.zIndex = '9999';
        cameraDialog.style.display = 'flex';
        cameraDialog.style.flexDirection = 'column';
        cameraDialog.style.alignItems = 'center';
        cameraDialog.style.justifyContent = 'center';
        
        // Tambahkan video ke dialog
        video.style.maxWidth = '100%';
        video.style.maxHeight = '70vh';
        video.style.borderRadius = '8px';
        cameraDialog.appendChild(video);
        
        // Tambahkan tombol untuk mengambil foto
        const captureButton = document.createElement('button');
        captureButton.textContent = 'Ambil Foto';
        captureButton.style.backgroundColor = '#ec4899';
        captureButton.style.color = 'white';
        captureButton.style.border = 'none';
        captureButton.style.borderRadius = '4px';
        captureButton.style.padding = '10px 20px';
        captureButton.style.margin = '20px 10px';
        captureButton.style.fontSize = '16px';
        captureButton.style.cursor = 'pointer';
        
        // Tambahkan tombol untuk membatalkan
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Batal';
        cancelButton.style.backgroundColor = '#6b7280';
        cancelButton.style.color = 'white';
        cancelButton.style.border = 'none';
        cancelButton.style.borderRadius = '4px';
        cancelButton.style.padding = '10px 20px';
        cancelButton.style.margin = '20px 10px';
        cancelButton.style.fontSize = '16px';
        cancelButton.style.cursor = 'pointer';
        
        // Container untuk tombol
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'center';
        buttonContainer.appendChild(captureButton);
        buttonContainer.appendChild(cancelButton);
        cameraDialog.appendChild(buttonContainer);
        
        // Tambahkan dialog ke body
        document.body.appendChild(cameraDialog);
        
        // Fungsi untuk mengambil foto
        captureButton.onclick = () => {
          if (context) {
            try {
              // Gambar frame video ke canvas
              context.drawImage(video, 0, 0, canvas.width, canvas.height);
              
              // Konversi canvas ke data URL
              const imageData = canvas.toDataURL('image/jpeg', 0.8);
              
              // Tambahkan foto ke state
              setFittingPhotos(prevPhotos => {
                const newPhotos = [...prevPhotos, imageData];
                
                // Simpan ke localStorage
                try {
                  localStorage.setItem(`fitting-photos-${clientId}`, JSON.stringify(newPhotos));
                  console.log(`Berhasil menyimpan ${newPhotos.length} foto`);
                } catch (storageError) {
                  console.error("Error menyimpan ke localStorage:", storageError);
                  toast({
                    title: "Peringatan",
                    description: "Foto berhasil diambil tetapi gagal disimpan ke penyimpanan lokal",
                    variant: "default",
                  });
                }
                
                return newPhotos;
              });
              
              toast({
                title: "Foto berhasil diambil",
                description: "Foto telah ditambahkan ke galeri",
                variant: "default",
                duration: 2000,
              });
            } catch (error) {
              console.error("Error mengkonversi canvas ke data URL:", error);
              toast({
                title: "Error",
                description: "Gagal memproses gambar dari kamera",
                variant: "destructive",
              });
            }
          }
          
          // Hentikan stream kamera
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
          
          // Hapus dialog
          document.body.removeChild(cameraDialog);
        };
        
        // Fungsi untuk membatalkan
        cancelButton.onclick = () => {
          // Hentikan stream kamera
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
          
          // Hapus dialog
          document.body.removeChild(cameraDialog);
          
          toast({
            title: "Dibatalkan",
            description: "Pengambilan foto dibatalkan",
            variant: "default",
            duration: 2000,
          });
        };
      })
      .catch((error) => {
        console.error("Error mengakses kamera:", error);
        
        // Pesan error yang lebih spesifik berdasarkan jenis kesalahan
        let errorMessage = "Gagal mengakses kamera.";
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          errorMessage = "Akses kamera ditolak. Silakan berikan izin untuk menggunakan kamera.";
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          errorMessage = "Kamera tidak ditemukan. Pastikan perangkat Anda memiliki kamera yang berfungsi.";
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
          errorMessage = "Kamera sedang digunakan oleh aplikasi lain. Tutup aplikasi tersebut dan coba lagi.";
        } else if (error.name === 'OverconstrainedError') {
          errorMessage = "Persyaratan kamera tidak dapat dipenuhi. Coba dengan pengaturan yang berbeda.";
        } else if (error.name === 'TypeError') {
          errorMessage = "Jenis constraint kamera tidak valid.";
        } else if (error.name === 'AbortError') {
          errorMessage = "Operasi kamera dibatalkan.";
        } else if (error.name === 'SecurityError') {
          errorMessage = "Penggunaan kamera diblokir karena alasan keamanan.";
        }
        
        toast({
          title: "Error Kamera",
          description: `${errorMessage} Menggunakan upload file sebagai alternatif.`,
          variant: "destructive",
          duration: 5000,
        });
        
        // Tunggu sebentar sebelum melakukan fallback
        setTimeout(() => {
          // Fallback ke upload file
          addFittingPhoto();
        }, 1000);
      });
  };

  // Load data keuangan
  const loadInvoiceData = () => {
    try {
      const savedData = localStorage.getItem(`invoiceData_${clientId}`);
      if (savedData) {
        setInvoiceData(JSON.parse(savedData));
      } else {
        // Initialize with default values
        const clientVendorBookingsTotal = clientVendorBookings.reduce((total, booking) => total + booking.price, 0);
        const totalHarga = 15000000 + clientVendorBookingsTotal; // Base package + vendor bookings
        
        setInvoiceData({
          totalHarga: totalHarga,
          downPayment: 0,
          sisaPembayaran: totalHarga,
          statusPembayaran: "Belum Lunas",
          catatanPembayaran: ""
        });
        
        // Save the initial data
        localStorage.setItem(`invoiceData_${clientId}`, JSON.stringify({
          totalHarga: totalHarga,
          downPayment: 0,
          sisaPembayaran: totalHarga,
          statusPembayaran: "Belum Lunas",
          catatanPembayaran: ""
        }));
      }
    } catch (error) {
      console.error("Error loading invoice data:", error);
    }
  };

  // Load data termin pembayaran
  const loadTerminPembayaran = () => {
    try {
      const savedData = localStorage.getItem(`terminPembayaran_${clientId}`);
      if (savedData) {
        setTerminPembayaran(JSON.parse(savedData));
      }
    } catch (error) {
      console.error("Error loading termin pembayaran:", error);
    }
  };

  // Handle perubahan pada form invoice
  const handleInvoiceChange = (field: string, value: any) => {
    setInvoiceData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto calculate sisa pembayaran
      if (field === 'totalHarga' || field === 'downPayment') {
        const totalPaid = terminPembayaran.reduce((total, payment) => total + payment.jumlah, 0);
        newData.sisaPembayaran = newData.totalHarga - totalPaid;
        newData.statusPembayaran = newData.sisaPembayaran <= 0 ? "Lunas" : "Belum Lunas";
      }
      
      // Save to localStorage
      localStorage.setItem(`invoiceData_${clientId}`, JSON.stringify(newData));
      return newData;
    });
  };

  // Handle perubahan pada form pembayaran baru
  const handleNewPaymentChange = (field: string, value: any) => {
    setNewPayment(prev => ({ ...prev, [field]: value }));
  };

  // Handle unggah bukti pembayaran
  const handlePaymentProofUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPaymentProofImage(result);
        setNewPayment(prev => ({ ...prev, buktiPembayaran: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Tambah pembayaran baru
  const addNewPayment = () => {
    if (newPayment.jumlah <= 0) {
      toast({
        title: "Jumlah pembayaran tidak valid",
        description: "Jumlah pembayaran harus lebih dari 0",
        variant: "destructive",
      });
      return;
    }
    
    const newId = terminPembayaran.length > 0 
      ? Math.max(...terminPembayaran.map(p => p.id)) + 1 
      : 1;
      
    const newTermin = [
      ...terminPembayaran,
      {
        id: newId,
        tanggal: newPayment.tanggal,
        jumlah: newPayment.jumlah,
        metodePembayaran: newPayment.metodePembayaran,
        keterangan: newPayment.keterangan,
        buktiPembayaran: newPayment.buktiPembayaran
      }
    ];
    
    setTerminPembayaran(newTermin);
    
    // Update total pembayaran dan sisa
    const totalPaid = newTermin.reduce((total, payment) => total + payment.jumlah, 0);
    const sisaPembayaran = invoiceData.totalHarga - totalPaid;
    const newStatus = sisaPembayaran <= 0 ? "Lunas" : "Belum Lunas";
    
    setInvoiceData(prev => ({
      ...prev,
      sisaPembayaran: sisaPembayaran,
      statusPembayaran: newStatus
    }));
    
    // Save to localStorage
    localStorage.setItem(`terminPembayaran_${clientId}`, JSON.stringify(newTermin));
    localStorage.setItem(`invoiceData_${clientId}`, JSON.stringify({
      ...invoiceData,
      sisaPembayaran: sisaPembayaran,
      statusPembayaran: newStatus
    }));
    
    // Reset form
    setNewPayment({
      tanggal: new Date().toISOString().split('T')[0],
      jumlah: 0,
      metodePembayaran: "Transfer Bank",
      keterangan: "",
      buktiPembayaran: ""
    });
    setPaymentProofImage(null);
    
    toast({
      title: "Pembayaran berhasil ditambahkan",
      description: `Pembayaran sebesar ${formatRupiah(newPayment.jumlah)} berhasil dicatat`,
      variant: "default",
    });
  };

  // Hapus pembayaran
  const deletePayment = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus pembayaran ini?")) {
      const updatedPayments = terminPembayaran.filter(payment => payment.id !== id);
      setTerminPembayaran(updatedPayments);
      
      // Update total pembayaran dan sisa
      const totalPaid = updatedPayments.reduce((total, payment) => total + payment.jumlah, 0);
      const sisaPembayaran = invoiceData.totalHarga - totalPaid;
      const newStatus = sisaPembayaran <= 0 ? "Lunas" : "Belum Lunas";
      
      setInvoiceData(prev => ({
        ...prev,
        sisaPembayaran: sisaPembayaran,
        statusPembayaran: newStatus
      }));
      
      // Save to localStorage
      localStorage.setItem(`terminPembayaran_${clientId}`, JSON.stringify(updatedPayments));
      localStorage.setItem(`invoiceData_${clientId}`, JSON.stringify({
        ...invoiceData,
        sisaPembayaran: sisaPembayaran,
        statusPembayaran: newStatus
      }));
      
      toast({
        title: "Pembayaran berhasil dihapus",
        description: "Data pembayaran telah dihapus dari sistem",
        variant: "default",
      });
    }
  };

  // Generate Invoice PDF
  const generateInvoice = () => {
    router.push(`/klien/${clientId}/invoice`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
            <p className="text-muted-foreground">{client.eventType} - {formatDate(client.eventDate)}</p>
          </div>
        </div>
        <Button onClick={() => router.push(`/klien/${clientId}/edit`)} className="bg-pink-600 hover:bg-pink-700">
          <Edit className="h-4 w-4 mr-2" /> Edit Klien
        </Button>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Informasi Klien</TabsTrigger>
          <TabsTrigger value="events">Make Up Freelance</TabsTrigger>
          <TabsTrigger value="vendors">Vendor</TabsTrigger>
          <TabsTrigger value="design">Detail Acara</TabsTrigger>
          <TabsTrigger value="keuangan">Keuangan</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle>Informasi Dasar</CardTitle>
                <CardDescription>Detail informasi klien</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-pink-600" />
                    <span className="font-medium">Nomor Telepon:</span>
                    <span className="ml-2">{client.phone}</span>
                  </div>
                  {client.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-pink-600" />
                      <span className="font-medium">Email:</span>
                      <span className="ml-2">{client.email}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-start">
                      <Home className="h-4 w-4 mr-2 text-pink-600 mt-1" />
                      <span className="font-medium">Alamat:</span>
                      <span className="ml-2">{client.address}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-pink-600" />
                    <span className="font-medium">Tanggal Acara:</span>
                    <span className="ml-2">{formatDate(client.eventDate)}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-pink-600" />
                    <span className="font-medium">Lokasi Acara:</span>
                    <span className="ml-2">{client.location}</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium mb-2">Layanan yang Dibutuhkan:</h3>
                  <div className="flex flex-wrap gap-2">
                    {client.services && client.services.length > 0 ? (
                      client.services.map((service: string, index: number) => (
                        <Badge key={index} variant="outline" className="border-pink-200 text-pink-800">
                          {service}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Belum ada layanan yang dipilih</p>
                    )}
                  </div>
                </div>

                {client.budget && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium mb-2">Budget:</h3>
                      <p className="text-lg font-semibold text-pink-900">{formatRupiah(client.budget)}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle>Status Klien</CardTitle>
                <CardDescription>Status dan informasi pembayaran</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Status:</h3>
                  <Badge className={
                    client.status === "lead" ? "bg-gray-200 text-gray-800" :
                    client.status === "prospect" ? "bg-blue-100 text-blue-800" :
                    client.status === "booked" ? "bg-green-100 text-green-800" :
                    client.status === "completed" ? "bg-purple-100 text-purple-800" :
                    "bg-red-100 text-red-800"
                  }>
                    {client.status === "lead" ? "Lead" :
                     client.status === "prospect" ? "Prospect" :
                     client.status === "booked" ? "Booked" :
                     client.status === "completed" ? "Completed" :
                     client.status === "cancelled" ? "Cancelled" : "Unknown"}
                  </Badge>
                </div>

                {(client as any).package && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium mb-2">Paket:</h3>
                      <Badge variant="outline" className="border-pink-200 text-pink-800">
                        {(client as any).package}
                      </Badge>
                    </div>
                  </>
                )}

                {client.notes && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium mb-2">Catatan:</h3>
                      <p className="text-sm text-muted-foreground">{client.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Make Up Freelance</h2>
            <Button className="bg-pink-600 hover:bg-pink-700" onClick={() => router.push(`/klien/${clientId}/jadwal-acara`)}>
              <Plus className="h-4 w-4 mr-2" /> Tambah Jadwal Make Up
            </Button>
          </div>

          {clientEvents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {clientEvents.map((event: any, index: number) => (
                <Card key={index} className="border-pink-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{(event as any).title || `${(event as any).type} - ${(event as any).teamMemberName || 'Tim Makeup'}`}</CardTitle>
                    <CardDescription>{formatDate((event as any).eventDate || ((event as any).date || ''))}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 pb-2">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-pink-600" />
                      <span className="font-medium">Waktu:</span>
                      <span className="ml-2">{event.time}</span>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 text-pink-600 mt-1" />
                      <span className="font-medium">Lokasi:</span>
                      <span className="ml-2">{event.location}</span>
                    </div>
                    {(event as any).teamMemberName && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-pink-600" />
                        <span className="font-medium">MUA:</span>
                        <span className="ml-2">{(event as any).teamMemberName} - {(event as any).teamMemberRole || 'Tim Internal'}</span>
                      </div>
                    )}
                    {event.services && event.services.length > 0 && (
                      <div>
                        <span className="font-medium">Layanan:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {event.services.map((service: string, index: number) => (
                            <Badge key={index} variant="outline" className="border-pink-200 text-pink-800">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {event.notes && (
                      <div>
                        <p className="text-sm text-muted-foreground mt-2">{event.notes}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleDeleteEvent(event.id || 0)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="flex-1 border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
                      asChild
                    >
                      <a 
                        href={generateWhatsAppLink(event as ExtendedEvent)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-pink-100">
              <CardContent className="py-6">
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground">Belum ada jadwal make up yang ditambahkan</p>
                  <Button className="bg-pink-600 hover:bg-pink-700" onClick={() => router.push(`/klien/${clientId}/jadwal-acara`)}>
                    <Plus className="h-4 w-4 mr-2" /> Tambah Jadwal Make Up
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Vendor Booking</h2>
            <Button className="bg-pink-600 hover:bg-pink-700" onClick={() => router.push(`/klien/${clientId}/vendor`)}>
              <Plus className="h-4 w-4 mr-2" /> Book Vendor
            </Button>
          </div>

          {clientVendorBookings.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {clientVendorBookings.map((booking) => {
                const vendor = vendors?.find(v => v.id === booking.vendorId);
                return (
                  <Card key={booking.id} className="border-pink-100">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <div>
                          <CardTitle className="text-lg">{booking.vendorName}</CardTitle>
                          <CardDescription>{booking.vendorCategory}</CardDescription>
                        </div>
                        <Badge className={
                          booking.status === "confirmed" ? "bg-green-100 text-green-800" :
                          booking.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          booking.status === "cancelled" ? "bg-red-100 text-red-800" : 
                          "bg-gray-100 text-gray-800"
                        }>
                          {booking.status === "confirmed" ? "Confirmed" :
                           booking.status === "pending" ? "Pending" :
                           booking.status === "cancelled" ? "Cancelled" : booking.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 pb-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-pink-600" />
                        <span className="font-medium">Tanggal Acara:</span>
                        <span className="ml-2">{formatDate(booking.eventDate)}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-pink-600" />
                        <span className="font-medium">Harga:</span>
                        <span className="ml-2">{formatRupiah(booking.price)}</span>
                      </div>
                      
                      {vendor && vendor.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-pink-600" />
                          <span className="font-medium">Kontak:</span>
                          <span className="ml-2">{vendor.phone}</span>
                        </div>
                      )}
                      
                      {booking.notes && (
                        <div>
                          <p className="text-sm text-muted-foreground mt-2">{booking.notes}</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleDeleteVendorBooking(booking.id || 0)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="flex-1 border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
                        asChild
                      >
                        <a 
                          href={generateVendorWhatsAppLink(booking, vendor as any)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="border-pink-100">
              <CardContent className="py-6">
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground">Belum ada vendor yang di-booking</p>
                  <Button className="bg-pink-600 hover:bg-pink-700" onClick={() => router.push(`/klien/${clientId}/vendor`)}>
                    <Plus className="h-4 w-4 mr-2" /> Book Vendor
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="design" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Data Client</h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {/* Detail Acara */}
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle>Detail Acara</CardTitle>
                <CardDescription>Semua informasi tentang acara client</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Informasi Dasar:</h3>
                  <div className="pl-4 space-y-1">
                    <p className="text-sm"><span className="font-medium">Jenis Acara:</span> {client.eventType}</p>
                    <p className="text-sm"><span className="font-medium">Tanggal:</span> {formatDate(client.eventDate)}</p>
                    <p className="text-sm"><span className="font-medium">Lokasi:</span> {client.location}</p>
                    {client.budget && (
                      <p className="text-sm"><span className="font-medium">Budget:</span> {formatRupiah(client.budget)}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Tim Makeup:</h3>
                  <div className="pl-4">
                    {clientEvents.length > 0 ? (
                      <ul className="space-y-2">
                        {clientEvents.map((event, idx) => (
                          <li key={idx} className="text-sm">
                            {event.teamMemberName || "Tidak ada"} - {event.teamMemberRole || ""}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">Belum ada tim makeup yang ditugaskan</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Vendor yang Ditugaskan:</h3>
                  <div className="pl-4">
                    {clientVendorBookings.length > 0 ? (
                      <ul className="space-y-2">
                        {clientVendorBookings.map((booking, idx) => (
                          <li key={idx} className="text-sm">
                            {booking.vendorName} - {booking.vendorCategory}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">Belum ada vendor yang ditugaskan</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fitur Fitting Baju */}
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle>Fitting Baju</CardTitle>
                <CardDescription>Upload foto dan ukuran baju untuk fitting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="border-pink-200 hover:border-pink-300 h-20"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs">Upload Foto</span>
                    </div>
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileUpload}
                  />
                </div>
                
                {/* Gallery Foto */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Foto Fitting Baju</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {fittingPhotos.length > 0 ? (
                      fittingPhotos.map((photo, index) => (
                        <div key={index} className="relative aspect-square bg-gray-100 rounded-md overflow-hidden">
                          <img src={photo} alt={`Foto fitting ${index + 1}`} className="w-full h-full object-cover" />
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="absolute top-1 right-1 h-6 w-6 rounded-full"
                            onClick={() => {
                              const updatedPhotos = [...fittingPhotos];
                              updatedPhotos.splice(index, 1);
                              setFittingPhotos(updatedPhotos);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center">
                        <p className="text-xs text-muted-foreground">Belum ada foto</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator className="my-2" />
                
                {/* Ukuran Baju Standar */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Ukuran Baju Standar</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {standardSizes.map(size => (
                      <Badge 
                        key={size} 
                        variant={selectedSize === size ? "default" : "outline"} 
                        className={selectedSize === size ? "bg-pink-600" : "border-pink-200 hover:border-pink-300 cursor-pointer"}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Nama/Jenis Baju */}
                <div className="space-y-2">
                  <Label htmlFor="namaBaju" className="text-sm">Nama/Jenis Baju</Label>
                  <Input 
                    id="namaBaju" 
                    className="border-pink-200" 
                    placeholder="mis: Kebaya Akad, Gaun Resepsi, dll" 
                    value={fittingData.namaBaju}
                    onChange={(e) => handleFittingChange('namaBaju', e.target.value)}
                  />
                </div>
                
                {/* Gender */}
                <div className="space-y-2">
                  <Label className="text-sm">Jenis Kelamin</Label>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="gender-male" 
                        name="gender" 
                        value="laki-laki" 
                        checked={fittingData.gender === "laki-laki"} 
                        onChange={(e) => handleFittingChange('gender', e.target.value)}
                        className="text-pink-600 border-pink-200 focus:ring-pink-500"
                      />
                      <Label htmlFor="gender-male" className="cursor-pointer">Laki-laki</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="gender-female" 
                        name="gender" 
                        value="perempuan" 
                        checked={fittingData.gender === "perempuan"} 
                        onChange={(e) => handleFittingChange('gender', e.target.value)}
                        className="text-pink-600 border-pink-200 focus:ring-pink-500"
                      />
                      <Label htmlFor="gender-female" className="cursor-pointer">Perempuan</Label>
                    </div>
                  </div>
                </div>
                
                {/* Catatan Fitting */}
                <div>
                  <Label htmlFor="fitting-notes">Catatan Fitting</Label>
                  <Textarea 
                    id="fitting-notes" 
                    className="border-pink-200 mt-1" 
                    placeholder="Catatan tentang fitting baju, preferensi klien, dsb."
                    rows={3}
                    value={fittingData.fittingNotes}
                    onChange={(e) => handleFittingChange('fittingNotes', e.target.value)}
                  />
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-xs text-muted-foreground">
                      Data tersimpan otomatis saat diubah
                    </p>
                    <Button 
                      className="bg-pink-600 hover:bg-pink-700"
                      onClick={() => {
                        // Simpan data fitting baju
                        saveFittingData(fittingData);
                        
                        // Tambahkan ke list pakaian
                        const newId = Math.max(0, ...savedClothes.map(c => c.id)) + 1;
                        const newClothes = {
                          id: newId,
                          ...fittingData,
                          ukuran: selectedSize
                        };
                        
                        const updatedClothesList = [...savedClothes, newClothes];
                        setSavedClothes(updatedClothesList);
                        
                        // Simpan daftar pakaian ke localStorage
                        localStorage.setItem(`clothes-list-${clientId}`, JSON.stringify(updatedClothesList));
                        
                        // Tampilkan preview baju yang baru ditambahkan
                        setTimeout(() => {
                          showPreview(newClothes);
                        }, 500);
                        
                        // Reset form untuk baju berikutnya
                        setFittingData({
                          namaBaju: "",
                          gender: "",
                          bust: "",
                          waist: "",
                          hips: "",
                          shoulders: "",
                          length: "",
                          sleeves: "",
                          fittingNotes: ""
                        });
                        setSelectedSize("");
                        
                        // Notifikasi
                        toast({
                          title: "Data baju disimpan",
                          description: `${fittingData.namaBaju || "Baju baru"} berhasil disimpan`,
                          variant: "default",
                          duration: 2000,
                        });
                      }}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Simpan & Preview
                    </Button>
                  </div>
                </div>
                
                {/* Daftar Baju yang Tersimpan */}
                <Separator className="my-4" />
                <div>
                  <h3 className="text-sm font-medium mb-2">Daftar Baju yang Tersimpan</h3>
                  <div className="border rounded-md border-pink-100">
                    <table className="min-w-full divide-y divide-pink-100">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-pink-900">Nama Baju</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-pink-900">Ukuran</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-pink-900">Jenis Kelamin</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-pink-900">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-pink-100">
                        {savedClothes.length > 0 ? (
                          savedClothes.map((cloth) => (
                            <tr key={cloth.id} className="hover:bg-pink-50/50 cursor-pointer" onClick={() => showPreview(cloth)}>
                              <td className="px-4 py-2 text-sm">{cloth.namaBaju}</td>
                              <td className="px-4 py-2 text-sm">
                                {cloth.ukuran ? cloth.ukuran : 
                                 (cloth.bust || cloth.waist || cloth.hips) ? "Custom" : "-"}
                              </td>
                              <td className="px-4 py-2 text-sm capitalize">
                                {cloth.gender || "-"}
                              </td>
                              <td className="px-4 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-pink-600"
                                  onClick={() => {
                                    // Isi form dengan data baju yang dipilih
                                    setFittingData({
                                      namaBaju: cloth.namaBaju,
                                      gender: cloth.gender || "",
                                      bust: cloth.bust,
                                      waist: cloth.waist,
                                      hips: cloth.hips,
                                      shoulders: cloth.shoulders,
                                      length: cloth.length,
                                      sleeves: cloth.sleeves,
                                      fittingNotes: cloth.fittingNotes
                                    });
                                    setSelectedSize(cloth.ukuran);
                                    
                                    toast({
                                      title: "Data baju dimuat",
                                      description: `Data ${cloth.namaBaju} berhasil dimuat ke form`,
                                      variant: "default",
                                      duration: 2000,
                                    });
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-red-600"
                                  onClick={() => {
                                    // Hapus baju dari daftar
                                    const updatedList = savedClothes.filter(c => c.id !== cloth.id);
                                    setSavedClothes(updatedList);
                                    
                                    // Update localStorage
                                    localStorage.setItem(`clothes-list-${clientId}`, JSON.stringify(updatedList));
                                    
                                    toast({
                                      title: "Data baju dihapus",
                                      description: `${cloth.namaBaju} berhasil dihapus dari daftar`,
                                      variant: "default",
                                      duration: 2000,
                                    });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-600"
                                  onClick={() => showPreview(cloth)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-4 text-center text-sm text-muted-foreground">
                              Belum ada data baju. Silakan tambahkan data baru.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Moodboard Dekorasi */}
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle>Moodboard Dekorasi</CardTitle>
                <CardDescription>Upload foto inspirasi dekorasi</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full border-pink-200 hover:border-pink-300 py-8">
                  <div className="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                    </svg>
                    <span>Upload Foto Referensi</span>
                  </div>
                </Button>
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Moodboard</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Foto moodboard akan muncul di sini ketika diunggah */}
                    <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center">
                      <p className="text-xs text-muted-foreground">Belum ada foto</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Ukuran Tenda */}
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle>Data Ukuran Tenda</CardTitle>
                <CardDescription>Input ukuran tenda secara manual</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tenda-panjang">Panjang (m)</Label>
                    <Input 
                      id="tenda-panjang" 
                      className="border-pink-200" 
                      placeholder="0"
                      value={tendaData.panjang}
                      onChange={(e) => handleTendaChange('panjang', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tenda-lebar">Lebar (m)</Label>
                    <Input 
                      id="tenda-lebar" 
                      className="border-pink-200" 
                      placeholder="0"
                      value={tendaData.lebar}
                      onChange={(e) => handleTendaChange('lebar', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tenda-jenis">Jenis Tenda</Label>
                  <Input 
                    id="tenda-jenis" 
                    className="border-pink-200" 
                    placeholder="Masukkan jenis tenda"
                    value={tendaData.jenis}
                    onChange={(e) => handleTendaChange('jenis', e.target.value)}
                  />
                </div>

                <Separator className="my-2" />
                
                <div>
                  <Label htmlFor="tenda-catatan">Catatan Tambahan</Label>
                  <Textarea 
                    id="tenda-catatan" 
                    className="border-pink-200" 
                    placeholder="Catatan tentang kebutuhan tenda..."
                    value={tendaData.catatan}
                    onChange={(e) => handleTendaChange('catatan', e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  {editingTenda ? (
                    <>
                      <Button 
                        variant="outline" 
                        className="border-pink-200"
                        onClick={cancelEdit}
                      >
                        Batal
                      </Button>
                      <Button 
                        className="bg-pink-600 hover:bg-pink-700"
                        onClick={updateTendaData}
                      >
                        Update
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        className="border-pink-200"
                        onClick={() => setTendaData({
                          panjang: "",
                          lebar: "",
                          jenis: "",
                          catatan: ""
                        })}
                      >
                        Reset
                      </Button>
                      <Button 
                        className="bg-pink-600 hover:bg-pink-700"
                        onClick={saveTendaData}
                      >
                        Simpan
                      </Button>
                    </>
                  )}
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Daftar Ukuran Tenda</h3>
                  <div className="border rounded-md border-pink-100">
                    <table className="min-w-full divide-y divide-pink-100">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-pink-900">Jenis</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-pink-900">Ukuran</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-pink-900">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-pink-100">
                        {listTenda.length > 0 ? (
                          listTenda.map((tenda) => (
                            <tr key={tenda.id}>
                              <td className="px-4 py-2 text-sm">{tenda.jenis}</td>
                              <td className="px-4 py-2 text-sm">{tenda.panjang} x {tenda.lebar} m</td>
                              <td className="px-4 py-2 text-right">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-pink-600"
                                  onClick={() => startEditTenda(tenda)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-red-600"
                                  onClick={() => deleteTendaData(tenda.id)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="px-4 py-4 text-center text-sm text-muted-foreground">
                              Belum ada data tenda. Silakan tambahkan data baru.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-6">
                  <h3 className="font-medium bg-pink-50 p-2 rounded-lg text-pink-900">
                    Detail Tambahan
                    <span className="text-xs text-pink-600 ml-2 font-normal italic">Tersimpan otomatis</span>
                  </h3>

                  {/* Ready Dekorasi */}
                  {renderInputField('readyDekorasi', 'Ready Dekorasi', 'date')}
                  
                  {/* Manggulan */}
                  {renderInputField('manggulan', 'Manggulan', 'date')}
                  
                  {/* Sound System */}
                  <div className="space-y-2">
                    <Label>Sound System</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sound-nyala" className="text-xs">Tanggal Nyala</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="relative">
                            <Input 
                              type="date" 
                              id="sound-nyala" 
                              className={`${hasValue('soundNyala') && !editingFields['soundNyala'] ? 'bg-green-50 border-green-200 text-green-700 font-semibold' : 'border-pink-200'}`}
                              value={detailData.soundNyala}
                              onChange={(e) => handleDetailChange('soundNyala', e.target.value)}
                              disabled={!editingFields['soundNyala'] && hasValue('soundNyala')}
                            />
                            {hasValue('soundNyala') && !editingFields['soundNyala'] && (
                              <>
                                <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="relative">
                            <Input 
                              type="time" 
                              id="sound-nyala-jam" 
                              className={`${hasValue('soundNyalaJam') && !editingFields['soundNyalaJam'] ? 'bg-green-50 border-green-200 text-green-700 font-semibold' : 'border-pink-200'}`}
                              value={detailData.soundNyalaJam}
                              onChange={(e) => handleDetailChange('soundNyalaJam', e.target.value)}
                              disabled={!editingFields['soundNyalaJam'] && hasValue('soundNyalaJam')}
                            />
                            {hasValue('soundNyalaJam') && !editingFields['soundNyalaJam'] && (
                              <>
                                <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        {(hasValue('soundNyala') || hasValue('soundNyalaJam')) && !(editingFields['soundNyala'] || editingFields['soundNyalaJam']) && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="text-black hover:text-gray-700 h-7 px-2 mt-1"
                            onClick={() => {
                              toggleEditField('soundNyala');
                              toggleEditField('soundNyalaJam');
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            <span className="text-xs">Edit</span>
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sound-mati" className="text-xs">Tanggal Mati</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="relative">
                            <Input 
                              type="date" 
                              id="sound-mati" 
                              className={`${hasValue('soundMati') && !editingFields['soundMati'] ? 'bg-green-50 border-green-200 text-green-700 font-semibold' : 'border-pink-200'}`}
                              value={detailData.soundMati}
                              onChange={(e) => handleDetailChange('soundMati', e.target.value)}
                              disabled={!editingFields['soundMati'] && hasValue('soundMati')}
                            />
                            {hasValue('soundMati') && !editingFields['soundMati'] && (
                              <>
                                <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="relative">
                            <Input 
                              type="time" 
                              id="sound-mati-jam" 
                              className={`${hasValue('soundMatiJam') && !editingFields['soundMatiJam'] ? 'bg-green-50 border-green-200 text-green-700 font-semibold' : 'border-pink-200'}`}
                              value={detailData.soundMatiJam}
                              onChange={(e) => handleDetailChange('soundMatiJam', e.target.value)}
                              disabled={!editingFields['soundMatiJam'] && hasValue('soundMatiJam')}
                            />
                            {hasValue('soundMatiJam') && !editingFields['soundMatiJam'] && (
                              <>
                                <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        {(hasValue('soundMati') || hasValue('soundMatiJam')) && !(editingFields['soundMati'] || editingFields['soundMatiJam']) && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="text-black hover:text-gray-700 h-7 px-2 mt-1"
                            onClick={() => {
                              toggleEditField('soundMati');
                              toggleEditField('soundMatiJam');
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            <span className="text-xs">Edit</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Pengiriman */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderInputField('kirimGerabah', 'Kirim Gerabah', 'date')}
                    {renderInputField('kirimJenang', 'Kirim Jenang', 'date')}
                  </div>
                  
                  {/* Pembongkaran */}
                  {renderInputField('pembongkaran', 'Pembongkaran Dekorasi', 'date')}
                  
                  {/* Tambahan Struktur */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tambahan-panggung">Tambahan Panggung</Label>
                      <div className="flex items-center space-x-2">
                        <div className="relative flex-1">
                          <Input 
                            type="number" 
                            id="panggung-panjang" 
                            className={`${hasValue('panggungPanjang') && !editingFields['panggungPanjang'] ? 'bg-green-50 border-green-200 text-green-700 font-semibold' : 'border-pink-200'}`}
                            placeholder="0"
                            value={detailData.panggungPanjang}
                            onChange={(e) => handleDetailChange('panggungPanjang', e.target.value)}
                            disabled={!editingFields['panggungPanjang'] && hasValue('panggungPanjang')}
                          />
                          {hasValue('panggungPanjang') && !editingFields['panggungPanjang'] && (
                            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span>x</span>
                        <div className="relative flex-1">
                          <Input 
                            type="number" 
                            id="panggung-lebar" 
                            className={`${hasValue('panggungLebar') && !editingFields['panggungLebar'] ? 'bg-green-50 border-green-200 text-green-700 font-semibold' : 'border-pink-200'}`}
                            placeholder="0"
                            value={detailData.panggungLebar}
                            onChange={(e) => handleDetailChange('panggungLebar', e.target.value)}
                            disabled={!editingFields['panggungLebar'] && hasValue('panggungLebar')}
                          />
                          {hasValue('panggungLebar') && !editingFields['panggungLebar'] && (
                            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span>m</span>
                      </div>
                      {(hasValue('panggungPanjang') || hasValue('panggungLebar')) && !(editingFields['panggungPanjang'] || editingFields['panggungLebar']) && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="text-black hover:text-gray-700 h-7 px-2 mt-1"
                          onClick={() => {
                            toggleEditField('panggungPanjang');
                            toggleEditField('panggungLebar');
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          <span className="text-xs">Edit</span>
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tenda-dapur">Tenda Dapur</Label>
                      <div className="flex items-center space-x-2">
                        <div className="relative flex-1">
                          <Input 
                            type="number" 
                            id="dapur-panjang" 
                            className={`${hasValue('tendaDapurPanjang') && !editingFields['tendaDapurPanjang'] ? 'bg-green-50 border-green-200 text-green-700 font-semibold' : 'border-pink-200'}`}
                            placeholder="0"
                            value={detailData.tendaDapurPanjang}
                            onChange={(e) => handleDetailChange('tendaDapurPanjang', e.target.value)}
                            disabled={!editingFields['tendaDapurPanjang'] && hasValue('tendaDapurPanjang')}
                          />
                          {hasValue('tendaDapurPanjang') && !editingFields['tendaDapurPanjang'] && (
                            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span>x</span>
                        <div className="relative flex-1">
                          <Input 
                            type="number" 
                            id="dapur-lebar" 
                            className={`${hasValue('tendaDapurLebar') && !editingFields['tendaDapurLebar'] ? 'bg-green-50 border-green-200 text-green-700 font-semibold' : 'border-pink-200'}`}
                            placeholder="0" 
                            value={detailData.tendaDapurLebar}
                            onChange={(e) => handleDetailChange('tendaDapurLebar', e.target.value)}
                            disabled={!editingFields['tendaDapurLebar'] && hasValue('tendaDapurLebar')}
                          />
                          {hasValue('tendaDapurLebar') && !editingFields['tendaDapurLebar'] && (
                            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span>m</span>
                      </div>
                      {(hasValue('tendaDapurPanjang') || hasValue('tendaDapurLebar')) && !(editingFields['tendaDapurPanjang'] || editingFields['tendaDapurLebar']) && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="text-black hover:text-gray-700 h-7 px-2 mt-1"
                          onClick={() => {
                            toggleEditField('tendaDapurPanjang');
                            toggleEditField('tendaDapurLebar');
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          <span className="text-xs">Edit</span>
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Peralatan */}
                  <div className="space-y-2">
                    <Label>Peralatan</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {['kursiTamu', 'meja', 'kembarMayang', 'alatPrasmanan', 'gerabah'].map((field, index) => {
                        const labels: Record<string, string> = {
                          kursiTamu: 'Kursi Tamu',
                          meja: 'Meja',
                          kembarMayang: 'Kembar Mayang',
                          alatPrasmanan: 'Alat Prasmanan',
                          gerabah: 'Gerabah'
                        };
                        
                        return (
                          <div key={field}>
                            <Label htmlFor={field} className="text-xs">{labels[field]}</Label>
                            <div className="relative">
                              <Input 
                                type="number" 
                                id={field} 
                                className={`${hasValue(field) && !editingFields[field] ? 'bg-green-50 border-green-200 text-green-700 font-semibold' : 'border-pink-200'}`}
                                placeholder="0"
                                value={detailData[field as keyof typeof detailData] as string}
                                onChange={(e) => handleDetailChange(field, e.target.value)}
                                disabled={!editingFields[field] && hasValue(field)}
                              />
                              {hasValue(field) && !editingFields[field] && (
                                <>
                                  <div className="absolute inset-y-0 right-8 flex items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="absolute inset-y-0 right-0 h-full w-8 text-black hover:text-gray-700"
                                    onClick={() => toggleEditField(field)}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Custom Barang */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Custom Barang</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="h-8 border-pink-200"
                        onClick={addCustomBarang}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah
                      </Button>
                    </div>
                    
                    {detailData.customBarang.map((item, index) => (
                      <div key={index} className="border rounded-md border-pink-100 p-3 bg-gray-50/50 mb-2">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-medium">Item {index + 1}</span>
                          {index > 0 && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0 text-red-500"
                              onClick={() => removeCustomBarang(index)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          <div className="col-span-3">
                            <Label htmlFor={`custom-nama-${index}`} className="text-xs">Nama Barang</Label>
                            <Input 
                              id={`custom-nama-${index}`} 
                              className="border-pink-200" 
                              placeholder="Masukkan nama barang" 
                              value={item.nama}
                              onChange={(e) => handleCustomBarangChange(index, 'nama', e.target.value)}
                            />
                          </div>
                          <div className="col-span-2">
                            <Label htmlFor={`custom-jumlah-${index}`} className="text-xs">Jumlah</Label>
                            <Input 
                              type="number" 
                              id={`custom-jumlah-${index}`} 
                              className="border-pink-200" 
                              placeholder="0" 
                              value={item.jumlah}
                              onChange={(e) => handleCustomBarangChange(index, 'jumlah', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Keuangan/Invoice Tab */}
        <TabsContent value="keuangan" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Keuangan & Invoice</h2>
            <Button 
              className="bg-pink-600 hover:bg-pink-700" 
              onClick={generateInvoice}
            >
              <Download className="h-4 w-4 mr-2" /> Generate Invoice
            </Button>
          </div>
          
          {/* Summary Card */}
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle>Ringkasan Keuangan</CardTitle>
              <CardDescription>Total biaya dan status pembayaran</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-pink-50 rounded-lg p-4 border border-pink-100">
                  <p className="text-sm text-muted-foreground">Total Biaya</p>
                  <p className="text-2xl font-bold text-pink-900">{formatRupiah(invoiceData.totalHarga)}</p>
                  <div className="mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-pink-700 p-0"
                      onClick={() => toggleEditField('totalHarga')}
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">Edit</span>
                    </Button>
                    {editingFields['totalHarga'] && (
                      <div className="mt-2">
                        <Input
                          type="number"
                          className="border-pink-200"
                          value={invoiceData.totalHarga}
                          onChange={(e) => handleInvoiceChange('totalHarga', Number(e.target.value))}
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2 h-8 text-green-700 border-green-200" 
                          onClick={() => toggleEditField('totalHarga')}
                        >
                          <Check className="h-3.5 w-3.5 mr-1" />
                          <span className="text-xs">Simpan</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <p className="text-sm text-muted-foreground">Total Dibayar</p>
                  <p className="text-2xl font-bold text-green-700">
                    {formatRupiah(terminPembayaran.reduce((total, payment) => total + payment.jumlah, 0))}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{terminPembayaran.length} pembayaran</p>
                </div>
                
                <div className={`rounded-lg p-4 border ${invoiceData.sisaPembayaran <= 0 ? 'bg-green-50 border-green-100' : 'bg-yellow-50 border-yellow-100'}`}>
                  <p className="text-sm text-muted-foreground">Sisa Pembayaran</p>
                  <p className={`text-2xl font-bold ${invoiceData.sisaPembayaran <= 0 ? 'text-green-700' : 'text-yellow-700'}`}>
                    {formatRupiah(Math.max(0, invoiceData.sisaPembayaran))}
                  </p>
                  <Badge className={
                    invoiceData.statusPembayaran === "Lunas" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }>
                    {invoiceData.statusPembayaran}
                  </Badge>
                </div>
              </div>
              
              <div className="mt-4">
                <Label htmlFor="catatanPembayaran">Catatan Keuangan</Label>
                <Textarea
                  id="catatanPembayaran"
                  className="border-pink-200 mt-1"
                  placeholder="Catatan tentang pembayaran dan keuangan..."
                  value={invoiceData.catatanPembayaran}
                  onChange={(e) => handleInvoiceChange('catatanPembayaran', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Payment History */}
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle>Riwayat Pembayaran</CardTitle>
              <CardDescription>Termin pembayaran yang sudah dilakukan</CardDescription>
            </CardHeader>
            <CardContent>
              {terminPembayaran.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-pink-50 text-left">
                        <th className="px-4 py-2 border border-pink-100 text-pink-900">Tanggal</th>
                        <th className="px-4 py-2 border border-pink-100 text-pink-900">Jumlah</th>
                        <th className="px-4 py-2 border border-pink-100 text-pink-900">Metode</th>
                        <th className="px-4 py-2 border border-pink-100 text-pink-900">Keterangan</th>
                        <th className="px-4 py-2 border border-pink-100 text-pink-900">Bukti</th>
                        <th className="px-4 py-2 border border-pink-100 text-pink-900">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {terminPembayaran.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-4 py-3 border border-pink-100">{formatDate(payment.tanggal)}</td>
                          <td className="px-4 py-3 border border-pink-100 font-medium">{formatRupiah(payment.jumlah)}</td>
                          <td className="px-4 py-3 border border-pink-100">{payment.metodePembayaran}</td>
                          <td className="px-4 py-3 border border-pink-100">{payment.keterangan}</td>
                          <td className="px-4 py-3 border border-pink-100">
                            {payment.buktiPembayaran ? (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-blue-600 p-0 h-6"
                                onClick={() => window.open(payment.buktiPembayaran, '_blank')}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                <span className="text-xs">Lihat</span>
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">Tidak ada</span>
                            )}
                          </td>
                          <td className="px-4 py-3 border border-pink-100">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 p-0 h-6"
                              onClick={() => deletePayment(payment.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>Belum ada riwayat pembayaran</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Add New Payment */}
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle>Tambah Pembayaran Baru</CardTitle>
              <CardDescription>Catat pembayaran yang dilakukan oleh klien</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="paymentDate">Tanggal Pembayaran</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    className="border-pink-200 mt-1"
                    value={newPayment.tanggal}
                    onChange={(e) => handleNewPaymentChange('tanggal', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="paymentAmount">Jumlah Pembayaran</Label>
                  <Input
                    id="paymentAmount"
                    type="number"
                    className="border-pink-200 mt-1"
                    placeholder="0"
                    value={newPayment.jumlah || ''}
                    onChange={(e) => handleNewPaymentChange('jumlah', Number(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
                <Select 
                  value={newPayment.metodePembayaran} 
                  onValueChange={(value) => handleNewPaymentChange('metodePembayaran', value)}
                >
                  <SelectTrigger className="border-pink-200 mt-1">
                    <SelectValue placeholder="Pilih metode pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Transfer Bank">Transfer Bank</SelectItem>
                    <SelectItem value="Tunai">Tunai</SelectItem>
                    <SelectItem value="QRIS">QRIS</SelectItem>
                    <SelectItem value="E-Wallet">E-Wallet</SelectItem>
                    <SelectItem value="Kartu Kredit">Kartu Kredit</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mb-4">
                <Label htmlFor="paymentDescription">Keterangan</Label>
                <Input
                  id="paymentDescription"
                  className="border-pink-200 mt-1"
                  placeholder="Contoh: Down Payment, Pembayaran Termin 1, dll"
                  value={newPayment.keterangan}
                  onChange={(e) => handleNewPaymentChange('keterangan', e.target.value)}
                />
              </div>
              
              <div className="mb-4">
                <Label>Bukti Pembayaran (Opsional)</Label>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  ref={paymentFileInputRef}
                  onChange={handlePaymentProofUpload}
                />
                <div className="flex items-center mt-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-pink-200"
                    onClick={() => paymentFileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Unggah Bukti Pembayaran
                  </Button>
                </div>
                
                {paymentProofImage && (
                  <div className="mt-2 relative w-40 h-40 border border-pink-100 rounded-md overflow-hidden">
                    <img 
                      src={paymentProofImage} 
                      alt="Bukti Pembayaran" 
                      className="object-cover w-full h-full" 
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => {
                        setPaymentProofImage(null);
                        setNewPayment(prev => ({ ...prev, buktiPembayaran: "" }));
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              
              <Button 
                className="bg-pink-600 hover:bg-pink-700 w-full" 
                onClick={addNewPayment}
              >
                <Plus className="h-4 w-4 mr-2" /> 
                Tambah Pembayaran
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tampilan UI Fitting Baju */}
      <div className="space-y-4 mt-6">
        <h3 className="text-lg font-semibold">Foto Fitting Baju</h3>
        
        <div className="flex flex-col space-y-4">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileUpload} 
            ref={fileInputRef} 
          />
          
          <Button 
            onClick={addFittingPhoto} 
            variant="outline" 
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            Unggah Foto Fitting
          </Button>
          
          {/* Menampilkan foto yang sudah diunggah */}
          {fittingPhotos.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 mt-4">
              {fittingPhotos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={photo} 
                    alt={`Fitting ${index + 1}`} 
                    className="w-full h-auto rounded-md object-cover aspect-square" 
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removePhoto(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-pink-200 rounded-md p-8 text-center">
              <Upload className="h-8 w-8 mx-auto text-pink-300 mb-2" />
              <p className="text-sm text-muted-foreground">Belum ada foto fitting. Silakan unggah foto.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal Preview Baju */}
      {previewOpen && selectedCloth && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreviewOpen(false)}>
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-pink-900">Detail Baju: {selectedCloth.namaBaju}</h3>
              <Button variant="ghost" size="icon" onClick={() => setPreviewOpen(false)} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Foto Baju */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Foto Baju</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {fittingPhotos.length > 0 ? (
                      fittingPhotos.map((photo, index) => (
                        <div key={index} className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                          <img 
                            src={photo} 
                            alt={`Foto ${selectedCloth.namaBaju} ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                        <p className="text-xs text-muted-foreground">Belum ada foto</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Informasi Baju */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Informasi Dasar</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      {selectedCloth.gender && (
                        <div>
                          <span className="font-medium">Jenis Kelamin:</span>
                          <p className="capitalize">{selectedCloth.gender}</p>
                        </div>
                      )}
                      {selectedCloth.ukuran && (
                        <div>
                          <span className="font-medium">Ukuran Standar:</span>
                          <p>{selectedCloth.ukuran}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Ukuran Detail - hanya tampilkan jika ada nilai */}
                  {(selectedCloth.bust || selectedCloth.waist || selectedCloth.hips || 
                    selectedCloth.shoulders || selectedCloth.length || selectedCloth.sleeves) && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Ukuran Detail</h4>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        {selectedCloth.bust && (
                          <div>
                            <span className="font-medium">Dada (Bust):</span>
                            <p>{selectedCloth.bust}</p>
                          </div>
                        )}
                        {selectedCloth.waist && (
                          <div>
                            <span className="font-medium">Pinggang (Waist):</span>
                            <p>{selectedCloth.waist}</p>
                          </div>
                        )}
                        {selectedCloth.hips && (
                          <div>
                            <span className="font-medium">Pinggul (Hips):</span>
                            <p>{selectedCloth.hips}</p>
                          </div>
                        )}
                        {selectedCloth.shoulders && (
                          <div>
                            <span className="font-medium">Bahu (Shoulders):</span>
                            <p>{selectedCloth.shoulders}</p>
                          </div>
                        )}
                        {selectedCloth.length && (
                          <div>
                            <span className="font-medium">Panjang (Length):</span>
                            <p>{selectedCloth.length}</p>
                          </div>
                        )}
                        {selectedCloth.sleeves && (
                          <div>
                            <span className="font-medium">Lengan (Sleeves):</span>
                            <p>{selectedCloth.sleeves}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {selectedCloth.fittingNotes && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Catatan Fitting</h4>
                      <p className="text-sm bg-pink-50 p-3 rounded-md">{selectedCloth.fittingNotes}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex space-x-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    // Isi form dengan data baju yang dipilih
                    setFittingData({
                      namaBaju: selectedCloth.namaBaju,
                      gender: selectedCloth.gender || "",
                      bust: selectedCloth.bust,
                      waist: selectedCloth.waist,
                      hips: selectedCloth.hips,
                      shoulders: selectedCloth.shoulders,
                      length: selectedCloth.length,
                      sleeves: selectedCloth.sleeves,
                      fittingNotes: selectedCloth.fittingNotes
                    });
                    setSelectedSize(selectedCloth.ukuran);
                    setPreviewOpen(false);
                    
                    toast({
                      title: "Data baju dimuat",
                      description: `Data ${selectedCloth.namaBaju} berhasil dimuat ke form`,
                      variant: "default",
                      duration: 2000,
                    });
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit Data
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    // Hapus baju dari daftar
                    const updatedList = savedClothes.filter(c => c.id !== selectedCloth.id);
                    setSavedClothes(updatedList);
                    
                    // Update localStorage
                    localStorage.setItem(`clothes-list-${clientId}`, JSON.stringify(updatedList));
                    
                    setPreviewOpen(false);
                    
                    toast({
                      title: "Data baju dihapus",
                      description: `${selectedCloth.namaBaju} berhasil dihapus dari daftar`,
                      variant: "default",
                      duration: 2000,
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Hapus
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 