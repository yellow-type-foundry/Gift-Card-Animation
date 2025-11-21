'use client'

import React, { useMemo } from 'react'
import Image from 'next/image'
import useProgressAnimation from '@/hooks/useProgressAnimation'
import useHover from '@/hooks/useHover'
import { GIFT_BOX_TOKENS } from '@/constants/giftBoxTokens'
import { hexToHsl, hslToHex } from '@/utils/colors'
import ProgressBar from '@/components/sent-card/ProgressBar'

// Asset paths from Figma
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
  progressIndicatorShadowColor, // Optional separate shadow color for progress indicator. If not provided, calculated from boxColor
  containerPadding = { top: 0, right: 0, bottom: 0, left: 0 }, // Padding from wrapper (px) - used to adjust paper position
  containerMargin = { top: 0, right: 0, bottom: 0, left: 0 }, // Margin from wrapper (px) - used to adjust paper position
  isHovered: externalIsHovered,
  parallaxX = 0, // Parallax offset X for tilt effect
  parallaxY = 0, // Parallax offset Y for tilt effect
  tiltX = 0, // Tilt X angle for 3D effect
  tiltY = 0, // Tilt Y angle for 3D effect
  animationType = 'none' // Animation type to determine if 3D effects should be applied
}) => {
  const { isHovered: internalIsHovered, handleHoverEnter, handleHoverLeave } = useHover()
  // Use external hover state if provided, otherwise use internal
  const isHovered = externalIsHovered !== undefined ? externalIsHovered : internalIsHovered

  // Use flapColor if provided, otherwise fall back to boxColor
  const effectiveFlapColor = flapColor !== undefined ? flapColor : boxColor

  // Use themed box color for envelope theming
  // If progressIndicatorShadowColor is provided, use it; otherwise calculate from boxColor
  const themedShadowColor = useMemo(() => {
    if (progressIndicatorShadowColor !== undefined) {
      return progressIndicatorShadowColor
    }
    // Calculate shadow color from box color (darker version)
    const [h, s, l] = hexToHsl(boxColor)
    const darkerL = Math.max(0, l - 5) // Reduced from 20 to 10 for lighter shadow
    return hslToHex(h, s, darkerL)
  }, [boxColor, progressIndicatorShadowColor])

  // Dynamic shadow calculations based on tilt angle (for 3D effect)
  // Shadow moves opposite to tilt direction, becomes more elongated, and opacity changes
  const shadowOffsetX = useMemo(() => {
    if (!isHovered || animationType !== '3d') return 0
    // Shadow moves opposite to tiltY (when tilted right, shadow moves left)
    return -tiltY * 2 // 2px per degree
  }, [isHovered, animationType, tiltY])

  const shadowOffsetY = useMemo(() => {
    if (!isHovered || animationType !== '3d') return 0
    // Shadow moves opposite to tiltX (when tilted down, shadow moves up)
    return -tiltX * 2 // 2px per degree
  }, [isHovered, animationType, tiltX])

  const shadowScaleX = useMemo(() => {
    if (!isHovered || animationType !== '3d') return 1
    // Shadow becomes more elongated when tilted
    // Calculate based on tilt angle magnitude
    const tiltMagnitude = Math.sqrt(tiltX * tiltX + tiltY * tiltY)
    return 1 + (tiltMagnitude / 6) * 0.3 // Up to 30% elongation
  }, [isHovered, animationType, tiltX, tiltY])

  const shadowScaleY = useMemo(() => {
    if (!isHovered || animationType !== '3d') return 1
    // Shadow becomes slightly compressed when tilted
    const tiltMagnitude = Math.sqrt(tiltX * tiltX + tiltY * tiltY)
    return 1 - (tiltMagnitude / 6) * 0.1 // Up to 10% compression
  }, [isHovered, animationType, tiltX, tiltY])

  const shadowOpacity = useMemo(() => {
    if (!isHovered) return GIFT_BOX_TOKENS.hoverEffects.boxShadowOpacity.default
    if (animationType !== '3d') return GIFT_BOX_TOKENS.hoverEffects.boxShadowOpacity.hover
    // Shadow opacity increases when tilted (more dramatic)
    const tiltMagnitude = Math.sqrt(tiltX * tiltX + tiltY * tiltY)
    const baseOpacity = GIFT_BOX_TOKENS.hoverEffects.boxShadowOpacity.hover
    return Math.min(1, baseOpacity + (tiltMagnitude / 6) * 0.2) // Up to 20% more opacity
  }, [isHovered, animationType, tiltX, tiltY])

  // 2. Depth-based scale: scale down when tilted away, scale up when tilted toward viewer
  const depthScale = useMemo(() => {
    if (!isHovered || animationType !== '3d') return 1
    // Calculate perceived distance based on tilt (negative tiltX = tilted away)
    // When tilted away (positive tiltX), scale down; when tilted toward (negative tiltX), scale up
    const distanceFactor = -tiltX / 6 // Normalize to -1 to 1 range
    return 1 + distanceFactor * 0.05 // Up to 5% scale change
  }, [isHovered, animationType, tiltX])

  // 3. Lighting/brightness shifts: brighter when tilted toward light, darker when away
  const brightnessShift = useMemo(() => {
    if (!isHovered || animationType !== '3d') return 1
    // Light source is from top-left, so negative tiltX (tilted up) and negative tiltY (tilted left) = brighter
    const lightFactor = (-tiltX - tiltY) / 12 // Normalize to -1 to 1 range
    return 1 + lightFactor * 0.15 // Up to 15% brightness change
  }, [isHovered, animationType, tiltX, tiltY])

  // 4. Edge highlighting: brighter edges when facing light
  const edgeHighlightIntensity = useMemo(() => {
    if (!isHovered || animationType !== '3d') return 0
    // Top and left edges are brighter when facing light
    const topEdgeFactor = Math.max(0, -tiltX / 6) // Top edge (negative tiltX = facing up)
    const leftEdgeFactor = Math.max(0, -tiltY / 6) // Left edge (negative tiltY = facing left)
    return Math.max(topEdgeFactor, leftEdgeFactor) * 0.6 // Up to 60% intensity
  }, [isHovered, animationType, tiltX, tiltY])

  // 5. Perspective blur (depth of field): blur when tilted away from viewer
  const depthBlur = useMemo(() => {
    if (!isHovered || animationType !== '3d') return 0
    // Blur increases when tilted away (positive tiltX)
    const blurFactor = Math.max(0, tiltX / 6) // 0 to 1 range
    return blurFactor * 2 // Up to 2px blur
  }, [isHovered, animationType, tiltX])

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

  // Paper gradient overlay colors - themed with boxColor
  const paperGradientTopColor = useMemo(() => {
    // Light, transparent version at top
    const [h, s, l] = hexToHsl(boxColor)
    const lighterL = Math.min(100, l + 50) // Much lighter for top
    return hslToHex(h, s, lighterL)
  }, [boxColor])

  const paperGradientBottomColor = useMemo(() => {
    // Dark shade at bottom
    const [h, s, l] = hexToHsl(boxColor)
    const darkerL = Math.max(0, l - 30) // Darker for bottom
    return hslToHex(h, s, darkerL)
  }, [boxColor])

  return (
    <div 
      className="content-stretch flex flex-col gap-0 items-center justify-center relative size-full"
      data-name="Box Container/Batch 2"
      data-is-done={isDone ? "true" : "false"}
      onMouseEnter={handleHoverEnter}
      onMouseLeave={handleHoverLeave}
    >
      {/* Box Shadow - Batch 2 - only visible on hover */}
      {/* Dynamic shadow that responds to tilt angle in 3D mode */}
      <div 
        className="absolute flex items-center justify-center pointer-events-none"
        style={{
          left: `calc(50% + ${GIFT_BOX_TOKENS.boxShadowBatch2.leftOffset} + ${shadowOffsetX}px)`,
          top: `calc(${GIFT_BOX_TOKENS.boxShadowBatch2.top} + ${shadowOffsetY}px)`,
          transform: 'translateX(-50%)',
          height: GIFT_BOX_TOKENS.boxShadowBatch2.height,
          width: GIFT_BOX_TOKENS.boxShadowBatch2.width,
          opacity: shadowOpacity,
          zIndex: GIFT_BOX_TOKENS.zIndex.boxShadow,
          transition: isHovered && animationType === '3d'
            ? `opacity 0.15s ease-out, left 0.15s ease-out, top 0.15s ease-out`
            : `opacity ${GIFT_BOX_TOKENS.animations.duration.fast} ${GIFT_BOX_TOKENS.animations.easing.easeOut}`
        }}
        data-name="Box Shadow"
      >
        <div 
          className="flex-none"
          style={{
            transform: `scaleY(-1) scaleX(${shadowScaleX}) scaleY(${shadowScaleY})`,
            transition: isHovered && animationType === '3d'
              ? 'transform 0.15s ease-out'
              : 'none'
          }}
        >
          <div 
            className="relative"
            style={{
              height: GIFT_BOX_TOKENS.boxShadowBatch2.imageSize.height,
              width: GIFT_BOX_TOKENS.boxShadowBatch2.imageSize.width
            }}
          >
            <div 
              className="absolute"
              style={{
                inset: GIFT_BOX_TOKENS.boxShadowBatch2.imageInset
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

      {/* Paper/Card Container - highest z-index, absolutely positioned above envelope */}
      {/* Paper is an essential part of the envelope and moves with it */}
      <div 
        className="absolute left-1/2"
        data-name="Paper"
        style={{ 
          zIndex: 3, // Highest z-index
          top: `${23 + containerPadding.top + containerMargin.top - (isHovered ? 16 : 0)}px`, // Positioned just above the envelope, adjusted for wrapper padding/margin and hover expansion (moves up 16px on hover to expand from bottom)
          padding: '0.5px', // Border width
          borderRadius: '8px 8px 0 0', // Rounded top corners
          background: 'linear-gradient(to top, rgba(255,255,255,0) 0%, rgba(221,226,233,1) 100%)', // Gradient border from top to bottom
          ...(isHovered && animationType === '3d' ? {
            transform: `translateX(-50%) perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translate(${parallaxX}px, ${parallaxY}px) scale(${1.02 * depthScale})`,
            transformStyle: 'preserve-3d',
            filter: `brightness(${brightnessShift}) blur(${depthBlur}px)`,
            transition: 'top 250ms ease-in-out, transform 0.15s ease-out, filter 0.15s ease-out'
          } : {
            transform: isHovered
              ? `translateX(-50%) translate(${parallaxX}px, ${parallaxY}px) scale(1.02)`
              : 'translateX(-50%) translate(0px, 0px) scale(1)',
            filter: 'none',
            transition: isHovered 
              ? 'top 250ms ease-in-out, transform 0.15s ease-out'
              : 'top 250ms ease-in-out, transform 0.3s ease-out'
          }),
          transformOrigin: 'center center'
        }}
      >
        <div 
          className="bg-white overflow-clip relative rounded-[inherit] w-[144px] flex flex-col items-center" 
          data-animation-type={animationType}
          style={{ 
            padding: '6px', 
            height: isHovered ? '68px' : '52px',
            transition: 'height 250ms ease-in-out'
          }}
        >
          {/* Cover image */}
          <div className="relative w-full rounded-[3.2px] flex-shrink-0" style={{ height: '33.6px', flexGrow: 0 }} data-name="Cover image">
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

          {/* Grid cells (4 cells) - with breathing animation on hover */}
          <div className="flex gap-[3.2px] w-full" style={{ marginTop: '5px' }}>
            {[0, 1, 2, 3].map((index) => {
              return (
                <div 
                  key={index}
                  className="relative rounded-[3.2px] flex-1 aspect-square"
                  data-name="Container"
                >
                <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[3.2px]">
                  {/* Base color - with breathing animation (opacity controlled by CSS to match Batch 1) */}
                  <div 
                    className={`grid-cell-base gc-${index + 1} absolute inset-0 rounded-[3.2px]`}
                    style={{ 
                      backgroundColor: gridCellColor
                      // Opacity controlled by CSS: default 0.2, hover animates 0.16 → 0.38 → 0.16
                    }}
                  />
                  {/* Gradient overlay - with breathing animation (opacity controlled by CSS to match Batch 1) */}
                  <div 
                    className={`grid-cell-overlay gc-${index + 1} absolute inset-0 rounded-[3.2px]`}
                    style={{
                      mixBlendMode: GIFT_BOX_TOKENS.blendModes.overlay,
                      background: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
                      // Opacity controlled by CSS: default 0.10, hover animates 0.10 → 0.00 → 0.10
                    }}
                  />
                </div>
              </div>
            )
          })}
          </div>

          {/* Gradient Overlay - themed color gradient from top to bottom */}
          <div 
            className="absolute inset-0 pointer-events-none rounded-[inherit]"
            style={{
              background: `linear-gradient(to bottom, ${paperGradientTopColor}00 0%, ${paperGradientBottomColor}66 100%)`,
              mixBlendMode: 'multiply'
            }}
            data-name="Paper Gradient Overlay"
          />

          {/* Shadow Overlay */}
          <div 
            className="absolute bg-gradient-to-b bottom-0 from-[rgba(207,237,252,0)] h-[31px] left-1/2 opacity-30 to-[#054261] translate-x-[-50%] w-[144px] pointer-events-none"
            data-name="Shadow Overlay"
          />

          {/* Metal surface highlight animation on hover - only render when animationType is 'highlight' and card is done */}
          {animationType === 'highlight' && isDone && (
            <div 
              className="metal-shine-overlay"
              style={{
                borderRadius: 'inherit',
              }}
            >
              {/* First gradient highlight */}
              <div
                className="metal-shine-gradient"
                style={{
                  width: '200%',
                  height: '200%',
                  background: 'linear-gradient(135deg, transparent 0%, transparent 20%, rgba(255, 255, 255, 0.4) 40%, rgba(255, 255, 255, 0.8) 20%, rgba(255, 255, 255, 0.4) 40%, transparent 50%, transparent 50%)',
                  transform: 'translateX(-100%) translateY(-100%)',
                  mixBlendMode: 'overlay',
                  position: 'absolute',
                }}
              />
              {/* Trailing gradient highlight - faster and follows the first */}
              <div
                className="metal-shine-trail"
                style={{
                  width: '200%',
                  height: '200%',
                  background: 'linear-gradient(135deg, transparent 0%, transparent 20%, rgba(255, 255, 255, 0.3) 40%, rgba(255, 255, 255, 0.6) 20%, rgba(255, 255, 255, 0.3) 40%, transparent 50%, transparent 50%)',
                  transform: 'translateX(-100%) translateY(-100%)',
                  mixBlendMode: 'overlay',
                  position: 'absolute',
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Breathing animation: Two duplicate envelopes behind original (only when animationType is 'breathing' or '3d' and card is done) */}
      {(animationType === 'breathing' || animationType === '3d') && isDone && (
        <>
          {/* First duplicate envelope - hue +15 */}
          <div 
            className="content-stretch flex flex-col items-start absolute shrink-0 w-[168px] breathing-envelope-duplicate breathing-envelope-1"
            style={{ 
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 0,
              filter: 'blur(30px) hue-rotate(60deg)',
              opacity: isHovered ? 0.6 : 0,
              transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              pointerEvents: 'none'
            }}
          >
            {/* Flap (top) */}
            <div className="h-[97px] relative shrink-0 w-[168px] overflow-visible">
              <div 
                className="absolute bottom-0 left-0 right-0 top-[2.39%]"
                style={{
                  filter: flapFilter,
                  opacity: flapOpacity
                }}
              >
                <img alt="" className="block max-w-none size-full" src={imgFlap} />
              </div>
            </div>
            {/* Box (main container) */}
            <div 
              className="border-[0px] border-[rgba(255,255,255,0)] border-solid h-[105px] min-w-[168px] relative shrink-0 w-full overflow-hidden"
              style={{
                borderRadius: '0 0 32px 32px',
                transform: 'translateY(-0.5px)'
              }}
            >
              <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ borderRadius: '0 0 32px 32px' }}>
                <div 
                  className="absolute inset-0"
                  style={{ 
                    borderRadius: '0 0 32px 32px',
                    backgroundColor: boxColor,
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
            </div>
          </div>
          {/* Second duplicate envelope - hue -15 */}
          <div 
            className="content-stretch flex flex-col items-start absolute shrink-0 w-[168px] breathing-envelope-duplicate breathing-envelope-2"
            style={{ 
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 0,
              filter: 'blur(20px) hue-rotate(-60deg)',
              opacity: isHovered ? 0.4 : 0,
              transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              pointerEvents: 'none'
            }}
          >
            {/* Flap (top) */}
            <div className="h-[97px] relative shrink-0 w-[168px] overflow-visible">
              <div 
                className="absolute bottom-0 left-0 right-0 top-[2.39%]"
                style={{
                  filter: flapFilter,
                  opacity: flapOpacity
                }}
              >
                <img alt="" className="block max-w-none size-full" src={imgFlap} />
              </div>
            </div>
            {/* Box (main container) */}
            <div 
              className="border-[0px] border-[rgba(255,255,255,0)] border-solid h-[105px] min-w-[168px] relative shrink-0 w-full overflow-hidden"
              style={{
                borderRadius: '0 0 32px 32px',
                transform: 'translateY(-0.5px)'
              }}
            >
              <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ borderRadius: '0 0 32px 32px' }}>
                <div 
                  className="absolute inset-0"
                  style={{ 
                    borderRadius: '0 0 32px 32px',
                    backgroundColor: boxColor,
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
            </div>
          </div>
        </>
      )}

      {/* Envelope Container - second highest z-index */}
      <div 
        className="content-stretch flex flex-col items-start relative shrink-0 w-[168px]" 
        data-name="Envelope"
        style={{ 
          zIndex: 2,
          ...(isHovered && animationType === '3d' ? {
            transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translate(${parallaxX}px, ${parallaxY}px) scale(${1.02 * depthScale})`,
            transformStyle: 'preserve-3d',
            filter: `brightness(${brightnessShift}) blur(${depthBlur}px)`,
            transition: 'transform 0.15s ease-out, filter 0.15s ease-out'
          } : {
            transform: isHovered
              ? `translate(${parallaxX}px, ${parallaxY}px) scale(1.02)`
              : 'translate(0px, 0px) scale(1)',
            filter: 'none',
            transition: 'transform 0.3s ease-out'
          }),
          transformOrigin: 'center center'
        }}
      >
        {/* 4. Edge highlighting: brighter edges when facing light (only in 3D mode) */}
        {isHovered && animationType === '3d' && edgeHighlightIntensity > 0 && (
          <>
            {/* Top edge highlight */}
            <div 
              className="absolute top-0 left-0 right-0 pointer-events-none"
              style={{
                height: '2px',
                background: `linear-gradient(to right, transparent 0%, rgba(255, 255, 255, ${edgeHighlightIntensity}) 50%, transparent 100%)`,
                mixBlendMode: 'overlay',
                zIndex: 10,
                transition: 'opacity 0.15s ease-out'
              }}
            />
            {/* Left edge highlight */}
            <div 
              className="absolute top-0 bottom-0 left-0 pointer-events-none"
              style={{
                width: '2px',
                background: `linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, ${edgeHighlightIntensity}) 50%, transparent 100%)`,
                mixBlendMode: 'overlay',
                zIndex: 10,
                transition: 'opacity 0.15s ease-out'
              }}
            />
          </>
        )}
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
              opacity: isHovered ? 0.7 : 0.75,
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
              className="absolute h-[31.25px] left-[6.55%] mix-blend-soft-light right-[6.72%] top-0 pointer-events-none"
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
              style={{
                opacity: isDone ? 0.2 : 1
              }}
            >
              <div 
                className="absolute inset-[-118.52%_-23.53%]"
                style={{
                  filter: shadowColorFilter
                }}
              >
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
            className="absolute bottom-0 left-0 right-0 top-[2%]"
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

