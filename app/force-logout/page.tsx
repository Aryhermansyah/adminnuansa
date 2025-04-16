'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { deleteCookie } from 'cookies-next'

export default function ForceLogout() {
  const router = useRouter()

  useEffect(() => {
    // Hapus semua cookies yang terkait autentikasi
    deleteCookie('token')
    deleteCookie('user')
    
    // Tambahkan clear localStorage jika perlu
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    
    // Redirect ke halaman login setelah 2 detik
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Logging Out...</h1>
        <p className="mb-4">Clearing all authentication data</p>
        <p>You will be redirected to the login page shortly.</p>
      </div>
    </div>
  )
} 