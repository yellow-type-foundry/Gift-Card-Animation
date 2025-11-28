import { useMemo } from 'react'
import { darkenHex, lightenHex, adjustToLuminance, capSaturation } from '@/utils/colors'

/**
 * Custom hook for calculating card theme colors based on dominant color
 * @param {string} dominantColor - The dominant color from the image
 * @param {string|null} headerBgOverride - Optional override for header background
 * @returns {Object} Theme color values
 */
export default function useCardTheme(dominantColor, headerBgOverride = null) {
  const hiddenFlapColor = useMemo(
    () => capSaturation(lightenHex(dominantColor, 4.0), 100),
    [dominantColor]
  )
  
  const headerBgColor = useMemo(
    () => {
      // Fallback to a default color if dominantColor is invalid
      if (!dominantColor || dominantColor === '#f4c6fa' || dominantColor === '#000000' || dominantColor === '#ffffff') {
        return '#E3E7ED' // Default gray background
      }
      // Very pastel: high luminance (100 = maximum lightness) and low saturation (15 = very muted)
      return capSaturation(adjustToLuminance(dominantColor, 100), 5)
    },
    [dominantColor]
  )
  
  const headerBgFinal = headerBgOverride || headerBgColor || '#E3E7ED' // Fallback to gray if both are falsy
  const isMonochromeVariant = Boolean(headerBgOverride)
  // When theming is enabled (headerBgOverride is null), use dark text on pastel background
  // When theming is disabled (headerBgOverride is set), use dark text on gray background
  const headerTextClass = 'text-black' // Always use dark text for better contrast on pastel/gray backgrounds
  
  const baseTintColor = useMemo(
    () => capSaturation(adjustToLuminance(dominantColor, 85), 70),
    [dominantColor]
  )
  
  const base2TintColor = useMemo(
    () => capSaturation(lightenHex(dominantColor, 1.25), 65),
    [dominantColor]
  )
  
  const overlayDarkColor = useMemo(
    () => capSaturation(darkenHex(dominantColor, 0.7), 90),
    [dominantColor]
  )
  
  const gridCellBaseColor = useMemo(
    () => capSaturation(adjustToLuminance(headerBgColor, 95), 95),
    [headerBgColor]
  )
  
  // Progress colors themed to image/card
  const progressStartColor = useMemo(
    () => capSaturation(adjustToLuminance(dominantColor, 60), 50),
    [dominantColor]
  )
  
  const progressEndColor = useMemo(
    () => capSaturation(lightenHex(dominantColor, 1.2), 50),
    [dominantColor]
  )
  
  return {
    hiddenFlapColor,
    headerBgColor,
    headerBgFinal,
    isMonochromeVariant,
    headerTextClass,
    baseTintColor,
    base2TintColor,
    overlayDarkColor,
    gridCellBaseColor,
    progressStartColor,
    progressEndColor
  }
}

