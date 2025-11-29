'use client'

import React from 'react'
import Layout3Box from '@/components/Layout3Box'

// Brand colors and logos from Layout 2
const BOX_CONFIGS = [
  // Row 1
  {
    logoPath: '/assets/GiftSent/SVG Logo/Goody.svg',
    boxColor: '#B89EFF',
  },
  {
    logoPath: '/assets/GiftSent/SVG Logo/Chipotle.svg',
    boxColor: '#AC2318',
  },
  {
    logoPath: '/assets/GiftSent/SVG Logo/Logo.svg', // Columbia
    boxColor: '#1987C7',
  },
  {
    logoPath: '/assets/GiftSent/SVG Logo/Nike.svg',
    boxColor: '#B8B8B8',
  },
  // Row 2
  {
    logoPath: '/assets/GiftSent/SVG Logo/Apple.svg',
    boxColor: '#D6D6D6',
  },
  {
    logoPath: '/assets/GiftSent/SVG Logo/Supergoop.svg',
    boxColor: '#0000B4',
  },
  {
    logoPath: '/assets/GiftSent/SVG Logo/Tiffany & Co.svg',
    boxColor: '#81D8D0',
  },
  {
    logoPath: '/assets/GiftSent/SVG Logo/Goody.svg',
    boxColor: '#B89EFF',
  },
]

const Layout3Canvas = () => {
  return (
    <div 
      className="w-full bg-white flex items-center justify-center" 
      style={{ minHeight: 'calc(100vh - 200px)', padding: '40px 20px' }}
    >
      <div 
        className="flex flex-col items-center justify-center gap-8"
        style={{ maxWidth: '1200px' }}
      >
        {/* Row 1 */}
        <div className="flex items-center justify-center gap-8">
          {BOX_CONFIGS.slice(0, 4).map((config, index) => (
            <Layout3Box
              key={index}
              logoPath={config.logoPath}
              boxColor={config.boxColor}
            />
          ))}
        </div>
        {/* Row 2 */}
        <div className="flex items-center justify-center gap-8">
          {BOX_CONFIGS.slice(4, 8).map((config, index) => (
            <Layout3Box
              key={index + 4}
              logoPath={config.logoPath}
              boxColor={config.boxColor}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Layout3Canvas

