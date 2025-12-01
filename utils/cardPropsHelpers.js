// Helper functions for generating card props
// Extracted from app/page.jsx to improve maintainability and performance

import { FOOTER_CONFIG, LAYOUT_CONFIG } from '@/constants/sentCardConstants'

/**
 * Get SentCard4 props based on layout number
 */
export const getSentCard4Props = (card, layoutNum, useColoredBackground) => {
  // Map layout number to single config key
  const singleConfigKey = `single${layoutNum}`
  const layoutConfig = LAYOUT_CONFIG[singleConfigKey]
  
  // If config doesn't exist, return null to indicate no cards should be shown
  if (!layoutConfig) {
    return null
  }
  
  const footerConfig = FOOTER_CONFIG.single // Single cards use the same footer config
  
  return {
    from: card.from,
    title: card.title,
    boxImage: card.boxImage,
    giftTitle: card.giftTitle,
    giftSubtitle: card.giftSubtitle,
    progress: card.progress,
    sentDate: card.sentDate,
    headerBgOverride: useColoredBackground ? null : "#E3E7ED",
    overlayProgressOnEnvelope: layoutConfig.overlayProgressOnEnvelope,
    footerPadEqual: footerConfig.equalPadding,
    footerTopPadding: footerConfig.topPadding,
    footerBottomPadding: footerConfig.bottomPadding,
    showFooterReminder: footerConfig.showReminder,
    // Header settings from layout config
    headerHeight: layoutConfig.header.height,
    headerUseFlex: layoutConfig.header.useFlex,
    // Union setting from layout config
    hideUnion: layoutConfig.hideUnion,
    // Envelope settings from layout config (for Single 2 - controls gift container positioning)
    envelopeScale: layoutConfig.envelope?.scale,
    envelopeOffsetY: layoutConfig.envelope?.offsetY,
  }
}

/**
 * Get Single 1 specific props (with Box1/Box2 controls)
 */
