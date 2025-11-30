'use client'

import React, { useState, useEffect, useMemo, memo } from 'react'
import { makeThemedColor, makeVibrantColor } from '@/utils/colors'
import { BOX_WIDTH, BOX_HEIGHT, BOX_RADIUS, STATIC_STYLES } from '@/constants/layout3Tokens'
import { useBlobColors } from '@/hooks/useBlobColors'
import { useDotAnimation } from '@/hooks/useDotAnimation'
import ProgressBlobs from '@/components/layout3/ProgressBlobs'
import HaloGlow from '@/components/layout3/HaloGlow'
import ShadowContainer from '@/components/layout3/ShadowContainer'
import Logo from '@/components/layout3/Logo'
import PullTab from '@/components/layout3/PullTab'
import ProgressIndicator from '@/components/layout3/ProgressIndicator'
import ShadingLayers from '@/components/layout3/ShadingLayers'

/**
 * Layout3Box (box3) - A themed box component with gradient effects, shadows, and dynamic theming
 * Referred to as "box3" in code for consistency with box1 and box2
 * @param {string} boxColor - The base color for theming (default: '#1987C7')
 * @param {string} logoPath - Path to the logo SVG file (default: '/assets/GiftSent/SVG Logo/Apple.svg')
 * @param {object} progress - Progress object with current and total (default: { current: 1, total: 25 })
 * @param {string} className - Additional CSS classes for the root container
 * @param {object} style - Additional inline styles for the root container
 * @param {boolean} isHovered - External hover state (if provided, uses this instead of internal state)
 */
const Layout3Box = ({ boxColor = '#1987C7', logoPath = '/assets/GiftSent/SVG Logo/Apple.svg', progress = { current: 1, total: 25 }, className = '', style = {}, isHovered: externalIsHovered }) => {
  const [lightCornerSvg, setLightCornerSvg] = useState(null)
  const [internalIsHovered, setInternalIsHovered] = useState(false)
  
  // Use external hover state if provided, otherwise use internal state
  const isHovered = externalIsHovered !== undefined ? externalIsHovered : internalIsHovered

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


  return (
    <div 
      className={className ? `relative ${className}` : 'relative'}
      style={{ 
        ...STATIC_STYLES.container, 
        ...style,
        // Ensure no clipping - allow content to extend beyond bounds
        overflow: 'visible',
      }}
      onMouseEnter={externalIsHovered === undefined ? () => setInternalIsHovered(true) : undefined}
      onMouseLeave={externalIsHovered === undefined ? () => setInternalIsHovered(false) : undefined}
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
        <ShadingLayers baseColor={baseColor} lightCornerSvg={lightCornerSvg} />

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
        <ProgressIndicator progress={progress} baseColor={baseColor} />
      </div>

      {/* Logo */}
      <Logo logoPath={logoPath} baseColor={baseColor} isHovered={isHovered} />

      {/* Pull Tab */}
      <PullTab baseColor={baseColor} isHovered={isHovered} />

      <ShadowContainer
        vibrantShadowColor={vibrantShadowColor}
        isHovered={isHovered}
      />
    </div>
  )
}

export default memo(Layout3Box)
