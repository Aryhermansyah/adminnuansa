"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, Home, Shirt, UserPlus, DollarSign } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function Sidebar() {
  const pathname = usePathname()

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/dashboard",
      color: "text-pink-500",
    },
    {
      label: "Klien & Jadwal",
      icon: Users,
      href: "/klien",
      color: "text-violet-500",
    },
    {
      label: "Tim & Vendor",
      icon: UserPlus,
      href: "/tim-vendor",
      color: "text-orange-500",
    },
    {
      label: "Sewa Baju",
      icon: Shirt,
      href: "/sewa-baju",
      color: "text-emerald-500",
    },
    {
      label: "Keuangan",
      icon: DollarSign,
      href: "/keuangan",
      color: "text-green-500",
    },
  ]

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-6">
          <div className="relative w-8 h-8 mr-2">
            <img src="/icons/icon-192x192.png" alt="Logo" />
          </div>
          <h1 className="text-xl font-bold text-pink-900">
            Nuansa<span className="text-pink-600">Wedding</span>
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant={pathname === route.href || pathname.startsWith(route.href + "/") ? "default" : "ghost"}
              className={cn(
                "w-full justify-start pl-3 mb-1",
                pathname === route.href || pathname.startsWith(route.href + "/")
                  ? "bg-pink-100 hover:bg-pink-200 text-pink-900"
                  : "hover:bg-pink-50 text-muted-foreground",
              )}
              asChild
            >
              <Link href={route.href}>
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
