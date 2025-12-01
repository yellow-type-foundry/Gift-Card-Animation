'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import ControlBar from '@/components/ControlBar'
import CardGrid from '@/components/CardGrid'
import { shuffleArray, generateRandomSentCardData } from '@/utils/cardData'
import {
  ALL_BOX_PAIRS,
  ALL_MESSAGES,
  ALL_COVERS,
  ALL_SENDERS,
  ALL_TITLES,
  ALL_GIFT_TITLES,
  ALL_GIFT_SUBTITLES,
  ALL_SENT_DATES
} from '@/constants/pageConstants'
import {
  getSentCard4Props as getSentCard4PropsHelper,
  getSingle1Props as getSingle1PropsHelper,
  getSentCardProps as getSentCardPropsHelper
} from '@/utils/cardPropsHelpers'


export default function Home() {
  const [activeTab, setActiveTab] = useState('gift') // 'gift' | 'sent'
  const [useColoredBackground, setUseColoredBackground] = useState(false) // Toggle for theming
  const [animationType, setAnimationType] = useState('highlight') // Animation type: 'highlight', 'breathing', or 'none'
  const [showAnimationMenu, setShowAnimationMenu] = useState(false)
  const [showViewMenu, setShowViewMenu] = useState(false)
  const [enable3D, setEnable3D] = useState(false) // Standalone 3D toggle that works with highlight or breathing
  const [layoutNumber, setLayoutNumber] = useState('1') // '1' | '2' - which layout to use
  const [style, setStyle] = useState('1') // '1' | '2' | '3' - for Layout 1 only: Style 1 = Box1/Envelope1, Style 2 = Box2/Envelope2, Style 3 = Box3/Envelope3
  const [viewType, setViewType] = useState('mixed') // 'mixed' | 'batch' | 'single' - what to display
  const [mixSeed, setMixSeed] = useState(0) // Seed to regenerate mix when toggled
  const [showSettingsMenu, setShowSettingsMenu] = useState(false) // Mobile settings menu visibility
  const [isShuffling, setIsShuffling] = useState(false) // Track shuffle animation
  const [layout2BoxType, setLayout2BoxType] = useState('2') // '1' | '2' | '3' - for Layout 2 single card: Box1, Box2, or Box3

  // Close animation menu when button becomes disabled
  useEffect(() => {
    if (!((activeTab === 'sent' && ((layoutNumber === '1' && style === '2') || (layoutNumber === '2' && layout2BoxType === '2'))))) {
      setShowAnimationMenu(false)
    }
  }, [activeTab, layoutNumber, style, layout2BoxType])

  // Close animation menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAnimationMenu) {
        const menuElement = document.querySelector('[data-animation-menu]')
        const buttonElement = document.querySelector('[data-animation-button]')
        if (menuElement && !menuElement.contains(event.target) && buttonElement && !buttonElement.contains(event.target)) {
          setShowAnimationMenu(false)
        }
      }
    }

    if (showAnimationMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showAnimationMenu])

  // Close view menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showViewMenu) {
        const menuElement = document.querySelector('[data-view-menu]')
        const buttonElement = document.querySelector('[data-view-button]')
        if (menuElement && !menuElement.contains(event.target) && buttonElement && !buttonElement.contains(event.target)) {
          setShowViewMenu(false)
        }
      }
    }

    if (showViewMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showViewMenu])

  // Close view menu when button becomes disabled
  useEffect(() => {
    if (activeTab !== 'sent') {
      setShowViewMenu(false)
    }
  }, [activeTab])
  
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
    card6: 'unopened'
  })
  
  // Randomize box assignments on client-side only to avoid hydration mismatch
  // Start with default values to ensure server/client match, then randomize in useEffect
  const [boxPairs, setBoxPairs] = useState(() => {
    // Return default order for initial render (server and client will match)
    const selected = []
    for (let i = 0; i < 6; i++) {
      selected.push(ALL_BOX_PAIRS[i % ALL_BOX_PAIRS.length])
    }
    return selected
  })
  
  // Randomize messages with varying lengths
  const [messages, setMessages] = useState(() => {
    // Return first 6 messages for initial render (server and client will match)
    return ALL_MESSAGES.slice(0, 6)
  })
  
  // SentCard data state
  const [sentCards, setSentCards] = useState(() => {
    // Return default values for initial render (server and client will match)
    return Array(6).fill(null).map((_, i) => ({
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
    for (let i = 0; i < 6; i++) {
      selected.push(shuffled[i % shuffled.length])
    }
    setBoxPairs(shuffleArray(selected))
    setMessages(shuffleArray(ALL_MESSAGES).slice(0, 6))
    
    // Generate randomized SentCard data
    const randomized = generateRandomSentCardData({
      covers: ALL_COVERS,
      senders: ALL_SENDERS,
      titles: ALL_TITLES,
      giftTitles: ALL_GIFT_TITLES,
      giftSubtitles: ALL_GIFT_SUBTITLES,
      dates: ALL_SENT_DATES,
      count: 6,
      minDoneCards: 2
    })
    setSentCards(randomized)
  }, [])
  
  // Generate stable card types for mixed view - always 50% single, 50% batch
  const mixedCardTypes = useMemo(() => {
    if (viewType !== 'mixed') return null
    
    const totalCards = sentCards.length
    const batchCount = Math.floor(totalCards / 2) // 50% batch cards
    const singleCount = totalCards - batchCount // Remaining are single cards
    
    // Create array with exactly 50% batch (true) and 50% single (false)
    const types = [
      ...Array(batchCount).fill(true),  // Batch cards
      ...Array(singleCount).fill(false) // Single cards
    ]
    
    // Shuffle using seeded random for consistent results
    let seed = mixSeed
    const seededRandom = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }
    
    // Fisher-Yates shuffle with seeded random
    for (let i = types.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom() * (i + 1))
      ;[types[i], types[j]] = [types[j], types[i]]
    }
    
    return types
  }, [viewType, mixSeed, sentCards.length])
  
  // Determine if current view is single
  const isSingleView = viewType === 'single'
  
  // Helper function to get SentCard4 props based on layout number
  const getSentCard4Props = useCallback((card, layoutNum, useColoredBackground) => {
    return getSentCard4PropsHelper(card, layoutNum, useColoredBackground)
  }, [])
  
  // Helper function to get Single 1 specific props (with Box1/Box2 controls)
  const getSingle1Props = useCallback((card, useColoredBackground, layoutNum = '1', animationType = 'highlight', enable3D = false) => {
    return getSingle1PropsHelper(card, useColoredBackground, layoutNum, style, animationType, enable3D)
  }, [style, animationType, enable3D])
  
  // Helper function to get SentCard props based on layout number
  const getSentCardProps = useCallback((card, layoutNum, useColoredBackground, animationType, enable3D, useSingleConfig = false) => {
    return getSentCardPropsHelper(card, layoutNum, useColoredBackground, animationType, enable3D, style, useSingleConfig)
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
  }), [handleOpenGift])
  
  // Memoize tab button handlers
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab)
  }, [])
  
  // Shuffle cards function
  const handleShuffle = useCallback(() => {
    // Trigger rotation animation
    setIsShuffling(true)
    
    // Shuffle Gift Received cards
    const shuffledBoxPairs = shuffleArray(ALL_BOX_PAIRS)
    const selected = []
    for (let i = 0; i < 6; i++) {
      selected.push(shuffledBoxPairs[i % shuffledBoxPairs.length])
    }
    setBoxPairs(shuffleArray(selected))
    setMessages(shuffleArray(ALL_MESSAGES).slice(0, 6))
    
    // Shuffle Gift Sent cards
    const randomized = generateRandomSentCardData({
      covers: ALL_COVERS,
      senders: ALL_SENDERS,
      titles: ALL_TITLES,
      giftTitles: ALL_GIFT_TITLES,
      giftSubtitles: ALL_GIFT_SUBTITLES,
      dates: ALL_SENT_DATES,
      count: 6,
      minDoneCards: 2
    })
    setSentCards(randomized)
    
    // Update mix seed to reshuffle mixed view
    if (viewType === 'mixed') {
      setMixSeed(Date.now())
    }
    
    // Reset animation after it completes
    setTimeout(() => {
      setIsShuffling(false)
    }, 600)
    
  }, [viewType, layoutNumber])
  
  return (
    <div className="h-screen bg-[#f0f1f5] flex flex-col items-start overflow-hidden relative">
      <div 
        className="w-full max-w-[1440px] mx-auto px-0 md:px-[80px] lg:px-[240px] pt-5 pb-[200px] flex-1 relative"
        id="content-container"
        style={{
          '--content-padding': '0px',
        }}
      >
        {/* ControlBar */}
        <div className="mb-6">
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
            useColoredBackground={(layoutNumber === '1' || layoutNumber === '2') ? useColoredBackground : false}
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
      {/* StylingBar - Left side */}
      <div 
        className="absolute top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3 styling-bar-position"
      >
        {/* Shuffle button */}
        <button
          onClick={handleShuffle}
          className="styling-bar-tooltip flex items-center justify-center w-[48px] h-[48px] rounded-full border border-[#dde2e9] bg-white text-base font-medium text-[#525F7A] hover:bg-gray-50 hover:translate-x-[2px] transition-all ease-out focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
          aria-label="Shuffle cards"
          data-tooltip="Shuffle cards"
        >
          <svg 
            width="22" 
            height="22" 
            viewBox="0 0 16 16" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={isShuffling ? 'shuffle-icon-rotate' : ''}
            style={{ transformOrigin: 'center' }}
          >
            <path d="M1.5,8A6.5,6.5,0,0,1,13.478,4.5" fill="none" stroke="currentColor" strokeWidth="1.0" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="13.5 0.5 13.5 4.5 9.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.0" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14.5,8A6.5,6.5,0,0,1,2.522,11.5" fill="none" stroke="currentColor" strokeWidth="1.0" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="2.5 15.5 2.5 11.5 6.5 11.5" fill="none" stroke="currentColor" strokeWidth="1.0" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {/* View selector */}
        <div className="relative">
          <button
            onClick={() => {
              if (activeTab === 'sent') {
                setShowViewMenu(!showViewMenu)
              }
            }}
            disabled={activeTab !== 'sent'}
            className={`styling-bar-tooltip flex items-center justify-center w-[48px] h-[48px] rounded-full border border-[#dde2e9] bg-white transition-all ease-out focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 ${
              activeTab === 'sent' 
                ? 'hover:bg-gray-50 hover:translate-x-[2px] cursor-pointer' 
                : 'opacity-40 cursor-not-allowed'
            }`}
            aria-label="View type"
            data-tooltip="Change view type"
            data-view-button
            data-menu-open={showViewMenu ? 'true' : undefined}
          >
            <svg width="22" height="22" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.5,8 c0,0,3-5.5,7.5-5.5S15.5,8,15.5,8s-3,5.5-7.5,5.5S0.5,8,0.5,8z" fill="none" stroke="currentColor" strokeWidth="1.0" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10"/>
              <circle fill="none" stroke="currentColor" strokeWidth="1.0" strokeLinecap="round" strokeLinejoin="round" cx="8" cy="8" r="2.5"/>
            </svg>
          </button>
          {/* View menu */}
          {showViewMenu && activeTab === 'sent' && (
            <div 
              className="absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-[110] bg-white rounded-xl border border-[#dde2e9] shadow-lg p-2 min-w-[140px] context-menu-enter"
              data-view-menu
            >
              <button
                onClick={() => {
                  setViewType('mixed')
                  setMixSeed(Date.now())
                }}
                className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                  viewType === 'mixed'
                    ? 'bg-[#5a3dff] text-white'
                    : 'text-[#525F7A] hover:bg-gray-50'
                }`}
              >
                Mixed
              </button>
              <button
                onClick={() => {
                  setViewType('batch')
                }}
                className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                  viewType === 'batch'
                    ? 'bg-[#5a3dff] text-white'
                    : 'text-[#525F7A] hover:bg-gray-50'
                }`}
              >
                Batch
              </button>
              <button
                onClick={() => {
                  setViewType('single')
                }}
                className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                  viewType === 'single'
                    ? 'bg-[#5a3dff] text-white'
                    : 'text-[#525F7A] hover:bg-gray-50'
                }`}
              >
                Single
              </button>
            </div>
          )}
        </div>
        {/* Theming button */}
        <button
          onClick={() => setUseColoredBackground(!useColoredBackground)}
          disabled={activeTab !== 'sent' || (layoutNumber !== '1' && layoutNumber !== '2')}
          className={`styling-bar-tooltip flex items-center justify-center w-[48px] h-[48px] rounded-full border border-[#dde2e9] transition-all ease-out focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 ${
            activeTab === 'sent' && (layoutNumber === '1' || layoutNumber === '2')
              ? useColoredBackground 
                ? 'bg-[#5a3dff] text-white hover:translate-x-[2px]' 
                : 'bg-white text-[#525F7A] hover:bg-gray-50 hover:translate-x-[2px] cursor-pointer'
              : 'bg-white text-[#525F7A] opacity-40 cursor-not-allowed'
          }`}
          aria-label="Toggle theming"
          data-tooltip="Toggle theming"
        >
          <svg width="22" height="22" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5.5,2.086,5.914a2,2,0,0,0,0,2.828l1.586,1.586L.914,13.086a1.414,1.414,0,0,0,0,2h0a1.414,1.414,0,0,0,2,0l2.757-2.757,1.586,1.586a2,2,0,0,0,2.828,0L15.5,8.5Z" fill="none" stroke="currentColor" strokeWidth="1.0" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="4.5" y1="6.5" x2="9.5" y2="11.5" fill="none" stroke="currentColor" strokeWidth="1.0" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {/* 3D button */}
        <button
          onClick={() => setEnable3D(!enable3D)}
          disabled={activeTab !== 'sent' || !(layoutNumber === '2' || (layoutNumber === '1' && (style === '1' || style === '2' || style === '3')) || (layoutNumber === '2' && layout2BoxType === '3'))}
          className={`styling-bar-tooltip flex items-center justify-center w-[48px] h-[48px] rounded-full border border-[#dde2e9] transition-all ease-out focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 ${
            activeTab === 'sent' && (layoutNumber === '2' || (layoutNumber === '1' && (style === '1' || style === '2' || style === '3')) || (layoutNumber === '2' && layout2BoxType === '3'))
              ? enable3D 
                ? 'bg-[#5a3dff] text-white hover:translate-x-[2px]' 
                : 'bg-white text-[#525F7A] hover:bg-gray-50 hover:translate-x-[2px] cursor-pointer'
              : 'bg-white text-[#525F7A] opacity-40 cursor-not-allowed'
          }`}
          aria-label="Toggle 3D effect"
          data-tooltip="Toggle 3D effect"
        >
          <svg width="22" height="22" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="8.5 0.5 15.5 3.5 15.5 12.5 8.5 15.5 1.5 12.5 1.5 3.5 8.5 0.5" fill="none" stroke="currentColor" strokeWidth="1.0" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="3.5 4.5 8.5 6.5 13.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.0" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="8.5" y1="6.5" x2="8.5" y2="13.5" fill="none" stroke="currentColor" strokeWidth="1.0" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {/* Animation button */}
        <div className="relative">
          <button
            onClick={() => {
              if (activeTab === 'sent' && ((layoutNumber === '1' && style === '2') || (layoutNumber === '2' && layout2BoxType === '2'))) {
                setShowAnimationMenu(!showAnimationMenu)
              }
            }}
            disabled={activeTab !== 'sent' || !((layoutNumber === '1' && style === '2') || (layoutNumber === '2' && layout2BoxType === '2'))}
            className={`styling-bar-tooltip flex items-center justify-center w-[48px] h-[48px] rounded-full border border-[#dde2e9] transition-all ease-out focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 ${
              activeTab === 'sent' && ((layoutNumber === '1' && style === '2') || (layoutNumber === '2' && layout2BoxType === '2'))
                ? animationType !== 'none'
                  ? 'bg-[#5a3dff] text-white hover:translate-x-[2px]' 
                  : 'bg-white text-[#525F7A] hover:bg-gray-50 hover:translate-x-[2px] cursor-pointer'
                : 'bg-white text-[#525F7A] opacity-40 cursor-not-allowed'
            }`}
            aria-label="Toggle animation"
            data-tooltip="Select animation type"
            data-animation-button
            data-menu-open={showAnimationMenu ? 'true' : undefined}
          >
            <svg width="22" height="22" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points=".5 13.5 2.5 15.5 11.487 6.487 9.513 4.487 .5 13.5" fill="none" stroke="currentColor" strokeWidth="1.0" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="7.513" y1="6.487" x2="9.513" y2="8.487" fill="none" stroke="currentColor" strokeWidth="1.0" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.5,2.5c1.105,0,2-.895,2-2,0,1.105,.895,2,2,2-1.105,0-2,.895-2,2,0-1.105-.895-2-2-2" fill="currentColor" stroke="currentColor" strokeWidth="1.0" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11.5,2.5c1.105,0,2-.895,2-2,0,1.105,.895,2,2,2-1.105,0-2,.895-2,2,0-1.105-.895-2-2-2" fill="currentColor" stroke="currentColor" strokeWidth="1.0" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11.5,10.493c1.105,0,2-.895,2-2,0,1.105,.895,2,2,2-1.105,0-2,.895-2,2,0-1.105-.895-2-2-2" fill="currentColor" stroke="currentColor" strokeWidth="1.0" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {/* Animation menu */}
          {showAnimationMenu && activeTab === 'sent' && ((layoutNumber === '1' && style === '2') || (layoutNumber === '2' && layout2BoxType === '2')) && (
            <div 
              className="absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-[110] bg-white rounded-xl border border-[#dde2e9] shadow-lg p-2 min-w-[140px] context-menu-enter"
              data-animation-menu
            >
                <button
                  onClick={() => {
                    setAnimationType('highlight')
                  }}
                  className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                    animationType === 'highlight'
                      ? 'bg-[#5a3dff] text-white'
                      : 'text-[#525F7A] hover:bg-gray-50'
                  }`}
                >
                  Shimmer
                </button>
                <button
                  onClick={() => {
                    setAnimationType('breathing')
                  }}
                  className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                    animationType === 'breathing'
                      ? 'bg-[#5a3dff] text-white'
                      : 'text-[#525F7A] hover:bg-gray-50'
                  }`}
                >
                  Breathing
                </button>
                <button
                  onClick={() => {
                    setAnimationType('none')
                  }}
                  className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                    animationType === 'none'
                      ? 'bg-[#5a3dff] text-white'
                      : 'text-[#525F7A] hover:bg-gray-50'
                  }`}
                >
                  None
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

