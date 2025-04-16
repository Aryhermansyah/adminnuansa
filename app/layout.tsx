import "./globals.css"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { DataProvider } from "@/contexts/data-context"
import { ErrorBoundary } from "@/components/error-boundary"

// Preload font untuk performa
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["Arial", "sans-serif"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    template: "%s | Nuansa Wedding",
    default: "Nuansa Wedding Application",
  },
  description: "Aplikasi manajemen Nuansa Wedding untuk rias dan dekorasi pernikahan",
  keywords: ["wedding", "rias", "dekorasi", "pernikahan", "manajemen"],
  creator: "Nuansa Wedding",
  publisher: "Nuansa Wedding",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: [
    {
      rel: "icon",
      url: "/icons/icon-192x192.png",
      sizes: "192x192",
      type: "image/png",
    },
    {
      rel: "apple-touch-icon",
      url: "/icons/icon-512x512.png",
      sizes: "512x512", 
      type: "image/png",
    },
  ],
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={inter.className} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <DataProvider>{children}</DataProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}


import './globals.css'