import { useEffect, useRef, useState } from 'react'

/**
 * Hook to detect if an element is visible in the viewport
 * Returns true when element is visible, false when off-screen
 */
export const useIntersectionObserver = (options = {}) => {
  const [isVisible, setIsVisible] = useState(true) // Default to true for SSR
  const elementRef = useRef(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting)
        })
      },
      {
        root: null,
        rootMargin: '50px', // Start animating slightly before entering viewport
        threshold: 0.1, // Trigger when 10% visible
        ...options,
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

  return { elementRef, isVisible }
}

