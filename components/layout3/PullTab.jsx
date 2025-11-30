import React, { useMemo } from 'react'
import { BOX_WIDTH, BOX_HEIGHT, STATIC_STYLES } from '@/constants/layout3Tokens'
import { makeThemedColor } from '@/utils/colors'

const PullTab = ({ baseColor, isHovered }) => {
  const darkRimColor = useMemo(() => makeThemedColor(baseColor, -1), [baseColor])

  const pullTabIconStyle = useMemo(
    () => ({
      ...STATIC_STYLES.pullTabIcon,
      boxShadow: `
        0px 1.5px 2px 0px ${darkRimColor.rgba(1)},
        inset 0px 0px 3px 0px rgba(255, 255, 255, 0.95)
      `,
    }),
    [darkRimColor]
  )

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '-3px',
        transform: isHovered ? 'translateX(-50%) translateY(-8px)' : 'translateX(-50%)',
        width: `${BOX_WIDTH}px`,
        height: `${BOX_HEIGHT}px`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: '0',
        paddingBottom: '130px',
        paddingLeft: '20px',
        paddingRight: '20px',
        zIndex: 2,
        transition: 'transform 0.3s ease-out',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 'auto',
          height: isHovered ? '0' : '100%',
          backdropFilter: 'blur(9.287px)',
          WebkitBackdropFilter: 'blur(9.287px)',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          border: '0.5px solid rgba(255, 255, 255, 0)',
          borderRadius: '16px 16px 100px 100px',
          boxShadow: 'inset 0px 0px 4px 0px rgba(255, 255, 255, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '5px',
          overflow: 'hidden',
          transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div style={pullTabIconStyle} />
      </div>
    </div>
  )
}

export default PullTab

