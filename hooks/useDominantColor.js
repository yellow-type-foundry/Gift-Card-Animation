import { useState, useEffect } from 'react'

/**
 * Extracts the dominant color from an image by sampling pixels
 * and returning the average RGB color
 */
const extractDominantColor = (imageSrc) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Sample the top portion of the image (30% for header background)
        canvas.width = img.width
        canvas.height = Math.floor(img.height * 0.3)
        
        // Draw the image on canvas (only top portion)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height)
        
        // Get pixel data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const pixels = imageData.data
        
        // Sample pixels (every 16th pixel for performance)
        const colors = []
        for (let i = 0; i < pixels.length; i += 16) {
          colors.push({
            r: pixels[i],
            g: pixels[i + 1],
            b: pixels[i + 2]
          })
        }
        
        // Calculate average color
        const avg = colors.reduce(
          (acc, color) => ({
            r: acc.r + color.r / colors.length,
            g: acc.g + color.g / colors.length,
            b: acc.b + color.b / colors.length
          }),
          { r: 0, g: 0, b: 0 }
        )
        
        // Calculate perceived brightness (luminance) on 0-100 scale
        // Formula: (R * 299 + G * 587 + B * 114) / 1000 gives 0-255, convert to 0-100
        const brightness = ((avg.r * 299 + avg.g * 587 + avg.b * 114) / 1000) * (100 / 255)
        
        // Cap luminance at 50 - darken if above 50
        let finalColor = { r: avg.r, g: avg.g, b: avg.b }
        if (brightness > 50) {
          // Darken the color by scaling down proportionally
          const darkenFactor = 50 / brightness
          finalColor = {
            r: avg.r * darkenFactor,
            g: avg.g * darkenFactor,
            b: avg.b * darkenFactor
          }
        }
        
        // Convert to hex
        const toHex = (value) => {
          const clamped = Math.max(0, Math.min(255, Math.round(value)))
          const hex = clamped.toString(16).padStart(2, '0')
          return hex
        }
        
        const hex = `#${toHex(finalColor.r)}${toHex(finalColor.g)}${toHex(finalColor.b)}`
        resolve(hex)
      } catch (error) {
        reject(error)
      }
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    img.src = imageSrc
  })
}

/**
 * Custom hook to extract dominant color from an image
 * Caches the result in localStorage for performance
 */
const useDominantColor = (imageSrc, fallbackColor = '#47caeb') => {
  const [dominantColor, setDominantColor] = useState(fallbackColor)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!imageSrc) {
      setDominantColor(fallbackColor)
      setIsLoading(false)
      return
    }

    // Check cache first (only in browser)
    const cacheKey = `color-${imageSrc}`
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(cacheKey)
      
      if (cached) {
        setDominantColor(cached)
        setIsLoading(false)
        return
      }
    }

    // Extract color from image
    setIsLoading(true)
    extractDominantColor(imageSrc)
      .then((color) => {
        setDominantColor(color)
        // Cache the result (only in browser)
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(cacheKey, color)
          } catch (error) {
            // localStorage might be full or unavailable
            console.warn('Failed to cache color:', error)
          }
        }
        setIsLoading(false)
      })
      .catch((error) => {
        console.warn('Failed to extract color from image:', error)
        setDominantColor(fallbackColor)
        setIsLoading(false)
      })
  }, [imageSrc, fallbackColor])

  return { dominantColor, isLoading }
}

export default useDominantColor

