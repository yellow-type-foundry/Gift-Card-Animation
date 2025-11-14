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
      className="border-border-default border-[0.884px] border-solid relative rounded-[24px] w-[300px] h-[384px] overflow-hidden cursor-pointer"
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
          className={`bg-white box-border flex flex-col gap-[16px] items-center p-4 absolute rounded-[24px] shadow-[0px_4px_12px_-4px_rgba(0,0,0,0.03),0px_2px_3px_0px_rgba(0,0,0,0.05)] w-[300px] h-[384px] ${isOpen ? 'h-[352px]' : ''} left-1/2 -translate-x-1/2 bottom-0 transition-all duration-500 ease-in-out`}
          data-name="Unopened Gift"
        >
          {/* Header */}
          <div 
            className={`flex flex-col gap-[8px] items-center relative shrink-0 text-center w-full overflow-hidden ${isOpen ? 'h-auto min-h-0' : ''} transition-all duration-500 ease-in-out`}
            style={{ minHeight: 'fit-content' }}
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
              className={`text-message relative shrink-0 w-full h-[58px] overflow-hidden ${isOpen ? 'h-0 opacity-0' : ''} transition-all duration-500 ease-in-out`}
              style={{ color: '#000000' }}
              data-node-id="1420:12373"
            >
              {message || 'Thank you for being such a great mentor!'}
            </p>
          </div>
          
          {/* Gift Box */}
          <div 
            className={`basis-0 flex gap-[10px] grow items-center justify-center min-h-px min-w-px relative shrink-0 w-full ${isOpen ? 'h-[80%]' : ''} transition-all duration-500 ease-in-out`}
            data-name="GiftBox"
          >
            <div 
              className="relative aspect-square w-full h-full max-w-[200px] max-h-[200px] transition-all duration-500 ease-in-out"
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
            className={`flex gap-[10px] items-center justify-center shrink-0 w-full ${isOpen ? 'absolute bottom-0 left-0 right-0 opacity-0 max-h-0 pointer-events-none' : 'relative opacity-100 max-h-[50px]'} transition-all duration-500 ease-in-out overflow-hidden`}
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
            className={`absolute bottom-[50px] left-0 right-0 flex flex-col gap-[4px] items-center justify-center w-full ${isOpen ? 'opacity-100 max-h-[100px] relative bottom-auto left-auto right-auto' : 'opacity-0 max-h-0'} transition-all duration-500 ease-in-out`}
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
            className={`absolute bottom-0 left-0 right-0 flex gap-[8px] items-center justify-center w-full ${isOpen ? 'opacity-100 max-h-[50px] relative bottom-auto left-auto right-auto' : 'opacity-0 max-h-0'} transition-all duration-500 ease-in-out`}
            style={{ width: '100%' }}
            data-name="Actions"
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSwap?.()
              }}
              className="bg-white border border-[#dde2e9] border-solid box-border flex items-center justify-center px-[8px] py-[6px] rounded-[8px] flex-1"
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
              className="bg-[#7f53fd] border border-[#6935fd] border-solid box-border flex items-center justify-center px-[8px] py-[6px] rounded-[8px] flex-1"
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
