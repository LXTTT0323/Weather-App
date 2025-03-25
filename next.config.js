/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['openweathermap.org'],
  },
  env: {
    OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY || '',
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
  },
};

module.exports = nextConfig; 