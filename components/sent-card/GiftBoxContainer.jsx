'use client'

import React from 'react'
import useProgressAnimation from '@/hooks/useProgressAnimation'
import useHover from '@/hooks/useHover'
import useHoverColor from '@/hooks/useHoverColor'
import { GIFT_BOX_TOKENS, calculateProgressBarMaxWidth, calculateProgressBarWidth } from '@/constants/giftBoxTokens'

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
  // Progress animation with delay and loading
  const {
    animatedProgress,
    animatedCurrent,
    validatedProgress
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
          <div 
            className="box-border content-stretch flex flex-col gap-[10px] items-center justify-center relative shrink-0 w-full"
            style={{
              paddingBottom: GIFT_BOX_TOKENS.progressBar.container.bottomPadding,
              paddingLeft: GIFT_BOX_TOKENS.progressBar.container.horizontalPadding,
              paddingRight: GIFT_BOX_TOKENS.progressBar.container.horizontalPadding,
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
                    backgroundColor: hoverBoxColor,
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
                    backgroundColor: hoverBoxColor,
                    transition: `background-color ${GIFT_BOX_TOKENS.animations.duration.fast} ${GIFT_BOX_TOKENS.animations.easing.easeOut}`
                  }}
                >
                  <p 
                    className="font-['Goody_Sans:Medium',sans-serif] leading-[1.4] not-italic relative shrink-0 text-white w-full"
                    style={{
                      fontFamily: 'var(--font-goody-sans)',
                      fontSize: '15.892px',
                      fontWeight: 500,
                      lineHeight: 1.4,
                      color: GIFT_BOX_TOKENS.colors.progressText,
                      zIndex: GIFT_BOX_TOKENS.zIndex.progressText,
                      mixBlendMode: GIFT_BOX_TOKENS.blendModes.overlay,
                      opacity: GIFT_BOX_TOKENS.colors.progressTextOpacity,
                      position: 'relative'
                    }}
                  >
                    {animatedCurrent}/{validatedProgress.total}
                  </p>
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      boxShadow: `0px -2.3px 4.5px 0px inset rgba(255,255,255,0.5), 0px 0px 4.5px 0px inset rgba(255,255,255,0.5), 0px -4.5px 13px 4.5px inset ${themedShadowColor}`
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
            <div className="absolute inset-[-118.52%_-19.75%]">
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

