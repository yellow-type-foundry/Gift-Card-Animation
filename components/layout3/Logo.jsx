import React, { useState, useEffect, useMemo } from 'react'
import { STATIC_STYLES, LOGO_HEIGHTS } from '@/constants/layout3Tokens'
import { makeThemedColor } from '@/utils/colors'

const Logo = ({ logoPath, baseColor, isHovered }) => {
  const [logoSvg, setLogoSvg] = useState(null)
  const darkRimShadowColor = useMemo(() => makeThemedColor(baseColor, -30), [baseColor])
  const lightRimColor = useMemo(() => makeThemedColor(baseColor, 10), [baseColor])

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
          
          // Remove fixed width/height but keep viewBox for proper scaling
          svgElement.removeAttribute('width')
          svgElement.removeAttribute('height')
          // Don't remove viewBox - it's needed for proper SVG scaling
          
          // Set new attributes for proper sizing
          svgElement.setAttribute('width', '100%')
          svgElement.setAttribute('height', '100%')
          svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet')
          // Ensure SVG doesn't clip its content
          svgElement.setAttribute('style', 'overflow: visible;')
          svgElement.setAttribute('overflow', 'visible')
          
          setLogoSvg(svgElement.outerHTML)
        }
      })
      .catch(err => {
        console.warn('Logo SVG not found:', err)
      })
  }, [logoPath])

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

  const getLogoHeight = () => {
    for (const [key, value] of Object.entries(LOGO_HEIGHTS)) {
      if (logoPath.includes(key)) return value
    }
    return 'auto'
  }

  return (
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
        padding: '40px',
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
                transform: 'scale(1.2)',
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
                overflow: 'visible',
                display: 'block',
                transform: 'scale(1.1)',
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Logo

