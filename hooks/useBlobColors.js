import { useState, useEffect } from 'react'
import { hexToHsl, hslToHex } from '@/utils/colors'
import { BOX_WIDTH, BOX_HEIGHT } from '@/constants/layout3Tokens'

/**
 * Hook to generate random blob colors and animation parameters
 */
export const useBlobColors = (baseColor) => {
  const [blobGridColors, setBlobGridColors] = useState([])
  const [blobAnimations, setBlobAnimations] = useState([])

  useEffect(() => {
    const [baseH, baseS, baseL] = hexToHsl(baseColor)
    const colors = []
    const animations = []
    
    for (let i = 0; i < 9; i++) {
      // Randomize within ±30 range
      const randomH = (baseH + (Math.random() * 60 - 30) + 360) % 360
      // Preserve monochrome (S=0) if base color is monochrome
      const randomS = baseS === 0 ? 0 : Math.max(0, Math.min(100, baseS + (Math.random() * 60 - 30)))
      const randomL = Math.max(0, Math.min(100, baseL + (Math.random() * 60 - 30)))
      colors.push(hslToHex(randomH, randomS, randomL))
      
      // Generate random animation parameters
      const padding = 1
      const maxCircleSize = 58 // Approximate max size
      const availableWidth = Math.max(0, BOX_WIDTH - (padding * 2) - maxCircleSize)
      const availableHeight = Math.max(0, BOX_HEIGHT - (padding * 2) - maxCircleSize)
      const startX = padding + Math.random() * availableWidth
      const startY = padding + Math.random() * availableHeight
      
      const maxMove = 30
      const moveX1 = (Math.random() - 0.5) * maxMove * 2
      const moveY1 = (Math.random() - 0.5) * maxMove * 2
      const moveX2 = (Math.random() - 0.5) * maxMove * 2
      const moveY2 = (Math.random() - 0.5) * maxMove * 2
      const moveX3 = (Math.random() - 0.5) * maxMove * 2
      const moveY3 = (Math.random() - 0.5) * maxMove * 2
      
      const duration = 3 + Math.random() * 3 // Longer, more varied durations (3-6s)
      const delay = Math.random() * 1.5 // Slightly longer delays
      
      animations.push({
        startX,
        startY,
        moveX1,
        moveY1,
        moveX2,
        moveY2,
        moveX3,
        moveY3,
        duration,
        delay,
      })
    }
    
    setBlobGridColors(colors)
    setBlobAnimations(animations)
  }, [baseColor])

  return { blobGridColors, blobAnimations }
}

