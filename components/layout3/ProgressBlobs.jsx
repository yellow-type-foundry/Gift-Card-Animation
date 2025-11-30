import React, { useMemo } from 'react'
import { BOX_WIDTH, BOX_HEIGHT, STATIC_STYLES } from '@/constants/layout3Tokens'

const ProgressBlobs = ({ blobGridColors, blobAnimations, dotPositions, circleSize, isHovered }) => {
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
      <div style={{
        ...STATIC_STYLES.progressBlobsContainer,
        width: `${BOX_WIDTH}px`,
        height: `${BOX_HEIGHT}px`,
      }}>
        {blobGridColors.length > 0 && blobGridColors.map((color, index) => {
          const anim = blobAnimations[index]
          const position = dotPositions[index]
          if (!anim) return null
          
          // Use JS animation only when hovered AND position exists
          // When not hovered, dots should be static (no animation)
          const useJSAnimation = isHovered && position !== undefined && position !== null && typeof position.x === 'number' && typeof position.y === 'number'
          
          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                width: `${circleSize}px`,
                height: `${circleSize}px`,
                borderRadius: '50%',
                backgroundColor: color,
                mixBlendMode: 'overlay',
                boxShadow: `
                  inset 0px 0px 16px 0px rgba(255, 255, 255, 0.6),
                  inset 0px 0px 4px 0px rgba(255, 255, 255, 0.5)
                `,
                left: useJSAnimation ? `${position.x}px` : `${anim.startX}px`,
                top: useJSAnimation ? `${position.y}px` : `${anim.startY}px`,
                transition: 'none', // No transition for smooth 60fps updates
                animation: useJSAnimation ? 'none' : 'none', // No animation when not hovered - dots are static
                animationDelay: '0s',
              }}
            />
          )
        })}
      </div>
    </>
  )
}

export default ProgressBlobs

