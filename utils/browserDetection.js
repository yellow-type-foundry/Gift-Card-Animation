/**
 * Browser detection utilities for performance optimizations
 */

/**
 * Detect if the current browser is Safari
 * @returns {boolean} True if Safari
 */
export const isSafari = () => {
  if (typeof window === 'undefined') return false
  
  const userAgent = window.navigator.userAgent.toLowerCase()
  const isSafariUA = /safari/.test(userAgent) && !/chrome/.test(userAgent) && !/chromium/.test(userAgent)
  
  // Also check for WebKit (Safari uses WebKit)
  const isWebKit = 'WebkitAppearance' in document.documentElement.style
  
  return isSafariUA || (isWebKit && !window.chrome)
}

/**
 * Get performance mode based on browser
 * @returns {object} Performance settings
 */
export const getPerformanceMode = () => {
  const safari = isSafari()
  
  return {
    isSafari: safari,
    // Disable blur entirely for Safari (very expensive)
    disableBlur: safari, // Completely disable blur for Safari
    blurReduction: safari ? 0 : 1, // 0 = disabled
    // Throttle animation frame rate for Safari (more aggressive)
    frameThrottle: safari ? 3 : 1, // Every 3rd frame (~20fps) for Safari
    // Reduce mix-blend-mode usage for Safari
    useMixBlendMode: !safari, // Disable for Safari
    // Simplify physics for Safari
    simplifyPhysics: safari,
    // Disable ellipse deformation for Safari
    disableEllipseDeformation: safari,
    // Disable gradient overlay for Safari
    disableGradientOverlay: safari,
    // Disable box shadow for Safari
    disableBoxShadow: safari,
  }
}

