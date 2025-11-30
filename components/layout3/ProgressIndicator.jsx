import React, { useMemo } from 'react'
import { STATIC_STYLES } from '@/constants/layout3Tokens'
import { makeThemedColor } from '@/utils/colors'

const ProgressIndicator = ({ progress, baseColor }) => {
  const darkRimShadowColor = useMemo(() => makeThemedColor(baseColor, -30), [baseColor])
  const lightRimColor = useMemo(() => makeThemedColor(baseColor, 10), [baseColor])
  const darkRimColor = useMemo(() => makeThemedColor(baseColor, -1), [baseColor])

  const progressTextShadowStyle = useMemo(
    () => ({
      position: 'absolute',
      inset: 0,
      transform: 'translateY(1px)',
      color: darkRimShadowColor.rgba(0.65),
      filter: 'blur(1.1px)',
      opacity: .8,
    }),
    [darkRimShadowColor]
  )

  const progressTextGradientStyle = useMemo(
    () => ({
      position: 'relative',
      background: `linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 1) 50%, rgba(255, 255, 255, .9) 100%)`,
      backgroundPosition: '50% 100%',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      color: 'transparent',
      display: 'inline-block',
      textShadow: `
        ${darkRimColor.rgba(.08)} 0px .5px .5px,
        ${lightRimColor.rgba(.05)} 0px -0.5px 1px,
        ${lightRimColor.rgba(.1)} 0px -0.5px .5px
      `,
      filter: `
        drop-shadow(0px 1.5px 8px rgba(255, 255, 255, 0.8))
        drop-shadow(0px 1px 1px ${darkRimColor.rgba(0.2)})
      `,
    }),
    [lightRimColor, darkRimColor]
  )

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 0,
        transform: 'translateX(-50%)',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 10,
      }}
    >
      <p style={STATIC_STYLES.progressText}>
        <span style={progressTextShadowStyle}>
          {progress.current}/{progress.total}
        </span>
        <span style={progressTextGradientStyle}>
          {progress.current}/{progress.total}
        </span>
      </p>
    </div>
  )
}

export default ProgressIndicator

