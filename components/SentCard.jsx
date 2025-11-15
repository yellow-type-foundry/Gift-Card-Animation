'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { TOKENS } from '@/constants/tokens'
import useDominantColor from '@/hooks/useDominantColor'

// Button component with hover/pressed states
const ButtonWithHover = () => {
  const [isButtonHovered, setIsButtonHovered] = useState(false)
  const [isButtonPressed, setIsButtonPressed] = useState(false)

  return (
    <div
      data-icon-leading="false"
      data-icon-trailing="true"
      data-label="true"
      data-state={isButtonPressed ? 'Pressed' : 'Default'}
      data-style="Accent 2"
      className="px-2 py-1.5 rounded-lg outline outline-1 outline-offset-[-1px] outline-violet-600 inline-flex justify-center items-center cursor-pointer"
      style={{
        borderRadius: '12px',
        borderColor: '#7c3aed',
        backgroundColor: (isButtonHovered || isButtonPressed) ? '#7c3aed' : 'transparent',
        whiteSpace: 'nowrap',
        transition: 'background-color 300ms ease-out'
      }}
      onMouseEnter={() => setIsButtonHovered(true)}
      onMouseLeave={() => {
        setIsButtonHovered(false)
        setIsButtonPressed(false)
      }}
      onMouseDown={() => setIsButtonPressed(true)}
      onMouseUp={() => setIsButtonPressed(false)}
    >
      <div className="self-stretch min-h-6 px-1 flex justify-center items-center gap-2.5">
        <div
          className="text-center justify-start text-sm font-medium font-['Goody_Sans'] leading-5 line-clamp-1"
          style={{
            fontFamily: 'var(--font-goody-sans)',
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: 1.4,
            color: (isButtonHovered || isButtonPressed) ? '#ffffff' : '#7c3aed',
            transition: 'color 300ms ease-out'
          }}
        >
          Send a reminder
        </div>
      </div>
      <div
        data-size="M"
        className="w-6 h-6 max-w-6 max-h-6 inline-flex flex-col justify-center items-center"
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <div
            className="self-stretch h-5 text-center justify-center text-sm font-['SF_Pro'] leading-4"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro", sans-serif',
              fontSize: '14px',
              lineHeight: 1.4,
              color: (isButtonHovered || isButtonPressed) ? '#ffffff' : '#7c3aed',
              transition: 'color 0.2s ease-out'
            }}
          >
            􀋙
          </div>
        </div>
      </div>
    </div>
  )
}

