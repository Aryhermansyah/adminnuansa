"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, Home, Shirt, UserPlus, DollarSign } from "lucide-react"

import { cn } from "@/lib/utils"

export function MobileNav() {
  const pathname = usePathname()

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/dashboard",
      color: "text-pink-500",
    },
    {
      label: "Klien",
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
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white border-t border-gray-200 flex justify-between items-center">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center py-2",
              pathname === route.href || pathname.startsWith(route.href + "/")
                ? "text-pink-600"
                : "text-gray-500 hover:text-pink-600",
            )}
          >
            <route.icon className="h-5 w-5" />
            <span className="text-xs mt-1">{route.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
