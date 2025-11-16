'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import Image from 'next/image'
import { TOKENS } from '@/constants/tokens'
import useDominantColor from '@/hooks/useDominantColor'
import { darkenHex, lightenHex, computeLuminance, adjustToLuminance, capSaturation } from '@/utils/colors'
import Footer from '@/components/sent-card/Footer'

// Stable style constants
const PROGRESS_PILL_RADIUS = '100px'
const HEADER_OVERLAY_BG = 'linear-gradient(to bottom, rgba(255, 253, 253, 0.3) 00%, rgba(255, 255, 255, 0.95) 95%)'
const PROGRESS_GLOW_BOX_SHADOW = '0px 2px 4px -8px rgba(46,10,255,0.1), 0px 2px 2px 0px rgba(90,61,255,0.08), 0px 4px 8px -4px rgba(16,0,112,0.15)'

const SentCard = ({
  from = 'Alex Torres',
  title = 'Marketing Strategy Update',
  boxImage = '/assets/covers/Onboarding 03.png',
  giftTitle = "Biggest Thanks",
  giftSubtitle = 'Collection by Goody',
  progress = { current: 3, total: 6 },
  sentDate = '1 week ago',
  headerBgOverride = null
}) => {
  // Ensure current never exceeds total, and total never exceeds 40
  const validatedProgress = {
    current: Math.min(progress.current, progress.total),
    total: Math.min(40, progress.total)
  }
  
  // Calculate target progress percentage precisely (will never exceed 100% since current <= total)
  const targetProgressPercentage = validatedProgress.total > 0 
    ? (validatedProgress.current / validatedProgress.total) * 100 
    : 0
  
  // Animated progress percentage (starts at 0, animates to target after content loads)
  const [animatedProgress, setAnimatedProgress] = useState(0)
  // Animated current value (starts at 0, counts up to target)
  const [animatedCurrent, setAnimatedCurrent] = useState(0)
  
  // Refs to store timers for cleanup
  const countIntervalRef = useRef(null)
  const timerRef = useRef(null)
  // Hover + confetti refs
  const cardRef = useRef(null)
  const confettiCanvasRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const isDone = validatedProgress.current === validatedProgress.total
  
  // Generate stable IDs scoped to this component instance
  const idRef = useRef(null)
  if (idRef.current === null) {
    const idSuffix = `${boxImage.replace(/[^a-zA-Z0-9]/g, '')}-${from.replace(/[^a-zA-Z0-9]/g, '')}`
    idRef.current = {
      baseFilterId: `filterBase-${idSuffix}`,
      baseGradient1Id: `paintBase1-${idSuffix}`,
      baseGradient2Id: `paintBase2-${idSuffix}`,
      imageFilterId: `filterImg-${idSuffix}`,
      imageClipId: `clipImg-${idSuffix}`,
      imageGradientSoftLightId: `paintImgSoft-${idSuffix}`,
      imageGradientShadowId: `paintImgShadow-${idSuffix}`,
      gridCellGradId: `paintGridCell-${idSuffix}`,
      cardFilterId: `filterCard-${idSuffix}`,
      cardGradientId: `paintCard-${idSuffix}`,
      unionFilterId: `filterUnion-${idSuffix}`,
      unionGradientId: `paintUnion-${idSuffix}`
    }
  }
  const ids = idRef.current

  // Extract dominant color from the image
  const { dominantColor } = useDominantColor(boxImage, '#f4c6fa')
  // Derived theme colors (memoized)
  const hiddenFlapColor = useMemo(
    () => capSaturation(lightenHex(dominantColor, 4.0), 100),
    [dominantColor]
  )
  const headerBgColor = useMemo(
    () => capSaturation(adjustToLuminance(dominantColor, 99), 25),
    [dominantColor]
  )
  const headerBgFinal = headerBgOverride || headerBgColor
  const headerTextClass = headerBgOverride ? 'text-black' : 'text-white'
  const baseTintColor = useMemo(
    () => capSaturation(adjustToLuminance(dominantColor, 85), 70),
    [dominantColor]
  )
  const base2TintColor = useMemo(
    () => capSaturation(lightenHex(dominantColor, 1.25), 65),
    [dominantColor]
  )
  const overlayDarkColor = useMemo(
    () => capSaturation(darkenHex(dominantColor, 0.7), 90),
    [dominantColor]
  )
  const gridCellBaseColor = useMemo(
    () => capSaturation(adjustToLuminance(headerBgColor, 95), 90),
    [headerBgColor]
  )
  
  // Animate progress bar and count after content is loaded
  useEffect(() => {
    // Small delay before animation starts
    timerRef.current = setTimeout(() => {
      const targetCurrent = validatedProgress.current
      const duration = 500 // 0.5s to match CSS transition
      const steps = 30 // Number of animation steps
      const stepDuration = duration / steps
      const increment = targetCurrent / steps
      let currentStep = 0
      
      // Animate progress bar width immediately
      setAnimatedProgress(targetProgressPercentage)
      
      // Animate counting number
      countIntervalRef.current = setInterval(() => {
        currentStep++
        const newValue = Math.min(
          targetCurrent,
          Math.floor(increment * currentStep)
        )
        setAnimatedCurrent(newValue)
        
        if (currentStep >= steps) {
          // Ensure final value is exact
          setAnimatedCurrent(targetCurrent)
          if (countIntervalRef.current) {
            clearInterval(countIntervalRef.current)
            countIntervalRef.current = null
          }
        }
      }, stepDuration)
    }, 100)
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      if (countIntervalRef.current) {
        clearInterval(countIntervalRef.current)
      }
    }
  }, [targetProgressPercentage, validatedProgress.current])

  const allAccepted = validatedProgress.current === validatedProgress.total

  // Lightweight confetti behind the envelope on hover when all accepted
  useEffect(() => {
    if (!isHovered || !allAccepted) return
    const canvas = confettiCanvasRef.current
    const headerEl = cardRef.current?.querySelector('[data-name="Header"]')
    if (!canvas || !headerEl) return
    const ctx = canvas.getContext('2d')
    let animId
    const dpr = window.devicePixelRatio || 1
    const rect = headerEl.getBoundingClientRect()
    canvas.width = Math.max(1, Math.floor(rect.width * dpr))
    canvas.height = Math.max(1, Math.floor(rect.height * dpr))
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    // Lighter shades based on card's dominant color for confetti particles
    const baseConfetti = dominantColor
    const colors = [
      lightenHex(baseConfetti, 1.4),
      lightenHex(baseConfetti, 1.55),
      lightenHex(baseConfetti, 1.7),
      lightenHex(baseConfetti, 1.85),
      lightenHex(baseConfetti, 2.0)
    ]
    const maxParticles = 120
    const spawnParticle = () => {
      const speed = 2 + Math.random() * 3
      return {
        // Start near bottom with slight horizontal randomness across width
        x: Math.random() * (rect.width * dpr),
        y: (rect.height * dpr) - 2 * dpr,
        // Shoot upwards with slight horizontal drift
        vx: (Math.random() * 2 - 1) * 1.5 * dpr,
        vy: -speed * dpr,
        // Gravity pulls down a bit so confetti slows as it rises
        ay: 0.06 * dpr,
        rot: Math.random() * Math.PI,
        vr: (Math.random() * 0.3 - 0.15),
        size: (4 + Math.random() * 4) * dpr,
        color: colors[(Math.random() * colors.length) | 0],
        shape: Math.random() < 0.5 ? 'rect' : 'tri'
      }
    }
    const particles = Array.from({ length: maxParticles }).map(spawnParticle)
    const recycleIfOut = (p) => {
      const outOfBounds = p.y < -20 * dpr || p.y > canvas.height + 20 * dpr || p.x < -20 * dpr || p.x > canvas.width + 20 * dpr
      if (outOfBounds) {
        const np = spawnParticle()
        p.x = np.x; p.y = np.y; p.vx = np.vx; p.vy = np.vy; p.ay = np.ay; p.rot = np.rot; p.vr = np.vr; p.size = np.size; p.color = np.color; p.shape = np.shape
      }
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.vy += p.ay
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        recycleIfOut(p)
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        // Draw circle only
        ctx.beginPath()
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      })
      animId = requestAnimationFrame(draw)
    }
    animId = requestAnimationFrame(draw)
    return () => {
      if (animId) cancelAnimationFrame(animId)
      ctx && ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [isHovered, allAccepted])

  return (
    <div
      data-variant={headerBgOverride ? 'mono' : 'themed'}
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="border border-[#dde2e9] border-solid relative rounded-[24px] w-full md:w-[300px] overflow-hidden"
      style={{
        borderRadius: TOKENS.sizes.borderRadius.card
      }}
      data-name="Gift Card"
      data-node-id="1467:49182"
    >
      <div className="content-stretch flex flex-col items-start overflow-hidden relative rounded-[inherit] size-full">
        {/* Header Section - 280px tall */}
        <div
          className="box-border content-stretch flex flex-col h-[280px] items-center justify-between pb-0 pt-[20px] px-0 relative shrink-0 w-full overflow-visible"
          style={{
            position: 'relative'
          }}
          data-name="Header"
          data-node-id="1467:49183"
        >
          {/* Background with gradient overlay */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: `${TOKENS.sizes.borderRadius.card} ${TOKENS.sizes.borderRadius.card} 0 0`
            }}
          >
            {/* Confetti canvas (behind envelope) */}
            <canvas
              ref={confettiCanvasRef}
              className="absolute inset-0"
              style={{ zIndex: 1, pointerEvents: 'none', filter: 'blur(2.5px)' }}
            />
            {/* Base color - dynamic from dominant color */}
            <div
              className="absolute inset-0"
                data-name="HeaderBGBase"
              style={{
                  backgroundColor: headerBgFinal,
                  transition: 'background 200ms ease-out, filter 200ms ease-out'
              }}
            />
            {/* Gradient overlay with blend mode */}
            <div
              className="absolute inset-0"
              style={{
                background: HEADER_OVERLAY_BG,
                mixBlendMode: 'overlay'
              }}
            />
          </div>

          {/* Dots pattern removed */}

          {/* Header Content */}
          <div
            className={`box-border content-stretch flex flex-col gap-[8px] items-center not-italic px-[16px] py-0 relative shrink-0 text-center text-nowrap ${headerTextClass} w-full z-10`}
            data-name="Header"
            data-node-id="1467:49184"
          >
            <p
              className="font-['Goody_Sans:Regular',sans-serif] leading-[1.4] opacity-80 relative shrink-0 text-[16px] whitespace-pre"
              style={{
                fontFamily: 'var(--font-goody-sans)',
                fontSize: '16px',
                fontWeight: 400,
                lineHeight: 1.4,
                opacity: 0.8,
                color: headerBgOverride ? TOKENS.colors.text.tertiary : '#ffffff'
              }}
              data-node-id="1467:49185"
            >
              {sentDate} • {from}
            </p>
            <p
              className="[white-space-collapse:collapse] font-['HW_Cigars:Regular',sans-serif] leading-[1.2] min-w-full overflow-ellipsis overflow-hidden relative shrink-0 text-[24px] tracking-[-0.36px] w-[min-content]"
              style={{
                fontFamily: 'var(--font-hw-cigars)',
                fontSize: '24px',
                fontWeight: 400,
                lineHeight: 1.2,
                letterSpacing: '-0.36px'
              }}
              data-node-id="1467:49186"
            >
              {title}
            </p>
          </div>

          {/* Envelope Container - children positioned relative to header */}
          <div
            className="absolute inset-0"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              top: '4px',
              left: '-2px',
              right: '2px'
            }}
            data-name="Envelope"
            data-node-id="1467:49190"
          >
            
            
            {/* Base (envelope base) - moved inside Envelope so it moves together */}
            <div
              className="absolute"
              style={{
                left: '50px',
                top: '83px',
                width: '195.5px',
                height: '220.575px',
                zIndex: 1,
                pointerEvents: 'none'
              }}
              data-name="Base"
              data-node-id="1467:49192"
            >
                {/* Background blur layer (like Union) */}
                <div
                  className="absolute inset-0"
                  style={{
                    backdropFilter: 'blur(0px)',
                    WebkitBackdropFilter: 'blur(0px)',
                    top: '-8px',
                    left: '-8px',
                    right: '-8px',
                    bottom: '-8px',
                    pointerEvents: 'none',
                    zIndex: 0
                  }}
                  aria-hidden="true"
                />
                <svg
                  preserveAspectRatio="true"
                  width="100%"
                  height="100%"
                  overflow="visible"
                  style={{ display: 'block', position: 'relative', zIndex: 1 }}
                  viewBox="0 0 196 219"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g filter={`url(#${ids.baseFilterId})`}>
                    {/* Themed base fill */}
                    <path
                      d="M0 84.4092C0 80.8407 1.58824 77.4572 4.33359 75.1774L92.6391 1.84547C95.6021 -0.615154 99.8979 -0.615156 102.861 1.84546L191.166 75.1774C193.912 77.4572 195.5 80.8406 195.5 84.4092V206.176C195.5 212.804 190.127 218.176 183.5 218.176H12C5.37259 218.176 0 212.804 0 206.176V84.4092Z"
                      fill={baseTintColor}
                    />
                    {/* Highlight gradient overlay */}
                    <path
                      d="M0 84.4092C0 80.8407 1.58824 77.4572 4.33359 75.1774L92.6391 1.84547C95.6021 -0.615154 99.8979 -0.615156 102.861 1.84546L191.166 75.1774C193.912 77.4572 195.5 80.8406 195.5 84.4092V206.176C195.5 212.804 190.127 218.176 183.5 218.176H12C5.37259 218.176 0 212.804 0 206.176V84.4092Z"
                      fill={`url(#${ids.baseGradient1Id})`}
                      fillOpacity="0.5"
                    />
                    <path
                      d="M92.7988 2.03769C95.6693 -0.345946 99.8307 -0.345947 102.701 2.03769L191.007 75.3697C193.695 77.602 195.25 80.9148 195.25 84.4088V206.176C195.25 212.666 189.989 217.926 183.5 217.926H12C5.51072 217.926 0.250108 212.666 0.25 206.176V84.4088C0.250125 80.9148 1.80517 77.602 4.49316 75.3697L92.7988 2.03769Z"
                      stroke={`url(#${ids.baseGradient2Id})`}
                      strokeOpacity="0.8"
                      strokeWidth="0.5"
                    />
                  </g>
                  <defs>
                    <filter
                      id={ids.baseFilterId}
                      x="-8"
                      y="-8"
                      width="211.5"
                      height="334.176"
                      filterUnits="userSpaceOnUse"
                      colorInterpolationFilters="sRGB"
                    >
                      <feFlood floodOpacity="0" result="BackgroundImageFix" />
                      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset dy="0" />
                      <feGaussianBlur stdDeviation="5" />
                      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                      <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.95 0" />
                      <feBlend mode="normal" in2="shape" result="effect1_innerShadow" />
                    </filter>
                    <linearGradient
                      id={ids.baseGradient1Id}
                      x1="90"
                      y1="100"
                      x2="90"
                      y2="-200"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="white" />
                      <stop offset="1" stopColor="grey" stopOpacity="0.2" />
                    </linearGradient>
                    <linearGradient
                      id={ids.baseGradient2Id}
                      x1="97"
                      y1="10"
                      x2="97"
                      y2="131"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="white" stopOpacity="0" />
                      <stop offset="0.6" stopColor="white" />
                    </linearGradient>
                  </defs>
                </svg>
            </div>
            {/* Rectangle 1790 (card shape container) - moved inside Envelope */}
            <div
              className="absolute"
              style={{
                left: '60px',
                top: '91.117px',
                width: '175.95px',
                height: '146.2px',
                zIndex: 2,
                pointerEvents: 'none'
              }}
              data-node-id="1467:49194"
            >
                {/* Card shape overlay (hexagon shape) with inset wrapper */}
                <div
                  className="absolute"
                  style={{
                    left: '1.64%',
                    top: '1.23%',
                    right: '1.64%',
                    bottom: '1.23%',
                    position: 'absolute'
                  }}
                >
                  <svg
                    preserveAspectRatio="none"
                    width="100%"
                    height="100%"
                    overflow="visible"
                    style={{ display: 'block' }}
                    viewBox="0 0 171 143"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g filter={`url(#${ids.cardFilterId})`}>
                      <path
                        d="M81.2603 1.38519L1.84066 67.3763C-0.613553 69.4155 -0.613553 73.1822 1.84066 75.2214L81.2603 141.213C83.4831 143.059 86.7066 143.059 88.9294 141.213L168.349 75.2214C170.803 73.1822 170.803 69.4155 168.349 67.3763L88.9294 1.38519C86.7066 -0.461729 83.4831 -0.461731 81.2603 1.38519Z"
                        fill={base2TintColor}
                        fillOpacity="0.2"
                      />
                    </g>
                    <defs>
                      <filter
                        id={ids.cardFilterId}
                        x="-40"
                        y="-40"
                        width="260"
                        height="220"
                        filterUnits="userSpaceOnUse"
                        colorInterpolationFilters="sRGB"
                      >
                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                        <feColorMatrix
                          in="SourceAlpha"
                          type="matrix"
                          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                          result="hardAlpha"
                        />
                        <feOffset dy="0" />
                        <feGaussianBlur stdDeviation="5" />
                        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                        <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.65 0" />
                        <feBlend mode="normal" in2="shape" result="effect1_innerShadow" />
                        {/* White outer drop shadows for 1790 */}
                        <feDropShadow in="SourceGraphic" dx="0" dy="8" stdDeviation="3" floodColor="#FFFFFF" floodOpacity="1" result="cardOuterShadow1" />
                        <feDropShadow in="SourceGraphic" dx="0" dy="8" stdDeviation="3" floodColor="#FFFFFF" floodOpacity="1" result="cardOuterShadow2" />
                        <feMerge>
                          <feMergeNode in="cardOuterShadow1" />
                          <feMergeNode in="cardOuterShadow2" />
                          <feMergeNode in="effect1_innerShadow" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                      <linearGradient
                        id={ids.cardGradientId}
                        x1="85"
                        y1="-0.7"
                        x2="85"
                        y2="152"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="white" />
                        <stop offset="1" stopColor="white" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            {/* Image Container (hosts image) */}
            <div
              className="absolute"
              style={{
                left: '50px',
                top: '83px',
                width: '195.5px',
                height: '220.575px',
                zIndex: 2
              }}
              data-name="Image Container"
            >
              <svg
                preserveAspectRatio="none"
                width="100%"
                height="100%"
                overflow="visible"
                style={{ display: 'block' }}
                viewBox="0 0 196 221"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g filter={`url(#${ids.imageFilterId})`}>
                  {/* Fill container with white */}
                  <path
                    d="M91.6152 149.22L12.7204 83.6651L12.7204 83.665C11.638 82.7656 11.0967 82.3159 10.7076 81.7641C10.3628 81.2753 10.1068 80.7295 9.95108 80.1519C9.77539 79.5 9.77539 78.7963 9.77539 77.3889V40.468C9.77539 35.9875 9.77539 33.7473 10.6473 32.036C11.4143 30.5308 12.6382 29.3069 14.1435 28.5399C15.8548 27.668 18.095 27.668 22.5754 27.668L172.925 27.668C177.406 27.668 179.646 27.6681 181.357 28.54C182.863 29.307 184.086 30.5308 184.853 32.0361C185.725 33.7474 185.725 35.9876 185.725 40.468V77.3889C185.725 78.7963 185.725 79.5 185.55 80.1519C185.394 80.7295 185.138 81.2753 184.793 81.7641C184.404 82.3159 183.863 82.7656 182.78 83.6651L103.886 149.22C101.703 151.034 100.611 151.941 99.3931 152.288C98.3193 152.593 97.1815 152.593 96.1077 152.288C94.8898 151.941 93.7983 151.034 91.6152 149.22Z"
                    fill="#FFFFFF"
                  />
                {/* Themed 4-item grid clipped to image container */}
                  <g clipPath={`url(#${ids.imageClipId})`}>
                    <rect className="grid-cell-base gc-1" x="17.75" y="83" width="36" height="36" rx="4" fill={gridCellBaseColor} />
                    <rect className="grid-cell-overlay gc-1" x="17.75" y="83" width="36" height="36" rx="4" fill={`url(#${ids.gridCellGradId})`} />
                    <rect className="grid-cell-base gc-2" x="58.75" y="83" width="36" height="36" rx="4" fill={gridCellBaseColor} />
                    <rect className="grid-cell-overlay gc-2" x="58.75" y="83" width="36" height="36" rx="4" fill={`url(#${ids.gridCellGradId})`} />
                    <rect className="grid-cell-base gc-3" x="99.75" y="83" width="36" height="36" rx="4" fill={gridCellBaseColor} />
                    <rect className="grid-cell-overlay gc-3" x="99.75" y="83" width="36" height="36" rx="4" fill={`url(#${ids.gridCellGradId})`} />
                    <rect className="grid-cell-base gc-4" x="140.75" y="83" width="36" height="36" rx="4" fill={gridCellBaseColor} />
                    <rect className="grid-cell-overlay gc-4" x="140.75" y="83" width="36" height="36" rx="4" fill={`url(#${ids.gridCellGradId})`} />
                  {/* second row with 5px vertical gap */}
                    <rect className="grid-cell-base gc-5" x="17.75" y="124" width="36" height="36" rx="4" fill={gridCellBaseColor} />
                    <rect className="grid-cell-overlay gc-5" x="17.75" y="124" width="36" height="36" rx="4" fill={`url(#${ids.gridCellGradId})`} />
                    <rect className="grid-cell-base gc-6" x="58.75" y="124" width="36" height="36" rx="4" fill={gridCellBaseColor} />
                    <rect className="grid-cell-overlay gc-6" x="58.75" y="124" width="36" height="36" rx="4" fill={`url(#${ids.gridCellGradId})`} />
                    <rect className="grid-cell-base gc-7" x="99.75" y="124" width="36" height="36" rx="4" fill={gridCellBaseColor} />
                    <rect className="grid-cell-overlay gc-7" x="99.75" y="124" width="36" height="36" rx="4" fill={`url(#${ids.gridCellGradId})`} />
                    <rect className="grid-cell-base gc-8" x="140.75" y="124" width="36" height="36" rx="4" fill={gridCellBaseColor} />
                    <rect className="grid-cell-overlay gc-8" x="140.75" y="124" width="36" height="36" rx="4" fill={`url(#${ids.gridCellGradId})`} />
                </g>
                  <path
                    d="M91.6152 149.22L12.7204 83.6651L12.7204 83.665C11.638 82.7656 11.0967 82.3159 10.7076 81.7641C10.3628 81.2753 10.1068 80.7295 9.95108 80.1519C9.77539 79.5 9.77539 78.7963 9.77539 77.3889V40.468C9.77539 35.9875 9.77539 33.7473 10.6473 32.036C11.4143 30.5308 12.6382 29.3069 14.1435 28.5399C15.8548 27.668 18.095 27.668 22.5754 27.668L172.925 27.668C177.406 27.668 179.646 27.6681 181.357 28.54C182.863 29.307 184.086 30.5308 184.853 32.0361C185.725 33.7474 185.725 35.9876 185.725 40.468V77.3889C185.725 78.7963 185.725 79.5 185.55 80.1519C185.394 80.7295 185.138 81.2753 184.793 81.7641C184.404 82.3159 183.863 82.7656 182.78 83.6651L103.886 149.22C101.703 151.034 100.611 151.941 99.3931 152.288C98.3193 152.593 97.1815 152.593 96.1077 152.288C94.8898 151.941 93.7983 151.034 91.6152 149.22Z"
                    fill={`url(#${ids.imageGradientSoftLightId})`}
                    style={{ mixBlendMode: 'soft-light' }}
                  />
                  <path
                    d="M91.6152 149.22L12.7204 83.6651L12.7204 83.665C11.638 82.7656 11.0967 82.3159 10.7076 81.7641C10.3628 81.2753 10.1068 80.7295 9.95108 80.1519C9.77539 79.5 9.77539 78.7963 9.77539 77.3889V40.468C9.77539 35.9875 9.77539 33.7473 10.6473 32.036C11.4143 30.5308 12.6382 29.3069 14.1435 28.5399C15.8548 27.668 18.095 27.668 22.5754 27.668L172.925 27.668C177.406 27.668 179.646 27.6681 181.357 28.54C182.863 29.307 184.086 30.5308 184.853 32.0361C185.725 33.7474 185.725 35.9876 185.725 40.468V77.3889C185.725 78.7963 185.725 79.5 185.55 80.1519C185.394 80.7295 185.138 81.2753 184.793 81.7641C184.404 82.3159 183.863 82.7656 182.78 83.6651L103.886 149.22C101.703 151.034 100.611 151.941 99.3931 152.288C98.3193 152.593 97.1815 152.593 96.1077 152.288C94.8898 151.941 93.7983 151.034 91.6152 149.22Z"
                    fill={`url(#${ids.imageGradientShadowId})`}
                    fillOpacity="0.35"
                  />
                </g>
                <defs>
                  {/* Define a clipPath that matches the container shape for masking the cover image */}
                  <clipPath id={ids.imageClipId}>
                    <path d="M91.6152 149.22L12.7204 83.6651L12.7204 83.665C11.638 82.7656 11.0967 82.3159 10.7076 81.7641C10.3628 81.2753 10.1068 80.7295 9.95108 80.1519C9.77539 79.5 9.77539 78.7963 9.77539 77.3889V40.468C9.77539 35.9875 9.77539 33.7473 10.6473 32.036C11.4143 30.5308 12.6382 29.3069 14.1435 28.5399C15.8548 27.668 18.095 27.668 22.5754 27.668L172.925 27.668C177.406 27.668 179.646 27.6681 181.357 28.54C182.863 29.307 184.086 30.5308 184.853 32.0361C185.725 33.7474 185.725 35.9876 185.725 40.468V77.3889C185.725 78.7963 185.725 79.5 185.55 80.1519C185.394 80.7295 185.138 81.2753 184.793 81.7641C184.404 82.3159 183.863 82.7656 182.78 83.6651L103.886 149.22C101.703 151.034 100.611 151.941 99.3931 152.288C98.3193 152.593 97.1815 152.593 96.1077 152.288C94.8898 151.941 93.7983 151.034 91.6152 149.22Z" />
                  </clipPath>
                  <filter
                    id={ids.imageFilterId}
                    x="6.37539"
                    y="26.818"
                    width="182.75"
                    height="132.499"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feDropShadow dx="0" dy="-2" stdDeviation="3" floodColor="#FFFFFF" floodOpacity="1" result="ds" />
                    <feBlend mode="normal" in="SourceGraphic" in2="ds" result="shape" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dy="0" />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
                    <feBlend mode="normal" in2="shape" result="effect2_innerShadow" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dy="0" />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.2 0" />
                    <feBlend mode="normal" in2="effect2_innerShadow" result="effect3_innerShadow" />
                  </filter>
                  <linearGradient
                    id={ids.imageGradientSoftLightId}
                    x1="21"
                    y1="28"
                    x2="140"
                    y2="191"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="white" stopOpacity="0.1" />
                    <stop offset="1" stopColor="white" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient
                    id={ids.imageGradientShadowId}
                    x1="97"
                    y1="83"
                    x2="97"
                    y2="154"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopOpacity="0" />
                    <stop offset="1" />
                  </linearGradient>
                  <linearGradient
                    id={ids.gridCellGradId}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                    gradientUnits="objectBoundingBox"
                  >
                    <stop offset="0" stopColor="white" stopOpacity="0.5" />
                    <stop offset="1" stopColor="white" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            {/* Image Container Fade (duplicate shape, black gradient fill) */}
            <div
              className="absolute"
              style={{
                left: '51.25px',
                top: '83px',
                width: '195.5px',
                height: '220.575px',
                zIndex: 99,
                pointerEvents: 'none'
              }}
              data-name="Image Container Fade"
            >
              <svg
                preserveAspectRatio="none"
                width="100%"
                height="100%"
                overflow="visible"
                style={{ display: 'block' }}
                viewBox="0 0 196 221"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  filter={`url(#${ids.imageFadeFilterId})`}
                  d="M91.6152 149.22L12.7204 83.6651L12.7204 83.665C11.638 82.7656 11.0967 82.3159 10.7076 81.7641C10.3628 81.2753 10.1068 80.7295 9.95108 80.1519C9.77539 79.5 9.77539 78.7963 9.77539 77.3889V40.468C9.77539 35.9875 9.77539 33.7473 10.6473 32.036C11.4143 30.5308 12.6382 29.3069 14.1435 28.5399C15.8548 27.668 18.095 27.668 22.5754 27.668L172.925 27.668C177.406 27.668 179.646 27.6681 181.357 28.54C182.863 29.307 184.086 30.5308 184.853 32.0361C185.725 33.7474 185.725 35.9876 185.725 40.468V77.3889C185.725 78.7963 185.725 79.5 185.55 80.1519C185.394 80.7295 185.138 81.2753 184.793 81.7641C184.404 82.3159 183.863 82.7656 182.78 83.6651L103.886 149.22C101.703 151.034 100.611 151.941 99.3931 152.288C98.3193 152.593 97.1815 152.593 96.1077 152.288C94.8898 151.941 93.7983 151.034 91.6152 149.22Z"
                  fill="url(#paintImgFadeOverlay)"
                  style={{ mixBlendMode: 'normal' }}
                />
                <defs>
                  <filter
                    id={ids.imageFadeFilterId}
                    x="-60"
                    y="-60"
                    width="316"
                    height="341"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                  >
                    <feDropShadow dx="0" dy="-2" stdDeviation="4" floodColor="#FFFFFF" floodOpacity="0.65" />
                  </filter>
                  <linearGradient
                    id="paintImgFadeOverlay"
                    x1="98"
                    y1="300"
                    x2="98"
                    y2="150"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0" stopColor={overlayDarkColor} stopOpacity="0.45" />
                    <stop offset="1" stopColor={overlayDarkColor} stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            {/* Image Badge - positioned above fade overlay */}
            <div
              className="absolute"
              style={{
                left: '65px',
                top: '115.5px',
                width: '165px',
                height: '45px',
                borderRadius: '4px',
                overflow: 'hidden',
                zIndex: 100,
                pointerEvents: 'none'
              }}
            >
              {/* Cover image under gradient */}
              <Image
                src={boxImage}
                alt=""
                fill
                sizes="160px"
                priority={false}
                style={{ objectFit: 'cover' }}
              />
              {/* Gradient overlay on top */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 20%)',
                }}
              />
            </div>
          </div>

          

          {/* Envelope Dot Pattern layer removed for now */}

          

          

          {/* Union Shape - wavy bottom border */}
          <div
            className="absolute"
            style={{
              bottom: 0,
              left: 0,
              right: 0,
              height: '36px',
              zIndex: 10
            }}
            data-name="Union"
            data-node-id="1467:49199"
          >
            {/* Background blur layer */}
            <div
              className="absolute inset-0"
              style={{
                backdropFilter: 'blur(1.5px)',
                WebkitBackdropFilter: 'blur(2px)',
                pointerEvents: 'none'
              }}
              aria-hidden="true"
            />
            <div className="absolute" style={{ left: '-1.39%', top: '-1.39%', right: '-0.17%', bottom: '-1.39%' }}>
              <svg
                preserveAspectRatio="none"
                width="100%"
                height="100%"
                overflow="visible"
                style={{ display: 'block' }}
                viewBox="0 0 301 37"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g filter={`url(#${ids.unionFilterId})`}>
                  <path
                    d="M90.9043 0.5C94.3036 0.5 96.0037 0.500074 97.1426 0.84668C98.6143 1.29459 98.7142 1.34859 99.9014 2.32715C100.82 3.08449 102.535 5.66737 105.964 10.833C110.441 17.5773 118.103 22.0234 126.805 22.0234H172.805C181.507 22.0234 189.169 17.5773 193.646 10.833C197.074 5.66737 198.789 3.08449 199.708 2.32715C200.895 1.3486 200.995 1.29459 202.467 0.84668C203.606 0.500074 205.306 0.5 208.705 0.5H300.5V36.5H0.5V0.5H90.9043Z"
                    fill={`url(#${ids.unionGradientId})`}
                  />
                </g>
                <defs>
                  <filter
                    id={ids.unionFilterId}
                    x="-24"
                    y="-24"
                    width="349"
                    height="85"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feOffset dy="0" />
                    <feGaussianBlur stdDeviation="0" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0" />
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow" />
                  </filter>
                  <linearGradient
                    id={ids.unionGradientId}
                    x1="150.5"
                    y1="36.5"
                    x2="150.5"
                    y2="-7.5"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="white" />
                    <stop offset="1" stopColor="white" stopOpacity="0.5" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        <Footer
          isDone={isDone}
          isHovered={isHovered}
          animatedProgress={animatedProgress}
          animatedCurrent={animatedCurrent}
          validatedTotal={validatedProgress.total}
        />
        {/* Gift Message - original styling (restored) */}
        <div
          className="bg-white content-stretch flex flex-col gap-[4px] items-start leading-[1.4] not-italic relative shrink-0 text-center pb-[16px] pt-0 px-[16px] w-full"
          data-name="Gift Message"
          style={{ order: 1 }}
        >
          <p
            className="[white-space-collapse:collapse] font-['Goody_Sans:Medium',sans-serif] h-[22px] overflow-ellipsis overflow-hidden relative shrink-0 text-[16px] text-black text-nowrap w-[268px]"
            style={{
              fontFamily: 'var(--font-goody-sans)',
              fontSize: '16px',
              fontWeight: 500,
              lineHeight: 1.4,
              color: TOKENS.colors.text.primary
            }}
          >
            {giftTitle}
          </p>
          <p
            className="font-['Goody_Sans:Regular',sans-serif] h-[22px] relative shrink-0 text-[#525f7a] text-[14px] w-[268px]"
            style={{
              fontFamily: 'var(--font-goody-sans)',
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: 1.4,
              color: TOKENS.colors.text.secondary
            }}
          >
            {giftSubtitle}
          </p>
        </div>
      </div>
    </div>
  )
}

export default React.memo(SentCard)
