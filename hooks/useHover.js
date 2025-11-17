import { useState, useCallback } from 'react'

/**
 * Custom hook for managing hover state with memoized handlers
 * @returns {Object} { isHovered, handleHoverEnter, handleHoverLeave }
 */
export default function useHover() {
  const [isHovered, setIsHovered] = useState(false)
  
  const handleHoverEnter = useCallback(() => setIsHovered(true), [])
  const handleHoverLeave = useCallback(() => setIsHovered(false), [])
  
  return { isHovered, handleHoverEnter, handleHoverLeave }
}

