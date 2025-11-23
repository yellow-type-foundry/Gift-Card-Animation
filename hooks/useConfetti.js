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
    
    const ctx = canvas.getContext('2d')
    const ctxFront = canvasFront?.getContext('2d')
    const ctxMirrored = canvasMirrored?.getContext('2d')
    let animId
    const dpr = window.devicePixelRatio || 1
    
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
        unionCutout: unionCutout
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
    
    const spawnParticle = (initialY = null) => {
      // More varied particle speeds - some fast, some slow, more natural distribution
      const speedVariation = 0.5 + Math.random() * 1.5 // 0.5x to 2x base speed
      const particleSpeed = (speed.min + Math.random() * speed.max) * speedVariation
      
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
      const horizontalSpread = horizontalDrift * (0.5 + Math.random() * 1.5) // 0.5x to 2x
      const angleVariation = (Math.random() - 0.5) * 0.3 // ±15 degrees from vertical
      
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
        // Air resistance factor (confetti slows down over time)
        airResistance: 0.97 + Math.random() * 0.02, // 0.97-0.99 (more velocity decay for natural feel)
        // Reduced gravity so particles can reach the top of the card
        ay: gravity * dpr * 0.4, // Reduce gravity by 60% so particles can rise higher
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
        bounceEnergy: (0.4 + Math.random() * 0.2) * 1.5 // 50-75% energy retention (increased from 40-60%)
      }
    }
    
    // Spawn particles from bottom for eruption effect
    const spawnParticleFromBottom = () => {
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
      return spawnParticle(spawnY)
    }
    
    // Start with no particles - they will erupt gradually on hover
    const targetParticleCount = Math.floor(maxParticles * 0.85) // 85% of max for more natural feel
    const particles = Array.from({ length: targetParticleCount }).map(() => null) // Pre-allocate array, start empty
    let activeParticleCount = 0
    let frameCount = 0
    
    // Spawn rate starts slow and accelerates - creates eruption effect
    const initialSpawnRate = 0.08 // 8% chance per frame initially (faster start)
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
      const envelopeBounceEnergy = (0.5 + Math.random() * 0.2) * 1.5 // 62.5-87.5% energy retention (increased from 50-70%)
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
        
        // Check if particle is within Union cutout horizontally
        const isInCutout = cardBounds.unionCutout && 
          p.x >= cardBounds.unionCutout.left - halfSize && 
          p.x <= cardBounds.unionCutout.right + halfSize
        
        // Determine floor based on whether particle is in cutout
        let maxY
        if (cardBounds.unionTop !== null) {
          if (isInCutout) {
            // Allow particles to fall into cutout valley
            maxY = cardBounds.unionCutout.bottom - halfSize
          } else {
            // Bounce at Union top if outside cutout
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
    
    const draw = () => {
      frameCount++
      
      // Update card bounds periodically in case of resize
      if (Math.random() < 0.01) { // Update ~1% of frames to avoid performance hit
        cardBounds = updateCardBounds()
      }
      
      // Gradually spawn particles - start slow, accelerate over time
      if (activeParticleCount < targetParticleCount) {
        // Calculate spawn rate that accelerates from initial to max
        const progress = Math.min(1, frameCount / accelerationFrames)
        const easeOutProgress = 1 - Math.pow(1 - progress, 2) // Ease-out quadratic for smooth acceleration
        const currentSpawnRate = initialSpawnRate + (maxSpawnRate - initialSpawnRate) * easeOutProgress
        
        // Spawn new particles based on current rate
        if (Math.random() < currentSpawnRate) {
          // Find first null slot
          for (let i = 0; i < particles.length; i++) {
            if (particles[i] === null) {
              particles[i] = spawnParticleFromBottom()
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
      
      particles.forEach((p, index) => {
        if (p === null) return // Skip null particles
        // Update fade-in progress
        if (p.fadeInProgress < p.fadeInDuration) {
          p.fadeInProgress++
          // Smooth fade-in using ease-out curve
          const progress = p.fadeInProgress / p.fadeInDuration
          p.opacity = 1 - Math.pow(1 - progress, 3) // Ease-out cubic
        } else {
          p.opacity = 1
        }
        
        // Apply air resistance (confetti slows down naturally)
        p.vx *= p.airResistance
        p.vy *= p.airResistance
        
        // Apply gravity
        p.vy += p.ay
        
        // Update position
        p.x += p.vx
        p.y += p.vy
        
        // Update rotation (more tumbling)
        p.rot += p.vr
        
        // Apply boundary constraints
        constrainParticle(p)
        
        // Only draw if particle has some opacity
        if (p.opacity > 0) {
          // Choose the appropriate canvas context based on particle layer
          const drawCtx = (p.layer === 'front' && ctxFront) ? ctxFront : ctx
          
          drawCtx.save()
          drawCtx.translate(p.x, p.y)
          drawCtx.rotate(p.rot)
          drawCtx.globalAlpha = p.opacity
          drawCtx.fillStyle = p.color
          
          // Draw circular dot
          drawCtx.beginPath()
          drawCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
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
            
            // Draw circular dot - 1.5x bigger for mirrored particles
            const mirroredSize = p.size * 1.5
            ctxMirrored.beginPath()
            ctxMirrored.arc(0, 0, mirroredSize / 2, 0, Math.PI * 2)
            ctxMirrored.closePath()
            ctxMirrored.fill()
            
            ctxMirrored.restore()
          }
        }
      })
      animId = requestAnimationFrame(draw)
    }
    
    animId = requestAnimationFrame(draw)
    
    return () => {
      if (animId) cancelAnimationFrame(animId)
      ctx && ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (ctxFront) ctxFront.clearRect(0, 0, canvasFront.width, canvasFront.height)
      if (ctxMirrored) ctxMirrored.clearRect(0, 0, canvasMirrored.width, canvasMirrored.height)
    }
  }, [isHovered, allAccepted, confettiCanvasRef, cardRef, confettiCanvasFrontRef, confettiCanvasMirroredRef])
}

