export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">404 - Halaman Tidak Ditemukan</h1>
      <p className="text-lg mb-8">Maaf, halaman yang Anda cari tidak ditemukan.</p>
      <a href="/" className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors">
        Kembali ke Beranda
      </a>
    </div>
  )
}
