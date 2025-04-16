// Aplikasi menggunakan Next.js dengan output: export
// File ini adalah versi server, sementara client-component.tsx berisi versi klien

import { DataLoading } from "@/components/data-loading"
import { EditClientClient } from "./client-component"

// Konfigurasi dynamic rendering
export const dynamic = "force-dynamic"

export default function EditClientPage() {
  return <EditClientClient />
}
