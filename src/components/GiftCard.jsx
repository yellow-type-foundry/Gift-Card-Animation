import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

const GiftCard = ({ 
  state = 'unopened',
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
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleCardClick = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div 
      ref={cardRef}
      onClick={handleCardClick}
      className="border-[0.884px] border-solid relative rounded-[24px] w-[300px] h-[384px] overflow-hidden cursor-pointer"
      style={{ borderColor: '#DDE2E9' }}
      data-name="Default"
    >
      {/* Background Image */}
      <Image
        alt=""
        src="/assets/f93cde9a1130f6c57e6462db2258fe32049760f3.png"
        fill
        className="object-cover pointer-events-none rounded-[24px]"
        style={{ objectPosition: '50% 50%' }}
        unoptimized
      />
      
      {/* Inner Container */}
      <div className="relative w-full h-full z-10 overflow-clip">
        {/* White Card Container */}
        <div 
          className={`bg-white box-border flex flex-col gap-[16px] items-center p-4 absolute rounded-[24px] w-[300px] ${isOpen ? 'h-[352px]' : 'h-[384px]'} left-1/2 -translate-x-1/2 bottom-0 transition-all duration-500 ease-out`}
          style={{
            boxShadow: state === 'opening' || isOpen 
              ? '0px -8px 24px -4px rgba(0, 0, 0, 0.12), 0px -4px 8px -2px rgba(0, 0, 0, 0.08)' 
              : '0px 4px 12px -4px rgba(0, 0, 0, 0.03), 0px 2px 3px 0px rgba(0, 0, 0, 0.05)'
          }}
          data-name="Unopened Gift"
        >
          {/* Header */}
          <div 
            className={`flex flex-col gap-[8px] items-center relative shrink-0 text-center w-full overflow-hidden transition-all duration-500 ease-out`}
            data-name="Header"
          >
            <p 
              className="text-body-l relative shrink-0 whitespace-pre h-[20px]"
              style={{ color: '#525f7a' }}
              data-node-id="1420:12372"
            >
              {from || 'From Lisa Tran'}
            </p>
            <p 
              className={`text-message relative shrink-0 w-full overflow-hidden ${state === 'opening' || isOpen ? 'h-0 opacity-0' : 'h-[58px] opacity-100'} transition-all duration-300 ease-out`}
              style={{ 
                color: '#000000',
                transform: state === 'opening' || isOpen ? 'scale(0.85)' : 'scale(1)'
              }}
              data-node-id="1420:12373"
            >
              {message || 'Thank you for being such a great mentor!'}
            </p>
          </div>
          
          {/* Gift Box */}
          <div 
            className={`basis-0 flex gap-[10px] grow items-center justify-center min-h-px min-w-px relative shrink-0 w-full`}
            style={{ 
              height: isOpen ? '80%' : 'auto',
              transition: 'height 700ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            data-name="GiftBox"
          >
            {/* Duplicate illustration - lower z-index */}
            <div 
              className="absolute aspect-square w-full h-full max-w-[200px] max-h-[200px] z-0"
              style={{ 
                transition: 'transform 700ms cubic-bezier(0.2, 0, 0.7, 1)',
                transform: state === 'opening' || isOpen 
                  ? 'translate(-50%, -50%) rotate(-15deg) translateX(-36px) translateY(-10px) scale(0.9)' 
                  : 'translate(-50%, -50%) rotate(0deg) translateX(0px) translateY(0px) scale(1)',
                top: '50%',
                left: '50%',
                transformOrigin: 'center center',
                willChange: 'transform'
              }}
              data-name="Pattern-Unpacked 1-duplicate"
            >
              <Image
                alt=""
                src="/assets/Opened Box-shadowed.png"
                fill
                className="object-contain pointer-events-none"
                style={{ objectPosition: '50% 50%' }}
                unoptimized
              />
            </div>
            {/* Original illustration - higher z-index - Box 1 */}
            <div 
              className="absolute aspect-square w-full h-full max-w-[200px] max-h-[200px] z-10"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{ 
                transition: 'transform 700ms cubic-bezier(0.2, 0, 0.4, 1)',
                transform: (() => {
                  const baseTransform = state === 'opening' || isOpen 
                    ? 'translate(-50%, -50%) rotate(15deg) translateX(32px) translateY(-8px) scale(0.9)' 
                    : 'translate(-50%, -50%) rotate(0deg) translateX(0px) translateY(0px) scale(1)'
                  
                  if (isHovered && (state !== 'opening' && !isOpen)) {
                    return 'translate(-50%, -50%) rotate(4deg) translateX(16px) translateY(-4px) scale(1)'
                  }
                  
                  return baseTransform
                })(),
                top: '50%',
                left: '50%',
                transformOrigin: 'center center',
                willChange: 'transform'
              }}
              data-name="Pattern-Unpacked 1"
            >
              <Image
                alt=""
                src="/assets/9bc1300f188601fbe3925683f624a4a16adfcc21.png"
                fill
                className="object-contain pointer-events-none"
                style={{ objectPosition: '50% 50%' }}
                unoptimized
              />
            </div>
          </div>
          
          {/* Bottom / Footer - Expiry Text */}
          <div 
            className={`flex gap-[10px] items-center justify-center shrink-0 w-full ${isOpen ? 'absolute bottom-0 left-0 right-0 opacity-0 max-h-0 pointer-events-none' : 'relative opacity-100 max-h-[50px]'} transition-all duration-300 ease-out overflow-hidden`}
            data-name="Bottom"
          >
            <div 
              className="basis-0 flex flex-col font-goody-sans grow justify-end leading-[0] min-h-px min-w-px relative shrink-0 text-body-m-bold text-center"
              style={{ color: '#7b8aa7' }}
              data-node-id="1420:12398"
            >
              <p className="leading-[1.4]">
                {expiryText || 'Expiring in 21 days'}
              </p>
            </div>
          </div>

          {/* Gift Info */}
          <div 
            className={`flex flex-col gap-[4px] items-center justify-center w-full transition-all duration-500 ease-out ${isOpen ? 'opacity-100 max-h-[100px] relative' : 'absolute bottom-[120px] left-0 right-0 opacity-0 max-h-0'}`}
            data-name="Gift Info"
          >
            <p 
              className="text-body-l-bold relative shrink-0 text-center w-full"
              style={{ color: '#000000' }}
            >
              {giftTitle || '24 Pack of Cookies'}
            </p>
            <p 
              className="text-body-l relative shrink-0 text-center w-full"
              style={{ color: '#525f7a' }}
            >
              {giftSubtitle || 'Levain Cookies'}
            </p>
          </div>

          {/* Actions */}
          <div 
            className={`flex gap-[8px] items-center justify-center w-full transition-all duration-500 ease-out ${isOpen ? 'opacity-100 max-h-[30px] relative' : 'opacity-0 max-h-0 relative pointer-events-none'}`}
            style={{ width: '100%', transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            data-name="Actions"
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSwap?.()
              }}
              className="bg-white border border-[#dde2e9] border-solid box-border flex items-center justify-center px-[8px] py-[6px] rounded-[8px] flex-1 transition-all duration-300 ease-out"
              data-name="Button/Text/M"
            >
              <div className="flex flex-row items-center">
                <p 
                  className="text-body-m-bold text-center whitespace-pre"
                  style={{ color: '#7b8aa7' }}
                >
                  Swap
                </p>
              </div>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onAccept?.()
              }}
              className="bg-[#7f53fd] border border-[#6935fd] border-solid box-border flex items-center justify-center px-[8px] py-[6px] rounded-[8px] flex-1 transition-all duration-300 ease-out"
              data-name="Button/Text/M"
            >
              <div className="flex flex-row items-center">
                <p 
                  className="text-body-m-bold text-center whitespace-pre text-white"
                >
                  Accept
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GiftCard
