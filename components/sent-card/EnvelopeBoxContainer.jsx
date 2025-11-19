'use client'

import React, { useMemo } from 'react'
import Image from 'next/image'
import useProgressAnimation from '@/hooks/useProgressAnimation'
import useHover from '@/hooks/useHover'
import { GIFT_BOX_TOKENS } from '@/constants/giftBoxTokens'
import { hexToHsl, hslToHex } from '@/utils/colors'
import ProgressBar from '@/components/sent-card/ProgressBar'

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
  flapColor, // Optional separate color for flap theming. If not provided, uses boxColor
  boxOpacity = 1.0, // Opacity for envelope box (0-1)
  flapOpacity = 1.0, // Opacity for flap (0-1)
  isHovered: externalIsHovered
}) => {
  const { isHovered: internalIsHovered, handleHoverEnter, handleHoverLeave } = useHover()
  // Use external hover state if provided, otherwise use internal
  const isHovered = externalIsHovered !== undefined ? externalIsHovered : internalIsHovered

  // Use flapColor if provided, otherwise fall back to boxColor
  const effectiveFlapColor = flapColor !== undefined ? flapColor : boxColor

  // Use themed box color for envelope theming
  const themedShadowColor = useMemo(() => {
    // Calculate shadow color from box color (darker version)
    const [h, s, l] = hexToHsl(boxColor)
    const darkerL = Math.max(0, l - 5) // Reduced from 20 to 10 for lighter shadow
    return hslToHex(h, s, darkerL)
  }, [boxColor])

  // Calculate CSS filter to transform blue flap to themed color
  // Uses flapColor if provided, otherwise uses boxColor
  // NOTE: CSS filters work multiplicatively, so the result is an approximation of the target color
  // The envelope box uses backgroundColor directly and will match exactly, but the flap uses filters
  const flapFilter = useMemo(() => {
    const defaultBlue = '#94d8f9'
    const [defaultH, defaultS, defaultL] = hexToHsl(defaultBlue)
    const [themedH, themedS, themedL] = hexToHsl(effectiveFlapColor)
    
    // Calculate hue rotation (difference in hue)
    const hueRotate = themedH - defaultH
    // Calculate saturation adjustment (ratio)
    // CSS saturate() multiplies saturation, so ratio = target / source
    const saturateRatio = themedS / Math.max(defaultS, 1) // defaultS is ~89
    // Calculate brightness adjustment (ratio)
    // CSS brightness() multiplies lightness, so ratio = target / source  
    const brightnessRatio = themedL / Math.max(defaultL, 1) // defaultL is ~78
    
    return `hue-rotate(${hueRotate}deg) saturate(${saturateRatio}) brightness(${brightnessRatio})`
  }, [effectiveFlapColor])

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
    const containerWidth = 165.5
    const outerPadding = 16
    const strokePadding = 0.45
    const innerPadding = 3.405
    return containerWidth - (outerPadding * 2) - (strokePadding * 2) - (innerPadding * 2)
  }, [])

  const progressBarWidth = useMemo(() => {
    const minWidth = 60
    return Math.min(progressBarMaxWidth, Math.max(minWidth, (animatedProgress / 100) * progressBarMaxWidth))
  }, [animatedProgress, progressBarMaxWidth])

  // Grid cell color - use a lighter version of the themed box color
  const gridCellColor = useMemo(() => {
    // Create a lighter version of the box color for grid cells
    const [h, s, l] = hexToHsl(boxColor)
    const lighterL = Math.min(100, l + 35) // Lighten by 35 units
    return hslToHex(h, s, lighterL)
  }, [boxColor])

  // Progress bar indicator color - slightly lighter than envelope
  const indicatorColor = useMemo(() => {
    // Create a slightly lighter version of the box color for progress bar indicator
    const [h, s, l] = hexToHsl(boxColor)
    const lighterL = Math.min(100, s + 60, l + 20,) // Lighten by 5 units
    return hslToHex(h, s, lighterL)
  }, [boxColor])

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
        {/* Flap (top) - themed using CSS filter to transform blue to themed color */}
        <div className="h-[97px] relative shrink-0 w-[168px] overflow-visible" data-name="Flap">
          <div 
            className="absolute bottom-0 left-0 right-0 top-[2.39%]"
            style={{
              filter: flapFilter,
              opacity: flapOpacity
            }}
          >
            <img alt="" className="block max-w-none size-full" src={imgFlap} />
          </div>
          
          {/* Gradient overlay - clipped to flap shape */}
          <div 
            className="absolute bottom-0 left-0 right-0 top-[2.39%] pointer-events-none"
            style={{
              mixBlendMode: GIFT_BOX_TOKENS.blendModes.overlay,
              background: GIFT_BOX_TOKENS.gradients.boxBase,
              WebkitMaskImage: `url(${imgFlap})`,
              WebkitMaskSize: '100% 100%',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: '0% 0%',
              maskImage: `url(${imgFlap})`,
              maskSize: '100% 100%',
              maskRepeat: 'no-repeat',
              maskPosition: '0% 0%'
            }}
          />
          
          {/* Noise overlay - clipped to flap shape, positioned exactly like the flap image */}
          <div 
            className="absolute bottom-0 left-0 right-0 top-[2.39%] pointer-events-none"
            data-name="Noise"
            style={{
              opacity: isHovered ? 0.6 : 0.75,
              transition: `opacity ${GIFT_BOX_TOKENS.animations.duration.fast} ${GIFT_BOX_TOKENS.animations.easing.easeOut}`,
              backgroundImage: `url(${GIFT_BOX_TOKENS.assets.noise})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              mixBlendMode: 'overlay',
              WebkitMaskImage: `url(${imgFlap})`,
              WebkitMaskSize: '100% 100%',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: '0% 0%',
              maskImage: `url(${imgFlap})`,
              maskSize: '100% 100%',
              maskRepeat: 'no-repeat',
              maskPosition: '0% 0%'
            }}
          />
        </div>

        {/* Box (main container) - rounded only at bottom, sharp at top */}
        <div 
          className="border-[0px] border-[rgba(255,255,255,0)] border-solid h-[105px] min-w-[168px] relative shrink-0 w-full overflow-hidden"
          data-name="Box"
          style={{
            borderRadius: '0 0 32px 32px', // Only round bottom corners
            transform: 'translateY(-0.5px)' // Move up by 0.5px
            // No hover lift effect
          }}
        >
          {/* Base background and gradient overlay - rounded only at bottom */}
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ borderRadius: '0 0 32px 32px' }}>
            <div 
              className="absolute inset-0"
              style={{ 
                borderRadius: '0 0 32px 32px',
                backgroundColor: boxColor, // Themed box color
                opacity: boxOpacity
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
            <ProgressBar
              progress={progress}
              boxColor={boxColor}
              indicatorColor={indicatorColor}
              progressBarWidth={progressBarWidth}
              animatedCurrent={animatedCurrent}
              validatedProgress={validatedProgress}
              isDone={isDone}
              themedShadowColor={themedShadowColor}
            />

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
            className="absolute inset-0 pointer-events-none shadow-[0px_2px_16px_0px_inset_rgba(255,255,255,0.55),0px_2px_4px_0px_inset_rgba(255,255,255,0.35)]"
            style={{ borderRadius: '0 0 32px 32px' }}
          />
        </div>

        {/* Flap 3 (overlay on top) - themed using CSS filter to transform blue to themed color */}
        <div className="absolute h-[87px] left-1/2 top-[10px] translate-x-[-50%] w-[154px] overflow-visible" data-name="Flap 3">
          <div 
            className="absolute bottom-0 left-0 right-0 top-[1.99%]"
            style={{
              filter: flapFilter,
              opacity: flapOpacity
            }}
          >
            <img alt="" className="block max-w-none size-full" src={imgFlap3} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(EnvelopeBoxContainer)

