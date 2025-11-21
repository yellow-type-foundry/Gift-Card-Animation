'use client'

import React, { useMemo, useState, useEffect } from 'react'
import useProgressAnimation from '@/hooks/useProgressAnimation'
import useHover from '@/hooks/useHover'
import useHoverColor from '@/hooks/useHoverColor'
import { GIFT_BOX_TOKENS, calculateProgressBarMaxWidth, calculateProgressBarWidth } from '@/constants/giftBoxTokens'
import ProgressBar from '@/components/sent-card/ProgressBar'
import { hexToHsl } from '@/utils/colors'

const GiftBoxContainer = ({
  progress = { current: 4, total: 5 },
  boxColor = '#1987C7', // Columbia blue as default (replaces old placeholder blue)
  isHovered: externalIsHovered,
  logoPath = '/assets/GiftSent/Gift Container/9bc812442d8f2243c9c74124dd128a8df145f983.svg',
  logoBrandColor = null,
  animationType = 'highlight' // 'highlight', 'breathing', or 'none'
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
      {/* Breathing animation: Two duplicate boxes behind original (only when animationType is 'breathing') */}
      {animationType === 'breathing' && (
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
              filter: 'blur(20px) hue-rotate(35deg)',
              opacity: 0,
              pointerEvents: 'none'
            }}
          >
            {/* Duplicate box content */}
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ borderRadius: GIFT_BOX_TOKENS.box.borderRadius }}>
              <div 
                className="absolute inset-0"
                style={{ 
                  borderRadius: GIFT_BOX_TOKENS.box.borderRadius,
                  backgroundColor: hoverBoxColor,
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
              transform: 'translate(-50%, -50%)',
              zIndex: 0,
              filter: 'blur(20px) hue-rotate(-35deg)',
              opacity: 0,
              pointerEvents: 'none'
            }}
          >
            {/* Duplicate box content */}
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ borderRadius: GIFT_BOX_TOKENS.box.borderRadius }}>
              <div 
                className="absolute inset-0"
                style={{ 
                  borderRadius: GIFT_BOX_TOKENS.box.borderRadius,
                  backgroundColor: hoverBoxColor,
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
          transform: isHovered ? `translateY(${GIFT_BOX_TOKENS.hoverEffects.transform.translateY}) scale(1.0125)` : 'translateY(0) scale(1)',
          transition: `transform ${GIFT_BOX_TOKENS.animations.duration.fast} ${GIFT_BOX_TOKENS.animations.easing.easeOut}`,
          zIndex: 1,
          transformOrigin: 'center center'
        }}
        data-name="Box"
        data-animation-type={animationType}
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
          {/* Metal surface highlight animation on hover */}
          <div 
            className="metal-shine-overlay"
            style={{
              borderRadius: GIFT_BOX_TOKENS.box.borderRadius,
            }}
          >
            <div
              className="metal-shine-gradient"
              style={{
                width: '200%',
                height: '200%',
                background: 'linear-gradient(135deg, transparent 0%, transparent 20%, rgba(255, 255, 255, 0.4) 40%, rgba(255, 255, 255, 0.8) 20%, rgba(255, 255, 255, 0.4) 40%, transparent 50%, transparent 50%)',
                transform: 'translateX(-100%) translateY(-100%)',
                mixBlendMode: 'overlay',
              }}
            />
          </div>
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
                mixBlendMode: GIFT_BOX_TOKENS.blendModes.overlay,
                paddingTop: '18px'
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

