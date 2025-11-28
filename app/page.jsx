'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import ControlBar from '@/components/ControlBar'
import CardGrid from '@/components/CardGrid'
import { shuffleArray, generateRandomSentCardData } from '@/utils/cardData'
import { FOOTER_CONFIG, LAYOUT_CONFIG } from '@/constants/sentCardConstants'

// Static data moved outside component to avoid recreation on every render
const ALL_BOX_PAIRS = [
  { box1: '/assets/Box 1/Box 01.png', box2: '/assets/Box 2/Box2-01.png' },
  { box1: '/assets/Box 1/Box 02.png', box2: '/assets/Box 2/Box2-02.png' },
  { box1: '/assets/Box 1/Box 03.png', box2: '/assets/Box 2/Box2-03.png' },
  { box1: '/assets/Box 1/Box 04.png', box2: '/assets/Box 2/Box2-04.png' },
  { box1: '/assets/Box 1/Box 05.png', box2: '/assets/Box 2/Box2-05.png' },
  { box1: '/assets/Box 1/Box 06.png', box2: '/assets/Box 2/Box2-06.png' }
]

const ALL_MESSAGES = [
  // Short messages
  'Thank you!',
  'Thanks!',
  'Much appreciated!',
  'You\'re the best!',
  'Grateful!',
  // Medium messages
  'Thank you for being such a great mentor!',
  'I really appreciate all your help and guidance!',
  'Thanks for everything you\'ve done for me!',
  'Your mentorship has been invaluable to me!',
  'Thank you for your patience and support!',
  'I\'m so grateful for your guidance!',
  'Your advice has been life-changing!',
  'Thank you for being an amazing mentor!',
  // Long messages
  'Thank you so much for all the time and effort you\'ve put into helping me grow and develop my skills. Your mentorship has truly made a difference in my career!',
  'I wanted to express my deepest gratitude for your unwavering support and guidance throughout this journey. Your wisdom and patience have been invaluable to me.',
  'Thank you for being such an incredible mentor and for always taking the time to help me understand complex concepts. Your dedication to my growth means the world to me!',
  'I cannot thank you enough for all the valuable lessons you\'ve taught me and for always being there when I needed guidance. Your mentorship has been transformative!',
  'Thank you for your endless patience, your insightful advice, and for believing in me even when I doubted myself. You\'ve made such a positive impact on my life!',
  'I am so grateful for your mentorship and for all the opportunities you\'ve given me to learn and grow. Thank you for being such an amazing teacher and guide!',
  'Thank you for taking the time to mentor me and for sharing your knowledge and experience. Your guidance has been instrumental in helping me achieve my goals!',
  'I wanted to thank you for being such a wonderful mentor and for always pushing me to be my best. Your support and encouragement have meant everything to me!'
]

// All cover images
const ALL_COVERS = [
  '/assets/covers/Birthday01.png',
  '/assets/covers/Birthday02.png',
  '/assets/covers/Birthday03.png',
  '/assets/covers/Birthday04.png',
  '/assets/covers/Birthday05.png',
  '/assets/covers/Birthday06.png',
  '/assets/covers/Congratulations01.png',
  '/assets/covers/Congratulations02.png',
  '/assets/covers/Congratulations03.png',
  '/assets/covers/Congratulations04.png',
  '/assets/covers/Congratulations05.png',
  '/assets/covers/Congratulations06.png',
  '/assets/covers/Congratulations07.png',
  '/assets/covers/Congratulations08.png',
  '/assets/covers/Congratulations09.png',
  '/assets/covers/Congratulations10.png',
  '/assets/covers/Congratulations11.png',
  '/assets/covers/Congratulations12.png',
  '/assets/covers/Congratulations13.png',
  '/assets/covers/Holiday 01.png',
  '/assets/covers/Holiday 02.png',
  '/assets/covers/Holiday 03.png',
  '/assets/covers/Holiday 04.png',
  '/assets/covers/Holiday 05.png',
  '/assets/covers/Holiday 06.png',
  '/assets/covers/Holiday 7.png',
  '/assets/covers/Holiday 8.png',
  '/assets/covers/Onboarding 03.png',
  '/assets/covers/Onboarding 04.png',
  '/assets/covers/Onboarding 05.png',
  '/assets/covers/Onboarding 06.png',
  '/assets/covers/Onboarding 07.png',
  '/assets/covers/Onboarding 08.png',
  '/assets/covers/Sales & Marketing 01.png',
  '/assets/covers/Sales & Marketing 02.png',
  '/assets/covers/Sales & Marketing 03.png',
  '/assets/covers/Sales & Marketing 04.png',
  '/assets/covers/Sales & Marketing 05.png',
  '/assets/covers/Sales & Marketing 06.png',
  '/assets/covers/Sales & Marketing 07.png',
  '/assets/covers/Sales & Marketing 08.png',
  '/assets/covers/Sales & Marketing 09.png',
  '/assets/covers/Thank you 01.png',
  '/assets/covers/Thank you 02.png',
  '/assets/covers/Thank you 03.png',
  '/assets/covers/Thank you 04.png',
  '/assets/covers/Thank you 05.png',
  '/assets/covers/Thank you 06 1.png',
  '/assets/covers/Workiversary01.png',
  '/assets/covers/Workiversary02.png',
  '/assets/covers/Workiversary03.png',
  '/assets/covers/Workiversary04.png',
  '/assets/covers/Workiversary05.png',
  '/assets/covers/Workiversary06.png',
  '/assets/covers/Workiversary07.png'
]

