/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mengabaikan error TypeScript pada build time
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Mengizinkan semua domain eksternal untuk optimisasi gambar
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    dangerouslyAllowSVG: true,
  },
  
  // Konfigurasi output untuk rendering statis opsional
  // Jangan menonaktifkan output: 'export' kecuali diperlukan
  // output: 'export',

  // Konfigurasi transpilasi aplikasi
  transpilePackages: [],
  
  // Konfigurasi webpack tambahan jika diperlukan
  webpack: (config, { dev, isServer }) => {
    // Konfigurasi kustom untuk webpack
    return config
  },
}

module.exports = nextConfig 