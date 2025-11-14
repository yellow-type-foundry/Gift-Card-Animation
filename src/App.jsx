import React, { useState } from 'react'
import GiftCard from './components/GiftCard'

function App() {
  const [cardState, setCardState] = useState('unopened')
  
  const handleOpenGift = () => {
    setCardState('opening')
  }
  
  return (
    <div className="min-h-screen bg-[#f0f1f5] py-12 px-4">
      <div className="max-w-[1600px] mx-auto flex items-center justify-center">
        {/* Card - transitions from unopened to opening */}
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
    </div>
  )
}

export default App
