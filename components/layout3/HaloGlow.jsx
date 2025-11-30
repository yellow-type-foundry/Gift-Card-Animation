import React from 'react'
import { BOX_WIDTH, BOX_HEIGHT } from '@/constants/layout3Tokens'

const HaloGlow = ({ blobGridColors, blobAnimations, dotPositions, circleSize, isHovered }) => {
  return (
    <div style={{
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: `${BOX_WIDTH}px`,
      height: `${BOX_HEIGHT}px`,
      minWidth: `${BOX_WIDTH}px`,
      maxWidth: `${BOX_WIDTH}px`,
      minHeight: `${BOX_HEIGHT}px`,
      maxHeight: `${BOX_HEIGHT}px`,
      zIndex: 0,
      transform: 'translate(-50%, -50%) scale(.98)',
      opacity: isHovered ? 1 : 0,
      padding: '1px',
      filter: 'blur(1px)',
      transformOrigin: 'center center',
      boxSizing: 'border-box',
      transition: 'opacity 0.3s ease-out',
      pointerEvents: 'none',
    }}>
      {blobGridColors.length > 0 && blobGridColors.map((color, index) => {
        const anim = blobAnimations[index]
        const position = dotPositions[index]
        if (!anim) return null
        
        const useJSAnimation = position !== undefined
        
        return (
          <div
            key={`halo-${index}`}
            style={{
              position: 'absolute',
              width: `${circleSize}px`,
              height: `${circleSize}px`,
              borderRadius: '50%',
              backgroundColor: color,
              mixBlendMode: 'overlay',
              filter: 'blur(24px)',
              left: useJSAnimation ? `${position.x}px` : `${anim.startX}px`,
              top: useJSAnimation ? `${position.y}px` : `${anim.startY}px`,
              animation: useJSAnimation ? 'none' : `blobMove${index} ${anim.duration}s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
              animationDelay: useJSAnimation ? '0s' : `${anim.delay}s`,
            }}
          />
        )
      })}
    </div>
  )
}

export default HaloGlow

