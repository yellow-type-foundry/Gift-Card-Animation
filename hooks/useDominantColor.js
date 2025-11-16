import { useState, useEffect } from 'react'

/**
 * Extracts the dominant color from an image using downscaled sampling +
 * simple K-Means clustering (k=5). Filters out near-white/near-black/grayscale
 * pixels and weights clusters by saturation to avoid highlights.
 */
const extractDominantColor = (imageSrc) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    // For local/public assets, crossOrigin isn't needed; for remote, allow CORS when possible
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      try {
        // Downscale for performance and robustness
        const targetW = 128
        const scale = Math.max(1, Math.min(img.width / targetW, img.height / targetW))
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d', { willReadFrequently: true })

        const sampleW = Math.max(16, Math.min(targetW, Math.round(img.width / scale)))
        const sampleH = Math.max(16, Math.round((img.height / img.width) * sampleW))
        canvas.width = sampleW
        canvas.height = sampleH

        // Draw entire image into downscaled canvas
        ctx.drawImage(img, 0, 0, sampleW, sampleH)

        const { data } = ctx.getImageData(0, 0, sampleW, sampleH)

        // Utility: RGB -> HSL
        const rgbToHsl = (r, g, b) => {
          r /= 255; g /= 255; b /= 255
          const max = Math.max(r, g, b), min = Math.min(r, g, b)
          let h, s, l = (max + min) / 2
          const d = max - min
          if (d === 0) {
            h = 0; s = 0
          } else {
            s = d / (1 - Math.abs(2 * l - 1))
            switch (max) {
              case r: h = ((g - b) / d) % 6; break
              case g: h = (b - r) / d + 2; break
              default: h = (r - g) / d + 4
            }
            h *= 60
            if (h < 0) h += 360
          }
          return [h, s, l]
        }

        // Collect candidate pixels (skip very bright/dark, low saturation)
        const samples = []
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3]
          if (a < 200) continue // ignore transparent/semi
          const [h, s, l] = rgbToHsl(r, g, b)
          // ignore near-white or near-black and very low saturation
          if (l > 0.95 || l < 0.06 || s < 0.08) continue
          samples.push([r, g, b, s]) // keep saturation for weighting
        }
        if (samples.length === 0) {
          // Fallback: average color of the whole image
          let rSum = 0, gSum = 0, bSum = 0, n = 0
          for (let i = 0; i < data.length; i += 4) {
            rSum += data[i]; gSum += data[i + 1]; bSum += data[i + 2]; n++
          }
          const r = rSum / n, g = gSum / n, b = bSum / n
          const toHex = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
          resolve(`#${toHex(r)}${toHex(g)}${toHex(b)}`)
          return
        }

        // K-Means clustering (k=5)
        const K = Math.min(5, Math.max(2, Math.floor(samples.length / 100))) // adaptive k
        // Initialize centroids by picking random samples
        const centroids = []
        const usedIdx = new Set()
        while (centroids.length < K) {
          const idx = Math.floor(Math.random() * samples.length)
          if (!usedIdx.has(idx)) {
            usedIdx.add(idx)
            centroids.push(samples[idx].slice(0, 3))
          }
        }

        const MAX_ITERS = 8
        for (let it = 0; it < MAX_ITERS; it++) {
          const clusters = Array.from({ length: K }, () => ({ sum: [0, 0, 0], wsum: 0 }))
          // Assign
          for (const [r, g, b, s] of samples) {
            let best = 0, bestDist = Infinity
            for (let c = 0; c < K; c++) {
              const cr = centroids[c][0], cg = centroids[c][1], cb = centroids[c][2]
              const dr = r - cr, dg = g - cg, db = b - cb
              const dist = dr * dr + dg * dg + db * db
              if (dist < bestDist) { bestDist = dist; best = c }
            }
            // Weight by saturation to bias toward vivid colors
            const w = 0.5 + s // 0.5..1.5
            clusters[best].sum[0] += r * w
            clusters[best].sum[1] += g * w
            clusters[best].sum[2] += b * w
            clusters[best].wsum += w
          }
          // Update
          let moved = 0
          for (let c = 0; c < K; c++) {
            if (clusters[c].wsum > 0) {
              const nr = clusters[c].sum[0] / clusters[c].wsum
              const ng = clusters[c].sum[1] / clusters[c].wsum
              const nb = clusters[c].sum[2] / clusters[c].wsum
              if (Math.abs(nr - centroids[c][0]) > 0.5 ||
                  Math.abs(ng - centroids[c][1]) > 0.5 ||
                  Math.abs(nb - centroids[c][2]) > 0.5) moved++
              centroids[c] = [nr, ng, nb]
            }
          }
          if (moved === 0) break
        }

        // Choose the cluster whose color has the highest saturation and member weight
        const scoreCluster = (rgb) => {
          const [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2])
          // prefer mid luminance and higher saturation
          const lumScore = 1 - Math.abs(l - 0.5) // 0..1
          return s * 0.7 + lumScore * 0.3
        }
        centroids.sort((a, b) => scoreCluster(b) - scoreCluster(a))
        const [dr, dg, db] = centroids[0]

        const toHex = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
        const hex = `#${toHex(dr)}${toHex(dg)}${toHex(db)}`
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