// SentCard data
const ALL_SENDERS = [
  'Jim Pfiffer', 'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez',
  'David Kim', 'Olivia Martinez', 'James Wilson', 'Lisa Tran',
  'Ryan Thompson', 'Jessica Brown', 'Daniel Lee', 'Amanda White'
]

const ALL_TITLES = [
  'New Hires Onboarding', 'Birthday Celebration', 'Thank You', 'Workiversary Milestone',
  'Sales Achievement', 'Team Recognition', 'Congratulations', 'Holiday Greetings',
  'Project Success', 'Anniversary Special', 'Welcome Aboard', 'Appreciation Day'
]

const ALL_GIFT_TITLES = [
  "Holiday's sparkles", "Birthday Bundle", "Appreciation Gift", "Anniversary Special",
  "Thank You Collection", "Celebration Box", "Recognition Gift", "Welcome Package",
  "Achievement Award", "Milestone Gift", "Success Collection", "Gratitude Box"
]

const ALL_GIFT_SUBTITLES = [
  'Collection by Goody', 'Celebration Collection', 'Thank You Collection', 'Milestone Collection',
  'Recognition Series', 'Appreciation Line', 'Success Series', 'Welcome Collection',
  'Achievement Set', 'Holiday Collection', 'Gratitude Series', 'Special Edition'
]

const ALL_SENT_DATES = [
  '1d ago', '2d ago', '3d ago', '4d ago', '5d ago',
  '1w ago', '2w ago', '3w ago', '1mo ago'
]


