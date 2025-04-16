"use client"

import { useState, useEffect } from "react"
import {
  Send,
  Search,
  Phone,
  Video,
  ImageIcon,
  Paperclip,
  Smile,
  MoreVertical,
  Users,
  Plus,
  ChevronLeft,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMobile } from "@/hooks/use-mobile"

// Data dummy kontak
const contacts = [
  {
    id: 1,
    name: "Rina (MUA)",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Baik, saya akan siapkan semua peralatan",
    time: "10:30",
    unread: 0,
    online: true,
  },
  {
    id: 2,
    name: "Anisa (Klien)",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Apakah bisa meeting besok untuk membahas konsep?",
    time: "09:45",
    unread: 2,
    online: true,
  },
  {
    id: 3,
    name: "Tono (Dekorasi)",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Sudah saya kirim foto-foto dekorasinya",
    time: "Kemarin",
    unread: 0,
    online: false,
  },
  {
    id: 4,
    name: "Citra (Klien)",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Terima kasih atas pelayanannya",
    time: "Kemarin",
    unread: 0,
    online: false,
  },
  {
    id: 5,
    name: "Dani (Asisten MUA)",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Saya sudah sampai di lokasi",
    time: "Kemarin",
    unread: 0,
    online: true,
  },
]

// Data dummy grup
const groups = [
  {
    id: 101,
    name: "Tim Makeup",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Rina: Meeting besok jam 9 pagi ya",
    time: "11:20",
    unread: 5,
    members: ["Rina (MUA)", "Dani (Asisten MUA)", "Sinta (MUA)", "Lia (Asisten MUA)"],
  },
  {
    id: 102,
    name: "Tim Dekorasi",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Tono: Jangan lupa bawa peralatan tambahan",
    time: "Kemarin",
    unread: 0,
    members: ["Tono (Dekorasi)", "Agus (Dekorasi)", "Bima (Asisten Dekorasi)", "Rudi (Asisten Dekorasi)"],
  },
  {
    id: 103,
    name: "Event Anisa & Budi",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Admin: Mohon konfirmasi kehadiran",
    time: "2 hari lalu",
    unread: 0,
    members: ["Admin", "Rina (MUA)", "Tono (Dekorasi)", "Anisa (Klien)"],
  },
]

// Data dummy pesan
const messagesData = {
  1: [
    {
      id: 1,
      sender: "Rina",
      content: "Halo Admin, saya sudah menyiapkan semua peralatan untuk acara besok",
      time: "10:25",
      isMe: false,
    },
    {
      id: 2,
      sender: "Me",
      content: "Bagus Rina, pastikan tidak ada yang tertinggal ya",
      time: "10:27",
      isMe: true,
    },
    {
      id: 3,
      sender: "Rina",
      content: "Baik, saya akan siapkan semua peralatan",
      time: "10:30",
      isMe: false,
    },
  ],
  2: [
    {
      id: 1,
      sender: "Anisa",
      content: "Halo, saya ingin menanyakan tentang konsep makeup untuk acara pernikahan saya",
      time: "09:30",
      isMe: false,
    },
    {
      id: 2,
      sender: "Me",
      content:
        "Halo Anisa, terima kasih sudah menghubungi kami. Untuk konsep makeup, kami punya beberapa pilihan yang bisa disesuaikan dengan tema pernikahan Anda",
      time: "09:35",
      isMe: true,
    },
    {
      id: 3,
      sender: "Anisa",
      content: "Tema pernikahan saya adalah garden party dengan warna pastel",
      time: "09:40",
      isMe: false,
    },
    {
      id: 4,
      sender: "Me",
      content:
        "Untuk tema garden party dengan warna pastel, kami sarankan makeup dengan nuansa natural dan segar. Kami bisa menggunakan warna-warna soft pink, peach, dan sentuhan gold untuk memberikan kesan glowing",
      time: "09:42",
      isMe: true,
    },
    {
      id: 5,
      sender: "Anisa",
      content: "Kedengarannya bagus! Apakah bisa meeting besok untuk membahas konsep lebih detail?",
      time: "09:45",
      isMe: false,
    },
  ],
  101: [
    {
      id: 1,
      sender: "Admin",
      content: "Selamat pagi tim, ada meeting koordinasi jam 9 pagi besok",
      time: "11:15",
      isMe: true,
    },
    {
      id: 2,
      sender: "Rina",
      content: "Meeting besok jam 9 pagi ya, saya akan hadir",
      time: "11:20",
      isMe: false,
    },
    {
      id: 3,
      sender: "Dani",
      content: "Saya juga akan hadir",
      time: "11:22",
      isMe: false,
    },
  ],
  102: [
    {
      id: 1,
      sender: "Admin",
      content: "Tim dekorasi, mohon siapkan peralatan untuk acara besok",
      time: "Kemarin 15:30",
      isMe: true,
    },
    {
      id: 2,
      sender: "Tono",
      content: "Jangan lupa bawa peralatan tambahan untuk antisipasi",
      time: "Kemarin 15:45",
      isMe: false,
    },
  ],
  103: [
    {
      id: 1,
      sender: "Admin",
      content: "Selamat siang semua, mohon konfirmasi kehadiran untuk acara Anisa & Budi tanggal 15 Mei",
      time: "2 hari lalu 13:00",
      isMe: true,
    },
    {
      id: 2,
      sender: "Rina",
      content: "Saya hadir",
      time: "2 hari lalu 13:15",
      isMe: false,
    },
    {
      id: 3,
      sender: "Tono",
      content: "Tim dekorasi siap",
      time: "2 hari lalu 13:20",
      isMe: false,
    },
  ],
}

