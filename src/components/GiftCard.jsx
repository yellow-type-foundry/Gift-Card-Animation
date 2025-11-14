import React, { useState } from 'react'
import GiftBoxIllustrationPatternUnpacked from './GiftBoxIllustration'
import pattern02 from '../assets/pattern-02.png'
import openedBoxShadowed from '../assets/Opened Box-shadowed.png'

const GiftCard = ({ 
  state = 'unopened', // 'unopened' | 'opening' | 'received' | 'thankYou' | 'thankYouSent'
  from,
  message,
  giftTitle,
  giftSubtitle,
  expiryText,
  onAccept,
  onSwap,
  onSendThankYou,
  onSendNote,
  onLater,
  onOpenGift
}) => {
  const [isOpening, setIsOpening] = useState(false)
  
  React.useEffect(() => {
    if (state === 'opening') {
      // Trigger animation when state changes to 'opening'
      setIsOpening(true)
    }
  }, [state])
  
  const handleOpenGift = () => {
    if (onOpenGift) {
      onOpenGift()
    } else {
      setIsOpening(true)
    }
  }
  // Unopened Gift Card
  if (state === 'unopened') {
    return (
      <div className="bg-white border border-[#dde2e9] border-solid rounded-[24px] w-[300px] h-[384px] p-4 flex flex-col items-center">
        {/* Header */}
        <div className="flex flex-col gap-[8px] items-center text-center w-full" style={{ marginBottom: '16px' }}>
          <p className="text-[#525f7a] text-base leading-[1.4] font-normal whitespace-pre" style={{ fontFamily: "'Goody Sans', sans-serif" }}>
            {from || 'From Lisa Tran'}
          </p>
          <p className="text-black text-2xl leading-[1.2] font-normal tracking-[-0.36px] min-h-[58px] overflow-hidden" style={{ fontFamily: "'HW Cigars', serif" }}>
            {message || 'Thank you for being such a great mentor!'}
          </p>
        </div>
        
            {/* Gift Box Illustration */}
            <div
              className="h-[180px] relative w-[268px] cursor-pointer flex items-center justify-center"
              onClick={handleOpenGift}
              style={{ marginBottom: '16px' }}
            >
              {/* Box 2 - Opened Box (0% opacity in unopened state) */}
              <img
                src={openedBoxShadowed}
                alt="Opened box"
                className="absolute object-contain"
                style={{
                  width: '180px',
                  height: '180px',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  opacity: 0,
                  zIndex: 1
                }}
              />
              {/* Box 1 - Gift Box Illustration */}
              <div
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <GiftBoxIllustrationPatternUnpacked
                  style="02"
                  className="h-[180px] relative w-[180px]"
                />
              </div>
            </div>
        
        {/* Footer */}
        {expiryText && (
          <div className="text-[#7b8aa7] text-sm leading-[1.4] text-center font-medium" style={{ fontFamily: "'Goody Sans', sans-serif", fontWeight: 500 }}>
            {expiryText}
          </div>
        )}
      </div>
    )
  }

  // Opening/Received Gift Card (with gift wrap pattern at top)
  if (state === 'opening' || state === 'received') {
    const showOpeningAnimation = state === 'opening' && isOpening
    
    return (
      <div className="bg-white border border-[#dde2e9] rounded-[24px] w-[300px] h-[384px] overflow-hidden relative">
        {/* Gift Wrap Pattern Header - pattern-02.png */}
        <div 
          className="absolute top-0 left-0 w-full h-[160px]"
          style={{
            backgroundImage: `url(${pattern02})`,
            backgroundRepeat: 'repeat',
            backgroundSize: 'cover',
            backgroundColor: '#ff9e9e',
            opacity: showOpeningAnimation ? 1 : 0,
            transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
        
        {/* Card Content - slides down when opening */}
        <div 
          className="absolute left-0 w-full bg-white rounded-[24px] flex flex-col items-center"
          style={{
            top: showOpeningAnimation ? '32px' : '0px',
            height: showOpeningAnimation ? 'calc(100% - 32px)' : '100%',
            padding: '16px',
            gap: '16px',
            transition: 'top 0.6s cubic-bezier(0.4, 0, 0.2, 1), height 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            boxSizing: 'border-box'
          }}
        >
          {/* Message Header */}
          <div className="flex flex-col gap-[6px] items-center text-center w-full" style={{ height: 'calc(1.4em + 6px + 58px)' }}>
            <p className="text-[#525f7a] text-base leading-[1.4] font-normal" style={{ fontFamily: "'Goody Sans', sans-serif" }}>
              {from || 'From Lisa Tran'}
            </p>
            <div
              style={{ 
                opacity: showOpeningAnimation ? 0 : 1,
                height: '58px',
                overflow: 'hidden',
                transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <p 
                className="text-black text-2xl leading-[1.2] font-normal tracking-[-0.36px]" 
                style={{ 
                  fontFamily: "'HW Cigars', serif", 
                  display: '-webkit-box', 
                  WebkitLineClamp: 1, 
                  WebkitBoxOrient: 'vertical', 
                  textOverflow: 'ellipsis'
                }}
              >
                {message || 'Thank you for being such a great mentor!'}
              </p>
            </div>
          </div>
          
          {/* Illustration Container - fixed position to prevent jumping */}
          <div className="w-full" style={{ height: '180px', position: 'relative', flexShrink: 0 }}>
            {/* Box 2 - Opened Box */}
            <img 
              src={openedBoxShadowed} 
              alt="Opened box"
              className="absolute object-contain"
              style={{
                width: '180px',
                height: '180px',
                left: '50%',
                top: '50%',
                transform: showOpeningAnimation ? 'translate(-50%, -50%) scale(0.85)' : 'translate(-50%, -50%) scale(1)',
                opacity: showOpeningAnimation ? 1 : 0,
                transition: 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                zIndex: 1,
                willChange: 'transform'
              }}
            />
            {/* Box 1 - Gift Box Illustration */}
            <div
              className="absolute"
              style={{
                left: '50%',
                top: '50%',
                transform: showOpeningAnimation ? 'translate(-50%, -50%) scale(0.85)' : 'translate(-50%, -50%) scale(1)',
                transformOrigin: 'center center',
                transition: 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                zIndex: 2,
                willChange: 'transform'
              }}
            >
              <GiftBoxIllustrationPatternUnpacked 
                style="02" 
                className="h-[180px] relative w-[180px]" 
              />
            </div>
          </div>
          
          {/* Gift Details */}
          <div 
            className="flex flex-col gap-1 items-start w-full text-center"
            style={{
              opacity: showOpeningAnimation ? 1 : 0,
              transform: showOpeningAnimation ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s',
              flexShrink: 0
            }}
          >
            <p className="text-black text-base leading-[1.4] font-medium w-full" style={{ fontFamily: "'Goody Sans', sans-serif", fontWeight: 500 }}>
              {giftTitle || '24 Pack of Cookies'}
            </p>
            <p className="text-[#525f7a] text-base leading-[1.4] font-normal w-full" style={{ fontFamily: "'Goody Sans', sans-serif" }}>
              {giftSubtitle || 'Levain Cookies'}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div 
            className="flex gap-2 items-center justify-center w-full"
            style={{
              opacity: showOpeningAnimation ? 1 : 0,
              transform: showOpeningAnimation ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.3s, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.3s',
              flexShrink: 0
            }}
          >
            {state === 'opening' ? (
              <>
                <button 
                  onClick={onSwap}
                  className="flex-1 bg-white border border-[#dde2e9] rounded-lg px-2 py-1.5 text-[#7b8aa7] text-sm font-medium leading-[1.4] hover:bg-gray-50 transition-colors"
                  style={{ fontFamily: "'Goody Sans', sans-serif", fontWeight: 500 }}
                >
                  Swap
                </button>
                <button 
                  onClick={onAccept}
                  className="flex-1 bg-[#7f53fd] border border-[#6935fd] rounded-lg px-2 py-1.5 text-white text-sm font-medium leading-[1.4] hover:bg-[#6935fd] transition-colors"
                  style={{ fontFamily: "'Goody Sans', sans-serif", fontWeight: 500 }}
                >
                  Accept
                </button>
              </>
            ) : (
              <button 
                onClick={onSendThankYou}
                className="flex-1 bg-[#7f53fd] border border-[#6935fd] rounded-lg px-2 py-1.5 text-white text-sm font-medium leading-[1.4] hover:bg-[#6935fd] transition-colors flex items-center justify-center gap-2"
                style={{ fontFamily: "'Goody Sans', sans-serif", fontWeight: 500 }}
              >
                <span>💬</span>
                <span>Send Thank-You Note</span>
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Thank You Note Card
  if (state === 'thankYou') {
    return (
      <div className="border border-[#dde2e9] rounded-[24px] w-[300px] h-[384px] bg-white flex flex-col gap-4 items-center justify-center p-4">
        {/* Header */}
        <div className="flex flex-col gap-1.5 items-center w-full">
          <p className="text-[#525f7a] text-base leading-[1.4] font-normal text-center" style={{ fontFamily: "'Goody Sans', sans-serif" }}>
            Thank-You Note
          </p>
        </div>
        
        {/* Message Container */}
        <div className="flex-1 bg-[#f0f1f5] border border-[#dde2e9] rounded-[20px] w-full p-4">
          <textarea
            placeholder="Write something..."
            className="w-full h-full bg-transparent text-[#7b8aa7] text-sm leading-[1.4] font-normal resize-none outline-none"
            style={{ fontFamily: "'Goody Sans', sans-serif" }}
            rows={8}
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 items-center justify-center w-full">
          <button 
            onClick={onLater}
            className="flex-1 bg-white border border-[#dde2e9] rounded-lg px-2 py-1.5 text-[#7b8aa7] text-sm font-medium leading-[1.4] hover:bg-gray-50 transition-colors"
            style={{ fontFamily: "'Goody Sans', sans-serif", fontWeight: 500 }}
          >
            Later
          </button>
          <button 
            onClick={onSendNote}
            className="flex-1 bg-[#7f53fd] border border-[#6935fd] rounded-lg px-2 py-1.5 text-white text-sm font-medium leading-[1.4] hover:bg-[#6935fd] transition-colors flex items-center justify-center gap-2"
            style={{ fontFamily: "'Goody Sans', sans-serif", fontWeight: 500 }}
          >
            <span>💬</span>
            <span>Send</span>
          </button>
        </div>
      </div>
    )
  }

  // Thank You Sent Card
  if (state === 'thankYouSent') {
    return (
      <div className="border border-[#dde2e9] rounded-[24px] w-[300px] h-[384px] bg-white flex flex-col gap-4 items-center justify-center p-4">
        {/* Message Header */}
        <div className="flex flex-col gap-1.5 items-center text-center w-full">
          <p className="text-[#525f7a] text-base leading-[1.4] font-normal" style={{ fontFamily: "'Goody Sans', sans-serif" }}>
            Received from {from || 'Ashley Irvin'}
          </p>
          <p className="text-black text-2xl leading-[1.2] font-normal tracking-[-0.36px] h-[29px] overflow-hidden" style={{ fontFamily: "'HW Cigars', serif" }}>
            {message || 'Happy holidays to you!'}
          </p>
        </div>
        
        {/* Illustration */}
        <div className="flex-1 flex items-center justify-center w-full">
          <div className="relative">
            <div className="w-[180px] h-[180px] bg-[#ffc2c2] rounded-[35px] shadow-inner" />
            <div className="absolute top-4 left-4 w-[156px] h-[156px] bg-[#ffd6d6] rounded-[23px]" />
          </div>
        </div>
        
        {/* Gift Details */}
        <div className="flex flex-col gap-1 items-start w-full text-center">
          <p className="text-black text-base leading-[1.4] font-medium w-full" style={{ fontFamily: "'Goody Sans', sans-serif", fontWeight: 500 }}>
            {giftTitle || '24 Pack of Cookies'}
          </p>
          <p className="text-[#525f7a] text-base leading-[1.4] font-normal w-full" style={{ fontFamily: "'Goody Sans', sans-serif" }}>
            {giftSubtitle || 'Levain Cookies'}
          </p>
        </div>
      </div>
    )
  }

  return null
}

export default GiftCard