export default function Home() {
  const [activeTab, setActiveTab] = useState('gift') // 'gift' | 'sent'
  const [useColoredBackground, setUseColoredBackground] = useState(false) // Toggle for theming
  const [animationType, setAnimationType] = useState('highlight') // Animation type: 'highlight', 'breathing', or 'none'
  const [enable3D, setEnable3D] = useState(false) // Standalone 3D toggle that works with highlight or breathing
  const [layoutNumber, setLayoutNumber] = useState('1') // '1' | '2' | '3' - which layout pair to use (Layout 0 merged into Layout 1)
  const [style, setStyle] = useState('A') // 'A' | 'B' - for Layout 1 only: Style A = Box1/Envelope1, Style B = Box2/Envelope2
  const [viewType, setViewType] = useState('mixed') // 'mixed' | 'batch' | 'single' - what to display
  const [mixSeed, setMixSeed] = useState(0) // Seed to regenerate mix when toggled
  const [showSettingsMenu, setShowSettingsMenu] = useState(false) // Mobile settings menu visibility
  const [cardStates, setCardStates] = useState({
    card1: 'unopened',
    card2: 'unopened',
    card3: 'unopened',
    card4: 'unopened',
    card5: 'unopened',
    card6: 'unopened',
    card7: 'unopened',
    card8: 'unopened'
  })
  
  // Randomize box assignments on client-side only to avoid hydration mismatch
  // Start with default values to ensure server/client match, then randomize in useEffect
  const [boxPairs, setBoxPairs] = useState(() => {
    // Return default order for initial render (server and client will match)
    const selected = []
    for (let i = 0; i < 8; i++) {
      selected.push(ALL_BOX_PAIRS[i % ALL_BOX_PAIRS.length])
    }
    return selected
  })
  
  // Randomize messages with varying lengths
  const [messages, setMessages] = useState(() => {
    // Return first 8 messages for initial render (server and client will match)
    return ALL_MESSAGES.slice(0, 8)
  })
  
  // SentCard data state
  const [sentCards, setSentCards] = useState(() => {
    // Return default values for initial render (server and client will match)
    return Array(8).fill(null).map((_, i) => ({
      from: ALL_SENDERS[i % ALL_SENDERS.length],
      title: ALL_TITLES[i % ALL_TITLES.length],
      boxImage: ALL_COVERS[i % ALL_COVERS.length],
      giftTitle: ALL_GIFT_TITLES[i % ALL_GIFT_TITLES.length],
      giftSubtitle: ALL_GIFT_SUBTITLES[i % ALL_GIFT_SUBTITLES.length],
      progress: { current: (i % 3) + 1, total: (i % 3) + 4 },
      sentDate: ALL_SENT_DATES[i % ALL_SENT_DATES.length]
    }))
  })
  
  // Randomize data only on client side after hydration
  useEffect(() => {
    const shuffled = shuffleArray(ALL_BOX_PAIRS)
    const selected = []
    for (let i = 0; i < 8; i++) {
      selected.push(shuffled[i % shuffled.length])
    }
    setBoxPairs(shuffleArray(selected))
    setMessages(shuffleArray(ALL_MESSAGES).slice(0, 8))
    
    // Generate randomized SentCard data
    const randomized = generateRandomSentCardData({
      covers: ALL_COVERS,
      senders: ALL_SENDERS,
      titles: ALL_TITLES,
      giftTitles: ALL_GIFT_TITLES,
      giftSubtitles: ALL_GIFT_SUBTITLES,
      dates: ALL_SENT_DATES,
      count: 8,
      minDoneCards: 2
    })
    setSentCards(randomized)
  }, [])
  
  // Generate stable card types for mixed view
  const mixedCardTypes = useMemo(() => {
    if (viewType !== 'mixed') return null
    // Use a seeded random function for consistent results
    let seed = mixSeed
    const seededRandom = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }
    return sentCards.map(() => seededRandom() < 0.5)
  }, [viewType, mixSeed, sentCards])
  
  // Map layout number to config keys
  const getLayoutConfigKey = (layoutNum, viewType) => {
    if (viewType === 'single') {
      return `single${layoutNum}`
    } else if (viewType === 'batch') {
      if (layoutNum === '0') return 'default0'
      if (layoutNum === '1') return 'default'
      if (layoutNum === '2') return 'altered1'
      if (layoutNum === '3') return 'altered2'
    }
    return null // mixed view
  }
  
  // Determine if current view is single
  const isSingleView = viewType === 'single'
  
  // Helper function to get SentCard4 props based on layout number
  const getSentCard4Props = useCallback((card, layoutNum, useColoredBackground) => {
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
      // Envelope settings from layout config (for Single 2/3 - controls gift container positioning)
      envelopeScale: layoutConfig.envelope?.scale,
      envelopeOffsetY: layoutConfig.envelope?.offsetY,
    }
  }, [])
  
  // Helper function to get Single 1 specific props (with Box1/Box2 controls)
  const getSingle1Props = useCallback((card, useColoredBackground, layoutNum = '1', animationType = 'highlight', enable3D = false) => {
    // Layout 1 single cards: Switch between Box1 (Style A) and Box2 (Style B)
    // Style A: single1 config (Box1)
    // Style B: single2 config (Box2)
    const singleConfigKey = style === 'A' ? 'single1' : 'single2'
    const layoutConfig = LAYOUT_CONFIG[singleConfigKey] || LAYOUT_CONFIG.single1 // Fallback to single1
    const footerConfig = style === 'A' ? FOOTER_CONFIG.default : FOOTER_CONFIG.single // Style A uses default, Style B uses single
    
    return {
      from: card.from,
      title: card.title,
      boxImage: card.boxImage,
      giftTitle: card.giftTitle,
      giftSubtitle: card.giftSubtitle,
      progress: card.progress,
      sentDate: card.sentDate,
      headerBgOverride: useColoredBackground ? null : "#E3E7ED",
      // Layout config values (for Box 2 - single2)
      hideUnion: layoutConfig.hideUnion,
      confettiWhiteOverlay: layoutConfig.confettiWhiteOverlay,
      envelopeHighZ: layoutConfig.envelopeHighZ,
      overlayProgressOnEnvelope: layoutConfig.overlayProgressOnEnvelope,
      progressOutsideEnvelope: layoutConfig.progressOutsideEnvelope,
      showRedline: layoutConfig.showRedline || false,
      // Header settings
      headerHeight: layoutConfig.header.height,
      headerUseFlex: layoutConfig.header.useFlex,
      // Footer settings
      footerPadEqual: footerConfig.equalPadding,
      footerTopPadding: footerConfig.topPadding,
      footerBottomPadding: footerConfig.bottomPadding,
      showFooterProgress: footerConfig.showProgress,
      showFooterReminder: footerConfig.showReminder,
      hideInfoOnHover: footerConfig.hideInfoOnHover,
      // Hide envelope setting - Style B (Box2) needs hideEnvelope: true, showGiftBoxWhenHidden: true
      // Style A (Box1) uses useBox1, hideEnvelope: false
      hideEnvelope: style === 'B' ? true : (layoutConfig.hideEnvelope || false),
      showGiftBoxWhenHidden: style === 'B' ? true : (layoutConfig.showGiftBoxWhenHidden || false),
      // Box1 exclusive controls (Style A only - Box1)
      // Style B (Box2) doesn't use box1, it uses envelope settings
      useBox1: style === 'A' ? !!layoutConfig.box1 : false,
      box1OffsetY: layoutConfig.box1?.offsetY,
      box1Scale: layoutConfig.box1?.scale,
      box1Width: layoutConfig.box1?.width,
      box1Height: layoutConfig.box1?.height,
      box1Top: layoutConfig.box1?.top,
      box1Left: layoutConfig.box1?.left,
      box1Right: layoutConfig.box1?.right,
      box1Bottom: layoutConfig.box1?.bottom,
      box1TransformOrigin: layoutConfig.box1?.transformOrigin,
      // Envelope settings (for Box 2 - single2)
      envelopeScale: layoutConfig.envelope?.scale,
      envelopeOffsetY: layoutConfig.envelope?.offsetY,
      // Envelope container settings (for Box 2 - single2)
      // Envelope container settings (not used for Box1, but kept for consistency)
      envelopeContainerPadding: layoutConfig.envelopeContainer?.padding || { top: 21, right: 76, bottom: 21, left: 76 },
      envelopeContainerMargin: layoutConfig.envelopeContainer?.margin || { top: 0, right: 0, bottom: 30, left: 0 },
      envelopeBoxOpacity: layoutConfig.envelopeContainer?.boxOpacity,
      envelopeFlapOpacity: layoutConfig.envelopeContainer?.flapOpacity,
      envelopeFlapLuminance: layoutConfig.envelopeContainer?.flapLuminance,
      envelopeFlapSaturation: layoutConfig.envelopeContainer?.flapSaturation,
      envelopeBoxLuminance: layoutConfig.envelopeContainer?.boxLuminance,
      envelopeBoxSaturation: layoutConfig.envelopeContainer?.boxSaturation,
      // Other layout flags
      // Layout 1 style B: Hide progress bar in box/envelope
      hideProgressBarInBox: style === 'B' ? true : (layoutConfig.hideProgressBarInBox || false),
      centerLogoInBox: layoutConfig.centerLogoInBox || false,
      enableConfetti: layoutConfig.enableConfetti || false,
      // Style B (Box2) doesn't use Envelope2, so hidePaper is not relevant
      // Style A (Box1) doesn't use paper
      hidePaper: style === 'B' ? true : true, // Style B (Box2) doesn't use Envelope2, Style A (Box1) doesn't use paper
      // Animation settings
      animationType: animationType,
      enable3D: enable3D || false,
    }
  }, [style, animationType, enable3D])
  
  // Helper function to get SentCard props based on layout number
  const getSentCardProps = useCallback((card, layoutNum, useColoredBackground, animationType, enable3D, useSingleConfig = false) => {
    // Validate layoutNum
    if (!layoutNum || layoutNum === '0') {
      // Layout 0 is merged into Layout 1, so default to '1'
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
      else if (layoutNum === '2') layoutKey = 'altered1'
      else if (layoutNum === '3') layoutKey = 'altered2'
      else {
        // Fallback: if layoutNum is invalid, use 'default' (Layout 1)
        console.warn(`Invalid layoutNum: ${layoutNum}, defaulting to 'default' config`)
        layoutKey = 'default'
      }
    }
    
    if (!layoutKey) {
      console.error(`Layout key is undefined for layoutNum: ${layoutNum}, useSingleConfig: ${useSingleConfig}`)
      return {}
    }
    
    const layoutConfig = LAYOUT_CONFIG[layoutKey]
    if (!layoutConfig) {
      console.error(`Layout config not found for key: ${layoutKey}`)
      return {}
    }
    
    // Layout 1 uses FOOTER_CONFIG.default
    const footerConfig = layoutNum === '1' ? FOOTER_CONFIG.default : (layoutNum === '2' ? FOOTER_CONFIG.altered1 : FOOTER_CONFIG.altered2)
    
    const useAlteredLayout1 = layoutNum === '2'
    const useAlteredLayout2 = layoutNum === '3'
    const useAlteredLayout = layoutNum !== '1'
    
    // ============================================================================
    // LAYOUT-SPECIFIC GUARDS - Always check layoutNum explicitly to prevent cross-layout contamination
    // ============================================================================
    const isLayout1 = !useSingleConfig && layoutNum === '1'
    const isLayout2 = !useSingleConfig && layoutNum === '2'
    const isLayout3 = !useSingleConfig && layoutNum === '3'
    
    // ============================================================================
    // LAYOUT 1: Style switching between Style A and Style B
    // ============================================================================
    // Style A:
    //   - Single card: Box1 (Box1 with PNG image)
    //   - Batch card: Envelope1 (Envelope1 with 8 breathing grid cells)
    // Style B:
    //   - Single card: Box2 (Box2 component)
    //   - Batch card: Envelope2 (Envelope2 with paper component)
    // For Layout 2, 3, and other layouts, use their own config values
    
    // For Layout 1, switch configs based on style (only for batch cards)
    // Single cards are handled in getSingle1Props
    let effectiveLayoutConfig = layoutConfig
    let effectiveEnvelopeContainer = effectiveLayoutConfig.envelopeContainer
    
    if (isLayout1 && !useSingleConfig && style === 'B') {
      // Style B batch: Use Layout 1 Style B's separate config (does NOT affect Layout 2)
      effectiveLayoutConfig = LAYOUT_CONFIG.layout1StyleB
      effectiveEnvelopeContainer = LAYOUT_CONFIG.layout1StyleB.envelopeContainer
    }
    // Style A: Use Layout 1's config (already set as layoutConfig)
    
    // ============================================================================
    // ENVELOPE SETTINGS - Layout-specific overrides
    // ============================================================================
    // Layout 1 batch: Envelope 1 uses Layout 1's default envelope settings (scale: 1, offsetY: 0)
    // Layout 1 single: Box1 uses its own settings
    const effectiveEnvelopeScale = effectiveLayoutConfig?.envelope?.scale || 1
    const effectiveEnvelopeOffsetY = effectiveLayoutConfig?.envelope?.offsetY || 0
    
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
      //   - Style A: useBox1=true, hideEnvelope=false (Box1)
      //   - Style B: hideEnvelope=true, showGiftBoxWhenHidden=true (Box2)
      // Batch cards:
      //   - Style A: hideEnvelope=false (Envelope1)
      //   - Style B: hideEnvelope=true, showGiftBoxWhenHidden=false (Envelope2)
      // For Layout 2, 3, and single configs, use their own config value
      hideEnvelope: isLayout1 
        ? (useSingleConfig ? (style === 'B' ? true : false) : (style === 'B' ? true : false))
        : (layoutConfig.hideEnvelope || false),
      
      // Show gift box when envelope is hidden
      // Style B single: showGiftBoxWhenHidden=true (Box2)
      // Style B batch: showGiftBoxWhenHidden=false (Envelope2)
      // Style A: showGiftBoxWhenHidden=false (Box1/Envelope1 don't use this)
      showGiftBoxWhenHidden: isLayout1
        ? (useSingleConfig ? (style === 'B' ? true : false) : (style === 'B' ? false : false))
        : (effectiveLayoutConfig.showGiftBoxWhenHidden || false),
      
      // ============================================================================
      // LAYOUT 1 SPECIFIC: hideProgressBarInBox
      // ============================================================================
      // Box progress bar setting (false for Layout 1 batch - Envelope 1, otherwise use config)
      // Layout 1 style B: Hide progress bar in box/envelope
      hideProgressBarInBox: (isLayout1 && style === 'B') ? true : (effectiveLayoutConfig.hideProgressBarInBox || false),
      
      // Box logo centering setting
      centerLogoInBox: effectiveLayoutConfig.centerLogoInBox || false,
      // Box settings (Layout 0 specific)
      boxWidth: effectiveLayoutConfig.box?.width,
      boxHeight: effectiveLayoutConfig.box?.height,
      boxBorderRadius: effectiveLayoutConfig.box?.borderRadius,
      boxScale: effectiveLayoutConfig.box?.scale,
      
      // ============================================================================
      // LAYOUT 1 SPECIFIC: enableConfetti
      // ============================================================================
      // Confetti and redline settings (false for Layout 1 batch - Envelope 1, otherwise use config)
      enableConfetti: effectiveLayoutConfig.enableConfetti || false,
      showRedline: effectiveLayoutConfig.showRedline || false,
      
      // Envelope settings (overridden for box style in Layout 1 only)
      envelopeScale: effectiveEnvelopeScale,
      envelopeOffsetY: effectiveEnvelopeOffsetY,
      // ============================================================================
      // ENVELOPE CONTAINER SETTINGS
      // ============================================================================
      // Style B batch: Uses Layout 2's envelopeContainer (has paper - padding.top: 46.5)
      // Style A batch: Uses Layout 1's default envelopeContainer (no paper - padding.top: 21)
      // Layout 2, 3: Use their own envelopeContainer settings
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
      useBox1: false, // Batch cards don't use Box1, they use Envelope1 (Style A) or Envelope2 (Style B)
      // Header settings (for all layouts) - Use effective layout config
      headerHeight: effectiveLayoutConfig.header.height,
      headerUseFlex: effectiveLayoutConfig.header.useFlex,
      // Altered Layout 1 specific header settings
      headerHeight1: useAlteredLayout1 ? layoutConfig.header.height : undefined,
      headerUseFlex1: useAlteredLayout1 ? layoutConfig.header.useFlex : undefined,
      // Altered Layout 2 specific envelope controls
      envelopeScale2: useAlteredLayout2 ? layoutConfig.envelope.scale : undefined,
      envelopeOffsetY2: useAlteredLayout2 ? layoutConfig.envelope.offsetY : undefined,
      envelopeLeft2: useAlteredLayout2 ? layoutConfig.envelope.left : undefined,
      envelopeRight2: useAlteredLayout2 ? layoutConfig.envelope.right : undefined,
      envelopeTopBase2: useAlteredLayout2 ? layoutConfig.envelope.top : undefined,
      headerHeight2: useAlteredLayout2 ? layoutConfig.header.height : undefined,
      headerUseFlex2: useAlteredLayout2 ? layoutConfig.header.useFlex : undefined,
      transformOrigin2: useAlteredLayout2 ? layoutConfig.envelope.transformOrigin : undefined,
      // Footer settings - ALWAYS use Layout 1's footer config
      footerPadEqual: footerConfig.equalPadding,
      footerTopPadding: footerConfig.topPadding,
      footerBottomPadding: footerConfig.bottomPadding,
      footerTransparent: footerConfig.transparent,
      showFooterProgress: footerConfig.showProgress,
      showFooterReminder: footerConfig.showReminder,
      hideInfoOnHover: footerConfig.hideInfoOnHover,
      // Altered Layout 2 specific footer controls
      footerTopPadding2: useAlteredLayout2 ? FOOTER_CONFIG.altered2.topPadding : undefined,
      footerBottomPadding2: useAlteredLayout2 ? FOOTER_CONFIG.altered2.bottomPadding : undefined,
      footerPadEqual2: useAlteredLayout2 ? FOOTER_CONFIG.altered2.equalPadding : undefined,
      footerTransparent2: useAlteredLayout2 ? FOOTER_CONFIG.altered2.transparent : undefined,
      progressBottomPadding2: useAlteredLayout2 ? FOOTER_CONFIG.altered2.progressOutside.bottomPadding : undefined,
      animationType: animationType,
      enable3D: enable3D || false,
    }
  }, [style, animationType, enable3D])
  
  const handleOpenGift = useCallback((cardId) => {
    setCardStates(prev => ({
      ...prev,
      [cardId]: 'opening'
    }))
  }, [])
  
  // Memoize handlers for each card to prevent unnecessary re-renders
  const cardHandlers = useMemo(() => ({
    card1: () => handleOpenGift('card1'),
    card2: () => handleOpenGift('card2'),
    card3: () => handleOpenGift('card3'),
    card4: () => handleOpenGift('card4'),
    card5: () => handleOpenGift('card5'),
    card6: () => handleOpenGift('card6'),
    card7: () => handleOpenGift('card7'),
    card8: () => handleOpenGift('card8'),
  }), [handleOpenGift])
  
  // Memoize tab button handlers
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab)
  }, [])
  
  // Shuffle cards function
  const handleShuffle = useCallback(() => {
    // Shuffle Gift Received cards
    const shuffledBoxPairs = shuffleArray(ALL_BOX_PAIRS)
    const selected = []
    for (let i = 0; i < 8; i++) {
      selected.push(shuffledBoxPairs[i % shuffledBoxPairs.length])
    }
    setBoxPairs(shuffleArray(selected))
    setMessages(shuffleArray(ALL_MESSAGES).slice(0, 8))
    
    // Shuffle Gift Sent cards
    const randomized = generateRandomSentCardData({
      covers: ALL_COVERS,
      senders: ALL_SENDERS,
      titles: ALL_TITLES,
      giftTitles: ALL_GIFT_TITLES,
      giftSubtitles: ALL_GIFT_SUBTITLES,
      dates: ALL_SENT_DATES,
      count: 8,
      minDoneCards: 2
    })
    setSentCards(randomized)
    
    // Update mix seed to reshuffle mixed view
    if (viewType === 'mixed') {
      setMixSeed(Date.now())
    }
  }, [viewType])
  
  return (
    <div className="min-h-screen bg-[#f0f1f5] flex items-start overflow-visible">
      <div 
        className="w-full px-0 md:px-[240px] pt-5 md:pt-10 pb-10"
      >
        {/* Tabs and Controls Row */}
        <ControlBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onShuffle={handleShuffle}
          isSentTab={activeTab === 'sent'}
          useColoredBackground={useColoredBackground}
          onThemingChange={setUseColoredBackground}
          animationType={animationType}
          onAnimationTypeChange={setAnimationType}
          enable3D={enable3D}
          onEnable3DChange={setEnable3D}
          layoutNumber={layoutNumber}
          onLayoutChange={(e) => setLayoutNumber(e.target.value)}
          viewType={viewType}
          onViewChange={(value) => {
            setViewType(value)
            if (value === 'mixed') {
              setMixSeed(Date.now())
            }
          }}
          isSingleView={isSingleView}
          showSettingsMenu={showSettingsMenu}
          onSettingsMenuToggle={setShowSettingsMenu}
          style={style}
          onStyleChange={setStyle}
        />
        {/* Content */}
        <CardGrid
          key={`card-grid-${layoutNumber}-${style}`}
          activeTab={activeTab}
          cardStates={cardStates}
          messages={messages}
          boxPairs={boxPairs}
          cardHandlers={cardHandlers}
          viewType={viewType}
          layoutNumber={layoutNumber}
          useColoredBackground={layoutNumber === '1' ? useColoredBackground : false}
          animationType={animationType}
          enable3D={enable3D}
          sentCards={sentCards}
          mixedCardTypes={mixedCardTypes}
          getSentCardProps={getSentCardProps}
          getSingle1Props={getSingle1Props}
          getSentCard4Props={getSentCard4Props}
        />
      </div>
    </div>
  )
}

