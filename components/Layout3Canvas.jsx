'use client'

import React, { useState, useEffect } from 'react'
import Layout3Box from '@/components/Layout3Box'
import Envelope3 from '@/components/Envelope3'

// Shuffle function (Fisher-Yates algorithm)
const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

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

// Generate random progress values
const generateRandomProgress = () => {
  const total = Math.floor(Math.random() * 20) + 10 // Random total between 10-30
  const current = Math.floor(Math.random() * total) + 1 // Random current between 1-total
  return { current, total }
}

const Layout3Canvas = ({ shuffleSeed = 0 }) => {
  const [shuffledConfigs, setShuffledConfigs] = useState(BOX_CONFIGS)
  const [progressValues, setProgressValues] = useState([])

  useEffect(() => {
    // Shuffle boxes on component mount/reload or when shuffleSeed changes
    const shuffled = shuffleArray(BOX_CONFIGS)
    setShuffledConfigs(shuffled)
    // Generate random progress values for each shuffled box
    setProgressValues(shuffled.map(() => generateRandomProgress()))
  }, [shuffleSeed])

  return (
    <div 
      className="w-full bg-white flex items-center justify-center" 
      style={{ minHeight: 'calc(100vh - 200px)', padding: '20px 20px', overflow: 'visible' }}
    >
      <div 
        className="flex flex-col items-center justify-center gap-8"
        style={{ maxWidth: '1200px', overflow: 'visible' }}
      >
        {/* Envelope3 and Box3 side by side */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8" style={{ overflow: 'visible' }}>
          <Envelope3
            logoPath={BOX_CONFIGS[0].logoPath}
            boxColor={BOX_CONFIGS[0].boxColor}
            progress={progressValues[0] || { current: 1, total: 25 }}
            coverImage="/assets/covers/Birthday01.png"
          />
          <Layout3Box
            logoPath={BOX_CONFIGS[0].logoPath}
            boxColor={BOX_CONFIGS[0].boxColor}
            progress={progressValues[0] || { current: 1, total: 25 }}
          />
        </div>
      </div>
    </div>
  )
}

export default Layout3Canvas

