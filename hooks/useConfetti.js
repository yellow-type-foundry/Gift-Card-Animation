import { useEffect, useRef } from 'react'
import { CONFETTI_CONFIG } from '@/constants/sentCardConstants'

/**
 * Custom hook for confetti animation on canvas
 * Uses unified configuration from CONFETTI_CONFIG
 * @param {boolean} isHovered - Whether the card is hovered
 * @param {boolean} allAccepted - Whether all items are accepted
 * @param {React.RefObject} confettiCanvasRef - Ref to the canvas element (back layer)
 * @param {React.RefObject} cardRef - Ref to the card element
 * @param {React.RefObject} confettiCanvasFrontRef - Optional ref to front canvas element
 * @param {React.RefObject} confettiCanvasMirroredRef - Optional ref to vertically mirrored canvas element
 */
export default function useConfetti(isHovered, allAccepted, confettiCanvasRef, cardRef, confettiCanvasFrontRef = null, confettiCanvasMirroredRef = null) {
  useEffect(() => {
    if (!isHovered || !allAccepted) return
    const canvas = confettiCanvasRef.current
    const canvasFront = confettiCanvasFrontRef?.current
    const canvasMirrored = confettiCanvasMirroredRef?.current
    const cardEl = cardRef.current
    if (!canvas || !cardEl) return
    
    // Find envelope/box element for collision detection
    // For Single 1 (Gift Container), we don't want collision detection as it blocks particles
    // Only use collision for actual envelopes/boxes (Batch 2, Single 2)
    const envelopeEl = cardEl.querySelector('[data-name="Envelope"]')
    
    // Find Union shape element - use its top as the confetti floor
    const unionEl = cardEl.querySelector('[data-name="Union"]')
    
    // Find third floor element (red line) - for Single 1 and Batch 1
    const thirdFloorElSingle1 = cardEl.querySelector('[data-name="Second Floor"][data-floor-type="single1"]')
    const thirdFloorElBatch1 = cardEl.querySelector('[data-name="Second Floor"][data-floor-type="batch1"]')
    const thirdFloorEl = thirdFloorElSingle1 || thirdFloorElBatch1
    
    const ctx = canvas.getContext('2d')
    const ctxFront = canvasFront?.getContext('2d')
    const ctxMirrored = canvasMirrored?.getContext('2d')
    let animId
    const dpr = window.devicePixelRatio || 1
    
    // Gyroscope/tilt interaction for mobile devices
    let deviceTilt = { beta: 0, gamma: 0 } // beta: front-to-back, gamma: left-to-right
    const gyroscopeForceMultiplier = 0.2 // Reduced from 0.4 for lighter tilt effect
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    let orientationListenerAdded = false
    const confettiSettleFrames = 180 // Frames before gyroscope interaction starts (~3 seconds at 60fps)
    
    // Device orientation event handler
    const handleDeviceOrientation = (event) => {
      // Check for both absolute and relative orientation
      const beta = event.beta !== null && event.beta !== undefined ? event.beta : null
      const gamma = event.gamma !== null && event.gamma !== undefined ? event.gamma : null
      
      if (beta !== null && gamma !== null) {
        // Beta: -180 to 180 (front-to-back tilt, 0 = flat)
        // Gamma: -90 to 90 (left-to-right tilt, 0 = flat)
        // Clamp values to reasonable ranges to avoid extreme tilts
        deviceTilt.beta = Math.max(-45, Math.min(45, beta))
        deviceTilt.gamma = Math.max(-45, Math.min(45, gamma))
        
        // Debug: log first few events to verify it's working (dev only)
        if (process.env.NODE_ENV === 'development' && Math.random() < 0.01) { // Log ~1% of events to avoid spam
          console.log('Device orientation:', { beta: deviceTilt.beta, gamma: deviceTilt.gamma })
        }
      }
    }
    
    // Request permission and add listener
    const setupDeviceOrientation = async () => {
      if (!isMobile || typeof DeviceOrientationEvent === 'undefined') return
      if (orientationListenerAdded) return // Already set up
      
      try {
        if (DeviceOrientationEvent.requestPermission) {
          // iOS 13+ requires permission - must be called from user gesture
          try {
            const response = await DeviceOrientationEvent.requestPermission()
            if (response === 'granted') {
              window.addEventListener('deviceorientation', handleDeviceOrientation, { passive: true })
              orientationListenerAdded = true
              if (process.env.NODE_ENV === 'development') {
                console.log('Device orientation permission granted')
              }
            } else {
              if (process.env.NODE_ENV === 'development') {
                console.log('Device orientation permission denied:', response)
              }
            }
          } catch (err) {
            if (process.env.NODE_ENV === 'development') {
              console.log('Permission request error (may need user gesture):', err)
            }
          }
        } else {
          // Android and older iOS - try to add listener directly
          try {
            window.addEventListener('deviceorientation', handleDeviceOrientation, { passive: true })
            orientationListenerAdded = true
            if (process.env.NODE_ENV === 'development') {
              console.log('Device orientation listener added (no permission required)')
            }
          } catch (e) {
            if (process.env.NODE_ENV === 'development') {
              console.log('Could not add device orientation listener:', e)
            }
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error setting up device orientation:', error)
        }
      }
    }
    
    // On iOS, permission must be requested from a user gesture
    // Set up listeners to request permission on first interaction
    if (isMobile) {
      // Try immediately for Android/older iOS
      if (typeof DeviceOrientationEvent !== 'undefined' && !DeviceOrientationEvent.requestPermission) {
        setupDeviceOrientation()
      }
      
      // For iOS 13+, request permission on user interaction
      const tryOnInteraction = (e) => {
        if (!orientationListenerAdded) {
          setupDeviceOrientation()
        }
      }
      
      // Try on various interaction events (user must interact to grant permission on iOS)
      cardEl.addEventListener('touchstart', tryOnInteraction, { once: true, passive: true })
      cardEl.addEventListener('touchend', tryOnInteraction, { once: true, passive: true })
      // Also try on mouse events for testing on desktop with device orientation simulation
      if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
        cardEl.addEventListener('click', tryOnInteraction, { once: true, passive: true })
      }
    }
    
    // Calculate mirror point (Union top or card bottom)
    // Will be defined after cardBounds is available
    let getMirrorY = null
    
    // Get card's bounding box for particle constraints
    const updateCardBounds = () => {
      const cardRect = cardEl.getBoundingClientRect()
      const canvasRect = canvas.getBoundingClientRect()
      
      // Calculate the card's position relative to the canvas
      // The canvas might be positioned within a container (like header), so we need to account for offset
      const cardOffsetX = (cardRect.left - canvasRect.left) * dpr
      const cardOffsetY = (cardRect.top - canvasRect.top) * dpr
      
      // Set canvas size to match card size (full card coverage)
      // This ensures particles can move throughout the entire card
      const cardWidth = cardRect.width * dpr
      const cardHeight = cardRect.height * dpr
      canvas.width = Math.max(1, Math.floor(cardWidth))
      canvas.height = Math.max(1, Math.floor(cardHeight))
      canvas.style.width = `${cardRect.width}px`
      canvas.style.height = `${cardRect.height}px`
      
      // Set front canvas size if it exists
      if (canvasFront) {
        canvasFront.width = Math.max(1, Math.floor(cardWidth))
        canvasFront.height = Math.max(1, Math.floor(cardHeight))
        canvasFront.style.width = `${cardRect.width}px`
        canvasFront.style.height = `${cardRect.height}px`
      }
      
      // Set mirrored canvas size if it exists
      if (canvasMirrored) {
        canvasMirrored.width = Math.max(1, Math.floor(cardWidth))
        canvasMirrored.height = Math.max(1, Math.floor(cardHeight))
        canvasMirrored.style.width = `${cardRect.width}px`
        canvasMirrored.style.height = `${cardRect.height}px`
      }
      
      // Get envelope/box bounds if it exists
      let envelopeBounds = null
      if (envelopeEl) {
        const envelopeRect = envelopeEl.getBoundingClientRect()
        const envelopeOffsetX = (envelopeRect.left - canvasRect.left) * dpr
        const envelopeOffsetY = (envelopeRect.top - canvasRect.top) * dpr
        envelopeBounds = {
          left: envelopeOffsetX,
          top: envelopeOffsetY,
          right: envelopeOffsetX + (envelopeRect.width * dpr),
          bottom: envelopeOffsetY + (envelopeRect.height * dpr),
          width: envelopeRect.width * dpr,
          height: envelopeRect.height * dpr
        }
      }
      
      // Get Union shape bounds if it exists - use its top as the confetti floor
      // Also calculate cutout area where particles can fall into
      let unionTop = null
      let unionCutout = null
      if (unionEl) {
        const unionRect = unionEl.getBoundingClientRect()
        const unionOffsetY = (unionRect.top - canvasRect.top) * dpr
        unionTop = unionOffsetY
        
        // Calculate cutout bounds (centered, 90px wide, ~21px deep)
        // Cutout is centered on the card (300px wide card, cutout starts at 105px from left)
        const cutoutWidth = 84 * dpr // 84px cutout width
        const cutoutDepth = 21 * dpr // ~21px cutout depth
        const cutoutLeftCard = 105 * dpr // Cutout left edge in card coordinates (centered: (300-90)/2 = 105)
        const cutoutRightCard = cutoutLeftCard + cutoutWidth // Cutout right edge
        
        // Convert to canvas coordinates (accounting for card offset)
        const cutoutLeftCanvas = cutoutLeftCard - cardOffsetX
        const cutoutRightCanvas = cutoutRightCard - cardOffsetX
        const cutoutBottom = unionTop + cutoutDepth // Bottom of cutout valley
        
        unionCutout = {
          left: cutoutLeftCanvas,
          right: cutoutRightCanvas,
          top: unionTop,
          bottom: cutoutBottom,
          width: cutoutWidth,
          depth: cutoutDepth
        }
      }
      
      // Get third floor bounds (red line - for Single 1 and Batch 1)
      let secondFloorY = null
      let secondFloorLeft = null
      let secondFloorRight = null
      if (thirdFloorEl) {
        const thirdFloorRect = thirdFloorEl.getBoundingClientRect()
        const thirdFloorOffsetY = (thirdFloorRect.top - canvasRect.top) * dpr
        const thirdFloorOffsetX = (thirdFloorRect.left - canvasRect.left) * dpr
        secondFloorY = thirdFloorOffsetY
        secondFloorLeft = thirdFloorOffsetX
        secondFloorRight = thirdFloorOffsetX + (thirdFloorRect.width * dpr)
      }
      
      // Card bounds in canvas coordinates
      // Account for the offset if canvas is positioned within a container
      const cardBounds = {
        width: cardWidth,
        height: cardHeight,
        offsetX: cardOffsetX,
        offsetY: cardOffsetY,
        // Effective bounds for particles (accounting for offset)
        minX: -cardOffsetX,
        maxX: cardWidth - cardOffsetX,
        minY: -cardOffsetY,
        maxY: cardHeight - cardOffsetY,
        // Envelope/box bounds for collision detection
        envelope: envelopeBounds,
        // Union shape top position (confetti floor)
        unionTop: unionTop,
        // Union cutout area where particles can fall into
        unionCutout: unionCutout,
        // Second floor position (for Single 1 only)
        secondFloorY: secondFloorY,
        secondFloorLeft: secondFloorLeft,
        secondFloorRight: secondFloorRight
      }
      
      return cardBounds
    }
    
    let cardBounds = updateCardBounds()
    
    // Define mirror point function after cardBounds is available
    getMirrorY = () => {
      if (cardBounds.unionTop !== null) {
        return cardBounds.unionTop
      }
      return cardBounds.maxY
    }
    
    // Use unified confetti configuration
    const { colors, maxParticles, speed, horizontalDrift, gravity, size, rotation } = CONFETTI_CONFIG
    
    // Eruption velocity boost - particles spawn with extra velocity that decays over time
    const eruptionBoostFrames = 60 // Boost lasts for ~1 second (60 frames at 60fps)
    const maxEruptionBoost = 3.0 // 2x velocity boost at start (very strong eruption)
    const minEruptionBoost = 1.0 // No boost after eruption phase
    
    const spawnParticle = (initialY = null, frameCountAtSpawn = 0) => {
      // Calculate eruption velocity boost based on when particle spawns
      // Early particles get massive boost, later particles get less
      const eruptionProgress = Math.min(1, frameCountAtSpawn / eruptionBoostFrames)
      const eruptionBoost = maxEruptionBoost - (maxEruptionBoost - minEruptionBoost) * eruptionProgress
      
      // More varied particle speeds - some fast, some slow, more natural distribution
      const speedVariation = 0.5 + Math.random() * 1.5 // 0.5x to 2x base speed
      const particleSpeed = (speed.min + Math.random() * speed.max) * speedVariation * eruptionBoost // Apply eruption boost
      
      // Circular dot dimensions
      const particleSize = (size.min + Math.random() * size.max) * dpr
      const halfSize = particleSize / 2
      
      // Calculate spawn position accounting for card offset
      // Particles should spawn within the card bounds, not canvas bounds
      const spawnX = cardBounds.minX + halfSize + Math.random() * (cardBounds.maxX - cardBounds.minX - halfSize * 2)
      const spawnY = initialY !== null 
        ? initialY 
        : (cardBounds.maxY - halfSize - 2 * dpr) // Spawn near bottom of card
      
      // Fade-in duration in frames (60fps = ~0.5 seconds)
      const fadeInDuration = 20 + Math.random() * 30 // 20-50 frames for more variation
      
      // More varied horizontal velocity - confetti spreads out more
      // During eruption, particles spread more horizontally for dramatic effect
      const horizontalSpreadMultiplier = eruptionBoost > 1.5 ? 1.5 : 1.0 // More spread during strong eruption
      const horizontalSpread = horizontalDrift * (0.5 + Math.random() * 1.5) * horizontalSpreadMultiplier // 0.5x to 2x (or more during eruption)
      const angleVariation = (Math.random() - 0.5) * (eruptionBoost > 1.5 ? 0.5 : 0.3) // Wider angles during eruption (±25° vs ±15°)
      
      // More varied rotation - confetti tumbles more
      const rotationSpeed = rotation.velocity.min + Math.random() * (rotation.velocity.max - rotation.velocity.min)
      const rotationVariation = 0.5 + Math.random() * 1.5 // 0.5x to 2x rotation speed
      
      return {
        // Position relative to canvas, accounting for card offset
        x: spawnX,
        y: spawnY,
        // More natural velocity - varied angles and speeds
        vx: (Math.random() * 2 - 1) * horizontalSpread * dpr + Math.sin(angleVariation) * particleSpeed * dpr * 0.3,
        vy: -particleSpeed * dpr * Math.cos(angleVariation),
        // Air resistance factor (confetti slows down over time) - reduced for heavier particles
        airResistance: 0.98 + Math.random() * 0.01, // 0.98-0.99 (less velocity decay for heavier feel)
        // Increased gravity for heavier particles
        ay: gravity * dpr * 0.7, // Increased from 0.4 to 0.7 for heavier weight (was reduced by 60%, now only 30%)
        rot: Math.random() * rotation.initial,
        vr: rotationSpeed * rotationVariation, // More varied rotation
        // Circular dot size
        size: particleSize,
        color: colors[(Math.random() * colors.length) | 0],
        shape: 'circle', // Circular dot shape
        // Randomly assign to front or back layer for depth effect
        layer: canvasFront && Math.random() < 0.5 ? 'front' : 'back',
        // Fade-in properties
        opacity: 0,
        fadeInProgress: 0,
        fadeInDuration: fadeInDuration,
        // Bounce energy retention (increased by 1.25x for more bounciness)
        bounceEnergy: (0.25 + Math.random() * 0.1) * 1.5, // 50-75% energy retention (increased from 40-60%)
        // Second floor state - track if particle is landed on second floor
        isLandedOnSecondFloor: false,
        // Landing threshold - if vertical velocity is below this, particle "lands"
        landingVelocityThreshold: 0.3 * dpr,
        // Track if particle has passed through floor 2 (Union top) - required before landing on floor 3
        hasPassedFloor2: false
      }
    }
    
    // Spawn particles from bottom for eruption effect
    const spawnParticleFromBottom = (currentFrameCount = 0) => {
      // Use average particle size for spawn calculation
      const avgSize = (size.min + size.max) / 2 * dpr
      const halfSize = avgSize / 2
      // Spawn from the top of the Union shape (confetti floor)
      // If Union exists, use its top; otherwise fall back to envelope or card bottom
      let spawnY
      if (cardBounds.unionTop !== null) {
        // Spawn at the top of the Union shape
        spawnY = cardBounds.unionTop - halfSize
      } else if (cardBounds.envelope) {
        // Spawn just above the envelope/box
        spawnY = cardBounds.envelope.bottom + halfSize + 2 * dpr
      } else {
        // Spawn near bottom of card
        spawnY = cardBounds.maxY - halfSize - 5 * dpr
      }
      // Add slight horizontal spread for more natural eruption
      return spawnParticle(spawnY, currentFrameCount)
    }
    
    // Start with no particles - they will erupt gradually on hover
    const targetParticleCount = Math.floor(maxParticles * 0.85) // 85% of max for more natural feel
    // Pre-allocate array (optimized: use for loop instead of map)
    const particles = new Array(targetParticleCount)
    for (let i = 0; i < targetParticleCount; i++) {
      particles[i] = null
    }
    let activeParticleCount = 0
    let frameCount = 0
    
    // Spawn rate starts slow and accelerates - creates eruption effect
    const initialSpawnRate = 0.12 // 12% chance per frame initially (faster start for eruption)
    const maxSpawnRate = 0.5 // 50% chance per frame when fully active
    const accelerationFrames = 120 // Accelerate over ~2 seconds (120 frames at 60fps)
    
    // Check if particle collides with envelope/box
    const checkEnvelopeCollision = (p, halfSize) => {
      if (!cardBounds.envelope) return false
      
      const env = cardBounds.envelope
      // Check if particle is within envelope bounds (with padding for particle size)
      const isInsideX = p.x >= env.left - halfSize && p.x <= env.right + halfSize
      const isInsideY = p.y >= env.top - halfSize && p.y <= env.bottom + halfSize
      
      return isInsideX && isInsideY
    }
    
    // Bounce particles off envelope/box boundaries with more natural, subtle effect
    const handleEnvelopeCollision = (p, halfSize) => {
      if (!cardBounds.envelope) return false
      
      const env = cardBounds.envelope
      let bounced = false
      
      // More natural bounce - increased by 1.25x for more bounciness
      const envelopeBounceEnergy = (0.25 + Math.random() * 0.1) * 1.5 // 62.5-87.5% energy retention (increased from 50-70%)
      const bounceVariation = 0.15 * dpr // Less variation for more natural feel
      
      // Check collision with left edge
      if (p.x < env.left + halfSize && p.vx < 0) {
        p.x = env.left + halfSize
        // Natural bounce - reverse with significant energy loss
        p.vx = -p.vx * envelopeBounceEnergy
        p.vx += (Math.random() - 0.5) * bounceVariation
        // Add slight vertical component for more natural bounce
        p.vy += (Math.random() - 0.5) * bounceVariation * 0.3
        bounced = true
      }
      // Check collision with right edge
      else if (p.x > env.right - halfSize && p.vx > 0) {
        p.x = env.right - halfSize
        p.vx = -p.vx * envelopeBounceEnergy
        p.vx += (Math.random() - 0.5) * bounceVariation
        p.vy += (Math.random() - 0.5) * bounceVariation * 0.3
        bounced = true
      }
      
      // Check collision with top edge
      if (p.y < env.top + halfSize && p.vy < 0) {
        p.y = env.top + halfSize
        p.vy = -p.vy * envelopeBounceEnergy
        p.vy += (Math.random() - 0.5) * bounceVariation
        // Add slight horizontal component for more natural bounce
        p.vx += (Math.random() - 0.5) * bounceVariation * 0.3
        bounced = true
      }
      // Check collision with bottom edge
      else if (p.y > env.bottom - halfSize && p.vy > 0) {
        p.y = env.bottom - halfSize
        p.vy = -p.vy * envelopeBounceEnergy
        p.vy += (Math.random() - 0.5) * bounceVariation
        p.vx += (Math.random() - 0.5) * bounceVariation * 0.3
        bounced = true
      }
      
      return bounced
    }
    
    // Bounce particles off card boundaries with more natural physics
    const constrainParticle = (p) => {
      // Use particle size for collision detection (circular dots)
      const halfSize = p.size / 2
      
      // First check envelope/box collision (with larger detection area for more sensitivity)
      // Use slightly larger detection area to catch particles earlier
      const detectionPadding = halfSize * 1.5
      const envelopeCollision = handleEnvelopeCollision(p, detectionPadding)
      
      // If no envelope collision, check card boundaries
      if (!envelopeCollision) {
        // Use card bounds (accounting for offset) instead of canvas bounds
        const minX = cardBounds.minX + halfSize
        const maxX = cardBounds.maxX - halfSize
        const minY = cardBounds.minY + halfSize
        
        // THIRD FLOOR INTERACTION (Single 1 and Batch 1 - red line position)
        // Floor hierarchy: 1st floor (lowest) = cutout valley, 2nd floor (middle) = Union top, 3rd floor (highest) = red line
        // Third floor allows both landing and bouncing
        // Single 1: 100px width, Batch 1: 160px width
        if (cardBounds.secondFloorY !== null) {
          const thirdFloorTop = cardBounds.secondFloorY - halfSize
          const thirdFloorBottom = cardBounds.secondFloorY + halfSize
          
          // Check if particle is within third floor horizontally (width varies: Single 1 = 100px, Batch 1 = 160px)
          const isWithinThirdFloorX = cardBounds.secondFloorLeft !== null && cardBounds.secondFloorRight !== null &&
            p.x >= cardBounds.secondFloorLeft - halfSize && p.x <= cardBounds.secondFloorRight + halfSize
          
          // Only interact with third floor if particle is within the 100px width AND is falling
          if (isWithinThirdFloorX && p.vy > 0) {
            // Check if particle is hitting the third floor
            const isHittingThirdFloor = p.y >= thirdFloorTop && p.y <= thirdFloorBottom + 10 * dpr
            
            // Handle already landed particles on third floor
            if (p.isLandedOnSecondFloor) {
              // Particle is landed on third floor - allow it to roll
              p.y = thirdFloorTop
              
              // Check if particle has rolled off the edge
              if (!isWithinThirdFloorX) {
                // Particle rolled off edge - unland it and let it fall to second floor
                p.isLandedOnSecondFloor = false
              } else {
                // Still on third floor - apply friction to horizontal movement
                p.vx *= 0.95 // Slight friction
                // Stop vertical movement
                p.vy = 0
                // Apply gravity only if it's about to roll off
                if (p.x < cardBounds.secondFloorLeft + halfSize || p.x > cardBounds.secondFloorRight - halfSize) {
                  // Near edge, allow slight downward movement
                  p.vy += p.ay * 0.1
                }
              }
            } 
            // Handle particles hitting the third floor - allow both landing and bouncing
            else if (isHittingThirdFloor) {
              // Particle is falling and hitting the third floor
              const verticalVelocity = Math.abs(p.vy)
              
              // Increased landing threshold to allow more particles to land
              const landingThreshold = p.landingVelocityThreshold * 2.0 // ~0.6 * dpr
              
              if (verticalVelocity < landingThreshold) {
                // Low velocity - particle "lands" on third floor
                p.isLandedOnSecondFloor = true
                p.y = thirdFloorTop
                p.vy = 0
                // Horizontal velocity continues (allows rolling)
              } else {
                // High velocity - particle bounces off third floor
                p.y = thirdFloorTop
                p.vy = -Math.abs(p.vy) * p.bounceEnergy * 0.8 // Bounce with energy loss
                p.vy += (Math.random() - 0.5) * 0.1 * dpr
                // Add slight horizontal component
                p.vx += (Math.random() - 0.5) * 0.1 * dpr
              }
            }
            
            // If particle is landed on third floor, skip normal floor collision
            if (p.isLandedOnSecondFloor) {
              // Particle is on third floor - handle horizontal boundaries only
              if (p.x <= minX) {
                p.x = minX
                p.vx = Math.abs(p.vx) * p.bounceEnergy
                p.vx += (Math.random() - 0.5) * 0.1 * dpr
              } else if (p.x >= maxX) {
                p.x = maxX
                p.vx = -Math.abs(p.vx) * p.bounceEnergy
                p.vx += (Math.random() - 0.5) * 0.1 * dpr
              }
              // Skip vertical boundary checks for landed particles on third floor
              return
            }
          }
          // If particle is outside the 100px width OR rising (vy <= 0), it passes through
          // and continues falling to second floor (Union top, handled by normal floor collision below)
        }
        
        // SECOND FLOOR (Union top) and FIRST FLOOR (cutout valley) interaction
        // Floor hierarchy: 1st floor (lowest) = cutout valley, 2nd floor (middle) = Union top
        // Check if particle is within Union cutout horizontally
        const isInCutout = cardBounds.unionCutout && 
          p.x >= cardBounds.unionCutout.left - halfSize && 
          p.x <= cardBounds.unionCutout.right + halfSize
        
        // Determine floor based on whether particle is in cutout
        let maxY
        if (cardBounds.unionTop !== null) {
          if (isInCutout) {
            // FIRST FLOOR: Allow particles to fall into cutout valley (lowest floor)
            // Particles should fall all the way to the bottom of the cutout
            maxY = cardBounds.unionCutout.bottom - halfSize
          } else {
            // SECOND FLOOR: Bounce at Union top if outside cutout (middle floor)
            maxY = cardBounds.unionTop - halfSize
          }
        } else {
          // No Union, use card bottom
          maxY = cardBounds.maxY - halfSize
        }
        
        // Horizontal boundaries - bounce with energy loss (more natural)
        if (p.x <= minX) {
          p.x = minX
          p.vx = Math.abs(p.vx) * p.bounceEnergy
          // Add slight random variation to bounce for more natural feel
          p.vx += (Math.random() - 0.5) * 0.1 * dpr
        } else if (p.x >= maxX) {
          p.x = maxX
          p.vx = -Math.abs(p.vx) * p.bounceEnergy
          p.vx += (Math.random() - 0.5) * 0.1 * dpr
        }
        
        // Vertical boundaries - bounce with energy loss (more natural)
        if (p.y <= minY) {
          p.y = minY
          p.vy = Math.abs(p.vy) * p.bounceEnergy
          p.vy += (Math.random() - 0.5) * 0.1 * dpr
        } else if (p.y >= maxY) {
          p.y = maxY
          p.vy = -Math.abs(p.vy) * p.bounceEnergy
          p.vy += (Math.random() - 0.5) * 0.1 * dpr
        }
      }
    }
    
    // Cache constants for better performance
    const TWO_PI = Math.PI * 2
    
    const draw = () => {
      frameCount++
      
      // Update card bounds periodically in case of resize (every 60 frames ~1 second at 60fps)
      if (frameCount % 60 === 0) {
        cardBounds = updateCardBounds()
      }
      
      // Gradually spawn particles - start slow, accelerate over time
      if (activeParticleCount < targetParticleCount) {
        // Calculate spawn rate that accelerates from initial to max
        const progress = Math.min(1, frameCount / accelerationFrames)
        // Optimized: cache (1 - progress) to avoid recalculating
        const oneMinusProgress = 1 - progress
        const easeOutProgress = 1 - oneMinusProgress * oneMinusProgress // Ease-out quadratic for smooth acceleration
        const currentSpawnRate = initialSpawnRate + (maxSpawnRate - initialSpawnRate) * easeOutProgress
        
        // Spawn new particles based on current rate
        if (Math.random() < currentSpawnRate) {
          // Find first null slot
          for (let i = 0; i < particles.length; i++) {
            if (particles[i] === null) {
              particles[i] = spawnParticleFromBottom(frameCount)
              activeParticleCount++
              break
            }
          }
        }
      }
      
      // Clear all canvases
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (ctxFront) {
        ctxFront.clearRect(0, 0, canvasFront.width, canvasFront.height)
      }
      if (ctxMirrored) {
        ctxMirrored.clearRect(0, 0, canvasMirrored.width, canvasMirrored.height)
      }
      
      // Get mirror point for this frame
      const mirrorY = getMirrorY()
      
      // Optimized: use for loop instead of forEach for better performance
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        if (p === null) continue // Skip null particles
        // Update fade-in progress
        if (p.fadeInProgress < p.fadeInDuration) {
          p.fadeInProgress++
          // Smooth fade-in using ease-out curve
          const progress = p.fadeInProgress / p.fadeInDuration
          // Optimized: cache (1 - progress) to avoid recalculating
          const oneMinusProgress = 1 - progress
          p.opacity = 1 - oneMinusProgress * oneMinusProgress * oneMinusProgress // Ease-out cubic
        } else {
          p.opacity = 1
        }
        
        // Apply air resistance (confetti slows down naturally)
        p.vx *= p.airResistance
        p.vy *= p.airResistance
        
        // Apply gravity
        p.vy += p.ay
        
        // Apply gyroscope/tilt forces on mobile devices
        // Only apply horizontal tilt (gamma) after confetti animation has settled
        // Particles must have been active for a certain number of frames before gyroscope interaction
        if (isMobile && orientationListenerAdded && frameCount >= confettiSettleFrames) {
          // Only apply horizontal tilt (left-right), not vertical tilt
          // Gamma (left-to-right): positive = tilted right, particles should move right (positive X)
          const tiltForceX = (deviceTilt.gamma / 45) * gyroscopeForceMultiplier * dpr
          
          // Apply only horizontal tilt force to velocity (only if listener is active and settled)
          p.vx += tiltForceX
          // No vertical tilt - particles maintain their natural vertical movement
        }
        
        // Update position
        p.x += p.vx
        p.y += p.vy
        
        // Update rotation (more tumbling)
        p.rot += p.vr
        
        // Apply boundary constraints
        constrainParticle(p)
        
        // Cull off-screen particles (optimization: don't draw particles outside canvas)
        const halfSize = p.size / 2
        const isOffScreen = p.x + halfSize < 0 || 
                           p.x - halfSize > canvas.width || 
                           p.y + halfSize < 0 || 
                           p.y - halfSize > canvas.height
        
        // Only draw if particle has some opacity and is on-screen
        if (p.opacity > 0 && !isOffScreen) {
          // Choose the appropriate canvas context based on particle layer
          const drawCtx = (p.layer === 'front' && ctxFront) ? ctxFront : ctx
          
          drawCtx.save()
          drawCtx.translate(p.x, p.y)
          drawCtx.rotate(p.rot)
          drawCtx.globalAlpha = p.opacity
          drawCtx.fillStyle = p.color
          
          // Draw circular dot (optimized: use cached TWO_PI constant)
          drawCtx.beginPath()
          drawCtx.arc(0, 0, p.size / 2, 0, TWO_PI)
          drawCtx.closePath()
          drawCtx.fill()
          
          drawCtx.restore()
          
          // Draw mirrored version if mirrored canvas exists
          if (ctxMirrored && p.opacity > 0) {
            // Calculate mirrored Y position (flip across mirrorY)
            const mirroredY = mirrorY + (mirrorY - p.y)
            
            ctxMirrored.save()
            ctxMirrored.translate(p.x, mirroredY)
            ctxMirrored.rotate(-p.rot) // Reverse rotation for mirror
            ctxMirrored.globalAlpha = p.opacity * 1.0 // Full opacity for brighter effect (was 0.6)
            ctxMirrored.fillStyle = p.color
            
            // Draw circular dot - 1.5x bigger for mirrored particles (optimized: use cached TWO_PI constant)
            const mirroredSize = p.size * 1.5
            ctxMirrored.beginPath()
            ctxMirrored.arc(0, 0, mirroredSize / 2, 0, TWO_PI)
            ctxMirrored.closePath()
            ctxMirrored.fill()
            
            ctxMirrored.restore()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }
    
    animId = requestAnimationFrame(draw)
    
    return () => {
      if (animId) cancelAnimationFrame(animId)
      ctx && ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (ctxFront) ctxFront.clearRect(0, 0, canvasFront.width, canvasFront.height)
      if (ctxMirrored) ctxMirrored.clearRect(0, 0, canvasMirrored.width, canvasMirrored.height)
      // Remove device orientation listener if it was added
      if (orientationListenerAdded) {
        window.removeEventListener('deviceorientation', handleDeviceOrientation)
        orientationListenerAdded = false
      }
    }
  }, [isHovered, allAccepted, confettiCanvasRef, cardRef, confettiCanvasFrontRef, confettiCanvasMirroredRef])
}

