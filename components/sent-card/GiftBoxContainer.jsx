'use client'

import React, { useMemo } from 'react'
import useProgressAnimation from '@/hooks/useProgressAnimation'
import useHover from '@/hooks/useHover'
import useHoverColor from '@/hooks/useHoverColor'
import { GIFT_BOX_TOKENS, calculateProgressBarMaxWidth, calculateProgressBarWidth } from '@/constants/giftBoxTokens'
import ProgressBar from '@/components/sent-card/ProgressBar'
import { hexToHsl } from '@/utils/colors'

const GiftBoxContainer = ({
  progress = { current: 4, total: 5 },
  boxColor = '#94d8f9',
  isHovered: externalIsHovered
}) => {
  const { isHovered: internalIsHovered, handleHoverEnter, handleHoverLeave } = useHover()
  // Use external hover state if provided, otherwise use internal
  const isHovered = externalIsHovered !== undefined ? externalIsHovered : internalIsHovered

  // Calculate hover and shadow colors using reusable hook
  const { hoverColor: hoverBoxColor, shadowColor: themedShadowColor } = useHoverColor(boxColor, isHovered)
  
  // Calculate CSS filter to theme the shadow color image (blue to themed color)
  const shadowColorFilter = useMemo(() => {
    const defaultBlue = '#94d8f9'
    const [defaultH, defaultS, defaultL] = hexToHsl(defaultBlue)
    const [themedH, themedS, themedL] = hexToHsl(boxColor)
    
    const hueRotate = themedH - defaultH
    const saturateRatio = themedS / Math.max(defaultS, 1)
    const brightnessRatio = themedL / Math.max(defaultL, 1)
    
    return `hue-rotate(${hueRotate}deg) saturate(${saturateRatio}) brightness(${brightnessRatio})`
  }, [boxColor])
  
  // Progress animation with delay and loading
  const {
    animatedProgress,
    animatedCurrent,
    validatedProgress,
    isDone
  } = useProgressAnimation(progress)

  // Calculate progress bar width dynamically using tokens
  const progressBarMaxWidth = calculateProgressBarMaxWidth()
  const progressBarWidth = calculateProgressBarWidth(animatedProgress, progressBarMaxWidth)

  return (
    <div 
      className="box-border content-stretch flex gap-[10px] items-center justify-center relative size-full"
      data-name="Gift Container/Goody"
      onMouseEnter={handleHoverEnter}
      onMouseLeave={handleHoverLeave}
      style={{ position: 'relative' }}
    >
      <div 
        className="border-[0.5px] border-[rgba(255,255,255,0)] border-solid relative shrink-0 overflow-hidden"
        style={{ 
          width: GIFT_BOX_TOKENS.box.width, 
          height: GIFT_BOX_TOKENS.box.height,
          borderRadius: GIFT_BOX_TOKENS.box.borderRadius,
          transform: isHovered ? `translateY(${GIFT_BOX_TOKENS.hoverEffects.transform.translateY})` : 'translateY(0)',
          transition: `transform ${GIFT_BOX_TOKENS.animations.duration.fast} ${GIFT_BOX_TOKENS.animations.easing.easeOut}`
        }}
        data-name="Box"
      >
        {/* Base background and gradient overlay */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ borderRadius: GIFT_BOX_TOKENS.box.borderRadius }}>
          <div 
            className="absolute inset-0"
            style={{ 
              borderRadius: GIFT_BOX_TOKENS.box.borderRadius,
              backgroundColor: hoverBoxColor,
              transition: `background-color ${GIFT_BOX_TOKENS.animations.duration.fast} ${GIFT_BOX_TOKENS.animations.easing.easeOut}`
            }}
          />
          <div 
            className="absolute inset-0"
            style={{ 
              borderRadius: GIFT_BOX_TOKENS.box.borderRadius,
              mixBlendMode: GIFT_BOX_TOKENS.blendModes.overlay,
              background: GIFT_BOX_TOKENS.gradients.boxBase
            }}
          />
        </div>

        {/* Inner content container */}
        <div className="content-stretch flex flex-col items-start overflow-hidden relative rounded-[inherit] w-full h-full" style={{ width: GIFT_BOX_TOKENS.box.width, height: GIFT_BOX_TOKENS.box.height }}>
          {/* Logo Container (top, flex-grow) */}
          <div 
            className="basis-0 box-border content-stretch flex flex-col grow items-center min-h-px min-w-px relative shrink-0 w-full"
            style={{
              paddingLeft: GIFT_BOX_TOKENS.logo.containerPadding.horizontal,
              paddingRight: GIFT_BOX_TOKENS.logo.containerPadding.horizontal,
              paddingTop: GIFT_BOX_TOKENS.logo.containerPadding.vertical,
              paddingBottom: GIFT_BOX_TOKENS.logo.containerPadding.vertical,
            }}
            data-name="Logo Container"
          >
            {/* Logo with text emboss style */}
            <div 
              className="relative shrink-0 mix-blend-overlay"
              style={{ 
                width: GIFT_BOX_TOKENS.logo.width,
                height: GIFT_BOX_TOKENS.logo.height,
                mixBlendMode: GIFT_BOX_TOKENS.blendModes.overlay
              }}
              data-name="Logo"
            >
              <div className="absolute inset-[-12.66%_-1.84%_-9.28%_-1.84%]">
                <img 
                  alt="" 
                  className="block max-w-none size-full" 
                  src="/assets/GiftSent/Gift Container/9bc812442d8f2243c9c74124dd128a8df145f983.svg"
                />
              </div>
            </div>
          </div>

          {/* Progress Bar (bottom, fixed) */}
          <ProgressBar
            progress={progress}
            boxColor={hoverBoxColor}
            progressBarWidth={progressBarWidth}
            animatedCurrent={animatedCurrent}
            validatedProgress={validatedProgress}
            isDone={isDone}
            themedShadowColor={themedShadowColor}
          />

          {/* Specular Highlight */}
          <div 
            className="absolute top-0 pointer-events-none"
            style={{
              left: GIFT_BOX_TOKENS.effects.specularHighlight.horizontalOffset,
              right: GIFT_BOX_TOKENS.effects.specularHighlight.horizontalOffset,
              height: GIFT_BOX_TOKENS.effects.specularHighlight.height,
              mixBlendMode: GIFT_BOX_TOKENS.blendModes.softLight
            }}
            data-name="Specular Highlight"
          >
            <div className="absolute inset-[-82.38%_-12.71%]">
              <img 
                alt="" 
                className="block max-w-none size-full" 
                src={GIFT_BOX_TOKENS.assets.specularHighlight}
              />
            </div>
          </div>

          {/* Shadow Highlight */}
          <div 
            className="absolute bottom-0 pointer-events-none"
            style={{
              left: GIFT_BOX_TOKENS.effects.shadowHighlight.horizontalOffset,
              right: GIFT_BOX_TOKENS.effects.shadowHighlight.horizontalOffset,
              height: GIFT_BOX_TOKENS.effects.shadowHighlight.height,
              mixBlendMode: GIFT_BOX_TOKENS.blendModes.multiply
            }}
            data-name="Shadow Highlight"
          >
            <div 
              className="absolute inset-[-118.52%_-19.75%]"
              style={{
                filter: shadowColorFilter
              }}
            >
              <img 
                alt="" 
                className="block max-w-none size-full" 
                src={GIFT_BOX_TOKENS.assets.shadowHighlight}
              />
            </div>
          </div>

          {/* Highlight layer */}
          <div 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              width: GIFT_BOX_TOKENS.effects.highlight.width,
              height: GIFT_BOX_TOKENS.effects.highlight.height,
              borderRadius: GIFT_BOX_TOKENS.effects.highlight.borderRadius,
              overflow: 'visible',
              zIndex: GIFT_BOX_TOKENS.zIndex.highlight,
              mixBlendMode: GIFT_BOX_TOKENS.blendModes.overlay
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                width: GIFT_BOX_TOKENS.effects.highlightWrapper.width,
                height: GIFT_BOX_TOKENS.effects.highlightWrapper.height,
                borderRadius: GIFT_BOX_TOKENS.effects.highlightWrapper.borderRadius,
                border: GIFT_BOX_TOKENS.effects.highlightWrapper.border,
                background: GIFT_BOX_TOKENS.gradients.highlight,
                filter: `blur(${GIFT_BOX_TOKENS.effects.highlight.blur})`,
                opacity: 1
              }}
              data-name="Highlight"
            />
          </div>
        </div>

        {/* Shadow layer - outside inner container to allow blend mode */}
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            width: GIFT_BOX_TOKENS.effects.shadowWrapper.width,
            height: GIFT_BOX_TOKENS.effects.shadowWrapper.height,
            borderRadius: GIFT_BOX_TOKENS.effects.shadowWrapper.borderRadius,
            overflow: 'visible',
            zIndex: GIFT_BOX_TOKENS.zIndex.highlight,
            mixBlendMode: GIFT_BOX_TOKENS.blendModes.overlay
          }}
        >
          <div 
            className="absolute inset-0"
            style={{
              width: GIFT_BOX_TOKENS.effects.shadow.width,
              height: GIFT_BOX_TOKENS.effects.shadow.height,
              borderRadius: GIFT_BOX_TOKENS.effects.shadow.borderRadius,
              border: GIFT_BOX_TOKENS.effects.shadowWrapper.border,
              background: GIFT_BOX_TOKENS.gradients.shadow,
              filter: `blur(${GIFT_BOX_TOKENS.effects.shadow.blur})`,
              opacity: 1,
              willChange: 'filter'
            }}
            data-name="Shadow"
          />
        </div>

        {/* Box inset shadow */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: GIFT_BOX_TOKENS.shadows.boxInset
          }}
        />

        {/* Noise texture overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: GIFT_BOX_TOKENS.box.borderRadius,
            zIndex: GIFT_BOX_TOKENS.zIndex.noise,
            opacity: isHovered ? GIFT_BOX_TOKENS.hoverEffects.noiseOpacity.hover : GIFT_BOX_TOKENS.hoverEffects.noiseOpacity.default,
            mixBlendMode: GIFT_BOX_TOKENS.blendModes.overlay,
            backgroundImage: `url(${GIFT_BOX_TOKENS.assets.noise})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transition: `opacity ${GIFT_BOX_TOKENS.animations.duration.fast} ${GIFT_BOX_TOKENS.animations.easing.easeOut}`
          }}
        />
      </div>

      {/* Box Shadow - only visible on hover */}
      <div 
        className="absolute flex items-center justify-center pointer-events-none"
        style={{
          left: `calc(50% + ${GIFT_BOX_TOKENS.boxShadow.leftOffset})`,
          top: GIFT_BOX_TOKENS.boxShadow.top,
          transform: 'translateX(-50%)',
          height: GIFT_BOX_TOKENS.boxShadow.height,
          width: GIFT_BOX_TOKENS.boxShadow.width,
          opacity: isHovered ? GIFT_BOX_TOKENS.hoverEffects.boxShadowOpacity.hover : GIFT_BOX_TOKENS.hoverEffects.boxShadowOpacity.default,
          zIndex: GIFT_BOX_TOKENS.zIndex.boxShadow,
          transition: `opacity ${GIFT_BOX_TOKENS.animations.duration.fast} ${GIFT_BOX_TOKENS.animations.easing.easeOut}`
        }}
        data-name="Box Shadow"
      >
        <div 
          className="flex-none"
          style={{
            transform: 'scaleY(-1)'
          }}
        >
          <div 
            className="relative"
            style={{
              height: GIFT_BOX_TOKENS.boxShadow.imageSize.height,
              width: GIFT_BOX_TOKENS.boxShadow.imageSize.width
            }}
          >
            <div 
              className="absolute"
              style={{
                inset: GIFT_BOX_TOKENS.boxShadow.imageInset
              }}
            >
              <img 
                alt="" 
                className="block max-w-none size-full" 
                src={GIFT_BOX_TOKENS.assets.boxShadow}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(GiftBoxContainer)

