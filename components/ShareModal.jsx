'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import SentCard1 from '@/components/SentCard1'

function ShareModal({ isOpen, onClose, cardProps, onPauseConfetti, onOpen }) {
  const [pauseConfetti, setPauseConfetti] = useState(false)
  
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
        console.log('[ShareModal] 1000ms elapsed - setting pauseConfetti to true')
        setPauseConfetti(true)
        if (onPauseConfetti) {
          onPauseConfetti()
        }
      }, 1400) // ~1000ms = ~60 frames at 60fps, which is peak eruption
      
      return () => {
        clearTimeout(pauseTimeout)
        document.body.style.overflow = ''
        setPauseConfetti(false)
      }
    } else {
      document.body.style.overflow = ''
      setPauseConfetti(false)
    }
  }, [isOpen, onPauseConfetti])

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

        {/* Render actual card component - pixel perfect */}
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
          <SentCard1
            {...cardProps}
            showFooterReminder={false}
            showFooterProgress={false}
            pauseConfetti={pauseConfetti}
            forceHovered={true}
          />
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

