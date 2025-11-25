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
  // Prevent Next.js from bundling Puppeteer packages using webpack externals
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark these packages as external for server-side bundles
      // Use array format to ensure proper externalization
      config.externals = config.externals || []
      
      // Add as strings to ensure they're treated as external modules
      if (Array.isArray(config.externals)) {
        config.externals.push('@sparticuz/chromium-min', 'puppeteer-core')
      } else {
        // If externals is an object, add to it
        config.externals['@sparticuz/chromium-min'] = '@sparticuz/chromium-min'
        config.externals['puppeteer-core'] = 'puppeteer-core'
      }
    }
    return config
  },
}

module.exports = nextConfig

