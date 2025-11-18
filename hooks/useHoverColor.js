import { useMemo } from 'react'
import { hexToHsl, hslToHex } from '@/utils/colors'
import { GIFT_BOX_TOKENS } from '@/constants/giftBoxTokens'

/**
 * Custom hook for calculating hover and themed shadow colors
 * @param {string} boxColor - Base color in hex format
 * @param {boolean} isHovered - Whether the element is currently hovered
 * @param {Object} options - Optional configuration
 * @param {number} options.saturationIncrease - Amount to increase saturation on hover (default: from tokens)
 * @param {number} options.lightnessIncrease - Amount to increase lightness on hover (default: from tokens)
 * @param {number} options.shadowLightnessDecrease - Amount to decrease lightness for shadow (default: from tokens)
 * @returns {Object} { hoverColor, shadowColor }
 */
export default function useHoverColor(boxColor, isHovered, options = {}) {
  const {
    saturationIncrease = GIFT_BOX_TOKENS.hoverEffects.colorAdjustment.saturationIncrease,
    lightnessIncrease = GIFT_BOX_TOKENS.hoverEffects.colorAdjustment.lightnessIncrease,
    shadowLightnessDecrease = GIFT_BOX_TOKENS.hoverEffects.shadowColorAdjustment.lightnessDecrease
  } = options

  // Calculate hover color with increased saturation and lightness
  const hoverColor = useMemo(() => {
    if (!isHovered) return boxColor
    const [h, s, l] = hexToHsl(boxColor)
    const newS = Math.min(100, s + saturationIncrease)
    const newL = Math.min(100, l + lightnessIncrease)
    return hslToHex(h, newS, newL)
  }, [boxColor, isHovered, saturationIncrease, lightnessIncrease])

  // Calculate themed shadow color based on boxColor
  const shadowColor = useMemo(() => {
    const [h, s, l] = hexToHsl(boxColor)
    const shadowL = Math.max(0, l - shadowLightnessDecrease)
    return hslToHex(h, s, shadowL)
  }, [boxColor, shadowLightnessDecrease])

  return { hoverColor, shadowColor }
}

