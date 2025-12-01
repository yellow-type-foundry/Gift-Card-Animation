// Helper functions for SentCard component
// Extracted from components/SentCard.jsx to improve maintainability and performance

import { BOX1_IMAGES, LOGO_PNG_TO_SVG_MAP, LOGO_BRAND_COLORS } from '@/constants/sentCardBrandConstants'

/**
 * Select Box1 image randomly but consistently per card
 */
export const getBox1Image = (useBox1, layout2BoxType, boxImage) => {
  if (!useBox1 && layout2BoxType !== '1') return null
  // Use boxImage as a seed for consistent random selection per card
  let hash = 0
  for (let i = 0; i < boxImage.length; i++) {
    hash = ((hash << 5) - hash) + boxImage.charCodeAt(i)
    hash = hash & hash // Convert to 32-bit integer
  }
  const index = Math.abs(hash) % BOX1_IMAGES.length
  return BOX1_IMAGES[index]
}

/**
 * Map PNG logo to SVG logo for text emboss styling
 */
export const getSvgLogoPath = (hideEnvelope, showGiftBoxWhenHidden, box1Image, boxImage) => {
  // For Single 2 (hideEnvelope && showGiftBoxWhenHidden), use same random selection logic
  if (hideEnvelope && showGiftBoxWhenHidden) {
    // Use boxImage as a seed for consistent random selection per card
    let hash = 0
    for (let i = 0; i < boxImage.length; i++) {
      hash = ((hash << 5) - hash) + boxImage.charCodeAt(i)
      hash = hash & hash // Convert to 32-bit integer
    }
    const index = Math.abs(hash) % BOX1_IMAGES.length
    const pngPath = BOX1_IMAGES[index]
    return LOGO_PNG_TO_SVG_MAP[pngPath] || '/assets/GiftSent/SVG Logo/Logo.svg'
  }
  // For Single 1 (useBox1), use mapped logo
  if (box1Image) {
    return LOGO_PNG_TO_SVG_MAP[box1Image] || '/assets/GiftSent/SVG Logo/Logo.svg'
  }
  // Default fallback
  return '/assets/GiftSent/SVG Logo/Logo.svg'
}

/**
 * Extract brand name from logo path
 */
export const getBrandName = (svgLogoPath, box1Image, hideEnvelope, showGiftBoxWhenHidden, boxImage) => {
  // Get the logo path (prefer SVG, fallback to PNG)
  let logoPath = svgLogoPath
  if (!logoPath && box1Image) {
    logoPath = box1Image
  }
  if (!logoPath) {
    // Fallback: try to get from random selection (same logic as above)
    if (hideEnvelope && showGiftBoxWhenHidden) {
      let hash = 0
      for (let i = 0; i < boxImage.length; i++) {
        hash = ((hash << 5) - hash) + boxImage.charCodeAt(i)
        hash = hash & hash // Convert to 32-bit integer
      }
      const index = Math.abs(hash) % BOX1_IMAGES.length
      logoPath = BOX1_IMAGES[index]
    }
  }
  
  if (!logoPath) return null
  
  // Extract filename from path
  const filename = logoPath.split('/').pop() || ''
  // Remove extension (.png, .svg)
  const nameWithoutExt = filename.replace(/\.(png|svg)$/i, '')
  // Handle special cases
  if (nameWithoutExt === 'Logo') return 'Columbia'
  return nameWithoutExt
}

/**
 * Calculate tilt angles based on mouse position
 */
export const calculateTilt = (mousePosition, isHovered, shouldApplyTilt) => {
  if (!isHovered || !shouldApplyTilt) {
    return { tiltX: 0, tiltY: 0 }
  }
  // Map y position (0-1) to tilt angle (-3 to 3 degrees)
  const tiltX = (mousePosition.y - 0.5) * 5
  // Map x position (0-1) to tilt angle (-3 to 3 degrees), inverted for natural feel
  const tiltY = (0.5 - mousePosition.x) * 5
  return { tiltX, tiltY }
}

/**
 * Calculate parallax offsets for envelope/box
 */
export const calculateParallax = (mousePosition, isHovered, shouldApplyTilt) => {
  if (!isHovered || !shouldApplyTilt) {
    return { parallaxX: 0, parallaxY: 0 }
  }
  const parallaxX = (mousePosition.x - 0.5) * 10 // 10px max offset
  const parallaxY = (mousePosition.y - 0.5) * 10 // 10px max offset
  return { parallaxX, parallaxY }
}

