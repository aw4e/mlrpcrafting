/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: false, // paksa pakai webpack, bukan turbopack
  },
}

module.exports = nextConfig
