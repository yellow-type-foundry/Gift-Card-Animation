import { useState, useEffect, useRef, useMemo } from 'react'

/**
 * Custom hook for animating progress bar and count
 * @param {Object} progress - Progress object with current and total
 * @returns {Object} Animated progress values
 */
export default function useProgressAnimation(progress) {
  // Ensure current never exceeds total, and total never exceeds 40
  // Use useMemo to prevent recreation on every render (could cause infinite loops)
  const validatedProgress = useMemo(() => ({
    current: Math.min(progress.current, progress.total),
    total: Math.min(40, progress.total)
  }), [progress.current, progress.total])
  
  // Calculate target progress percentage precisely
  // Use useMemo to prevent recalculation on every render
  const targetProgressPercentage = useMemo(() => 
    validatedProgress.total > 0 
      ? (validatedProgress.current / validatedProgress.total) * 100 
      : 0,
    [validatedProgress.current, validatedProgress.total]
  )
  
  // Animated progress percentage (starts at 0, animates to target after content loads)
  const [animatedProgress, setAnimatedProgress] = useState(0)
  // Animated current value (starts at 0, counts up to target)
  const [animatedCurrent, setAnimatedCurrent] = useState(0)
  
  // Refs to store timers for cleanup
  const countIntervalRef = useRef(null)
  const timerRef = useRef(null)
  
  // Animate progress bar and count after content is loaded
  useEffect(() => {
    // Small delay before animation starts
    timerRef.current = setTimeout(() => {
      const targetCurrent = validatedProgress.current
      const duration = 500 // 0.5s to match CSS transition
      const steps = 30 // Number of animation steps
      const stepDuration = duration / steps
      const increment = targetCurrent / steps
      let currentStep = 0
      
      // Animate progress bar width immediately
      setAnimatedProgress(targetProgressPercentage)
      
      // Animate counting number
      countIntervalRef.current = setInterval(() => {
        currentStep++
        const newValue = Math.min(
          targetCurrent,
          Math.floor(increment * currentStep)
        )
        setAnimatedCurrent(newValue)
        
        if (currentStep >= steps) {
          // Ensure final value is exact
          setAnimatedCurrent(targetCurrent)
          if (countIntervalRef.current) {
            clearInterval(countIntervalRef.current)
            countIntervalRef.current = null
          }
        }
      }, stepDuration)
    }, 100)
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      if (countIntervalRef.current) {
        clearInterval(countIntervalRef.current)
      }
    }
  }, [targetProgressPercentage, validatedProgress.current])
  
  const isDone = validatedProgress.current === validatedProgress.total
  
  return {
    animatedProgress,
    animatedCurrent,
    validatedProgress,
    isDone
  }
}

