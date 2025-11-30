import React from 'react'
import { BOTTOM_SHADOW_WIDTH, STATIC_STYLES } from '@/constants/layout3Tokens'

const ShadowContainer = ({ vibrantShadowColor, isHovered }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: '7%',
        top: '122px',
        transform: 'none',
        width: `${BOTTOM_SHADOW_WIDTH}px`,
        height: 'auto',
        scale: '1.25',
        zIndex: 0,
        opacity: isHovered ? 0 : 1,
        transition: 'opacity 0.25s ease-out',
      }}
    >
      <img
        src="/assets/Shadow3.png"
        alt=""
        style={STATIC_STYLES.shadowImage}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: vibrantShadowColor,
          mixBlendMode: 'color',
          WebkitMaskImage: 'url(/assets/Shadow3.png)',
          maskImage: 'url(/assets/Shadow3.png)',
          WebkitMaskSize: '100% 100%',
          maskSize: '100% 100%',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: vibrantShadowColor,
          opacity: 0.95,
          mixBlendMode: 'color',
          WebkitMaskImage: 'url(/assets/Shadow3.png)',
          maskImage: 'url(/assets/Shadow3.png)',
          WebkitMaskSize: '100% 100%',
          maskSize: '100% 100%',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
        }}
      />
    </div>
  )
}

export default ShadowContainer