const SentCard = ({
  from = 'Jim Pfiffer',
  title = 'New Hires Onboarding',
  boxImage = '/assets/covers/Onboarding 03.png',
  giftTitle = "Holiday's sparkles",
  giftSubtitle = 'Collection by Goody',
  progress = { current: 2, total: 4 },
  sentDate = '1 day ago'
}) => {
  // Ensure current never exceeds total, and total never exceeds 40
  const validatedProgress = {
    current: Math.min(progress.current, progress.total),
    total: Math.min(40, progress.total)
  }
  
  // Calculate target progress percentage precisely (will never exceed 100% since current <= total)
  // For example: 9/22 = 0.409090909... = 40.909090909...%
  const targetProgressPercentage = validatedProgress.total > 0 
    ? (validatedProgress.current / validatedProgress.total) * 100 
    : 0
  
  // Animated progress percentage (starts at 0, animates to target after content loads)
  const [animatedProgress, setAnimatedProgress] = useState(0)
  // Animated current value (starts at 0, counts up to target)
  const [animatedCurrent, setAnimatedCurrent] = useState(0)
  
  // Refs to store timers for cleanup
  const countIntervalRef = useRef(null)
  const timerRef = useRef(null)
  
  // Hover state
  const [isHovered, setIsHovered] = useState(false)
  
  // Extract dominant color from cover image
  const { dominantColor, isLoading } = useDominantColor(boxImage, '#47caeb')
  
  // Animate progress bar and count after content is loaded
  useEffect(() => {
    // Wait for image to load and color extraction to complete
    if (!isLoading && dominantColor) {
      // Small delay before animation starts
      timerRef.current = setTimeout(() => {
        const targetCurrent = validatedProgress.current
        const duration = 500 // 0.5s to match CSS transition
        const steps = 30 // Number of animation steps
        const stepDuration = duration / steps
        const increment = targetCurrent / steps
        let currentStep = 0
        
        // Animate progress bar width immediately
        setAnimatedProgress(targetProgressPercentage)
        
        // Animate counting number
        countIntervalRef.current = setInterval(() => {
          currentStep++
          const newValue = Math.min(
            targetCurrent,
            Math.floor(increment * currentStep)
          )
          setAnimatedCurrent(newValue)
          
          if (currentStep >= steps) {
            // Ensure final value is exact
            setAnimatedCurrent(targetCurrent)
            if (countIntervalRef.current) {
              clearInterval(countIntervalRef.current)
              countIntervalRef.current = null
            }
          }
        }, stepDuration)
      }, 100)
      
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current)
        }
        if (countIntervalRef.current) {
          clearInterval(countIntervalRef.current)
        }
      }
    }
  }, [isLoading, dominantColor, targetProgressPercentage, validatedProgress.current])

  return (
          <div
            className="border border-[#dde2e9] border-solid relative rounded-[24px] w-full md:w-[300px]"
            style={{
              height: '321px',
              borderRadius: TOKENS.sizes.borderRadius.card,
              transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
              boxShadow: isHovered
                ? '0 12px 40px -8px rgba(0, 0, 0, 0.15), 0 4px 12px -4px rgba(0, 0, 0, 0.1)'
                : 'none',
              transition: `transform ${TOKENS.animation.duration.medium} ${TOKENS.animation.easing.easeOut}, box-shadow ${TOKENS.animation.duration.medium} ${TOKENS.animation.easing.easeOut}`
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            data-name="Gift Card"
          >
      <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        {/* Header Section */}
        <div
          className="box-border content-stretch flex flex-col gap-[24px] items-center pb-0 pt-[20px] px-0 relative shrink-0 w-full"
          style={{
            height: '197px',
            position: 'relative'
          }}
          data-name="Unopened Gift"
        >
          {/* Background with gradient overlay */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: `${TOKENS.sizes.borderRadius.card} ${TOKENS.sizes.borderRadius.card} 0 0`
            }}
          >
            {/* Base color - dynamically extracted from cover image */}
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: dominantColor,
                transition: 'background-color 0.3s ease-out'
              }}
            />
            {/* Gradient overlay with blend mode */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 65%)',
                mixBlendMode: 'overlay'
              }}
            />
          </div>

          {/* Header Content */}
          <div
            className="box-border content-stretch flex flex-col gap-[8px] items-center not-italic px-[16px] py-0 relative shrink-0 text-center text-white w-full"
            style={{
              zIndex: 1
            }}
            data-name="Header"
          >
            <p
              className="font-['Goody_Sans:Regular',sans-serif] leading-[1.4] opacity-80 relative shrink-0 text-[16px] text-nowrap whitespace-pre"
              style={{
                fontFamily: 'var(--font-goody-sans)',
                fontSize: '16px',
                fontWeight: 400,
                lineHeight: 1.4,
                opacity: 0.8
              }}
            >
              {sentDate} by {from}
            </p>
            <p
              className="font-['HW_Cigars:Regular',sans-serif] leading-[1.2] min-w-full relative shrink-0 text-[24px] tracking-[-0.36px] w-[min-content]"
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

          {/* Gift Image Container */}
          <div
            className="box-border content-stretch flex flex-col items-center justify-end pb-[40px] pt-0 px-0 relative shrink-0 w-full"
            style={{
              position: 'relative',
              zIndex: 1
            }}
            data-name="Gift Image Container"
          >
            {/* Box Image */}
            <div
              className="box-border content-stretch flex gap-[10px] h-[90px] items-end justify-center mb-[-40px] relative shrink-0 w-full"
              data-name="Box 03"
            >
              <div
                className="absolute bottom-0 contents left-1/2 translate-x-[-50%]"
                data-name="Gift Image"
              >
                <div
                  className="absolute bottom-0 h-[90px] left-1/2 pointer-events-none rounded-tl-[12px] rounded-tr-[12px] translate-x-[-50%] w-[260px]"
                  data-name="Box"
                  style={{
                    borderRadius: '12px 12px 0 0'
                  }}
                >
                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      borderRadius: '12px 12px 0 0'
                    }}
                  >
                    <Image
                      alt=""
                      src={boxImage}
                      fill
                      className="object-cover"
                      style={{
                        objectPosition: '50% 50%',
                        borderRadius: '12px 12px 0 0'
                      }}
                      unoptimized
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        mixBlendMode: 'soft-light',
                        borderRadius: '12px 12px 0 0'
                      }}
                    />
                  </div>
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      boxShadow: `
                        0px 3px 10px 0px inset rgba(255,255,255,0.2),
                        0px 0px 3px 0px inset rgba(0,0,0,0.15),
                        0px 2px 4px 0px inset rgba(245,246,248,0.3)
                      `,
                      borderRadius: '12px 12px 0 0'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Union Shape - wavy bottom border with backdrop-filter */}
            <div
              className="h-[44px] relative shrink-0 w-[300px]"
              data-name="Union"
              style={{
                position: 'relative',
                marginBottom: '-44px'
              }}
            >
              {/* Backdrop blur layer with custom shape mask */}
              <div
                className="absolute inset-0"
                style={{
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  maskImage: `url("data:image/svg+xml,%3Csvg width='301' height='45' viewBox='0 0 301 45' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M89.7744 0.5C93.4057 0.5 95.2217 0.49966 96.4062 0.876953C97.9552 1.37031 98.0273 1.41117 99.25 2.48242C100.185 3.30169 101.92 6.17595 105.389 11.9238C109.765 19.1749 117.718 24.0234 126.806 24.0234H172.806C181.893 24.0234 189.847 19.1749 194.223 11.9238C197.692 6.17595 199.426 3.30169 200.361 2.48242C201.584 1.41117 201.656 1.37031 203.205 0.876953C204.39 0.499659 206.206 0.5 209.837 0.5H300.5V44.5H0.5V0.5H89.7744Z' fill='black'/%3E%3C/svg%3E")`,
                  WebkitMaskImage: `url("data:image/svg+xml,%3Csvg width='301' height='45' viewBox='0 0 301 45' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M89.7744 0.5C93.4057 0.5 95.2217 0.49966 96.4062 0.876953C97.9552 1.37031 98.0273 1.41117 99.25 2.48242C100.185 3.30169 101.92 6.17595 105.389 11.9238C109.765 19.1749 117.718 24.0234 126.806 24.0234H172.806C181.893 24.0234 189.847 19.1749 194.223 11.9238C197.692 6.17595 199.426 3.30169 200.361 2.48242C201.584 1.41117 201.656 1.37031 203.205 0.876953C204.39 0.499659 206.206 0.5 209.837 0.5H300.5V44.5H0.5V0.5H89.7744Z' fill='black'/%3E%3C/svg%3E")`,
                  maskSize: 'cover',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  WebkitMaskSize: 'cover',
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center'
                }}
              />
              
              {/* White gradient overlay - 100% white at bottom (y1=44.5), 50% white at top (y2=0.5) */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to top, white, rgba(255,255,255,0.5))',
                  maskImage: `url("data:image/svg+xml,%3Csvg width='301' height='45' viewBox='0 0 301 45' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M89.7744 0.5C93.4057 0.5 95.2217 0.49966 96.4062 0.876953C97.9552 1.37031 98.0273 1.41117 99.25 2.48242C100.185 3.30169 101.92 6.17595 105.389 11.9238C109.765 19.1749 117.718 24.0234 126.806 24.0234H172.806C181.893 24.0234 189.847 19.1749 194.223 11.9238C197.692 6.17595 199.426 3.30169 200.361 2.48242C201.584 1.41117 201.656 1.37031 203.205 0.876953C204.39 0.499659 206.206 0.5 209.837 0.5H300.5V44.5H0.5V0.5H89.7744Z' fill='black'/%3E%3C/svg%3E")`,
                  WebkitMaskImage: `url("data:image/svg+xml,%3Csvg width='301' height='45' viewBox='0 0 301 45' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M89.7744 0.5C93.4057 0.5 95.2217 0.49966 96.4062 0.876953C97.9552 1.37031 98.0273 1.41117 99.25 2.48242C100.185 3.30169 101.92 6.17595 105.389 11.9238C109.765 19.1749 117.718 24.0234 126.806 24.0234H172.806C181.893 24.0234 189.847 19.1749 194.223 11.9238C197.692 6.17595 199.426 3.30169 200.361 2.48242C201.584 1.41117 201.656 1.37031 203.205 0.876953C204.39 0.499659 206.206 0.5 209.837 0.5H300.5V44.5H0.5V0.5H89.7744Z' fill='black'/%3E%3C/svg%3E")`,
                  maskSize: 'cover',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  WebkitMaskSize: 'cover',
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center'
                }}
              />
              
              {/* Fallback SVG for browsers that don't support backdrop-filter */}
              <div
                className="absolute inset-[-1.14%_-0.17%]"
                style={{
                  opacity: 0,
                  pointerEvents: 'none'
                }}
              >
                <Image
                  alt=""
                  src="/assets/c38a0055529756f72aeda5844281908c377ee640.svg"
                  fill
                  className="block max-w-none size-full"
                  style={{
                    objectFit: 'fill'
                  }}
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div
          className="bg-white box-border content-stretch flex flex-col gap-[16px] items-center justify-center pb-[20px] pt-[4px] px-[16px] relative shrink-0 w-full"
          style={{
            marginTop: '-44px',
            paddingTop: '48px'
          }}
          data-name="Gift Message Container"
        >
          {/* Gift Message */}
          <div
            className="content-stretch flex flex-col gap-[4px] items-start leading-[1.4] not-italic relative shrink-0 text-center"
            data-name="Gift Message"
          >
            <p
              className="[white-space-collapse:collapse] font-['Goody_Sans:Medium',sans-serif] h-[22px] overflow-ellipsis overflow-hidden relative shrink-0 text-[16px] text-black text-nowrap w-[268px]"
              style={{
                fontFamily: 'var(--font-goody-sans)',
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: 1.4,
                color: TOKENS.colors.text.primary
              }}
            >
              {giftTitle}
            </p>
            <p
              className="font-['Goody_Sans:Regular',sans-serif] h-[22px] relative shrink-0 text-[#525f7a] text-[14px] w-[268px]"
              style={{
                fontFamily: 'var(--font-goody-sans)',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: 1.4,
                color: TOKENS.colors.text.secondary
              }}
            >
              {giftSubtitle}
            </p>
          </div>

          {/* Progress Bar Container */}
          <div
            className="content-stretch flex flex-col gap-[10px] h-[36px] items-center justify-center relative shrink-0 w-full"
            data-name="Bottom"
          >
            <div
              className="flex items-center justify-center relative w-full"
              style={{
                height: '36px'
              }}
            >
              {/* Progress Bar - hidden on hover only if not all accepted */}
              <div
                className="bg-[#f0f1f5] border border-[rgba(221,226,233,0)] border-solid box-border content-stretch flex flex-col gap-[10px] items-start justify-center p-[2px] relative rounded-[100px] absolute"
                style={{
                  borderRadius: '100px',
                  backgroundColor: '#f0f1f5',
                  width: '120px',
                  opacity: (isHovered && validatedProgress.current !== validatedProgress.total) ? 0 : 1,
                  visibility: (isHovered && validatedProgress.current !== validatedProgress.total) ? 'hidden' : 'visible',
                  transition: 'opacity 0.3s ease-out, visibility 0.3s ease-out',
                  pointerEvents: (isHovered && validatedProgress.current !== validatedProgress.total) ? 'none' : 'auto'
                }}
                data-name="Progress Bar Container"
              >
                {/* Progress Bar */}
                <div
                  className="bg-gradient-to-b box-border content-stretch flex flex-col from-[#5a3dff] gap-[10px] items-start justify-center px-[8px] py-[2px] relative rounded-[100px] shrink-0"
                  style={{
                    background: 'linear-gradient(to bottom, #5a3dff, #a799ff)',
                    borderRadius: '100px',
                    width: validatedProgress.current === validatedProgress.total ? '100%' : `${animatedProgress}%`,
                    maxWidth: '100%',
                    minWidth: 'fit-content',
                    transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  data-name="Progress Bar"
                >
                  <p
                    className={`font-['Goody_Sans:Medium',sans-serif] leading-[1.4] not-italic relative shrink-0 text-[14px] text-white ${
                      validatedProgress.current === validatedProgress.total ? 'text-center' : ''
                    }`}
                    style={{
                      fontFamily: 'var(--font-goody-sans)',
                      fontSize: '14px',
                      fontWeight: 500,
                      lineHeight: 1.4,
                      color: '#ffffff',
                      whiteSpace: 'nowrap',
                      width: '100%',
                      textAlign: validatedProgress.current === validatedProgress.total ? 'center' : 'left'
                    }}
                  >
                    {validatedProgress.current === validatedProgress.total 
                      ? 'All accepted' 
                      : `${animatedCurrent}/${validatedProgress.total}`}
                  </p>
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      boxShadow: '0px 1px 2px 0px inset rgba(255,255,255,0.5)',
                      borderRadius: '100px'
                    }}
                  />
                </div>
                <div
                  className="absolute inset-[-1px] pointer-events-none"
                  style={{
                    boxShadow: '0px 1px 2.25px 0px inset #c2c6d6, 0px -1px 2.25px 0px inset #ffffff',
                    borderRadius: '100px'
                  }}
                />
              </div>
              
              {/* Send a reminder button - replaces progress bar on hover (only if not all accepted) */}
              {validatedProgress.current !== validatedProgress.total && (
                <div
                  className="absolute"
                  style={{
                    opacity: isHovered ? 1 : 0,
                    visibility: isHovered ? 'visible' : 'hidden',
                    transform: isHovered ? 'translateY(0)' : 'translateY(12px)',
                    transition: 'opacity 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.25s cubic-bezier(0.34, 1.56, 0.34, 1), visibility 0.25s ease-out',
                    pointerEvents: isHovered ? 'auto' : 'none'
                  }}
                >
                  <ButtonWithHover />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(SentCard)

