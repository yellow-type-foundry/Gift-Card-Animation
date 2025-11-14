'use client'

import { useState } from 'react'
import GiftCard from '../src/components/GiftCard'

export default function Home() {
  const [cardState, setCardState] = useState('unopened')
  
  const handleOpenGift = () => {
    setCardState('opening')
  }
  
  return (
    <div className="min-h-screen bg-[#f0f1f5] flex items-center justify-center px-4">
      <GiftCard
        state={cardState}
        from="Lisa Tran"
        message="Thank you for being such a great mentor!"
        expiryText={cardState === 'unopened' ? 'Expiring in 21 days' : undefined}
        giftTitle="24 Pack of Cookies"
        giftSubtitle="Levain Cookies"
        onOpenGift={handleOpenGift}
      />
    </div>
  )
}

