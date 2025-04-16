import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Halaman-halaman yang tidak memerlukan autentikasi
const publicPages = ['/login', '/clear-cookies', '/force-logout', '/api']

export function middleware(request: NextRequest) {
  const time = new Date().toISOString()
  console.log(`[${time}] Middleware running, path:`, request.nextUrl.pathname);
  
  // Path saat ini
  const { pathname } = request.nextUrl
  
  // Cek apakah halaman saat ini adalah halaman publik
  const isPublicPage = publicPages.some(page => pathname.startsWith(page))
  
  // Cek apakah user sudah login (token tersimpan) dengan memeriksa semua cookies yang mungkin
  const token = request.cookies.get('token')?.value || 
                request.cookies.get('token_alt')?.value || 
                request.cookies.get('token_direct')?.value
                
  const allCookies = request.cookies.getAll()
  
  console.log(`[${time}] Token exists:`, !!token, 'isPublicPage:', isPublicPage);
  console.log(`[${time}] Available cookies:`, allCookies.map(c => c.name));
  
  // Jika halaman memerlukan autentikasi dan user tidak memiliki token
  if (!isPublicPage && !token) {
    // Redirect ke halaman login
    const url = new URL('/login', request.url)
    console.log(`[${time}] Redirecting to login from:`, pathname);
    return NextResponse.redirect(url)
  }
  
  // Jika ini halaman login dan user sudah memiliki token, redirect ke dashboard
  if (pathname === '/login' && token) {
    console.log(`[${time}] User already logged in, redirecting to dashboard`);
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // Untuk halaman root, redirect ke dashboard jika sudah login, atau ke login jika belum
  if (pathname === '/') {
    if (token) {
      console.log(`[${time}] Root path with token, redirecting to dashboard`);
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      console.log(`[${time}] Root path without token, redirecting to login`);
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  // Lanjutkan request untuk kasus lainnya
  console.log(`[${time}] Continuing to:`, pathname);
  return NextResponse.next()
}

// Konfigurasi middleware hanya untuk path tertentu
export const config = {
  // Terapkan middleware pada semua path kecuali asset statis
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
} 