import { useEffect, useRef } from 'react'
import { CONFETTI_CONFIG, CONFETTI_CONFIG_LAYOUT_0 } from '@/constants/sentCardConstants'

/**
 * Layout 0 confetti hook - COMPLETELY SEPARATE from Layout 1
 * This hook is ONLY for Layout 0 and includes all Layout 0 specific features:
 * - Gift box collision detection
 * - Multiple blur canvas layers (varied blur)
 * - Velocity boost
 * - No third floor (red line)
 * - No envelope collision
 * @param {boolean} isHovered - Whether the card is hovered
 * @param {boolean} allAccepted - Whether all items are accepted
 * @param {React.RefObject} confettiCanvasRef - Ref to the canvas element (back layer)
 * @param {React.RefObject} cardRef - Ref to the card element
 * @param {React.RefObject} confettiCanvasFrontRef - Optional ref to front canvas element
 * @param {React.RefObject} confettiCanvasMirroredRef - Optional ref to vertically mirrored canvas element
 * @param {Array} blurCanvasRefs - Array of refs to blur canvas layers (Layout 0 only)
 * @param {boolean} shouldPause - Whether to pause the animation (freeze particles)
 */
export default function useConfettiLayout0(isHovered, allAccepted, confettiCanvasRef, cardRef, confettiCanvasFrontRef = null, confettiCanvasMirroredRef = null, blurCanvasRefs = null, shouldPause = false, forceHovered = false, pauseAtFrame = null, immediateFrame = null) {
  // Use a ref to track pause state without causing effect re-runs
  // Initialize as false to ensure animation starts, then update from prop
  const pauseRef = useRef(false)
  // Store pauseAtFrame in a ref to ensure it's accessible in closures
  const pauseAtFrameRef = useRef(pauseAtFrame)
  useEffect(() => {
    pauseAtFrameRef.current = pauseAtFrame
  }, [pauseAtFrame])
  useEffect(() => {
    const prevPause = pauseRef.current
    pauseRef.current = shouldPause
    if (prevPause !== shouldPause) {
      console.log('[Confetti Layout0] Pause state changed:', { from: prevPause, to: shouldPause, timestamp: Date.now() })
    }
  }, [shouldPause])
  
  // Track if animation has been initialized to prevent restarts
  const hasInitializedRef = useRef(false)
  const animIdRef = useRef(null)
  const prevForceHoveredRef = useRef(forceHovered)
  const prevIsHoveredRef = useRef(isHovered)
  const isFadingOutRef = useRef(false) // Track if particles are fading out
  const fadeOutStartTimeRef = useRef(null) // Track when fade-out started
  const fadeOutDuration = 800 // Fade-out duration in milliseconds
  
  // IMMEDIATE FRAME MODE: Render confetti at a specific frame without animation
  // This runs synchronously and is MUCH faster than waiting for animation to reach the frame
  useEffect(() => {
    console.log('[Confetti Layout0] IMMEDIATE MODE EFFECT: immediateFrame =', immediateFrame)
    if (immediateFrame === null) return // Only run in immediate mode
    console.log('[Confetti Layout0] IMMEDIATE MODE: Starting...')
    
    // Use requestAnimationFrame to ensure DOM is ready and painted
    // This fixes timing issues where canvas refs aren't available on first render
    const runImmediateMode = () => {
      // For Layout 0, use blur canvases (confettiCanvasRef is not rendered for Layout 0)
      const blurCanvases = blurCanvasRefs?.map(ref => ref?.current).filter(Boolean) || []
      // Use first blur canvas as main canvas for Layout 0, fallback to confettiCanvasRef
      const canvas = blurCanvases[0] || confettiCanvasRef.current
      const canvasFront = confettiCanvasFrontRef?.current
      const canvasMirrored = confettiCanvasMirroredRef?.current
      const cardEl = cardRef.current
      
      console.log('[Confetti Layout0] IMMEDIATE MODE: Checking refs...', {
        hasBlurCanvases: blurCanvases.length,
        hasCanvas: !!canvas,
        hasCardEl: !!cardEl
      })
      
      if (!canvas || !cardEl) {
        console.log('[Confetti Layout0] IMMEDIATE MODE: Canvas or card not ready, retrying...')
        // Retry after a short delay if refs aren't ready
        requestAnimationFrame(runImmediateMode)
        return
      }
      
      console.log('[Confetti Layout0] IMMEDIATE MODE: Calculating frame', immediateFrame, 'synchronously')
    const startTime = performance.now()
    
    const ctx = canvas.getContext('2d')
    const ctxFront = canvasFront?.getContext('2d')
    const ctxMirrored = canvasMirrored?.getContext('2d')
    const blurContexts = blurCanvases.map(c => c?.getContext('2d')).filter(Boolean)
    const dpr = window.devicePixelRatio || 1
    
    // Setup canvas sizes
    const cardRect = cardEl.getBoundingClientRect()
    const canvasRect = canvas.getBoundingClientRect()
    const cardWidth = cardRect.width * dpr
    const cardHeight = cardRect.height * dpr
    const cardOffsetX = (cardRect.left - canvasRect.left) * dpr
    const cardOffsetY = (cardRect.top - canvasRect.top) * dpr
    
    canvas.width = Math.max(1, Math.floor(cardWidth))
    canvas.height = Math.max(1, Math.floor(cardHeight))
    canvas.style.width = `${cardRect.width}px`
    canvas.style.height = `${cardRect.height}px`
    
    if (canvasFront) {
      canvasFront.width = canvas.width
      canvasFront.height = canvas.height
      canvasFront.style.width = canvas.style.width
      canvasFront.style.height = canvas.style.height
    }
    
    blurCanvases.forEach(c => {
      if (c) {
        c.width = canvas.width
        c.height = canvas.height
        c.style.width = canvas.style.width
        c.style.height = canvas.style.height
      }
    })
    
    if (canvasMirrored) {
      canvasMirrored.width = canvas.width
      canvasMirrored.height = canvas.height
      canvasMirrored.style.width = canvas.style.width
      canvasMirrored.style.height = canvas.style.height
    }
    
    // Get gift box bounds
    const giftBoxEl = cardEl.querySelector('[data-name="Box"]')
    let giftBoxBounds = null
    if (giftBoxEl) {
      const giftBoxRect = giftBoxEl.getBoundingClientRect()
      giftBoxBounds = {
        left: (giftBoxRect.left - canvasRect.left) * dpr,
        top: (giftBoxRect.top - canvasRect.top) * dpr,
        right: (giftBoxRect.left - canvasRect.left) * dpr + giftBoxRect.width * dpr,
        bottom: (giftBoxRect.top - canvasRect.top) * dpr + giftBoxRect.height * dpr,
        width: giftBoxRect.width * dpr,
        height: giftBoxRect.height * dpr
      }
    }
    
    const cardBounds = {
      width: cardWidth,
      height: cardHeight,
      offsetX: cardOffsetX,
      offsetY: cardOffsetY,
      minX: -cardOffsetX,
      maxX: cardWidth - cardOffsetX,
      minY: -cardOffsetY,
      maxY: cardHeight - cardOffsetY,
      giftBox: giftBoxBounds
    }
    
    const getMirrorY = () => cardBounds.maxY
    
    // Use config
    const { colors, speed, horizontalDrift, gravity, size, rotation } = CONFETTI_CONFIG
    const targetParticleCount = 200 // 25% more particles for captured image (was 270)
    const eruptionBoostFrames = 63
    const maxEruptionBoost = 4.5
    const minEruptionBoost = 1.0
    const initialSpawnRate = 0.25
    const maxSpawnRate = 0.95
    const accelerationFrames = 30
    
    // Create particle function (simplified for immediate mode)
    const createParticle = (frameCountAtSpawn) => {
      const eruptionProgress = Math.min(1, frameCountAtSpawn / eruptionBoostFrames)
      const eruptionBoost = maxEruptionBoost - (maxEruptionBoost - minEruptionBoost) * eruptionProgress
      const speedVariation = 0.5 + Math.random() * 1.5
      const particleSpeed = (speed.min + Math.random() * speed.max) * speedVariation * eruptionBoost
      const particleSize = (size.min + Math.random() * size.max) * dpr * 1.65 // 1.2x bigger for captured image
      const halfSize = particleSize / 2
      
      const spawnX = cardBounds.minX + halfSize + Math.random() * (cardBounds.maxX - cardBounds.minX - halfSize * 2)
      const spawnY = cardBounds.maxY - halfSize - 5 * dpr
      
      const horizontalSpreadMultiplier = eruptionBoost > 1.5 ? 1.5 : 1.0
      const horizontalSpread = horizontalDrift * (0.5 + Math.random() * 1.5) * horizontalSpreadMultiplier
      const angleVariation = (Math.random() - 0.5) * (eruptionBoost > 1.5 ? 0.5 : 0.3)
      const rotationSpeed = rotation.velocity.min + Math.random() * (rotation.velocity.max - rotation.velocity.min)
      
      return {
        x: spawnX,
        y: spawnY,
        vx: (Math.random() * 2 - 1) * horizontalSpread * dpr + Math.sin(angleVariation) * particleSpeed * dpr * 0.3,
        vy: -particleSpeed * dpr * Math.cos(angleVariation) * CONFETTI_CONFIG_LAYOUT_0.velocity.boostMultiplier,
        airResistance: 0.985 + Math.random() * 0.01,
        ay: gravity * dpr * 0.7,
        rot: Math.random() * rotation.initial,
        vr: rotationSpeed * (0.5 + Math.random() * 1.5),
        size: particleSize,
        color: colors[(Math.random() * colors.length) | 0],
        layer: canvasFront ? (Math.random() < 0.5 ? 'front' : 'back') : 'back',
        blurLevel: blurContexts.length > 0 ? Math.floor(Math.random() * blurContexts.length) : null,
        opacity: 1, // Full opacity in immediate mode
        bounceEnergy: (0.1 + Math.random() * 0.1) * 1.125,
        isLandedOnSecondFloor: false,
        landingVelocityThreshold: 0.3 * dpr,
        hasPassedFloor2: false,
        isLandedOnGiftBox: false,
        spawnFrame: frameCountAtSpawn
      }
    }
    
    // Simplified physics update
    const updateParticle = (p) => {
      const halfSize = p.size / 2
      
      // Air resistance
      p.vx *= p.airResistance
      p.vy *= p.airResistance
      
      // Gravity
      p.vy += p.ay
      
      // Update position
      p.x += p.vx
      p.y += p.vy
      
      // Update rotation
      p.rot += p.vr
      
      // Gift box collision
      if (giftBoxBounds) {
        const boxTop = giftBoxBounds.top
        const isNearTop = p.y >= boxTop - halfSize && p.y <= boxTop + halfSize * 2
        if (isNearTop && p.vy > 0) {
          const landingWidth = giftBoxBounds.width * 0.7
          const landingLeft = giftBoxBounds.left + (giftBoxBounds.width - landingWidth) / 2
          const landingRight = landingLeft + landingWidth
          if (p.x >= landingLeft && p.x <= landingRight) {
            p.y = boxTop
            p.vy = Math.min(0, p.vy * 0.3)
            p.vx *= 0.8
            p.isLandedOnGiftBox = true
          }
        }
      }
      
      // Boundary constraints
      const minX = cardBounds.minX + halfSize
      const maxX = cardBounds.maxX - halfSize
      const minY = cardBounds.minY + halfSize
      const maxY = cardBounds.maxY - halfSize
      
      if (p.x <= minX) { p.x = minX; p.vx = Math.abs(p.vx) * p.bounceEnergy }
      else if (p.x >= maxX) { p.x = maxX; p.vx = -Math.abs(p.vx) * p.bounceEnergy }
      if (p.y <= minY) { p.y = minY; p.vy = Math.abs(p.vy) * p.bounceEnergy }
      else if (p.y >= maxY) { p.y = maxY; p.vy = -Math.abs(p.vy) * p.bounceEnergy }
    }
    
    // Create particles array
    const particles = []
    let activeCount = 0
    
    // Run simulation synchronously for immediateFrame frames
    for (let frame = 0; frame < immediateFrame; frame++) {
      // Spawn particles based on spawn rate
      if (activeCount < targetParticleCount) {
        const progress = Math.min(1, frame / accelerationFrames)
        const easeOutProgress = 1 - (1 - progress) * (1 - progress)
        const currentSpawnRate = initialSpawnRate + (maxSpawnRate - initialSpawnRate) * easeOutProgress
        
        if (Math.random() < currentSpawnRate) {
          particles.push(createParticle(frame))
          activeCount++
        }
      }
      
      // Update all particles
      for (let i = 0; i < particles.length; i++) {
        updateParticle(particles[i])
      }
    }
    
    const simTime = performance.now() - startTime
    console.log('[Confetti Layout0] IMMEDIATE MODE: Simulation complete in', simTime.toFixed(1), 'ms, particles:', particles.length)
    
    // Debug: Log particle positions
    if (particles.length > 0) {
      const sampleParticle = particles[0]
      console.log('[Confetti Layout0] IMMEDIATE MODE: Sample particle:', {
        x: sampleParticle.x.toFixed(1),
        y: sampleParticle.y.toFixed(1),
        opacity: sampleParticle.opacity,
        color: sampleParticle.color,
        blurLevel: sampleParticle.blurLevel
      })
      console.log('[Confetti Layout0] IMMEDIATE MODE: Canvas size:', {
        width: canvas.width,
        height: canvas.height
      })
    }
    
    // Clear canvases
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (ctxFront) ctxFront.clearRect(0, 0, canvasFront.width, canvasFront.height)
    if (ctxMirrored) ctxMirrored.clearRect(0, 0, canvasMirrored.width, canvasMirrored.height)
    blurContexts.forEach(bCtx => bCtx && bCtx.clearRect(0, 0, bCtx.canvas.width, bCtx.canvas.height))
    
    // Render all particles to canvas
    const TWO_PI = Math.PI * 2
    const mirrorY = getMirrorY()
    
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      const halfSize = p.size / 2
      
      // Skip off-screen particles
      if (p.x + halfSize < 0 || p.x - halfSize > canvas.width || 
          p.y + halfSize < 0 || p.y - halfSize > canvas.height) continue
      
      // Determine which context to use
      let drawCtx = null
      if (p.blurLevel !== null && blurContexts[p.blurLevel]) {
        drawCtx = blurContexts[p.blurLevel]
      } else {
        drawCtx = (p.layer === 'front' && ctxFront) ? ctxFront : ctx
      }
      
      if (drawCtx) {
        drawCtx.save()
        drawCtx.translate(p.x, p.y)
        drawCtx.rotate(p.rot)
        drawCtx.globalAlpha = p.opacity
        drawCtx.fillStyle = p.color
        drawCtx.beginPath()
        drawCtx.arc(0, 0, halfSize, 0, TWO_PI)
        drawCtx.closePath()
        drawCtx.fill()
        drawCtx.restore()
      }
      
      // Draw mirrored version
      if (ctxMirrored) {
        const mirroredY = mirrorY + (mirrorY - p.y)
        ctxMirrored.save()
        ctxMirrored.translate(p.x, mirroredY)
        ctxMirrored.rotate(-p.rot)
        ctxMirrored.globalAlpha = p.opacity
        ctxMirrored.fillStyle = p.color
        ctxMirrored.beginPath()
        ctxMirrored.arc(0, 0, halfSize * 1.5, 0, TWO_PI)
        ctxMirrored.closePath()
        ctxMirrored.fill()
        ctxMirrored.restore()
      }
    }
    
      const totalTime = performance.now() - startTime
      console.log('[Confetti Layout0] IMMEDIATE MODE: Total render time', totalTime.toFixed(1), 'ms')
      
      // Mark as ready for capture
      if (typeof window !== 'undefined') {
        window.__confettiFrameCount = immediateFrame
        window.__confettiPaused = true
        window.__confettiReady = true
      }
      
      // Prevent normal animation from running
      hasInitializedRef.current = true
    }
    
    // Start the immediate mode rendering
    requestAnimationFrame(runImmediateMode)
    
  }, [immediateFrame, confettiCanvasRef, cardRef, confettiCanvasFrontRef, confettiCanvasMirroredRef, blurCanvasRefs])
  
  useEffect(() => {
    // Skip normal animation if in immediate mode
    if (immediateFrame !== null) {
      console.log('[Confetti Layout0] Immediate mode active - skipping normal animation')
      return
    }
    
    // Detect if forceHovered changed from false to true (modal opened)
    if (!prevForceHoveredRef.current && forceHovered) {
      console.log('[Confetti Layout0] Modal opened - resetting initialization flag')
      hasInitializedRef.current = false
      isFadingOutRef.current = false
      fadeOutStartTimeRef.current = null
      if (animIdRef.current) {
        cancelAnimationFrame(animIdRef.current)
        animIdRef.current = null
      }
    }
    // CRITICAL: Detect if forceHovered changed from true to false (modal closed)
    // This ensures confetti stops when the modal closes
    if (prevForceHoveredRef.current && !forceHovered) {
      hasInitializedRef.current = false
      isFadingOutRef.current = false
      fadeOutStartTimeRef.current = null
      if (animIdRef.current) {
        cancelAnimationFrame(animIdRef.current)
        animIdRef.current = null
      }
      // Defer canvas clearing to avoid blocking render
      requestAnimationFrame(() => {
        const canvas = confettiCanvasRef.current
        const canvasFront = confettiCanvasFrontRef?.current
        const canvasMirrored = confettiCanvasMirroredRef?.current
        const blurCanvases = blurCanvasRefs?.map(ref => ref?.current).filter(Boolean) || []
        if (canvas) {
          const ctx = canvas.getContext('2d')
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
        if (canvasFront) {
          const ctxFront = canvasFront.getContext('2d')
          if (ctxFront) ctxFront.clearRect(0, 0, canvasFront.width, canvasFront.height)
        }
        if (canvasMirrored) {
          const ctxMirrored = canvasMirrored.getContext('2d')
          if (ctxMirrored) ctxMirrored.clearRect(0, 0, canvasMirrored.width, canvasMirrored.height)
        }
        blurCanvases.forEach(c => {
          if (c) {
            const blurCtx = c.getContext('2d')
            if (blurCtx) blurCtx.clearRect(0, 0, c.width, c.height)
          }
        })
      })
    }
    prevForceHoveredRef.current = forceHovered
    
    // Detect if hover ended (isHovered changed from true to false)
    if (prevIsHoveredRef.current && !isHovered && !forceHovered) {
      console.log('[Confetti Layout0] Hover ended - starting fade-out and resetting animation time')
      isFadingOutRef.current = true
      fadeOutStartTimeRef.current = performance.now()
      // CRITICAL: Reset animationStartTime when hover ends to prevent slow motion from persisting
      // This ensures slow motion only applies during active hover, not after hover exits
      if (animIdRef.current) {
        // Animation is still running, we'll reset animationStartTime in the draw loop
        // Set a flag to reset it on next frame
      }
    }
    // Reset fade-out if hover starts again
    if (!prevIsHoveredRef.current && isHovered) {
      isFadingOutRef.current = false
      fadeOutStartTimeRef.current = null
    }
    prevIsHoveredRef.current = isHovered
    
    // Use forceHovered if provided, otherwise use isHovered
    const shouldStart = forceHovered || isHovered
    // For modal (forceHovered), allow confetti even if allAccepted is false
    const canStart = forceHovered ? shouldStart : (shouldStart && allAccepted)
    
    console.log('[Confetti Layout0] Effect triggered:', { 
      isHovered, 
      forceHovered, 
      shouldStart, 
      allAccepted, 
      canStart,
      shouldPause: shouldPause,
      hasInitialized: hasInitializedRef.current,
      animIdExists: animIdRef.current !== null,
      timestamp: Date.now()
    })
    
    // CRITICAL: Check if animation should stop (was running but conditions no longer met)
    // This handles the case where modal closes or hover ends
    if (hasInitializedRef.current && !canStart) {
      console.log('[Confetti Layout0] ⚠️ Animation should stop - conditions no longer met', {
        forceHovered,
        isHovered,
        canStart,
        animIdExists: animIdRef.current !== null,
        prevForceHovered: prevForceHoveredRef.current,
        prevIsHovered: prevIsHoveredRef.current
      })
      // CRITICAL: Stop the animation immediately and force cleanup
      if (animIdRef.current) {
        cancelAnimationFrame(animIdRef.current)
        animIdRef.current = null
      }
      hasInitializedRef.current = false
      isFadingOutRef.current = false
      fadeOutStartTimeRef.current = null
      // Clear canvases immediately
      const canvas = confettiCanvasRef.current
      const canvasFront = confettiCanvasFrontRef?.current
      const canvasMirrored = confettiCanvasMirroredRef?.current
      const blurCanvases = blurCanvasRefs?.map(ref => ref?.current).filter(Boolean) || []
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
      if (canvasFront) {
        const ctxFront = canvasFront.getContext('2d')
        if (ctxFront) ctxFront.clearRect(0, 0, canvasFront.width, canvasFront.height)
      }
      if (canvasMirrored) {
        const ctxMirrored = canvasMirrored.getContext('2d')
        if (ctxMirrored) ctxMirrored.clearRect(0, 0, canvasMirrored.width, canvasMirrored.height)
      }
      blurCanvases.forEach(c => {
        if (c) {
          const blurCtx = c.getContext('2d')
          if (blurCtx) blurCtx.clearRect(0, 0, c.width, c.height)
        }
      })
      // CRITICAL: Return a cleanup function that ensures animation is stopped
      return () => {
        // Force stop any remaining animation frames
        if (animIdRef.current) {
          cancelAnimationFrame(animIdRef.current)
          animIdRef.current = null
        }
        hasInitializedRef.current = false
      }
    }
    
    // CRITICAL: If animation is already initialized and conditions are still met, don't restart
    // This prevents infinite loops when effect re-runs due to dependency changes
    if (hasInitializedRef.current && canStart) {
      console.log('[Confetti Layout0] Animation already initialized - skipping restart', { 
        animIdExists: animIdRef.current !== null,
        forceHovered,
        isHovered,
        canStart
      })
      // Early return with no-op cleanup to prevent cleanup from canceling animation
      return
    }
    
    if (!canStart) {
      console.log('[Confetti Layout0] Not starting - conditions not met')
      hasInitializedRef.current = false
      return
    }
    
    // For forceHovered (modal), allow animation to start even if paused
    // The draw loop will handle pausing after particles spawn
    if (shouldPause && !forceHovered) {
      console.log('[Confetti Layout0] Paused (not force hovered) - waiting for pause to clear')
      hasInitializedRef.current = false
      return
    }
    
    // If forceHovered and paused, still allow initialization (particles will spawn, then pause)
    if (shouldPause && forceHovered) {
      console.log('[Confetti Layout0] Force hovered and paused - will start animation, pause in draw loop')
    }
    
    console.log('[Confetti Layout0] Initializing animation...')
    hasInitializedRef.current = true
    const canvas = confettiCanvasRef.current
    const canvasFront = confettiCanvasFrontRef?.current
    const canvasMirrored = confettiCanvasMirroredRef?.current
    // LAYOUT 0: Multiple blur canvas layers for varied blur
    const blurCanvases = blurCanvasRefs?.map(ref => ref?.current).filter(Boolean) || []
    const blurContexts = blurCanvases.map(c => c?.getContext('2d')).filter(Boolean)
    const cardEl = cardRef.current
    if (!canvas || !cardEl) return
    
    // LAYOUT 0: Find Box element (required for Layout 0)
    const giftBoxEl = cardEl.querySelector('[data-name="Box"]')
    if (!giftBoxEl) return // Layout 0 requires Box element
    
    // LAYOUT 0: No envelope collision, no third floor
    const envelopeEl = null
    const thirdFloorEl = null
    
    // Find Union shape element - use its top as the confetti floor
    const unionEl = cardEl.querySelector('[data-name="Union"]')
    
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
      
      // LAYOUT 0: Set blur canvas sizes for varied blur layers
      blurCanvases.forEach(blurCanvas => {
        if (blurCanvas) {
          blurCanvas.width = Math.max(1, Math.floor(cardWidth))
          blurCanvas.height = Math.max(1, Math.floor(cardHeight))
          blurCanvas.style.width = `${cardRect.width}px`
          blurCanvas.style.height = `${cardRect.height}px`
        }
      })
      
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
      
      // LAYOUT 0: Get box illustration bounds (required)
      const currentGiftBoxEl = cardEl.querySelector('[data-name="Box"]')
      let giftBoxBounds = null
      if (currentGiftBoxEl) {
        const giftBoxRect = currentGiftBoxEl.getBoundingClientRect()
        const giftBoxOffsetX = (giftBoxRect.left - canvasRect.left) * dpr
        const giftBoxOffsetY = (giftBoxRect.top - canvasRect.top) * dpr
        giftBoxBounds = {
          left: giftBoxOffsetX,
          top: giftBoxOffsetY,
          right: giftBoxOffsetX + (giftBoxRect.width * dpr),
          bottom: giftBoxOffsetY + (giftBoxRect.height * dpr),
          width: giftBoxRect.width * dpr,
          height: giftBoxRect.height * dpr
        }
        // Debug: log box bounds once (dev only)
        if (process.env.NODE_ENV === 'development') {
          console.log('Layout 0 GiftBox bounds:', {
            screen: { width: giftBoxRect.width, height: giftBoxRect.height, left: giftBoxRect.left, top: giftBoxRect.top },
            canvas: { width: giftBoxBounds.width / dpr, height: giftBoxBounds.height / dpr, left: giftBoxBounds.left / dpr, top: giftBoxBounds.top / dpr },
            expected: { width: 176 * 1.125, height: 176 * 1.125 } // 198px x 198px for Layout 0
          })
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
        
        // Calculate cutout bounds (centered, 84px wide, ~21px deep)
        // Cutout is centered on the card - use actual card width, not hardcoded 300px
        // cardWidth is already in DPR-scaled pixels (cardRect.width * dpr)
        const cutoutWidth = 84 * dpr // 84px cutout width in DPR-scaled pixels
        const cutoutDepth = 21 * dpr // ~21px cutout depth in DPR-scaled pixels
        // Calculate cutout position - centered on card
        // cutoutLeftCard = (cardWidth - cutoutWidth) / 2
        const cutoutLeftCard = (cardWidth - cutoutWidth) / 2 // Centered cutout (already in DPR pixels)
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
      
      // LAYOUT 0: No third floor (red line)
      
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
        envelope: null, // Layout 0: No envelope
        giftBox: giftBoxBounds, // Layout 0: Gift box bounds
        // Union shape top position (confetti floor)
        unionTop: unionTop,
        // Union cutout area where particles can fall into
        unionCutout: unionCutout,
        // LAYOUT 0: No third floor
        secondFloorY: null,
        secondFloorLeft: null,
        secondFloorRight: null
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
    // LAYOUT 0: Override maxParticles to 300 (Layout 1 uses CONFETTI_CONFIG.maxParticles)
    const layout0MaxParticles = 300
    
    // Eruption velocity boost - particles spawn with extra velocity that decays over time
    const eruptionBoostFrames = 63 // Reduced by 30%: ~1.05 seconds (63 frames at 60fps, was 90)
    const maxEruptionBoost = 4.5 // Increased from 3.0 to 4.5 for stronger entrance eruption
    const minEruptionBoost = 1.0 // No boost after eruption phase
    
    // LAYOUT 0: Always has gift box, no envelope
    
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
      
      // Fade-in duration in frames (60fps = ~0.35 seconds, reduced by 30%)
      const fadeInDuration = Math.floor((14 + Math.random() * 21)) // 14-35 frames (reduced from 20-50)
      
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
        // LAYOUT 0: Velocity boost
        vy: -particleSpeed * dpr * Math.cos(angleVariation) * CONFETTI_CONFIG_LAYOUT_0.velocity.boostMultiplier,
        // Air resistance factor (confetti slows down over time) - increased for Layout 0 to preserve momentum better
        airResistance: 0.985 + Math.random() * 0.01, // 0.985-0.995 for Layout 0 (better momentum preservation)
        // Increased gravity for heavier particles
        ay: gravity * dpr * 0.7, // Increased from 0.4 to 0.7 for heavier weight (was reduced by 60%, now only 30%)
        rot: Math.random() * rotation.initial,
        vr: rotationSpeed * rotationVariation, // More varied rotation
        // Circular dot size
        size: particleSize,
        color: colors[(Math.random() * colors.length) | 0],
        shape: 'circle', // Circular dot shape
        // Layer assignment: Random 50/50
        layer: canvasFront 
          ? (Math.random() < 0.5 ? 'front' : 'back')
          : 'back',
        // LAYOUT 0: Assign blur level (0-3) for varied blur
        blurLevel: blurContexts.length > 0 
          ? Math.floor(Math.random() * blurContexts.length) // Random blur level 0-3
          : null,
        // Fade-in properties
        opacity: 0,
        fadeInProgress: 0,
        fadeInDuration: fadeInDuration,
        // Bounce energy retention (increased by 1.25x for more bounciness)
        bounceEnergy: (0.1 + Math.random() * 0.1) * 1.125, // 50-75% energy retention (increased from 40-60%)
        // Second floor state - track if particle is landed on second floor
        isLandedOnSecondFloor: false,
        // Landing threshold - if vertical velocity is below this, particle "lands"
        landingVelocityThreshold: 0.3 * dpr,
        // Track if particle has passed through floor 2 (Union top) - required before landing on floor 3
        hasPassedFloor2: false,
        // LAYOUT 0: Track if particle is landed on gift box top
        isLandedOnGiftBox: false,
        // LAYOUT 0: Track spawn frame for floating behavior after eruption
        spawnFrame: frameCountAtSpawn
      }
      
      // LAYOUT 0: Determine if particle should float (higher blur = higher chance)
      // Calculate after blurLevel is assigned
      if (p.blurLevel !== null) {
        const blurLevel = p.blurLevel
        p.shouldFloat = Math.random() < (0.3 + blurLevel * 0.2) // 30% base + 20% per blur level (max 90% for blurLevel 3)
      } else {
        p.shouldFloat = false
      }
      
      return p
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
    const targetParticleCount = 270 // 270 particles for Layout 0
    // Pre-allocate array (optimized: use for loop instead of map)
    const particles = new Array(targetParticleCount)
    for (let i = 0; i < targetParticleCount; i++) {
      particles[i] = null
    }
    let activeParticleCount = 0
    let frameCount = 0
    const slowMotionStartTime = 1300 // Start slow motion after 1400ms
    const slowMotionFactor = 0.095 // Slow down to 15% of normal speed (very slow, floating effect)
    let animationStartTime = null // Track when animation started
    
    // Expose frameCount and pause state for Puppeteer to check (capture mode)
    if (typeof window !== 'undefined' && pauseAtFrameRef.current !== null) {
      window.__confettiFrameCount = 0
      window.__confettiPaused = false
    }
    
    // Spawn rate starts slow and accelerates - creates eruption effect
    const initialSpawnRate = 0.25 // 12% chance per frame initially (faster start for eruption)
    const maxSpawnRate = 0.95 // 50% chance per frame when fully active
    const accelerationFrames = 30 // Reduced by 30%: ~1.4 seconds (84 frames at 60fps, was 120)
    
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
    const handleEnvelopeCollision = (p, detectionSize) => {
      if (!cardBounds.envelope) return false
      
      const env = cardBounds.envelope
      let bounced = false
      
      // More natural bounce - increased by 1.25x for more bounciness
      // Optimized: calculate bounce energy once per collision check
      const envelopeBounceEnergy = (0.25 + Math.random() * 0.1) * 1.5 // 62.5-87.5% energy retention (increased from 50-70%)
      const bounceVariation = 0.15 * dpr // Less variation for more natural feel
      
      // Check collision with left edge
      if (p.x < env.left + detectionSize && p.vx < 0) {
        p.x = env.left + detectionSize
        // Natural bounce - reverse with significant energy loss
        p.vx = -p.vx * envelopeBounceEnergy
        p.vx += (Math.random() - 0.5) * bounceVariation
        // Add slight vertical component for more natural bounce
        p.vy += (Math.random() - 0.5) * bounceVariation * 0.3
        bounced = true
      }
      // Check collision with right edge
      else if (p.x > env.right - detectionSize && p.vx > 0) {
        p.x = env.right - detectionSize
        p.vx = -p.vx * envelopeBounceEnergy
        p.vx += (Math.random() - 0.5) * bounceVariation
        p.vy += (Math.random() - 0.5) * bounceVariation * 0.3
        bounced = true
      }
      
      // Check collision with top edge
      if (p.y < env.top + detectionSize && p.vy < 0) {
        p.y = env.top + detectionSize
        p.vy = -p.vy * envelopeBounceEnergy
        p.vy += (Math.random() - 0.5) * bounceVariation
        // Add slight horizontal component for more natural bounce
        p.vx += (Math.random() - 0.5) * bounceVariation * 0.3
        bounced = true
      }
      // Check collision with bottom edge
      else if (p.y > env.bottom - detectionSize && p.vy > 0) {
        p.y = env.bottom - detectionSize
        p.vy = -p.vy * envelopeBounceEnergy
        p.vy += (Math.random() - 0.5) * bounceVariation
        p.vx += (Math.random() - 0.5) * bounceVariation * 0.3
        bounced = true
      }
      
      return bounced
    }
    
    // LAYOUT 0: Handle collision with gift box top edge
    const handleGiftBoxCollision = (p, cardBounds) => {
      if (!cardBounds.giftBox) return false
      
      const box = cardBounds.giftBox
      const config = CONFETTI_CONFIG_LAYOUT_0.giftBox
      const halfSize = p.size / 2
      
      // Only check top edge (one-way collision: particles can pass upward, but land when moving down)
      const boxTop = box.top
      const isNearTop = p.y >= boxTop - halfSize && p.y <= boxTop + halfSize * 2
      
      if (isNearTop) {
        // Calculate landing width (70% of box width, centered)
        const landingWidth = box.width * config.landingWidthPercent
        const landingLeft = box.left + (box.width - landingWidth) / 2
        const landingRight = landingLeft + landingWidth
        const isWithinBoxWidth = p.x >= landingLeft && p.x <= landingRight
        
        // Only allow landing for downward-moving particles (erupting particles pass through)
        if (p.vy > 0 && isWithinBoxWidth) {
          // Land on top edge
          p.y = boxTop
          // Reduce vertical velocity but allow slight downward for rolling
          p.vy = Math.min(0, p.vy * config.verticalMomentumReduction)
          // Apply horizontal friction
          p.vx *= config.momentumPreservation
          // Mark as landed
          p.isLandedOnGiftBox = true
          return true
        }
      }
      
      // Handle landed particles: allow rolling with momentum
      if (p.isLandedOnGiftBox) {
        // Apply slight gravity for rolling off edges
        p.vy += p.ay * config.gravityAssist
        // Check if particle rolled off the landing area
        const landingWidth = box.width * config.landingWidthPercent
        const landingLeft = box.left + (box.width - landingWidth) / 2
        const landingRight = landingLeft + landingWidth
        if (p.x < landingLeft || p.x > landingRight) {
          // Particle rolled off, remove landing state and let it fall
          p.isLandedOnGiftBox = false
        }
      }
      
      return false
    }
    
    // Bounce particles off card boundaries with more natural physics
    const constrainParticle = (p, halfSize) => {
      // Use particle size for collision detection (circular dots)
      // halfSize is passed in to avoid recalculating (optimization)
      if (halfSize === undefined) {
        halfSize = p.size / 2 // Fallback if not provided
      }
      
      // LAYOUT 0: Check gift box collision first
      const giftBoxCollision = handleGiftBoxCollision(p, cardBounds)
      
      // LAYOUT 0: No envelope collision
      const envelopeCollision = false
      
      // If no envelope or gift box collision, check card boundaries
      if (!envelopeCollision && !giftBoxCollision) {
        // Use card bounds (accounting for offset) instead of canvas bounds
        const minX = cardBounds.minX + halfSize
        const maxX = cardBounds.maxX - halfSize
        // For canvas at card level (Single 0), cardOffsetY should be 0, so minY should be 0
        // But allow particles to reach the very top by using the actual card top (minY)
        const minY = cardBounds.minY + halfSize
        
        // LAYOUT 0: No third floor (red line) - skip this entire section
        // Floor hierarchy: 1st floor (lowest) = cutout valley, 2nd floor (middle) = Union top
        if (false) { // LAYOUT 0: Always skip third floor logic
          const thirdFloorTop = cardBounds.secondFloorY - halfSize
          const thirdFloorBottom = cardBounds.secondFloorY + halfSize
          
          // Check if particle is within third floor horizontally (width varies: Single 0/1 = 100px, Batch 1 = 160px)
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
        // Use more lenient bounds check to ensure particles can enter cutout
        const isInCutout = cardBounds.unionCutout && 
          p.x >= cardBounds.unionCutout.left - halfSize * 2 && 
          p.x <= cardBounds.unionCutout.right + halfSize * 2
        
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
      // If paused, draw particles in current state but don't update or continue animation
      // Use ref to check pause state without causing effect re-run
      if (pauseRef.current) {
        console.log('[Confetti Layout0] Draw called while PAUSED - freezing particles at frame', frameCount, 'Active particles:', activeParticleCount)
        // Draw particles frozen in their current positions
        // Clear and redraw to show current state
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        if (ctxFront) {
          ctxFront.clearRect(0, 0, canvasFront.width, canvasFront.height)
        }
        if (ctxMirrored) {
          ctxMirrored.clearRect(0, 0, canvasMirrored.width, canvasMirrored.height)
        }
        blurContexts.forEach(blurCtx => {
          if (blurCtx && blurCtx.canvas) {
            blurCtx.clearRect(0, 0, blurCtx.canvas.width, blurCtx.canvas.height)
          }
        })
        
        // Draw all particles in their current frozen state
        const TWO_PI = Math.PI * 2
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]
          if (p === null || p.opacity <= 0) continue
          
          const halfSize = p.size / 2
          const isOffScreen = p.x + halfSize < 0 || 
                             p.x - halfSize > canvas.width || 
                             p.y + halfSize < 0 || 
                             p.y - halfSize > canvas.height
          if (isOffScreen) continue
          
          // Draw to appropriate canvas layer
          let drawCtx = null
          if (p.blurLevel !== null && blurContexts[p.blurLevel]) {
            drawCtx = blurContexts[p.blurLevel]
          } else {
            const isFrontLayer = p.layer === 'front'
            drawCtx = (isFrontLayer && ctxFront) ? ctxFront : ctx
          }
          
          if (drawCtx) {
            drawCtx.save()
            drawCtx.translate(p.x, p.y)
            drawCtx.rotate(p.rot)
            drawCtx.globalAlpha = p.opacity
            drawCtx.fillStyle = p.color
            drawCtx.beginPath()
            drawCtx.arc(0, 0, halfSize, 0, TWO_PI)
            drawCtx.closePath()
            drawCtx.fill()
            drawCtx.restore()
          }
          
          // Draw mirrored version if mirrored canvas exists
          if (ctxMirrored) {
            const mirrorY = getMirrorY()
            const mirroredY = mirrorY + (mirrorY - p.y)
            ctxMirrored.save()
            ctxMirrored.translate(p.x, mirroredY)
            ctxMirrored.rotate(-p.rot)
            ctxMirrored.globalAlpha = p.opacity * 1.0
            ctxMirrored.fillStyle = p.color
            const mirroredHalfSize = halfSize * 1.5
            ctxMirrored.beginPath()
            ctxMirrored.arc(0, 0, mirroredHalfSize, 0, TWO_PI)
            ctxMirrored.closePath()
            ctxMirrored.fill()
            ctxMirrored.restore()
          }
        }
        console.log('[Confetti Layout0] Paused - stopping animation loop')
        return // Don't continue animation loop - particles are frozen
      }
      
      // Track animation start time on first frame
      if (animationStartTime === null) {
        animationStartTime = performance.now()
      }
      
      frameCount++
      
      // CRITICAL: Check if we should pause at a specific frame (for capture)
      // This MUST happen immediately after incrementing frameCount
      const targetFrame = pauseAtFrameRef.current
      if (targetFrame !== null && frameCount >= targetFrame && !pauseRef.current) {
        console.log('[Confetti Layout0] CRITICAL: Reached/past target frame', targetFrame, 'at frame', frameCount, '- pausing immediately!')
        pauseRef.current = true
        // Stop the animation loop immediately
        if (animId) {
          cancelAnimationFrame(animId)
          animId = null
        }
        if (animIdRef.current) {
          cancelAnimationFrame(animIdRef.current)
          animIdRef.current = null
        }
        // Update exposed state
        if (typeof window !== 'undefined') {
          window.__confettiPaused = true
        }
        // Draw final frame and return (don't continue - this stops the loop)
        // We'll draw the particles below, then return
      }
      
      // Expose frameCount for Puppeteer (capture mode)
      if (typeof window !== 'undefined' && targetFrame !== null) {
        window.__confettiFrameCount = frameCount
        window.__confettiPaused = pauseRef.current
      }
      
      // CRITICAL: Reset animationStartTime if hover ended (fade-out started)
      // This prevents slow motion from persisting after hover exits
      if (isFadingOutRef.current && animationStartTime !== null) {
        // Reset animation start time to prevent slow motion during fade-out
        // Slow motion should only apply during active hover, not during fade-out
        animationStartTime = null
      }
      
      // Calculate elapsed time in milliseconds and check if slow motion should be active
      // DISABLE slow motion for capture mode (pauseAtFrame is set)
      // CRITICAL: Only apply slow motion if animation is still actively running (not fading out)
      const elapsedTime = animationStartTime !== null ? performance.now() - animationStartTime : 0
      const isSlowMotion = targetFrame === null && 
                          !isFadingOutRef.current && 
                          animationStartTime !== null && 
                          elapsedTime >= slowMotionStartTime
      
      // Debug log every 30 frames
      if (frameCount % 30 === 0) {
        const targetFrame = pauseAtFrameRef.current
        console.log('[Confetti Layout0] Frame:', frameCount, 'Active particles:', activeParticleCount, 'Paused:', pauseRef.current, 'Slow motion:', isSlowMotion, 'Target frame:', targetFrame, 'Elapsed:', elapsedTime.toFixed(0) + 'ms')
      }
      
      // CRITICAL: Log when we reach target frame for capture
      if (pauseAtFrameRef.current !== null && frameCount === pauseAtFrameRef.current) {
        console.log('[Confetti Layout0] ⚠️ REACHED TARGET FRAME', pauseAtFrameRef.current, '- SHOULD PAUSE NOW!')
      }
      
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
      // LAYOUT 0: Clear blur canvas layers
      blurContexts.forEach(blurCtx => {
        if (blurCtx && blurCtx.canvas) {
          blurCtx.clearRect(0, 0, blurCtx.canvas.width, blurCtx.canvas.height)
        }
      })
      
      // LAYOUT 0: Debug visualization for gift box bounds (dev only)
      if (cardBounds.giftBox && CONFETTI_CONFIG_LAYOUT_0.debug.showBounds && process.env.NODE_ENV === 'development') {
        const box = cardBounds.giftBox
        const borderRadius = CONFETTI_CONFIG_LAYOUT_0.debug.borderRadius * dpr
        ctx.save()
        ctx.strokeStyle = '#00ff00'
        ctx.lineWidth = 2 * dpr
        ctx.globalAlpha = 0.5
        // Draw rounded rectangle outline matching box bounds
        ctx.beginPath()
        ctx.moveTo(box.left + borderRadius, box.top)
        ctx.lineTo(box.right - borderRadius, box.top)
        ctx.arcTo(box.right, box.top, box.right, box.top + borderRadius, borderRadius)
        ctx.lineTo(box.right, box.bottom - borderRadius)
        ctx.arcTo(box.right, box.bottom, box.right - borderRadius, box.bottom, borderRadius)
        ctx.lineTo(box.left + borderRadius, box.bottom)
        ctx.arcTo(box.left, box.bottom, box.left, box.bottom - borderRadius, borderRadius)
        ctx.lineTo(box.left, box.top + borderRadius)
        ctx.arcTo(box.left, box.top, box.left + borderRadius, box.top, borderRadius)
        ctx.closePath()
        ctx.stroke()
        ctx.restore()
      }
      
      // Get mirror point for this frame
      const mirrorY = getMirrorY()
      
      // Optimized: use for loop instead of forEach for better performance
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        if (p === null) continue // Skip null particles
        
        // Cache frequently used values (optimization: calculate once per particle)
        const halfSize = p.size / 2
        
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
        
        // Apply fade-out if hover ended
        if (isFadingOutRef.current && fadeOutStartTimeRef.current !== null) {
          const fadeOutElapsed = performance.now() - fadeOutStartTimeRef.current
          const fadeOutProgress = Math.min(1, fadeOutElapsed / fadeOutDuration)
          // Smooth fade-out using ease-in curve
          const fadeOutMultiplier = 1 - fadeOutProgress * fadeOutProgress * fadeOutProgress // Ease-in cubic
          p.opacity *= fadeOutMultiplier
          
          // Remove particle when fully faded
          if (fadeOutProgress >= 1 && p.opacity <= 0) {
            particles[i] = null
            activeParticleCount--
            continue
          }
        }
        
        // Apply slow-motion effect after 1400ms - particles float in space
        // DISABLE slow motion for capture mode (pauseAtFrame is set)
        let currentSlowMotionFactor = 1.0
        if (isSlowMotion && pauseAtFrameRef.current === null) {
          currentSlowMotionFactor = slowMotionFactor
        }
        
        // Apply air resistance (confetti slows down naturally)
        // In slow motion, air resistance is less effective (particles maintain momentum longer)
        const effectiveAirResistance = isSlowMotion ? 
          (1 - (1 - p.airResistance) * slowMotionFactor) : // Scale air resistance effect
          p.airResistance
        p.vx *= effectiveAirResistance
        p.vy *= effectiveAirResistance
        
        // LAYOUT 0: Floating behavior after eruption - especially for high blur particles
        const framesSinceSpawn = frameCount - p.spawnFrame
        const isAfterEruption = framesSinceSpawn > eruptionBoostFrames
        
        if (isAfterEruption && p.shouldFloat && !p.isLandedOnGiftBox && !p.isLandedOnSecondFloor) {
          // Floating particles: reduce gravity significantly and add slight upward drift
          // Higher blur particles (blurLevel 3) float more
          const blurFloatMultiplier = p.blurLevel !== null ? (0.1 + (p.blurLevel / 3) * 0.15) : 0.1 // 0.1 for blurLevel 0, up to 0.25 for blurLevel 3
          const floatGravity = p.ay * blurFloatMultiplier * currentSlowMotionFactor // Apply slow motion to gravity
          p.vy += floatGravity
          
          // Add slight upward drift for more floaty effect (especially high blur)
          if (p.blurLevel !== null && p.blurLevel >= 2) {
            const upwardDrift = (0.02 + (p.blurLevel - 2) * 0.03) * dpr * currentSlowMotionFactor // Apply slow motion
            p.vy -= upwardDrift * (0.5 + Math.random() * 0.5) // Random variation
          }
          
          // Reduce air resistance for floating particles (they maintain momentum longer)
          const floatAirResistance = isSlowMotion ? 0.998 : 0.995 // Even less air resistance in slow motion
          p.vx *= floatAirResistance
          p.vy *= floatAirResistance
        } else {
          // Normal gravity for non-floating particles or during eruption
          // Apply slow motion to gravity
          p.vy += p.ay * currentSlowMotionFactor
        }
        
        // Apply gyroscope/tilt forces on mobile devices
        // Only apply horizontal tilt (gamma) after confetti animation has settled
        // Particles must have been active for a certain number of frames before gyroscope interaction
        if (isMobile && orientationListenerAdded && frameCount >= confettiSettleFrames) {
          // Only apply horizontal tilt (left-right), not vertical tilt
          // Gamma (left-to-right): positive = tilted right, particles should move right (positive X)
          const tiltForceX = (deviceTilt.gamma / 45) * gyroscopeForceMultiplier * dpr * currentSlowMotionFactor // Apply slow motion
          
          // Apply only horizontal tilt force to velocity (only if listener is active and settled)
          p.vx += tiltForceX
          // No vertical tilt - particles maintain their natural vertical movement
        }
        
        // Update position - apply slow motion to movement
        p.x += p.vx * currentSlowMotionFactor
        p.y += p.vy * currentSlowMotionFactor
        
        // Update rotation (more tumbling) - apply slow motion to rotation
        p.rot += p.vr * currentSlowMotionFactor
        
        // LAYOUT 0: Update layer based on position relative to box (dynamic layer assignment)
        if (cardBounds.giftBox && canvasFront && CONFETTI_CONFIG_LAYOUT_0.layer.usePositionBased) {
          // Particles behind box (above box top) = back layer (more blur)
          // Particles in front of box (below box top) = front layer (less blur)
          p.layer = p.y < cardBounds.giftBox.top ? 'back' : 'front'
        }
        
        // Apply boundary constraints (pass halfSize to avoid recalculating)
        constrainParticle(p, halfSize)
        
        // Cull off-screen particles (optimization: don't draw particles outside canvas)
        const isOffScreen = p.x + halfSize < 0 || 
                           p.x - halfSize > canvas.width || 
                           p.y + halfSize < 0 || 
                           p.y - halfSize > canvas.height
        
        // Only draw if particle has some opacity and is on-screen
        if (p.opacity > 0 && !isOffScreen) {
          // LAYOUT 0: Use blur canvas layers for varied blur
          let drawCtx = null
          if (p.blurLevel !== null && blurContexts[p.blurLevel]) {
            // Layout 0: Draw to blur canvas layer based on blurLevel
            drawCtx = blurContexts[p.blurLevel]
          } else {
            // Fallback: Use standard front/back layers
            const isFrontLayer = p.layer === 'front'
            drawCtx = (isFrontLayer && ctxFront) ? ctxFront : ctx
          }
          
          if (drawCtx) {
            drawCtx.save()
            drawCtx.translate(p.x, p.y)
            drawCtx.rotate(p.rot)
            drawCtx.globalAlpha = p.opacity
            drawCtx.fillStyle = p.color
            
            // Draw circular dot (optimized: use cached TWO_PI constant and halfSize)
            drawCtx.beginPath()
            drawCtx.arc(0, 0, halfSize, 0, TWO_PI)
            drawCtx.closePath()
            drawCtx.fill()
            
            drawCtx.restore()
          }
          
          // Draw mirrored version if mirrored canvas exists (optimization: opacity already checked above)
          if (ctxMirrored) {
            // Calculate mirrored Y position (flip across mirrorY)
            const mirroredY = mirrorY + (mirrorY - p.y)
            
            ctxMirrored.save()
            ctxMirrored.translate(p.x, mirroredY)
            ctxMirrored.rotate(-p.rot) // Reverse rotation for mirror
            ctxMirrored.globalAlpha = p.opacity * 1.0 // Full opacity for brighter effect (was 0.6)
            ctxMirrored.fillStyle = p.color
            
          // Draw circular dot - 1.5x bigger for mirrored particles (optimized: use cached TWO_PI constant and halfSize)
          const mirroredHalfSize = halfSize * 1.5
          ctxMirrored.beginPath()
          ctxMirrored.arc(0, 0, mirroredHalfSize, 0, TWO_PI)
            ctxMirrored.closePath()
            ctxMirrored.fill()
            
            ctxMirrored.restore()
          }
        }
      }
      
      // CRITICAL: Check if we should pause before continuing the loop
      // This prevents the animation from continuing past the target frame
      if (pauseRef.current) {
        console.log('[Confetti Layout0] Pause detected in draw loop at frame', frameCount, '- stopping animation')
        // Cancel any pending animation frame
        if (animId) {
          cancelAnimationFrame(animId)
          animId = null
        }
        if (animIdRef.current) {
          cancelAnimationFrame(animIdRef.current)
          animIdRef.current = null
        }
        // Draw particles frozen in their current state one more time
        // (they were already drawn above, but this ensures final state is shown)
        return // Stop the animation loop - DO NOT call requestAnimationFrame
      }
      
      // CRITICAL: Double-check pause state before continuing (safety check)
      const targetFrameCheck = pauseAtFrameRef.current
      if (targetFrameCheck !== null && frameCount >= targetFrameCheck) {
        console.log('[Confetti Layout0] SAFETY CHECK: Past target frame', targetFrameCheck, 'at frame', frameCount, '- forcing pause!')
        pauseRef.current = true
        if (animId) {
          cancelAnimationFrame(animId)
          animId = null
        }
        if (animIdRef.current) {
          cancelAnimationFrame(animIdRef.current)
          animIdRef.current = null
        }
        if (typeof window !== 'undefined') {
          window.__confettiPaused = true
        }
        return // Stop the animation loop - DO NOT call requestAnimationFrame
      }
      
      // Check if fade-out is complete and all particles are gone
      if (isFadingOutRef.current && fadeOutStartTimeRef.current !== null) {
        const fadeOutElapsed = performance.now() - fadeOutStartTimeRef.current
        if (fadeOutElapsed >= fadeOutDuration && activeParticleCount === 0) {
          console.log('[Confetti Layout0] Fade-out complete - stopping animation')
          if (animId) {
            cancelAnimationFrame(animId)
            animId = null
            animIdRef.current = null
          }
          // Clear canvases after fade-out
          ctx && ctx.clearRect(0, 0, canvas.width, canvas.height)
          if (ctxFront) ctxFront.clearRect(0, 0, canvasFront.width, canvasFront.height)
          if (ctxMirrored) ctxMirrored.clearRect(0, 0, canvasMirrored.width, canvasMirrored.height)
          blurContexts.forEach(blurCtx => {
            if (blurCtx && blurCtx.canvas) {
              blurCtx.clearRect(0, 0, blurCtx.canvas.width, blurCtx.canvas.height)
            }
          })
          hasInitializedRef.current = false
          isFadingOutRef.current = false
          fadeOutStartTimeRef.current = null
          return // Stop the animation loop
        }
      }
      
      // Continue animation loop ONLY if not paused
      if (!pauseRef.current) {
      animId = requestAnimationFrame(draw)
      animIdRef.current = animId // Store in ref
      } else {
        console.log('[Confetti Layout0] Skipping requestAnimationFrame - paused at frame', frameCount)
      }
    }
    
    // Start animation loop
    // If forceHovered, always start (even if paused) so particles can spawn
    // The draw loop will handle pausing after particles are visible
    if (!pauseRef.current || forceHovered) {
      console.log('[Confetti Layout0] Starting animation loop', { paused: pauseRef.current, forceHovered })
      animId = requestAnimationFrame(draw)
      animIdRef.current = animId // Store in ref immediately
    } else {
      console.log('[Confetti Layout0] Paused and not force hovered - drawing frozen state once')
      // If paused and not force hovered, draw once to show particles in current state (frozen)
      draw()
    }
    
    return () => {
      // CRITICAL: Always cleanup animation frames to prevent infinite loops
      // Even if conditions are still valid, we need to cancel the animation frame
      // The effect will restart if conditions are still met
      
      // ALWAYS cancel animation frames to prevent infinite loops
        if (animIdRef.current) {
          cancelAnimationFrame(animIdRef.current)
          animIdRef.current = null
        }
        if (animId) {
          cancelAnimationFrame(animId)
          animId = null
        }
      
      // Only clear canvases and reset state if conditions are no longer met
      // This prevents clearing during fade-out or when conditions are still valid
      const shouldFullCleanup = !forceHovered && !isHovered && !isFadingOutRef.current
      
      if (shouldFullCleanup) {
        // Defer canvas clearing to avoid blocking
        requestAnimationFrame(() => {
        ctx && ctx.clearRect(0, 0, canvas.width, canvas.height)
        if (ctxFront) ctxFront.clearRect(0, 0, canvasFront.width, canvasFront.height)
        if (ctxMirrored) ctxMirrored.clearRect(0, 0, canvasMirrored.width, canvasMirrored.height)
        blurContexts.forEach(blurCtx => {
          if (blurCtx && blurCtx.canvas) {
            blurCtx.clearRect(0, 0, blurCtx.canvas.width, blurCtx.canvas.height)
          }
          })
        })
        hasInitializedRef.current = false
        isFadingOutRef.current = false
        fadeOutStartTimeRef.current = null
        // Remove device orientation listener if it was added
        if (orientationListenerAdded) {
          window.removeEventListener('deviceorientation', handleDeviceOrientation)
          orientationListenerAdded = false
        }
      } else {
        // Conditions still valid or fading out - don't clear canvases, but animation frames are canceled
        // The effect will restart if conditions are still met
        // Reset initialization flag so effect can restart if needed
        hasInitializedRef.current = false
      }
    }
  }, [isHovered, allAccepted, confettiCanvasRef, cardRef, confettiCanvasFrontRef, confettiCanvasMirroredRef, blurCanvasRefs, forceHovered, immediateFrame])
}

