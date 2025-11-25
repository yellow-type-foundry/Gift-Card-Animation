/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Enable image optimization
    formats: ['image/avif', 'image/webp'],
    // Optimize images for better performance
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Prevent Next.js from bundling Puppeteer packages
  serverExternalPackages: ['@sparticuz/chromium-min', 'puppeteer-core'],
  // Additional webpack configuration to ensure packages are externalized
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark these packages as external for server-side bundles
      config.externals = config.externals || []
      config.externals.push({
        '@sparticuz/chromium-min': 'commonjs @sparticuz/chromium-min',
        'puppeteer-core': 'commonjs puppeteer-core',
      })
    }
    return config
  },
}

module.exports = nextConfig

