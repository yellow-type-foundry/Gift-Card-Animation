import React, { useMemo, memo } from 'react'
import { BOX_WIDTH, BOX_HEIGHT, STATIC_STYLES } from '@/constants/layout3Tokens'
import { getPerformanceMode } from '@/utils/browserDetection'

// Pre-calculate static values for each blob to avoid recalculating on every render
const calculateBlobStaticValues = (color, index) => {
  // Hash the entire color string for consistent randomness
  let colorHash = 0
  for (let i = 0; i < color.length; i++) {
    colorHash = ((colorHash << 5) - colorHash) + color.charCodeAt(i)
    colorHash = colorHash & colorHash // Convert to 32bit integer
  }
  const blurSeed = Math.abs((index * 31 + colorHash) % 1000)
  const randomBlur = 1.5 + (blurSeed / 1000) * 7.5 // Random value between 1.5 and 9
  
  // Z-index seed
  const zIndexSeed = (index * 23 + color.charCodeAt(0) + color.charCodeAt(1) + color.charCodeAt(2)) % 100
  
  // RGB conversion
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 25, g: 135, b: 199 }
  }
  const rgb = hexToRgb(color)
  
  return { randomBlur, zIndexSeed, rgb }
}

// Memoized individual blob component
const Blob = memo(({ 
  index, 
  color, 
  currentX, 
  currentY, 
  circleSize, 
  isHovered, 
  disableBlurReveal, 
  fixedBlur,
  staticValues,
  performanceMode
}) => {
  const { randomBlur, zIndexSeed, rgb } = staticValues
  
  // Calculate edge proximity for ellipse deformation
  const EDGE_DETECTION_DISTANCE = circleSize * 0.065
  const MAX_DEFORMATION = 0.2
  
  const distToLeft = currentX
  const distToRight = BOX_WIDTH - (currentX + circleSize)
  const distToTop = currentY
  const distToBottom = BOX_HEIGHT - (currentY + circleSize)
  
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
  
  const horizontalSqueeze = Math.max(leftSqueeze, rightSqueeze)
  const scaleX = 1 - (horizontalSqueeze * MAX_DEFORMATION)
  const verticalSqueeze = Math.max(topSqueeze, bottomSqueeze)
  const scaleY = 1 - (verticalSqueeze * MAX_DEFORMATION)
  
  // Water droplet gradient
  const centerColor = `rgba(${Math.min(255, rgb.r + 40)}, ${Math.min(255, rgb.g + 40)}, ${Math.min(255, rgb.b + 40)}, 0.25)`
  const edgeColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.18)`
  const highlightColor = `rgba(255, 255, 255, 0.12)`
  const gradientOverlay = `radial-gradient(circle at 30% 30%, ${highlightColor} 0%, ${centerColor} 35%, ${edgeColor} 100%)`
  
  // Shadows
  const originalShadow = `
    inset 0px 0px 16px 0px rgba(255, 255, 255, 0.6),
    inset 0px 0px 4px 0px rgba(255, 255, 255, 0.5)
  `
  const blendedShadow = `
    ${originalShadow},
    0px 0px 6px 0px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)
  `
  
  // Z-index calculation (cached in static values, only recalculate if hover state changes)
  const blobZIndex = isHovered 
    ? (zIndexSeed < 50 
        ? 4 + Math.floor((zIndexSeed / 50) * 4)
        : 9 + Math.floor(((zIndexSeed - 50) / 50) * 4))
    : 1
  
  const boxCenterX = BOX_WIDTH / 2
  const boxCenterY = BOX_HEIGHT / 2
  
  // Apply blur reduction for Safari - completely disable if needed
  const getBlurValue = () => {
    if (performanceMode.disableBlur) {
      return 'none' // Completely disable blur for Safari
    }
    if (fixedBlur !== undefined) {
      return `blur(${fixedBlur * performanceMode.blurReduction}px)`
    }
    if (disableBlurReveal) {
      return `blur(${20 * performanceMode.blurReduction}px)`
    }
    if (isHovered) {
      return `blur(${randomBlur * performanceMode.blurReduction}px)`
    }
    return `blur(${20 * performanceMode.blurReduction}px)`
  }
  
  const filterValue = getBlurValue()
  
  // Disable ellipse deformation for Safari
  const finalScaleX = performanceMode.disableEllipseDeformation ? 1 : scaleX
  const finalScaleY = performanceMode.disableEllipseDeformation ? 1 : scaleY
  
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate3d(calc(-50% + ${currentX - boxCenterX + (circleSize / 2)}px), calc(-50% + ${currentY - boxCenterY + (circleSize / 2)}px), 0) scale(${finalScaleX}, ${finalScaleY})`,
        transformOrigin: 'center center',
        width: `${circleSize}px`,
        height: `${circleSize}px`,
        borderRadius: '50%',
        backgroundColor: color,
        backgroundImage: performanceMode.disableGradientOverlay ? 'none' : gradientOverlay,
        mixBlendMode: performanceMode.useMixBlendMode ? 'overlay' : 'normal', // Disable for Safari
        boxShadow: performanceMode.disableBoxShadow ? 'none' : blendedShadow,
        filter: filterValue,
        zIndex: blobZIndex,
        transition: 'filter 0.005s ease-out, transform 0.01s cubic-bezier(0.68, -0.6, 0.32, 1.6), z-index 0s',
        animation: 'none',
        animationDelay: '0s',
        opacity: 0.97,
        willChange: isHovered ? 'transform, filter' : 'auto', // Only hint GPU when actually animating
        // Safari optimization: use CSS containment
        contain: performanceMode.isSafari ? 'layout style paint' : 'none',
      }}
    />
  )
})

Blob.displayName = 'Blob'

const ProgressBlobs = ({ blobGridColors, blobAnimations, dotPositions, circleSize, isHovered, disableBlurReveal = false, fixedBlur }) => {
  // Get performance mode (cached to avoid recalculation)
  const performanceMode = useMemo(() => getPerformanceMode(), [])
  
  // Pre-calculate static values for all blobs (must be done outside map to follow Rules of Hooks)
  const blobStaticValues = useMemo(() => {
    return blobGridColors.map((color, index) => calculateBlobStaticValues(color, index))
  }, [blobGridColors])

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

  // Don't render blobs at all on Safari for maximum performance (after all hooks)
  if (performanceMode.isSafari) {
    return null
  }

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
          const hasPosition = position !== undefined && position !== null && typeof position.x === 'number' && typeof position.y === 'number'
          const currentX = hasPosition ? position.x : anim.startX
          const currentY = hasPosition ? position.y : anim.startY
          
          // Get pre-calculated static values (calculated outside map in useMemo)
          const staticValues = blobStaticValues[index]
          
          return (
            <Blob
              key={index}
              index={index}
              color={color}
              currentX={currentX}
              currentY={currentY}
              circleSize={circleSize}
              isHovered={isHovered}
              disableBlurReveal={disableBlurReveal}
              fixedBlur={fixedBlur}
              staticValues={staticValues}
              performanceMode={performanceMode}
            />
          )
        })}
    </>
  )
}

export default memo(ProgressBlobs)

