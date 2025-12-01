'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import ControlBar from '@/components/ControlBar'
import StylingBar from '@/components/StylingBar'
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
  const [layoutNumber, setLayoutNumber] = useState('1') // '1' | '2' - which layout to use
  const [style, setStyle] = useState('1') // '1' | '2' | '3' - for Layout 1 only: Style 1 = Box1/Envelope1, Style 2 = Box2/Envelope2, Style 3 = Box3/Envelope3
  const [viewType, setViewType] = useState('mixed') // 'mixed' | 'batch' | 'single' - what to display
  const [mixSeed, setMixSeed] = useState(0) // Seed to regenerate mix when toggled
  const [showSettingsMenu, setShowSettingsMenu] = useState(false) // Mobile settings menu visibility
  const [layout2BoxType, setLayout2BoxType] = useState('2') // '1' | '2' | '3' - for Layout 2 single card: Box1, Box2, or Box3
  
  // Sync style values when switching layouts
  const handleLayoutChange = useCallback((e) => {
    const newLayout = e.target.value
    const previousLayout = layoutNumber
    
    // When switching layouts, preserve the style value
    if (previousLayout !== newLayout) {
      if (previousLayout === '1' && newLayout === '2') {
        // Switching from Layout 1 to Layout 2: copy style to layout2BoxType
        setLayout2BoxType(style)
      } else if (previousLayout === '2' && newLayout === '1') {
        // Switching from Layout 2 to Layout 1: copy layout2BoxType to style
        setStyle(layout2BoxType)
      }
    }
    
    setLayoutNumber(newLayout)
  }, [layoutNumber, style, layout2BoxType])
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
      if (layoutNum === '1') return 'default'
      if (layoutNum === '2') return 'layout2'
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
      // Envelope settings from layout config (for Single 2 - controls gift container positioning)
      envelopeScale: layoutConfig.envelope?.scale,
      envelopeOffsetY: layoutConfig.envelope?.offsetY,
    }
  }, [])
  
  // Helper function to get Single 1 specific props (with Box1/Box2 controls)
  const getSingle1Props = useCallback((card, useColoredBackground, layoutNum = '1', animationType = 'highlight', enable3D = false) => {
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
  }, [style, animationType, enable3D])
  
  // Helper function to get SentCard props based on layout number
  const getSentCardProps = useCallback((card, layoutNum, useColoredBackground, animationType, enable3D, useSingleConfig = false) => {
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
    
  }, [viewType, layoutNumber])
  
  return (
    <div className="min-h-screen bg-[#f0f1f5] flex flex-col items-start overflow-visible">
      <div 
        className="w-full max-w-[1440px] mx-auto px-0 md:px-[80px] lg:px-[240px] pt-5 md:pt-10 pb-10 flex-1"
      >
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
            layout2BoxType={layout2BoxType}
          />
      </div>
      {/* StylingBar at bottom */}
      <div className="w-full max-w-[1440px] mx-auto px-0 md:px-[80px] lg:px-[240px] pb-4">
        <StylingBar
          isSentTab={activeTab === 'sent'}
          useColoredBackground={useColoredBackground}
          onThemingChange={setUseColoredBackground}
          animationType={animationType}
          onAnimationTypeChange={setAnimationType}
          enable3D={enable3D}
          onEnable3DChange={setEnable3D}
          layoutNumber={layoutNumber}
          viewType={viewType}
          onViewChange={(value) => {
            setViewType(value)
            if (value === 'mixed') {
              setMixSeed(Date.now())
            }
          }}
          isSingleView={isSingleView}
          style={style}
          layout2BoxType={layout2BoxType}
        />
      </div>
      {/* ControlBar at bottom */}
      <div className="w-full max-w-[1440px] mx-auto px-0 md:px-[80px] lg:px-[240px] pb-6">
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
          onLayoutChange={handleLayoutChange}
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
          layout2BoxType={layout2BoxType}
          onLayout2BoxTypeChange={setLayout2BoxType}
        />
      </div>
    </div>
  )
}

