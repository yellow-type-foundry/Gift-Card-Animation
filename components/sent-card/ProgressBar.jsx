'use client'

import React, { useMemo } from 'react'
import { GIFT_BOX_TOKENS } from '@/constants/giftBoxTokens'
import { hexToHsl, hslToHex } from '@/utils/colors'

const ProgressBar = ({
  progress = { current: 4, total: 5 },
  boxColor = '#94d8f9',
  indicatorColor,
  progressBarWidth,
  animatedCurrent,
  validatedProgress,
  isDone,
  themedShadowColor,
  containerPadding = {
    bottom: GIFT_BOX_TOKENS.progressBar.container.bottomPadding,
    horizontal: GIFT_BOX_TOKENS.progressBar.container.horizontalPadding,
    top: 0
  }
}) => {
  // Use indicatorColor if provided, otherwise fall back to boxColor
  const indicatorBgColor = indicatorColor || boxColor
  
  // Use themed shadow color - should always be provided from parent component
  // Fallback to calculating from boxColor only if themedShadowColor is not provided
  const effectiveShadowColor = useMemo(() => {
    if (themedShadowColor !== undefined && themedShadowColor !== null) {
      return themedShadowColor
    }
    // Fallback: calculate shadow color from boxColor if themedShadowColor is not provided
    const [h, s, l] = hexToHsl(boxColor)
    const darkerL = Math.max(0, l - 5)
    return hslToHex(h, s, darkerL)
  }, [themedShadowColor, boxColor])
  
  return (
    <div 
      className="box-border content-stretch flex flex-col gap-[10px] items-center justify-center relative shrink-0 w-full"
      style={{
        paddingBottom: containerPadding.bottom,
        paddingLeft: containerPadding.horizontal,
        paddingRight: containerPadding.horizontal,
        paddingTop: containerPadding.top
      }}
      data-name="Progress Bar"
    >
      {/* Stroke wrapper with gradient (0.5px outside) */}
      <div
        className="relative w-full"
        style={{
          padding: GIFT_BOX_TOKENS.progressBar.strokeWrapper.padding,
          borderRadius: GIFT_BOX_TOKENS.progressBar.strokeWrapper.borderRadius,
          background: GIFT_BOX_TOKENS.gradients.progressBarStroke,
          boxShadow: GIFT_BOX_TOKENS.shadows.progressBarStroke
        }}
      >
        <div 
          className="border-[0.5px] border-[rgba(255,255,255,0)] border-solid box-border content-stretch flex flex-col items-start justify-center relative size-full overflow-hidden"
          style={{
            gap: GIFT_BOX_TOKENS.progressBar.innerContainer.gap,
            padding: GIFT_BOX_TOKENS.progressBar.innerContainer.padding,
            borderRadius: GIFT_BOX_TOKENS.progressBar.innerContainer.borderRadius,
          }}
          data-name="Progress Bar"
        >
          {/* Progress bar background layers */}
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ borderRadius: GIFT_BOX_TOKENS.progressBar.innerContainer.borderRadius }}>
            {/* 1. Color fill, normal mode, 100% (base layer) */}
            <div 
              className="absolute inset-0"
              style={{ 
                borderRadius: GIFT_BOX_TOKENS.progressBar.innerContainer.borderRadius,
                backgroundColor: boxColor,
                transition: `background-color ${GIFT_BOX_TOKENS.animations.duration.fast} ${GIFT_BOX_TOKENS.animations.easing.easeOut}`
              }}
            />
            {/* 2. White fill, 40%, overlay mode (blends with color below) */}
            <div 
              className="absolute inset-0"
              style={{ 
                borderRadius: GIFT_BOX_TOKENS.progressBar.innerContainer.borderRadius,
                mixBlendMode: GIFT_BOX_TOKENS.blendModes.overlay,
                backgroundColor: GIFT_BOX_TOKENS.colors.whiteOverlay
              }}
            />
          </div>

          {/* Progress indicator */}
          {/* Stroke wrapper with gradient (0.5px inside) */}
          <div
            className="relative shrink-0"
            style={{
              width: `${progressBarWidth}px`,
              minWidth: GIFT_BOX_TOKENS.progressBar.indicator.minWidth,
              padding: GIFT_BOX_TOKENS.progressBar.indicator.strokePadding,
              borderRadius: GIFT_BOX_TOKENS.progressBar.indicator.borderRadius,
              background: GIFT_BOX_TOKENS.gradients.progressIndicatorStroke,
              transition: `width ${GIFT_BOX_TOKENS.animations.duration.medium} ${GIFT_BOX_TOKENS.animations.easing.progressBar}`
            }}
            data-name="Progress"
          >
            <div 
              className="box-border content-stretch flex flex-col items-start justify-center py-0 relative w-full overflow-hidden"
              style={{ 
                height: GIFT_BOX_TOKENS.progressBar.indicator.height,
                paddingLeft: GIFT_BOX_TOKENS.progressBar.indicator.horizontalPadding,
                paddingRight: GIFT_BOX_TOKENS.progressBar.indicator.horizontalPadding,
                borderRadius: GIFT_BOX_TOKENS.progressBar.indicator.borderRadius,
                backgroundColor: indicatorBgColor,
                transition: `background-color ${GIFT_BOX_TOKENS.animations.duration.fast} ${GIFT_BOX_TOKENS.animations.easing.easeOut}`
              }}
            >
              <p 
                className="font-['Goody_Sans:Medium',sans-serif] leading-[1.4] not-italic relative shrink-0 text-white w-full"
                style={{
                  fontFamily: 'var(--font-goody-sans)',
                  fontSize: '16px',
                  fontWeight: 500,
                  lineHeight: 1.4,
                  color: GIFT_BOX_TOKENS.colors.progressText,
                  zIndex: GIFT_BOX_TOKENS.zIndex.progressText,
                  mixBlendMode: GIFT_BOX_TOKENS.blendModes.overlay,
                  opacity: GIFT_BOX_TOKENS.colors.progressTextOpacity,
                  position: 'relative'
                }}
              >
                {isDone ? 'Done' : `${animatedCurrent}/${validatedProgress.total}`}
              </p>
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: `0px -2.3px 5px 0.25px inset rgba(255,255,255,0.5), 0px 0px 5px 0px inset rgba(255,255,255,0.5), 0px -4.5px 13px 4.5px inset ${effectiveShadowColor}`
                }}
              />
            </div>
          </div>

          {/* Progress bar inset shadow */}
          <div 
            className="absolute inset-[-0.5px] pointer-events-none"
            style={{
              boxShadow: GIFT_BOX_TOKENS.shadows.progressBarContainerInset
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default React.memo(ProgressBar)

