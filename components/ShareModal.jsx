'use client'

import React, { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import SentCard1 from '@/components/SentCard1'

function ShareModal({ isOpen, onClose, cardProps, onPauseConfetti, onOpen }) {
  const [pauseConfetti, setPauseConfetti] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const hasCapturedRef = useRef(false) // Track if we've already captured
  const cardPropsRef = useRef(cardProps) // Store cardProps in ref to avoid dependency issues
  
  // Update ref when cardProps changes
  useEffect(() => {
    cardPropsRef.current = cardProps
  }, [cardProps])
  
  // Separate effect for modal open/close state
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Add class to body to pause all animations
      document.body.classList.add('share-modal-open')
      
      // CRITICAL: Force exit hover state and stop all animations
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        // Find all card containers
        const allCards = document.querySelectorAll('[data-name="Gift Card"]')
        allCards.forEach(card => {
          // Method 1: Dispatch mouseleave event
          const mouseLeaveEvent = new MouseEvent('mouseleave', {
            bubbles: true,
            cancelable: true,
            view: window,
            relatedTarget: document.body
          })
          card.dispatchEvent(mouseLeaveEvent)
          
          // Method 2: Directly remove animation classes and reset styles
          const animatedElements = card.querySelectorAll('.grid-cell-base, .grid-cell-overlay, .breathing-box-1, .breathing-box-2, .breathing-envelope-1, .breathing-envelope-2, .metal-shine-gradient, .metal-shine-trail, .progress-shimmer')
          animatedElements.forEach(el => {
            el.style.animation = 'none'
            el.style.animationName = 'none'
            el.style.animationDuration = '0s'
            el.style.animationPlayState = 'paused'
          })
          
          // Method 3: Reset card transform
          if (card.style) {
            card.style.transform = 'translateY(0)'
            card.style.boxShadow = 'none'
          }
        })
        
        // Also find and stop animations on Envelope and Box elements
        const envelopes = document.querySelectorAll('[data-name="Envelope"]')
        envelopes.forEach(env => {
          const mouseLeaveEvent = new MouseEvent('mouseleave', {
            bubbles: true,
            cancelable: true,
            view: window,
            relatedTarget: document.body
          })
          env.dispatchEvent(mouseLeaveEvent)
        })
        
        const boxes = document.querySelectorAll('[data-name="Box"]')
        boxes.forEach(box => {
          const mouseLeaveEvent = new MouseEvent('mouseleave', {
            bubbles: true,
            cancelable: true,
            view: window,
            relatedTarget: document.body
          })
          box.dispatchEvent(mouseLeaveEvent)
        })
      })
      
      // Pause ALL CSS animations and transitions in the background
      // Create a style element to inject global CSS
      const style = document.createElement('style')
      style.id = 'share-modal-pause-animations'
      style.textContent = `
        /* CRITICAL: Completely stop all animations when ShareModal is open */
        /* Disable pointer events on background to prevent hover states */
        body.share-modal-open > *:not([data-share-modal]) {
          pointer-events: none !important;
        }
        /* Remove ALL animations and transitions - most aggressive approach */
        body.share-modal-open *,
        body.share-modal-open *::before,
        body.share-modal-open *::after {
          animation: none !important;
          animation-name: none !important;
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          animation-iteration-count: 0 !important;
          animation-play-state: paused !important;
          transition: none !important;
          transition-property: none !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
          will-change: auto !important;
        }
        /* Force reset all transforms and effects on cards */
        body.share-modal-open [data-name="Gift Card"],
        body.share-modal-open [data-name="Gift Card"] * {
          transform: translateY(0) !important;
          box-shadow: none !important;
        }
        /* Override ALL hover states - even if element is hovered */
        body.share-modal-open [data-name="Gift Card"]:hover,
        body.share-modal-open [data-name="Gift Card"]:hover *,
        body.share-modal-open [data-name="Envelope"]:hover,
        body.share-modal-open [data-name="Envelope"]:hover *,
        body.share-modal-open [data-name="Box"]:hover,
        body.share-modal-open [data-name="Box"]:hover *,
        body.share-modal-open [data-name="Box Container"]:hover,
        body.share-modal-open [data-name="Box Container"]:hover * {
          animation: none !important;
          transition: none !important;
          transform: translateY(0) !important;
          box-shadow: none !important;
        }
        /* Exception: Allow animations ONLY in the modal */
        body.share-modal-open [data-share-modal],
        body.share-modal-open [data-share-modal] *,
        body.share-modal-open [data-share-modal] *::before,
        body.share-modal-open [data-share-modal] *::after {
          pointer-events: auto !important;
          animation: unset !important;
          transition: unset !important;
        }
      `
      document.head.appendChild(style)
      
      // Reset capture flag and state when modal opens
      hasCapturedRef.current = false
      setPauseConfetti(false)
      setCapturedImage(null)
      // Set capturing to true immediately to hide the card animation
      setIsCapturing(true)
    } else {
      document.body.style.overflow = ''
      document.body.classList.remove('share-modal-open')
      // Remove the style element to restore animations
      const style = document.getElementById('share-modal-pause-animations')
      if (style) {
        style.remove()
      }
      setPauseConfetti(false)
      setCapturedImage(null)
      setIsCapturing(false)
      hasCapturedRef.current = false
    }
    
    return () => {
      document.body.style.overflow = ''
      document.body.classList.remove('share-modal-open')
      // Cleanup: remove style element if modal is closed
      const style = document.getElementById('share-modal-pause-animations')
      if (style) {
        style.remove()
      }
    }
  }, [isOpen])

  // Separate effect for animation and capture - only run when modal is open
  useEffect(() => {
    if (!isOpen || !cardProps) return
    
    console.log('[ShareModal] Setting up animation and capture')
    
    // Notify parent to reset pause state
    if (onOpen) {
      onOpen()
    }
    
    // Start capture immediately - server handles all timing
      // Only capture once - check if we've already captured
      if (!hasCapturedRef.current) {
        const captureTimeout = setTimeout(async () => {
          // Double-check we haven't captured yet (race condition protection)
          if (hasCapturedRef.current) {
            console.log('[ShareModal] Already captured, skipping')
            return
          }
          
          hasCapturedRef.current = true // Mark as capturing
          setIsCapturing(true)
          
          try {
            console.log('[ShareModal] Starting capture...')
            // TESTING: Enable static mode by adding ?static=true to skip animation wait
            // Change to false to test with animation
            const USE_STATIC_MODE = true
            const apiUrl = USE_STATIC_MODE ? '/api/capture-card?static=true' : '/api/capture-card'
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(cardPropsRef.current),
              })
            
            if (response.ok) {
              const blob = await response.blob()
              const imageUrl = URL.createObjectURL(blob)
              setCapturedImage(imageUrl)
              console.log('[ShareModal] Card captured successfully')
            } else {
              console.error('[ShareModal] Failed to capture card:', await response.text())
              hasCapturedRef.current = false // Reset on error so user can try again
            }
          } catch (error) {
            console.error('[ShareModal] Error capturing card:', error)
            hasCapturedRef.current = false // Reset on error so user can try again
          } finally {
            setIsCapturing(false)
          }
      }, 0) // Start capture immediately - server handles timing
        
        return () => {
          clearTimeout(captureTimeout)
        }
      } else {
        console.log('[ShareModal] Capture already initiated, skipping duplicate')
    }
  }, [isOpen, onPauseConfetti, onOpen]) // Removed cardProps from dependencies to prevent re-runs

  if (!isOpen || !cardProps) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleClose = () => {
    onClose()
  }

  const handleDownload = () => {
    if (!capturedImage) return
    
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a')
    link.href = capturedImage
    link.download = 'gift-card.png' // Default filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleRecapture = () => {
    // Reset capture state to trigger a new capture
    setCapturedImage(null)
    hasCapturedRef.current = false
    setPauseConfetti(false)
    setIsCapturing(false)
  }

  return createPortal(
    <div
      data-share-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      style={{
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        className="relative bg-white rounded-[24px] shadow-2xl"
        style={{
          width: '540px',
          height: '720px',
          padding: capturedImage ? '0' : '24px',
          margin: 0,
          display: 'flex',
          overflow: 'hidden',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'scaleIn 0.2s ease-out',
          boxSizing: 'border-box'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className={`absolute ${capturedImage ? 'top-4 right-4' : 'top-4 right-4'} w-10 h-10 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-lg transition-colors z-20`}
          aria-label="Close"
        >
          <svg
              width="18"
              height="18"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4L4 12M4 4L12 12"
              stroke="#525F7A"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Render actual card component or captured image */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: capturedImage ? 'block' : 'flex',
            flexDirection: capturedImage ? 'unset' : 'column',
            alignItems: capturedImage ? 'unset' : 'center',
            justifyContent: capturedImage ? 'unset' : 'center',
            overflow: 'hidden',
            gap: capturedImage ? '0' : '20px',
            margin: 0,
            padding: 0
          }}
        >
          {capturedImage ? (
            <>
            <img
              src={capturedImage}
              alt="Captured card"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                margin: 0,
                padding: 0
              }}
            />
              {/* Action buttons - only show when image is captured */}
              <div 
                className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3 z-20"
                style={{
                  pointerEvents: 'auto'
                }}
              >
                {/* Recapture button */}
                <button
                  onClick={handleRecapture}
                  className="relative px-8 py-3.5 bg-white border border-[#DDE2E9] hover:bg-[#F0F1F5] text-[#525F7A] rounded-[12px] transition-all z-10 flex items-center gap-2.5 font-medium text-[15px]"
                  aria-label="Recapture image"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.33333 10C3.33333 6.3181 6.3181 3.33333 10 3.33333C13.6819 3.33333 16.6667 6.3181 16.6667 10C16.6667 13.6819 13.6819 16.6667 10 16.6667M10 6.66667V10L12.5 12.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Recapture
                </button>
                {/* Download button */}
                <button
                  onClick={handleDownload}
                  className="relative px-8 py-3.5 bg-[#7F53FD] hover:bg-[#6935FD] text-white rounded-[12px] transition-all z-10 flex items-center gap-2.5 font-medium text-[15px]"
                  aria-label="Download image"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 13.3333V3.33333M10 13.3333L6.66667 10M10 13.3333L13.3333 10M3.33333 16.6667H16.6667"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Download
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Only show card component when not capturing */}
              {!isCapturing && (
                <div 
                  style={{ 
                    position: 'relative',
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}
                >
              <SentCard1
                {...cardProps}
                showFooterReminder={false}
                showFooterProgress={false}
                pauseConfetti={pauseConfetti}
                forceHovered={true}
              />
                </div>
              )}
              {/* Show capturing badge when capturing */}
              {isCapturing && (
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%'
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(0, 0, 0, 0.75)',
                    color: 'white',
                      padding: '16px 28px',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: 500,
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  Capturing...
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>,
    document.body
  )
}

export default ShareModal

