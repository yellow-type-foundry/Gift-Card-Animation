'use client'

import React, { useState, useEffect, useMemo, memo } from 'react'
import { makeThemedColor, makeVibrantColor } from '@/utils/colors'
import { BOX_WIDTH, BOX_HEIGHT, BOX_RADIUS, STATIC_STYLES, LOGO_HEIGHTS } from '@/constants/layout3Tokens'
import { useBlobColors } from '@/hooks/useBlobColors'
import { useDotAnimation } from '@/hooks/useDotAnimation'
import ProgressBlobs from '@/components/layout3/ProgressBlobs'
import HaloGlow from '@/components/layout3/HaloGlow'
import ShadowContainer from '@/components/layout3/ShadowContainer'

/**
 * Layout3Box - A themed box component with gradient effects, shadows, and dynamic theming
 * @param {string} boxColor - The base color for theming (default: '#1987C7')
 * @param {string} logoPath - Path to the logo SVG file (default: '/assets/GiftSent/SVG Logo/Apple.svg')
 * @param {object} progress - Progress object with current and total (default: { current: 1, total: 25 })
 * @param {string} className - Additional CSS classes for the root container
 * @param {object} style - Additional inline styles for the root container
 */
const Layout3Box = ({ boxColor = '#1987C7', logoPath = '/assets/GiftSent/SVG Logo/Apple.svg', progress = { current: 1, total: 25 }, className = '', style = {} }) => {
  const [lightCornerSvg, setLightCornerSvg] = useState(null)
  const [logoSvg, setLogoSvg] = useState(null)
  const [isHovered, setIsHovered] = useState(false)

  // Base color from prop - used for all themed colors
  const baseColor = boxColor

  // Use custom hooks for blob colors and dot animation
  const { blobGridColors, blobAnimations } = useBlobColors(baseColor)

  // Calculate progress ratio and circle size
  const progressRatio = useMemo(() => {
    return progress.current / progress.total
  }, [progress])

  const circleSize = useMemo(() => {
    const padding = 1
    const gap = 1
    const availableWidth = BOX_WIDTH - (padding * 2)
    const availableHeight = BOX_HEIGHT - (padding * 2)
    const totalGapWidth = gap * 2
    const totalGapHeight = gap * 2
    
    const maxCircleWidth = (availableWidth - totalGapWidth) / 3
    const maxCircleHeight = (availableHeight - totalGapHeight) / 3
    const maxSize = Math.min(maxCircleWidth, maxCircleHeight)
    
    const minSize = 8
    return minSize + (maxSize - minSize) * progressRatio
  }, [progressRatio])

  // Use dot animation hook
  const dotPositions = useDotAnimation(blobAnimations, isHovered, circleSize)

  // Themed colors
  const lightRimColor = useMemo(() => makeThemedColor(baseColor, 10), [baseColor])
  const vibrantShadowColor = useMemo(() => makeVibrantColor(baseColor, 50), [baseColor])
  const darkRimColor = useMemo(() => makeThemedColor(baseColor, -1), [baseColor])
  const darkRimShadowColor = useMemo(() => makeThemedColor(baseColor, -30), [baseColor])
  const darkRim2BorderColor = useMemo(() => makeThemedColor(baseColor, -35).rgba(0.4), [baseColor])

  // Load and parse SVG for Light Corner to enable CSS styling
  useEffect(() => {
    fetch('/assets/placeholder-light-corner.svg')
      .then(res => res.text())
      .then(svgText => {
        const parser = new DOMParser()
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml')
        const svgElement = svgDoc.querySelector('svg')
        
        if (svgElement) {
          const gradientId = 'lightCornerGradient'
          const defs = svgElement.querySelector('defs') || svgDoc.createElementNS('http://www.w3.org/2000/svg', 'defs')
          if (!svgElement.querySelector('defs')) {
            svgElement.insertBefore(defs, svgElement.firstChild)
          }
          
          let gradient = defs.querySelector(`#${gradientId}`)
          if (!gradient) {
            gradient = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
            gradient.setAttribute('id', gradientId)
            gradient.setAttribute('x1', '0%')
            gradient.setAttribute('y1', '0%')
            gradient.setAttribute('x2', '100%')
            gradient.setAttribute('y2', '100%')
            defs.appendChild(gradient)
          }
          
          const stops = gradient.querySelectorAll('stop')
          if (stops.length === 0) {
            const stop1 = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'stop')
            stop1.setAttribute('offset', '0%')
            stop1.setAttribute('stop-color', 'rgba(0, 0, 0, 0)')
            gradient.appendChild(stop1)
            
            const stop2 = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'stop')
            stop2.setAttribute('offset', '100%')
            stop2.setAttribute('stop-color', lightRimColor.rgba(0.5))
            gradient.appendChild(stop2)
          }
          
          const paths = svgElement.querySelectorAll('path')
          paths.forEach(path => {
            path.setAttribute('fill', `url(#${gradientId})`)
          })
          
          setLightCornerSvg(svgElement.outerHTML)
        }
      })
      .catch(err => {
        console.warn('Light Corner SVG not found, using placeholder:', err)
        setLightCornerSvg(`
          <svg width="100" height="90" viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lightCornerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="rgba(0, 0, 0, 0)" />
                <stop offset="100%" stop-color="${lightRimColor.rgba(0.5)}" />
              </linearGradient>
            </defs>
            <path d="M 20 10 Q 30 5, 50 8 Q 70 10, 80 20 Q 85 30, 75 40 Q 65 50, 50 60 Q 35 70, 20 65 Q 10 60, 8 45 Q 5 30, 20 10 Z" fill="url(#lightCornerGradient)" />
          </svg>
        `)
      })
  }, [lightRimColor])

  // Load and parse SVG for logo to add white gradient
  useEffect(() => {
    fetch(logoPath)
      .then(res => res.text())
      .then(svgText => {
        const parser = new DOMParser()
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml')
        const svgElement = svgDoc.querySelector('svg')
        
        if (svgElement) {
          const gradientId = 'logoWhiteGradient'
          const defs = svgElement.querySelector('defs') || svgDoc.createElementNS('http://www.w3.org/2000/svg', 'defs')
          if (!svgElement.querySelector('defs')) {
            svgElement.insertBefore(defs, svgElement.firstChild)
          }
          
          let gradient = defs.querySelector(`#${gradientId}`)
          if (!gradient) {
            gradient = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
            gradient.setAttribute('id', gradientId)
            gradient.setAttribute('x1', '0%')
            gradient.setAttribute('y1', '0%')
            gradient.setAttribute('x2', '0%')
            gradient.setAttribute('y2', '100%')
            defs.appendChild(gradient)
          }
          
          const stops = gradient.querySelectorAll('stop')
          stops.forEach(stop => stop.remove())
          
          const stop1 = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'stop')
          stop1.setAttribute('offset', '0%')
          stop1.setAttribute('stop-color', 'rgba(255, 255, 255, 1)')
          stop1.setAttribute('stop-opacity', '1')
          gradient.appendChild(stop1)
          
          const stop2 = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'stop')
          stop2.setAttribute('offset', '100%')
          stop2.setAttribute('stop-color', 'rgba(255, 255, 255, 0.8)')
          stop2.setAttribute('stop-opacity', '0.7')
          gradient.appendChild(stop2)
          
          const paths = svgElement.querySelectorAll('path')
          paths.forEach(path => {
            path.setAttribute('fill', `url(#${gradientId})`)
          })
          
          const allElements = svgElement.querySelectorAll('*')
          allElements.forEach(el => {
            if (el.tagName === 'path' || el.tagName === 'circle' || el.tagName === 'rect' || el.tagName === 'polygon') {
              if (!el.getAttribute('fill') || el.getAttribute('fill') !== 'none') {
                el.setAttribute('fill', `url(#${gradientId})`)
              }
            }
          })
          
          // Add white inner shadow filter
          const filterId = 'logoInnerShadow'
          let filter = defs.querySelector(`#${filterId}`)
          if (!filter) {
            filter = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'filter')
            filter.setAttribute('id', filterId)
            filter.setAttribute('x', '-50%')
            filter.setAttribute('y', '-50%')
            filter.setAttribute('width', '200%')
            filter.setAttribute('height', '200%')
            
            const feGaussianBlur = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur')
            feGaussianBlur.setAttribute('in', 'SourceAlpha')
            feGaussianBlur.setAttribute('stdDeviation', '3')
            feGaussianBlur.setAttribute('result', 'blur')
            filter.appendChild(feGaussianBlur)
            
            const feOffset = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'feOffset')
            feOffset.setAttribute('in', 'blur')
            feOffset.setAttribute('dx', '0')
            feOffset.setAttribute('dy', '0')
            feOffset.setAttribute('result', 'offsetBlur')
            filter.appendChild(feOffset)
            
            const feFlood = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'feFlood')
            feFlood.setAttribute('flood-color', 'rgba(255, 255, 255, 1)')
            feFlood.setAttribute('flood-opacity', '1')
            feFlood.setAttribute('result', 'white')
            filter.appendChild(feFlood)
            
            const feComposite1 = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'feComposite')
            feComposite1.setAttribute('in', 'white')
            feComposite1.setAttribute('in2', 'offsetBlur')
            feComposite1.setAttribute('operator', 'in')
            feComposite1.setAttribute('result', 'innerShadow')
            filter.appendChild(feComposite1)
            
            const feComposite2 = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'feComposite')
            feComposite2.setAttribute('in', 'SourceGraphic')
            feComposite2.setAttribute('in2', 'innerShadow')
            feComposite2.setAttribute('operator', 'over')
            filter.appendChild(feComposite2)
            
            defs.appendChild(filter)
          }
          
          const shapes = svgElement.querySelectorAll('path, circle, rect, polygon')
          shapes.forEach(shape => {
            const currentFilter = shape.getAttribute('filter')
            if (currentFilter) {
              shape.setAttribute('filter', `${currentFilter} url(#${filterId})`)
            } else {
              shape.setAttribute('filter', `url(#${filterId})`)
            }
          })
          
          svgElement.setAttribute('width', '100%')
          svgElement.setAttribute('height', '100%')
          svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet')
          
          setLogoSvg(svgElement.outerHTML)
        }
      })
      .catch(err => {
        console.warn('Logo SVG not found:', err)
      })
  }, [logoPath])

  // Memoize SVG mask string
  const svgMaskString = useMemo(
    () => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${BOX_WIDTH}' height='${BOX_HEIGHT}'%3E%3Crect width='${BOX_WIDTH}' height='${BOX_HEIGHT}' rx='${BOX_RADIUS}' ry='${BOX_RADIUS}' fill='white'/%3E%3C/svg%3E")`,
    []
  )

  // Memoize dynamic style objects
  const gradientOverlayStyle = useMemo(
    () => ({
      position: 'absolute',
      inset: 0,
      opacity: 1,
      background: `linear-gradient(-45deg, rgba(255, 255, 255, 0.975) 0%, ${darkRimColor.rgba(1)} 100%)`,
      mixBlendMode: 'soft-light',
      borderRadius: `${BOX_RADIUS}px`,
    }),
    [darkRimColor]
  )

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
    }),
    [darkRimColor, lightRimColor]
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

  const insetShadowsStyle = useMemo(
    () => ({
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      borderRadius: `${BOX_RADIUS}px`,
      boxShadow: `
        inset 0px -1px 6px 0px ${lightRimColor.rgba(0.5)},
        inset 0px -5px 15px 5px ${lightRimColor.rgba(1)},
        inset 0px 10px 15px 0px ${lightRimColor.rgba(0.5)},
        inset 0px 0px 20px 0px ${lightRimColor.rgba(0.5)},
        inset 4px 4px 15px 0px rgba(255, 255, 255, .5),
        inset 0px 0px 8px 3px rgba(255, 255, 255, 1)
      `,
    }),
    [lightRimColor]
  )

  const progressTextShadowStyle = useMemo(
    () => ({
      position: 'absolute',
      inset: 0,
      transform: 'translateY(1px)',
      color: darkRimShadowColor.rgba(0.65),
      filter: 'blur(1.1px)',
      opacity: .8,
    }),
    [darkRimShadowColor]
  )

  const progressTextGradientStyle = useMemo(
    () => ({
      position: 'relative',
      background: `linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 1) 50%, rgba(255, 255, 255, .9) 100%)`,
      backgroundPosition: '50% 100%',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      color: 'transparent',
      display: 'inline-block',
      textShadow: `
        ${darkRimColor.rgba(.08)} 0px .5px .5px,
        ${lightRimColor.rgba(.05)} 0px -0.5px 1px,
        ${lightRimColor.rgba(.1)} 0px -0.5px .5px
      `,
      filter: `
        drop-shadow(0px 1.5px 8px rgba(255, 255, 255, 0.8))
        drop-shadow(0px 1px 1px ${darkRimColor.rgba(0.2)})
      `,
    }),
    [lightRimColor, darkRimColor]
  )

  const logoImageStyle = useMemo(
    () => ({
      ...STATIC_STYLES.logoImage,
      filter: `
        drop-shadow(0px 0px 4px ${lightRimColor.rgba(0.4)})
        drop-shadow(0px 0px 6px ${lightRimColor.rgba(0.5)})
        drop-shadow(0px 2px 10px rgba(255, 255, 255, 0.2))
        drop-shadow(0px 2px 1px ${darkRimShadowColor.rgba(0.4)})
      `,
      mixBlendMode: 'overlay',
    }),
    [darkRimShadowColor, lightRimColor]
  )

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

  // Get logo height from constants
  const getLogoHeight = () => {
    for (const [key, value] of Object.entries(LOGO_HEIGHTS)) {
      if (logoPath.includes(key)) return value
    }
    return 'auto'
  }

  return (
    <div 
      className={className ? `relative ${className}` : 'relative'}
      style={{ ...STATIC_STYLES.container, ...style }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <HaloGlow
        blobGridColors={blobGridColors}
        blobAnimations={blobAnimations}
        dotPositions={dotPositions}
        circleSize={circleSize}
        isHovered={isHovered}
      />

      {/* Main Box Container */}
      <div
        style={{
          position: 'relative',
          width: `${BOX_WIDTH}px`,
          height: `${BOX_HEIGHT}px`,
          borderRadius: `${BOX_RADIUS}px`,
          overflow: 'hidden',
          zIndex: 1,
          transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
          transition: 'transform 0.3s ease-out',
          backgroundColor: 'rgba(252, 222, 202, 0.05)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          willChange: 'backdrop-filter',
        }}
      >
        <div style={gradientOverlayStyle} />

        {/* Shading Layers */}
        <div style={STATIC_STYLES.shadingContainer}>
          <div style={darkRimStyle} />

          <div
            style={{
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
            }}
          />

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

        {/* Noise Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            mixBlendMode: 'overlay',
            borderRadius: `${BOX_RADIUS}px`,
            backgroundImage: 'url(/assets/noise-dark.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            WebkitMaskImage: svgMaskString,
            maskImage: svgMaskString,
            WebkitMaskSize: '100% 100%',
            maskSize: '100% 100%',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
          }}
        />

        <div style={insetShadowsStyle} />

        <ProgressBlobs
          blobGridColors={blobGridColors}
          blobAnimations={blobAnimations}
          dotPositions={dotPositions}
          circleSize={circleSize}
          isHovered={isHovered}
        />

        {/* Progress Indicator */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 0,
            transform: 'translateX(-50%)',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 10,
          }}
        >
          <p style={STATIC_STYLES.progressText}>
            <span style={progressTextShadowStyle}>
              {progress.current}/{progress.total}
            </span>
            <span style={progressTextGradientStyle}>
              {progress.current}/{progress.total}
            </span>
          </p>
        </div>
      </div>

      {/* Logo Container */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: isHovered ? 'translate(-50%, calc(-50% - 8px))' : 'translate(-50%, -50%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 8,
          pointerEvents: 'none',
          overflow: 'visible',
          transition: 'transform 0.3s ease-out',
        }}
      >
        <div style={STATIC_STYLES.logoWrapper}>
          <div
            style={{
              position: 'absolute',
              inset: '-12.66% -1.84% -9.28% -1.84%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'visible',
            }}
          >
            {logoSvg ? (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'visible',
                  ...logoImageStyle,
                }}
                dangerouslySetInnerHTML={{ __html: logoSvg }}
              />
            ) : (
              <img
                src={logoPath}
                alt="Logo"
                style={{
                  ...logoImageStyle,
                  width: 'auto',
                  height: getLogoHeight(),
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Pull Tab Container */}
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

      <ShadowContainer
        vibrantShadowColor={vibrantShadowColor}
        isHovered={isHovered}
      />
    </div>
  )
}

export default memo(Layout3Box)
