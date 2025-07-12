/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['res.cloudinary.com', 'localhost'],
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:5000',
  },
}

module.exports = nextConfig