'use client'

import React, { useRef, useMemo } from 'react'
import Image from 'next/image'
import { TOKENS } from '@/constants/tokens'
import useDominantColor from '@/hooks/useDominantColor'
import useCardTheme from '@/hooks/useCardTheme'
import useProgressAnimation from '@/hooks/useProgressAnimation'
import useConfetti from '@/hooks/useConfetti'
import useComponentIds from '@/hooks/useComponentIds'
import { capSaturation, adjustToLuminance } from '@/utils/colors'
import useHover from '@/hooks/useHover'
import Footer from '@/components/sent-card/Footer'
import EnvelopeBase from '@/components/sent-card/EnvelopeBase'
import CardShape from '@/components/sent-card/CardShape'
import GiftBoxContainer from '@/components/sent-card/GiftBoxContainer'
import EnvelopeBoxContainer from '@/components/sent-card/EnvelopeBoxContainer'
import { PROGRESS_PILL_RADIUS, HEADER_OVERLAY_BG, PROGRESS_GLOW_BOX_SHADOW, ENVELOPE_DIMENSIONS, FOOTER_CONFIG } from '@/constants/sentCardConstants'

// Gift container images (brand names)
const GIFT_CONTAINER_IMAGES = [
  '/assets/GiftSent/Gift Container/Apple.png',
  '/assets/GiftSent/Gift Container/Chipotle.png',
  '/assets/GiftSent/Gift Container/Columbia.png',
  '/assets/GiftSent/Gift Container/Goody.png',
  '/assets/GiftSent/Gift Container/Nike.png',
  '/assets/GiftSent/Gift Container/Supergoop.png',
  '/assets/GiftSent/Gift Container/Tiffany & Co.png'
]

// Map PNG logos to SVG logos for text emboss styling
const LOGO_PNG_TO_SVG_MAP = {
  '/assets/GiftSent/Gift Container/Apple.png': '/assets/GiftSent/SVG Logo/Apple.svg',
  '/assets/GiftSent/Gift Container/Chipotle.png': '/assets/GiftSent/SVG Logo/Chipotle.svg',
  '/assets/GiftSent/Gift Container/Columbia.png': '/assets/GiftSent/SVG Logo/Logo.svg', // Using Logo.svg as default/fallback
  '/assets/GiftSent/Gift Container/Goody.png': '/assets/GiftSent/SVG Logo/Goody.svg',
  '/assets/GiftSent/Gift Container/Nike.png': '/assets/GiftSent/SVG Logo/Nike.svg',
  '/assets/GiftSent/Gift Container/Supergoop.png': '/assets/GiftSent/SVG Logo/Supergoop.svg',
  '/assets/GiftSent/Gift Container/Tiffany & Co.png': '/assets/GiftSent/SVG Logo/Tiffany & Co.svg',
}

// Map SVG logo paths to brand colors
const LOGO_BRAND_COLORS = {
  '/assets/GiftSent/SVG Logo/Goody.svg': '#DACCFF',
  '/assets/GiftSent/SVG Logo/Chipotle.svg': '#AC2318',
  '/assets/GiftSent/SVG Logo/Logo.svg': '#1987C7', // Columbia
  '/assets/GiftSent/SVG Logo/Nike.svg': '#B8B8B8',
  '/assets/GiftSent/SVG Logo/Apple.svg': '#D6D6D6',
  '/assets/GiftSent/SVG Logo/Supergoop.svg': '#0000B4',
  '/assets/GiftSent/SVG Logo/Tiffany & Co.svg': '#81D8D0',
}

