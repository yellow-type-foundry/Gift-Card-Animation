import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { TOKENS } from '@/constants/tokens'
import Spinner from './Spinner'

const GiftCard = ({ 
  state = 'unopened',
  from,
  message,
  giftTitle,
  giftSubtitle,
  expiryText,
  boxImage = '/assets/Box 1/Box 01.png',
  box2Image = '/assets/Box 2/Box2-01.png',
  onAccept,
  onSwap,
  onSendThankYou,
  onSendNote,
  onLater,
  onOpenGift
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isAcceptLoading, setIsAcceptLoading] = useState(false)
  const [isAcceptExpanded, setIsAcceptExpanded] = useState(false)
  const cardRef = useRef(null)

  // Computed state
  const isOpening = state === 'opening' || isOpen
  const isUnopened = state !== 'opening' && !isOpen

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setIsOpen(false)
        setIsAcceptLoading(false)
        setIsAcceptExpanded(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle Accept button expansion after 700ms
  useEffect(() => {
    if (isAcceptLoading) {
      const timer = setTimeout(() => {
        setIsAcceptExpanded(true)
      }, 700)

      return () => clearTimeout(timer)
    } else {
      setIsAcceptExpanded(false)
    }
  }, [isAcceptLoading])

  // Event handlers with useCallback
  const handleCardClick = useCallback(() => {
    setIsOpen(prev => {
      const newValue = !prev
      if (!newValue) {
        // Reset loading state when closing
        setIsAcceptLoading(false)
        setIsAcceptExpanded(false)
      }
      return newValue
    })
  }, [])

  const handleHoverEnter = () => setIsHovered(true)
  const handleHoverLeave = () => setIsHovered(false)

  const handleSwapClick = useCallback((e) => {
    e.stopPropagation()
    onSwap?.()
  }, [onSwap])

  const handleAcceptClick = useCallback((e) => {
    e.stopPropagation()
    setIsAcceptLoading(true)
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
    
    // Return to original position when accepted (after loading icon is done)
    // The bounce easing will create an interesting overshoot effect
    if (isAcceptExpanded) {
      return `${baseTranslate} rotate(0deg) translateX(0px) translateY(0px) scale(1)`
    }
    
    if (isOpening) {
      const { rotate, translateX, translateY, scale } = TOKENS.transforms.box2.opening
      return `${baseTranslate} rotate(${rotate}) translateX(${translateX}) translateY(${translateY}) scale(${scale})`
    }
    
    return `${baseTranslate} rotate(0deg) translateX(0px) translateY(0px) scale(1)`
  }, [isOpening, isAcceptExpanded])

  // Memoized styles
  const whiteCardStyle = useMemo(() => ({
    boxShadow: isOpening ? TOKENS.colors.shadow.opening : TOKENS.colors.shadow.default,
    transition: `box-shadow ${TOKENS.animation.duration.medium} ${TOKENS.animation.easing.easeOut}`
  }), [isOpening])

  const messageStyle = useMemo(() => ({
    color: TOKENS.colors.text.primary,
    transform: `scale(${isOpening ? TOKENS.transforms.message.scale.opening : TOKENS.transforms.message.scale.default})`,
    filter: isOpening ? 'blur(4px)' : 'blur(0px)',
    transition: `transform ${TOKENS.animation.duration.fast} ${TOKENS.animation.easing.easeOut}, opacity ${TOKENS.animation.duration.fast} ${TOKENS.animation.easing.easeOut}, height ${TOKENS.animation.duration.fast} ${TOKENS.animation.easing.easeOut}, filter ${TOKENS.animation.duration.fast} ${TOKENS.animation.easing.easeOut}`
  }), [isOpening])

  const expiryTextStyle = {
    marginBottom: '0',
    transition: `opacity ${TOKENS.animation.duration.fast} ${TOKENS.animation.easing.easeOut}, max-height ${TOKENS.animation.duration.fast} ${TOKENS.animation.easing.easeOut}`
  }

  const giftBoxContainerStyle = useMemo(() => ({
    height: isOpen ? '80%' : 'auto',
    transform: isOpening ? 'translateY(-2px)' : 'translateY(0)',
    transition: `height ${TOKENS.animation.duration.slow} ${TOKENS.animation.easing.easeOut}, transform ${TOKENS.animation.duration.slow} ${TOKENS.animation.easing.easeOut}`
  }), [isOpen, isOpening])

  const box1Style = useMemo(() => ({
    transition: `transform ${TOKENS.animation.duration.slow} ${TOKENS.animation.easing.box1}, opacity ${TOKENS.animation.duration.slow} ${TOKENS.animation.easing.accelerate}, filter ${TOKENS.animation.duration.fast} ${TOKENS.animation.easing.accelerate}`,
    transform: box1Transform,
    opacity: isAcceptExpanded ? 0 : 1,
    filter: isAcceptExpanded ? 'blur(8px)' : 'blur(0px)',
    top: '50%',
    left: '50%',
    transformOrigin: 'center center',
    willChange: 'transform, opacity, filter'
  }), [box1Transform, isAcceptExpanded])

  const box2Style = useMemo(() => ({
    transition: `transform ${TOKENS.animation.duration.slow} ${TOKENS.animation.easing.bounce}, opacity ${TOKENS.animation.duration.slow} ${TOKENS.animation.easing.box2}`,
    transform: box2Transform,
    opacity: 1,
    top: '50%',
    left: '50%',
    transformOrigin: 'center center',
    willChange: 'transform'
  }), [box2Transform])

  const actionsStyle = {
    width: '100%',
    transitionTimingFunction: TOKENS.animation.easing.easeOut,
    transition: `opacity ${TOKENS.animation.duration.medium} ${TOKENS.animation.easing.easeOut}, max-height ${TOKENS.animation.duration.medium} ${TOKENS.animation.easing.easeOut}, gap ${TOKENS.animation.duration.fast} ${TOKENS.animation.easing.easeOut}`
  }

  // Card container hover styles
  const cardContainerStyle = useMemo(() => ({
    borderWidth: TOKENS.sizes.borderWidth,
    borderColor: TOKENS.colors.border.default,
    borderRadius: TOKENS.sizes.borderRadius.card,
    width: '100%',
    height: TOKENS.sizes.card.height.closed,
    transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
    boxShadow: isHovered 
      ? '0 12px 40px -8px rgba(0, 0, 0, 0.15), 0 4px 12px -4px rgba(0, 0, 0, 0.1)' 
      : 'none',
    transition: `transform ${TOKENS.animation.duration.medium} ${TOKENS.animation.easing.easeOut}, box-shadow ${TOKENS.animation.duration.medium} ${TOKENS.animation.easing.easeOut}`
  }), [isHovered])

  return (
    <div 
      ref={cardRef}
      onClick={handleCardClick}
      onMouseEnter={handleHoverEnter}
      onMouseLeave={handleHoverLeave}
      className="border-solid relative overflow-hidden cursor-pointer w-full md:max-w-[300px]"
      style={cardContainerStyle}
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
        priority
      />
      
      {/* Inner Container */}
      <div className="relative w-full h-full overflow-clip" style={{ zIndex: TOKENS.zIndex.innerContainer }}>
        {/* White Card Container */}
        <div 
          className="bg-white box-border flex flex-col items-center absolute bottom-0"
          style={{
            ...whiteCardStyle,
            borderRadius: TOKENS.sizes.borderRadius.card,
            width: '100%',
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
                opacity: isOpening ? 0 : 1,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                textOverflow: 'ellipsis',
                overflow: 'hidden'
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
                src={box2Image}
                fill
                className="object-contain pointer-events-none"
                style={{ objectPosition: '50% 50%' }}
              />
            </div>
            {/* Box 1 - Original illustration - higher z-index */}
            <div 
              className="absolute aspect-square w-full h-full"
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
                src={boxImage}
                fill
                className="object-contain pointer-events-none"
                style={{ objectPosition: '50% 50%' }}
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
              gap: isAcceptExpanded ? '0' : TOKENS.spacing.actionsGap,
              maxHeight: isOpen ? TOKENS.sizes.text.actionsMaxHeight : '0'
            }}
            data-name="Actions"
          >
            {!isAcceptExpanded && (
              <button
                onClick={handleSwapClick}
                className="px-2 py-1.5 bg-white rounded-[12px] outline outline-1 outline-offset-[-1px] outline-zinc-200 hover:outline-slate-300 active:outline-slate-300 inline-flex justify-center items-center flex-1 transition-all duration-300 ease-out group"
                style={{ 
                  borderRadius: TOKENS.sizes.borderRadius.button
                }}
                data-name="Button/Text/M"
              >
                <div className="self-stretch min-h-6 px-1 flex justify-center items-center gap-2.5">
                  <div className="text-center justify-start text-slate-400 group-hover:text-slate-600 group-active:text-slate-600 text-sm font-medium font-['Goody_Sans'] leading-5 line-clamp-1">
                    Swap
                  </div>
                </div>
              </button>
            )}
            <button
              onClick={handleAcceptClick}
              className="px-2 py-1.5 bg-violet-500 hover:bg-violet-600 active:bg-violet-600 rounded-[12px] outline outline-1 outline-offset-[-1px] outline-violet-600 inline-flex justify-center items-center transition-all duration-300 ease-out"
              style={{ 
                borderRadius: TOKENS.sizes.borderRadius.button,
                flex: isAcceptExpanded ? '1 1 100%' : '1 1 0',
                minWidth: isAcceptExpanded ? '100%' : '0',
                maxWidth: isAcceptExpanded ? '100%' : 'none',
                transition: 'flex 300ms ease-out, min-width 300ms ease-out, max-width 300ms ease-out'
              }}
              data-name="Button/Text/M"
            >
              <div className="self-stretch min-h-6 px-1 flex justify-center items-center gap-2.5" style={{ position: 'relative' }}>
                {!isAcceptExpanded && (
                  <div
                    style={{
                      position: 'absolute',
                      opacity: isAcceptLoading ? 1 : 0,
                      transform: isAcceptLoading ? 'translateX(0) scale(1)' : 'translateX(12px) scale(0.8)',
                      transition: 'opacity 300ms ease-out, transform 300ms ease-out',
                      pointerEvents: isAcceptLoading ? 'auto' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Spinner size={16} color="white" />
                  </div>
                )}
                <div 
                  className="text-center justify-start text-white text-sm font-medium font-['Goody_Sans'] leading-5 line-clamp-1"
                  style={{
                    opacity: isAcceptLoading && !isAcceptExpanded ? 0 : 1,
                    transition: 'opacity 300ms ease-out'
                  }}
                >
                  {isAcceptExpanded ? 'Send Thank-You Note' : 'Accept'}
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
