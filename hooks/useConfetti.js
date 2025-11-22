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
        maxY: cardHeight - cardOffsetY
      }
      
      return cardBounds
    }
    
    let cardBounds = updateCardBounds()
    
    // Use unified confetti configuration
    const { colors, maxParticles, speed, horizontalDrift, gravity, size, rotation } = CONFETTI_CONFIG
    
    const spawnParticle = (initialY = null) => {
      const particleSpeed = speed.min + Math.random() * speed.max
      const halfSize = (size.min + Math.random() * size.max) * dpr / 2
      
      // Calculate spawn position accounting for card offset
      // Particles should spawn within the card bounds, not canvas bounds
      const spawnX = cardBounds.minX + halfSize + Math.random() * (cardBounds.maxX - cardBounds.minX - halfSize * 2)
      const spawnY = initialY !== null 
        ? initialY 
        : (cardBounds.maxY - halfSize - 2 * dpr) // Spawn near bottom of card
      
      // Fade-in duration in frames (60fps = ~0.5 seconds)
      const fadeInDuration = 30 + Math.random() * 20 // 30-50 frames (0.5-0.83 seconds at 60fps)
      
      return {
        // Position relative to canvas, accounting for card offset
        x: spawnX,
        y: spawnY,
        // Shoot upwards with slight horizontal drift
        vx: (Math.random() * 2 - 1) * horizontalDrift * dpr,
        vy: -particleSpeed * dpr,
        // Reduced gravity so particles can reach the top of the card
        ay: gravity * dpr * 0.4, // Reduce gravity by 60% so particles can rise higher
        rot: Math.random() * rotation.initial,
        vr: rotation.velocity.min + Math.random() * (rotation.velocity.max - rotation.velocity.min),
        size: (size.min + Math.random() * size.max) * dpr,
        color: colors[(Math.random() * colors.length) | 0],
        shape: Math.random() < 0.5 ? 'rect' : 'tri',
        // Fade-in properties
        opacity: 0,
        fadeInProgress: 0,
        fadeInDuration: fadeInDuration
      }
    }
    
    // Spawn particles throughout the card height for better distribution
    const spawnParticleAnywhere = () => {
      const halfSize = (size.min + Math.random() * size.max) * dpr / 2
      // Spawn throughout the entire card height (accounting for offset)
      const spawnY = cardBounds.minY + halfSize + Math.random() * (cardBounds.maxY - cardBounds.minY - halfSize * 2)
      return spawnParticle(spawnY)
    }
    
    // Spawn particles throughout the card for better distribution
    const particles = Array.from({ length: maxParticles }).map(spawnParticleAnywhere)
    
    // Bounce particles off card boundaries instead of recycling
    const constrainParticle = (p) => {
      const halfSize = p.size / 2
      // Use card bounds (accounting for offset) instead of canvas bounds
      const minX = cardBounds.minX + halfSize
      const maxX = cardBounds.maxX - halfSize
      const minY = cardBounds.minY + halfSize
      const maxY = cardBounds.maxY - halfSize
      
      // Horizontal boundaries - bounce with some energy loss
      if (p.x <= minX) {
        p.x = minX
        p.vx = Math.abs(p.vx) * 0.8 // Bounce with 80% energy retention
      } else if (p.x >= maxX) {
        p.x = maxX
        p.vx = -Math.abs(p.vx) * 0.8
      }
      
      // Vertical boundaries - bounce with some energy loss
      if (p.y <= minY) {
        p.y = minY
        p.vy = Math.abs(p.vy) * 0.8
      } else if (p.y >= maxY) {
        p.y = maxY
        p.vy = -Math.abs(p.vy) * 0.8
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
        
        p.vy += p.ay
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        constrainParticle(p)
        
        // Only draw if particle has some opacity
        if (p.opacity > 0) {
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(p.rot)
          ctx.globalAlpha = p.opacity
          ctx.fillStyle = p.color
          // Draw circle only
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx.closePath()
          ctx.fill()
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

