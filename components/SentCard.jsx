'use client'

import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { TOKENS } from '@/constants/tokens'
import useDominantColor from '@/hooks/useDominantColor'
import useCardTheme from '@/hooks/useCardTheme'
import useProgressAnimation from '@/hooks/useProgressAnimation'
import useConfettiLayout1 from '@/hooks/useConfettiLayout1'
import useConfettiLayout0 from '@/hooks/useConfettiLayout0'
import useComponentIds from '@/hooks/useComponentIds'
import { capSaturation, adjustToLuminance, hexToHsl, hslToHex, makeVibrantColor } from '@/utils/colors'
import useHover from '@/hooks/useHover'
import Footer from '@/components/sent-card/Footer'
import Envelope1 from '@/components/sent-card/Envelope1'
import CardShape from '@/components/sent-card/CardShape'
import Box2 from '@/components/sent-card/Box2'
import Envelope2 from '@/components/sent-card/Envelope2'
import Layout3Box from '@/components/Layout3Box'
import Envelope3 from '@/components/Envelope3'
import ShareModal from '@/components/ShareModal'
import { PROGRESS_PILL_RADIUS, HEADER_OVERLAY_BG, PROGRESS_GLOW_BOX_SHADOW, ENVELOPE_DIMENSIONS, FOOTER_CONFIG } from '@/constants/sentCardConstants'

// Box1 images (brand names)
const BOX1_IMAGES = [
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
  '/assets/GiftSent/SVG Logo/Goody.svg': '#B89EFF',
  '/assets/GiftSent/SVG Logo/Chipotle.svg': '#AC2318',
  '/assets/GiftSent/SVG Logo/Logo.svg': '#1987C7', // Columbia
  '/assets/GiftSent/SVG Logo/Nike.svg': '#111111',
  '/assets/GiftSent/SVG Logo/Apple.svg': '#D6D6D6',
  '/assets/GiftSent/SVG Logo/Supergoop.svg': '#0000B4',
  '/assets/GiftSent/SVG Logo/Tiffany & Co.svg': '#81D8D0',
}

