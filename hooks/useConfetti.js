import { useEffect, useRef } from 'react'
import { CONFETTI_CONFIG } from '@/constants/sentCardConstants'

/**
 * Custom hook for confetti animation on canvas
 * Uses unified configuration from CONFETTI_CONFIG
 * @param {boolean} isHovered - Whether the card is hovered
 * @param {boolean} allAccepted - Whether all items are accepted
 * @param {React.RefObject} confettiCanvasRef - Ref to the canvas element
 * @param {React.RefObject} cardRef - Ref to the card element
 */
export default function useConfetti(isHovered, allAccepted, confettiCanvasRef, cardRef) {
  useEffect(() => {
    if (!isHovered || !allAccepted) return
    const canvas = confettiCanvasRef.current
    const cardEl = cardRef.current
    if (!canvas || !cardEl) return
    
    // Find envelope/box element for collision detection
    // For Single 1 (Gift Container), we don't want collision detection as it blocks particles
    // Only use collision for actual envelopes/boxes (Batch 2, Single 2)
    const envelopeEl = cardEl.querySelector('[data-name="Envelope"]')
    
    const ctx = canvas.getContext('2d')
    let animId
    const dpr = window.devicePixelRatio || 1
    
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
        envelope: envelopeBounds
      }
      
      return cardBounds
    }
    
    let cardBounds = updateCardBounds()
    
    // Use unified confetti configuration
    const { colors, maxParticles, speed, horizontalDrift, gravity, size, rotation } = CONFETTI_CONFIG
    
    const spawnParticle = (initialY = null) => {
      // More varied particle speeds - some fast, some slow, more natural distribution
      const speedVariation = 0.5 + Math.random() * 1.5 // 0.5x to 2x base speed
      const particleSpeed = (speed.min + Math.random() * speed.max) * speedVariation
      
      // Rice grain dimensions - elongated shape
      const baseSize = (size.min + Math.random() * size.max) * dpr
      const length = baseSize * (2.5 + Math.random() * 1.5) // 2.5x to 4x longer
      const width = baseSize * (0.28 + Math.random() * 0.14) // 0.28x to 0.42x width (30% thinner)
      const halfSize = length / 2 // Use length for spawn position calculation
      
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
        // Rice grain dimensions
        length: length, // Long axis
        width: width, // Short axis
        size: Math.max(length, width), // For collision detection, use larger dimension
        color: colors[(Math.random() * colors.length) | 0],
        shape: 'rice', // Elongated rice grain shape
        // Fade-in properties
        opacity: 0,
        fadeInProgress: 0,
        fadeInDuration: fadeInDuration,
        // Bounce energy retention (more loss for natural feel)
        bounceEnergy: 0.4 + Math.random() * 0.2 // 40-60% energy retention (significant loss for natural feel)
      }
    }
    
    // Spawn particles throughout the card height for better distribution
    const spawnParticleAnywhere = () => {
      // Use average rice grain length for spawn calculation
      const avgBaseSize = (size.min + size.max) / 2 * dpr
      const avgLength = avgBaseSize * 3.25 // Average of 2.5-4x range
      const halfSize = avgLength / 2
      // Spawn throughout the entire card height (accounting for offset)
      // Prefer lower 2/3 of card for more natural confetti burst
      const spawnY = cardBounds.minY + halfSize + Math.random() * (cardBounds.maxY - cardBounds.minY - halfSize * 2) * 0.67
      return spawnParticle(spawnY)
    }
    
    // Spawn particles with more natural distribution - not all at once
    // Use slightly fewer particles for more natural feel, spawn them gradually
    const targetParticleCount = Math.floor(maxParticles * 0.85) // 85% of max for more natural feel
    const particles = Array.from({ length: targetParticleCount }).map(spawnParticleAnywhere)
    
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
      
      // More natural bounce - less energy retention, less dramatic
      const envelopeBounceEnergy = 0.5 + Math.random() * 0.2 // 50-70% energy retention (more loss)
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
        // For rice grains, use the length (longer dimension) for collision detection
      const halfSize = p.shape === 'rice' ? p.length / 2 : p.size / 2
      
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
        const maxY = cardBounds.maxY - halfSize
        
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
      // Update card bounds periodically in case of resize
      if (Math.random() < 0.01) { // Update ~1% of frames to avoid performance hit
        cardBounds = updateCardBounds()
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
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
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(p.rot)
          ctx.globalAlpha = p.opacity
          ctx.fillStyle = p.color
          
          // Draw elongated rice grain shape
          if (p.shape === 'rice') {
            // Draw elongated ellipse (rice grain shape)
            ctx.beginPath()
            ctx.ellipse(0, 0, p.length / 2, p.width / 2, 0, 0, Math.PI * 2)
            ctx.closePath()
            ctx.fill()
          } else {
            // Fallback to circle for other shapes
            ctx.beginPath()
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
            ctx.closePath()
            ctx.fill()
          }
          
          ctx.restore()
        }
      })
      animId = requestAnimationFrame(draw)
    }
    
    animId = requestAnimationFrame(draw)
    
    return () => {
      if (animId) cancelAnimationFrame(animId)
      ctx && ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [isHovered, allAccepted, confettiCanvasRef, cardRef])
}