export const getSingle1Props = (card, useColoredBackground, layoutNum, style, animationType, enable3D) => {
  // Layout 1 single cards: Switch between Box1 (Style 1) and Box2 (Style 2)
  // Style 1: single1 config (Box1)
  // Style 2: Use EXACT same config logic as batch card - reads from 'default' for layout flags, 'layout1StyleB' for envelope/container
  const singleConfigKey = style === '1' ? 'single1' : 'default' // Batch uses 'default' as base layoutConfig
  const layoutConfig = LAYOUT_CONFIG[singleConfigKey] || LAYOUT_CONFIG.single1 // Fallback to single1
  
  // For Style 2, use EXACT same config logic as batch card
  let effectiveLayoutConfig = layoutConfig
  let effectiveEnvelopeContainer = effectiveLayoutConfig.envelopeContainer
  
  if (style === '2') {
    // For single cards Style 2, use layout1SingleStyleB (has enableConfetti)
    // For batch cards, use layout1StyleB (batch config)
    // Since this is getSingle1Props, we use layout1SingleStyleB
    effectiveLayoutConfig = LAYOUT_CONFIG.layout1SingleStyleB || LAYOUT_CONFIG.layout1StyleB
    effectiveEnvelopeContainer = effectiveLayoutConfig.envelopeContainer || LAYOUT_CONFIG.layout1StyleB.envelopeContainer
  }
  // Style 3 uses the same config as Style 2 for now (Box3/Envelope3 will be handled in SentCard)
  
  const effectiveEnvelopeScale = effectiveLayoutConfig?.envelope?.scale || 1
  const effectiveEnvelopeOffsetY = effectiveLayoutConfig?.envelope?.offsetY || 0
  
  // Footer config - EXACT same as batch card
  const footerConfig = FOOTER_CONFIG.default
  
  return {
    from: card.from,
    title: card.title,
    boxImage: card.boxImage,
    giftTitle: card.giftTitle,
    giftSubtitle: card.giftSubtitle,
    progress: card.progress,
    sentDate: card.sentDate,
    headerBgOverride: useColoredBackground ? null : "#E3E7ED",
    // Layout config values - EXACT same as batch card (batch reads from layoutConfig, not effectiveLayoutConfig)
    hideUnion: layoutConfig.hideUnion,
    confettiWhiteOverlay: layoutConfig.confettiWhiteOverlay,
    envelopeHighZ: layoutConfig.envelopeHighZ,
    overlayProgressOnEnvelope: layoutConfig.overlayProgressOnEnvelope,
    progressOutsideEnvelope: layoutConfig.progressOutsideEnvelope,
    showRedline: effectiveLayoutConfig.showRedline || false,
    // Hide envelope setting - ONLY difference: single uses Box2 (showGiftBoxWhenHidden: true)
    hideEnvelope: (style === '2' || style === '3') ? true : (layoutConfig.hideEnvelope || false),
    showGiftBoxWhenHidden: (style === '2' || style === '3') ? true : false, // Style 2 = Box2, Style 3 = Box3
    // Box1 exclusive controls (Style 1 only - Box1)
    useBox1: style === '1' ? !!layoutConfig.box1 : false,
    // Layout 1 style (for Box3/Envelope3 support)
    layout1Style: style,
    box1OffsetY: layoutConfig.box1?.offsetY,
    box1Scale: layoutConfig.box1?.scale,
    box1Width: layoutConfig.box1?.width,
    box1Height: layoutConfig.box1?.height,
    box1Top: layoutConfig.box1?.top,
    box1Left: layoutConfig.box1?.left,
    box1Right: layoutConfig.box1?.right,
    box1Bottom: layoutConfig.box1?.bottom,
    box1TransformOrigin: layoutConfig.box1?.transformOrigin,
    // Envelope settings - EXACT same as batch card
    envelopeScale: effectiveEnvelopeScale,
    envelopeOffsetY: effectiveEnvelopeOffsetY,
    // Box2 settings (not used for batch, but kept for single)
    boxWidth: effectiveLayoutConfig.box?.width,
    boxHeight: effectiveLayoutConfig.box?.height,
    boxBorderRadius: effectiveLayoutConfig.box?.borderRadius,
    boxScale: effectiveLayoutConfig.box?.scale,
    boxOffsetY: effectiveLayoutConfig.box?.offsetY, // Box-specific offsetY (overrides envelopeOffsetY for single cards)
    // Envelope container settings - EXACT same as batch card
    envelopeContainerPadding: effectiveEnvelopeContainer?.padding,
    envelopeContainerMargin: effectiveEnvelopeContainer?.margin,
    envelopeBoxOpacity: effectiveEnvelopeContainer?.boxOpacity,
    envelopeFlapOpacity: effectiveEnvelopeContainer?.flapOpacity,
    envelopeFlapLuminance: effectiveEnvelopeContainer?.flapLuminance,
    envelopeFlapSaturation: effectiveEnvelopeContainer?.flapSaturation,
    envelopeBoxLuminance: effectiveEnvelopeContainer?.boxLuminance,
    envelopeBoxSaturation: effectiveEnvelopeContainer?.boxSaturation,
    hidePaper: effectiveLayoutConfig.hidePaper !== undefined ? effectiveLayoutConfig.hidePaper : false,
    // Layout flags - EXACT same as batch card
    hideProgressBarInBox: (style === '2') ? true : (effectiveLayoutConfig.hideProgressBarInBox || false),
    centerLogoInBox: style === '2' ? (effectiveLayoutConfig.logoContainer?.centerLogo !== undefined ? effectiveLayoutConfig.logoContainer.centerLogo : false) : (effectiveLayoutConfig.centerLogoInBox || false),
    enableConfetti: effectiveLayoutConfig.enableConfetti || false,
    // Header settings - EXACT same as batch card
    headerHeight: effectiveLayoutConfig.header.height,
    headerUseFlex: effectiveLayoutConfig.header.useFlex,
    // Footer settings - EXACT same as batch card
    footerPadEqual: footerConfig.equalPadding,
    footerTopPadding: footerConfig.topPadding,
    footerBottomPadding: footerConfig.bottomPadding,
    footerTransparent: footerConfig.transparent,
    showFooterProgress: footerConfig.showProgress,
    showFooterReminder: footerConfig.showReminder,
    hideInfoOnHover: footerConfig.hideInfoOnHover,
    // Animation settings
    animationType: animationType,
    enable3D: enable3D || false,
  }
}

