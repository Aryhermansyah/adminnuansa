"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Calendar, Users, Shirt, UserPlus, Plus, ArrowRight, Clock, CheckCircle, ChevronRight, ChevronLeft, Pencil, Trash2, User2, Edit } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RealTimeClock } from "@/components/real-time-clock"
import { useData } from "@/contexts/data-context"
import { DataLoading } from "@/components/data-loading"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { dbService } from "@/lib/db/db-service"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { TaskDeleteDialog } from "@/components/task-delete-dialog"

// Interface untuk model tugas
interface Task {
  id?: number
  title: string
  priority: "high" | "medium" | "low"
  time: string
  completed: boolean
  assignedTo: string
  date: string
  createdAt?: string
  updatedAt?: string
}

export default function DashboardPage() {
  const { clients, events, team, vendors, isLoading, refreshData } = useData()
  const [error, setError] = useState<Error | null>(null)
  const [dailyTasks, setDailyTasks] = useState<Task[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)
  const [newTaskOpen, setNewTaskOpen] = useState(false)
  const [editTaskOpen, setEditTaskOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null)
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    priority: "medium",
    time: "",
    completed: false,
    assignedTo: "",
    date: new Date().toISOString().split('T')[0]
  })
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Hanya refresh data saat komponen pertama kali mount
    refreshData(true)
    
    // Load tasks untuk hari ini
    loadTasks(selectedDate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load tasks ketika selectedDate berubah
  useEffect(() => {
    loadTasks(selectedDate)
  }, [selectedDate])

  const loadTasks = async (date: string = selectedDate) => {
    setIsLoadingTasks(true)
    try {
      // Coba ambil tugas untuk tanggal yang dipilih dari localStorage
      const storedTasks = localStorage.getItem(`tasks_${date}`)
      
      if (storedTasks) {
        // Jika ada data tersimpan, gunakan data tersebut
        setDailyTasks(JSON.parse(storedTasks))
      } else {
        // Jika tidak ada tugas untuk tanggal yang dipilih, set array kosong
        setDailyTasks([])
        
        // Jika tanggal yang dipilih adalah hari ini, maka buat tugas default
        const today = new Date().toISOString().split('T')[0]
        if (date === today) {
          // Jika tidak ada tugas hari ini, buat contoh tugas default
          const defaultTasks: Task[] = [
            {
              id: 1,
              title: "Konfirmasi vendor untuk acara Anisa & Budi",
              priority: "high",
              time: "09:00",
              completed: false,
              assignedTo: "Admin",
              date: today
            },
            {
              id: 2,
              title: "Persiapan dekorasi untuk acara besok",
              priority: "high",
              time: "10:30",
              completed: false,
              assignedTo: "Tim Dekorasi",
              date: today
            },
            {
              id: 3,
              title: "Meeting dengan calon klien baru",
              priority: "medium",
              time: "13:00",
              completed: false,
              assignedTo: "Admin",
              date: today
            },
            {
              id: 4,
              title: "Fitting baju pengantin Dina & Eko",
              priority: "medium",
              time: "15:00",
              completed: false,
              assignedTo: "Tim MUA",
              date: today
            },
            {
              id: 5,
              title: "Konfirmasi pembayaran dari klien Fira & Gilang",
              priority: "high",
              time: "16:30",
              completed: false,
              assignedTo: "Admin",
              date: today
            },
            {
              id: 6,
              title: "Persiapan makeup untuk acara besok",
              priority: "medium",
              time: "17:00",
              completed: false,
              assignedTo: "Tim MUA",
              date: today
            },
          ]
          
          // Simpan tugas default ke localStorage
          localStorage.setItem(`tasks_${today}`, JSON.stringify(defaultTasks))
          
          // Set state dengan tugas default
          setDailyTasks(defaultTasks)
        }
      }
    } catch (err) {
      console.error("Error loading tasks:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsLoadingTasks(false)
    }
  }

  // Ketika tanggal berubah, muat tugas sesuai tanggal
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate)
    loadTasks(newDate)
  }

  const handleNextDay = () => {
    // Ambil tanggal sekarang
    const currentDate = new Date(selectedDate)
    // Tambahkan 1 hari
    currentDate.setDate(currentDate.getDate() + 1)
    // Format menjadi YYYY-MM-DD
    const nextDate = currentDate.toISOString().split('T')[0]
    // Update selectedDate dan muat tugas untuk tanggal tersebut
    handleDateChange(nextDate)
  }

  const handlePrevDay = () => {
    // Ambil tanggal sekarang
    const currentDate = new Date(selectedDate)
    // Kurangi 1 hari
    currentDate.setDate(currentDate.getDate() - 1)
    // Format menjadi YYYY-MM-DD
    const prevDate = currentDate.toISOString().split('T')[0]
    // Update selectedDate dan muat tugas untuk tanggal tersebut
    handleDateChange(prevDate)
  }

  const toggleTaskCompletion = async (taskId: number, completed: boolean) => {
    try {
      // Log untuk memastikan fungsi dipanggil dengan parameter yang benar
      console.log(`Toggling task completion: taskId=${taskId}, completed=${completed}`)
      
      // Cari task yang akan diupdate
      const taskToUpdate = dailyTasks.find(task => task.id === taskId)
      
      if (taskToUpdate) {
        // Set status completed
        const updatedTask = { 
          ...taskToUpdate, 
          completed: completed 
        }
        
        // Update state
        const updatedTasks = dailyTasks.map(task => 
          task.id === taskId ? updatedTask : task
        )
        
        // Set state dengan tugas yang diperbarui
        setDailyTasks(updatedTasks)
        
        // Simpan ke localStorage
        localStorage.setItem(`tasks_${selectedDate}`, JSON.stringify(updatedTasks))
        
        // Log untuk memastikan data disimpan ke localStorage
        console.log(`Updated tasks saved to localStorage: tasks_${selectedDate}`, updatedTasks)
      } else {
        console.warn(`Task with id ${taskId} not found`)
      }
    } catch (err) {
      console.error("Error toggling task completion:", err)
      toast({
        title: "Terjadi kesalahan",
        description: "Gagal memperbarui status tugas",
        variant: "destructive"
      })
    }
  }

  const handleAddTask = async () => {
    try {
      if (!newTask.title || !newTask.time || !newTask.date) {
        toast({
          title: "Input tidak lengkap",
          description: "Judul, waktu, dan tanggal tugas wajib diisi",
          variant: "destructive"
        })
        return
      }
      
      // Dapatkan tanggal tugas yang dipilih
      const taskDate = newTask.date
      
      // Cek apakah ada tugas untuk tanggal tersebut
      let tasksForDate: Task[] = []
      const storedTasks = localStorage.getItem(`tasks_${taskDate}`)
      if (storedTasks) {
        tasksForDate = JSON.parse(storedTasks)
      }
      
      // Dapatkan ID terbesar dari tugas yang ada + 1
      const maxId = tasksForDate.length > 0 
        ? Math.max(...tasksForDate.map(task => task.id || 0)) 
        : 0
      
      // Tambahkan task baru
      const taskToAdd: Task = {
        id: maxId + 1,
        title: newTask.title,
        priority: newTask.priority as "high" | "medium" | "low",
        time: newTask.time,
        completed: false,
        assignedTo: newTask.assignedTo || "",
        date: taskDate
      }
      
      // Update tasks untuk tanggal tersebut
      const updatedTasks = [...tasksForDate, taskToAdd]
      
      // Simpan ke localStorage
      localStorage.setItem(`tasks_${taskDate}`, JSON.stringify(updatedTasks))
      
      // Jika tanggal tugas baru sama dengan tanggal yang sedang ditampilkan, update state
      if (taskDate === selectedDate) {
        setDailyTasks(updatedTasks)
      }
      
      // Reset form
      setNewTask({
        title: "",
        priority: "medium",
        time: "",
        completed: false,
        assignedTo: "",
        date: new Date().toISOString().split('T')[0]
      })
      
      // Tutup dialog
      setNewTaskOpen(false)
      
      toast({
        title: "Tugas berhasil ditambahkan",
        description: "Tugas baru telah ditambahkan ke daftar"
      })
    } catch (err) {
      console.error("Error adding task:", err)
      toast({
        title: "Terjadi kesalahan",
        description: "Gagal menambahkan tugas baru",
        variant: "destructive"
      })
    }
  }

  const handleEditTask = async () => {
    try {
      if (!editingTask || !editingTask.title || !editingTask.time || !editingTask.date) {
        toast({
          title: "Input tidak lengkap",
          description: "Judul, waktu, dan tanggal tugas wajib diisi",
          variant: "destructive"
        })
        return
      }
      
      // Dapatkan tanggal tugas yang sedang diedit
      const taskDate = editingTask.date
      
      // Cek apakah ada tugas untuk tanggal tersebut
      let tasksForDate: Task[] = []
      const storedTasks = localStorage.getItem(`tasks_${taskDate}`)
      if (storedTasks) {
        tasksForDate = JSON.parse(storedTasks)
      }
      
      // Update tugas yang sedang diedit
      const updatedTasks = tasksForDate.map(task => 
        task.id === editingTask.id ? editingTask : task
      )
      
      // Simpan ke localStorage
      localStorage.setItem(`tasks_${taskDate}`, JSON.stringify(updatedTasks))
      
      // Jika tanggal tugas yang diedit sama dengan tanggal yang sedang ditampilkan, update state
      if (taskDate === selectedDate) {
        setDailyTasks(updatedTasks)
      }
      
      // Reset form dan tutup dialog
      setEditingTask(null)
      setEditTaskOpen(false)
      
      toast({
        title: "Tugas berhasil diperbarui",
        description: "Perubahan tugas telah disimpan"
      })
    } catch (err) {
      console.error("Error updating task:", err)
      toast({
        title: "Terjadi kesalahan",
        description: "Gagal memperbarui tugas",
        variant: "destructive"
      })
    }
  }

  const startEditTask = (task: Task) => {
    setEditingTask(task)
    setEditTaskOpen(true)
  }

  const startDeleteTask = (taskId: number | string) => {
    setTaskToDelete(typeof taskId === 'string' ? parseInt(taskId) : taskId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteTask = () => {
    try {
      if (!taskToDelete) return
      
      // Filter tugas untuk menghapus tugas dengan id yang sesuai
      const updatedTasks = dailyTasks.filter(task => task.id !== taskToDelete)
      
      // Update state
      setDailyTasks(updatedTasks)
      
      // Simpan ke localStorage
      localStorage.setItem(`tasks_${selectedDate}`, JSON.stringify(updatedTasks))
      
      toast({
        title: "Tugas berhasil dihapus",
        description: "Tugas telah dihapus dari daftar"
      })
      
      // Reset task to delete
      setTaskToDelete(null)
    } catch (err) {
      console.error("Error deleting task:", err)
      toast({
        title: "Terjadi kesalahan",
        description: "Gagal menghapus tugas",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return <DataLoading title="Memuat Data Dashboard" />
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

  // Format tanggal untuk header
  const formattedDate = format(new Date(), "EEEE, d MMMM yyyy", { locale: idLocale })

  // Task Card
  const TaskCard = ({ task, onEdit, onDelete }: { task: Task, onEdit: (task: Task) => void, onDelete: (id: number | string) => void }) => {
    const priorityColor = {
      high: 'bg-rose-500',
      medium: 'bg-amber-500',
      low: 'bg-emerald-500',
    }

    const priorityLabel = {
      high: 'Prioritas Tinggi',
      medium: 'Prioritas Sedang',
      low: 'Prioritas Rendah',
    }

    // Log untuk memastikan task dimuat dengan benar, termasuk status completed
    console.log(`Rendering task: ${task.id} - ${task.title}, completed=${task.completed}`)

    return (
      <div className={`relative bg-white rounded-lg shadow-sm p-3 border border-gray-100 ${task.completed ? 'bg-gray-50' : ''}`}>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            className={`w-5 h-5 rounded-full flex items-center justify-center border ${task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}
            onClick={() => toggleTaskCompletion(task.id as number, !task.completed)}
            aria-label={task.completed ? 'Tandai belum selesai' : 'Tandai selesai'}
          >
            {task.completed && <CheckCircle className="h-4 w-4" />}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-1">
              <h3 className={`font-medium text-sm line-clamp-1 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                {task.title}
              </h3>
              <div className="flex space-x-1">
                <Button variant="ghost" size="sm" className="h-6 w-6" onClick={() => onEdit(task)}>
                  <Edit className="h-3.5 w-3.5 text-gray-500" />
                </Button>
                <Button variant="ghost" size="sm" className="h-6 w-6" onClick={() => onDelete(task.id!)}>
                  <Trash2 className="h-3.5 w-3.5 text-gray-500" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center text-gray-500 text-xs">
              <Clock className="mr-1 h-3 w-3" />
              <span>{task.time}</span>
            </div>
            
            <div className="flex items-center mt-1">
              <User2 className="text-gray-400 w-3 h-3 mr-1" />
              <span className="text-gray-600 text-xs">{task.assignedTo}</span>
              <span className="ml-2 inline-flex items-center">
                <span className={`w-2 h-2 rounded-full ${priorityColor[task.priority as keyof typeof priorityColor]} mr-1`} />
                <span className="text-xs text-gray-500">{priorityLabel[task.priority as keyof typeof priorityLabel]}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-3 md:gap-4 md:items-center">
        <div>
          <h1 className="text-lg md:text-2xl font-bold tracking-tight text-pink-900">Dashboard</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Selamat datang kembali, Admin NuansaWedding!</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <RealTimeClock />
          <Button asChild className="bg-pink-600 hover:bg-pink-700 h-8 md:h-10 text-xs md:text-sm w-full sm:w-auto">
            <Link href="/klien/tambah">
              <Plus className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
              Tambah Klien
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-2 md:gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="border-pink-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 px-2 md:px-3 pt-2 md:pt-3">
            <CardTitle className="text-xs md:text-sm font-medium">Klien Aktif</CardTitle>
            <Users className="h-3 w-3 md:h-4 md:w-4 text-pink-600" />
          </CardHeader>
          <CardContent className="px-2 md:px-3 pb-2 md:pb-3 pt-0">
            <div className="text-lg md:text-2xl font-bold text-pink-900">{activeClients}</div>
            <Button variant="link" className="p-0 h-auto text-[10px] md:text-xs text-pink-600" asChild>
              <Link href="/klien">
                Lihat semua klien <ArrowRight className="ml-1 h-2 w-2 md:h-3 md:w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-pink-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 px-2 md:px-3 pt-2 md:pt-3">
            <CardTitle className="text-xs md:text-sm font-medium">Event Hari Ini</CardTitle>
            <Calendar className="h-3 w-3 md:h-4 md:w-4 text-pink-600" />
          </CardHeader>
          <CardContent className="px-2 md:px-3 pb-2 md:pb-3 pt-0">
            <div className="text-lg md:text-2xl font-bold text-pink-900">{todayEvents}</div>
            <Button variant="link" className="p-0 h-auto text-[10px] md:text-xs text-pink-600" asChild>
              <Link href="/jadwal">
                Lihat jadwal <ArrowRight className="ml-1 h-2 w-2 md:h-3 md:w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-pink-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 px-2 md:px-3 pt-2 md:pt-3">
            <CardTitle className="text-xs md:text-sm font-medium">Tim & Vendor</CardTitle>
            <UserPlus className="h-3 w-3 md:h-4 md:w-4 text-pink-600" />
          </CardHeader>
          <CardContent className="px-2 md:px-3 pb-2 md:pb-3 pt-0">
            <div className="text-lg md:text-2xl font-bold text-pink-900">{teamCount + vendorCount}</div>
            <Button variant="link" className="p-0 h-auto text-[10px] md:text-xs text-pink-600" asChild>
              <Link href="/tim-vendor">
                Kelola tim & vendor <ArrowRight className="ml-1 h-2 w-2 md:h-3 md:w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-pink-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 px-2 md:px-3 pt-2 md:pt-3">
            <CardTitle className="text-xs md:text-sm font-medium">Sewa Baju</CardTitle>
            <Shirt className="h-3 w-3 md:h-4 md:w-4 text-pink-600" />
          </CardHeader>
          <CardContent className="px-2 md:px-3 pb-2 md:pb-3 pt-0">
            <div className="text-lg md:text-2xl font-bold text-pink-900">0</div>
            <Button variant="link" className="p-0 h-auto text-[10px] md:text-xs text-pink-600" asChild>
              <Link href="/sewa-baju">
                Kelola sewa baju <ArrowRight className="ml-1 h-2 w-2 md:h-3 md:w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="daily-tasks" className="space-y-3 md:space-y-4">
        <TabsList className="bg-pink-100/50 w-full grid grid-cols-3 gap-0 overflow-hidden">
          <TabsTrigger value="daily-tasks" className="data-[state=active]:bg-white text-xs md:text-sm py-1 px-1 md:py-2 md:px-3">
            Tugas Harian
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-white text-xs md:text-sm py-1 px-1 md:py-2 md:px-3">
            Jadwal Mendatang
          </TabsTrigger>
          <TabsTrigger value="clients" className="data-[state=active]:bg-white text-xs md:text-sm py-1 px-1 md:py-2 md:px-3">
            Klien Terbaru
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily-tasks" className="space-y-3 md:space-y-4">
          <Card className="border-pink-100">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between px-3 md:px-4 py-2 md:py-3 gap-2">
              <div>
                <CardTitle className="text-sm md:text-base">Tugas Harian Admin</CardTitle>
                <CardDescription className="text-[10px] md:text-xs">Daftar tugas untuk {formattedDate}</CardDescription>
              </div>
              <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-pink-600 hover:bg-pink-700 h-8 text-xs w-full sm:w-auto">
                    <Plus className="h-3 w-3 mr-1" /> Tambah Tugas
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md sm:max-w-lg p-4 md:p-6">
                  <DialogHeader>
                    <DialogTitle className="text-base md:text-lg">Tambah Tugas Baru</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 md:space-y-4 py-2">
                    <div className="space-y-1 md:space-y-2">
                      <Label htmlFor="title" className="text-xs md:text-sm">Judul Tugas</Label>
                      <Input 
                        id="title" 
                        value={newTask.title}
                        onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                        placeholder="Masukkan judul tugas" 
                        className="h-8 md:h-10 text-xs md:text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <div className="space-y-1 md:space-y-2">
                        <Label htmlFor="priority" className="text-xs md:text-sm">Prioritas</Label>
                        <Select 
                          value={newTask.priority} 
                          onValueChange={(value) => setNewTask({...newTask, priority: value as "high" | "medium" | "low"})}
                        >
                          <SelectTrigger className="h-8 md:h-10 text-xs md:text-sm">
                            <SelectValue placeholder="Pilih prioritas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">Tinggi</SelectItem>
                            <SelectItem value="medium">Sedang</SelectItem>
                            <SelectItem value="low">Rendah</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1 md:space-y-2">
                        <Label htmlFor="time" className="text-xs md:text-sm">Waktu</Label>
                        <Input 
                          id="time" 
                          type="time"
                          value={newTask.time}
                          onChange={(e) => setNewTask({...newTask, time: e.target.value})}
                          className="h-8 md:h-10 text-xs md:text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <div className="space-y-1 md:space-y-2">
                        <Label htmlFor="date" className="text-xs md:text-sm">Tanggal</Label>
                        <Input 
                          id="date" 
                          type="date"
                          value={newTask.date}
                          onChange={(e) => setNewTask({...newTask, date: e.target.value})}
                          className="h-8 md:h-10 text-xs md:text-sm"
                        />
                      </div>
                      <div className="space-y-1 md:space-y-2">
                        <Label htmlFor="assignedTo" className="text-xs md:text-sm">Ditugaskan Kepada</Label>
                        <Input 
                          id="assignedTo" 
                          value={newTask.assignedTo}
                          onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                          placeholder="Masukkan nama petugas" 
                          className="h-8 md:h-10 text-xs md:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setNewTaskOpen(false)} 
                      className="h-8 md:h-10 text-xs md:text-sm">Batal</Button>
                    <Button onClick={handleAddTask} 
                      className="h-8 md:h-10 text-xs md:text-sm bg-pink-600 hover:bg-pink-700">Simpan</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              {/* Dialog Edit Tugas */}
              <Dialog open={editTaskOpen} onOpenChange={setEditTaskOpen}>
                <DialogContent className="w-[95vw] max-w-md sm:max-w-lg p-4 md:p-6">
                  <DialogHeader>
                    <DialogTitle className="text-base md:text-lg">Edit Tugas</DialogTitle>
                  </DialogHeader>
                  {editingTask && (
                    <div className="space-y-3 md:space-y-4 py-2">
                      <div className="space-y-1 md:space-y-2">
                        <Label htmlFor="edit-title" className="text-xs md:text-sm">Judul Tugas</Label>
                        <Input 
                          id="edit-title" 
                          value={editingTask.title}
                          onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                          placeholder="Masukkan judul tugas" 
                          className="h-8 md:h-10 text-xs md:text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3 md:gap-4">
                        <div className="space-y-1 md:space-y-2">
                          <Label htmlFor="edit-priority" className="text-xs md:text-sm">Prioritas</Label>
                          <Select 
                            value={editingTask.priority} 
                            onValueChange={(value) => setEditingTask({...editingTask, priority: value as "high" | "medium" | "low"})}
                          >
                            <SelectTrigger className="h-8 md:h-10 text-xs md:text-sm">
                              <SelectValue placeholder="Pilih prioritas" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">Tinggi</SelectItem>
                              <SelectItem value="medium">Sedang</SelectItem>
                              <SelectItem value="low">Rendah</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1 md:space-y-2">
                          <Label htmlFor="edit-time" className="text-xs md:text-sm">Waktu</Label>
                          <Input 
                            id="edit-time" 
                            type="time"
                            value={editingTask.time}
                            onChange={(e) => setEditingTask({...editingTask, time: e.target.value})}
                            className="h-8 md:h-10 text-xs md:text-sm"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 md:gap-4">
                        <div className="space-y-1 md:space-y-2">
                          <Label htmlFor="edit-date" className="text-xs md:text-sm">Tanggal</Label>
                          <Input 
                            id="edit-date" 
                            type="date"
                            value={editingTask.date}
                            onChange={(e) => setEditingTask({...editingTask, date: e.target.value})}
                            className="h-8 md:h-10 text-xs md:text-sm"
                          />
                        </div>
                        <div className="space-y-1 md:space-y-2">
                          <Label htmlFor="edit-assignedTo" className="text-xs md:text-sm">Ditugaskan Kepada</Label>
                          <Input 
                            id="edit-assignedTo" 
                            value={editingTask.assignedTo}
                            onChange={(e) => setEditingTask({...editingTask, assignedTo: e.target.value})}
                            placeholder="Masukkan nama petugas" 
                            className="h-8 md:h-10 text-xs md:text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="edit-completed" 
                          checked={editingTask.completed}
                          onCheckedChange={(checked) => setEditingTask({...editingTask, completed: !!checked})}
                          className="h-4 w-4 md:h-5 md:w-5"
                        />
                        <Label htmlFor="edit-completed" className="text-xs md:text-sm">Tugas Selesai</Label>
                      </div>
                    </div>
                  )}
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setEditTaskOpen(false)} 
                      className="h-8 md:h-10 text-xs md:text-sm">Batal</Button>
                    <Button onClick={handleEditTask} 
                      className="h-8 md:h-10 text-xs md:text-sm bg-pink-600 hover:bg-pink-700">Simpan</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="px-2 md:px-4 py-2">
              <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex items-center gap-1 md:gap-2">
                  <Label htmlFor="viewDate" className="text-[10px] md:text-xs font-medium">Tanggal:</Label>
                  <div className="flex items-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 md:h-8 md:w-8 rounded-full text-gray-400 hover:text-pink-600"
                      onClick={handlePrevDay}
                      title="Hari Sebelumnya"
                    >
                      <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                    <Input 
                      id="viewDate" 
                      type="date"
                      value={selectedDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-auto h-6 md:h-8 text-[10px] md:text-xs mx-1"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 md:h-8 md:w-8 rounded-full text-gray-400 hover:text-pink-600"
                      onClick={handleNextDay}
                      title="Hari Berikutnya"
                    >
                      <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-[10px] md:text-xs text-muted-foreground flex items-center">
                  <Calendar className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                  {format(new Date(selectedDate), "EEEE, d MMMM yyyy", { locale: idLocale })}
                </div>
              </div>
              <div className="space-y-2 md:space-y-3">
                {isLoadingTasks ? (
                  <div className="text-center py-6 md:py-8">
                    <p className="text-muted-foreground text-sm">Memuat tugas...</p>
                  </div>
                ) : dailyTasks.length > 0 ? (
                  dailyTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onEdit={startEditTask} onDelete={startDeleteTask} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Belum ada tugas untuk tanggal ini</p>
                  </div>
                )}
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

      {/* Dialog konfirmasi hapus tugas */}
      <TaskDeleteDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteTask}
      />
    </div>
  )
}
