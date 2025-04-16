'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ClearCookies() {
  const router = useRouter()

  useEffect(() => {
    // Hapus semua cookies dengan mengatur expiry date ke masa lalu
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=')
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
    })
    
    // Hapus localStorage
    localStorage.clear()
    
    // Redirect ke halaman login setelah 2 detik
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Clearing Cookies...</h1>
        <p className="mb-4">Removing all browser cookies and local storage</p>
        <p>You will be redirected to the login page shortly.</p>
      </div>
    </div>
  )
} 