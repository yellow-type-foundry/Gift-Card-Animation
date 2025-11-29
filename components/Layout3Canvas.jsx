'use client'

import React from 'react'
import Layout3Box from '@/components/Layout3Box'

// Brand colors and logos from Layout 2
const BOX_CONFIGS = [
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
]

const Layout3Canvas = () => {
  return (
    <div 
      className="w-full bg-white flex items-center justify-center" 
      style={{ minHeight: 'calc(100vh - 200px)', padding: '40px 20px' }}
    >
      <div 
        className="flex items-center justify-center gap-8"
        style={{ maxWidth: '1200px', flexWrap: 'wrap' }}
      >
        {BOX_CONFIGS.map((config, index) => (
          <Layout3Box
            key={index}
            logoPath={config.logoPath}
            boxColor={config.boxColor}
          />
        ))}
      </div>
    </div>
  )
}

export default Layout3Canvas

