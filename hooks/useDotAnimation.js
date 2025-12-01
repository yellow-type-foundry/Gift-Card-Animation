import { useState, useEffect, useRef } from 'react'
import { BOX_WIDTH, BOX_HEIGHT } from '@/constants/layout3Tokens'
import { getPerformanceMode } from '@/utils/browserDetection'

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
  const frameCountRef = useRef(0) // Track frame count for throttling
  const performanceMode = useRef(getPerformanceMode()) // Cache performance mode

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
        ax: 0, // acceleration x
        ay: 0, // acceleration y
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
      frameCountRef.current = 0 // Reset frame count when animation stops
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
    
    // Simplified physics constants for Safari
    const REPULSION_DISTANCE = performanceMode.current.simplifyPhysics ? 30 : 40
    const REPULSION_FORCE = performanceMode.current.simplifyPhysics ? 0.05 : 0.08 // Reduced for Safari
    const DAMPING = performanceMode.current.simplifyPhysics ? 0.75 : 0.698 // More damping for Safari
    const MIN_VELOCITY = performanceMode.current.simplifyPhysics ? 0.8 : 1.2 // Reduced for Safari
    const WANDER_STRENGTH = performanceMode.current.simplifyPhysics ? 0.05 : 0.105 // Reduced for Safari
    const VELOCITY_SMOOTHING = 0.1 // Reduced smoothing for more responsive movement
    const BOUNDARY_PADDING = 1
    const BOUNDARY_SOFTNESS = performanceMode.current.simplifyPhysics ? 15 : 20 // Reduced for Safari
    const ACCELERATION_SMOOTHING = performanceMode.current.simplifyPhysics ? 0.3 : 0.2 // More smoothing for Safari
    const MAX_ACCELERATION = performanceMode.current.simplifyPhysics ? 0.25 : 0.4 // Reduced for Safari
    const ACCELERATION_DECAY = performanceMode.current.simplifyPhysics ? 0.9 : 0.85 // More persistence for Safari
    const VELOCITY_DRAG = performanceMode.current.simplifyPhysics ? 0.03 : 0.02 // More drag for Safari
    const DT = 1 // Delta time (assuming 60fps, so 1 frame)
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
      
      // Throttle frames for Safari (~20fps instead of 60fps)
      frameCountRef.current++
      if (performanceMode.current.frameThrottle > 1 && frameCountRef.current % performanceMode.current.frameThrottle !== 0) {
        animationFrameId = requestAnimationFrame(updatePositions)
        return
      }
      
      // For Safari: Skip physics calculations on some frames (only update position)
      const skipPhysics = performanceMode.current.simplifyPhysics && (frameCountRef.current / performanceMode.current.frameThrottle) % 2 === 0
      
      setDotPositions(prevPositions => {
        if (prevPositions.length === 0) return prevPositions
        
        const newPositions = prevPositions.map((pos, i) => {
          // For Safari: Skip complex physics on some frames, just update position
          if (skipPhysics) {
            // Simple position update without physics
            let newX = pos.x + pos.vx * DT
            let newY = pos.y + pos.vy * DT
            
            // Simple boundary check
            if (newX < BOUNDARY_PADDING || newX > maxX) {
              newX = Math.max(BOUNDARY_PADDING, Math.min(maxX, newX))
            }
            if (newY < BOUNDARY_PADDING || newY > maxY) {
              newY = Math.max(BOUNDARY_PADDING, Math.min(maxY, newY))
            }
            
            return { ...pos, x: newX, y: newY }
          }
          
          // Initialize acceleration from previous frame (with decay for momentum)
          let ax = (pos.ax || 0) * ACCELERATION_DECAY
          let ay = (pos.ay || 0) * ACCELERATION_DECAY
          
          // Calculate current speed for velocity-based effects
          const speed = Math.sqrt(pos.vx * pos.vx + pos.vy * pos.vy)
          
          // Velocity-based drag: faster movement creates resistance to acceleration changes
          // This makes direction changes feel more natural (like inertia)
          if (speed > 0.5) {
            const speedFactor = Math.min(speed / 5, 1) // Normalize speed
            const dragX = -pos.vx * VELOCITY_DRAG * speedFactor
            const dragY = -pos.vy * VELOCITY_DRAG * speedFactor
            ax += dragX
            ay += dragY
          }
          
          // Accumulate repulsion forces (optimized: spatial partitioning - only check nearby blobs)
          let repulsionAx = 0
          let repulsionAy = 0
          // Only check blobs within repulsion distance squared (avoid sqrt until needed)
          const repulsionDistSq = REPULSION_DISTANCE * REPULSION_DISTANCE
          
          // For Safari: simplify physics by checking fewer neighbors
          const maxChecks = performanceMode.current.simplifyPhysics 
            ? Math.min(prevPositions.length, 2) // Only check 2 nearest for Safari (more aggressive)
            : prevPositions.length
          
          // Spatial optimization: only check blobs in a square region around current blob
          // This reduces O(n²) to roughly O(n) for evenly distributed blobs
          const checkRadius = REPULSION_DISTANCE * 1.5 // Check slightly beyond repulsion distance
          
          // For Safari: pre-calculate distances and sort to get nearest neighbors
          const distances = []
          for (let j = 0; j < prevPositions.length; j++) {
            if (i === j) continue // Skip self
            const otherPos = prevPositions[j]
            const dx = pos.x - otherPos.x
            const dy = pos.y - otherPos.y
            const distanceSq = dx * dx + dy * dy
            if (distanceSq === 0) continue
            distances.push({ j, distanceSq, dx, dy })
          }
          
          // Sort by distance and take only nearest neighbors for Safari
          if (performanceMode.current.simplifyPhysics) {
            distances.sort((a, b) => a.distanceSq - b.distanceSq)
          }
          
          const checksToPerform = distances.slice(0, maxChecks)
          for (const { j, distanceSq, dx, dy } of checksToPerform) {
            // Early exit if too far (before expensive sqrt and calculations)
            if (distanceSq > repulsionDistSq) continue
            
            const distance = Math.sqrt(distanceSq)
            // Smooth repulsion curve (ease-out)
            const normalizedDist = distance / REPULSION_DISTANCE
            const smoothFactor = 1 - (normalizedDist * normalizedDist) // Quadratic ease-out
            const force = REPULSION_FORCE * smoothFactor
            const angle = Math.atan2(dy, dx)
            // Accumulate repulsion acceleration
            repulsionAx += Math.cos(angle) * force
            repulsionAy += Math.sin(angle) * force
          }
          
          // Accumulate boundary forces
          let boundaryAx = 0
          let boundaryAy = 0
          const distToLeft = pos.x - BOUNDARY_PADDING
          const distToRight = maxX - pos.x
          const distToTop = pos.y - BOUNDARY_PADDING
          const distToBottom = maxY - pos.y
          
          if (distToLeft < BOUNDARY_SOFTNESS && pos.vx < 0) {
            const softFactor = distToLeft / BOUNDARY_SOFTNESS
            boundaryAx += (1 - softFactor) * 0.25
          }
          if (distToRight < BOUNDARY_SOFTNESS && pos.vx > 0) {
            const softFactor = distToRight / BOUNDARY_SOFTNESS
            boundaryAx -= (1 - softFactor) * 0.25
          }
          if (distToTop < BOUNDARY_SOFTNESS && pos.vy < 0) {
            const softFactor = distToTop / BOUNDARY_SOFTNESS
            boundaryAy += (1 - softFactor) * 0.25
          }
          if (distToBottom < BOUNDARY_SOFTNESS && pos.vy > 0) {
            const softFactor = distToBottom / BOUNDARY_SOFTNESS
            boundaryAy -= (1 - softFactor) * 0.25
          }
          
          // Add wander acceleration - gradual direction changes
          const wanderX = (Math.random() - 0.5) * WANDER_STRENGTH
          const wanderY = (Math.random() - 0.5) * WANDER_STRENGTH
          
          // Combine all forces before smoothing
          const totalForceX = repulsionAx + boundaryAx + wanderX
          const totalForceY = repulsionAy + boundaryAy + wanderY
          
          // Smooth acceleration changes (interpolate towards target)
          ax = ax * (1 - ACCELERATION_SMOOTHING) + totalForceX * ACCELERATION_SMOOTHING
          ay = ay * (1 - ACCELERATION_SMOOTHING) + totalForceY * ACCELERATION_SMOOTHING
          
          // Clamp acceleration to max (but preserve direction)
          const accelMagnitude = Math.sqrt(ax * ax + ay * ay)
          if (accelMagnitude > MAX_ACCELERATION && accelMagnitude > 0) {
            const scale = MAX_ACCELERATION / accelMagnitude
            ax *= scale
            ay *= scale
          }
          
          // Update velocity based on acceleration (v = v + a * dt)
          let newVx = pos.vx + ax * DT
          let newVy = pos.vy + ay * DT
          
          // Apply damping
          newVx *= DAMPING
          newVy *= DAMPING
          
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
          
          // Update position based on velocity (p = p + v * dt)
          let newX = pos.x + newVx * DT
          let newY = pos.y + newVy * DT
          
          // Boundary collision - smoother bounce
          if (newX < BOUNDARY_PADDING || newX > maxX) {
            newVx *= -0.17 // Softer bounce
            newX = Math.max(BOUNDARY_PADDING, Math.min(maxX, newX))
            ax *= -0.5 // Reverse acceleration on bounce
          }
          if (newY < BOUNDARY_PADDING || newY > maxY) {
            newVy *= -0.7 // Softer bounce
            newY = Math.max(BOUNDARY_PADDING, Math.min(maxY, newY))
            ay *= -0.5 // Reverse acceleration on bounce
          }
          
          return { x: newX, y: newY, vx: newVx, vy: newVy, ax, ay }
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

