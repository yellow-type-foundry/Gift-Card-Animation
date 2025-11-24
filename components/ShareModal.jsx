'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import SentCard1 from '@/components/SentCard1'

function ShareModal({ isOpen, onClose, cardProps, onPauseConfetti, onOpen }) {
  const [pauseConfetti, setPauseConfetti] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [isCapturing, setIsCapturing] = useState(false)
  
  useEffect(() => {
    if (isOpen) {
      console.log('[ShareModal] Modal opened - resetting pause state')
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
      
      // Reset pause state when modal opens
      setPauseConfetti(false)
      
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
        setTimeout(async () => {
          setIsCapturing(true)
          try {
            const response = await fetch('/api/capture-card', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(cardProps),
            })
            
            if (response.ok) {
              const blob = await response.blob()
              const imageUrl = URL.createObjectURL(blob)
              setCapturedImage(imageUrl)
              console.log('[ShareModal] Card captured successfully')
            } else {
              console.error('[ShareModal] Failed to capture card:', await response.text())
            }
          } catch (error) {
            console.error('[ShareModal] Error capturing card:', error)
          } finally {
            setIsCapturing(false)
          }
        }, 500) // Wait 500ms after pause to ensure card is fully rendered
      }, 1400) // ~1400ms = peak eruption
      
      return () => {
        clearTimeout(pauseTimeout)
        document.body.style.overflow = ''
        setPauseConfetti(false)
      }
    } else {
      document.body.style.overflow = ''
      setPauseConfetti(false)
      setCapturedImage(null) // Reset captured image when modal closes
      setIsCapturing(false)
    }
  }, [isOpen, onPauseConfetti, onOpen, cardProps])

  if (!isOpen || !cardProps) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleClose = () => {
    onClose()
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
          width: '512px',
          height: '512px',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'scaleIn 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-lg transition-colors z-10"
          aria-label="Close"
        >
          <svg
            width="16"
            height="16"
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
          className="relative"
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0',
            overflow: 'hidden'
          }}
        >
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured card"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '12px'
              }}
            />
          ) : (
            <>
              <SentCard1
                {...cardProps}
                showFooterReminder={false}
                showFooterProgress={false}
                pauseConfetti={pauseConfetti}
                forceHovered={true}
              />
              {isCapturing && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    zIndex: 1000
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

