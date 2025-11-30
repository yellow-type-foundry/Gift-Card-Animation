import React, { useMemo } from 'react'
import { BOX_WIDTH, BOX_HEIGHT, STATIC_STYLES } from '@/constants/layout3Tokens'

const ProgressBlobs = ({ blobGridColors, blobAnimations, dotPositions, circleSize, isHovered, disableBlurReveal = false, fixedBlur }) => {
  // Generate CSS keyframes for organic, randomized animations
  const blobKeyframes = useMemo(() => {
    if (blobAnimations.length === 0) return null
    
    return blobAnimations.map((anim, index) => {
      const keyframeName = `blobMove${index}`
      const x1 = anim.startX + anim.moveX1
      const y1 = anim.startY + anim.moveY1
      const x2 = anim.startX + anim.moveX2
      const y2 = anim.startY + anim.moveY2
      const x3 = anim.startX + anim.moveX3
      const y3 = anim.startY + anim.moveY3
      
      const maxCircleSizeForClamp = 58
      const minX = 1
      const maxX = BOX_WIDTH - maxCircleSizeForClamp - 1
      const minY = 1
      const maxY = BOX_HEIGHT - maxCircleSizeForClamp - 1
      
      const clampX = (x) => Math.max(minX, Math.min(maxX, x))
      const clampY = (y) => Math.max(minY, Math.min(maxY, y))
      
      const startXFinal = clampX(anim.startX)
      const startYFinal = clampY(anim.startY)
      
      return `
        @keyframes ${keyframeName} {
          0%, 100% {
            transform: translate(${startXFinal - anim.startX}px, ${startYFinal - anim.startY}px);
          }
          25% {
            transform: translate(${clampX(x1) - anim.startX}px, ${clampY(y1) - anim.startY}px);
          }
          50% {
            transform: translate(${clampX(x2) - anim.startX}px, ${clampY(y2) - anim.startY}px);
          }
          75% {
            transform: translate(${clampX(x3) - anim.startX}px, ${clampY(y3) - anim.startY}px);
          }
        }
      `
    }).join('\n')
  }, [blobAnimations])

  return (
    <>
      {blobKeyframes && (
        <style dangerouslySetInnerHTML={{ __html: blobKeyframes }} />
      )}
      {/* Render blobs directly without container wrapper to avoid stacking context isolation */}
      {blobGridColors.length > 0 && blobGridColors.map((color, index) => {
          const anim = blobAnimations[index]
          const position = dotPositions[index]
          if (!anim) return null
          
          // Use position if it exists (from JS animation), otherwise use initial position
          // When not hovered, dots freeze in their current position
          const hasPosition = position !== undefined && position !== null && typeof position.x === 'number' && typeof position.y === 'number'
          const currentX = hasPosition ? position.x : anim.startX
          const currentY = hasPosition ? position.y : anim.startY
          
          // Generate consistent random blur value for this blob (1.5px to 9px on hover)
          // Use index and full color string hash for consistent randomness
          // Hash the entire color string to get better variation
          let colorHash = 0
          for (let i = 0; i < color.length; i++) {
            colorHash = ((colorHash << 5) - colorHash) + color.charCodeAt(i)
            colorHash = colorHash & colorHash // Convert to 32bit integer
          }
          const blurSeed = Math.abs((index * 31 + colorHash) % 1000)
          const randomBlur = 1.5 + (blurSeed / 1000) * 7.5 // Random value between 1.5 and 9
          
          // Calculate edge proximity for ellipse deformation
          // Circular by default, elliptical when touching edge, circular again when away from edge
          const EDGE_DETECTION_DISTANCE = circleSize * 0.065 // Start deforming only when very close to edge (20% of circle size)
          const MAX_DEFORMATION = 0.2 // Maximum squeeze (50% of original size)
          
          // Calculate distance from dot edge to box edge
          // currentX and currentY are the top-left position of the dot
          const distToLeft = currentX // Distance from dot's left edge to box's left edge (0 = touching)
          const distToRight = BOX_WIDTH - (currentX + circleSize) // Distance from dot's right edge to box's right edge (0 = touching)
          const distToTop = currentY // Distance from dot's top edge to box's top edge (0 = touching)
          const distToBottom = BOX_HEIGHT - (currentY + circleSize) // Distance from dot's bottom edge to box's bottom edge (0 = touching)
          
          // Calculate squeeze factors: 0 = no squeeze (circular), 1 = max squeeze (elliptical)
          // When distance is 0 (touching edge), squeeze = 1
          // When distance >= EDGE_DETECTION_DISTANCE (away from edge), squeeze = 0
          const leftSqueeze = distToLeft < EDGE_DETECTION_DISTANCE 
            ? Math.max(0, Math.min(1, 1 - (distToLeft / EDGE_DETECTION_DISTANCE)))
            : 0
          const rightSqueeze = distToRight < EDGE_DETECTION_DISTANCE
            ? Math.max(0, Math.min(1, 1 - (distToRight / EDGE_DETECTION_DISTANCE)))
            : 0
          const topSqueeze = distToTop < EDGE_DETECTION_DISTANCE
            ? Math.max(0, Math.min(1, 1 - (distToTop / EDGE_DETECTION_DISTANCE)))
            : 0
          const bottomSqueeze = distToBottom < EDGE_DETECTION_DISTANCE
            ? Math.max(0, Math.min(1, 1 - (distToBottom / EDGE_DETECTION_DISTANCE)))
            : 0
          
          // Apply horizontal squeeze when touching left or right edges
          // scaleX < 1 means squeezed horizontally (elliptical)
          const horizontalSqueeze = Math.max(leftSqueeze, rightSqueeze)
          const scaleX = 1 - (horizontalSqueeze * MAX_DEFORMATION)
          
          // Apply vertical squeeze when touching top or bottom edges
          // scaleY < 1 means squeezed vertically (elliptical)
          const verticalSqueeze = Math.max(topSqueeze, bottomSqueeze)
          const scaleY = 1 - (verticalSqueeze * MAX_DEFORMATION)
          
          // Default: scaleX = 1, scaleY = 1 (circular)
          // Touching left/right: scaleX < 1, scaleY = 1 (horizontal ellipse)
          // Touching top/bottom: scaleX = 1, scaleY < 1 (vertical ellipse)
          // Touching corner: scaleX < 1, scaleY < 1 (ellipse in both directions)
          
          // Convert color to RGB for gradient calculations (30% water droplet effect)
          const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
            return result ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16)
            } : { r: 25, g: 135, b: 199 }
          }
          const rgb = hexToRgb(color)
          
          // Create subtle water droplet effect (30% blend)
          // Lighter center (like light refraction in water), darker edges
          const centerColor = `rgba(${Math.min(255, rgb.r + 40)}, ${Math.min(255, rgb.g + 40)}, ${Math.min(255, rgb.b + 40)}, 0.25)`
          const edgeColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.18)`
          const highlightColor = `rgba(255, 255, 255, 0.12)` // Water droplet highlight (subtle)
          
          // Blend: 70% original solid color + 30% water droplet gradient
          const baseColor = color // 70% - original solid color
          const gradientOverlay = `radial-gradient(circle at 30% 30%, ${highlightColor} 0%, ${centerColor} 35%, ${edgeColor} 100%)` // 30% - water droplet
          
          // Blend shadows: 70% original + 30% water droplet shadows
          const originalShadow = `
            inset 0px 0px 16px 0px rgba(255, 255, 255, 0.6),
            inset 0px 0px 4px 0px rgba(255, 255, 255, 0.5)
          `
          const waterShadow = `
            inset 0px -2px 8px 0px rgba(0, 0, 0, 0.2),
            inset 0px 2px 12px 0px rgba(255, 255, 255, 0.5),
            0px 0px 20px 0px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)
          `
          // Use original shadow as base (70%), add subtle water glow (30%)
          const blendedShadow = `
            ${originalShadow},
            0px 0px 6px 0px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)
          `
          
          // Calculate z-index for hover effect: logo appears "inside" blobs
          // Some blobs in front (z-index > 8), some behind (z-index < 8)
          // Logo is at z-index 8
          let blobZIndex = 1 // Default z-index
          if (isHovered) {
            // Use consistent random assignment based on blob index and color
            // This ensures the same blob always has the same z-index layer
            const zIndexSeed = (index * 23 + color.charCodeAt(0) + color.charCodeAt(1) + color.charCodeAt(2)) % 100
            // 50% chance to be in front (z-index 9-12), 50% chance to be behind (z-index 4-7)
            if (zIndexSeed < 50) {
              // Behind logo (z-index 4-7)
              blobZIndex = 4 + Math.floor((zIndexSeed / 50) * 4) // 4, 5, 6, or 7
            } else {
              // In front of logo (z-index 9-12)
              blobZIndex = 9 + Math.floor(((zIndexSeed - 50) / 50) * 4) // 9, 10, 11, or 12
            }
          }

          // Calculate absolute position relative to box center (since we removed the container)
          const boxCenterX = BOX_WIDTH / 2
          const boxCenterY = BOX_HEIGHT / 2
          const absoluteLeft = boxCenterX + currentX - (circleSize / 2)
          const absoluteTop = boxCenterY + currentY - (circleSize / 2)

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${currentX - boxCenterX + (circleSize / 2)}px), calc(-50% + ${currentY - boxCenterY + (circleSize / 2)}px)) scale(${scaleX}, ${scaleY})`,
                transformOrigin: 'center center',
                width: `${circleSize}px`,
                height: `${circleSize}px`,
                borderRadius: '50%',
                backgroundColor: baseColor, // 70% - original solid color
                backgroundImage: gradientOverlay, // 30% - water droplet overlay
                mixBlendMode: 'overlay',
                boxShadow: blendedShadow,
                filter: fixedBlur !== undefined ? `blur(${fixedBlur}px)` : (disableBlurReveal ? 'blur(20px)' : (isHovered ? `blur(${randomBlur}px)` : 'blur(20px)')), // Use fixedBlur if provided, otherwise vary blur from 1.5-9px on hover, or 20px
                zIndex: blobZIndex,
                // Quick elastic snap-back like a rubber ball - fast return to circular when leaving edge with more bounce
                transition: 'filter 0.005s ease-out, transform 0.01s cubic-bezier(0.68, -0.6, 0.32, 1.6), z-index 0s', // z-index transition is instant
                animation: 'none', // No CSS animation
                animationDelay: '0s',
                opacity: 0.97, // Very slight transparency (30% of 0.9 = subtle)
              }}
            />
          )
        })}
    </>
  )
}

export default ProgressBlobs