/**
 * Get SentCard props based on layout number
 */
export const getSentCardProps = (card, layoutNum, useColoredBackground, animationType, enable3D, style, useSingleConfig = false) => {
  // Validate layoutNum
  if (!layoutNum) {
    // Default to Layout 1
    layoutNum = '1'
  }
  
  // Map layout number to config key
  let layoutKey
  if (useSingleConfig) {
    // For single views, use single config
    layoutKey = `single${layoutNum}`
  } else {
    // For batch views, use batch config
    // Layout 1 uses 'default' config
    if (layoutNum === '1') layoutKey = 'default'
    else if (layoutNum === '2') layoutKey = 'layout2'
    else {
      // Fallback: if layoutNum is invalid, use 'default' (Layout 1)
      layoutKey = 'default'
    }
  }
  
  if (!layoutKey) {
    return {}
  }
  
  const layoutConfig = LAYOUT_CONFIG[layoutKey]
  if (!layoutConfig) {
    return {}
  }
  
  // Layout 1 uses FOOTER_CONFIG.default
  const footerConfig = layoutNum === '1' ? FOOTER_CONFIG.default : FOOTER_CONFIG.layout2
  
  const useAlteredLayout1 = layoutNum === '2'
  const useAlteredLayout = layoutNum !== '1'
  
  // ============================================================================
  // LAYOUT-SPECIFIC GUARDS - Always check layoutNum explicitly to prevent cross-layout contamination
  // ============================================================================
  const isLayout1 = !useSingleConfig && layoutNum === '1'
  const isLayout2 = !useSingleConfig && layoutNum === '2'
  
  // ============================================================================
  // LAYOUT 1: Style switching between Style 1 and Style 2
  // ============================================================================
  // Style 1:
  //   - Single card: Box1 (Box1 with PNG image)
  //   - Batch card: Envelope1 (Envelope1 with 8 breathing grid cells)
  // Style 2:
  //   - Single card: Box2 (Box2 component)
  //   - Batch card: Envelope2 (Envelope2 with paper component)
  // For Layout 2 and other layouts, use their own config values
  
  // For Layout 1, switch configs based on style (only for batch cards)
  // Single cards are handled in getSingle1Props
  let effectiveLayoutConfig = layoutConfig
  let effectiveEnvelopeContainer = effectiveLayoutConfig.envelopeContainer
  
  if (isLayout1 && !useSingleConfig && style === '2') {
    // Style 2 batch: Use Layout 1 Style 2's separate config (does NOT affect Layout 2)
    effectiveLayoutConfig = LAYOUT_CONFIG.layout1StyleB
    effectiveEnvelopeContainer = LAYOUT_CONFIG.layout1StyleB.envelopeContainer
  }
  // Style 1: Use Layout 1's config (already set as layoutConfig)
  
  // ============================================================================
  // ENVELOPE SETTINGS - Layout-specific overrides
  // ============================================================================
  // Layout 1 batch: Envelope 1 uses Layout 1's default envelope settings (scale: 1, offsetY: 0)
  // Layout 1 single: Box1 uses its own settings
  // Layout 2: Use envelope1 or envelope2 based on layout2BoxType
  let effectiveEnvelopeScale, effectiveEnvelopeOffsetY, effectiveEnvelopeWidth, effectiveEnvelopeHeight
  if (layoutNum === '2' && !useSingleConfig) {
    // Layout 2 batch: envelopeScale and envelopeOffsetY are NOT used directly
    // Instead, envelope1Scale/envelope1OffsetY and envelope2Scale/envelope2OffsetY are passed separately
    // SentCard will choose which one to use based on layout2BoxType
    // Set defaults here, but they should be overridden by envelope1/envelope2 specific props
    effectiveEnvelopeScale = effectiveLayoutConfig?.envelope2?.scale || 1 // Default to envelope2 for Layout 2
    effectiveEnvelopeOffsetY = effectiveLayoutConfig?.envelope2?.offsetY || 0
    effectiveEnvelopeWidth = effectiveLayoutConfig?.envelope1?.width // Envelope1 has width/height
    effectiveEnvelopeHeight = effectiveLayoutConfig?.envelope1?.height
  } else {
    // Layout 1 or other: Use envelope config
    effectiveEnvelopeScale = effectiveLayoutConfig?.envelope?.scale || 1
    effectiveEnvelopeOffsetY = effectiveLayoutConfig?.envelope?.offsetY || 0
    effectiveEnvelopeWidth = effectiveLayoutConfig?.envelope?.width
    effectiveEnvelopeHeight = effectiveLayoutConfig?.envelope?.height
  }
  
  return {
    from: card.from,
    title: card.title,
    boxImage: card.boxImage,
    giftTitle: card.giftTitle,
    giftSubtitle: card.giftSubtitle,
    progress: card.progress,
    sentDate: card.sentDate,
    headerBgOverride: useColoredBackground ? null : "#E3E7ED",
    // Layout config values - ALWAYS use Layout 1's config (don't change layout properties)
    hideUnion: layoutConfig.hideUnion,
    confettiWhiteOverlay: layoutConfig.confettiWhiteOverlay,
    envelopeHighZ: layoutConfig.envelopeHighZ,
    overlayProgressOnEnvelope: layoutConfig.overlayProgressOnEnvelope,
    progressOutsideEnvelope: layoutConfig.progressOutsideEnvelope,
    
    // ============================================================================
    // LAYOUT 1 SPECIFIC: hideEnvelope based on style
    // ============================================================================
    // Single cards: 
    //   - Style 1: useBox1=true, hideEnvelope=false (Box1)
    //   - Style 2: hideEnvelope=true, showGiftBoxWhenHidden=true (Box2)
    //   - Style 3: hideEnvelope=true, showGiftBoxWhenHidden=true (Box3)
    // Batch cards:
    //   - Style 1: hideEnvelope=false (Envelope1)
    //   - Style 2: hideEnvelope=true, showGiftBoxWhenHidden=false (Envelope2)
    //   - Style 3: hideEnvelope=true, showGiftBoxWhenHidden=false (Envelope3)
    // For Layout 2 and single configs, use their own config value
    hideEnvelope: isLayout1 
      ? (useSingleConfig ? ((style === '2' || style === '3') ? true : false) : ((style === '2' || style === '3') ? true : false))
      : (layoutConfig.hideEnvelope || false),
    
    // Show gift box when envelope is hidden
    // Style 2 single: showGiftBoxWhenHidden=true (Box2)
    // Style 3 single: showGiftBoxWhenHidden=true (Box3)
    // Style 2 batch: showGiftBoxWhenHidden=false (Envelope2)
    // Style 3 batch: showGiftBoxWhenHidden=false (Envelope3)
    // Style 1: showGiftBoxWhenHidden=false (Box1/Envelope1 don't use this)
    showGiftBoxWhenHidden: isLayout1
      ? (useSingleConfig ? ((style === '2' || style === '3') ? true : false) : ((style === '2' || style === '3') ? false : false))
      : (effectiveLayoutConfig.showGiftBoxWhenHidden || false),
    // Layout 1 style (for Box3/Envelope3 support)
    layout1Style: isLayout1 ? style : undefined,
    
    // ============================================================================
    // LAYOUT 1 SPECIFIC: hideProgressBarInBox
    // ============================================================================
    // Box progress bar setting (false for Layout 1 batch - Envelope 1, otherwise use config)
    // Layout 1 style 2: Hide progress bar in box/envelope
    hideProgressBarInBox: (isLayout1 && style === '2') ? true : (effectiveLayoutConfig.hideProgressBarInBox || false),
    
    // Box logo centering setting
    centerLogoInBox: effectiveLayoutConfig.centerLogoInBox || false,
    // Box settings
    boxWidth: effectiveLayoutConfig.box?.width,
    boxHeight: effectiveLayoutConfig.box?.height,
    boxBorderRadius: effectiveLayoutConfig.box?.borderRadius,
    boxScale: effectiveLayoutConfig.box?.scale,
    boxOffsetY: effectiveLayoutConfig.box?.offsetY, // Box-specific offsetY (overrides envelopeOffsetY for single cards)
    // Box1 settings (for Layout 2 Style 1 when layout2BoxType === '1')
    box1Scale: effectiveLayoutConfig.box1?.scale,
    box1Width: effectiveLayoutConfig.box1?.width,
    box1Height: effectiveLayoutConfig.box1?.height,
    box1Top: effectiveLayoutConfig.box1?.top,
    box1Left: effectiveLayoutConfig.box1?.left,
    box1Right: effectiveLayoutConfig.box1?.right,
    box1Bottom: effectiveLayoutConfig.box1?.bottom,
    box1OffsetY: effectiveLayoutConfig.box1?.offsetY,
    box1TransformOrigin: effectiveLayoutConfig.box1?.transformOrigin,
    
    // ============================================================================
    // LAYOUT 1 SPECIFIC: enableConfetti
    // ============================================================================
    // Confetti and redline settings (false for Layout 1 batch - Envelope 1, otherwise use config)
    enableConfetti: effectiveLayoutConfig.enableConfetti || false,
    showRedline: effectiveLayoutConfig.showRedline || false,
    
    // Envelope settings (overridden for box style in Layout 1 only)
    envelopeScale: effectiveEnvelopeScale,
    envelopeOffsetY: effectiveEnvelopeOffsetY,
    envelopeWidth: effectiveEnvelopeWidth,
    envelopeHeight: effectiveEnvelopeHeight,
    // Envelope group positioning (Layout 1 Style 1 only)
    envelopeGroup: effectiveLayoutConfig.envelopeGroup,
    // Pass envelope1 and envelope2 configs separately for Layout 2
    envelope1Scale: effectiveLayoutConfig.envelope1?.scale,
    envelope1OffsetY: effectiveLayoutConfig.envelope1?.offsetY,
    envelope1Width: effectiveLayoutConfig.envelope1?.width,
    envelope1Height: effectiveLayoutConfig.envelope1?.height,
    envelope2Scale: effectiveLayoutConfig.envelope2?.scale,
    envelope2OffsetY: effectiveLayoutConfig.envelope2?.offsetY,
    // ============================================================================
    // ENVELOPE CONTAINER SETTINGS
    // ============================================================================
    // Style 2 batch: Uses Layout 2's envelopeContainer (has paper - padding.top: 46.5)
    // Style 1 batch: Uses Layout 1's default envelopeContainer (no paper - padding.top: 21)
    // Layout 2: Use their own envelopeContainer settings
    envelopeContainerPadding: effectiveEnvelopeContainer?.padding,
    envelopeContainerMargin: effectiveEnvelopeContainer?.margin,
    envelopeBoxOpacity: effectiveEnvelopeContainer?.boxOpacity,
    envelopeFlapOpacity: effectiveEnvelopeContainer?.flapOpacity,
    envelopeFlapLuminance: effectiveEnvelopeContainer?.flapLuminance,
    envelopeFlapSaturation: effectiveEnvelopeContainer?.flapSaturation,
    envelopeBoxLuminance: effectiveEnvelopeContainer?.boxLuminance,
    envelopeBoxSaturation: effectiveEnvelopeContainer?.boxSaturation,
    // Paper visibility control (for Envelope2)
    hidePaper: effectiveLayoutConfig.hidePaper !== undefined ? effectiveLayoutConfig.hidePaper : false,
    // Box1 exclusive controls (not used for batch cards - batch uses Envelope1/Envelope2)
    useBox1: false, // Batch cards don't use Box1, they use Envelope1 (Style 1) or Envelope2 (Style 2)
    // Header settings (for all layouts) - Use effective layout config
    headerHeight: effectiveLayoutConfig.header.height,
    headerUseFlex: effectiveLayoutConfig.header.useFlex,
    // Altered Layout 1 specific header settings
    headerHeight1: useAlteredLayout1 ? layoutConfig.header.height : undefined,
    headerUseFlex1: useAlteredLayout1 ? layoutConfig.header.useFlex : undefined,
    // Footer settings - ALWAYS use Layout 1's footer config
    footerPadEqual: footerConfig.equalPadding,
    footerTopPadding: footerConfig.topPadding,
    footerBottomPadding: footerConfig.bottomPadding,
    footerTransparent: footerConfig.transparent,
    showFooterProgress: footerConfig.showProgress,
    showFooterReminder: footerConfig.showReminder,
    hideInfoOnHover: footerConfig.hideInfoOnHover,
    animationType: animationType,
    enable3D: enable3D || false,
  }
}

