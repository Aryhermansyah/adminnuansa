'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCookie } from 'cookies-next'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Cek apakah user sudah login
    const hasToken = getCookie('token') || 
                     getCookie('token_alt') || 
                     getCookie('token_direct') ||
                     localStorage.getItem('token')
                     
    console.log('Token check on homepage:', !!hasToken)
    
    if (hasToken) {
      // Jika sudah login, arahkan ke dashboard
      console.log('Token found, redirecting to dashboard')
      router.push('/dashboard')
    } else {
      // Jika belum login, arahkan ke halaman login
      console.log('No token found, redirecting to login')
      router.push('/login')
    }
  }, [router])

  // Tampilkan loading state saat redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-pink-800 mb-4">NuansaWedding Office</h1>
        <p className="text-gray-500">Memuat...</p>
      </div>
    </div>
  )
}
