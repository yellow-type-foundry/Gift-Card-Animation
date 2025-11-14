import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { TOKENS } from '../constants/tokens'

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

  // Memoize computed state
  const isOpening = useMemo(() => state === 'opening' || isOpen, [state, isOpen])
  const isUnopened = useMemo(() => state !== 'opening' && !isOpen, [state, isOpen])

  // Click outside handler
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

  // Event handlers with useCallback
  const handleCardClick = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const handleHoverEnter = useCallback(() => {
    setIsHovered(true)
  }, [])

  const handleHoverLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  const handleSwapClick = useCallback((e) => {
    e.stopPropagation()
    onSwap?.()
  }, [onSwap])

  const handleAcceptClick = useCallback((e) => {
    e.stopPropagation()
    onAccept?.()
  }, [onAccept])

  // Memoized transforms
  const box1Transform = useMemo(() => {
    const baseTranslate = 'translate(-50%, -50%)'
    
    if (isHovered && isUnopened) {
      const { rotate, translateX, translateY, scale } = TOKENS.transforms.box1.hover
      return `${baseTranslate} rotate(${rotate}) translateX(${translateX}) translateY(${translateY}) scale(${scale})`
    }
    
    if (isOpening) {
      const { rotate, translateX, translateY, scale } = TOKENS.transforms.box1.opening
      return `${baseTranslate} rotate(${rotate}) translateX(${translateX}) translateY(${translateY}) scale(${scale})`
    }
    
    return `${baseTranslate} rotate(0deg) translateX(0px) translateY(0px) scale(1)`
  }, [isHovered, isUnopened, isOpening])

  const box2Transform = useMemo(() => {
    const baseTranslate = 'translate(-50%, -50%)'
    
    if (isOpening) {
      const { rotate, translateX, translateY, scale } = TOKENS.transforms.box2.opening
      return `${baseTranslate} rotate(${rotate}) translateX(${translateX}) translateY(${translateY}) scale(${scale})`
    }
    
    return `${baseTranslate} rotate(0deg) translateX(0px) translateY(0px) scale(1)`
  }, [isOpening])

  // Memoized styles
  const whiteCardStyle = useMemo(() => ({
    boxShadow: isOpening ? TOKENS.colors.shadow.opening : TOKENS.colors.shadow.default,
    transition: `box-shadow ${TOKENS.animation.duration.medium} ${TOKENS.animation.easing.easeOut}`
  }), [isOpening])

  const messageStyle = useMemo(() => ({
    color: TOKENS.colors.text.primary,
    transform: `scale(${isOpening ? TOKENS.transforms.message.scale.opening : TOKENS.transforms.message.scale.default})`,
    transition: `transform ${TOKENS.animation.duration.fast} ${TOKENS.animation.easing.easeOut}, opacity ${TOKENS.animation.duration.fast} ${TOKENS.animation.easing.easeOut}, height ${TOKENS.animation.duration.fast} ${TOKENS.animation.easing.easeOut}`
  }), [isOpening])

  const expiryTextStyle = useMemo(() => ({
    marginBottom: isOpen ? '0' : '0',
    transition: `opacity ${TOKENS.animation.duration.fast} ${TOKENS.animation.easing.easeOut}, max-height ${TOKENS.animation.duration.fast} ${TOKENS.animation.easing.easeOut}`
  }), [isOpen])

  const giftBoxContainerStyle = useMemo(() => ({
    height: isOpen ? '80%' : 'auto',
    transform: isOpening ? 'translateY(-2px)' : 'translateY(0)',
    transition: `height ${TOKENS.animation.duration.slow} ${TOKENS.animation.easing.easeOut}, transform ${TOKENS.animation.duration.slow} ${TOKENS.animation.easing.easeOut}`
  }), [isOpen, isOpening])

  const box1Style = useMemo(() => ({
    transition: `transform ${TOKENS.animation.duration.slow} ${TOKENS.animation.easing.box1}`,
    transform: box1Transform,
    top: '50%',
    left: '50%',
    transformOrigin: 'center center',
    willChange: 'transform'
  }), [box1Transform])

  const box2Style = useMemo(() => ({
    transition: `transform ${TOKENS.animation.duration.slow} ${TOKENS.animation.easing.box2}`,
    transform: box2Transform,
    top: '50%',
    left: '50%',
    transformOrigin: 'center center',
    willChange: 'transform'
  }), [box2Transform])

  const actionsStyle = useMemo(() => ({
    width: '100%',
    transitionTimingFunction: TOKENS.animation.easing.easeOut,
    transition: `opacity ${TOKENS.animation.duration.medium} ${TOKENS.animation.easing.easeOut}, max-height ${TOKENS.animation.duration.medium} ${TOKENS.animation.easing.easeOut}`
  }), [])

  return (
    <div 
      ref={cardRef}
      onClick={handleCardClick}
      className="border-solid relative overflow-hidden cursor-pointer"
      style={{ 
        borderWidth: TOKENS.sizes.borderWidth,
        borderColor: TOKENS.colors.border.default,
        borderRadius: TOKENS.sizes.borderRadius.card,
        width: TOKENS.sizes.card.width,
        height: TOKENS.sizes.card.height.closed
      }}
      data-name="Default"
    >
      {/* Background Image */}
      <Image
        alt=""
        src="/assets/f93cde9a1130f6c57e6462db2258fe32049760f3.png"
        fill
        className="object-cover pointer-events-none"
        style={{ 
          objectPosition: '50% 50%',
          borderRadius: TOKENS.sizes.borderRadius.card
        }}
        unoptimized
      />
      
      {/* Inner Container */}
      <div className="relative w-full h-full overflow-clip" style={{ zIndex: TOKENS.zIndex.innerContainer }}>
        {/* White Card Container */}
        <div 
          className="bg-white box-border flex flex-col items-center absolute bottom-0"
          style={{
            ...whiteCardStyle,
            borderRadius: TOKENS.sizes.borderRadius.card,
            width: TOKENS.sizes.card.width,
            height: TOKENS.sizes.card.height.closed,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: TOKENS.spacing.cardPadding,
            gap: TOKENS.spacing.cardGap
          }}
          data-name="Unopened Gift"
        >
          {/* Header */}
          <div 
            className="flex flex-col items-center relative shrink-0 text-center w-full overflow-hidden"
            style={{
              gap: TOKENS.spacing.headerGap,
              transition: `all ${TOKENS.animation.duration.medium} ${TOKENS.animation.easing.easeOut}`
            }}
            data-name="Header"
          >
            <p 
              className="text-body-l relative shrink-0 whitespace-pre"
              style={{ 
                color: TOKENS.colors.text.tertiary,
                height: TOKENS.sizes.text.senderHeight
              }}
              data-node-id="1420:12372"
            >
              {from || 'From Lisa Tran'}
            </p>
            <p 
              className="text-message relative shrink-0 w-full overflow-hidden"
              style={{
                ...messageStyle,
                height: isOpening ? '0' : TOKENS.sizes.text.messageHeight,
                opacity: isOpening ? 0 : 1
              }}
              data-node-id="1420:12373"
            >
              {message || 'Thank you for being such a great mentor!'}
            </p>
          </div>
          
          {/* Gift Box */}
          <div 
            className="basis-0 flex grow items-center justify-center min-h-px min-w-px relative shrink-0 w-full"
            style={{
              ...giftBoxContainerStyle,
              gap: TOKENS.spacing.giftBoxGap
            }}
            data-name="GiftBox"
          >
            {/* Box 2 - Duplicate illustration - lower z-index */}
            <div 
              className="absolute aspect-square w-full h-full"
              style={{
                ...box2Style,
                maxWidth: TOKENS.sizes.giftBox.maxWidth,
                maxHeight: TOKENS.sizes.giftBox.maxHeight,
                zIndex: TOKENS.zIndex.box2
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
            {/* Box 1 - Original illustration - higher z-index */}
            <div 
              className="absolute aspect-square w-full h-full"
              onMouseEnter={handleHoverEnter}
              onMouseLeave={handleHoverLeave}
              style={{
                ...box1Style,
                maxWidth: TOKENS.sizes.giftBox.maxWidth,
                maxHeight: TOKENS.sizes.giftBox.maxHeight,
                zIndex: TOKENS.zIndex.box1
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
            className={`flex items-center justify-center shrink-0 w-full ${isOpen ? 'opacity-0 max-h-0 pointer-events-none' : 'opacity-100'} absolute left-0 right-0`}
            style={{
              ...expiryTextStyle,
              gap: TOKENS.spacing.giftBoxGap,
              maxHeight: isOpen ? '0' : TOKENS.sizes.text.expiryMaxHeight,
              bottom: isOpen ? '0' : TOKENS.spacing.cardPadding
            }}
            data-name="Bottom"
          >
            <p 
              className="text-body-l relative shrink-0 whitespace-pre"
              style={{ 
                color: TOKENS.colors.text.tertiary,
                height: TOKENS.sizes.text.senderHeight
              }}
              data-node-id="1420:12398"
            >
              {expiryText || 'Expiring in 21 days'}
            </p>
          </div>

          {/* Gift Info */}
          <div 
            className={`flex flex-col items-center justify-center w-full ${isOpen ? 'opacity-100 relative' : 'opacity-0 max-h-0 relative pointer-events-none'}`}
            style={{
              gap: TOKENS.spacing.xs,
              maxHeight: isOpen ? TOKENS.sizes.text.giftInfoMaxHeight : '0',
              transition: `all ${TOKENS.animation.duration.medium} ${TOKENS.animation.easing.easeOut}`
            }}
            data-name="Gift Info"
          >
            <p 
              className="text-body-l-bold relative shrink-0 text-center w-full"
              style={{ color: TOKENS.colors.text.primary }}
            >
              {giftTitle || '24 Pack of Cookies'}
            </p>
            <p 
              className="text-body-l relative shrink-0 text-center w-full"
              style={{ color: TOKENS.colors.text.secondary }}
            >
              {giftSubtitle || 'Levain Cookies'}
            </p>
          </div>

          {/* Actions */}
          <div 
            className={`flex items-center justify-center w-full ${isOpen ? 'opacity-100 relative' : 'opacity-0 relative pointer-events-none'}`}
            style={{
              ...actionsStyle,
              gap: TOKENS.spacing.actionsGap,
              maxHeight: isOpen ? TOKENS.sizes.text.actionsMaxHeight : '0'
            }}
            data-name="Actions"
          >
            <button
              onClick={handleSwapClick}
              className="px-2 py-1.5 bg-white rounded-[12px] outline outline-1 outline-offset-[-1px] outline-zinc-200 hover:outline-slate-300 active:outline-slate-300 inline-flex justify-center items-center flex-1 transition-all duration-300 ease-out group"
              style={{ borderRadius: TOKENS.sizes.borderRadius.button }}
              data-name="Button/Text/M"
            >
              <div className="self-stretch min-h-6 px-1 flex justify-center items-center gap-2.5">
                <div className="text-center justify-start text-slate-400 group-hover:text-slate-600 group-active:text-slate-600 text-sm font-medium font-['Goody_Sans'] leading-5 line-clamp-1">
                  Swap
                </div>
              </div>
            </button>
            <button
              onClick={handleAcceptClick}
              className="px-2 py-1.5 bg-violet-500 hover:bg-violet-600 active:bg-violet-600 rounded-[12px] outline outline-1 outline-offset-[-1px] outline-violet-600 inline-flex justify-center items-center flex-1 transition-all duration-300 ease-out"
              style={{ borderRadius: TOKENS.sizes.borderRadius.button }}
              data-name="Button/Text/M"
            >
              <div className="self-stretch min-h-6 px-1 flex justify-center items-center gap-2.5">
                <div className="text-center justify-start text-white text-sm font-medium font-['Goody_Sans'] leading-5 line-clamp-1">
                  Accept
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(GiftCard)
