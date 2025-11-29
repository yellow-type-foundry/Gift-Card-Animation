'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { hexToHsl, hslToHex } from '@/utils/colors'

const Layout3Box = ({ boxColor = '#1987C7' }) => {
  const [lightCornerSvg, setLightCornerSvg] = useState(null)

  // Base color is rgba(255, 203, 168, 0.3) - convert to hex first
  const baseOrangeColor = '#FFCBA8' // RGB(255, 203, 168) from the base color
  
  // Calculate lighter shade of base orange for white highlights (themed)
  // Need to calculate this early so it's available in useEffect
  const lightRimColor = useMemo(() => {
    const [h, s, l] = hexToHsl(baseOrangeColor)
    // Lighten by increasing lightness - adjust this value to make lighter/darker
    // Current: increases by 15 - increase this number to make lighter, decrease to make darker
    const lighterL = Math.min(100, l + 10)
    const lighterColor = hslToHex(h, s, lighterL)
    // Convert hex to RGB values
    const r = parseInt(lighterColor.slice(1, 3), 16)
    const g = parseInt(lighterColor.slice(3, 5), 16)
    const b = parseInt(lighterColor.slice(5, 7), 16)
    // Helper function to create rgba with custom opacity
    const rgba = (opacity) => `rgba(${r}, ${g}, ${b}, ${opacity})`
    return { hex: lighterColor, r, g, b, rgba }
  }, [])

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

  // Calculate darker shade of base orange color for Dark Rim 2 border
  const darkRim2BorderColor = useMemo(() => {
    const [h, s, l] = hexToHsl(baseOrangeColor)
    // Darken by reducing lightness by 35%
    const darkerL = Math.max(0, l - 35)
    const darkerColor = hslToHex(h, s, darkerL)
    // Convert hex to rgba with 40% opacity
    const r = parseInt(darkerColor.slice(1, 3), 16)
    const g = parseInt(darkerColor.slice(3, 5), 16)
    const b = parseInt(darkerColor.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, 0.4)`
  }, [])

  // Calculate darker shade of base orange for Dark Rim gradient and shadows
  const darkRimColor = useMemo(() => {
    const [h, s, l] = hexToHsl(baseOrangeColor)
    // Darken by reducing lightness by 40-50% for rim effect
    const darkerL = Math.max(0, l - 10)
    const darkerColor = hslToHex(h, s, darkerL)
    // Convert hex to RGB values
    const r = parseInt(darkerColor.slice(1, 3), 16)
    const g = parseInt(darkerColor.slice(3, 5), 16)
    const b = parseInt(darkerColor.slice(5, 7), 16)
    // Helper function to create rgba with custom opacity
    const rgba = (opacity) => `rgba(${r}, ${g}, ${b}, ${opacity})`
    return { hex: darkerColor, r, g, b, rgba }
  }, [])


  return (
    <div 
      className="relative"
      style={{
        width: '180px',
        height: '176px',
        margin: '0 auto'
      }}
    >
      {/* Main Box Container */}
      <div
        style={{
          position: 'relative',
          width: '180px',
          height: '176px',
          borderRadius: '36px',
          overflow: 'hidden',
          // Background with translucent peach color
          backgroundColor: 'rgba(255, 203, 168, 0.3)',
        }}
      >
        {/* Gradient Overlay with Backdrop Blur */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 100%)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            mixBlendMode: 'overlay',
            borderRadius: '36px',
          }}
        />

        {/* Shading Layers */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            height: '100%',
          }}
        >
          {/* Dark Rim - Gradient with blur (themed: transparent -> dark orange) */}
          <div
            style={{
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
              background: `linear-gradient(135deg, rgba(0, 0, 0, 0) 0%, ${darkRimColor.rgba(0.5)} 100%)`,
              boxShadow: `inset -16px -14px 16px 5px ${darkRimColor.rgba(0.01)}, inset 6px 12px 13px 5px ${lightRimColor.rgba(0.45)}`,
            }}
          />

          {/* Dark Rim 2 - Border effect with themed brand color (darker shade) */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%) rotate(180deg)',
              width: '180px',
              height: '176px',
              border: `1.5px solid ${darkRim2BorderColor}`,
              borderRadius: '36px',
              filter: 'blur(1.5px)',
              mixBlendMode: 'normal',
            }}
          />

          {/* Light Corner - Inline SVG for CSS styling control */}
          <div
            style={{
              position: 'absolute',
              left: 'calc(50% - 30px)',
              top: 'calc(50% - 35.5px)',
              transform: 'translate(-50%, -50%) rotate(180deg)',
              width: '100px',
              height: '90px',
              mixBlendMode: 'overlay',
            }}
          >
            {lightCornerSvg && (
              <div
                style={{
                  position: 'absolute',
                  inset: '-15.56% -16% -17.78% -14%',
                  width: 'auto',
                  height: 'auto',
                  maxWidth: 'none',
                  display: 'block',
                }}
                dangerouslySetInnerHTML={{ __html: lightCornerSvg }}
              />
            )}
          </div>

          {/* Light Rim - Soft highlight with 135deg gradient */}
          <div
            style={{
              position: 'absolute',
              left: '5.55%',
              right: '5.56%',
              top: '50%',
              transform: 'translateY(-50%)',
              height: '160px',
              background: `linear-gradient(135deg, rgba(0, 0, 0, 0) 60%, ${lightRimColor.rgba(0.75)} 100%)`,
              borderRadius: '28px',
              filter: 'blur(5px)',
              mixBlendMode: 'overlay',
            }}
          />
        </div>

        {/* Top Highlight - Image asset at top of box */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '0',
            transform: 'translateX(-50%)',
            height: '8px',
            width: '156px',
            mixBlendMode: 'soft-light',
            zIndex: 10,
          }}
        >
          {/* TODO: Extract Top Highlight SVG/image from Figma and replace placeholder */}
          <div
            style={{
              position: 'absolute',
              inset: '-100% -5.13%',
              width: 'auto',
              height: 'auto',
              maxWidth: 'none',
              display: 'block',
              background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.83) 0%, rgba(255, 255, 255, 0.1) 100%)',
              borderRadius: '4px',
            }}
          />
        </div>

        {/* Noise Overlay - PNG masked to box shape */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            mixBlendMode: 'overlay',
            borderRadius: '36px',
            backgroundImage: 'url(/assets/noise-dark.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            // Use CSS mask to clip noise to box shape
            WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='176'%3E%3Crect width='180' height='176' rx='36' ry='36' fill='white'/%3E%3C/svg%3E")`,
            maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='176'%3E%3Crect width='180' height='176' rx='36' ry='36' fill='white'/%3E%3C/svg%3E")`,
            WebkitMaskSize: '100% 100%',
            maskSize: '100% 100%',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
          }}
        />

        {/* Inset Shadows for depth */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            borderRadius: '36px',
            boxShadow: `
              inset 0px -1px 6px 0px ${lightRimColor.rgba(0.5)},
              inset 0px -5px 15px 5px #ffb98a,
              inset 0px 10px 15px 0px ${lightRimColor.rgba(0.5)},
              inset 0px 0px 20px 0px ${lightRimColor.rgba(0.5)}
            `,
          }}
        />
      </div>
    </div>
  )
}

export default Layout3Box

