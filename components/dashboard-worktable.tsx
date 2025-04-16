"use client"

import { useState } from "react"
import { Calendar, Plus, User, Trash2, Edit, Search, CheckCircle, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Sample data for the worktable
const employeeData = [
  {
    id: 1,
    name: "Rina",
    role: "MUA",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Sinta",
    role: "MUA",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Dani",
    role: "Asisten MUA",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Tono",
    role: "Dekorasi",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const taskData = [
  {
    id: 1,
    title: "Makeup Pernikahan Anisa & Budi",
    date: "15 Juni 2024",
    employeeId: 1,
    status: "Pending",
    client: "Anisa & Budi",
    location: "Hotel Grand Mercure, Jakarta",
    priority: "High",
  },
  {
    id: 2,
    title: "Makeup Prewedding Dina & Eko",
    date: "16 Juni 2024",
    employeeId: 1,
    status: "Pending",
    client: "Dina & Eko",
    location: "Taman Mini Indonesia Indah",
    priority: "Medium",
  },
  {
    id: 3,
    title: "Asisten Makeup Pernikahan Anisa & Budi",
    date: "15 Juni 2024",
    employeeId: 3,
    status: "Pending",
    client: "Anisa & Budi",
    location: "Hotel Grand Mercure, Jakarta",
    priority: "High",
  },
  {
    id: 4,
    title: "Dekorasi Pernikahan Anisa & Budi",
    date: "15 Juni 2024",
    employeeId: 4,
    status: "Pending",
    client: "Anisa & Budi",
    location: "Hotel Grand Mercure, Jakarta",
    priority: "High",
  },
  {
    id: 5,
    title: "Makeup Prewedding Hana & Irfan",
    date: "12 Juni 2024",
    employeeId: 2,
    status: "Completed",
    client: "Hana & Irfan",
    location: "Kebun Raya Bogor",
    priority: "Medium",
  },
]

export default function DashboardWorktable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEmployee, setFilterEmployee] = useState("all")
  const [filterMonth, setFilterMonth] = useState("June 2024")
  const [filterStatus, setFilterStatus] = useState("all")
  const [tasks, setTasks] = useState(taskData)
  const [showAddTask, setShowAddTask] = useState(false)
  const [activeView, setActiveView] = useState<"employee" | "status">("employee")
  const [newTask, setNewTask] = useState({
    title: "",
    date: "",
    employeeId: "",
    status: "Pending",
    client: "",
    location: "",
    priority: "Medium",
  })

  // Filter tasks based on search term, employee, month, and status
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesEmployee = filterEmployee === "all" || task.employeeId.toString() === filterEmployee

    // In a real app, we would filter by actual month
    // Here we just check if the month name is included in the date
    const matchesMonth = task.date.includes("Juni")

    const matchesStatus = filterStatus === "all" || task.status === filterStatus

    return matchesSearch && matchesEmployee && matchesMonth && matchesStatus
  })

  // Perbaiki fungsi handleAddTask untuk memastikan data yang benar ditambahkan
  const handleAddTask = () => {
    if (newTask.title && newTask.date && newTask.employeeId) {
      const task = {
        id: tasks.length + 1,
        title: newTask.title,
        date: newTask.date,
        employeeId: Number.parseInt(newTask.employeeId),
        status: newTask.status,
        client: newTask.client,
        location: newTask.location,
        priority: newTask.priority,
      }

      setTasks([...tasks, task])
      setNewTask({
        title: "",
        date: "",
        employeeId: "",
        status: "Pending",
        client: "",
        location: "",
        priority: "Medium",
      })
      setShowAddTask(false)
    }
  }

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const handleUpdateTaskStatus = (id: number, status: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, status } : task)))
  }

  // Group tasks by employee
  const tasksByEmployee = employeeData
    .map((employee) => {
      return {
        ...employee,
        tasks: filteredTasks.filter((task) => task.employeeId === employee.id),
      }
    })
    .filter((employee) => filterEmployee === "all" || employee.id.toString() === filterEmployee)

  // Group tasks by status
  const tasksByStatus = {
    Pending: filteredTasks.filter((task) => task.status === "Pending"),
    "In Progress": filteredTasks.filter((task) => task.status === "In Progress"),
    Completed: filteredTasks.filter((task) => task.status === "Completed"),
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Low":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-pink-900">Meja Kerja</h2>
          <p className="text-muted-foreground">Tugas dan pekerjaan untuk seluruh tim</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
            <DialogTrigger asChild>
              <Button className="bg-pink-600 hover:bg-pink-700">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Tugas
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Tugas Baru</DialogTitle>
                <DialogDescription>Tambahkan tugas baru untuk anggota tim.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Judul Tugas</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="border-pink-200"
                    placeholder="Masukkan judul tugas"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client">Klien</Label>
                  <Input
                    id="client"
                    value={newTask.client}
                    onChange={(e) => setNewTask({ ...newTask, client: e.target.value })}
                    className="border-pink-200"
                    placeholder="Nama klien"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Tanggal</Label>
                    <Input
                      id="date"
                      value={newTask.date}
                      onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                      className="border-pink-200"
                      placeholder="cth: 20 Juni 2024"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employee">Personel</Label>
                    <Select
                      value={newTask.employeeId}
                      onValueChange={(value) => setNewTask({ ...newTask, employeeId: value })}
                    >
                      <SelectTrigger id="employee" className="border-pink-200">
                        <SelectValue placeholder="Pilih personel" />
                      </SelectTrigger>
                      <SelectContent>
                        {employeeData.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id.toString()}>
                            {employee.name} ({employee.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Lokasi</Label>
                  <Input
                    id="location"
                    value={newTask.location}
                    onChange={(e) => setNewTask({ ...newTask, location: e.target.value })}
                    className="border-pink-200"
                    placeholder="Lokasi tugas"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={newTask.status} onValueChange={(value) => setNewTask({ ...newTask, status: value })}>
                      <SelectTrigger id="status" className="border-pink-200">
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioritas</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                    >
                      <SelectTrigger id="priority" className="border-pink-200">
                        <SelectValue placeholder="Pilih prioritas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">Tinggi</SelectItem>
                        <SelectItem value="Medium">Sedang</SelectItem>
                        <SelectItem value="Low">Rendah</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddTask(false)} className="border-pink-200">
                  Batal
                </Button>
                <Button onClick={handleAddTask} className="bg-pink-600 hover:bg-pink-700">
                  Tambah Tugas
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari tugas, klien, atau lokasi..."
            className="pl-8 border-pink-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="w-40">
            <Select value={filterEmployee} onValueChange={setFilterEmployee}>
              <SelectTrigger className="border-pink-200">
                <User className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Personel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Personel</SelectItem>
                {employeeData.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id.toString()}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-40">
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="border-pink-200">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Bulan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="June 2024">Juni 2024</SelectItem>
                <SelectItem value="July 2024">Juli 2024</SelectItem>
                <SelectItem value="August 2024">Agustus 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-40">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="border-pink-200">
                <CheckCircle className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "employee" | "status")} className="space-y-4">
        <TabsList className="bg-pink-100/50">
          <TabsTrigger value="employee" className="data-[state=active]:bg-white">
            Tampilan Karyawan
          </TabsTrigger>
          <TabsTrigger value="status" className="data-[state=active]:bg-white">
            Tampilan Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employee" className="space-y-6">
          {tasksByEmployee.map((employee) => (
            <Card key={employee.id} className="border-pink-100">
              <CardHeader className="px-6 py-4">
                <div className="flex items-center">
                  <Avatar className="mr-3">
                    <AvatarImage src={employee.avatar || "/placeholder.svg"} alt={employee.name} />
                    <AvatarFallback className="bg-pink-200 text-pink-700">{employee.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{employee.name}</CardTitle>
                    <CardDescription>{employee.role}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-4">
                {employee.tasks.length > 0 ? (
                  <div className="space-y-3">
                    {employee.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-start justify-between p-3 border border-pink-100 rounded-lg hover:bg-pink-50/50"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <p className="font-medium">{task.title}</p>
                            <Badge
                              className={`ml-2 ${
                                task.status === "Completed"
                                  ? "bg-green-100 text-green-800"
                                  : task.status === "In Progress"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {task.status}
                            </Badge>
                            <Badge className={`ml-2 ${getPriorityColor(task.priority)}`}>{task.priority}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {task.client} • {task.location}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {task.date}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-pink-600">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-80">
                              <div className="space-y-3">
                                <h4 className="font-medium">Ubah Status</h4>
                                <Select
                                  defaultValue={task.status}
                                  onValueChange={(value) => handleUpdateTaskStatus(task.id, value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pilih status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                  </SelectContent>
                                </Select>
                                <div className="flex justify-end">
                                  <Button className="bg-pink-600 hover:bg-pink-700">Simpan</Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-20 bg-pink-50/30 rounded-lg">
                    <p className="text-muted-foreground">Tidak ada tugas untuk personel ini</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {tasksByEmployee.length === 0 && (
            <div className="flex items-center justify-center h-40 bg-pink-50/30 rounded-lg">
              <p className="text-muted-foreground">Tidak ada tugas yang ditemukan</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(tasksByStatus).map(([status, tasks]) => (
              <Card key={status} className="border-pink-100">
                <CardHeader className="px-6 py-4">
                  <CardTitle className="text-lg flex items-center">
                    <Badge
                      className={`mr-2 ${
                        status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : status === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {tasks.length}
                    </Badge>
                    {status}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-4">
                  {tasks.length > 0 ? (
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <div key={task.id} className="p-3 border border-pink-100 rounded-lg hover:bg-pink-50/50">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium">{task.title}</p>
                            <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Avatar className="h-5 w-5 mr-2">
                              <AvatarFallback className="text-xs bg-pink-200 text-pink-700">
                                {employeeData.find((e) => e.id === task.employeeId)?.name[0] || "?"}
                              </AvatarFallback>
                            </Avatar>
                            {employeeData.find((e) => e.id === task.employeeId)?.name || "Unknown"}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {task.date}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-20 bg-pink-50/30 rounded-lg">
                      <p className="text-muted-foreground">Tidak ada tugas dengan status ini</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
