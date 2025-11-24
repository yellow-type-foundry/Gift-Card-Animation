'use client'

import React, { useMemo, useState, useEffect } from 'react'
import useProgressAnimation from '@/hooks/useProgressAnimation'
import useHover from '@/hooks/useHover'
import useHoverColor from '@/hooks/useHoverColor'
import { GIFT_BOX_TOKENS, calculateProgressBarMaxWidth, calculateProgressBarWidth } from '@/constants/giftBoxTokens'
import ProgressBar from '@/components/sent-card/ProgressBar'
import { hexToHsl, hslToHex } from '@/utils/colors'

const GiftBoxContainer = ({
  progress = { current: 4, total: 5 },
  boxColor = '#1987C7', // Columbia blue as default (replaces old placeholder blue)
  progressBarSourceColor, // Original color (before S/L) for hue extraction
  progressBarLuminance = 60, // Luminance for progress bar indicator (0-100)
  progressBarSaturation = 40, // Saturation for progress bar indicator (0-100)
  isHovered: externalIsHovered,
  logoPath = '/assets/GiftSent/Gift Container/9bc812442d8f2243c9c74124dd128a8df145f983.svg',
  logoBrandColor = null,
  animationType = 'highlight', // 'highlight', 'breathing', or 'none'
  enable3D = false, // Standalone 3D toggle that works with highlight or breathing
  parallaxX = 0, // Parallax offset X for tilt effect
  parallaxY = 0, // Parallax offset Y for tilt effect
  tiltX = 0, // Tilt X angle for 3D effect
  tiltY = 0, // Tilt Y angle for 3D effect
  hideProgressBar = false, // Hide progress bar (for Single 1A)
  centerLogo = false // Center logo at the very center of the box (for Single 0)
}) => {
  const { isHovered: internalIsHovered, handleHoverEnter, handleHoverLeave } = useHover()
  // Use external hover state if provided, otherwise use internal
  const isHovered = externalIsHovered !== undefined ? externalIsHovered : internalIsHovered

  // Load SVG content and inject gradient
  const [svgContent, setSvgContent] = useState(null)
  const gradientId = useMemo(() => {
    const logoKey = logoPath.replace(/[^a-zA-Z0-9]/g, '-')
    const colorKey = logoBrandColor ? logoBrandColor.replace(/[^a-zA-Z0-9]/g, '-') : 'default'
    return `logo-gradient-${logoKey}-${colorKey}`
  }, [logoPath, logoBrandColor])

  useEffect(() => {
    fetch(logoPath)
      .then(res => res.text())
      .then(svg => {
        // Parse SVG and inject gradient definition
        const parser = new DOMParser()
        const svgDoc = parser.parseFromString(svg, 'image/svg+xml')
        const svgElement = svgDoc.querySelector('svg')
        
        if (svgElement) {
          // Ensure SVG is properly sized and centered
          // Set fixed height for specific logos based on logoPath
          let fixedHeight = 'auto'
          if (logoPath.includes('Goody.svg')) {
            fixedHeight = '40px'
          } else if (logoPath.includes('Chipotle.svg')) {
            fixedHeight = '46px'
          } else if (logoPath.includes('Apple.svg')) {
            fixedHeight = '40px'
          } else if (logoPath.includes('Nike.svg')) {
            fixedHeight = '24px'
          } else if (logoPath.includes('Supergoop.svg')) {
            fixedHeight = '40px'
          } else if (logoPath.includes('Tiffany & Co.svg')) {
            fixedHeight = '16px'
          } else if (logoPath.includes('Logo.svg')) { // Columbia
            fixedHeight = '20px'
          }
          
          svgElement.setAttribute('width', '100%')
          svgElement.setAttribute('height', '100%')
          svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet')
          svgElement.setAttribute('style', `display: block; margin: 0 auto; width: auto; height: ${fixedHeight};`)
          
          // Create gradient definition
          const defs = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'defs')
          const gradient = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
          gradient.setAttribute('id', gradientId)
          gradient.setAttribute('x1', '0%')
          gradient.setAttribute('y1', '0%')
          gradient.setAttribute('x2', '0%')
          gradient.setAttribute('y2', '100%')
          
          // All SVGs use the same gradient: white to light gray
          const gradientTopColor = '#FFFFFF' // White at top (0%)
          const gradientBottomColor = '#E0E0E0' // Light gray at bottom (100%)
          
          const stop1 = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'stop')
          stop1.setAttribute('offset', '0%')
          stop1.setAttribute('stop-color', gradientTopColor)
          stop1.setAttribute('stop-opacity', '1')
          
          const stop2 = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'stop')
          stop2.setAttribute('offset', '100%')
          stop2.setAttribute('stop-color', gradientBottomColor)
          stop2.setAttribute('stop-opacity', '1')
          
          gradient.appendChild(stop1)
          gradient.appendChild(stop2)
          defs.appendChild(gradient)
          
          // Insert defs at the beginning of SVG
          if (svgElement.firstChild) {
            svgElement.insertBefore(defs, svgElement.firstChild)
          } else {
            svgElement.appendChild(defs)
          }
          
          // Apply gradient to all paths
          const paths = svgElement.querySelectorAll('path')
          paths.forEach(path => {
            path.setAttribute('fill', `url(#${gradientId})`)
          })
          
          // Get the modified SVG as string
          const serializer = new XMLSerializer()
          setSvgContent(serializer.serializeToString(svgElement))
        }
      })
      .catch(err => {
        console.error('Failed to load SVG:', err)
        setSvgContent(null)
      })
  }, [logoPath, gradientId, logoBrandColor])

  // Calculate hover and shadow colors using reusable hook
  const { hoverColor: hoverBoxColor, shadowColor: themedShadowColor } = useHoverColor(boxColor, isHovered)
  
  // Create gradient for Single 2 box: brand color to brand color -15 luminance (top to bottom)
  // Use hoverBoxColor when hovered to maintain hover effects
  const boxGradient = useMemo(() => {
    const colorToUse = hoverBoxColor // Use hover color which already has hover effects applied
    const [h, s, l] = hexToHsl(colorToUse)
    const darkerL = Math.max(0, l - 7) // Second stop: -15 luminance
    const darkerColor = hslToHex(h, s, darkerL)
    return `linear-gradient(to bottom, ${colorToUse} 0%, ${darkerColor} 100%)`
  }, [hoverBoxColor])

  // Calculate lighter color for breathing duplicate boxes (L + 10)
  const breathingBoxColor = useMemo(() => {
    const [h, s, l] = hexToHsl(hoverBoxColor)
    const lighterL = Math.min(100, l + 10) // Increase L by 10 for breathing boxes
    return hslToHex(h, s, lighterL)
  }, [hoverBoxColor])
  
  // Progress bar indicator color - uses unified S/L values
  const progressIndicatorColor = useMemo(() => {
    // Create progress bar color using unified saturation and luminance values
    // Extract hue from original source color (before S/L was applied), then apply exact progress bar S/L values
    // progressBarSourceColor should always be provided from parent - it's the original brand/dominant color before S/L
    if (!progressBarSourceColor) {
      console.warn('progressBarSourceColor not provided, using fallback')
    }
    const sourceColor = progressBarSourceColor || '#1987C7' // Use original color, not boxColor which has S/L applied
    const [h, s, l] = hexToHsl(sourceColor)
    const adjustedS = Math.min(100, Math.max(0, progressBarSaturation)) // Use exact progress bar saturation
    const adjustedL = Math.min(100, Math.max(0, progressBarLuminance)) // Use exact progress bar luminance
    return hslToHex(h, adjustedS, adjustedL)
  }, [progressBarSourceColor, progressBarLuminance, progressBarSaturation])

  // Dynamic shadow calculations based on tilt angle and cursor position (for 3D effect)
  // Shadow moves opposite to tilt direction and cursor position (like a light source), becomes more elongated, and opacity changes
  const shadowOffsetX = useMemo(() => {
    if (!isHovered || !enable3D || (animationType !== 'highlight' && animationType !== 'breathing')) return 0
    // Shadow moves opposite to tiltY (when tilted right, shadow moves left)
    const tiltOffset = -tiltY * 2 // 2px per degree
    // Shadow also moves opposite to cursor X position (when cursor is right, shadow moves left)
    // Use parallaxX as a proxy for cursor position (negative because shadow moves opposite)
    const cursorOffset = -parallaxX * 0.8 // Scale down parallax for shadow movement
    return tiltOffset + cursorOffset
  }, [isHovered, animationType, tiltY, parallaxX])

  const shadowOffsetY = useMemo(() => {
    if (!isHovered || !enable3D || (animationType !== 'highlight' && animationType !== 'breathing')) return 0
    // Shadow moves opposite to tiltX (when tilted down, shadow moves up)
    const tiltOffset = -tiltX * 2 // 2px per degree
    // Shadow also moves opposite to cursor Y position (when cursor is down, shadow moves up)
    // Use parallaxY as a proxy for cursor position (negative because shadow moves opposite)
    const cursorOffset = -parallaxY * 0.8 // Scale down parallax for shadow movement
    return tiltOffset + cursorOffset
  }, [isHovered, animationType, tiltX, parallaxY])

  const shadowScaleX = useMemo(() => {
    if (!isHovered || !enable3D || (animationType !== 'highlight' && animationType !== 'breathing')) return 1
    // Shadow becomes more elongated when tilted
    // Calculate based on tilt angle magnitude
    const tiltMagnitude = Math.sqrt(tiltX * tiltX + tiltY * tiltY)
    return 1 + (tiltMagnitude / 6) * 0.3 // Up to 30% elongation
  }, [isHovered, animationType, tiltX, tiltY])

  const shadowScaleY = useMemo(() => {
    if (!isHovered || !enable3D || (animationType !== 'highlight' && animationType !== 'breathing')) return 1
    // Shadow becomes slightly compressed when tilted
    const tiltMagnitude = Math.sqrt(tiltX * tiltX + tiltY * tiltY)
    return 1 - (tiltMagnitude / 6) * 0.1 // Up to 10% compression
  }, [isHovered, animationType, tiltX, tiltY])

  const shadowOpacity = useMemo(() => {
    if (!isHovered) return GIFT_BOX_TOKENS.hoverEffects.boxShadowOpacity.default
    if (!enable3D || (animationType !== 'highlight' && animationType !== 'breathing')) return GIFT_BOX_TOKENS.hoverEffects.boxShadowOpacity.hover
    // Shadow opacity increases when tilted (more dramatic)
    const tiltMagnitude = Math.sqrt(tiltX * tiltX + tiltY * tiltY)
    const baseOpacity = GIFT_BOX_TOKENS.hoverEffects.boxShadowOpacity.hover
    return Math.min(1, baseOpacity + (tiltMagnitude / 6) * 0.2) // Up to 20% more opacity
  }, [isHovered, animationType, tiltX, tiltY])

  // 2. Depth-based scale: scale down when tilted away, scale up when tilted toward viewer
  const depthScale = useMemo(() => {
    if (!isHovered || !enable3D || (animationType !== 'highlight' && animationType !== 'breathing')) return 1
    // Calculate perceived distance based on tilt (negative tiltX = tilted away)
    // When tilted away (positive tiltX), scale down; when tilted toward (negative tiltX), scale up
    const distanceFactor = -tiltX / 6 // Normalize to -1 to 1 range
    return 1 + distanceFactor * 0.05 // Up to 5% scale change
  }, [isHovered, animationType, tiltX])

  // 3. Lighting/brightness shifts: brighter when tilted toward light, darker when away
  const brightnessShift = useMemo(() => {
    if (!isHovered || !enable3D || (animationType !== 'highlight' && animationType !== 'breathing')) return 1
    // Light source is from top-left, so negative tiltX (tilted up) and negative tiltY (tilted left) = brighter
    const lightFactor = (-tiltX - tiltY) / 12 // Normalize to -1 to 1 range
    return 1 + lightFactor * 0.15 // Up to 15% brightness change
  }, [isHovered, animationType, tiltX, tiltY])

  // 4. Edge highlighting: brighter edges when facing light
  const edgeHighlightIntensity = useMemo(() => {
    if (!isHovered || !enable3D || (animationType !== 'highlight' && animationType !== 'breathing')) return 0
    // Top and left edges are brighter when facing light
    const topEdgeFactor = Math.max(0, -tiltX / 6) // Top edge (negative tiltX = facing up)
    const leftEdgeFactor = Math.max(0, -tiltY / 6) // Left edge (negative tiltY = facing left)
    return Math.max(topEdgeFactor, leftEdgeFactor) * 0.6 // Up to 60% intensity
  }, [isHovered, animationType, tiltX, tiltY])

  // 5. Perspective blur (depth of field): blur when tilted away from viewer
  const depthBlur = useMemo(() => {
    if (!isHovered || !enable3D || (animationType !== 'highlight' && animationType !== 'breathing')) return 0
    // Blur increases when tilted away (positive tiltX)
    const blurFactor = Math.max(0, tiltX / 6) // 0 to 1 range
    return blurFactor * 2 // Up to 2px blur
  }, [isHovered, animationType, tiltX])
  
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
      {/* Breathing animation: Two duplicate boxes behind original (only when animationType is 'breathing' and card is done) */}
      {animationType === 'breathing' && isDone && (
        <>
          {/* First duplicate box - hue +15 */}
          <div 
            className="border-[0.5px] border-[rgba(255,255,255,0)] border-solid absolute shrink-0 overflow-hidden breathing-box-duplicate breathing-box-1"
            style={{ 
              width: GIFT_BOX_TOKENS.box.width, 
              height: GIFT_BOX_TOKENS.box.height,
              borderRadius: GIFT_BOX_TOKENS.box.borderRadius,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 0,
              filter: 'blur(30px) hue-rotate(35deg)',
              opacity: isHovered ? 0.8 : 0,
              transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              pointerEvents: 'none'
            }}
          >
            {/* Duplicate box content */}
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ borderRadius: GIFT_BOX_TOKENS.box.borderRadius }}>
              <div 
                className="absolute inset-0"
                style={{ 
                  borderRadius: GIFT_BOX_TOKENS.box.borderRadius,
                  backgroundColor: breathingBoxColor,
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
          </div>
          {/* Second duplicate box - hue -15 */}
          <div 
            className="border-[0.5px] border-[rgba(255,255,255,0)] border-solid absolute shrink-0 overflow-hidden breathing-box-duplicate breathing-box-2"
            style={{ 
              width: GIFT_BOX_TOKENS.box.width, 
              height: GIFT_BOX_TOKENS.box.height,
              borderRadius: GIFT_BOX_TOKENS.box.borderRadius,
              left: '50%',
              top: '50%',
              scale: 1.05,
              transform: 'translate(-50%, -50%)',
              zIndex: 0,
              filter: 'blur(20px) hue-rotate(-35deg)',
              opacity: isHovered ? 0.5 : 0,
              transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              pointerEvents: 'none'
            }}
          >
            {/* Duplicate box content */}
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ borderRadius: GIFT_BOX_TOKENS.box.borderRadius }}>
              <div 
                className="absolute inset-0"
                style={{ 
                  borderRadius: GIFT_BOX_TOKENS.box.borderRadius,
                  backgroundColor: breathingBoxColor,
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
          </div>
        </>
      )}
      <div 
        className="border-[0.5px] border-[rgba(255,255,255,0)] border-solid relative shrink-0 overflow-hidden"
        style={{ 
          width: GIFT_BOX_TOKENS.box.width, 
          height: GIFT_BOX_TOKENS.box.height,
          borderRadius: GIFT_BOX_TOKENS.box.borderRadius,
          ...(isHovered && enable3D && (animationType === 'highlight' || animationType === 'breathing') ? {
            transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translate(${parallaxX}px, ${parallaxY}px) translateY(${GIFT_BOX_TOKENS.hoverEffects.transform.translateY}) scale(${1.0125 * depthScale})`,
            transformStyle: 'preserve-3d',
            filter: `brightness(${brightnessShift}) blur(${depthBlur}px)`,
            transition: 'transform 0.15s ease-out, filter 0.15s ease-out'
          } : {
            transform: isHovered
              ? `translateY(${GIFT_BOX_TOKENS.hoverEffects.transform.translateY}) scale(1.0125)`
              : `translateY(0) scale(1)`,
            filter: 'none',
            transition: isHovered
              ? `transform 0.15s ease-out`
              : `transform 0.3s ease-out`
          }),
          zIndex: 1,
          transformOrigin: 'center center'
        }}
        data-name="Box"
        data-animation-type={animationType}
      >
        {/* 4. Edge highlighting: brighter edges when facing light (only in 3D mode) */}
        {isHovered && enable3D && (animationType === 'highlight' || animationType === 'breathing') && edgeHighlightIntensity > 0 && (
          <>
            {/* Top edge highlight */}
            <div 
              className="absolute top-0 left-0 right-0 pointer-events-none"
              style={{
                height: '2px',
                background: `linear-gradient(to right, transparent 0%, rgba(255, 255, 255, ${edgeHighlightIntensity}) 50%, transparent 100%)`,
                mixBlendMode: 'overlay',
                zIndex: 10,
                borderRadius: `${GIFT_BOX_TOKENS.box.borderRadius} ${GIFT_BOX_TOKENS.box.borderRadius} 0 0`,
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
                borderRadius: `${GIFT_BOX_TOKENS.box.borderRadius} 0 0 ${GIFT_BOX_TOKENS.box.borderRadius}`,
                transition: 'opacity 0.15s ease-out'
              }}
            />
          </>
        )}
        {/* Base background and gradient overlay */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ borderRadius: GIFT_BOX_TOKENS.box.borderRadius }}>
          <div 
            className="absolute inset-0"
            style={{ 
              borderRadius: GIFT_BOX_TOKENS.box.borderRadius,
              background: boxGradient,
              transition: `background ${GIFT_BOX_TOKENS.animations.duration.fast} ${GIFT_BOX_TOKENS.animations.easing.easeOut}`
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
          {/* Metal surface highlight animation on hover - only render when animationType is 'highlight' and card is done */}
          {animationType === 'highlight' && isDone && (
            <div 
              className="metal-shine-overlay"
              style={{
                borderRadius: GIFT_BOX_TOKENS.box.borderRadius,
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

        {/* Inner content container */}
        <div className={`content-stretch flex flex-col ${centerLogo ? 'items-center justify-center' : 'items-start'} overflow-hidden relative rounded-[inherit] w-full h-full`} style={{ width: GIFT_BOX_TOKENS.box.width, height: GIFT_BOX_TOKENS.box.height }}>
          {/* Logo Container (top, flex-grow) */}
          <div 
            className={`${centerLogo ? 'flex-1' : 'basis-0'} box-border content-stretch flex flex-col ${centerLogo ? 'justify-center' : ''} ${centerLogo ? '' : 'grow'} items-center min-h-px min-w-px relative shrink-0 w-full`}
            style={{
              paddingLeft: centerLogo ? 0 : GIFT_BOX_TOKENS.logo.containerPadding.horizontal,
              paddingRight: centerLogo ? 0 : GIFT_BOX_TOKENS.logo.containerPadding.horizontal,
              paddingTop: centerLogo ? 0 : GIFT_BOX_TOKENS.logo.containerPadding.vertical,
              paddingBottom: centerLogo ? 0 : GIFT_BOX_TOKENS.logo.containerPadding.vertical,
              ...(enable3D && (animationType === 'highlight' || animationType === 'breathing') && isHovered
                ? {
                    transform: `perspective(1000px) rotateX(${tiltX * 0.05}deg) rotateY(${tiltY * 0.05}deg) translate(${parallaxX * 0.07}px, ${parallaxY * 0.07}px) scale(${1 * depthScale})`,
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.15s ease-out'
                  }
                : {})
            }}
            data-name="Logo Container"
          >
            {/* Logo with text emboss style */}
            <div 
              className={`relative shrink-0 ${enable3D && (animationType === 'highlight' || animationType === 'breathing') ? '' : 'mix-blend-overlay'}`}
              style={{ 
                width: GIFT_BOX_TOKENS.logo.width,
                height: GIFT_BOX_TOKENS.logo.height,
                transform: centerLogo ? 'scale(1.4)' : 'none',
                mixBlendMode: enable3D && (animationType === 'highlight' || animationType === 'breathing') ? 'normal' : GIFT_BOX_TOKENS.blendModes.overlay,
                paddingTop: '18px',
                transition: 'mix-blend-mode 0.2s ease-out' // Smooth transition between blend modes
              }}
              data-name="Logo"  
            >
              <div className="absolute inset-[-12.66%_-1.84%_-9.28%_-1.84%] flex items-center justify-center">
                {svgContent ? (
                  <div
                    className="block"
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      filter: 'drop-shadow(0 0.557046px 0.742728px rgba(0, 0, 0, 0.5)) drop-shadow(0 -0.557046px 1.11409px rgba(255, 255, 255, 0.5))'
                    }}
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                  />
                ) : (
                  <img 
                    alt="" 
                    className="block max-w-none size-full"
                    src={logoPath}
                    style={{ 
                      display: 'block', 
                      width: 'auto', 
                      height: (() => {
                        if (logoPath.includes('Goody.svg')) return '40px'
                        if (logoPath.includes('Chipotle.svg')) return '46px'
                        if (logoPath.includes('Apple.svg')) return '40px'
                        if (logoPath.includes('Nike.svg')) return '24px'
                        if (logoPath.includes('Supergoop.svg')) return '40px'
                        if (logoPath.includes('Tiffany & Co.svg')) return '16px'
                        if (logoPath.includes('Logo.svg')) return '20px' // Columbia
                        return 'auto'
                      })()
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar (bottom, fixed) */}
          {!hideProgressBar && (
            <ProgressBar
              progress={progress}
              boxColor={hoverBoxColor}
              indicatorColor={progressIndicatorColor}
              progressBarWidth={progressBarWidth}
              animatedCurrent={animatedCurrent}
              validatedProgress={validatedProgress}
              isDone={isDone}
              themedShadowColor={themedShadowColor}
            />
          )}

          {/* 6. Enhanced Specular Highlight - more directional and responsive to tilt */}
          <div 
            className="absolute top-0 pointer-events-none"
            style={{
              left: GIFT_BOX_TOKENS.effects.specularHighlight.horizontalOffset,
              right: GIFT_BOX_TOKENS.effects.specularHighlight.horizontalOffset,
              height: GIFT_BOX_TOKENS.effects.specularHighlight.height,
              mixBlendMode: GIFT_BOX_TOKENS.blendModes.softLight,
              ...(isHovered && enable3D && (animationType === 'highlight' || animationType === 'breathing') ? {
                opacity: 0.6 + edgeHighlightIntensity * 0.4, // More intense when facing light
                transform: `translate(${-tiltY * 0.5}px, ${-tiltX * 0.5}px)`, // Slight movement based on tilt
                transition: 'opacity 0.15s ease-out, transform 0.15s ease-out'
              } : {
                opacity: 0.6,
                transition: 'opacity 0.15s ease-out'
              })
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

    </div>
  )
}

export default React.memo(GiftBoxContainer)

