import { useState, useEffect, useRef } from 'react'
import { BOX_WIDTH, BOX_HEIGHT } from '@/constants/layout3Tokens'

/**
 * Hook to manage dot animation with physics-based movement
 */
export const useDotAnimation = (blobAnimations, isHovered, circleSize) => {
  const [dotPositions, setDotPositions] = useState([])
  const [positionsReady, setPositionsReady] = useState(false) // Track when positions are initialized
  const animationRunningRef = useRef(false)
  const prevVelocitiesRef = useRef({}) // Store previous velocities for smoothing
  const isHoveredRef = useRef(isHovered) // Track hover state to avoid stale closures
  const circleSizeRef = useRef(circleSize) // Track circleSize to avoid stale closures

  // Initialize dot positions
  useEffect(() => {
    if (blobAnimations.length === 0) {
      setDotPositions([])
      setPositionsReady(false)
      return
    }

    const initialPositions = blobAnimations.map(anim => {
      const angle = Math.random() * Math.PI * 2
      const speed = (0.5 + Math.random() * 0.8) * 2 // 2x faster
      return {
        x: anim.startX,
        y: anim.startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
      }
    })
    setDotPositions(initialPositions)
    setPositionsReady(true)
    animationRunningRef.current = false
    prevVelocitiesRef.current = {} // Reset velocities when reinitializing
  }, [blobAnimations])

  // Update refs when they change
  useEffect(() => {
    isHoveredRef.current = isHovered
    circleSizeRef.current = circleSize
  }, [isHovered, circleSize])

  // Animation loop
  useEffect(() => {
    if (!isHovered) {
      animationRunningRef.current = false
      return
    }
    
    // Must have positions and animations to start
    if (!positionsReady || dotPositions.length === 0 || blobAnimations.length === 0) {
      animationRunningRef.current = false
      return
    }
    
    // Don't restart if already running
    if (animationRunningRef.current) return
    
    animationRunningRef.current = true
    
    const REPULSION_DISTANCE = 40
    const REPULSION_FORCE = 0.03 // Increased for more visible movement
    const DAMPING = 0.98 // Reduced damping for more movement
    const MIN_VELOCITY = 1.45 // 1.45x faster (was 1.2)
    const WANDER_STRENGTH = 0.05 // Increased for more variation
    const VELOCITY_SMOOTHING = 0.1 // Reduced smoothing for more responsive movement
    const BOUNDARY_PADDING = 1
    const BOUNDARY_SOFTNESS = 20 // Distance from boundary where deceleration starts
    // Use circleSize from ref to get current value
    const currentCircleSize = circleSizeRef.current || 58 // Fallback to max size if undefined
    const maxX = BOX_WIDTH - currentCircleSize - BOUNDARY_PADDING
    const maxY = BOX_HEIGHT - currentCircleSize - BOUNDARY_PADDING
    
    let animationFrameId
    let isRunning = true
    
    const updatePositions = () => {
      if (!isRunning || !isHoveredRef.current) {
        animationRunningRef.current = false
        return
      }
      
      setDotPositions(prevPositions => {
        if (prevPositions.length === 0) return prevPositions
        
        const newPositions = prevPositions.map((pos, i) => {
          let newX = pos.x + pos.vx
          let newY = pos.y + pos.vy
          let newVx = pos.vx
          let newVy = pos.vy
          
          // Check collision with other dots - smoother repulsion curve
          prevPositions.forEach((otherPos, j) => {
            if (i === j) return
            
            const dx = newX - otherPos.x
            const dy = newY - otherPos.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            if (distance < REPULSION_DISTANCE && distance > 0) {
              // Smooth repulsion curve (ease-out)
              const normalizedDist = distance / REPULSION_DISTANCE
              const smoothFactor = 1 - (normalizedDist * normalizedDist) // Quadratic ease-out
              const force = REPULSION_FORCE * smoothFactor
              const angle = Math.atan2(dy, dx)
              newVx += Math.cos(angle) * force
              newVy += Math.sin(angle) * force
            }
          })
          
          // Smooth boundary deceleration (soft boundaries)
          const distToLeft = newX - BOUNDARY_PADDING
          const distToRight = maxX - newX
          const distToTop = newY - BOUNDARY_PADDING
          const distToBottom = maxY - newY
          
          if (distToLeft < BOUNDARY_SOFTNESS && newVx < 0) {
            const softFactor = distToLeft / BOUNDARY_SOFTNESS
            newVx *= 0.5 + (softFactor * 0.5) // Gradually slow down near boundary
          }
          if (distToRight < BOUNDARY_SOFTNESS && newVx > 0) {
            const softFactor = distToRight / BOUNDARY_SOFTNESS
            newVx *= 0.5 + (softFactor * 0.5)
          }
          if (distToTop < BOUNDARY_SOFTNESS && newVy < 0) {
            const softFactor = distToTop / BOUNDARY_SOFTNESS
            newVy *= 0.5 + (softFactor * 0.5)
          }
          if (distToBottom < BOUNDARY_SOFTNESS && newVy > 0) {
            const softFactor = distToBottom / BOUNDARY_SOFTNESS
            newVy *= 0.5 + (softFactor * 0.5)
          }
          
          // Apply damping
          newVx *= DAMPING
          newVy *= DAMPING
          
          // Smoother wander - gradual direction changes instead of random jumps
          const prevVel = prevVelocitiesRef.current[i] || { vx: 0, vy: 0 }
          const wanderX = (Math.random() - 0.5) * WANDER_STRENGTH
          const wanderY = (Math.random() - 0.5) * WANDER_STRENGTH
          // Blend with previous velocity for smoother transitions
          newVx = newVx * (1 - VELOCITY_SMOOTHING) + (prevVel.vx + wanderX) * VELOCITY_SMOOTHING
          newVy = newVy * (1 - VELOCITY_SMOOTHING) + (prevVel.vy + wanderY) * VELOCITY_SMOOTHING
          
          // Store current velocity for next frame smoothing
          prevVelocitiesRef.current[i] = { vx: newVx, vy: newVy }
          
          // Ensure minimum velocity
          const currentSpeed = Math.sqrt(newVx * newVx + newVy * newVy)
          if (currentSpeed < MIN_VELOCITY && currentSpeed > 0) {
            const scale = MIN_VELOCITY / currentSpeed
            newVx *= scale
            newVy *= scale
          } else if (currentSpeed === 0) {
            const angle = Math.random() * Math.PI * 2
            newVx = Math.cos(angle) * MIN_VELOCITY
            newVy = Math.sin(angle) * MIN_VELOCITY
          }
          
          // Boundary collision - smoother bounce
          if (newX < BOUNDARY_PADDING || newX > maxX) {
            newVx *= -0.7 // Softer bounce
            newX = Math.max(BOUNDARY_PADDING, Math.min(maxX, newX))
          }
          if (newY < BOUNDARY_PADDING || newY > maxY) {
            newVy *= -0.7 // Softer bounce
            newY = Math.max(BOUNDARY_PADDING, Math.min(maxY, newY))
          }
          
          return { x: newX, y: newY, vx: newVx, vy: newVy }
        })
        
        return newPositions
      })
      
      animationFrameId = requestAnimationFrame(updatePositions)
    }
    
    animationFrameId = requestAnimationFrame(updatePositions)
    
    return () => {
      isRunning = false
      animationRunningRef.current = false
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isHovered, positionsReady]) // Restart when hover changes or positions become ready

  return dotPositions
}

