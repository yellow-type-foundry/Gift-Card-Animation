'use client'

import React, { useRef, useMemo } from 'react'
import Image from 'next/image'
import { TOKENS } from '@/constants/tokens'
import useProgressAnimation from '@/hooks/useProgressAnimation'
import useHover from '@/hooks/useHover'
import Footer from '@/components/sent-card/Footer'
import { HEADER_OVERLAY_BG, FOOTER_CONFIG } from '@/constants/sentCardConstants'

// Gift container images (brand names)
const GIFT_CONTAINER_IMAGES = [
  '/assets/GiftSent/Gift Container/Apple.png',
  '/assets/GiftSent/Gift Container/Chipotle.png',
  '/assets/GiftSent/Gift Container/Columbia.png',
  '/assets/GiftSent/Gift Container/Goody.png',
  '/assets/GiftSent/Gift Container/Nike.png',
  '/assets/GiftSent/Gift Container/Supergoop.png',
  '/assets/GiftSent/Gift Container/Tiffany & Co.png'
]

const SentCard4 = ({
  from = 'Alex Torres',
  title = 'Marketing Strategy Update',
  giftTitle = "Biggest Thanks",
  giftSubtitle = 'Collection by Goody',
  progress = { current: 3, total: 6 },
  sentDate = '1 week ago',
  headerBgOverride = "#E3E7ED",
  footerPadEqual = true,
  overlayProgressOnEnvelope = true,
  showFooterProgress = false,
  showFooterReminder = true,
  footerBottomPadding = 20,
  footerTopPadding = 0
}) => {
  // Hooks
  const cardRef = useRef(null)
  const { isHovered, handleHoverEnter, handleHoverLeave } = useHover()
  
  // Progress animation
  const {
    animatedProgress,
    animatedCurrent,
    validatedProgress,
    isDone
  } = useProgressAnimation(progress)
  
  // Select gift container image based on progress (cycle through brands)
  const giftContainerIndex = useMemo(() => {
    // Map progress to image index (0-6 for brands)
    const progressRatio = validatedProgress.total > 0 
      ? validatedProgress.current / validatedProgress.total 
      : 0
    return Math.min(6, Math.floor(progressRatio * 7))
  }, [validatedProgress.current, validatedProgress.total])
  
  const giftContainerImage = useMemo(
    () => GIFT_CONTAINER_IMAGES[giftContainerIndex],
    [giftContainerIndex]
  )
  
  // Extract brand name from image path
  const brandName = useMemo(() => {
    const imagePath = giftContainerImage
    const fileName = imagePath.split('/').pop() || ''
    // Remove .png extension and return brand name
    return fileName.replace('.png', '')
  }, [giftContainerImage])
  

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleHoverEnter}
      onMouseLeave={handleHoverLeave}
      className="border border-[#dde2e9] border-solid relative rounded-[24px] w-full md:w-[300px] overflow-hidden"
      style={{
        borderRadius: TOKENS.sizes.borderRadius.card
      }}
      data-name="Gift Card"
      data-card-type="sent-single"
    >
      <div className="content-stretch flex flex-col items-start overflow-hidden relative rounded-[inherit] size-full">
        {/* Background with gradient overlay - extends to full card */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: TOKENS.sizes.borderRadius.card
          }}
        >
          {/* Base color */}
          <div
            className="absolute inset-0"
            data-name="HeaderBGBase"
            style={{
              backgroundColor: headerBgOverride || '#E3E7ED'
            }}
          />
          {/* Gradient overlay with blend mode */}
          <div
            className="absolute inset-0"
            style={{
              background: HEADER_OVERLAY_BG,
              mixBlendMode: 'overlay',
              zIndex: 0
            }}
          />
        </div>

        {/* Header Section */}
        <div
          className="box-border content-stretch flex flex-col items-center justify-start px-0 relative shrink-0 w-full overflow-visible"
          style={{
            position: 'relative',
            paddingTop: '20px',
            paddingBottom: '0',
            height: '240px'
          }}
          data-name="Header"
        >

          {/* Header Content */}
          <div
            className="box-border content-stretch flex flex-col gap-[8px] items-center not-italic px-[16px] py-0 relative shrink-0 text-center text-nowrap text-black w-full z-10"
            style={{
              marginBottom: 0
            }}
            data-name="Header Content"
          >
            <p
              className="font-['Goody_Sans:Regular',sans-serif] leading-[1.4] opacity-80 relative shrink-0 text-[16px] whitespace-pre"
              style={{
                fontFamily: 'var(--font-goody-sans)',
                fontSize: '16px',
                fontWeight: 400,
                lineHeight: 1.4,
                opacity: 0.8,
                color: TOKENS.colors.text.tertiary
              }}
            >
              {sentDate} • {from}
            </p>
            <p
              className="[white-space-collapse:collapse] font-['HW_Cigars:Regular',sans-serif] leading-[1.2] min-w-full overflow-ellipsis overflow-hidden relative shrink-0 text-[24px] tracking-[-0.36px] w-[min-content] text-black"
              style={{
                fontFamily: 'var(--font-hw-cigars)',
                fontSize: '24px',
                fontWeight: 400,
                lineHeight: 1.2,
                letterSpacing: '-0.36px'
              }}
            >
              {title}
            </p>
          </div>

          {/* Gift Container */}
          <div
            className="relative"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              flex: 1,
              pointerEvents: 'none',
              marginTop: '12px',
              marginBottom: '-8px',
              position: 'relative',
              minHeight: '150px'
            }}
            data-name="Gift Container"
          >
            {/* Dots background - behind gift container */}
            <div
              className="absolute"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '300px',
                height: '300pxx',
                zIndex: 1,
                pointerEvents: 'none',
                opacity: 1,
                position: 'absolute'
              }}
              aria-hidden="true"
            >
              <Image
                src="/assets/GiftSent/Gift Container/Dots-3x.png"
                alt=""
                width={210}
                height={150}
                priority={false}
                quality={100}
                unoptimized={true}
                style={{ 
                  objectFit: 'contain', 
                  width: '100%', 
                  height: '100%',
                  display: 'block'
                }}
              />
            </div>
            
            {/* Gift Container Image */}
            <div
              className="relative"
              style={{
                width: '250px',
                height: '250px',
                zIndex: 1,
                pointerEvents: 'none',
                position: 'relative'
              }}
              data-name="Gift Container Image"
            >
              <Image
                src={giftContainerImage}
                alt="Gift Container"
                fill
                sizes="210px"
                priority={true}
                quality={100}
                unoptimized={true}
                style={{ objectFit: 'contain' }}
              />
            </div>
            
          </div>
        </div>

        <Footer
          isDone={isDone}
          isHovered={isHovered}
          animatedProgress={animatedProgress}
          animatedCurrent={animatedCurrent}
          validatedTotal={validatedProgress.total}
          infoTitle={brandName}
          infoSubtitle={giftSubtitle}
          equalPadding={FOOTER_CONFIG.single.equalPadding}
          showProgress={overlayProgressOnEnvelope}
          showReminder={FOOTER_CONFIG.single.showReminder}
          infoInSlot={FOOTER_CONFIG.single.infoInSlot}
          bottomPadding={FOOTER_CONFIG.single.bottomPadding}
          topPadding={FOOTER_CONFIG.single.topPadding}
          transparent={FOOTER_CONFIG.single.transparent}
          hideInfoOnHover={FOOTER_CONFIG.single.hideInfoOnHover}
        />
      </div>
    </div>
  )
}

export default React.memo(SentCard4)
