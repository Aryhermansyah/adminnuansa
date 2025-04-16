"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { setCookie } from 'cookies-next'
// @ts-ignore
import Cookies from 'js-cookie'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  
  // Cek login status saat komponen dimuat
  useEffect(() => {
    console.log("Login page loaded")
    const token = document.cookie.includes('token=')
    console.log("Token exists in cookies:", token)
    
    const localToken = localStorage.getItem('token')
    console.log("Token exists in localStorage:", !!localToken)
    
    // Hapus pesan error jika ada
    if (error) setError('')
  }, [error])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      console.log("Login attempt with:", formData.username)
      
      // Verifikasi kredensial
      if (formData.username !== "admin@nuansa.com" || formData.password !== "nuansa@@2025") {
        throw new Error("Username atau password tidak valid")
      }
      
      // Gunakan login simulasi langsung untuk memastikan fungsi dasar
      const userData = {
        id: 1,
        name: "Admin Nuansa",
        role: "admin",
        email: "admin@nuansa.com"
      }
      
      // Buat token sederhana
      const token = "direct-login-token-" + Date.now()
      
      console.log("Setting token directly:", token)
      
      // Simpan token dengan multiple methods untuk memastikan
      // Metode 1: Cookies-next
      setCookie('token', token, { maxAge: 60 * 60 * 24 * 7 }) // 7 hari
      setCookie('user', JSON.stringify(userData), { maxAge: 60 * 60 * 24 * 7 })
      
      // Metode 2: js-cookie
      Cookies.set('token_alt', token, { expires: 7 })
      Cookies.set('user_alt', JSON.stringify(userData), { expires: 7 })
      
      // Metode 3: document.cookie langsung
      document.cookie = `token_direct=${token};path=/;max-age=${60*60*24*7}`
      document.cookie = `user_direct=${JSON.stringify(userData)};path=/;max-age=${60*60*24*7}`
      
      // Simpan juga ke localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      
      // Verifikasi semua cookies tersimpan
      console.log("All cookies after setting:", document.cookie)
      console.log("js-cookie value:", Cookies.get('token_alt'))
      console.log("localStorage value:", localStorage.getItem('token'))
      
      // Manual refresh browser untuk memastikan cookies tersimpan
      alert("Login berhasil! Menyimpan token dan merefresh halaman...")
      
      // Redirect dengan window.location untuk hard reload
      window.location.href = "/dashboard"
    } catch (error) {
      console.error("Error during login:", error)
      setError(error instanceof Error ? error.message : String(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white p-4">
      <Card className="w-full max-w-sm shadow-lg border-pink-100">
        <CardHeader className="items-center text-center space-y-1">
          <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold text-pink-800 tracking-wide">NUANSA</h1>
            <h1 className="text-3xl font-bold text-pink-800 tracking-wide">WEDDING GALLERY</h1>
          </div>
          <CardTitle className="text-2xl font-bold text-pink-800 mt-4">Login</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm bg-red-50 text-red-600 rounded-md border border-red-200">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="Masukkan email"
                value={formData.username}
                onChange={handleChange}
                className="border-pink-200 focus-visible:ring-pink-400 h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={formData.password}
                  onChange={handleChange}
                  className="border-pink-200 focus-visible:ring-pink-400 pr-10 h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 p-2 touch-manipulation"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 h-12 text-base" disabled={loading}>
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