const SentCard1 = ({
  from = 'Alex Torres',
  title = 'Marketing Strategy Update',
  boxImage = '/assets/covers/Onboarding 03.png',
  giftTitle = "Biggest Thanks",
  giftSubtitle = 'Collection by Goody',
  progress = { current: 3, total: 6 },
  sentDate = '1 week ago',
  headerBgOverride = null,
  hideUnion = false,
  footerPadEqual = false,
  envelopeScale = 1,
  envelopeOffsetY = 0,
  confettiWhiteOverlay = false,
  envelopeHighZ = false,
  overlayProgressOnEnvelope = false,
  showFooterProgress = true,
  progressOutsideEnvelope = false,
  showFooterReminder = true,
  footerBottomPadding = 16,
  footerTopPadding,
  footerTransparent = false,
  // Header controls (for all layouts)
  headerHeight, // Default layout header height
  headerUseFlex, // Default layout header useFlex
  // Altered Layout 1 specific controls
  headerHeight1,
  headerUseFlex1,
  // Altered Layout 2 specific envelope controls
  envelopeScale2,
  envelopeOffsetY2,
  envelopeLeft2,
  envelopeRight2,
  envelopeTopBase2,
  headerHeight2,
  headerUseFlex2,
  transformOrigin2,
  // Altered Layout 2 specific footer controls
  footerTopPadding2,
  footerBottomPadding2,
  footerPadEqual2,
  footerTransparent2,
  // Altered Layout 2 specific progress bar controls
  progressBottomPadding2,
  // Gift container mode (replaces envelope with gift container images)
  useGiftContainer = false,
  // Hide envelope (makes container empty)
  hideEnvelope = false,
  // Show gift box when envelope is hidden (for Single 2)
  showGiftBoxWhenHidden = false,
  // Gift container exclusive controls (for Single 1)
  giftContainerOffsetY,
  giftContainerScale,
  giftContainerWidth,
  giftContainerHeight,
  giftContainerTop,
  giftContainerLeft,
  giftContainerRight,
  giftContainerBottom,
  giftContainerTransformOrigin
}) => {
  // Hooks
  const cardRef = useRef(null)
  const confettiCanvasRef = useRef(null)
  const { isHovered, handleHoverEnter, handleHoverLeave } = useHover()
  
  // Generate stable IDs for SVG elements
  const ids = useComponentIds(boxImage, from)
  
  // Progress animation
  const {
    animatedProgress,
    animatedCurrent,
    validatedProgress,
    isDone
  } = useProgressAnimation(progress)
  
  // Select gift container image based on progress (cycle through brands) - only when useGiftContainer is true
  const giftContainerImage = useMemo(() => {
    if (!useGiftContainer) return null
    // Map progress to image index (0-6 for brands)
    const progressRatio = validatedProgress.total > 0 
      ? validatedProgress.current / validatedProgress.total 
      : 0
    const index = Math.min(6, Math.floor(progressRatio * 7))
    return GIFT_CONTAINER_IMAGES[index]
  }, [useGiftContainer, validatedProgress.current, validatedProgress.total])
  
  // Map PNG logo to SVG logo for Single 2 (GiftBoxContainer) text emboss styling
  // For Single 2, select logo based on progress (similar to giftContainerImage but for SVG)
  const svgLogoPath = useMemo(() => {
    // For Single 2 (hideEnvelope && showGiftBoxWhenHidden), select logo based on progress
    if (hideEnvelope && showGiftBoxWhenHidden) {
      const progressRatio = validatedProgress.total > 0 
        ? validatedProgress.current / validatedProgress.total 
        : 0
      const index = Math.min(6, Math.floor(progressRatio * 7))
      const pngPath = GIFT_CONTAINER_IMAGES[index]
      return LOGO_PNG_TO_SVG_MAP[pngPath] || '/assets/GiftSent/SVG Logo/Logo.svg'
    }
    // For Single 1 (useGiftContainer), use mapped logo
    if (giftContainerImage) {
      return LOGO_PNG_TO_SVG_MAP[giftContainerImage] || '/assets/GiftSent/SVG Logo/Logo.svg'
    }
    // Default fallback
    return '/assets/GiftSent/SVG Logo/Logo.svg'
  }, [hideEnvelope, showGiftBoxWhenHidden, giftContainerImage, validatedProgress.current, validatedProgress.total])

  // Single 2 Logo Brand Color Controls
  // These values control the saturation and luminance for Single 2 logo brand colors
  const SINGLE2_LOGO_LUMINANCE = 100  // Luminance for logo brand colors (0-100)
  const SINGLE2_LOGO_SATURATION = 35  // Saturation for logo brand colors (0-100)

  // Calculate logo brand color with Single 2 saturation/luminance caps
  // These values are controlled independently from Batch 2
  // Brand colors are enabled by default - always use brand color, never fall back to blue placeholder
  const logoBrandColor = useMemo(() => {
    const brandColor = LOGO_BRAND_COLORS[svgLogoPath]
    // If no brand color mapping found, use Columbia blue as fallback (not the old placeholder blue)
    const colorToUse = brandColor || '#1987C7' // Columbia blue as default
    
    // Apply Single 2 logo saturation and luminance caps
    // These are independent from Batch 2 envelope values
    const luminanceAdjusted = adjustToLuminance(colorToUse, SINGLE2_LOGO_LUMINANCE)
    const finalColor = capSaturation(luminanceAdjusted, SINGLE2_LOGO_SATURATION)
    
    return finalColor
  }, [svgLogoPath])
  
  // Extract dominant color from gift container image (for Single 1) or boxImage (for other layouts)
  const imageForColorExtraction = useGiftContainer && giftContainerImage ? giftContainerImage : boxImage
  const { dominantColor } = useDominantColor(imageForColorExtraction, '#f4c6fa')
  const theme = useCardTheme(dominantColor, headerBgOverride)
  const {
    headerBgFinal,
    isMonochromeVariant,
    headerTextClass,
    baseTintColor,
    base2TintColor,
    overlayDarkColor,
    gridCellBaseColor,
    progressStartColor,
    progressEndColor
  } = theme
  
  // Calculate themed box color for GiftBoxContainer
  // For Single 2 cards, use brand color instead of blue placeholder
  const themedBoxColor = useMemo(() => {
    // For Single 2 cards (hideEnvelope && showGiftBoxWhenHidden), use brand color
    if (hideEnvelope && showGiftBoxWhenHidden && logoBrandColor) {
      return logoBrandColor // Use brand color with Batch 2 caps applied
    }
    if (headerBgOverride) return '#94d8f9' // Default when theming is disabled
    // Create a light, vibrant box color from dominant color
    return capSaturation(adjustToLuminance(dominantColor, 85), 70)
  }, [dominantColor, headerBgOverride, hideEnvelope, showGiftBoxWhenHidden, logoBrandColor])

  // Batch 2 Envelope and Flap Color Controls
  // These values control the saturation and luminance for Batch 2 card theming
  const BATCH2_ENVELOPE_LUMINANCE = 100  // Luminance for envelope box (0-100)
  const BATCH2_ENVELOPE_SATURATION = 28 // Saturation for envelope box (0-100)
  const BATCH2_ENVELOPE_OPACITY = 1.0   // Opacity for envelope box (0-1)
  const BATCH2_FLAP_LUMINANCE = 100      // Luminance for flap (0-100)
  const BATCH2_FLAP_SATURATION = 100     // Saturation for flap (0-100)
  const BATCH2_FLAP_OPACITY = 1.0        // Opacity for flap (0-1)
  const BATCH2_PROGRESS_SHADOW_LUMINANCE = 95  // Luminance for progress indicator shadow (0-100, darker = lower value)
  const BATCH2_PROGRESS_SHADOW_SATURATION = 95 // Saturation for progress indicator shadow (0-100)
  
  // Batch 2 Envelope Container Spacing Controls
  const BATCH2_ENVELOPE_PADDING = { top: 21, right: 76, bottom: 21, left: 76 } // Padding for envelope container (px) - separate top, right, bottom, left
  const BATCH2_ENVELOPE_MARGIN = { top: 0, right: 0, bottom: 30, left: 0 } // Margin for envelope container (px) - separate top, right, bottom, left

  // For Batch 2 envelope: always use themed color (not conditional on toggle)
  // The envelope should always be themed based on dominant color
  const envelopeBoxColor = useMemo(() => {
    // Create envelope box color with controlled luminance and saturation
    return capSaturation(
      adjustToLuminance(dominantColor, BATCH2_ENVELOPE_LUMINANCE),
      BATCH2_ENVELOPE_SATURATION
    )
  }, [dominantColor])

  // Separate color for flap theming with independent saturation and luminance controls
  const envelopeFlapColor = useMemo(() => {
    // Create flap color with its own luminance and saturation values
    return capSaturation(
      adjustToLuminance(dominantColor, BATCH2_FLAP_LUMINANCE),
      BATCH2_FLAP_SATURATION
    )
  }, [dominantColor])

  // Progress indicator shadow color - themed separately
  const progressIndicatorShadowColor = useMemo(() => {
    // Create shadow color with controlled luminance and saturation
    // Lower luminance = darker shadow
    return capSaturation(
      adjustToLuminance(dominantColor, BATCH2_PROGRESS_SHADOW_LUMINANCE),
      BATCH2_PROGRESS_SHADOW_SATURATION
    )
  }, [dominantColor])
  
  const allAccepted = isDone
  
  // Confetti animation
  useConfetti(isHovered, allAccepted, confettiCanvasRef, cardRef)

  // Memoized style objects
  const cardContainerStyle = useMemo(() => ({
    borderRadius: TOKENS.sizes.borderRadius.card,
    height: 'auto',
    ...(headerUseFlex && headerHeight !== undefined && !overlayProgressOnEnvelope && !progressOutsideEnvelope
      ? { minHeight: '400px' }
      : overlayProgressOnEnvelope && headerUseFlex1 && headerHeight1 !== undefined && !progressOutsideEnvelope
      ? { minHeight: '400px' }
      : {})
  }), [headerUseFlex, headerHeight, overlayProgressOnEnvelope, progressOutsideEnvelope, headerUseFlex1, headerHeight1])

  const contentWrapperStyle = useMemo(() => ({
    paddingBottom: progressOutsideEnvelope ? '0px' : undefined,
    ...(progressOutsideEnvelope && headerHeight2 !== undefined 
      ? { minHeight: '400px' } 
      : headerUseFlex && headerHeight !== undefined && !overlayProgressOnEnvelope && !progressOutsideEnvelope
      ? { minHeight: '400px' }
      : overlayProgressOnEnvelope && headerUseFlex1 && headerHeight1 !== undefined && !progressOutsideEnvelope
      ? { minHeight: '400px' }
      : {})
  }), [progressOutsideEnvelope, headerHeight2, headerUseFlex, headerHeight, overlayProgressOnEnvelope, headerUseFlex1, headerHeight1])

  const fullCardBackgroundStyle = useMemo(() => ({
    borderRadius: TOKENS.sizes.borderRadius.card,
    zIndex: 0
  }), [])

  const confettiCanvasStyle = useMemo(() => ({
    zIndex: 1,
    pointerEvents: 'none',
    filter: 'blur(2.5px)'
  }), [])

  const confettiWhiteOverlayStyle = useMemo(() => ({
    zIndex: 2,
    background: 'linear-gradient(to top, rgba(255,255,255,0.8) 0%, rgba(255, 255, 255, 0.33) 30%, rgba(255,255,255,0.0) 100%)'
  }), [])

  const headerBgBaseStyle = useMemo(() => ({
    backgroundColor: headerBgFinal,
    transition: 'background 200ms ease-out, filter 200ms ease-out'
  }), [headerBgFinal])

  const gradientOverlayStyle = useMemo(() => ({
    background: HEADER_OVERLAY_BG,
    mixBlendMode: 'overlay',
    zIndex: 0
  }), [])

  const headerSectionStyle = useMemo(() => ({
    position: 'relative',
    zIndex: overlayProgressOnEnvelope ? 1 : 'auto',
    ...(hideEnvelope
      ? { flex: 1, minHeight: '280px' }
      : progressOutsideEnvelope && headerHeight2 !== undefined && headerUseFlex2
      ? { flex: 1, minHeight: `${headerHeight2}px` }
      : overlayProgressOnEnvelope && headerHeight1 !== undefined && headerUseFlex1
      ? { flex: 1, minHeight: `${headerHeight1}px` }
      : overlayProgressOnEnvelope && headerUseFlex1
      ? { flex: 1, minHeight: '280px' }
      : headerUseFlex && headerHeight !== undefined
      ? { flex: 1, minHeight: `${headerHeight}px` }
      : { height: headerHeight !== undefined ? `${headerHeight}px` : '280px' })
  }), [hideEnvelope, progressOutsideEnvelope, headerHeight2, headerUseFlex2, overlayProgressOnEnvelope, headerHeight1, headerUseFlex1, headerUseFlex, headerHeight])

  const backgroundBorderRadiusStyle = useMemo(() => ({
    borderRadius: `${TOKENS.sizes.borderRadius.card} ${TOKENS.sizes.borderRadius.card} 0 0`
  }), [])

  const sentDateTextStyle = useMemo(() => ({
    fontFamily: 'var(--font-goody-sans)',
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: 1.4,
    opacity: 0.8,
    color: headerBgOverride ? TOKENS.colors.text.tertiary : '#ffffff'
  }), [headerBgOverride])

  const titleTextStyle = useMemo(() => ({
    fontFamily: 'var(--font-hw-cigars)',
    fontSize: '24px',
    fontWeight: 400,
    lineHeight: 1.2,
    letterSpacing: '-0.36px'
  }), [])

  const dotsBackgroundStyle = useMemo(() => ({
    left: '50%',
    top: '75%',
    transform: 'translate(-50%, -50%)',
    width: '300px',
    height: '300px',
    zIndex: 0,
    pointerEvents: 'none',
    opacity: 1,
    position: 'absolute'
  }), [])

  const dotsImageStyle = useMemo(() => ({
    objectFit: 'contain',
    width: '100%',
    height: '100%',
    display: 'block'
  }), [])

  const envelopeContainerStyle = useMemo(() => {
    // Only apply Batch 2 padding/margin when it's Batch 2 (EnvelopeBoxContainer), not Single 2 (GiftBoxContainer)
    const isBatch2 = hideEnvelope && !showGiftBoxWhenHidden
    
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...(hideEnvelope
        ? {
            position: 'relative',
            width: '100%',
            height: '100%',
            flex: 1,
            minHeight: 0,
            overflow: 'visible',
            ...(isBatch2 ? {
              paddingTop: `${BATCH2_ENVELOPE_PADDING.top}px`,
              paddingRight: `${BATCH2_ENVELOPE_PADDING.right}px`,
              paddingBottom: `${BATCH2_ENVELOPE_PADDING.bottom}px`,
              paddingLeft: `${BATCH2_ENVELOPE_PADDING.left}px`,
              marginTop: `${BATCH2_ENVELOPE_MARGIN.top}px`,
              marginRight: `${BATCH2_ENVELOPE_MARGIN.right}px`,
              marginBottom: `${BATCH2_ENVELOPE_MARGIN.bottom}px`,
              marginLeft: `${BATCH2_ENVELOPE_MARGIN.left}px`,
              boxSizing: 'border-box'
            } : {})
          }
      : useGiftContainer && giftContainerTop !== undefined
      ? {
          top: `${giftContainerTop + (giftContainerOffsetY !== undefined ? giftContainerOffsetY : 0)}px`,
          left: giftContainerLeft !== undefined ? `${giftContainerLeft}px` : undefined,
          right: giftContainerRight !== undefined ? `${giftContainerRight}px` : undefined,
          bottom: giftContainerBottom !== undefined ? `${giftContainerBottom}px` : 'auto'
        }
      : useGiftContainer
      ? {
          top: `${4 + (giftContainerOffsetY !== undefined ? giftContainerOffsetY : 0)}px`,
          left: '-2px',
          right: '2px',
          bottom: '0px'
        }
      : progressOutsideEnvelope && envelopeTopBase2 !== undefined 
      ? {
          top: `${envelopeTopBase2 + (envelopeOffsetY2 !== undefined ? envelopeOffsetY2 : envelopeOffsetY)}px`,
          left: envelopeLeft2 !== undefined ? `${envelopeLeft2}px` : '0px',
          right: envelopeRight2 !== undefined ? `${envelopeRight2}px` : '0px',
          bottom: 'auto'
        }
      : {
          top: `${4 + envelopeOffsetY}px`,
          left: '0px',
          right: '0px',
          bottom: '0px'
        }),
    zIndex: envelopeHighZ ? 50 : (overlayProgressOnEnvelope ? 2 : 2),
    transform: hideEnvelope ? 'none' : `scale(${useGiftContainer && giftContainerScale !== undefined ? giftContainerScale : (progressOutsideEnvelope && envelopeScale2 !== undefined ? envelopeScale2 : envelopeScale)})`,
    transformOrigin: hideEnvelope ? 'center center' : (useGiftContainer && giftContainerTransformOrigin !== undefined ? giftContainerTransformOrigin : (progressOutsideEnvelope && transformOrigin2 !== undefined ? transformOrigin2 : 'center top'))
  }}, [hideEnvelope, showGiftBoxWhenHidden, useGiftContainer, giftContainerTop, giftContainerOffsetY, giftContainerLeft, giftContainerRight, giftContainerBottom, progressOutsideEnvelope, envelopeTopBase2, envelopeOffsetY2, envelopeOffsetY, envelopeLeft2, envelopeRight2, envelopeHighZ, overlayProgressOnEnvelope, giftContainerScale, envelopeScale2, envelopeScale, giftContainerTransformOrigin, transformOrigin2, BATCH2_ENVELOPE_PADDING, BATCH2_ENVELOPE_MARGIN])

  const giftContainerWrapperStyle = useMemo(() => ({
    position: 'relative',
    width: giftContainerWidth !== undefined ? `${giftContainerWidth}px` : '250px',
    height: giftContainerHeight !== undefined ? `${giftContainerHeight}px` : '200px',
    pointerEvents: 'none'
  }), [giftContainerWidth, giftContainerHeight])

  const giftContainerImageStyle = useMemo(() => ({
    objectFit: 'contain'
  }), [])

  const envelopeBaseWrapperStyle = useMemo(() => ({
    position: 'relative',
    width: '100%',
    height: '100%'
  }), [])

  return (
    <div
      data-variant={headerBgOverride ? 'mono' : 'themed'}
      ref={cardRef}
      onMouseEnter={handleHoverEnter}
      onMouseLeave={handleHoverLeave}
      className="border border-[#dde2e9] border-solid relative rounded-[24px] w-full md:w-[300px] overflow-hidden"
      style={cardContainerStyle}
      data-name="Gift Card"
      data-node-id="1467:49182"
    >
      <div 
        className={`content-stretch flex flex-col items-start ${isMonochromeVariant ? 'overflow-visible' : 'overflow-hidden'} relative rounded-[inherit] w-full ${(progressOutsideEnvelope && headerHeight2 !== undefined) || (headerUseFlex && headerHeight !== undefined && !overlayProgressOnEnvelope && !progressOutsideEnvelope) || (overlayProgressOnEnvelope && headerUseFlex1 && headerHeight1 !== undefined && !progressOutsideEnvelope) ? 'h-full' : ''}`} 
        style={contentWrapperStyle}
      >
        {/* Full card background when overlayProgressOnEnvelope is true */}
        {overlayProgressOnEnvelope && (
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={fullCardBackgroundStyle}
          >
            {/* Confetti canvas (behind envelope) */}
            <canvas
              ref={confettiCanvasRef}
              className="absolute inset-0"
              style={{ zIndex: 1, pointerEvents: 'none', filter: 'blur(2.5px)' }}
            />
            {confettiWhiteOverlay && (
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                  zIndex: 2,
                  background:
                    'linear-gradient(to top, rgba(255,255,255,0.8) 0%, rgba(255, 255, 255, 0.33) 30%, rgba(255,255,255,0.0) 100%)'
                }}
              />
            )}
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
                mixBlendMode: 'overlay',
                zIndex: 0
              }}
            />
          </div>
        )}
        {/* Header Section - 280px tall */}
        <div
          className={`box-border content-stretch flex flex-col items-center ${hideEnvelope ? 'justify-center' : 'justify-between'} ${hideEnvelope ? 'pt-[20px] pb-0' : 'pb-0 pt-[20px]'} px-0 relative w-full overflow-visible ${(progressOutsideEnvelope && headerUseFlex2) || (overlayProgressOnEnvelope && headerUseFlex1) || headerUseFlex ? '' : 'shrink-0'}`}
          style={headerSectionStyle}
          data-name="Header"
          data-node-id="1467:49183"
        >
          {/* Background with gradient overlay - only when overlayProgressOnEnvelope is false */}
          {!overlayProgressOnEnvelope && (
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={backgroundBorderRadiusStyle}
            >
              {/* Confetti canvas (behind envelope) */}
              <canvas
                ref={confettiCanvasRef}
                className="absolute inset-0"
                style={confettiCanvasStyle}
              />
              {confettiWhiteOverlay && (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none"
                  style={confettiWhiteOverlayStyle}
                />
              )}
              {/* Base color - dynamic from dominant color */}
              <div
                className="absolute inset-0"
                data-name="HeaderBGBase"
                style={headerBgBaseStyle}
              />
              {/* Gradient overlay with blend mode */}
              <div
                className="absolute inset-0"
                style={gradientOverlayStyle}
              />
            </div>
          )}

          {/* Dots pattern removed */}

          {/* Header Content */}
          <div
            className={`box-border content-stretch flex flex-col gap-[8px] items-center not-italic px-[16px] py-0 relative shrink-0 text-center text-nowrap ${headerTextClass} w-full z-10`}
            data-name="Header"
            data-node-id="1467:49184"
          >
            <p
              className="font-['Goody_Sans:Regular',sans-serif] leading-[1.4] opacity-80 relative shrink-0 text-[16px] whitespace-pre"
              style={sentDateTextStyle}
              data-node-id="1467:49185"
            >
              {sentDate} • {from}
            </p>
            <p
              className="[white-space-collapse:collapse] font-['HW_Cigars:Regular',sans-serif] leading-[1.2] min-w-full overflow-ellipsis overflow-hidden relative shrink-0 text-[24px] tracking-[-0.36px] w-[min-content]"
              style={titleTextStyle}
              data-node-id="1467:49186"
            >
              {title}
            </p>
          </div>

          {/* Dots background - behind envelope (for Batch 3) - positioned relative to header */}
          {progressOutsideEnvelope && (
            <div
              className="absolute"
              style={dotsBackgroundStyle}
              aria-hidden="true"
            >
              <Image
                src="/assets/GiftSent/Gift Container/Dots-3x.png"
                alt=""
                width={210}
                height={150}
                priority={false}
                quality={100}
                unoptimized={true}
                style={dotsImageStyle}
              />
            </div>
          )}

          {/* Envelope Container - children positioned relative to header */}
          <div
            className={`${hideEnvelope ? 'relative flex-1' : 'absolute'} ${hideEnvelope ? '' : (useGiftContainer && giftContainerTop !== undefined ? '' : (progressOutsideEnvelope && envelopeTopBase2 !== undefined ? '' : 'inset-0'))}`}
            style={envelopeContainerStyle}
            data-name={useGiftContainer ? "Gift Container" : "Envelope"}
            data-node-id="1467:49190"
          >
            {hideEnvelope && showGiftBoxWhenHidden ? (
              // Gift Box Container (for Single 2)
              <GiftBoxContainer
                progress={validatedProgress}
                boxColor={themedBoxColor}
                isHovered={isHovered}
                logoPath={svgLogoPath}
                logoBrandColor={logoBrandColor}
              />
            ) : hideEnvelope ? (
              // Envelope Box Container (for Batch 2)
              // Always use themed color for envelope (not conditional on toggle)
              <EnvelopeBoxContainer
                progress={validatedProgress}
                boxImage={boxImage}
                boxColor={envelopeBoxColor}
                flapColor={envelopeFlapColor}
                boxOpacity={BATCH2_ENVELOPE_OPACITY}
                flapOpacity={BATCH2_FLAP_OPACITY}
                progressIndicatorShadowColor={progressIndicatorShadowColor}
                containerPadding={BATCH2_ENVELOPE_PADDING}
                containerMargin={BATCH2_ENVELOPE_MARGIN}
                isHovered={isHovered}
              />
            ) : useGiftContainer ? (
              // Gift Container Image (replaces envelope)
              <div style={giftContainerWrapperStyle}>
                <Image
                  src={giftContainerImage}
                  alt="Gift Container"
                  fill
                  sizes="200px"
                  priority={true}
                  quality={100}
                  unoptimized={true}
                  style={giftContainerImageStyle}
                />
              </div>
            ) : (
              <>
                {/* Base (envelope base) - moved inside Envelope so it moves together */}
                <div style={envelopeBaseWrapperStyle}>
                  <EnvelopeBase ids={ids} baseTintColor={baseTintColor} />
              {overlayProgressOnEnvelope && !progressOutsideEnvelope && (
                <div
                  className="absolute"
                  style={{
                    left: '50%',
                    transform: 'translateX(-50%)',
                    // Position 10px gap from envelope base bottom
                    // Envelope base is at top: 83px, height: 220.575px
                    // So envelope base bottom is at 83 + 220.575 = 303.575px
                    // Progress bar height is 36px, so its top should be at 303.575 - 10 - 36 = 257.575px
                    top: `${parseFloat(ENVELOPE_DIMENSIONS.base.top) + parseFloat(ENVELOPE_DIMENSIONS.base.height.replace('px', '')) - 10 - 36}px`,
                    height: '36px',
                    zIndex: 3
                  }}
                  data-name="OverlayProgress"
                >
                  <div
                    className="bg-[#f0f1f5] border border-[rgba(221,226,233,0)] border-solid box-border content-stretch flex flex-col gap-[10px] items-start justify-center p-[2px] relative rounded-[100px] shrink-0"
                    style={{
                      borderRadius: PROGRESS_PILL_RADIUS,
                      backgroundColor: '#f0f1f5',
                      width: '120px'
                    }}
                  >
                    <div
                      className="bg-gradient-to-b box-border content-stretch flex flex-col from-[#5a3dff] gap-[10px] items-center justify-center px-[8px] py-[2px] relative rounded-[100px] shrink-0"
                      style={{
                        background: `linear-gradient(to bottom, ${progressStartColor}, ${progressEndColor})`,
                        borderRadius: PROGRESS_PILL_RADIUS,
                        width: isDone ? '100%' : `${animatedProgress}%`,
                        maxWidth: '100%',
                        minWidth: 'fit-content',
                        transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: PROGRESS_GLOW_BOX_SHADOW
                      }}
                    >
                      <p
                        className="font-['Goody_Sans:Medium',sans-serif] leading-[1.4] not-italic relative shrink-0 text-[14px] text-white text-center w-full"
                        style={{
                          fontFamily: 'var(--font-goody-sans)',
                          fontSize: '14px',
                          fontWeight: 500,
                          lineHeight: 1.4,
                          color: '#ffffff',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {isDone ? 'Done' : `${animatedCurrent}/${validatedProgress.total}`}
                      </p>
                      {/* highlight removed */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          boxShadow: '0px 3px 5px 2px inset rgba(255,255,255,0.5)',
                          borderRadius: PROGRESS_PILL_RADIUS
                        }}
                      />
                    </div>
                    <div
                      className="absolute inset-[-1px] pointer-events-none"
                      style={{
                        boxShadow: '0px 1px 2.25px 0px inset #c2c6d6, 0px -1px 2.25px 0px inset #ffffff',
                        borderRadius: PROGRESS_PILL_RADIUS
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            {/* Rectangle 1790 (card shape container) - moved inside Envelope */}
            <CardShape ids={ids} base2TintColor={base2TintColor} />
            {/* Image Container (hosts image) */}
            <div
              className="absolute"
              style={{
                left: ENVELOPE_DIMENSIONS.imageContainer.left,
                top: ENVELOPE_DIMENSIONS.imageContainer.top,
                width: ENVELOPE_DIMENSIONS.imageContainer.width,
                height: ENVELOPE_DIMENSIONS.imageContainer.height,
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
                left: ENVELOPE_DIMENSIONS.imageFade.left,
                top: ENVELOPE_DIMENSIONS.imageFade.top,
                width: ENVELOPE_DIMENSIONS.imageFade.width,
                height: ENVELOPE_DIMENSIONS.imageFade.height,
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
                left: ENVELOPE_DIMENSIONS.imageBadge.left,
                top: ENVELOPE_DIMENSIONS.imageBadge.top,
                width: ENVELOPE_DIMENSIONS.imageBadge.width,
                height: ENVELOPE_DIMENSIONS.imageBadge.height,
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
              </>
            )}
          </div>

          

          {/* Envelope Dot Pattern layer removed for now */}

          

          

          {/* Union Shape - wavy bottom border */}
          {!hideUnion && (
          <div
            className="absolute"
            style={{
              bottom: -.5,
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
                    {/* Inner shadow (white) toward top edge */}
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha2"
                    />
                    <feOffset dy="2" />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha2" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
                    <feBlend mode="normal" in2="effect1_innerShadow" result="effect2_innerShadow" />
                    {/* Duplicate inner shadow */}
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha3"
                    />
                    <feOffset dy="2" />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha3" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
                    <feBlend mode="normal" in2="effect2_innerShadow" result="effect3_innerShadow" />
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
          )}
        </div>

        <Footer
          isDone={isDone}
          isHovered={isHovered}
          animatedProgress={animatedProgress}
          animatedCurrent={animatedCurrent}
          validatedTotal={validatedProgress.total}
          infoTitle={giftTitle}
          infoSubtitle={giftSubtitle}
          equalPadding={
            progressOutsideEnvelope && footerPadEqual2 !== undefined
              ? footerPadEqual2
              : overlayProgressOnEnvelope
              ? FOOTER_CONFIG.altered1.equalPadding
              : footerPadEqual !== undefined
              ? footerPadEqual
              : FOOTER_CONFIG.default.equalPadding
          }
          showProgress={progressOutsideEnvelope ? false : showFooterProgress}
          showReminder={progressOutsideEnvelope ? false : showFooterReminder}
          infoInSlot={overlayProgressOnEnvelope}
          bottomPadding={
            progressOutsideEnvelope && footerBottomPadding2 !== undefined
              ? footerBottomPadding2
              : overlayProgressOnEnvelope
              ? FOOTER_CONFIG.altered1.bottomPadding
              : footerBottomPadding !== undefined
              ? footerBottomPadding
              : FOOTER_CONFIG.default.bottomPadding
          }
          topPadding={
            hideEnvelope
              ? 0
              : progressOutsideEnvelope && footerTopPadding2 !== undefined
              ? footerTopPadding2
              : overlayProgressOnEnvelope
              ? FOOTER_CONFIG.altered1.topPadding
              : footerTopPadding !== undefined
              ? footerTopPadding
              : FOOTER_CONFIG.default.topPadding
          }
          transparent={
            progressOutsideEnvelope && footerTransparent2 !== undefined
              ? footerTransparent2
              : overlayProgressOnEnvelope
              ? FOOTER_CONFIG.altered1.transparent
              : footerTransparent !== undefined
              ? footerTransparent
              : FOOTER_CONFIG.default.transparent
          }
          hideInfoOnHover={!progressOutsideEnvelope}
        />

        {/* Progress bar outside envelope (for Altered Layout 2) - positioned relatively under gift info */}
        {overlayProgressOnEnvelope && progressOutsideEnvelope && (
          <div
            className="relative shrink-0"
            style={{
              width: '100%',
              display: 'block',
              marginTop: '0px',
              paddingTop: '0px',
              paddingBottom: progressBottomPadding2 !== undefined ? `${progressBottomPadding2}px` : `${FOOTER_CONFIG.altered2.progressOutside.bottomPadding}px`,
              zIndex: 0,
              minHeight: '36px',
              flexShrink: 0
            }}
            data-name="OutsideProgress"
          >
            {/* Spacer to ensure container height includes padding */}
            <div style={{ height: '36px', width: '100%', pointerEvents: 'none' }} />
            {/* Progress bar */}
            <div
              style={{
                opacity: (isHovered && !isDone) ? 0 : 1,
                transition: 'opacity 200ms ease-out, transform 200ms ease-out',
                pointerEvents: (isHovered && !isDone) ? 'none' : 'auto',
                position: 'absolute',
                top: '0',
                left: '50%',
                transform: (isHovered && !isDone) ? 'translate(-50%, 4px)' : 'translate(-50%, 0)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
                <div
                  className="bg-[#f0f1f5] border border-[rgba(221,226,233,0)] border-solid box-border content-stretch flex flex-col gap-[10px] items-start justify-center p-[2px] relative rounded-[100px] shrink-0"
                  style={{
                    borderRadius: PROGRESS_PILL_RADIUS,
                    backgroundColor: '#f0f1f5',
                    width: '120px'
                  }}
                >
                  <div
                    className="bg-gradient-to-b box-border content-stretch flex flex-col from-[#5a3dff] gap-[10px] items-center justify-center px-[8px] py-[3px] relative rounded-[100px] shrink-0"
                    style={{
                      background: headerBgOverride === null 
                        ? `linear-gradient(to bottom, ${progressStartColor}, ${progressEndColor})`
                        : 'linear-gradient(to bottom, #5a3dff, #a799ff)',
                      borderRadius: PROGRESS_PILL_RADIUS,
                      width: isDone ? '100%' : `${animatedProgress}%`,
                      maxWidth: '100%',
                      minWidth: 'fit-content',
                      transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: PROGRESS_GLOW_BOX_SHADOW
                    }}
                  >
                    <p
                      className="font-['Goody_Sans:Medium',sans-serif] leading-[1.4] not-italic relative shrink-0 text-[14px] text-white text-center w-full"
                      style={{
                        fontFamily: 'var(--font-goody-sans)',
                        fontSize: '14px',
                        fontWeight: 500,
                        lineHeight: 1.4,
                        color: '#ffffff',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {isDone ? 'Done' : `${animatedCurrent}/${validatedProgress.total}`}
                    </p>
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        boxShadow: '0px 3px 5px 2px inset rgba(255,255,255,0.5)',
                        borderRadius: PROGRESS_PILL_RADIUS
                      }}
                    />
                  </div>
                  <div
                    className="absolute inset-[-1px] pointer-events-none"
                    style={{
                      boxShadow: '0px 1px 2.25px 0px inset #c2c6d6, 0px -1px 2.25px 0px inset #ffffff',
                      borderRadius: PROGRESS_PILL_RADIUS
                    }}
                  />
                </div>
              </div>
            {/* Reminder button - replaces progress bar on hover */}
            {showFooterReminder && !isDone && (
              <div
                style={{
                  opacity: isHovered ? 1 : 0,
                  transform: isHovered ? 'translate(-50%, 0)' : 'translate(-50%, 4px)',
                  transition: 'opacity 200ms ease-out, transform 200ms ease-out',
                  pointerEvents: isHovered ? 'auto' : 'none',
                  position: 'absolute',
                  top: '0',
                  left: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%'
                }}
              >
                <button
                  data-name="ReminderButton"
                  className="px-3.5 py-1 bg-white rounded-[12px] text-[#525F7A]"
                  style={{
                    outlineOffset: '-1px',
                    outlineWidth: '1px',
                    outlineStyle: 'solid',
                    outlineColor: 'var(--color-border)',
                    borderRadius: '12px',
                    height: '36px',
                    transition: 'transform 200ms ease-out, box-shadow 200ms ease-out, outline-color 200ms ease-out, background-color 200ms ease-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 24px -8px rgba(0,0,0,0.15), 0 3px 10px -4px rgba(0,0,0,0.10)'
                    e.currentTarget.style.outlineColor = '#cfd6e2'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.outlineColor = 'var(--color-border)'
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 6px 18px -8px rgba(0,0,0,0.15), 0 2px 8px -4px rgba(0,0,0,0.10)'
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 24px -8px rgba(0,0,0,0.15), 0 3px 10px -4px rgba(0,0,0,0.10)'
                  }}
                  type="button"
                >
                  Send a reminder
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default React.memo(SentCard1)
