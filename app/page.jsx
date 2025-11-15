'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import GiftCard from '@/components/GiftCard'

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

// Helper function to shuffle array
const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function Home() {
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
  
  // Randomize data only on client side after hydration
  useEffect(() => {
    const shuffled = shuffleArray(ALL_BOX_PAIRS)
    const selected = []
    for (let i = 0; i < 8; i++) {
      selected.push(shuffled[i % shuffled.length])
    }
    setBoxPairs(shuffleArray(selected))
    setMessages(shuffleArray(ALL_MESSAGES).slice(0, 8))
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
  
  return (
    <div className="min-h-screen bg-[#f0f1f5] flex items-center">
      <div 
        className="w-full grid justify-center gift-card-grid px-5 md:px-[240px] py-10" 
        style={{ 
          gap: '24px'
        }}
      >
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
        
        {/* Card 2 - Different sender and gift */}
        <GiftCard
          state={cardStates.card2}
          from="Michael Chen"
          message={messages[1]}
          expiryText={cardStates.card2 === 'unopened' ? 'Expiring in 18 days' : undefined}
          giftTitle="Coffee Gift Set"
          giftSubtitle="Blue Bottle Coffee"
          boxImage={boxPairs[1].box1}
          box2Image={boxPairs[1].box2}
          onOpenGift={cardHandlers.card2}
        />
        
        {/* Card 3 - Another variation */}
        <GiftCard
          state={cardStates.card3}
          from="Sarah Johnson"
          message={messages[2]}
          expiryText={cardStates.card3 === 'unopened' ? 'Expiring in 15 days' : undefined}
          giftTitle="Chocolate Box Collection"
          giftSubtitle="Godiva Chocolates"
          boxImage={boxPairs[2].box1}
          box2Image={boxPairs[2].box2}
          onOpenGift={cardHandlers.card3}
        />
        
        {/* Card 4 - Final variation */}
        <GiftCard
          state={cardStates.card4}
          from="David Kim"
          message={messages[3]}
          expiryText={cardStates.card4 === 'unopened' ? 'Expiring in 30 days' : undefined}
          giftTitle="Gourmet Tea Selection"
          giftSubtitle="TWG Tea"
          boxImage={boxPairs[3].box1}
          box2Image={boxPairs[3].box2}
          onOpenGift={cardHandlers.card4}
        />
        
        {/* Card 5 */}
        <GiftCard
          state={cardStates.card5}
          from="Emily Rodriguez"
          message={messages[4]}
          expiryText={cardStates.card5 === 'unopened' ? 'Expiring in 12 days' : undefined}
          giftTitle="Artisan Cheese Board"
          giftSubtitle="Murray's Cheese"
          boxImage={boxPairs[4].box1}
          box2Image={boxPairs[4].box2}
          onOpenGift={cardHandlers.card5}
        />
        
        {/* Card 6 */}
        <GiftCard
          state={cardStates.card6}
          from="James Wilson"
          message={messages[5]}
          expiryText={cardStates.card6 === 'unopened' ? 'Expiring in 25 days' : undefined}
          giftTitle="Wine Collection"
          giftSubtitle="Napa Valley Wines"
          boxImage={boxPairs[5].box1}
          box2Image={boxPairs[5].box2}
          onOpenGift={cardHandlers.card6}
        />
        
        {/* Card 7 */}
        <GiftCard
          state={cardStates.card7}
          from="Olivia Martinez"
          message={messages[6]}
          expiryText={cardStates.card7 === 'unopened' ? 'Expiring in 7 days' : undefined}
          giftTitle="Spa Gift Certificate"
          giftSubtitle="Bliss Spa"
          boxImage={boxPairs[6].box1}
          box2Image={boxPairs[6].box2}
          onOpenGift={cardHandlers.card7}
        />
        
        {/* Card 8 */}
        <GiftCard
          state={cardStates.card8}
          from="Ryan Thompson"
          message={messages[7]}
          expiryText={cardStates.card8 === 'unopened' ? 'Expiring in 19 days' : undefined}
          giftTitle="Gourmet Chocolate Truffles"
          giftSubtitle="Vosges Haut-Chocolat"
          boxImage={boxPairs[7].box1}
          box2Image={boxPairs[7].box2}
          onOpenGift={cardHandlers.card8}
        />
      </div>
    </div>
  )
}

