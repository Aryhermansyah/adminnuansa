"use client"

import { useEffect, useState } from "react"
import { dbService } from "@/lib/db/db-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DBInitStatus() {
  const [isReady, setIsReady] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkDatabase = async () => {
    setIsChecking(true)
    try {
      // @ts-ignore - We know this method exists
      const ready = await dbService.isDatabaseReady()
      setIsReady(ready)
    } catch (error) {
      console.error("Error checking database:", error)
      setIsReady(false)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkDatabase()
  }, [])

  if (isReady === null) {
    return (
      <Alert className="mb-4 border-yellow-200 bg-yellow-50">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800">Memeriksa status database...</AlertTitle>
        <AlertDescription className="text-yellow-700">
          Mohon tunggu sementara kami memeriksa koneksi database.
        </AlertDescription>
      </Alert>
    )
  }

  if (isReady === false) {
    return (
      <Alert className="mb-4 border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Database tidak siap</AlertTitle>
        <AlertDescription className="text-red-700">
          <p className="mb-2">
            Terjadi masalah saat menginisialisasi database. Beberapa fitur mungkin tidak berfungsi.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="border-red-200 text-red-700 hover:bg-red-100"
            onClick={checkDatabase}
            disabled={isChecking}
          >
            {isChecking ? "Memeriksa..." : "Periksa Kembali"}
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="mb-4 border-green-200 bg-green-50">
      <CheckCircle2 className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-800">Database siap</AlertTitle>
      <AlertDescription className="text-green-700">
        Database telah diinisialisasi dengan baik. Semua fitur siap digunakan.
      </AlertDescription>
    </Alert>
  )
}
