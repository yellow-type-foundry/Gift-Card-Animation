'use client'

import React, { useMemo } from 'react'
import Image from 'next/image'
import useProgressAnimation from '@/hooks/useProgressAnimation'
import useHover from '@/hooks/useHover'
import useHoverColor from '@/hooks/useHoverColor'
import { GIFT_BOX_TOKENS } from '@/constants/giftBoxTokens'

// Asset paths from Figma
const imgBoxShadow = '/assets/3ce71b28afba3770de07efe28f1558dfed6b4cd7.svg'
const imgBoxShadowColor = '/assets/89f2ea89a03f9a1a7fd227903c03bf6b556ab2f8.svg'
const imgFlap = '/assets/e4fbcc3f1c94bf36a4cddc7dd9cef4a43efa8592.svg'
const imgSpecularHighlight = '/assets/a97f045e889f6250003707fa595a0ca65cc55325.svg'
const imgShadowColor = '/assets/a03cbeacdf722aee39283024dde0fe6b4e0bcf5a.svg'
const imgFlap3 = '/assets/6a0ea89f9adb3b9a92f1d9b3c70789e3892b1830.svg'

const EnvelopeBoxContainer = ({
  progress = { current: 4, total: 5 },
  boxImage = '/assets/covers/Onboarding 03.png',
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
    validatedProgress,
    isDone
  } = useProgressAnimation(progress)

  // Calculate progress bar width dynamically
  // Box width: 168px, padding: 16px each side = 32px total
  // Stroke wrapper padding: 0.45px each side = 0.9px
  // Inner container padding: 3.405px each side = 6.81px
  // Available width: 168 - 32 - 0.9 - 6.81 = 128.29px
  const progressBarMaxWidth = useMemo(() => {
    const containerWidth = 168
    const outerPadding = 16
    const strokePadding = 0.45
    const innerPadding = 3.405
    return containerWidth - (outerPadding * 2) - (strokePadding * 2) - (innerPadding * 2)
  }, [])

  const progressBarWidth = useMemo(() => {
    const minWidth = 60
    return Math.min(progressBarMaxWidth, Math.max(minWidth, (animatedProgress / 100) * progressBarMaxWidth))
  }, [animatedProgress, progressBarMaxWidth])

  // Grid cell color (light blue from Figma)
  const gridCellColor = '#c6e7fa'

  return (
    <div 
      className="box-border content-stretch flex flex-col gap-0 items-center justify-center px-[76px] py-[21px] relative size-full"
      data-name="Box Container/Batch 2"
      onMouseEnter={handleHoverEnter}
      onMouseLeave={handleHoverLeave}
    >
      {/* Box Shadow (beneath) - lowest z-index */}
      <div 
        className="absolute flex h-[59px] items-center justify-center left-[calc(50%+0.5px)] top-[143px] translate-x-[-50%] w-[131px]"
        style={{ zIndex: 0 }}
      >
        <div className="flex-none scale-y-[-100%]">
          <div 
            className="h-[59px] relative w-[131px]" 
            data-name="Box Shadow"
            style={{
              opacity: isHovered ? 0.75 : 0,
              transition: `opacity ${GIFT_BOX_TOKENS.animations.duration.fast} ${GIFT_BOX_TOKENS.animations.easing.easeOut}`
            }}
          >
            <div className="absolute inset-[-40.68%_-18.32%]">
              <img alt="" className="block max-w-none size-full" src={imgBoxShadow} />
            </div>
          </div>
        </div>
      </div>

      {/* Box Shadow Color (beneath, with color blend) - lowest z-index */}
      <div 
        className="absolute flex h-[70px] items-center justify-center left-[82px] mix-blend-color top-[132px] w-[136px]"
        style={{ zIndex: 0 }}
      >
        <div className="flex-none scale-y-[-100%]">
          <div 
            className="h-[70px] relative w-[136px]" 
            data-name="Box Shadow color"
            style={{
              opacity: isHovered ? 0.75 : 0,
              transition: `opacity ${GIFT_BOX_TOKENS.animations.duration.fast} ${GIFT_BOX_TOKENS.animations.easing.easeOut}`
            }}
          >
            <div className="absolute inset-[-34.29%_-17.65%]">
              <img alt="" className="block max-w-none size-full" src={imgBoxShadowColor} />
            </div>
          </div>
        </div>
      </div>

      {/* Paper/Card Container - highest z-index, absolutely positioned above envelope */}
      <div 
        className="absolute left-1/2 translate-x-[-50%]"
        data-name="Paper"
        style={{ 
          zIndex: 3, // Highest z-index
          top: '61.5px', // Positioned just above the envelope (flap starts at top, paper above it)
          padding: '0.5px', // Border width
          borderRadius: '8px 8px 0 0', // Rounded top corners
          background: 'linear-gradient(to top, rgba(255,255,255,0) 0%, rgba(221,226,233,1) 100%)' // Gradient border from top to bottom
        }}
      >
        <div className="bg-white h-[60px] overflow-clip relative rounded-[inherit] w-[144px]">
          {/* Cover image */}
          <div className="absolute h-[33.6px] left-[6.2px] rounded-[3.2px] top-[6px] w-[128px]" data-name="Cover image">
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[3.2px]">
              <Image
                src={boxImage}
                alt=""
                fill
                sizes="128px"
                priority={false}
                style={{ objectFit: 'cover', borderRadius: '3.2px' }}
              />
              <div className="absolute inset-0 mix-blend-soft-light rounded-[3.2px]" />
            </div>
          </div>

          {/* Grid cells (4 cells) */}
          {[0, 1, 2, 3].map((index) => {
            const left = 6.4 + (index * 32.8) // 6.4px + (index * 32.8px spacing)
            return (
              <div 
                key={index}
                className="absolute opacity-50 rounded-[3.2px] size-[28.8px] top-[45.2px]"
                style={{ left: `${left}px` }}
                data-name="Container"
              >
                <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[3.2px]">
                  {/* Base color */}
                  <div 
                    className="absolute inset-0 rounded-[3.2px]"
                    style={{ backgroundColor: gridCellColor }}
                  />
                  {/* Gradient overlay */}
                  <div 
                    className="absolute inset-0 rounded-[3.2px]"
                    style={{
                      mixBlendMode: GIFT_BOX_TOKENS.blendModes.overlay,
                      background: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
                    }}
                  />
                </div>
              </div>
            )
          })}

          {/* Shadow Overlay */}
          <div 
            className="absolute bg-gradient-to-b bottom-0 from-[rgba(207,237,252,0)] h-[31px] left-1/2 opacity-30 to-[#054261] translate-x-[-50%] w-[144px] pointer-events-none"
            data-name="Shadow Overlay"
          />
        </div>
      </div>

      {/* Envelope Container - second highest z-index */}
      <div 
        className="content-stretch flex flex-col items-start relative shrink-0 w-[168px]" 
        data-name="Envelope"
        style={{ zIndex: 2 }}
      >
        {/* Flap (top) */}
        <div className="h-[97px] relative shrink-0 w-[168px]" data-name="Flap">
          <div className="absolute bottom-0 left-0 right-0 top-[2.39%]">
            <img alt="" className="block max-w-none size-full" src={imgFlap} />
          </div>
        </div>

        {/* Box (main container) - rounded only at bottom, sharp at top */}
        <div 
          className="border-[0.5px] border-[rgba(255,255,255,0)] border-solid h-[105px] min-w-[168px] relative shrink-0 w-full overflow-hidden"
          data-name="Box"
          style={{
            borderRadius: '0 0 32px 32px', // Only round bottom corners
            transform: isHovered ? `translateY(${GIFT_BOX_TOKENS.hoverEffects.transform.translateY})` : 'translateY(0)',
            transition: `transform ${GIFT_BOX_TOKENS.animations.duration.fast} ${GIFT_BOX_TOKENS.animations.easing.easeOut}`
          }}
        >
          {/* Base background and gradient overlay - rounded only at bottom */}
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ borderRadius: '0 0 32px 32px' }}>
            <div 
              className="absolute inset-0"
              style={{ 
                borderRadius: '0 0 32px 32px',
                backgroundColor: hoverBoxColor,
                transition: `background-color ${GIFT_BOX_TOKENS.animations.duration.fast} ${GIFT_BOX_TOKENS.animations.easing.easeOut}`
              }}
            />
            <div 
              className="absolute inset-0"
              style={{ 
                borderRadius: '0 0 32px 32px',
                mixBlendMode: GIFT_BOX_TOKENS.blendModes.overlay,
                background: GIFT_BOX_TOKENS.gradients.boxBase
              }}
            />
          </div>

          {/* Inner content container */}
          <div className="content-stretch flex flex-col h-[105px] items-start min-w-inherit overflow-clip relative rounded-[inherit] w-full">
            {/* Logo Container (empty for now, flex-grow) */}
            <div className="basis-0 grow min-h-px min-w-px shrink-0 w-full" data-name="Logo Container" />

            {/* Progress Bar (bottom, fixed) */}
            <div 
              className="box-border content-stretch flex flex-col gap-[10px] items-center justify-center pb-[12px] pt-0 px-[16px] relative shrink-0 w-full"
              data-name="Progress Bar"
            >
              {/* Stroke wrapper with gradient (0.5px outside) */}
              <div
                className="relative w-full"
                style={{
                  padding: '0.45px',
                  borderRadius: '100px',
                  background: GIFT_BOX_TOKENS.gradients.progressBarStroke,
                  boxShadow: GIFT_BOX_TOKENS.shadows.progressBarStroke
                }}
              >
                <div 
                  className="border-[0.5px] border-[rgba(255,255,255,0)] border-solid box-border content-stretch flex flex-col items-start justify-center relative size-full overflow-hidden"
                  style={{
                    gap: '11.351px',
                    padding: '3.405px',
                    borderRadius: '100px',
                  }}
                  data-name="Progress Bar"
                >
                  {/* Progress bar background layers */}
                  <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ borderRadius: '100px' }}>
                    {/* 1. Color fill, normal mode, 100% (base layer) */}
                    <div 
                      className="absolute inset-0"
                      style={{ 
                        borderRadius: '100px',
                        backgroundColor: hoverBoxColor,
                        transition: `background-color ${GIFT_BOX_TOKENS.animations.duration.fast} ${GIFT_BOX_TOKENS.animations.easing.easeOut}`
                      }}
                    />
                    {/* 2. White fill, 40%, overlay mode */}
                    <div 
                      className="absolute inset-0"
                      style={{ 
                        borderRadius: '100px',
                        mixBlendMode: GIFT_BOX_TOKENS.blendModes.overlay,
                        backgroundColor: GIFT_BOX_TOKENS.colors.whiteOverlay
                      }}
                    />
                  </div>

                  {/* Progress indicator */}
                  <div
                    className="relative shrink-0"
                    style={{
                      width: `${progressBarWidth}px`,
                      minWidth: '60px',
                      padding: '0.5px',
                      borderRadius: '40px',
                      background: GIFT_BOX_TOKENS.gradients.progressIndicatorStroke,
                      transition: `width ${GIFT_BOX_TOKENS.animations.duration.medium} ${GIFT_BOX_TOKENS.animations.easing.progressBar}`
                    }}
                    data-name="Progress"
                  >
                    <div 
                      className="box-border content-stretch flex flex-col items-start justify-center py-0 relative w-full overflow-hidden border-[0.5px] border-solid border-white"
                      style={{ 
                        height: '28px',
                        paddingLeft: '10px',
                        paddingRight: '10px',
                        borderRadius: '40px',
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
                          color: '#ffffff',
                          zIndex: GIFT_BOX_TOKENS.zIndex.progressText,
                          position: 'relative'
                        }}
                      >
                        {isDone ? 'Done' : `${animatedCurrent}/${validatedProgress.total}`}
                      </p>
                      <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          boxShadow: `0px -2.5px 4.5px 0px inset rgba(255,255,255,0.5), 0px 0px 4.541px 0px inset rgba(255,255,255,0.5), 0px -4.541px 13.622px 4.541px inset ${themedShadowColor}`
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
              className="absolute h-[25px] left-[6.55%] mix-blend-soft-light right-[6.72%] top-0 pointer-events-none"
              data-name="Specular Highlight"
            >
              <div className="absolute inset-[-82.38%_-14.13%]">
                <img alt="" className="block max-w-none size-full" src={imgSpecularHighlight} />
              </div>
            </div>

            {/* Shadow Highlight */}
            <div 
              className="absolute bottom-0 h-[27px] left-[9.52%] mix-blend-multiply right-[9.52%] pointer-events-none"
              data-name="Shadow color"
            >
              <div className="absolute inset-[-118.52%_-23.53%]">
                <img alt="" className="block max-w-none size-full" src={imgShadowColor} />
              </div>
            </div>

            {/* Shadow (blur effect) */}
            <div className="absolute bottom-[4.06%] flex items-center justify-center left-1/2 top-[4.05%] translate-x-[-50%] w-[154.378px] pointer-events-none">
              <div className="flex-none h-[96.486px] rotate-[180deg] w-[154.378px]">
                <div 
                  className="blur-[13.622px] border-[15.892px] border-black border-solid filter opacity-[0.13] rounded-[34.054px] size-full" 
                  data-name="Shadow"
                />
              </div>
            </div>

            {/* Highlight (blur effect) */}
            <div 
              className="absolute blur-[11.351px] border-[15.892px] border-solid border-white bottom-[4.05%] filter left-1/2 opacity-30 rounded-[34.054px] top-[4.06%] translate-x-[-50%] w-[154.378px] pointer-events-none" 
              data-name="Highlight"
            />

            {/* Noise overlay */}
            <div 
              className="absolute bg-[rgba(0,0,0,0.3)] left-1/2 mix-blend-overlay opacity-75 size-[168px] top-[calc(50%+0.5px)] translate-x-[-50%] translate-y-[-50%] pointer-events-none"
              data-name="Noise"
              style={{
                opacity: isHovered ? 0.6 : 0.75,
                transition: `opacity ${GIFT_BOX_TOKENS.animations.duration.fast} ${GIFT_BOX_TOKENS.animations.easing.easeOut}`,
                backgroundImage: `url(${GIFT_BOX_TOKENS.assets.noise})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          </div>

          {/* Box inset shadow - rounded only at bottom */}
          <div 
            className="absolute inset-0 pointer-events-none shadow-[0px_1.5px_16px_0px_inset_#ffffff,0px_2px_4px_0px_inset_rgba(255,255,255,0.65)]"
            style={{ borderRadius: '0 0 32px 32px' }}
          />
        </div>

        {/* Flap 3 (overlay on top) */}
        <div className="absolute h-[87px] left-1/2 top-[10px] translate-x-[-50%] w-[154px]" data-name="Flap 3">
          <div className="absolute bottom-0 left-0 right-0 top-[1.99%]">
            <img alt="" className="block max-w-none size-full" src={imgFlap3} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(EnvelopeBoxContainer)