export default function PesanPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("personal")
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [newMessage, setNewMessage] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [showContacts, setShowContacts] = useState(true)
  const isMobile = useMobile()

  // Filter kontak berdasarkan pencarian
  const filteredContacts = contacts.filter((contact) => contact.name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Filter grup berdasarkan pencarian
  const filteredGroups = groups.filter((group) => group.name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Set pesan berdasarkan kontak yang dipilih
  useEffect(() => {
    if (selectedChat) {
      setMessages(messagesData[selectedChat.id] || [])
      if (isMobile) {
        setShowContacts(false)
      }
    }
  }, [selectedChat, isMobile])

  // Fungsi untuk mengirim pesan
  const sendMessage = () => {
    if (newMessage.trim() === "") return

    // Tambahkan pesan baru
    const newMsg = {
      id: messages.length + 1,
      sender: "Me",
      content: newMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
    }

    setMessages([...messages, newMsg])
    setNewMessage("")
  }

  return (
    <div className="h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-pink-900">Pesan</h1>
          <p className="text-sm text-muted-foreground">Komunikasi dengan tim dan klien</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-pink-600 hover:bg-pink-700 w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Buat Grup Baru
          </Button>
        </div>
      </div>

      <Card className="flex-1 border-pink-100 overflow-hidden">
        <CardContent className="p-0 flex h-full">
          {/* Sidebar kontak - tampilkan hanya jika showContacts true atau desktop */}
          {(showContacts || !isMobile) && (
            <div className={`${isMobile ? "w-full" : "w-full md:w-80"} border-r border-pink-100 flex flex-col h-full`}>
              <div className="p-3 border-b border-pink-100">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Cari kontak atau grup..."
                    className="pl-8 border-pink-200 h-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <Tabs defaultValue="personal" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full grid grid-cols-2 bg-pink-50">
                  <TabsTrigger value="personal" className="data-[state=active]:bg-white">
                    Personal
                  </TabsTrigger>
                  <TabsTrigger value="groups" className="data-[state=active]:bg-white">
                    <Users className="h-4 w-4 mr-2" /> Grup
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="m-0 p-0 h-[calc(100vh-16rem)]">
                  <ScrollArea className="h-full">
                    {filteredContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-pink-50 transition-colors ${
                          selectedChat?.id === contact.id ? "bg-pink-50" : ""
                        }`}
                        onClick={() => setSelectedChat(contact)}
                      >
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={contact.avatar} alt={contact.name} />
                            <AvatarFallback className="bg-pink-200 text-pink-700">
                              {contact.name.split(" ")[0][0]}
                            </AvatarFallback>
                          </Avatar>
                          {contact.online && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <p className="font-medium text-sm truncate">{contact.name}</p>
                            <p className="text-xs text-muted-foreground">{contact.time}</p>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{contact.lastMessage}</p>
                        </div>
                        {contact.unread > 0 && (
                          <Badge className="bg-pink-600 hover:bg-pink-600">{contact.unread}</Badge>
                        )}
                      </div>
                    ))}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="groups" className="m-0 p-0 h-[calc(100vh-16rem)]">
                  <ScrollArea className="h-full">
                    {filteredGroups.map((group) => (
                      <div
                        key={group.id}
                        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-pink-50 transition-colors ${
                          selectedChat?.id === group.id ? "bg-pink-50" : ""
                        }`}
                        onClick={() => setSelectedChat(group)}
                      >
                        <Avatar>
                          <AvatarImage src={group.avatar} alt={group.name} />
                          <AvatarFallback className="bg-pink-200 text-pink-700">
                            {group.name.split(" ")[0][0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <p className="font-medium text-sm truncate">{group.name}</p>
                            <p className="text-xs text-muted-foreground">{group.time}</p>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{group.lastMessage}</p>
                        </div>
                        {group.unread > 0 && <Badge className="bg-pink-600 hover:bg-pink-600">{group.unread}</Badge>}
                      </div>
                    ))}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Area chat - tampilkan hanya jika showContacts false atau desktop */}
          {(!showContacts || !isMobile) && (
            <div className={`${isMobile ? "w-full" : "flex-1"} flex flex-col h-full`}>
              {selectedChat ? (
                <>
                  <div className="flex items-center justify-between p-3 border-b border-pink-100">
                    {isMobile && (
                      <Button variant="ghost" size="icon" onClick={() => setShowContacts(true)}>
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                    )}
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={selectedChat.avatar} alt={selectedChat.name} />
                        <AvatarFallback className="bg-pink-200 text-pink-700">
                          {selectedChat.name.split(" ")[0][0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedChat.name}</p>
                        {selectedChat.members ? (
                          <p className="text-xs text-muted-foreground">{selectedChat.members.length} anggota</p>
                        ) : (
                          <p className="text-xs text-muted-foreground">{selectedChat.online ? "Online" : "Offline"}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {!selectedChat.members && (
                        <>
                          <Button variant="ghost" size="icon" className="text-pink-600">
                            <Phone className="h-5 w-5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-pink-600">
                            <Video className="h-5 w-5" />
                          </Button>
                        </>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {selectedChat.members ? (
                            <>
                              <DropdownMenuItem>Lihat anggota grup</DropdownMenuItem>
                              <DropdownMenuItem>Tambah anggota</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Keluar dari grup</DropdownMenuItem>
                            </>
                          ) : (
                            <>
                              <DropdownMenuItem>Lihat profil</DropdownMenuItem>
                              <DropdownMenuItem>Arsipkan chat</DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem className="text-red-600">Hapus chat</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <ScrollArea className="flex-1 p-3 space-y-3 bg-pink-50/30">
                    {messages.map((message) => (
                      <div key={message.id} className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}>
                        {!message.isMe && (
                          <Avatar className="h-8 w-8 mr-2 mt-1">
                            <AvatarFallback className="text-xs bg-pink-200 text-pink-700">
                              {message.sender[0]}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.isMe ? "bg-pink-600 text-white" : "bg-white border border-pink-100"
                          }`}
                        >
                          {!message.isMe && selectedChat.members && (
                            <p className="text-xs font-medium text-pink-600 mb-1">{message.sender}</p>
                          )}
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 text-right ${
                              message.isMe ? "text-pink-100" : "text-muted-foreground"
                            }`}
                          >
                            {message.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>

                  <div className="p-3 border-t border-pink-100">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="text-pink-600">
                        <Paperclip className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-pink-600">
                        <ImageIcon className="h-5 w-5" />
                      </Button>
                      <Input
                        placeholder="Ketik pesan..."
                        className="border-pink-200 h-10"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            sendMessage()
                          }
                        }}
                      />
                      <Button variant="ghost" size="icon" className="text-pink-600">
                        <Smile className="h-5 w-5" />
                      </Button>
                      <Button size="icon" className="bg-pink-600 hover:bg-pink-700" onClick={sendMessage}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <Users className="h-16 w-16 text-pink-200 mb-4" />
                  <p className="text-lg font-medium text-pink-900">Pilih kontak atau grup</p>
                  <p className="text-muted-foreground">Pilih kontak atau grup untuk memulai percakapan</p>
                  {isMobile && (
                    <Button variant="outline" className="mt-4" onClick={() => setShowContacts(true)}>
                      Kembali ke Daftar Kontak
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
