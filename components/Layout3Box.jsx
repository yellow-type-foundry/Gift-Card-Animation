'use client'

import React, { useState, useEffect, useMemo, memo } from 'react'
import { hexToHsl, hslToHex } from '@/utils/colors'

// Layout 3 box sizing tokens (keep visuals in sync with Figma)
const BOX_WIDTH = 180
const BOX_HEIGHT = 176
const BOX_RADIUS = 36
const BOTTOM_SHADOW_WIDTH = 156

// Helper to create a themed color variant from a base hex with a lightness delta
const makeThemedColor = (baseHex, deltaL) => {
  const [h, s, l] = hexToHsl(baseHex)
  const newL = Math.max(0, Math.min(100, l + deltaL))
  const newHex = hslToHex(h, s, newL)
  const r = parseInt(newHex.slice(1, 3), 16)
  const g = parseInt(newHex.slice(3, 5), 16)
  const b = parseInt(newHex.slice(5, 7), 16)
  const rgba = (opacity) => `rgba(${r}, ${g}, ${b}, ${opacity})`
  return { hex: newHex, r, g, b, rgba }
}

// Helper to create a more saturated/vibrant color variant
const makeVibrantColor = (baseHex, deltaS = 20) => {
  const [h, s, l] = hexToHsl(baseHex)
  const newS = Math.max(0, Math.min(100, s + deltaS))
  const newHex = hslToHex(h, newS, l)
  return newHex
}

// Static style objects (never change, can be reused)
const STATIC_STYLES = {
  container: {
    width: `${BOX_WIDTH}px`,
    height: `${BOX_HEIGHT}px`,
    margin: '0 auto',
    overflow: 'visible',
    position: 'relative',
  },
  shadingContainer: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
  lightCornerWrapper: {
    position: 'absolute',
    left: 'calc(50% - 30px)',
    top: 'calc(50% - 35.5px)',
    transform: 'translate(-50%, -50%) rotate(180deg)',
    width: '100px',
    height: '90px',
    mixBlendMode: 'overlay',
  },
  lightCornerInner: {
    position: 'absolute',
    inset: '-15.56% -16% -17.78% -14%',
    width: 'auto',
    height: 'auto',
    maxWidth: 'none',
    display: 'block',
  },
  progressBlobsContainer: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '172px',
    height: '172px',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '10px',
    filter: 'blur(15px)',
  },
  progressBlobsInner: {
    height: '180px',
    width: '180px',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  logoWrapper: {
    position: 'relative',
    width: '181.5px',
    height: '36px',
    mixBlendMode: 'overlay',
    display: 'flex',
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '18px',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: 'block',
  },
  progressText: {
    position: 'relative',
    fontSize: '20px',
    fontFamily: "'Goody Sans', sans-serif",
    fontWeight: 'bold',
    lineHeight: 1,
    textAlign: 'center',
    whiteSpace: 'pre',
    letterSpacing: '-0.2px',
    mixBlendMode: 'normal',
    margin: 0,
  },
  pullTabIcon: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    mixBlendMode: 'overlay',
  },
  shadowImage: {
    display: 'block',
    width: `${BOTTOM_SHADOW_WIDTH}px`,
    height: 'auto',
  },
}

/**
 * Layout3Box - A themed box component with gradient effects, shadows, and dynamic theming
 * @param {string} boxColor - The base color for theming (default: '#1987C7')
 * @param {string} logoPath - Path to the logo SVG file (default: '/assets/GiftSent/SVG Logo/Apple.svg')
 * @param {string} className - Additional CSS classes for the root container
 * @param {object} style - Additional inline styles for the root container
 */
