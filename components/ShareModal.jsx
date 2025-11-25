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
      // Reset capture flag and state when modal opens
      hasCapturedRef.current = false
      setPauseConfetti(false)
      setCapturedImage(null)
      setIsCapturing(false)
    } else {
      document.body.style.overflow = ''
      setPauseConfetti(false)
      setCapturedImage(null)
      setIsCapturing(false)
      hasCapturedRef.current = false
    }
    
    return () => {
      document.body.style.overflow = ''
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
    
    // Pause confetti during peak eruption (around frame 50-60, ~1000ms at 60fps)
    // Peak eruption happens during the eruption boost phase (0-63 frames, ~1.05 seconds)
    // We want to pause at the middle/peak of this phase
    const pauseTimeout = setTimeout(() => {
      console.log('[ShareModal] 1400ms elapsed - setting pauseConfetti to true')
      setPauseConfetti(true)
      if (onPauseConfetti) {
        onPauseConfetti()
      }
      
      // Capture the card using server-side Puppeteer after a delay
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
              const response = await fetch('/api/capture-card', {
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
        }, 500) // Wait 500ms after pause to ensure card is fully rendered
        
        return () => {
          clearTimeout(captureTimeout)
        }
      } else {
        console.log('[ShareModal] Capture already initiated, skipping duplicate')
      }
    }, 1400) // ~1400ms = peak eruption
    
    return () => {
      clearTimeout(pauseTimeout)
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
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      style={{
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        className="relative bg-white rounded-[24px] shadow-2xl"
        style={{
          width: '720px',
          height: '540px',
          padding: '12px',
          display: 'flex',
          overflow: 'auto',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'scaleIn 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-lg transition-colors z-10"
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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          {capturedImage ? (
            <>
              <img
                src={capturedImage}
                alt="Captured card"
                style={{
                  position: 'relative',
                  width: '100%',
                  maxHeight: 'calc(100% - 100px)',
                  objectFit: 'contain',
                  borderRadius: '16px',
                  flexShrink: 1
                }}
              />
              {/* Action buttons - only show when image is captured */}
              <div className="relative flex items-center gap-3 mx-auto flex-shrink-0">
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
              {isCapturing && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(0, 0, 0, 0.75)',
                    color: 'white',
                    padding: '16px 28px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: 500,
                    zIndex: 1000,
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  Capturing...
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

