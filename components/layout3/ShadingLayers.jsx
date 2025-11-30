import React, { useMemo } from 'react'
import { BOX_WIDTH, BOX_HEIGHT, BOX_RADIUS, STATIC_STYLES } from '@/constants/layout3Tokens'
import { makeThemedColor } from '@/utils/colors'

const ShadingLayers = ({ baseColor, lightCornerSvg, isHovered = false }) => {
  const darkRimColor = useMemo(() => makeThemedColor(baseColor, -1), [baseColor])
  const lightRimColor = useMemo(() => makeThemedColor(baseColor, 10), [baseColor])
  const darkRim2BorderColor = useMemo(() => makeThemedColor(baseColor, -35).rgba(0.4), [baseColor])

  const darkRimStyle = useMemo(
    () => ({
      position: 'absolute',
      left: '5.55%',
      right: '5.56%',
      top: '50%',
      transform: 'translateY(-50%) rotate(180deg)',
      width: '160px',
      height: '160px',
      filter: 'blur(3px)',
      mixBlendMode: 'overlay',
      borderRadius: '28px',
      background: `linear-gradient(135deg, rgba(0, 0, 0, 0) 40%, ${darkRimColor.rgba(0.5)} 100%)`,
      boxShadow: `inset -16px -14px 16px 5px ${darkRimColor.rgba(0.01)}, inset 6px 12px 13px 5px ${lightRimColor.rgba(0.45)}`,
      opacity: isHovered ? 0.5 : 1,
      transition: 'opacity 0.5s ease-out',
    }),
    [darkRimColor, lightRimColor, isHovered]
  )

  const darkRim2BorderStyle = useMemo(
    () => ({
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%) rotate(180deg)',
      width: `${BOX_WIDTH}px`,
      height: `${BOX_HEIGHT}px`,
      border: `1.5px solid ${darkRim2BorderColor}`,
      borderRadius: `${BOX_RADIUS}px`,
      filter: 'blur(1.5px)',
      mixBlendMode: 'normal',
      opacity: isHovered ? 0 : 1,
      transition: 'opacity 0.3s ease-out',
    }),
    [darkRim2BorderColor, isHovered]
  )

  const lightRimStyle = useMemo(
    () => ({
      position: 'absolute',
      left: '5.55%',
      right: '5.56%',
      top: '50%',
      transform: 'translateY(-50%)',
      height: '160px',
      background: `linear-gradient(135deg, rgba(255, 255, 255, 0) 40%, ${lightRimColor.rgba(0.75)} 100%)`,
      borderRadius: `${BOX_RADIUS}px`,
      filter: 'blur(5px)',
      mixBlendMode: 'overlay',
    }),
    [lightRimColor]
  )

  return (
    <div style={STATIC_STYLES.shadingContainer}>
      <div style={darkRimStyle} />

      <div style={darkRim2BorderStyle} />

      <div style={STATIC_STYLES.lightCornerWrapper}>
        {lightCornerSvg && (
          <div
            style={STATIC_STYLES.lightCornerInner}
            dangerouslySetInnerHTML={{ __html: lightCornerSvg }}
          />
        )}
      </div>

      <div style={lightRimStyle} />
    </div>
  )
}

export default ShadingLayers

