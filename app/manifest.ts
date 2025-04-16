import { MetadataRoute } from "next"

// Memperbaiki error export const dynamic = "force-static"/export const revalidate not configured
// Untuk mendukung output: export
export const dynamic = "force-static"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nuansa Wedding Admin",
    short_name: "NuansaAdmin",
    description: "Aplikasi pengelolaan klien Nuansa Wedding Organizer",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#F9A8D4",
    
    // ID statis untuk menghindari recompile berulang
    id: "nuansa-wedding-app-v1",
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "Lihat ringkasan data",
        url: "/dashboard",
      },
      {
        name: "Klien",
        short_name: "Klien",
        description: "Kelola data klien",
        url: "/klien",
      }
    ],
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  }
}
