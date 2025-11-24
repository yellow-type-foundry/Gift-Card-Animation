import { useEffect, useRef } from 'react'
import { CONFETTI_CONFIG } from '@/constants/sentCardConstants'

/**
 * Layout 1 confetti hook - ORIGINAL, UNTOUCHED
 * This hook is completely separate from Layout 0 confetti
 * @param {boolean} isHovered - Whether the card is hovered
 * @param {boolean} allAccepted - Whether all items are accepted
 * @param {React.RefObject} confettiCanvasRef - Ref to the canvas element (back layer)
 * @param {React.RefObject} cardRef - Ref to the card element
 * @param {React.RefObject} confettiCanvasFrontRef - Optional ref to front canvas element
 * @param {React.RefObject} confettiCanvasMirroredRef - Optional ref to vertically mirrored canvas element
 */
export default function useConfettiLayout1(isHovered, allAccepted, confettiCanvasRef, cardRef, confettiCanvasFrontRef = null, confettiCanvasMirroredRef = null) {
  useEffect(() => {
    if (!isHovered || !allAccepted) return
    const canvas = confettiCanvasRef.current
    const canvasFront = confettiCanvasFrontRef?.current
    const canvasMirrored = confettiCanvasMirroredRef?.current
    const cardEl = cardRef.current
    if (!canvas || !cardEl) return
    
    // Find third floor element (red line) - for Single 1 and Batch 1 only
    const thirdFloorElSingle1 = cardEl.querySelector('[data-name="Second Floor"][data-floor-type="single1"]')
    const thirdFloorElBatch1 = cardEl.querySelector('[data-name="Second Floor"][data-floor-type="batch1"]')
    const thirdFloorEl = thirdFloorElSingle1 || thirdFloorElBatch1
    
    // Find envelope/box element for collision detection
    const envelopeEl = cardEl.querySelector('[data-name="Envelope"]')
    
    // Find Union shape element - use its top as the confetti floor
    const unionEl = cardEl.querySelector('[data-name="Union"]')
    
    const ctx = canvas.getContext('2d')
    const ctxFront = canvasFront?.getContext('2d')
    const ctxMirrored = canvasMirrored?.getContext('2d')
    let animId
    const dpr = window.devicePixelRatio || 1
    
    // Gyroscope/tilt interaction for mobile devices
    let deviceTilt = { beta: 0, gamma: 0 }
    const gyroscopeForceMultiplier = 0.2
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    let orientationListenerAdded = false
    const confettiSettleFrames = 180
    
    // Device orientation event handler
    const handleDeviceOrientation = (event) => {
      const beta = event.beta !== null && event.beta !== undefined ? event.beta : null
      const gamma = event.gamma !== null && event.gamma !== undefined ? event.gamma : null
      
      if (beta !== null && gamma !== null) {
        deviceTilt.beta = Math.max(-45, Math.min(45, beta))
        deviceTilt.gamma = Math.max(-45, Math.min(45, gamma))
      }
    }
    
    // Request permission and add listener
    const setupDeviceOrientation = async () => {
      if (!isMobile || typeof DeviceOrientationEvent === 'undefined') return
      if (orientationListenerAdded) return
      
      try {
        if (DeviceOrientationEvent.requestPermission) {
          try {
            const response = await DeviceOrientationEvent.requestPermission()
            if (response === 'granted') {
              window.addEventListener('deviceorientation', handleDeviceOrientation, { passive: true })
              orientationListenerAdded = true
            }
          } catch (err) {
            // Permission request error
          }
        } else {
          try {
            window.addEventListener('deviceorientation', handleDeviceOrientation, { passive: true })
            orientationListenerAdded = true
          } catch (e) {
            // Could not add listener
          }
        }
      } catch (error) {
        // Error setting up device orientation
      }
    }
    
    // On iOS, permission must be requested from a user gesture
    if (isMobile) {
      if (typeof DeviceOrientationEvent !== 'undefined' && !DeviceOrientationEvent.requestPermission) {
        setupDeviceOrientation()
      }
      
      const tryOnInteraction = (e) => {
        if (!orientationListenerAdded) {
          setupDeviceOrientation()
        }
      }
      
      cardEl.addEventListener('touchstart', tryOnInteraction, { once: true, passive: true })
      cardEl.addEventListener('touchend', tryOnInteraction, { once: true, passive: true })
      if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
        cardEl.addEventListener('click', tryOnInteraction, { once: true, passive: true })
      }
    }
    
    // Calculate mirror point (Union top or card bottom)
    let getMirrorY = null
    
    // Get card's bounding box for particle constraints
    const updateCardBounds = () => {
      const cardRect = cardEl.getBoundingClientRect()
      const canvasRect = canvas.getBoundingClientRect()
      
      const cardOffsetX = (cardRect.left - canvasRect.left) * dpr
      const cardOffsetY = (cardRect.top - canvasRect.top) * dpr
      
      const cardWidth = cardRect.width * dpr
      const cardHeight = cardRect.height * dpr
      canvas.width = Math.max(1, Math.floor(cardWidth))
      canvas.height = Math.max(1, Math.floor(cardHeight))
      canvas.style.width = `${cardRect.width}px`
      canvas.style.height = `${cardRect.height}px`
      
      if (canvasFront) {
        canvasFront.width = Math.max(1, Math.floor(cardWidth))
        canvasFront.height = Math.max(1, Math.floor(cardHeight))
        canvasFront.style.width = `${cardRect.width}px`
        canvasFront.style.height = `${cardRect.height}px`
      }
      
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
      
      // Get Union shape bounds if it exists
      let unionTop = null
      let unionCutout = null
      if (unionEl) {
        const unionRect = unionEl.getBoundingClientRect()
        const unionOffsetY = (unionRect.top - canvasRect.top) * dpr
        unionTop = unionOffsetY
        
        const cutoutWidth = 84 * dpr
        const cutoutDepth = 21 * dpr
        const cutoutLeftCard = 105 * dpr
        const cutoutRightCard = cutoutLeftCard + cutoutWidth
        
        const cutoutLeftCanvas = cutoutLeftCard - cardOffsetX
        const cutoutRightCanvas = cutoutRightCard - cardOffsetX
        const cutoutBottom = unionTop + cutoutDepth
        
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
      
      const cardBounds = {
        width: cardWidth,
        height: cardHeight,
        offsetX: cardOffsetX,
        offsetY: cardOffsetY,
        minX: -cardOffsetX,
        maxX: cardWidth - cardOffsetX,
        minY: -cardOffsetY,
        maxY: cardHeight - cardOffsetY,
        envelope: envelopeBounds,
        unionTop: unionTop,
        unionCutout: unionCutout,
        secondFloorY: secondFloorY,
        secondFloorLeft: secondFloorLeft,
        secondFloorRight: secondFloorRight
      }
      
      return cardBounds
    }
    
    let cardBounds = updateCardBounds()
    
    getMirrorY = () => {
      if (cardBounds.unionTop !== null) {
        return cardBounds.unionTop
      }
      return cardBounds.maxY
    }
    
    // Use unified confetti configuration
    const { colors, maxParticles, speed, horizontalDrift, gravity, size, rotation } = CONFETTI_CONFIG
    
    // Eruption velocity boost - particles spawn with extra velocity that decays over time
    const eruptionBoostFrames = 60
    const maxEruptionBoost = 3.0
    const minEruptionBoost = 1.0
    
    const spawnParticle = (initialY = null, frameCountAtSpawn = 0) => {
      const eruptionProgress = Math.min(1, frameCountAtSpawn / eruptionBoostFrames)
      const eruptionBoost = maxEruptionBoost - (maxEruptionBoost - minEruptionBoost) * eruptionProgress
      
      const speedVariation = 0.5 + Math.random() * 1.5
      const particleSpeed = (speed.min + Math.random() * speed.max) * speedVariation * eruptionBoost
      
      const particleSize = (size.min + Math.random() * size.max) * dpr
      const halfSize = particleSize / 2
      
      const spawnX = cardBounds.minX + halfSize + Math.random() * (cardBounds.maxX - cardBounds.minX - halfSize * 2)
      const spawnY = initialY !== null 
        ? initialY 
        : (cardBounds.maxY - halfSize - 2 * dpr) // Spawn near bottom of card
      
      const fadeInDuration = 20 + Math.random() * 30
      
      const horizontalSpreadMultiplier = eruptionBoost > 1.5 ? 1.5 : 1.0
      const horizontalSpread = horizontalDrift * (0.5 + Math.random() * 1.5) * horizontalSpreadMultiplier
      const angleVariation = (Math.random() - 0.5) * (eruptionBoost > 1.5 ? 0.5 : 0.3)
      
      const rotationSpeed = rotation.velocity.min + Math.random() * (rotation.velocity.max - rotation.velocity.min)
      const rotationVariation = 0.5 + Math.random() * 1.5
      
      return {
        x: spawnX,
        y: spawnY,
        vx: (Math.random() * 2 - 1) * horizontalSpread * dpr + Math.sin(angleVariation) * particleSpeed * dpr * 0.3,
        vy: -particleSpeed * dpr * Math.cos(angleVariation), // LAYOUT 1: Normal velocity, no boost
        airResistance: 0.98 + Math.random() * 0.01, // LAYOUT 1: Original air resistance
        ay: gravity * dpr * 0.7,
        rot: Math.random() * rotation.initial,
        vr: rotationSpeed * rotationVariation,
        size: particleSize,
        color: colors[(Math.random() * colors.length) | 0],
        shape: 'circle',
        layer: canvasFront 
          ? (Math.random() < 0.5 ? 'front' : 'back') // Random 50/50
          : 'back',
        opacity: 0,
        fadeInProgress: 0,
        fadeInDuration: fadeInDuration,
        bounceEnergy: (0.25 + Math.random() * 0.1) * 1.5,
        isLandedOnSecondFloor: false,
        landingVelocityThreshold: 0.3 * dpr,
        hasPassedFloor2: false
      }
    }
    
    // Spawn particles from bottom for eruption effect
    const spawnParticleFromBottom = (currentFrameCount = 0) => {
      const avgSize = (size.min + size.max) / 2 * dpr
      const halfSize = avgSize / 2
      let spawnY
      if (cardBounds.unionTop !== null) {
        spawnY = cardBounds.unionTop - halfSize
      } else if (cardBounds.envelope) {
        spawnY = cardBounds.envelope.bottom + halfSize + 2 * dpr
      } else {
        spawnY = cardBounds.maxY - halfSize - 5 * dpr
      }
      return spawnParticle(spawnY, currentFrameCount)
    }
    
    const targetParticleCount = Math.floor(maxParticles * 0.85)
    const particles = new Array(targetParticleCount)
    for (let i = 0; i < targetParticleCount; i++) {
      particles[i] = null
    }
    let activeParticleCount = 0
    let frameCount = 0
    
    const initialSpawnRate = 0.12
    const maxSpawnRate = 0.5
    const accelerationFrames = 120
    
    // Check if particle collides with envelope/box
    const checkEnvelopeCollision = (p, halfSize) => {
      if (!cardBounds.envelope) return false
      const env = cardBounds.envelope
      const isInsideX = p.x >= env.left - halfSize && p.x <= env.right + halfSize
      const isInsideY = p.y >= env.top - halfSize && p.y <= env.bottom + halfSize
      return isInsideX && isInsideY
    }
    
    // Bounce particles off envelope/box boundaries
    const handleEnvelopeCollision = (p, detectionSize) => {
      if (!cardBounds.envelope) return false
      
      const env = cardBounds.envelope
      let bounced = false
      
      const envelopeBounceEnergy = (0.25 + Math.random() * 0.1) * 1.5
      const bounceVariation = 0.15 * dpr
      
      if (p.x < env.left + detectionSize && p.vx < 0) {
        p.x = env.left + detectionSize
        p.vx = -p.vx * envelopeBounceEnergy
        p.vx += (Math.random() - 0.5) * bounceVariation
        p.vy += (Math.random() - 0.5) * bounceVariation * 0.3
        bounced = true
      }
      else if (p.x > env.right - detectionSize && p.vx > 0) {
        p.x = env.right - detectionSize
        p.vx = -p.vx * envelopeBounceEnergy
        p.vx += (Math.random() - 0.5) * bounceVariation
        p.vy += (Math.random() - 0.5) * bounceVariation * 0.3
        bounced = true
      }
      
      if (p.y < env.top + detectionSize && p.vy < 0) {
        p.y = env.top + detectionSize
        p.vy = -p.vy * envelopeBounceEnergy
        p.vy += (Math.random() - 0.5) * bounceVariation
        p.vx += (Math.random() - 0.5) * bounceVariation * 0.3
        bounced = true
      }
      else if (p.y > env.bottom - detectionSize && p.vy > 0) {
        p.y = env.bottom - detectionSize
        p.vy = -p.vy * envelopeBounceEnergy
        p.vy += (Math.random() - 0.5) * bounceVariation
        p.vx += (Math.random() - 0.5) * bounceVariation * 0.3
        bounced = true
      }
      
      return bounced
    }
    
    // Bounce particles off card boundaries
    const constrainParticle = (p, halfSize) => {
      if (halfSize === undefined) {
        halfSize = p.size / 2
      }
      
      // First check envelope/box collision
      const detectionPadding = halfSize * 1.5
      const envelopeCollision = handleEnvelopeCollision(p, detectionPadding)
      
      // If no envelope collision, check card boundaries
      if (!envelopeCollision) {
        const minX = cardBounds.minX + halfSize
        const maxX = cardBounds.maxX - halfSize
        const minY = cardBounds.minY + halfSize
        
        // THIRD FLOOR INTERACTION (Single 1 and Batch 1 - red line position)
        if (cardBounds.secondFloorY !== null) {
          const thirdFloorTop = cardBounds.secondFloorY - halfSize
          const thirdFloorBottom = cardBounds.secondFloorY + halfSize
          
          const isWithinThirdFloorX = cardBounds.secondFloorLeft !== null && cardBounds.secondFloorRight !== null &&
            p.x >= cardBounds.secondFloorLeft - halfSize && p.x <= cardBounds.secondFloorRight + halfSize
          
          if (isWithinThirdFloorX && p.vy > 0) {
            const isHittingThirdFloor = p.y >= thirdFloorTop && p.y <= thirdFloorBottom + 10 * dpr
            
            if (p.isLandedOnSecondFloor) {
              p.y = thirdFloorTop
              
              if (!isWithinThirdFloorX) {
                p.isLandedOnSecondFloor = false
              } else {
                p.vx *= 0.95
                p.vy = 0
                if (p.x < cardBounds.secondFloorLeft + halfSize || p.x > cardBounds.secondFloorRight - halfSize) {
                  p.vy += p.ay * 0.1
                }
              }
            } 
            else if (isHittingThirdFloor) {
              const verticalVelocity = Math.abs(p.vy)
              const landingThreshold = p.landingVelocityThreshold * 2.0
              
              if (verticalVelocity < landingThreshold) {
                p.isLandedOnSecondFloor = true
                p.y = thirdFloorTop
                p.vy = 0
              } else {
                p.y = thirdFloorTop
                p.vy = -Math.abs(p.vy) * p.bounceEnergy * 0.8
                p.vy += (Math.random() - 0.5) * 0.1 * dpr
                p.vx += (Math.random() - 0.5) * 0.1 * dpr
              }
            }
            
            if (p.isLandedOnSecondFloor) {
              if (p.x <= minX) {
                p.x = minX
                p.vx = Math.abs(p.vx) * p.bounceEnergy
                p.vx += (Math.random() - 0.5) * 0.1 * dpr
              } else if (p.x >= maxX) {
                p.x = maxX
                p.vx = -Math.abs(p.vx) * p.bounceEnergy
                p.vx += (Math.random() - 0.5) * 0.1 * dpr
              }
              return
            }
          }
        }
        
        // SECOND FLOOR (Union top) and FIRST FLOOR (cutout valley) interaction
        const isInCutout = cardBounds.unionCutout && 
          p.x >= cardBounds.unionCutout.left - halfSize && 
          p.x <= cardBounds.unionCutout.right + halfSize
        
        let maxY
        if (cardBounds.unionTop !== null) {
          if (isInCutout) {
            maxY = cardBounds.unionCutout.bottom - halfSize
          } else {
            maxY = cardBounds.unionTop - halfSize
          }
        } else {
          maxY = cardBounds.maxY - halfSize
        }
        
        if (p.x <= minX) {
          p.x = minX
          p.vx = Math.abs(p.vx) * p.bounceEnergy
          p.vx += (Math.random() - 0.5) * 0.1 * dpr
        } else if (p.x >= maxX) {
          p.x = maxX
          p.vx = -Math.abs(p.vx) * p.bounceEnergy
          p.vx += (Math.random() - 0.5) * 0.1 * dpr
        }
        
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
    
    const TWO_PI = Math.PI * 2
    
    const draw = () => {
      frameCount++
      
      if (frameCount % 60 === 0) {
        cardBounds = updateCardBounds()
      }
      
      if (activeParticleCount < targetParticleCount) {
        const progress = Math.min(1, frameCount / accelerationFrames)
        const oneMinusProgress = 1 - progress
        const easeOutProgress = 1 - oneMinusProgress * oneMinusProgress
        const currentSpawnRate = initialSpawnRate + (maxSpawnRate - initialSpawnRate) * easeOutProgress
        
        if (Math.random() < currentSpawnRate) {
          for (let i = 0; i < particles.length; i++) {
            if (particles[i] === null) {
              particles[i] = spawnParticleFromBottom(frameCount)
              activeParticleCount++
              break
            }
          }
        }
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (ctxFront) {
        ctxFront.clearRect(0, 0, canvasFront.width, canvasFront.height)
      }
      if (ctxMirrored) {
        ctxMirrored.clearRect(0, 0, canvasMirrored.width, canvasMirrored.height)
      }
      
      const mirrorY = getMirrorY()
      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        if (p === null) continue
        
        const halfSize = p.size / 2
        
        if (p.fadeInProgress < p.fadeInDuration) {
          p.fadeInProgress++
          const progress = p.fadeInProgress / p.fadeInDuration
          const oneMinusProgress = 1 - progress
          p.opacity = 1 - oneMinusProgress * oneMinusProgress * oneMinusProgress
        } else {
          p.opacity = 1
        }
        
        p.vx *= p.airResistance
        p.vy *= p.airResistance
        
        p.vy += p.ay
        
        if (isMobile && orientationListenerAdded && frameCount >= confettiSettleFrames) {
          const tiltForceX = (deviceTilt.gamma / 45) * gyroscopeForceMultiplier * dpr
          p.vx += tiltForceX
        }
        
        p.x += p.vx
        p.y += p.vy
        
        p.rot += p.vr
        
        constrainParticle(p, halfSize)
        
        const isOffScreen = p.x + halfSize < 0 || 
                           p.x - halfSize > canvas.width || 
                           p.y + halfSize < 0 || 
                           p.y - halfSize > canvas.height
        
        if (p.opacity > 0 && !isOffScreen) {
          const isFrontLayer = p.layer === 'front'
          const drawCtx = (isFrontLayer && ctxFront) ? ctxFront : ctx
          
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
          
          if (ctxMirrored) {
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
      }
      animId = requestAnimationFrame(draw)
    }
    
    animId = requestAnimationFrame(draw)
    
    return () => {
      if (animId) cancelAnimationFrame(animId)
      ctx && ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (ctxFront) ctxFront.clearRect(0, 0, canvasFront.width, canvasFront.height)
      if (ctxMirrored) ctxMirrored.clearRect(0, 0, canvasMirrored.width, canvasMirrored.height)
      if (orientationListenerAdded) {
        window.removeEventListener('deviceorientation', handleDeviceOrientation)
        orientationListenerAdded = false
      }
    }
  }, [isHovered, allAccepted, confettiCanvasRef, cardRef, confettiCanvasFrontRef, confettiCanvasMirroredRef])
}

