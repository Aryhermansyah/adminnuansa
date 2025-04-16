"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useResponsiveScale } from "@/hooks/use-responsive-scale"

// Dummy data untuk tim
const teamMembers = [
  {
    id: "1",
    name: "Dewi Anggraini",
    role: "Makeup Artist",
    status: "Tetap",
    phone: "0812-3456-7890",
    lastEvent: "2 hari lalu",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: "2",
    name: "Budi Santoso",
    role: "Dekorator",
    status: "Tetap",
    phone: "0813-2345-6789",
    lastEvent: "1 minggu lalu",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: "3",
    name: "Citra Lestari",
    role: "Asisten MUA",
    status: "Freelance",
    phone: "0857-1234-5678",
    lastEvent: "3 hari lalu",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: "4",
    name: "Dodi Permana",
    role: "Fotografer",
    status: "Freelance",
    phone: "0878-8765-4321",
    lastEvent: "2 minggu lalu",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: "5",
    name: "Eka Putri",
    role: "Asisten Dekorasi",
    status: "Tetap",
    phone: "0856-7890-1234",
    lastEvent: "1 hari lalu",
    avatar: "/placeholder-user.jpg",
  },
]

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const scale = useResponsiveScale()

  // Filter team members berdasarkan pencarian
  const filteredTeamMembers = teamMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-scale-2xl font-bold text-pink-900">Tim</h1>
          <p className="text-scale-sm text-muted-foreground">Kelola anggota tim dan freelancer</p>
        </div>
        <Button asChild className="action-button-primary w-full sm:w-auto">
          <Link href="/tim/tambah">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Anggota
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari anggota tim..."
            className="pl-8 mobile-input w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="mobile-button">
          <Filter className="h-4 w-4" />
          <span className="sr-only">Filter</span>
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1">
        {filteredTeamMembers.length > 0 ? (
          filteredTeamMembers.map((member) => (
            <Link href={`/tim/${member.id}`} key={member.id} className="block">
              <Card className="mobile-card hover:border-pink-200 transition-colors">
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback className="bg-pink-200 text-pink-700">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-scale-base">{member.name}</h3>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <Badge
                        variant={member.status === "Tetap" ? "default" : "outline"}
                        className={
                          member.status === "Tetap"
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                            : "bg-orange-100 text-orange-800 hover:bg-orange-100"
                        }
                      >
                        {member.status}
                      </Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Telepon</p>
                        <p>{member.phone}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Event Terakhir</p>
                        <p>{member.lastEvent}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <Card className="mobile-card">
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground">Tidak ada anggota tim yang ditemukan</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
