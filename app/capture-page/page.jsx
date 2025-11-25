'use client'

import { useEffect, useState } from 'react'
import SentCard1 from '@/components/SentCard1'

export default function CapturePage() {
  const [cardProps, setCardProps] = useState(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Get props from URL query params
    const params = new URLSearchParams(window.location.search)
    const propsParam = params.get('props')
    
    if (propsParam) {
      try {
        const props = JSON.parse(decodeURIComponent(propsParam))
        setCardProps(props)
        
        // Mark as ready immediately for Puppeteer, then update after animation
        setIsReady(true)
        
        // Wait for confetti animation to reach peak (1400ms) then update ready state
        // This allows Puppeteer to detect the page is ready, but we still wait for animation
        setTimeout(() => {
          // Update ready state (triggers re-render but selector already exists)
          setIsReady(true)
        }, 2000) // Wait 2 seconds for animation to reach peak
      } catch (error) {
        console.error('Error parsing card props:', error)
        // Still mark as ready even on error so Puppeteer doesn't timeout
        setIsReady(true)
      }
    } else {
      // No props - mark as ready anyway
      setIsReady(true)
    }
  }, [])

  return (
    <>
      {/* CRITICAL: This must be in the initial HTML before React hydrates */}
      {/* Puppeteer needs to find this element immediately */}
      <div id="capture-ready" style={{ display: 'none', position: 'absolute' }}>Ready</div>
      
      {!cardProps ? (
        <div style={{ 
          width: '720px', 
          height: '540px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'white'
        }}>
          Loading...
        </div>
      ) : (
        <div style={{
          width: '720px',
          height: '540px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'white',
          padding: '24px'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <SentCard1
              {...cardProps}
              boxScale={1.3}
              showFooterReminder={false}
              showFooterProgress={false}
              pauseConfetti={false} // Let it animate, Puppeteer will wait for peak
              forceHovered={true} // Force hover to start confetti
            />
            <style jsx global>{`
              /* Hide progress bar and center gift info in capture */
              [data-name="InfoBarContent"] {
                gap: 0 !important;
                padding-bottom: 16px !important;
              }
              /* Hide progress bar container */
              [data-name="ProgressSlot"] {
                display: none !important;
              }
              /* Hide reminder bar container */
              [data-name="ReminderBar"] {
                display: none !important;
              }
              /* Remove minHeight from progress/reminder slot container when both are hidden */
              [data-name="InfoBarContent"] > div.relative {
                min-height: 0 !important;
              }
              /* Center gift info block */
              [data-name="Gift Message"] {
                align-items: center !important;
                text-align: center !important;
                margin: 0 auto !important;
              }
              /* Reduce footer bottom padding to remove extra space */
              [data-node-id="1467:49205"] {
                padding-bottom: 0 !important;
              }
              /* Ensure box/envelope container stays behind union shape (z-index 25) */
              [data-name="Envelope"],
              [data-name="Gift Container"] {
                z-index: 20 !important;
              }
              /* Ensure gift box container stays behind union shape */
              [data-name="Gift Container/Goody"] {
                z-index: 20 !important;
              }
              [data-name="Box"] {
                z-index: 1 !important;
              }
            `}</style>
          </div>
        </div>
      )}
    </>
  )
}
