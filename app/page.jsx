'use client'

import { useState, useMemo } from 'react'
import GiftCard from '@/components/GiftCard'

export default function Home() {
  const [cardStates, setCardStates] = useState({
    card1: 'unopened',
    card2: 'unopened',
    card3: 'unopened',
    card4: 'unopened'
  })
  
  // Randomize box assignments on mount
  const boxImages = useMemo(() => {
    const boxes = [
      '/assets/Box 1/Box 01.png',
      '/assets/Box 1/Box 02.png',
      '/assets/Box 1/Box 03.png',
      '/assets/Box 1/Box 04.png',
      '/assets/Box 1/Box 05.png',
      '/assets/Box 1/Box 06.png'
    ]
    // Shuffle and pick 4 random boxes
    const shuffled = [...boxes].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 4)
  }, [])
  
  const handleOpenGift = (cardId) => {
    setCardStates(prev => ({
      ...prev,
      [cardId]: 'opening'
    }))
  }
  
  return (
    <div className="min-h-screen bg-[#f0f1f5] flex items-center">
      <div 
        className="w-full grid justify-center gift-card-grid" 
        style={{ 
          paddingLeft: '240px', 
          paddingRight: '240px', 
          gap: '24px'
        }}
      >
        {/* Card 1 - Original */}
        <GiftCard
          state={cardStates.card1}
          from="Lisa Tran"
          message="Thank you for being such a great mentor!"
          expiryText={cardStates.card1 === 'unopened' ? 'Expiring in 21 days' : undefined}
          giftTitle="24 Pack of Cookies"
          giftSubtitle="Levain Cookies"
          boxImage={boxImages[0]}
          onOpenGift={() => handleOpenGift('card1')}
        />
        
        {/* Card 2 - Different sender and gift */}
        <GiftCard
          state={cardStates.card2}
          from="Michael Chen"
          message="I really appreciate all your help and guidance!"
          expiryText={cardStates.card2 === 'unopened' ? 'Expiring in 18 days' : undefined}
          giftTitle="Coffee Gift Set"
          giftSubtitle="Blue Bottle Coffee"
          boxImage={boxImages[1]}
          onOpenGift={() => handleOpenGift('card2')}
        />
        
        {/* Card 3 - Another variation */}
        <GiftCard
          state={cardStates.card3}
          from="Sarah Johnson"
          message="Thanks for everything you've done for me!"
          expiryText={cardStates.card3 === 'unopened' ? 'Expiring in 15 days' : undefined}
          giftTitle="Chocolate Box Collection"
          giftSubtitle="Godiva Chocolates"
          boxImage={boxImages[2]}
          onOpenGift={() => handleOpenGift('card3')}
        />
        
        {/* Card 4 - Final variation */}
        <GiftCard
          state={cardStates.card4}
          from="David Kim"
          message="Your mentorship has been invaluable to me!"
          expiryText={cardStates.card4 === 'unopened' ? 'Expiring in 30 days' : undefined}
          giftTitle="Gourmet Tea Selection"
          giftSubtitle="TWG Tea"
          boxImage={boxImages[3]}
          onOpenGift={() => handleOpenGift('card4')}
        />
      </div>
    </div>
  )
}