const SentCard = ({
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
  envelopeWidth,
  envelopeHeight,
  envelopeGroup, // Envelope group positioning (Layout 1 Style 1 only)
  // Layout 2 separate envelope configs
  envelope1Scale,
  envelope1OffsetY,
  envelope1Width,
  envelope1Height,
  envelope2Scale,
  envelope2OffsetY,
  confettiWhiteOverlay = false,
  envelopeHighZ = false,
  overlayProgressOnEnvelope = false,
  showFooterProgress = true,
  progressOutsideEnvelope = false,
  showFooterReminder = true,
  footerBottomPadding = 16,
  footerTopPadding,
  footerTransparent = false,
  hideInfoOnHover = true,
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
  // Box1 mode (replaces envelope with Box1 images)
  useBox1 = false,
  // Hide envelope (makes container empty)
  hideEnvelope = false,
  // Show gift box when envelope is hidden (for Single 2)
  showGiftBoxWhenHidden = false,
  // Hide progress bar inside the box
  hideProgressBarInBox = false,
  // Center logo at the very center of the box
  centerLogoInBox = false,
  logoScale = undefined, // Logo scale when centered (e.g., 0.9) - undefined = use default (1.4 when centered, 1 when not)
  // Box settings
  boxWidth,
  boxHeight,
  boxBorderRadius,
  boxScale,
  boxOffsetY, // Box-specific offsetY (overrides envelopeOffsetY for single cards)
  // Envelope container settings (for Batch 2 - Envelope2)
  envelopeContainerPadding,
  envelopeContainerMargin,
  envelopeBoxOpacity,
  envelopeFlapOpacity,
  envelopeFlapLuminance,
  envelopeFlapSaturation,
  envelopeBoxLuminance,
  envelopeBoxSaturation,
  // Enable confetti
  enableConfetti = false,
  // Show redline
  showRedline = false,
  // Hide paper component in Envelope2 (for Box 2 - single cards)
  hidePaper = false,
  // Animation type for Single 2 cards: 'highlight', 'breathing', or 'none'
  animationType = 'highlight',
  // Standalone 3D toggle that works with highlight or breathing
  enable3D = false,
  // Box1 exclusive controls (for Single 1)
  box1OffsetY,
  box1Scale,
  box1Width,
  box1Height,
  box1Top,
  box1Left,
  box1Right,
  box1Bottom,
  box1TransformOrigin,
  // Modal/sharing mode props
  forceHovered = false,
  pauseConfetti = false,
  // Layout 2 box type selection: '1' | '2' | '3' (for single view only)
  layout2BoxType = '2',
  // Layout 1 style selection: 'A' | 'B' | 'C' (for Layout 1 only)
  layout1Style,
  pauseAtFrame = null, // Pause animation at specific frame for capture (e.g., 84 for peak)
  immediateFrame = null // Render confetti at this frame instantly (no animation, for fast capture)
}) => {
  // Hooks
  const cardRef = useRef(null)
  const cardContentRef = useRef(null) // Ref for card content (excluding footer)
  const confettiCanvasRef = useRef(null)
  const confettiCanvasFrontRef = useRef(null)
  const confettiCanvasMirroredRef = useRef(null)
  // Layout 1 Style 2 confetti: Multiple canvas layers for varied blur
  const confettiCanvasBlur1Ref = useRef(null) // 0.5-2px blur
  const confettiCanvasBlur2Ref = useRef(null) // 2-4px blur
  const confettiCanvasBlur3Ref = useRef(null) // 4-6px blur
  const confettiCanvasBlur4Ref = useRef(null) // 6-8px blur
  const { isHovered, handleHoverEnter, handleHoverLeave } = useHover()
  
  // Share modal state - MUST be declared before effectiveHovered
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  
  // Use forceHovered if provided (for modal), otherwise use actual hover state
  // CRITICAL: If ShareModal is open, don't allow confetti on original card (only in modal)
  const effectiveHovered = forceHovered || (isHovered && !isShareModalOpen)
  
  // When forceHovered is true, automatically trigger hover state immediately
  // CRITICAL: Only do this if this card is actually in a modal context (not the original card)
  // The original card should NOT have forceHovered=true, only the modal card should
  useEffect(() => {
    if (forceHovered) {
      console.log('[SentCard] forceHovered is true - triggering hover state')
      // Use a small timeout to ensure the component is fully mounted
      const timeout = setTimeout(() => {
        console.log('[SentCard] Calling handleHoverEnter()')
        handleHoverEnter()
      }, 0)
      return () => {
        clearTimeout(timeout)
    }
    }
    // Note: We don't call handleHoverLeave() here because:
    // 1. When modal closes, the modal's SentCard is unmounted (so this effect cleanup runs)
    // 2. The original card's hover state is reset in the modal's onClose handler
    // 3. The confetti hook will detect the change in effectiveHovered and stop the animation
  }, [forceHovered, handleHoverEnter])
  const [cardPropsForShare, setCardPropsForShare] = useState(null)
  const [shouldPauseConfetti, setShouldPauseConfetti] = useState(false)
  
  // Generate stable IDs for SVG elements
  const ids = useComponentIds(boxImage, from)
  
  // Mouse tracking for tilt effect (only for Single 2 and Batch 2 when 3D is enabled)
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 }) // Pixel position for specular highlight
  const isSingle2OrBatch2 = (hideEnvelope && showGiftBoxWhenHidden) || (hideEnvelope && !showGiftBoxWhenHidden) // Single 2 or Batch 2
  const shouldApplyTilt = isSingle2OrBatch2 && enable3D && (animationType === 'highlight' || animationType === 'breathing') // Only apply tilt when 3D is enabled
  
  // Handle mouse move for tilt effect
  const handleMouseMove = useCallback((e) => {
    if (!shouldApplyTilt || !cardRef.current) return
    
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setMousePosition({ x, y })
    setCursorPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [shouldApplyTilt])
  
  // Reset position on mouse leave
  const handleMouseLeaveWithReset = useCallback(() => {
    handleHoverLeave()
    setMousePosition({ x: 0.5, y: 0.5 })
  }, [handleHoverLeave])
  
  // Handle card capture for sharing - pass card props to modal instead of capturing
  const handleCaptureCard = useCallback(() => {
    // CRITICAL: Exit hover state BEFORE opening modal to stop background animations
    // Also set modal state immediately to prevent confetti from continuing
    setIsShareModalOpen(true) // Set this FIRST to stop confetti immediately
    handleHoverLeave()
    
    // Collect all card props to pass to the modal
    const cardPropsToShare = {
      from,
      title,
      boxImage,
      giftTitle,
      giftSubtitle,
      progress,
      sentDate,
      headerBgOverride,
      hideUnion,
      footerPadEqual,
      envelopeScale,
      envelopeOffsetY,
      confettiWhiteOverlay,
      envelopeHighZ,
      overlayProgressOnEnvelope,
      showFooterProgress: false, // Hide footer in modal
      progressOutsideEnvelope,
      showFooterReminder: false, // Hide footer in modal
      footerBottomPadding,
      footerTopPadding,
      footerTransparent,
      headerHeight,
      headerUseFlex,
      headerHeight1,
      headerUseFlex1,
      envelopeScale2,
      envelopeOffsetY2,
      envelopeLeft2,
      envelopeRight2,
      envelopeTopBase2,
      headerHeight2,
      headerUseFlex2,
      transformOrigin2,
      footerTopPadding2,
      footerBottomPadding2,
      footerPadEqual2,
      footerTransparent2,
      progressBottomPadding2,
      useBox1,
      hideEnvelope,
      showGiftBoxWhenHidden,
      hideProgressBarInBox,
      centerLogoInBox,
      boxWidth,
      boxHeight,
      boxBorderRadius,
      boxScale,
      enableConfetti,
      showRedline,
      animationType,
      enable3D,
      box1OffsetY,
      box1Scale,
      box1Width,
      box1Height,
      box1Top,
      box1Left,
      box1Right,
      box1Bottom,
      box1TransformOrigin,
      forceHovered: true // Force hover state in modal so confetti plays
    }
    
    setCardPropsForShare(cardPropsToShare)
    // Note: setIsShareModalOpen(true) was already called above to stop confetti immediately
  }, [
    handleHoverLeave, // Add handleHoverLeave to dependencies
    from, title, boxImage, giftTitle, giftSubtitle, progress, sentDate,
    headerBgOverride, hideUnion, footerPadEqual, envelopeScale, envelopeOffsetY,
    confettiWhiteOverlay, envelopeHighZ, overlayProgressOnEnvelope, progressOutsideEnvelope,
    footerBottomPadding, footerTopPadding, footerTransparent, headerHeight, headerUseFlex,
    headerHeight1, headerUseFlex1, envelopeScale2, envelopeOffsetY2, envelopeLeft2,
    envelopeRight2, envelopeTopBase2, headerHeight2, headerUseFlex2, transformOrigin2,
    footerTopPadding2, footerBottomPadding2, footerPadEqual2, footerTransparent2,
    progressBottomPadding2, useBox1, hideEnvelope, showGiftBoxWhenHidden,
    hideProgressBarInBox, centerLogoInBox, boxWidth, boxHeight, boxBorderRadius, boxScale,
    enableConfetti, showRedline, animationType, enable3D, box1OffsetY,
    box1Scale, box1Width, box1Height, box1Top,
    box1Left, box1Right, box1Bottom, box1TransformOrigin
  ])
  
  // Calculate tilt angles based on mouse position
  const tiltX = useMemo(() => {
    if (!isHovered || !shouldApplyTilt) return 0
    // Map y position (0-1) to tilt angle (-3 to 3 degrees)
    return (mousePosition.y - 0.5) * 5
  }, [isHovered, shouldApplyTilt, mousePosition.y])
  
  const tiltY = useMemo(() => {
    if (!isHovered || !shouldApplyTilt) return 0
    // Map x position (0-1) to tilt angle (-3 to 3 degrees), inverted for natural feel
    return (0.5 - mousePosition.x) * 5
  }, [isHovered, shouldApplyTilt, mousePosition.x])
  
  // Parallax offsets for envelope/box (opposite direction, smaller magnitude)
  const parallaxX = useMemo(() => {
    if (!isHovered || !shouldApplyTilt) return 0
    return (mousePosition.x - 0.5) * 10 // 10px max offset
  }, [isHovered, shouldApplyTilt, mousePosition.x])
  
  const parallaxY = useMemo(() => {
    if (!isHovered || !shouldApplyTilt) return 0
    return (mousePosition.y - 0.5) * 10 // 10px max offset
  }, [isHovered, shouldApplyTilt, mousePosition.y])
  
  // Progress animation
  const {
    animatedProgress,
    animatedCurrent,
    validatedProgress,
    isDone
  } = useProgressAnimation(progress)
  
  // Select Box1 image randomly but consistently per card - when useBox1 is true or layout2BoxType is '1'
  const box1Image = useMemo(() => {
    if (!useBox1 && layout2BoxType !== '1') return null
    // Use boxImage as a seed for consistent random selection per card
    // This ensures each card gets a random brand that stays the same across re-renders
    let hash = 0
    for (let i = 0; i < boxImage.length; i++) {
      hash = ((hash << 5) - hash) + boxImage.charCodeAt(i)
      hash = hash & hash // Convert to 32-bit integer
    }
    const index = Math.abs(hash) % BOX1_IMAGES.length
    return BOX1_IMAGES[index]
  }, [useBox1, layout2BoxType, boxImage])
  
  // Map PNG logo to SVG logo for Single 2 (Box2) text emboss styling
  // For Single 2, select logo randomly but consistently per card (same as box1Image)
  const svgLogoPath = useMemo(() => {
    // For Single 2 (hideEnvelope && showGiftBoxWhenHidden), use same random selection logic
    if (hideEnvelope && showGiftBoxWhenHidden) {
      // Use boxImage as a seed for consistent random selection per card
      let hash = 0
      for (let i = 0; i < boxImage.length; i++) {
        hash = ((hash << 5) - hash) + boxImage.charCodeAt(i)
        hash = hash & hash // Convert to 32-bit integer
      }
      const index = Math.abs(hash) % BOX1_IMAGES.length
      const pngPath = BOX1_IMAGES[index]
      return LOGO_PNG_TO_SVG_MAP[pngPath] || '/assets/GiftSent/SVG Logo/Logo.svg'
    }
    // For Single 1 (useBox1), use mapped logo
    if (box1Image) {
      return LOGO_PNG_TO_SVG_MAP[box1Image] || '/assets/GiftSent/SVG Logo/Logo.svg'
    }
    // Default fallback
    return '/assets/GiftSent/SVG Logo/Logo.svg'
  }, [hideEnvelope, showGiftBoxWhenHidden, box1Image, boxImage])

  // Extract brand name from logo path
  const brandName = useMemo(() => {
    // Get the logo path (prefer SVG, fallback to PNG)
    let logoPath = svgLogoPath
    if (!logoPath && box1Image) {
      logoPath = box1Image
    }
    if (!logoPath) {
      // Fallback: try to get from random selection (same logic as above)
      if (hideEnvelope && showGiftBoxWhenHidden) {
        let hash = 0
        for (let i = 0; i < boxImage.length; i++) {
          hash = ((hash << 5) - hash) + boxImage.charCodeAt(i)
          hash = hash & hash // Convert to 32-bit integer
        }
        const index = Math.abs(hash) % BOX1_IMAGES.length
        logoPath = BOX1_IMAGES[index]
      }
    }
    
    if (!logoPath) return null
    
    // Extract filename from path
    const filename = logoPath.split('/').pop() || ''
    // Remove extension (.png, .svg)
    const nameWithoutExt = filename.replace(/\.(png|svg)$/i, '')
    // Handle special cases
    if (nameWithoutExt === 'Logo') return 'Columbia'
    return nameWithoutExt
  }, [svgLogoPath, box1Image, hideEnvelope, showGiftBoxWhenHidden, validatedProgress.current, validatedProgress.total])

  // Single 2 Box Color Controls (Box2)
  // Batch 2 envelope colors are now controlled via props from LAYOUT_CONFIG
  const SINGLE2_LUMINANCE = 62  // Luminance for Single 2 brand colors (0-100)
  const SINGLE2_SATURATION = 40  // Saturation for Single 2 brand colors (0-100)
  
  // Progress Bar Saturation and Luminance (unified for both Single 2 and Batch 2)
  const PROGRESS_BAR_LUMINANCE = 60  // Luminance for progress bar indicator (0-100)
  const PROGRESS_BAR_SATURATION = 50 // Saturation for progress bar indicator (0-100)

  // Extract dominant color from gift container image (for Single 1) or boxImage (for other layouts)
  // For Style 2 (Box2), use brand color from logo instead of cover image
  const imageForColorExtraction = useBox1 && box1Image ? box1Image : boxImage
  const { dominantColor: extractedDominantColor } = useDominantColor(imageForColorExtraction, '#f4c6fa')
  
  // For Style 2 (Box2), use brand color from logo for theming instead of cover image
  const dominantColor = useMemo(() => {
    if (hideEnvelope && showGiftBoxWhenHidden && !useBox1) {
      // Style 2 (Box2): Use brand color from logo for header theming
      const brandColor = LOGO_BRAND_COLORS[svgLogoPath]
      return brandColor || extractedDominantColor // Fallback to extracted color if no brand color
    }
    return extractedDominantColor
  }, [hideEnvelope, showGiftBoxWhenHidden, useBox1, svgLogoPath, extractedDominantColor])
  
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
  
  // Calculate themed box color for Box2
  // For Single 2 cards, use brand color with Single 2 saturation/luminance caps
  // IMPORTANT: For Single 2, ignore dominantColor from cover image - use brand color only
      // Increase L value by 10 for box
  const themedBoxColor = useMemo(() => {
    // For Single 2 cards (hideEnvelope && showGiftBoxWhenHidden), use brand color
    if (hideEnvelope && showGiftBoxWhenHidden) {
      // Ensure svgLogoPath exists and is valid
      if (!svgLogoPath) {
        // If svgLogoPath is not set yet, use Columbia blue as safe fallback
        const colorToUse = '#1987C7'
        const [h, s, l] = hexToHsl(colorToUse)
        let adjustedL = Math.min(100, Math.max(0, SINGLE2_LUMINANCE))
        // Increase L value by 10 for box
        if (hideEnvelope && showGiftBoxWhenHidden && hideProgressBarInBox) {
          adjustedL = Math.min(100, adjustedL + 10)
        }
        const adjustedS = Math.min(100, Math.max(0, Math.min(s, SINGLE2_SATURATION)))
        return hslToHex(h, adjustedS, adjustedL)
      }
      
      // Look up brand color from map
      const brandColor = LOGO_BRAND_COLORS[svgLogoPath]
      // If no brand color mapping found, use Columbia blue as fallback
      const colorToUse = brandColor || '#1987C7'
      
      // Apply Single 2 saturation and luminance caps using HSL directly
      // This preserves the brand color's hue while applying luminance and saturation controls
      // Do NOT use dominantColor from cover image for Single 2 cards
      const [h, s, l] = hexToHsl(colorToUse)
      let adjustedL = Math.min(100, Math.max(0, SINGLE2_LUMINANCE))
      // Increase L value by 10 for box
      if (hideEnvelope && showGiftBoxWhenHidden && hideProgressBarInBox) {
        adjustedL = Math.min(100, adjustedL + 10)
      }
      const adjustedS = Math.min(100, Math.max(0, Math.min(s, SINGLE2_SATURATION)))
      return hslToHex(h, adjustedS, adjustedL)
    }
    if (headerBgOverride) return '#94d8f9' // Default when theming is disabled
    // Create a light, vibrant box color from dominant color (for Single 1 and Batch 2)
    return capSaturation(adjustToLuminance(dominantColor, 85), 70)
  }, [headerBgOverride, hideEnvelope, showGiftBoxWhenHidden, hideProgressBarInBox, svgLogoPath, SINGLE2_LUMINANCE, SINGLE2_SATURATION, dominantColor]) // dominantColor only used for Single 1 and Batch 2, not Single 2

  // Calculate box color for Box3 (Layout3Box) - use brand color directly without HSL adjustments (matching Layout 3)
  const box3Color = useMemo(() => {
    const isBox3 = (hideEnvelope && showGiftBoxWhenHidden && layout2BoxType === '3') || 
                   (hideEnvelope && showGiftBoxWhenHidden && layout1Style === '3')
    if (isBox3) {
      // For single cards (Box3), use vibrant brand color
      // Look up brand color from map
      const brandColor = LOGO_BRAND_COLORS[svgLogoPath] || '#1987C7'
      // For Layout 1 Style 3 and Layout 2 Style 3, reduce vibrancy by 20% (reduce saturation by 20%)
      if (layout1Style === '3' || layout2BoxType === '3') {
        const [h, s, l] = hexToHsl(brandColor)
        const reducedS = s * 0.8 // Reduce saturation by 20%
        const cappedL = Math.min(80, l) // Cap lightness at 80
        return hslToHex(h, reducedS, cappedL)
      }
      const [h, s, l] = hexToHsl(brandColor)
      const cappedL = Math.min(80, l) // Cap lightness at 80
      return hslToHex(h, s, cappedL)
    }
    return themedBoxColor // Fallback to themedBoxColor if not Box3
  }, [hideEnvelope, showGiftBoxWhenHidden, layout2BoxType, layout1Style, svgLogoPath, themedBoxColor])

  // Calculate logo brand color (used for logo gradient ID generation)
  // Uses the same Single 2 caps as the box color for consistency
  const logoBrandColor = useMemo(() => {
    return themedBoxColor
  }, [themedBoxColor])
  
  // Get original color for progress bar hue extraction (before S/L is applied)
  // For Single 2: use brand color, for Batch 2: use dominantColor
  const progressBarSourceColor = useMemo(() => {
    if (hideEnvelope && showGiftBoxWhenHidden) {
      // Single 2: use brand color (original, before S/L)
      const brandColor = LOGO_BRAND_COLORS[svgLogoPath]
      return brandColor || '#1987C7'
    } else if (hideEnvelope && !showGiftBoxWhenHidden) {
      // Batch 2: use dominantColor (original, before S/L)
      return dominantColor
    }
    return dominantColor // Fallback
  }, [hideEnvelope, showGiftBoxWhenHidden, svgLogoPath, dominantColor])

  // Envelope/Flap Color and Opacity Controls (from props with fallbacks)
  // These are now layout-specific, passed from page.jsx based on LAYOUT_CONFIG
  const EFFECTIVE_BOX_OPACITY = envelopeBoxOpacity ?? 1.0
  const EFFECTIVE_FLAP_OPACITY = envelopeFlapOpacity ?? 1.0
  const EFFECTIVE_FLAP_LUMINANCE = envelopeFlapLuminance ?? 100
  const EFFECTIVE_FLAP_SATURATION = envelopeFlapSaturation ?? 100
  const EFFECTIVE_BOX_LUMINANCE = envelopeBoxLuminance ?? 88
  const EFFECTIVE_BOX_SATURATION = envelopeBoxSaturation ?? 40
  const BATCH2_PROGRESS_SHADOW_LUMINANCE = 95  // Progress shadow (shared, not layout-specific)
  const BATCH2_PROGRESS_SHADOW_SATURATION = 95
  
  // Envelope Container Spacing Controls (from props with fallbacks)
  const EFFECTIVE_ENVELOPE_PADDING = envelopeContainerPadding ?? { top: 21, right: 76, bottom: 21, left: 76 }
  const EFFECTIVE_ENVELOPE_MARGIN = envelopeContainerMargin ?? { top: 0, right: 0, bottom: 30, left: 0 }

  // Envelope box color - uses layout-specific luminance/saturation
  const envelopeBoxColor = useMemo(() => {
    return capSaturation(
      adjustToLuminance(dominantColor, EFFECTIVE_BOX_LUMINANCE),
      EFFECTIVE_BOX_SATURATION
    )
  }, [dominantColor, EFFECTIVE_BOX_LUMINANCE, EFFECTIVE_BOX_SATURATION])

  // Calculate vibrant color for Envelope3 - match Box3's S and L values (vibrancy) but keep Envelope3's Hue
  const envelope3Color = useMemo(() => {
    const isEnvelope3 = (hideEnvelope && !showGiftBoxWhenHidden && layout2BoxType === '3') ||
                        (hideEnvelope && !showGiftBoxWhenHidden && layout1Style === '3')
    if (isEnvelope3) {
      // Get Box3's color to extract its S and L values
      const brandColor = LOGO_BRAND_COLORS[svgLogoPath] || '#1987C7'
      let box3S, box3L
      if (layout1Style === '3' || layout2BoxType === '3') {
        const [h, s, l] = hexToHsl(brandColor)
        box3S = s * 0.8 // Box3's saturation (reduced by 20%)
        box3L = Math.min(80, l) // Box3's lightness (capped at 80)
      } else {
        const [h, s, l] = hexToHsl(brandColor)
        box3S = s // Box3's saturation
        box3L = Math.min(80, l) // Box3's lightness (capped at 80)
      }
      // Apply Box3's S and L values to Envelope3's base color (keeping Envelope3's Hue)
      const [envelopeH, envelopeS, envelopeL] = hexToHsl(envelopeBoxColor)
      return hslToHex(envelopeH, box3S, box3L)
    }
    return envelopeBoxColor // Fallback to envelopeBoxColor if not Envelope3
  }, [hideEnvelope, showGiftBoxWhenHidden, layout2BoxType, layout1Style, svgLogoPath, envelopeBoxColor])

  // Flap color - uses layout-specific luminance/saturation
  const envelopeFlapColor = useMemo(() => {
    return capSaturation(
      adjustToLuminance(dominantColor, EFFECTIVE_FLAP_LUMINANCE),
      EFFECTIVE_FLAP_SATURATION
    )
  }, [dominantColor, EFFECTIVE_FLAP_LUMINANCE, EFFECTIVE_FLAP_SATURATION])

  // Progress indicator shadow color - themed separately
  const progressIndicatorShadowColor = useMemo(() => {
    // Create shadow color with controlled luminance and saturation
    // Lower luminance = darker shadow
    return capSaturation(
      adjustToLuminance(dominantColor, BATCH2_PROGRESS_SHADOW_LUMINANCE),
      BATCH2_PROGRESS_SHADOW_SATURATION
    )
  }, [dominantColor, BATCH2_PROGRESS_SHADOW_LUMINANCE, BATCH2_PROGRESS_SHADOW_SATURATION])
  
  const allAccepted = isDone
  
  // Confetti animation - disabled for Batch 2 and Single 2, but can be enabled via prop
  const shouldShowConfetti = enableConfetti || !hideEnvelope
  
  // Layout 1 Style 2 detection: Uses advanced confetti system (box collision, multiple blur layers)
  // Style 2 has: hideEnvelope=true, hideProgressBarInBox=true, enableConfetti=true
  const isLayout1StyleB = hideEnvelope && hideProgressBarInBox && enableConfetti
  
  // Pass blur canvas refs array for Layout 1 Style 2 (uses advanced confetti system)
  const blurCanvasRefs = useMemo(() => {
    return isLayout1StyleB ? [confettiCanvasBlur1Ref, confettiCanvasBlur2Ref, confettiCanvasBlur3Ref, confettiCanvasBlur4Ref] : null
  }, [isLayout1StyleB])
  
  // Layout 1 Style 2: Use advanced confetti hook (has box collision, blur layers, etc.)
  const finalPauseState = pauseConfetti || shouldPauseConfetti
  useConfettiLayout0(
    isLayout1StyleB && shouldShowConfetti && effectiveHovered, 
    isLayout1StyleB && shouldShowConfetti && allAccepted, 
    confettiCanvasRef, 
    cardRef, 
    confettiCanvasFrontRef, 
    confettiCanvasMirroredRef, 
    blurCanvasRefs,
    finalPauseState,
    forceHovered,
    pauseAtFrame,
    immediateFrame
  )
  // Layout 1 Style 1 and other layouts: Use Layout 1 confetti hook
  useConfettiLayout1(
    !isLayout1StyleB && shouldShowConfetti && effectiveHovered, 
    !isLayout1StyleB && shouldShowConfetti && allAccepted, 
    confettiCanvasRef, 
    cardRef, 
    confettiCanvasFrontRef, 
    confettiCanvasMirroredRef
  )

  // Memoized style objects
  // Note: When 3D is active, we don't apply tilt to the card container itself
  // Only the inner objects (envelope/box) will tilt and skew
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

  // Layout 1 Style 2: Use advanced blur values with variation (multiple blur layers)
  // Layout 1 Style 1: Use standard blur values
  const CONFETTI_BLUR_1 = isLayout1StyleB ? 'blur(1px)' : null // 1px blur
  const CONFETTI_BLUR_2 = isLayout1StyleB ? 'blur(3px)' : null // 3px blur
  const CONFETTI_BLUR_3 = isLayout1StyleB ? 'blur(7px)' : null // 7px blur
  const CONFETTI_BLUR_4 = isLayout1StyleB ? 'blur(10px)' : null // 10px blur
  // Layout 1 Style 1: Standard blur values
  const CONFETTI_BLUR = isLayout1StyleB ? null : 'blur(1.25px)'
  const CONFETTI_BACK_BLUR = isLayout1StyleB ? null : 'blur(4px)'
  // Separate blur for mirrored confetti
  const CONFETTI_MIRRORED_BLUR = 'blur(6px)' // Same for both
  
  const confettiCanvasStyle = useMemo(() => ({
    zIndex: 1,
    pointerEvents: 'none',
    filter: CONFETTI_BLUR
  }), [])

  const confettiWhiteOverlayStyle = useMemo(() => ({
    zIndex: 2,
    background: 'linear-gradient(to top, rgba(255,255,255,0.2) 0%, rgba(255, 255, 255, 0.0825) 30%, rgba(255,255,255,0.0) 100%)' // Reduced by 75% (0.8->0.2, 0.33->0.0825)
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
    color: TOKENS.colors.text.tertiary // Always use dark text for better contrast on pastel backgrounds
  }), [])

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

  // Calculate Box1 scale and transform origin for container transform
  // NO HARDCODED VALUES - All Box1 settings must come from config
  const isBox1Rendered = (useBox1 || layout2BoxType === '1') && hideEnvelope && showGiftBoxWhenHidden
  const containerScale = useMemo(() => {
    // For Box1, MUST use box1Scale from config
    if (isBox1Rendered) {
      if (box1Scale === undefined) {
        console.warn('Box1 scale is undefined. Please set box1.scale in the config.')
        return 1 // Fallback only for Box1, but config should always define this
      }
      return box1Scale
    }
    // For non-Box1, use envelope scale
    if (progressOutsideEnvelope && envelopeScale2 !== undefined) {
      return envelopeScale2
    }
    return envelopeScale
  }, [isBox1Rendered, box1Scale, progressOutsideEnvelope, envelopeScale2, envelopeScale])
  
  const containerTransformOrigin = useMemo(() => {
    if (hideEnvelope && hideProgressBarInBox) {
      return 'center center'
    }
    // For Box1, MUST use box1TransformOrigin from config
    if (isBox1Rendered) {
      if (box1TransformOrigin === undefined) {
        console.warn('Box1 transformOrigin is undefined. Please set box1.transformOrigin in the config.')
        return 'center top' // Fallback only for Box1, but config should always define this
      }
      return box1TransformOrigin
    }
    // For non-Box1, use other transform origins
    if (progressOutsideEnvelope && transformOrigin2 !== undefined) {
      return transformOrigin2
    }
    return 'center top'
  }, [hideEnvelope, hideProgressBarInBox, isBox1Rendered, box1TransformOrigin, progressOutsideEnvelope, transformOrigin2])

  const envelopeContainerStyle = useMemo(() => {
    // Container positioning logic
    
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...(hideEnvelope && hideProgressBarInBox
        ? {
            // Relative positioning, inner wrapper handles transform
            position: 'relative',
            width: '100%',
            height: '100%',
            flex: 1,
            minHeight: 0,
            overflow: 'visible',
          }
      : (useBox1 || layout2BoxType === '1')
      ? {
          // NO HARDCODED VALUES - All positioning must come from config
          top: box1Top !== undefined ? `${box1Top + (box1OffsetY !== undefined ? box1OffsetY : 0)}px` : undefined,
          left: box1Left !== undefined ? `${box1Left}px` : undefined,
          right: box1Right !== undefined ? `${box1Right}px` : undefined,
          bottom: box1Bottom !== undefined ? `${box1Bottom}px` : undefined,
        }
      : progressOutsideEnvelope && envelopeTopBase2 !== undefined 
      ? {
          top: `${envelopeTopBase2}px`, // Use only top base, offsetY is applied in transform
          left: envelopeLeft2 !== undefined ? `${envelopeLeft2}px` : '0px',
          right: envelopeRight2 !== undefined ? `${envelopeRight2}px` : '0px',
          bottom: 'auto'
        }
      : {
          top: '0px',
          left: '0px',
          right: '0px',
          bottom: '0px'
        }),
    // Layout 1 single style 2: Box should be behind union shape (zIndex: 25)
    // Condition: hideEnvelope && showGiftBoxWhenHidden && !useBox1 (Box2)
    zIndex: (hideEnvelope && showGiftBoxWhenHidden && !useBox1) 
      ? 20  // Behind union shape (zIndex: 25)
      : envelopeHighZ ? 50 : (overlayProgressOnEnvelope ? 2 : 2),
    // No transform on container (inner wrapper handles it)
    // All other layouts: apply transform directly to container (scale + translateY for offsetY)
    transform: hideEnvelope && hideProgressBarInBox 
      ? 'none'
      : `translateY(${progressOutsideEnvelope && envelopeOffsetY2 !== undefined ? envelopeOffsetY2 : (envelopeOffsetY || 0)}px) scale(${containerScale})`,
      transformOrigin: containerTransformOrigin
  }}, [hideEnvelope, hideProgressBarInBox, useBox1, layout2BoxType, box1Top, box1OffsetY, box1Left, box1Right, box1Bottom, progressOutsideEnvelope, envelopeTopBase2, envelopeOffsetY2, envelopeOffsetY, envelopeLeft2, envelopeRight2, envelopeHighZ, overlayProgressOnEnvelope, containerScale, containerTransformOrigin])
  
  // Inner wrapper style - absolutely positioned, handles scale and offsetY
  // For single cards with Box2, use boxOffsetY if provided, otherwise use envelopeOffsetY
  // Box3 (layout2BoxType === '3' or layout1Style === '3') uses its own offsetY
  // Envelope3 (layout2BoxType === '3' or layout1Style === '3') uses its own offsetY (separate from Box3)
  // Box2 (layout2BoxType === '2' or default) uses boxOffsetY from single2.box.offsetY
  const layout2Box3OffsetY = -7 // Layout 2 single card Box3 offsetY
  const layout2Envelope3OffsetY = 0 // Layout 2 batch card Envelope3 offsetY (exclusive, doesn't affect Box3)
  const layout1Box3OffsetY = 32 // Layout 1 Style 3 Box3/Envelope3 offsetY (shared for Layout 1)
  const layout1Box3Scale = 1.125 // Layout 1 Style 3 Box3/Envelope3 scale
  const isBox3 = (hideEnvelope && showGiftBoxWhenHidden && !useBox1 && layout2BoxType === '3') ||
                 (hideEnvelope && showGiftBoxWhenHidden && !useBox1 && layout1Style === '3')
  const isEnvelope3 = (hideEnvelope && !showGiftBoxWhenHidden && layout2BoxType === '3') ||
                      (hideEnvelope && !showGiftBoxWhenHidden && layout1Style === '3')
  // Envelope1: Layout 2 batch Style 1 (layout2BoxType === '1')
  const isEnvelope1 = useMemo(() => 
    (hideEnvelope && !showGiftBoxWhenHidden && layout2BoxType === '1'),
    [hideEnvelope, showGiftBoxWhenHidden, layout2BoxType]
  )
  // Envelope2: Layout 2 batch Style 2 (layout2BoxType === '2' OR undefined/default, AND not Envelope1/Envelope3)
  // Also Layout 1 batch Style 2 uses Envelope2, but that uses layout1StyleB.envelope, not layout2.envelope2
  const isEnvelope2 = useMemo(() => 
    (hideEnvelope && !showGiftBoxWhenHidden && layout2BoxType !== '1' && layout2BoxType !== '3' && layout1Style !== '3'),
    [hideEnvelope, showGiftBoxWhenHidden, layout2BoxType, layout1Style]
  )
  // Box3 offsetY: Layout 1 Style 3 uses layout1Box3OffsetY, Layout 2 uses layout2Box3OffsetY
  const box3OffsetY = (layout1Style === '3') ? layout1Box3OffsetY : ((layout2BoxType === '3') ? layout2Box3OffsetY : envelopeOffsetY)
  // Envelope3 offsetY: Layout 1 Style 3 uses layout1Box3OffsetY, Layout 2 uses layout2Envelope3OffsetY (separate from Box3)
  const envelope3OffsetY = (layout1Style === '3') ? layout1Box3OffsetY : ((layout2BoxType === '3') ? layout2Envelope3OffsetY : envelopeOffsetY)
  // Envelope1 offsetY: Use envelope1OffsetY from config (layout2.envelope1.offsetY)
  const envelope1OffsetYValue = isEnvelope1 && envelope1OffsetY !== undefined ? envelope1OffsetY : envelopeOffsetY
  // Envelope2 offsetY: Use envelope2OffsetY from config (layout2.envelope2.offsetY)
  const envelope2OffsetYValue = isEnvelope2 && envelope2OffsetY !== undefined ? envelope2OffsetY : envelopeOffsetY
  const effectiveOffsetY = isBox3
    ? box3OffsetY 
    : (isEnvelope3
      ? envelope3OffsetY
      : (isEnvelope1
        ? envelope1OffsetYValue
        : (isEnvelope2
          ? envelope2OffsetYValue
          : ((hideEnvelope && showGiftBoxWhenHidden && !useBox1 && layout2BoxType !== '3' && layout1Style !== '3') 
            ? (boxOffsetY !== undefined ? boxOffsetY : envelopeOffsetY) 
            : envelopeOffsetY))))
  // For single cards with Box2, use boxScale if provided, otherwise use envelopeScale
  // Box3/Envelope3 (layout2BoxType === '3' or layout1Style === '3') uses envelopeScale, except Layout 1 Style 3 uses 1.125
  // For Layout 1 Style 3, both Box3 and Envelope3 should use 1.125 scale
  const box3Scale = (layout1Style === '3') ? layout1Box3Scale : envelopeScale
  // Envelope1 scale: Use envelope1Scale from config (layout2.envelope1.scale)
  const envelope1ScaleValue = isEnvelope1 && envelope1Scale !== undefined ? envelope1Scale : envelopeScale
  // Envelope2 scale: 
  // - For Layout 1 Style 2: Use envelopeScale from layout1StyleB.envelope.scale (ALWAYS, no override)
  // - For Layout 2 Style 2: Use envelope2Scale from layout2.envelope2.scale
  const envelope2ScaleValue = useMemo(() => {
    // Early return if not Envelope2 - use envelopeScale as fallback
    if (!isEnvelope2) return envelopeScale
    
    // Layout 1 Style 2: ALWAYS use 1.25 from layout1StyleB.envelope.scale
    // CRITICAL: This is hardcoded to prevent any override - Layout 1 Style 2 Envelope2 MUST be 1.25
    // Do NOT use envelopeScale prop as it might be overridden or incorrect when switching layouts
    // The envelopeScale prop might have a stale value from the previous layout/style
    if (layout1Style === '2') {
      // Layout 1 Style 2 Envelope2 scale is ALWAYS 1.25 from layout1StyleB.envelope.scale
      // This is the source of truth and cannot be overridden, even when switching from other layouts
      // We ignore the envelopeScale prop value completely for Layout 1 Style 2
      return 1.25
    }
    
    // Layout 2 Style 2: Use envelope2Scale if provided, otherwise fallback to 1 (default scale)
    // envelope2Scale should always be provided for Layout 2 Style 2 from layout2.envelope2.scale
    return envelope2Scale !== undefined ? envelope2Scale : 1
  }, [isEnvelope2, layout1Style, envelope2Scale, envelopeScale]) // Keep envelopeScale for early return fallback
  // For Layout 1 Style 3, ensure both Box3 and Envelope3 use 1.125 scale
  // Priority: Layout 1 Style 3 > Layout 2 Box3/Envelope3 > Envelope1 > Envelope2 > Box1 > Box2 > default envelopeScale
  const effectiveScale = useMemo(() => {
    if (layout1Style === '3' && (isBox3 || isEnvelope3)) {
      return layout1Box3Scale // 1.125 for Layout 1 Style 3
    }
    if (isBox3 || isEnvelope3) {
      return box3Scale // envelopeScale for Layout 2 Box3/Envelope3
    }
    // Envelope1 scale (for Layout 2 Style 1)
    if (isEnvelope1) {
      return envelope1ScaleValue
    }
    // Envelope2 scale (for Layout 1 Style 2 or Layout 2 Style 2)
    // CRITICAL: This MUST use envelope2ScaleValue, which correctly handles Layout 1 Style 2 vs Layout 2 Style 2
    if (isEnvelope2) {
      // Double-check: For Layout 1 Style 2, ensure we're using the correct scale
      if (layout1Style === '2' && envelope2ScaleValue !== envelopeScale) {
        console.warn(`[effectiveScale] Layout 1 Style 2 Envelope2: envelope2ScaleValue (${envelope2ScaleValue}) !== envelopeScale (${envelopeScale}). Using envelope2ScaleValue.`)
      }
      return envelope2ScaleValue
    }
    // Box1 scale (for useBox1 or layout2BoxType === '1')
    // Check if Box1 is being rendered (single cards with Box1)
    if ((useBox1 || layout2BoxType === '1') && hideEnvelope && showGiftBoxWhenHidden) {
      if (box1Scale !== undefined) {
        return box1Scale // Box1 scale from config (single1.box1.scale)
      }
      // Fallback to envelopeScale if box1Scale is not provided
      return envelopeScale
    }
    if (hideEnvelope && showGiftBoxWhenHidden && !useBox1 && layout2BoxType !== '3' && layout1Style !== '3' && boxScale !== undefined) {
      return boxScale // Box2 scale
    }
    return envelopeScale // Default
  }, [layout1Style, isBox3, isEnvelope3, isEnvelope1, isEnvelope2, layout1Box3Scale, box3Scale, envelope1ScaleValue, envelope2ScaleValue, hideEnvelope, showGiftBoxWhenHidden, useBox1, layout2BoxType, boxScale, envelopeScale, box1Scale])
  // For Envelope3, we apply scale directly to the component, not the wrapper
  // For Box3 and others, we apply scale to the wrapper
  const envelopeInnerWrapperStyle = useMemo(() => {
    const offsetYValue = effectiveOffsetY || 0
    // Only apply scale to wrapper if it's NOT Envelope3 (Envelope3 gets scale applied directly)
    const scaleValue = (isEnvelope3) ? 1 : (effectiveScale || 1)
    return {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: `translate(-50%, -50%) translateY(${offsetYValue}px) scale(${scaleValue})`,
      transformOrigin: 'center center',
      willChange: 'transform', // Optimize for transforms
      // The wrapper creates a transform context that applies to all children
      // Including absolutely positioned elements like the paper in Envelope2
    }
  }, [effectiveOffsetY, effectiveScale, isEnvelope3])

  // Memoized style for Envelope3 scale transform (used in multiple places)
  const envelope3ScaleStyle = useMemo(() => {
    // Use layout1Box3Scale for Layout 1 Style 3, otherwise use scale 1 for Layout 2 Style 3 (no additional scaling)
    const scale = (layout1Style === '3') ? layout1Box3Scale : 1
    return {
      transform: `scale(${scale})`,
      transformOrigin: 'center center',
    }
  }, [layout1Style, layout1Box3Scale])

  const box1WrapperStyle = useMemo(() => {
    // NO HARDCODED VALUES - All values must come from config
    if (box1Width === undefined || box1Height === undefined) {
      console.warn('Box1 width or height is undefined. Please set box1.width and box1.height in the config.')
      return {
        position: 'relative',
        pointerEvents: 'none',
        flexShrink: 0,
      }
    }
    const width = `${box1Width}px`
    const height = `${box1Height}px`
    return {
      position: 'relative',
      width: width,
      height: height,
      minWidth: width,
      maxWidth: width,
      minHeight: height,
      maxHeight: height,
      pointerEvents: 'none',
      flexShrink: 0,
    }
  }, [box1Width, box1Height])

  const box1ImageStyle = useMemo(() => ({
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
      onMouseMove={shouldApplyTilt ? handleMouseMove : undefined}
      onMouseLeave={shouldApplyTilt ? handleMouseLeaveWithReset : handleHoverLeave}
      className="border border-[#dde2e9] border-solid relative rounded-[24px] w-full overflow-hidden"
      style={cardContainerStyle}
      data-name="Gift Card"
      data-animation-type={animationType}
      data-node-id="1467:49182"
    >
      {/* Debug: Red line at estimated envelope top edge - for Batch 1 only (at card level) - SCALE-AWARE */}
      {/* This is the third floor for confetti particles - particles can land here and roll off */}
      {(!useBox1 && !overlayProgressOnEnvelope && !progressOutsideEnvelope && !hideEnvelope) && (
        <div
          data-name="Second Floor"
          data-floor-type="batch1"
          style={{
            position: 'absolute',
            // Scale-aware position: envelope top is at (4 + envelopeOffsetY), red line is at (1 + envelopeOffsetY) + 113
            // With transform origin 'center top', the top edge stays fixed regardless of scale
            top: `${(1 + (envelopeOffsetY || 0)) + 113}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '160px', // Batch 1 uses 160px width
            height: '1px',
            backgroundColor: 'red',
            zIndex: 9999,
            pointerEvents: 'none',
            opacity: 0 // Hidden visually but still detectable by confetti hook
          }}
          aria-label="Debug: Envelope top edge (Batch 1) - Third Floor"
        />
      )}
      {/* Full card confetti canvas - at card level to avoid overflow clipping */}
      {shouldShowConfetti && hideEnvelope && (
        <>
          {/* Layout 1 Style 2: Multiple blur layers for varied blur (1px to 10px) */}
          {isLayout1StyleB && CONFETTI_BLUR_1 ? (
            <>
              <canvas
                ref={confettiCanvasBlur1Ref}
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: (hideEnvelope && showGiftBoxWhenHidden && !useBox1) ? 21 : 5, filter: CONFETTI_BLUR_1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              />
              <canvas
                ref={confettiCanvasBlur2Ref}
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: (hideEnvelope && showGiftBoxWhenHidden && !useBox1) ? 21 : 4, filter: CONFETTI_BLUR_2, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              />
              <canvas
                ref={confettiCanvasBlur3Ref}
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: (hideEnvelope && showGiftBoxWhenHidden && !useBox1) ? 21 : 2, filter: CONFETTI_BLUR_3, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              />
              <canvas
                ref={confettiCanvasBlur4Ref}
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: (hideEnvelope && showGiftBoxWhenHidden && !useBox1) ? 21 : 1, filter: CONFETTI_BLUR_4, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              />
              {/* Front canvas for Layout 1 Style 2 - particles in front of box */}
              <canvas
                ref={confettiCanvasFrontRef}
                className="absolute inset-0 pointer-events-none"
                style={{ 
                  zIndex: (hideEnvelope && showGiftBoxWhenHidden && !useBox1) ? 21 : 6, 
                  filter: 'blur(1.25px)', 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  bottom: 0 
                }}
              />
              {/* Mirrored layer - vertically mirrored confetti */}
              <canvas
                ref={confettiCanvasMirroredRef}
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: 1, filter: CONFETTI_MIRRORED_BLUR, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              />
            </>
          ) : (
            <>
              {/* Layout 1 Style 1: Back layer - behind envelope/gift container */}
              <canvas
                ref={confettiCanvasRef}
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: 1, filter: CONFETTI_BACK_BLUR, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              />
              {/* Layout 1 Style 1: Front layer - in front of envelope/gift container */}
              <canvas
                ref={confettiCanvasFrontRef}
                className="absolute inset-0 pointer-events-none"
                style={{ 
                  zIndex: (hideEnvelope && showGiftBoxWhenHidden && !useBox1) ? 21 : 5, 
                  filter: CONFETTI_BLUR, 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  bottom: 0 
                }}
              />
              {/* Mirrored layer - vertically mirrored confetti */}
              <canvas
                ref={confettiCanvasMirroredRef}
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: 1, filter: CONFETTI_MIRRORED_BLUR, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              />
            </>
          )}
        </>
      )}
      <div 
        ref={cardContentRef}
        className={`content-stretch flex flex-col items-start ${isMonochromeVariant ? 'overflow-visible' : 'overflow-hidden'} relative rounded-[inherit] w-full ${(progressOutsideEnvelope && headerHeight2 !== undefined) || (headerUseFlex && headerHeight !== undefined && !overlayProgressOnEnvelope && !progressOutsideEnvelope) || (overlayProgressOnEnvelope && headerUseFlex1 && headerHeight1 !== undefined && !progressOutsideEnvelope) ? 'h-full' : ''}`} 
        style={contentWrapperStyle}
      >
        {/* Full card confetti canvas for Single 1 (useBox1) - covers entire card */}
        {useBox1 && !overlayProgressOnEnvelope && (
          <>
            {/* Back layer - behind envelope/gift container */}
            <canvas
              ref={confettiCanvasRef}
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: 1, filter: CONFETTI_BACK_BLUR, position: 'absolute' }}
            />
            {/* Front layer - in front of envelope/gift container */}
            <canvas
              ref={confettiCanvasFrontRef}
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: 4, filter: CONFETTI_BLUR, position: 'absolute' }}
            />
            {/* Mirrored layer - vertically mirrored confetti */}
            <canvas
              ref={confettiCanvasMirroredRef}
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: 1, filter: CONFETTI_MIRRORED_BLUR, position: 'absolute' }}
            />
          </>
        )}
        {/* Specular highlight that follows cursor (only when 3D animation is selected) */}
        {/* 6. Enhanced Specular Highlight - follows cursor and responds to tilt */}
        {shouldApplyTilt && isHovered && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${cursorPosition.x}px`,
              top: `${cursorPosition.y}px`,
              width: '225px',
              height: '225px',
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 30%, transparent 70%)',
              mixBlendMode: 'overlay',
              opacity: 0.4 + Math.max(0, (-tiltX - tiltY) / 12) * 0.3, // More intense when facing light
              zIndex: 100,
              transition: 'opacity 0.15s ease-out',
              filter: 'blur(8px)'
            }}
          />
        )}
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
              style={{ zIndex: 1, pointerEvents: 'none', filter: CONFETTI_BACK_BLUR }}
            />
            {/* Confetti canvas (front layer - in front of envelope) */}
            <canvas
              ref={confettiCanvasFrontRef}
              className="absolute inset-0"
              style={{ zIndex: 4, pointerEvents: 'none', filter: CONFETTI_BLUR }}
            />
            {/* Mirrored layer - vertically mirrored confetti */}
            <canvas
              ref={confettiCanvasMirroredRef}
              className="absolute inset-0"
              style={{ zIndex: 1, pointerEvents: 'none', filter: CONFETTI_MIRRORED_BLUR }}
            />
            {confettiWhiteOverlay && (
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                  zIndex: 2,
                  background:
                    'linear-gradient(to top, rgba(255,255,255,0.2) 0%, rgba(255, 255, 255, 0.0825) 30%, rgba(255,255,255,0.0) 100%)' // Reduced by 75%
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
          {!overlayProgressOnEnvelope && !useBox1 && (
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={backgroundBorderRadiusStyle}
            >
              {/* Confetti canvas (behind envelope) - only for non-Single 1 cards */}
              <canvas
                ref={confettiCanvasRef}
                className="absolute inset-0"
                style={{ zIndex: 1, pointerEvents: 'none', filter: CONFETTI_BACK_BLUR }}
              />
              {/* Confetti canvas (front layer - in front of envelope) */}
              {/* For Layout 1 style 2 single cards (Box2), front particles should be above the box (zIndex: 20) */}
              <canvas
                ref={confettiCanvasFrontRef}
                className="absolute inset-0"
                style={{ 
                  zIndex: (hideEnvelope && showGiftBoxWhenHidden && !useBox1) ? 21 : 4, 
                  pointerEvents: 'none', 
                  filter: CONFETTI_BLUR 
                }}
              />
              {/* Mirrored layer - vertically mirrored confetti */}
              <canvas
                ref={confettiCanvasMirroredRef}
                className="absolute inset-0"
                style={{ ...confettiCanvasStyle, filter: CONFETTI_MIRRORED_BLUR }}
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
          {/* Header background for Box1 (Style 1) - when overlayProgressOnEnvelope is false */}
          {!overlayProgressOnEnvelope && useBox1 && (
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={backgroundBorderRadiusStyle}
            >
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
              {sentDate ? `${sentDate} • ${from}` : from}
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
            className={`${hideEnvelope ? 'relative flex-1' : 'absolute'} ${hideEnvelope ? '' : ((useBox1 || layout2BoxType === '1') && box1Top !== undefined ? '' : (progressOutsideEnvelope && envelopeTopBase2 !== undefined ? '' : 'inset-0'))}`}
            style={envelopeContainerStyle}
            data-name={(useBox1 || layout2BoxType === '1') ? "Box1" : "Envelope"}
            data-node-id="1467:49190"
          >
            {/* Debug: Red line at estimated gift container top edge - only for Single 1 - SCALE-AWARE */}
            {/* This is the second floor for confetti particles - particles can land here and roll off */}
            {(useBox1 || layout2BoxType === '1') && (
              <div
                data-name="Second Floor"
                data-floor-type="single1"
                style={{
                  position: 'absolute',
                  // Scale-aware position: inside envelope container, so it scales with the container
                  // With transform origin 'center top' (or custom), the top edge position is relative to container
                  // Moved up 12px from original position
                  // NO HARDCODED VALUES - Use box1Top from config
                  top: box1Top !== undefined 
                    ? `${box1Top - 45 + (box1OffsetY !== undefined ? box1OffsetY : 0)}px` // Single 1 - Box1 top edge position
                    : undefined, // Must be defined in config
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '95px',
                  height: '1px',
                  backgroundColor: 'red',
                  zIndex: 9999,
                  pointerEvents: 'none',
                  opacity: 0 // Hidden visually but still detectable by confetti hook
                }}
                aria-label="Debug: Gift container top edge (Single 1) - Second Floor"
              />
            )}
            {/* Dots background - behind Batch 2 envelope or Single 2 box */}
            {hideEnvelope ? (
              <div
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '300px',
                  height: '300px',
                  zIndex: 0,
                  pointerEvents: 'none',
                  opacity: 1,
                }}
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
                  style={{
                    objectFit: 'contain',
                    width: '100%',
                    height: '100%',
                    display: 'block'
                  }}
                />
              </div>
            ) : null}
            {hideEnvelope && showGiftBoxWhenHidden ? (
              // Gift Box Container (for Single 2 or Layout 1 Style 3) - supports Box1, Box2, or Box3
              // Wrapped in inner div for absolute positioning with scale/offsetY
              <div style={envelopeInnerWrapperStyle}>
                {useBox1 || layout2BoxType === '1' ? (
                  // Box1 Image
                  <div style={box1WrapperStyle}>
                    <Image
                      src={box1Image}
                      alt="Box1"
                      fill
                      sizes="200px"
                      priority={true}
                      quality={100}
                      unoptimized={true}
                      style={box1ImageStyle}
                    />
                  </div>
                ) : (layout2BoxType === '3' || layout1Style === '3') ? (
                  // Box3 (Layout3Box) - use vibrant brand color directly (matching Layout 3)
                  <Layout3Box
                    boxColor={box3Color}
                    logoPath={svgLogoPath}
                    progress={validatedProgress}
                    isHovered={isHovered}
                    hideProgressIndicator={layout1Style === '3'}
                  />
                ) : (
                  // Box2 (default)
                  <Box2
                    progress={validatedProgress}
                    boxColor={themedBoxColor}
                    progressBarSourceColor={progressBarSourceColor}
                    progressBarLuminance={PROGRESS_BAR_LUMINANCE}
                    progressBarSaturation={PROGRESS_BAR_SATURATION}
                    isHovered={isHovered}
                    logoPath={svgLogoPath}
                    logoBrandColor={logoBrandColor}
                    animationType={animationType}
                    enable3D={enable3D}
                    parallaxX={parallaxX}
                    parallaxY={parallaxY}
                    tiltX={tiltX}
                    tiltY={tiltY}
                    hideProgressBar={hideProgressBarInBox}
                    centerLogo={centerLogoInBox}
                    logoScale={logoScale}
                    // Box controls (overrides GIFT_BOX_TOKENS when provided)
                    boxWidth={boxWidth}
                    boxHeight={boxHeight}
                    boxBorderRadius={boxBorderRadius}
                    boxScale={boxScale}
                  />
                )}
              </div>
            ) : hideEnvelope && !showGiftBoxWhenHidden && hideProgressBarInBox && layout1Style !== '3' ? (
              // Layout 1 Style 2: Always render Envelope2 (never Envelope3)
              // This block is specifically for Layout 1 Style 2 batch cards
              // Layout 1 Style 3 should go through the next block
              <div style={envelopeInnerWrapperStyle}>
                <Envelope2
                  key={`envelope2-${layout1Style}-${layout2BoxType}-${envelope2ScaleValue}`} // Force remount when layout/style/scale changes
                  progress={validatedProgress}
                  boxImage={boxImage}
                  boxColor={envelopeBoxColor}
                  flapColor={envelopeFlapColor}
                  boxOpacity={EFFECTIVE_BOX_OPACITY}
                  flapOpacity={EFFECTIVE_FLAP_OPACITY}
                  progressIndicatorShadowColor={progressIndicatorShadowColor}
                  progressBarSourceColor={progressBarSourceColor}
                  progressBarLuminance={PROGRESS_BAR_LUMINANCE}
                  progressBarSaturation={PROGRESS_BAR_SATURATION}
                  containerPadding={EFFECTIVE_ENVELOPE_PADDING}
                  containerMargin={EFFECTIVE_ENVELOPE_MARGIN}
                  isHovered={isHovered}
                  parallaxX={parallaxX}
                  parallaxY={parallaxY}
                  tiltX={tiltX}
                  tiltY={tiltY}
                  animationType={animationType}
                  enable3D={enable3D}
                  hideProgressBar={hideProgressBarInBox}
                  hidePaper={hidePaper}
                />
              </div>
            ) : hideEnvelope && !showGiftBoxWhenHidden ? (
              // LAYOUT 2 (Batch 2) or Layout 1 Style 3 (Batch): Envelope1, Envelope2, or Envelope3
              // For Layout 1 Style 3 (layout1Style === '3'), use Envelope3
              // For Layout 2 Style 1 (layout2BoxType === '1'), use Envelope1 (exactly like Layout 1, just scaled)
              // For Layout 2 Style 3 (layout2BoxType === '3'), use Envelope3
              // For Layout 2 Style 2 (default), use Envelope2
              <>
                {console.log('[SentCard] hideEnvelope:', hideEnvelope, 'showGiftBoxWhenHidden:', showGiftBoxWhenHidden, 'hidePaper prop:', hidePaper) || null}
                {(layout1Style === '3' || layout2BoxType === '3') ? (
                  // Envelope3 for Layout 1 Style 3 or Layout 2 Style 3
                  <div style={envelopeInnerWrapperStyle}>
                    <Envelope3
                      boxColor={envelope3Color}
                      logoPath={svgLogoPath}
                      progress={validatedProgress}
                      coverImage={boxImage}
                      isHovered={isHovered}
                      hideProgressIndicator={layout1Style === '3'}
                      style={envelope3ScaleStyle}
                    />
                  </div>
                ) : layout2BoxType === '1' ? (
                  // Envelope1: Render exactly as in Layout 1, wrapped in scaled container
                  // NO HARDCODED VALUES - Use envelope1 config (layout2.envelope1)
                  <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) translateY(${envelope1OffsetY !== undefined ? envelope1OffsetY : (envelope1OffsetYValue || 0)}px) scale(${envelope1Scale !== undefined ? envelope1Scale : (envelope1ScaleValue || 1)})`,
                    transformOrigin: 'center center',
                    width: envelope1Width !== undefined ? `${envelope1Width}px` : (envelopeWidth !== undefined ? `${envelopeWidth}px` : '300px'), // Default fallback, but config should always define this
                    height: envelope1Height !== undefined ? `${envelope1Height}px` : (envelopeHeight !== undefined ? `${envelopeHeight}px` : '384px'), // Default fallback, but config should always define this
                  }}>
                    <div style={envelopeBaseWrapperStyle}>
                      <Envelope1 ids={ids} baseTintColor={baseTintColor} />
                    </div>
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
                    {/* Image Badge - positioned above fade overlay */}
                    <div
                      className="absolute"
                      style={{
                        ...(layout1Style === '1'
                          ? {
                              // Center the Image Badge: envelope base is centered at 50%, 
                              // Image Badge was at left: 65px (15px offset from envelope base left: 50px)
                              // Envelope base width: 195.5px, Image Badge width: 165px
                              // To center Image Badge relative to centered envelope: 50% + (65 - 50 - (195.5 - 165)/2)px
                              // Simplified: 50% + (15 - 15.25)px = 50% - 0.25px
                              left: '50%',
                              transform: 'translateX(calc(-50% - 0px))',
                              top: ENVELOPE_DIMENSIONS.imageBadge.top,
                            }
                          : {
                              left: ENVELOPE_DIMENSIONS.imageBadge.left,
                              top: ENVELOPE_DIMENSIONS.imageBadge.top,
                            }
                        ),
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
                      data-name="Image Fade"
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
                          d="M91.6152 149.22L12.7204 83.6651L12.7204 83.665C11.638 82.7656 11.0967 82.3159 10.7076 81.7641C10.3628 81.2753 10.1068 80.7295 9.95108 80.1519C9.77539 79.5 9.77539 78.7963 9.77539 77.3889V40.468C9.77539 35.9875 9.77539 33.7473 10.6473 32.036C11.4143 30.5308 12.6382 29.3069 14.1435 28.5399C15.8548 27.668 18.095 27.668 22.5754 27.668L172.925 27.668C177.406 27.668 179.646 27.6681 181.357 28.54C182.863 29.307 184.086 30.5308 184.853 32.0361C185.725 33.7474 185.725 35.9876 185.725 40.468V77.3889C185.725 78.7963 185.725 79.5 185.55 80.1519C185.394 80.7295 185.138 81.2753 184.793 81.7641C184.404 82.3159 183.863 82.7656 182.78 83.6651L103.886 149.22C101.703 151.034 100.611 151.941 99.3931 152.288C98.3193 152.593 97.1815 152.593 96.1077 152.288C94.8898 151.941 93.7983 151.034 91.6152 149.22Z"
                          fill="url(#imageFadeGradient)"
                        />
                        <defs>
                          <linearGradient
                            id="imageFadeGradient"
                            x1="97.75"
                            y1="27.668"
                            x2="97.75"
                            y2="221"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop stopColor="black" stopOpacity="0" />
                            <stop offset="0.5" stopColor="black" stopOpacity="0" />
                            <stop offset="0.7" stopColor="black" stopOpacity="0.1" />
                            <stop offset="1" stopColor="black" stopOpacity="0.3" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                ) : (layout1Style === '3' || layout2BoxType === '3') ? (
                  // Envelope3 for Layout 1 Style 3 or Layout 2 Style 3
                  <div style={envelopeInnerWrapperStyle}>
                    <Envelope3
                      boxColor={envelope3Color}
                      logoPath={svgLogoPath}
                      progress={validatedProgress}
                      coverImage={boxImage}
                      isHovered={isHovered}
                      hideProgressIndicator={layout1Style === '3'}
                      style={envelope3ScaleStyle}
                    />
                  </div>
                ) : (
                  // Layout 2 Style 2: Envelope2 (wrapped to apply scale and offsetY)
                  <div style={envelopeInnerWrapperStyle}>
                    <Envelope2
                      progress={validatedProgress}
                      boxImage={boxImage}
                      boxColor={envelopeBoxColor}
                      flapColor={envelopeFlapColor}
                      boxOpacity={EFFECTIVE_BOX_OPACITY}
                      flapOpacity={EFFECTIVE_FLAP_OPACITY}
                      progressIndicatorShadowColor={progressIndicatorShadowColor}
                      progressBarSourceColor={progressBarSourceColor}
                      progressBarLuminance={PROGRESS_BAR_LUMINANCE}
                      progressBarSaturation={PROGRESS_BAR_SATURATION}
                      containerPadding={EFFECTIVE_ENVELOPE_PADDING}
                      containerMargin={EFFECTIVE_ENVELOPE_MARGIN}
                      isHovered={isHovered}
                      parallaxX={parallaxX}
                      parallaxY={parallaxY}
                      tiltX={tiltX}
                      tiltY={tiltY}
                      animationType={animationType}
                      enable3D={enable3D}
                      hideProgressBar={hideProgressBarInBox}
                      hidePaper={hidePaper}
                    />
                  </div>
                )}
              </>
            ) : useBox1 ? (
              // Box1 Image (replaces envelope)
              <div style={box1WrapperStyle}>
                <Image
                  src={box1Image}
                  alt="Box1"
                  fill
                  sizes="200px"
                  priority={true}
                  quality={100}
                  unoptimized={true}
                  style={box1ImageStyle}
                />
              </div>
            ) : (
              <>
                {/* Envelope1 Container - wraps all envelope elements to move together when centered */}
                <div
                  style={{
                    position: 'absolute',
                    ...(layout1Style === '1' && envelopeGroup?.centered
                      ? (() => {
                          // Center the envelope base within the parent container
                          // Envelope base: left: 50px, width: 195.5px, center at 50 + 97.75 = 147.75px from wrapper's left edge
                          // To center: position wrapper so envelope base center aligns with parent center
                          // Formula: left = 50% - (envelope base center position) + user offset
                          //         = 50% - 147.75px + user offset
                          const envelopeBaseCenter = 147.75 // Envelope base center from wrapper's left edge
                          const userOffsetX = envelopeGroup?.offsetX ?? 0
                          return {
                            left: `calc(50% - ${envelopeBaseCenter}px + ${userOffsetX}px)`,
                            top: envelopeGroup?.offsetY || 0,
                          }
                        })()
                      : {
                          left: 0,
                          top: 0,
                        }
                    ),
                    width: '100%',
                    height: '100%'
                  }}
                >
                  {/* Base (envelope base) - positioned relative to container */}
                  <div style={envelopeBaseWrapperStyle}>
                    <Envelope1 
                      ids={ids} 
                      baseTintColor={baseTintColor} 
                      centered={false}
                      containerOffset={0}
                    />
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
                  {/* Rectangle 1790 (card shape container) - positioned relative to envelope container */}
                  <CardShape ids={ids} base2TintColor={base2TintColor} centered={false} containerOffset={0} />
                  {/* Image Container (hosts image) - positioned relative to envelope container */}
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
            
                    {/* Image Container Fade (duplicate shape, black gradient fill) - positioned relative to envelope container */}
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
                  {/* Image Badge - positioned above fade overlay - positioned relative to envelope container */}
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
              bottom: '-0.5px',
              left: 0,
              right: 0,
              height: '36px',
              zIndex: 25, // Increased to be above footer (zIndex: 20) and other elements
              pointerEvents: 'none'
            }}
            data-name="Union"
            data-node-id="1467:49199"
          >
            {/* Background blur layer */}
            <div
              className="absolute inset-0"
              style={{
                backdropFilter: 'blur(.35px)',
                WebkitBackdropFilter: 'blur(.35px)',
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
          infoSubtitle={brandName || giftSubtitle}
          equalPadding={
            progressOutsideEnvelope && footerPadEqual2 !== undefined
              ? footerPadEqual2
              : overlayProgressOnEnvelope
              ? FOOTER_CONFIG.layout2.equalPadding
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
              ? FOOTER_CONFIG.layout2.bottomPadding
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
              ? FOOTER_CONFIG.layout2.topPadding
              : footerTopPadding !== undefined
              ? footerTopPadding
              : FOOTER_CONFIG.default.topPadding
          }
          transparent={
            progressOutsideEnvelope && footerTransparent2 !== undefined
              ? footerTransparent2
              : overlayProgressOnEnvelope
              ? FOOTER_CONFIG.layout2.transparent
              : footerTransparent !== undefined
              ? footerTransparent
              : FOOTER_CONFIG.default.transparent
          }
          hideInfoOnHover={hideInfoOnHover}
          onShareClick={handleCaptureCard}
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
              paddingBottom: progressBottomPadding2 !== undefined ? `${progressBottomPadding2}px` : `18px`,
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
      
      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => {
          // CRITICAL: Reset hover state FIRST, then close modal
          // This ensures confetti stops before modal state changes
          handleHoverLeave()
          setIsShareModalOpen(false)
          setCardPropsForShare(null)
          setShouldPauseConfetti(false)
        }}
        onOpen={() => {
          // Reset pause state when modal opens to ensure animation can start
          setShouldPauseConfetti(false)
        }}
        cardProps={cardPropsForShare}
        onPauseConfetti={() => setShouldPauseConfetti(true)}
      />
    </div>
  )
}

export default React.memo(SentCard)
