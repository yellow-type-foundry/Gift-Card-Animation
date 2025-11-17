'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import GiftCard from '@/components/GiftCard'
import SentCard1 from '@/components/SentCard1'
import SentCard4 from '@/components/SentCard4'
import TabButton from '@/components/TabButton'
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
  '1 day ago', '2 days ago', '3 days ago', '4 days ago', '5 days ago',
  '1 week ago', '2 weeks ago', '3 weeks ago', '1 month ago'
]


export default function Home() {
  const [activeTab, setActiveTab] = useState('gift') // 'gift' | 'sent'
  const [useColoredBackground, setUseColoredBackground] = useState(false) // Toggle for theming
  const [layoutNumber, setLayoutNumber] = useState('1') // '1' | '2' | '3' - which layout pair to use
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
      if (layoutNum === '1') return 'default'
      if (layoutNum === '2') return 'altered1'
      if (layoutNum === '3') return 'altered2'
    }
    return null // mixed view
  }
  
  // Determine if current view is single
  const isSingleView = viewType === 'single'
  
  // Helper function to get SentCard1 props based on layout number
  const getSentCard1Props = useCallback((card, layoutNum, useColoredBackground) => {
    // Map layout number to config key
    let layoutKey
    if (layoutNum === '1') layoutKey = 'default'
    else if (layoutNum === '2') layoutKey = 'altered1'
    else if (layoutNum === '3') layoutKey = 'altered2'
    
    const layoutConfig = LAYOUT_CONFIG[layoutKey]
    const footerConfig = layoutNum === '1' ? FOOTER_CONFIG.default : (layoutNum === '2' ? FOOTER_CONFIG.altered1 : FOOTER_CONFIG.altered2)
    
    const useAlteredLayout1 = layoutNum === '2'
    const useAlteredLayout2 = layoutNum === '3'
    const useAlteredLayout = layoutNum !== '1'
    
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
      // Envelope settings
      envelopeScale: layoutConfig.envelope.scale,
      envelopeOffsetY: layoutConfig.envelope.offsetY,
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
    }
  }, [])
  
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
  
  // Memoize individual tab handlers
  const handleGiftTab = useCallback(() => handleTabChange('gift'), [handleTabChange])
  const handleSentTab = useCallback(() => handleTabChange('sent'), [handleTabChange])
  
  return (
    <div className="min-h-screen bg-[#f0f1f5] flex items-start overflow-visible">
      <div 
        className="w-full px-0 md:px-[240px] py-10"
      >
        {/* Tabs and Controls Row */}
        <div
          className="w-full flex items-center justify-between gap-4 mb-6 overflow-x-auto md:overflow-visible whitespace-nowrap px-5 md:px-0"
          style={{ 
            WebkitOverflowScrolling: 'touch', 
            height: '40px',
            maxWidth: '1272px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}
        >
          {/* Tabs - Left side */}
          <div className="flex items-center gap-2 shrink-0">
            <TabButton
              label="Gift Received"
              isActive={activeTab === 'gift'}
              onClick={handleGiftTab}
            />
            <TabButton
              label="Gift Sent"
              isActive={activeTab === 'sent'}
              onClick={handleSentTab}
            />
          </div>
          
          {/* Controls - Right side (only show when on Gift Sent tab) */}
          {activeTab === 'sent' && (
            <>
              {/* Desktop: Theming and Layout controls - Hidden on mobile */}
              <div className="hidden md:flex items-center gap-6 shrink-0">
                {/* Theming toggle */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#525F7A]">Theming</span>
                  <button
                    onClick={() => !isSingleView && setUseColoredBackground(!useColoredBackground)}
                    disabled={isSingleView}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5a3dff] focus:ring-offset-2 ${
                      useColoredBackground ? 'bg-[#5a3dff]' : 'bg-gray-300'
                    } ${isSingleView ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
                    role="switch"
                    aria-checked={useColoredBackground}
                    aria-disabled={isSingleView}
                    aria-label="Toggle theming"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        useColoredBackground ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                {/* Layout dropdown */}
                <div className="flex items-center gap-3">
                  <label htmlFor="layout-select" className="text-sm text-[#525F7A]">Layout</label>
                  <div className="relative inline-block">
                    <select
                      id="layout-select"
                      value={layoutNumber}
                      onChange={(e) => setLayoutNumber(e.target.value)}
                      className="py-2 pl-3 pr-8 rounded-[12px] border border-[#dde2e9] bg-white text-sm text-[#525F7A] focus:outline-none focus:ring-2 focus:ring-[#5a3dff] focus:ring-offset-0 appearance-none cursor-pointer"
                      style={{ width: 'auto', minWidth: '80px' }}
                    >
                      <option value="1">Layout 1</option>
                      <option value="2">Layout 2</option>
                      <option value="3">Layout 3</option>
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 4.5L6 7.5L9 4.5" stroke="#525F7A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
                {/* View selector */}
                <div className="flex items-center gap-3">
                  <label htmlFor="view-select" className="text-sm text-[#525F7A]">View</label>
                  <div className="relative inline-block">
                    <select
                      id="view-select"
                      value={viewType}
                      onChange={(e) => {
                        setViewType(e.target.value)
                        if (e.target.value === 'mixed') {
                          setMixSeed(Date.now()) // Generate new seed when enabling mixed view
                        }
                      }}
                      className="py-2 pl-3 pr-8 rounded-[12px] border border-[#dde2e9] bg-white text-sm text-[#525F7A] focus:outline-none focus:ring-2 focus:ring-[#5a3dff] focus:ring-offset-0 appearance-none cursor-pointer"
                      style={{ width: 'auto', minWidth: '100px' }}
                    >
                      <option value="mixed">Mixed</option>
                      <option value="batch">Batch</option>
                      <option value="single">Single</option>
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 4.5L6 7.5L9 4.5" stroke="#525F7A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Mobile: Settings/Filter button - Visible only on mobile */}
              <div className="md:hidden relative shrink-0">
                <button
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  className="px-3 py-1.5 rounded-[12px] border border-[#dde2e9] bg-white text-sm text-[#525F7A] hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5a3dff] focus:ring-offset-2 flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13.5 8C13.5 7.5 13.5 7.5 13 7.5C12.5 7.5 12.5 7.5 12.5 8C12.5 8.5 12.5 8.5 13 8.5C13.5 8.5 13.5 8.5 13.5 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3.5 8C3.5 7.5 3.5 7.5 3 7.5C2.5 7.5 2.5 7.5 2.5 8C2.5 8.5 2.5 8.5 3 8.5C3.5 8.5 3.5 8.5 3.5 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 3.5C8 3 8 3 7.5 3C7 3 7 3 7 3.5C7 4 7 4 7.5 4C8 4 8 4 8 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 12.5C8 12 8 12 7.5 12C7 12 7 12 7 12.5C7 13 7 13 7.5 13C8 13 8 13 8 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Settings
                </button>
                
                {/* Mobile Settings Menu Dropdown */}
                {showSettingsMenu && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-40 bg-black/20"
                      onClick={() => setShowSettingsMenu(false)}
                    />
                    {/* Menu */}
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-[12px] border border-[#dde2e9] shadow-lg z-50 p-4">
                      <div className="space-y-4">
                        {/* Theming toggle */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#525F7A]">Theming</span>
                          <button
                            onClick={() => !isSingleView && setUseColoredBackground(!useColoredBackground)}
                            disabled={isSingleView}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5a3dff] focus:ring-offset-2 ${
                              useColoredBackground ? 'bg-[#5a3dff]' : 'bg-gray-300'
                            } ${isSingleView ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
                            role="switch"
                            aria-checked={useColoredBackground}
                            aria-disabled={isSingleView}
                            aria-label="Toggle theming"
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                useColoredBackground ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                        {/* Layout dropdown */}
                        <div className="flex items-center justify-between">
                          <label htmlFor="layout-select-mobile" className="text-sm text-[#525F7A]">Layout</label>
                          <div className="relative inline-block">
                            <select
                              id="layout-select-mobile"
                              value={layoutNumber}
                              onChange={(e) => setLayoutNumber(e.target.value)}
                              className="py-2 pl-3 pr-8 rounded-[12px] border border-[#dde2e9] bg-white text-sm text-[#525F7A] focus:outline-none focus:ring-2 focus:ring-[#5a3dff] focus:ring-offset-0 appearance-none cursor-pointer"
                              style={{ width: 'auto', minWidth: '80px' }}
                            >
                              <option value="1">Layout 1</option>
                              <option value="2">Layout 2</option>
                              <option value="3">Layout 3</option>
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 4.5L6 7.5L9 4.5" stroke="#525F7A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                        {/* View selector */}
                        <div className="flex items-center justify-between">
                          <label htmlFor="view-select-mobile" className="text-sm text-[#525F7A]">View</label>
                          <div className="relative inline-block">
                            <select
                              id="view-select-mobile"
                              value={viewType}
                              onChange={(e) => {
                                setViewType(e.target.value)
                                if (e.target.value === 'mixed') {
                                  setMixSeed(Date.now()) // Generate new seed when enabling mixed view
                                }
                              }}
                              className="py-2 pl-3 pr-8 rounded-[12px] border border-[#dde2e9] bg-white text-sm text-[#525F7A] focus:outline-none focus:ring-2 focus:ring-[#5a3dff] focus:ring-offset-0 appearance-none cursor-pointer"
                              style={{ width: 'auto', minWidth: '100px' }}
                            >
                              <option value="mixed">Mixed</option>
                              <option value="batch">Batch</option>
                              <option value="single">Single</option>
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 4.5L6 7.5L9 4.5" stroke="#525F7A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
        {/* Content */}
        {activeTab === 'gift' ? (
          <div className="grid gift-card-grid gap-[24px]">
            {/* Card 1 - Original */}
            <GiftCard
              state={cardStates.card1}
              from="Lisa Tran"
              message={messages[0]}
              expiryText={cardStates.card1 === 'unopened' ? 'Expiring in 21 days' : undefined}
              giftTitle="24 Pack of Cookies"
              giftSubtitle="Levain Cookies"
              boxImage={boxPairs[0].box1}
              box2Image={boxPairs[0].box2}
              onOpenGift={cardHandlers.card1}
            />
            {/* Card 2 */}
            <GiftCard state={cardStates.card2} from="Michael Chen" message={messages[1]} expiryText={cardStates.card2 === 'unopened' ? 'Expiring in 18 days' : undefined} giftTitle="Coffee Gift Set" giftSubtitle="Blue Bottle Coffee" boxImage={boxPairs[1].box1} box2Image={boxPairs[1].box2} onOpenGift={cardHandlers.card2} />
            {/* Card 3 */}
            <GiftCard state={cardStates.card3} from="Sarah Johnson" message={messages[2]} expiryText={cardStates.card3 === 'unopened' ? 'Expiring in 15 days' : undefined} giftTitle="Chocolate Box Collection" giftSubtitle="Godiva Chocolates" boxImage={boxPairs[2].box1} box2Image={boxPairs[2].box2} onOpenGift={cardHandlers.card3} />
            {/* Card 4 */}
            <GiftCard state={cardStates.card4} from="David Kim" message={messages[3]} expiryText={cardStates.card4 === 'unopened' ? 'Expiring in 30 days' : undefined} giftTitle="Gourmet Tea Selection" giftSubtitle="TWG Tea" boxImage={boxPairs[3].box1} box2Image={boxPairs[3].box2} onOpenGift={cardHandlers.card4} />
            {/* Card 5 */}
            <GiftCard state={cardStates.card5} from="Emily Rodriguez" message={messages[4]} expiryText={cardStates.card5 === 'unopened' ? 'Expiring in 12 days' : undefined} giftTitle="Artisan Cheese Board" giftSubtitle="Murray's Cheese" boxImage={boxPairs[4].box1} box2Image={boxPairs[4].box2} onOpenGift={cardHandlers.card5} />
            {/* Card 6 */}
            <GiftCard state={cardStates.card6} from="James Wilson" message={messages[5]} expiryText={cardStates.card6 === 'unopened' ? 'Expiring in 25 days' : undefined} giftTitle="Wine Collection" giftSubtitle="Napa Valley Wines" boxImage={boxPairs[5].box1} box2Image={boxPairs[5].box2} onOpenGift={cardHandlers.card6} />
            {/* Card 7 */}
            <GiftCard state={cardStates.card7} from="Olivia Martinez" message={messages[6]} expiryText={cardStates.card7 === 'unopened' ? 'Expiring in 7 days' : undefined} giftTitle="Spa Gift Certificate" giftSubtitle="Bliss Spa" boxImage={boxPairs[6].box1} box2Image={boxPairs[6].box2} onOpenGift={cardHandlers.card7} />
            {/* Card 8 */}
            <GiftCard state={cardStates.card8} from="Ryan Thompson" message={messages[7]} expiryText={cardStates.card8 === 'unopened' ? 'Expiring in 19 days' : undefined} giftTitle="Gourmet Chocolate Truffles" giftSubtitle="Vosges Haut-Chocolat" boxImage={boxPairs[7].box1} box2Image={boxPairs[7].box2} onOpenGift={cardHandlers.card8} />
          </div>
        ) : activeTab === 'sent' ? (
          <div>
            <div className="grid gift-card-grid gap-[24px]">
              {viewType === 'mixed' && mixedCardTypes ? (
                // Mixed view: show both batch and single cards
                sentCards.map((card, index) => {
                  const isBatch = mixedCardTypes[index]
                  
                  if (isBatch) {
                    return (
                      <SentCard1
                        key={index}
                        {...getSentCard1Props(card, layoutNumber, useColoredBackground)}
                      />
                    )
                  } else {
                    return (
                      <SentCard4
                        key={index}
                        from={card.from}
                        title={card.title}
                        boxImage={card.boxImage}
                        giftTitle={card.giftTitle}
                        giftSubtitle={card.giftSubtitle}
                        progress={card.progress}
                        sentDate={card.sentDate}
                      />
                    )
                  }
                })
              ) : viewType === 'single' ? (
                // Single view: show only single cards
                sentCards.map((card, index) => (
                  <SentCard4
                    key={index}
                    from={card.from}
                    title={card.title}
                    boxImage={card.boxImage}
                    giftTitle={card.giftTitle}
                    giftSubtitle={card.giftSubtitle}
                    progress={card.progress}
                    sentDate={card.sentDate}
                  />
                ))
              ) : (
                // Batch view: show only batch cards
                sentCards.map((card, index) => (
                  <SentCard1
                    key={index}
                    {...getSentCard1Props(card, layoutNumber, useColoredBackground)}
                  />
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