const Layout3Box = ({ boxColor = '#1987C7', logoPath = '/assets/GiftSent/SVG Logo/Apple.svg', className = '', style = {} }) => {
  const [lightCornerSvg, setLightCornerSvg] = useState(null)
  const [logoSvg, setLogoSvg] = useState(null)
  const [isHovered, setIsHovered] = useState(false)

  // Base color from prop - used for all themed colors
  const baseColor = boxColor
  
  // Lighter shade of base color for white highlights (themed)
  const lightRimColor = useMemo(() => makeThemedColor(baseColor, 10), [baseColor])
  
  // Vibrant color for shadow (more saturated)
  const vibrantShadowColor = useMemo(() => makeVibrantColor(baseColor, 50), [baseColor])
  
  // Hover color - base color with L+3
  const hoverColor = useMemo(() => makeThemedColor(baseColor, 3), [baseColor])

  // Load and parse SVG for Light Corner to enable CSS styling
  useEffect(() => {
    fetch('/assets/placeholder-light-corner.svg')
      .then(res => res.text())
      .then(svgText => {
        // Parse SVG and make it styleable
        const parser = new DOMParser()
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml')
        const svgElement = svgDoc.querySelector('svg')
        
        if (svgElement) {
          // Make gradient IDs unique to avoid conflicts
          const gradientId = 'lightCornerGradient'
          const defs = svgElement.querySelector('defs') || svgDoc.createElementNS('http://www.w3.org/2000/svg', 'defs')
          if (!svgElement.querySelector('defs')) {
            svgElement.insertBefore(defs, svgElement.firstChild)
          }
          
          // Update gradient if it exists, or create one
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
          
          // Update gradient stops for CSS control
          const stops = gradient.querySelectorAll('stop')
          if (stops.length === 0) {
            const stop1 = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'stop')
            stop1.setAttribute('offset', '0%')
            stop1.setAttribute('stop-color', 'rgba(0, 0, 0, 0)')
            gradient.appendChild(stop1)
            
            const stop2 = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'stop')
            stop2.setAttribute('offset', '100%')
            // Use themed light orange color instead of white
            stop2.setAttribute('stop-color', lightRimColor.rgba(0.5))
            gradient.appendChild(stop2)
          }
          
          // Update paths to use the gradient
          const paths = svgElement.querySelectorAll('path')
          paths.forEach(path => {
            path.setAttribute('fill', `url(#${gradientId})`)
          })
          
          setLightCornerSvg(svgElement.outerHTML)
        }
      })
      .catch(err => {
        console.warn('Light Corner SVG not found, using placeholder:', err)
        // Fallback: create a simple inline SVG
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
        // Parse SVG and make it styleable
        const parser = new DOMParser()
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml')
        const svgElement = svgDoc.querySelector('svg')
        
        if (svgElement) {
          // Make gradient IDs unique to avoid conflicts
          const gradientId = 'logoWhiteGradient'
          const defs = svgElement.querySelector('defs') || svgDoc.createElementNS('http://www.w3.org/2000/svg', 'defs')
          if (!svgElement.querySelector('defs')) {
            svgElement.insertBefore(defs, svgElement.firstChild)
          }
          
          // Update gradient if it exists, or create one
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
          
          // Update gradient stops: top 100% white, bottom 40% white
          const stops = gradient.querySelectorAll('stop')
          // Remove existing stops
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
          
          // Update paths to use the gradient
          const paths = svgElement.querySelectorAll('path')
          paths.forEach(path => {
            path.setAttribute('fill', `url(#${gradientId})`)
          })
          
          // Also check for other elements that might have fill
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
            
            // Create inner shadow using feGaussianBlur and feOffset
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
          
          // Apply filter to all paths and shapes
          const shapes = svgElement.querySelectorAll('path, circle, rect, polygon')
          shapes.forEach(shape => {
            const currentFilter = shape.getAttribute('filter')
            if (currentFilter) {
              shape.setAttribute('filter', `${currentFilter} url(#${filterId})`)
            } else {
              shape.setAttribute('filter', `url(#${filterId})`)
            }
          })
          
          // Ensure SVG fills its container properly
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

  // Darker shade for Dark Rim 2 border
  const darkRim2BorderColor = useMemo(
    () => makeThemedColor(baseColor, -35).rgba(0.4),
    [baseColor]
  )

  // Blob colors based on box color with hue shifts
  const blobColors = useMemo(() => {
    const [h, s, l] = hexToHsl(baseColor)
    // Top blob: hue +10
    const topBlobHue = (h + 10) % 360
    const topBlobColor = hslToHex(topBlobHue, s, l)
    // Bottom blob: hue -10
    const bottomBlobHue = (h - 10 + 360) % 360 // Add 360 to handle negative
    const bottomBlobColor = hslToHex(bottomBlobHue, s, l)
    return { top: topBlobColor, bottom: bottomBlobColor }
  }, [baseColor])

  // Dark rim for gradients/shadows (soft, close to base)
  const darkRimColor = useMemo(() => makeThemedColor(baseColor, -1), [baseColor])

  // Darker themed color specifically for strong text/drop shadows
  const darkRimShadowColor = useMemo(
    () => makeThemedColor(baseColor, -30),
    [baseColor]
  )

  // Memoize SVG mask string (only changes if dimensions change, which they don't)
  const svgMaskString = useMemo(
    () => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${BOX_WIDTH}' height='${BOX_HEIGHT}'%3E%3Crect width='${BOX_WIDTH}' height='${BOX_HEIGHT}' rx='${BOX_RADIUS}' ry='${BOX_RADIUS}' fill='white'/%3E%3C/svg%3E")`,
    []
  )

  // Memoize dynamic style objects that depend on themed colors
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

  return (
    <div 
      className={className ? `relative ${className}` : 'relative'}
      style={{ ...STATIC_STYLES.container, ...style }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
          // Background with translucent peach color - very low opacity for backdrop filter visibility
          backgroundColor: 'rgba(252, 222, 202, 0.05)',
          // Backdrop blur for frosted glass effect
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          // Ensure backdrop filter works
          willChange: 'backdrop-filter',
        }}
      >
        {/* Gradient Overlay - Themed with dark color */}
        <div style={gradientOverlayStyle} />

        {/* Shading Layers */}
        <div style={STATIC_STYLES.shadingContainer}>
          {/* Dark Rim - Gradient with blur (themed: transparent -> dark orange) */}
          <div style={darkRimStyle} />

          {/* Dark Rim 2 - Border effect with themed brand color (darker shade) */}
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

          {/* Light Corner - Inline SVG for CSS styling control */}
          <div style={STATIC_STYLES.lightCornerWrapper}>
            {lightCornerSvg && (
              <div
                style={STATIC_STYLES.lightCornerInner}
                dangerouslySetInnerHTML={{ __html: lightCornerSvg }}
              />
            )}
          </div>

          {/* Light Rim - Soft highlight with 135deg gradient */}
          <div style={lightRimStyle} />
        </div>

        {/* Noise Overlay - PNG masked to box shape */}
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
            // Use CSS mask to clip noise to box shape
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

        {/* Inset Shadows for depth */}
        <div style={insetShadowsStyle} />

        {/* Progress Blobs - Blurred and clipped inside box */}
        <div style={STATIC_STYLES.progressBlobsContainer}>
          {/* Two ellipses for progress blobs - vertically stacked */}
          <div style={STATIC_STYLES.progressBlobsInner}>
            {/* Top blob - Hue +20 */}
            <div
              style={{
                width: '120%',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: blobColors.top,
              }}
            />
            {/* Bottom blob - Hue -20 */}
            <div
              style={{
                width: '120%',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: blobColors.bottom,
                marginTop: '-4px',
              }}
            />
          </div>
        </div>

        {/* Progress Indicator - Positioned at bottom of box, behind shading layers */}
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
            {/* Shadow text behind - uses darkRimColor, slightly blurred */}
            <span style={progressTextShadowStyle}>
              1/25
            </span>
            {/* Foreground gradient text */}
            <span style={progressTextGradientStyle}>
              1/25
            </span>
          </p>
        </div>
      </div>

      {/* Logo Container - positioned outside overflow:hidden container to prevent clipping */}
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
          {/* Logo with inset wrapper matching Layout 2 */}
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
                  height: (() => {
                    if (logoPath.includes('Goody.svg')) return '40px'
                    if (logoPath.includes('Chipotle.svg')) return '46px'
                    if (logoPath.includes('Apple.svg')) return '40px'
                    if (logoPath.includes('Nike.svg')) return '24px'
                    if (logoPath.includes('Supergoop.svg')) return '40px'
                    if (logoPath.includes('Tiffany & Co.svg')) return '16px'
                    if (logoPath.includes('Logo.svg')) return '20px' // Columbia
                    return 'auto'
                  })(),
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
          top: '-3px', // 3px higher than the box
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
        {/* Pull Tab */}
        <div
          style={{
            position: 'relative',
            width: 'auto', // Narrow width for pull tab
            height: '100%', // Full height of container (136px after padding)
            backdropFilter: 'blur(9.287px)',
            WebkitBackdropFilter: 'blur(9.287px)',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: '0.5px solid rgba(255, 255, 255, 0)',
            borderRadius: '16px 16px 100px 100px', // Top corners 4px, bottom corners 100px
            boxShadow: 'inset 0px 0px 4px 0px rgba(255, 255, 255, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '5px',
            overflow: 'hidden',
          }}
        >
          {/* Pull Tab Icon - Placeholder for ellipse icon */}
          <div style={pullTabIconStyle} />
        </div>
      </div>

      {/* Shadow under the box - Y+145 from top edge, width 156px (156/180 ratio) */}
      <div
        style={{
          position: 'absolute',
          left: '7%',
          top: '122px',
          transform: 'none',
          width: `${BOTTOM_SHADOW_WIDTH}px`,
          height: 'auto',
          scale: '1.25',
          zIndex: 0,
          opacity: isHovered ? 0.25 : 1,
          transition: 'opacity 0.25s ease-out',
        }}
      >
        {/* Shadow image */}
        <img
          src="/assets/shadow3.png"
          alt=""
          style={STATIC_STYLES.shadowImage}
        />
        {/* Color layer clipped to shadow shape with color blend mode */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: vibrantShadowColor,
            mixBlendMode: 'color',
            WebkitMaskImage: 'url(/assets/shadow3.png)',
            maskImage: 'url(/assets/shadow3.png)',
            WebkitMaskSize: '100% 100%',
            maskSize: '100% 100%',
            WebkitMaskRepeat: 'no-repeat',  
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
          }}
        />
        {/* Additional color layer at 50% opacity for enhanced vibrancy */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: vibrantShadowColor,
            opacity: 0.95,
            mixBlendMode: 'color',
            WebkitMaskImage: 'url(/assets/shadow3.png)',
            maskImage: 'url(/assets/shadow3.png)',
            WebkitMaskSize: '100% 100%',
            maskSize: '100% 100%',
            WebkitMaskRepeat: 'no-repeat',  
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
          }}
        />
      </div>
    </div>
  )
}

export default memo(Layout3Box)

