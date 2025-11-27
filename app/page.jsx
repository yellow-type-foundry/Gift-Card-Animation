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
  const [layoutNumber, setLayoutNumber] = useState('0') // '0' | '1' | '2' | '3' - which layout pair to use
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
    }
  }, [])
  
  // Helper function to get Single 1 specific props (with gift container controls)
  const getSingle1Props = useCallback((card, useColoredBackground, layoutNum = '1') => {
    // Map layout number to single config key
    const singleConfigKey = `single${layoutNum}`
    const layoutConfig = LAYOUT_CONFIG[singleConfigKey] || LAYOUT_CONFIG.single1 // Fallback to single1
    const footerConfig = (layoutNum === '0' || layoutNum === '1') ? (layoutNum === '0' ? FOOTER_CONFIG.default0 : FOOTER_CONFIG.default) : FOOTER_CONFIG.single // Single 0/1 uses default footer config (same as Batch 0/1)
    
    return {
      from: card.from,
      title: card.title,
      boxImage: card.boxImage,
      giftTitle: card.giftTitle,
      giftSubtitle: card.giftSubtitle,
      progress: card.progress,
      sentDate: card.sentDate,
      headerBgOverride: useColoredBackground ? null : "#E3E7ED",
      // Layout config values
      hideUnion: layoutConfig.hideUnion,
      confettiWhiteOverlay: layoutConfig.confettiWhiteOverlay,
      envelopeHighZ: layoutConfig.envelopeHighZ,
      overlayProgressOnEnvelope: layoutConfig.overlayProgressOnEnvelope,
      progressOutsideEnvelope: layoutConfig.progressOutsideEnvelope,
      // Header settings
      headerHeight: layoutConfig.header.height,
      headerUseFlex: layoutConfig.header.useFlex,
      // Footer settings
      footerPadEqual: footerConfig.equalPadding,
      footerTopPadding: footerConfig.topPadding,
      footerBottomPadding: footerConfig.bottomPadding,
      showFooterProgress: footerConfig.showProgress,
      showFooterReminder: footerConfig.showReminder,
      // Gift container exclusive controls (Single 1 only)
      useGiftContainer: true,
      giftContainerOffsetY: layoutConfig.giftContainer.offsetY,
      giftContainerScale: layoutConfig.giftContainer.scale,
      giftContainerWidth: layoutConfig.giftContainer.width,
      giftContainerHeight: layoutConfig.giftContainer.height,
      giftContainerTop: layoutConfig.giftContainer.top,
      giftContainerLeft: layoutConfig.giftContainer.left,
      giftContainerRight: layoutConfig.giftContainer.right,
      giftContainerBottom: layoutConfig.giftContainer.bottom,
      giftContainerTransformOrigin: layoutConfig.giftContainer.transformOrigin,
    }
  }, [])
  
  // Helper function to get SentCard1 props based on layout number
  const getSentCard1Props = useCallback((card, layoutNum, useColoredBackground, animationType, enable3D, useSingleConfig = false) => {
    // Map layout number to config key
    let layoutKey
    if (useSingleConfig) {
      // For single views, use single config
      layoutKey = `single${layoutNum}`
    } else {
      // For batch views, use batch config
      if (layoutNum === '0') layoutKey = 'default0'
      else if (layoutNum === '1') layoutKey = 'default'
      else if (layoutNum === '2') layoutKey = 'altered1'
      else if (layoutNum === '3') layoutKey = 'altered2'
    }
    
    const layoutConfig = LAYOUT_CONFIG[layoutKey]
    const footerConfig = layoutNum === '0' ? FOOTER_CONFIG.default0 : (layoutNum === '1' ? FOOTER_CONFIG.default : (layoutNum === '2' ? FOOTER_CONFIG.altered1 : FOOTER_CONFIG.altered2))
    
    const useAlteredLayout1 = layoutNum === '2'
    const useAlteredLayout2 = layoutNum === '3'
    const useAlteredLayout = layoutNum !== '0' && layoutNum !== '1'
    
    return {
      from: card.from,
      title: card.title,
      boxImage: card.boxImage,
      giftTitle: card.giftTitle,
      giftSubtitle: card.giftSubtitle,
      progress: card.progress,
      sentDate: card.sentDate,
      headerBgOverride: useColoredBackground ? null : "#E3E7ED",
      // Layout config values
      hideUnion: layoutConfig.hideUnion,
      confettiWhiteOverlay: layoutConfig.confettiWhiteOverlay,
      envelopeHighZ: layoutConfig.envelopeHighZ,
      overlayProgressOnEnvelope: layoutConfig.overlayProgressOnEnvelope,
      progressOutsideEnvelope: layoutConfig.progressOutsideEnvelope,
      hideEnvelope: layoutConfig.hideEnvelope || false,
      // Show gift box when envelope is hidden (only for Single 0 / Layout 0, not Batch 2)
      // Batch 2 uses hideEnvelope=true but should show EnvelopeBoxContainer, not GiftBoxContainer
      showGiftBoxWhenHidden: layoutConfig.showGiftBoxWhenHidden || false,
      // Box progress bar setting
      hideProgressBarInBox: layoutConfig.hideProgressBarInBox || false,
      // Box logo centering setting
      centerLogoInBox: layoutConfig.centerLogoInBox || false,
      // Box settings (Layout 0 specific)
      boxWidth: layoutConfig.box?.width,
      boxHeight: layoutConfig.box?.height,
      boxBorderRadius: layoutConfig.box?.borderRadius,
      boxScale: layoutConfig.box?.scale,
      // Confetti and redline settings
      enableConfetti: layoutConfig.enableConfetti || false,
      showRedline: layoutConfig.showRedline || false,
      // Envelope settings
      envelopeScale: layoutConfig.envelope.scale,
      envelopeOffsetY: layoutConfig.envelope.offsetY,
      // Envelope container settings (for Batch 0 and Batch 2 - EnvelopeBoxContainer)
      envelopeContainerPadding: layoutConfig.envelopeContainer?.padding,
      envelopeContainerMargin: layoutConfig.envelopeContainer?.margin,
      envelopeBoxOpacity: layoutConfig.envelopeContainer?.boxOpacity,
      envelopeFlapOpacity: layoutConfig.envelopeContainer?.flapOpacity,
      envelopeFlapLuminance: layoutConfig.envelopeContainer?.flapLuminance,
      envelopeFlapSaturation: layoutConfig.envelopeContainer?.flapSaturation,
      envelopeBoxLuminance: layoutConfig.envelopeContainer?.boxLuminance,
      envelopeBoxSaturation: layoutConfig.envelopeContainer?.boxSaturation,
      // Header settings (for all layouts)
      headerHeight: layoutConfig.header.height,
      headerUseFlex: layoutConfig.header.useFlex,
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
      // Footer settings
      footerPadEqual: footerConfig.equalPadding,
      footerTopPadding: footerConfig.topPadding,
      footerBottomPadding: footerConfig.bottomPadding,
      footerTransparent: footerConfig.transparent,
      showFooterProgress: footerConfig.showProgress,
      showFooterReminder: footerConfig.showReminder,
      // Altered Layout 2 specific footer controls
      footerTopPadding2: useAlteredLayout2 ? FOOTER_CONFIG.altered2.topPadding : undefined,
      footerBottomPadding2: useAlteredLayout2 ? FOOTER_CONFIG.altered2.bottomPadding : undefined,
      footerPadEqual2: useAlteredLayout2 ? FOOTER_CONFIG.altered2.equalPadding : undefined,
      footerTransparent2: useAlteredLayout2 ? FOOTER_CONFIG.altered2.transparent : undefined,
      progressBottomPadding2: useAlteredLayout2 ? FOOTER_CONFIG.altered2.progressOutside.bottomPadding : undefined,
      animationType: animationType,
      enable3D: enable3D || false,
    }
  }, [animationType, enable3D])
  
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
        />
        {/* Content */}
        <CardGrid
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
          getSentCard1Props={getSentCard1Props}
          getSingle1Props={getSingle1Props}
          getSentCard4Props={getSentCard4Props}
        />
      </div>
    </div>
  )
}

