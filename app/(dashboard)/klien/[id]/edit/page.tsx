// Aplikasi menggunakan Next.js dengan output: export
// File ini adalah versi server, sementara client-component.tsx berisi versi klien

import { DataLoading } from "@/components/data-loading"
import { EditClientClient } from "./client-component"

// Untuk mendukung output: export
export const dynamic = "force-static"

// Fungsi generateStaticParams diperlukan untuk rute dinamis dengan output: export
export async function generateStaticParams() {
  // Dalam aplikasi produksi, Anda akan mengambil ID klien dari database
  // Untuk sekarang, kita akan mengembalikan ID dummy
  return Array.from({ length: 10 }, (_, i) => ({
    id: String(i + 1),
  }))
}

export default function EditClientPage() {
  return <EditClientClient />
}
