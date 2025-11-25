'use client'

import { useEffect, useState } from 'react'
import SentCard1 from '@/components/SentCard1'

export default function CapturePage() {
  const [cardProps, setCardProps] = useState(null)
  const [isReady, setIsReady] = useState(false)
  const [isStatic, setIsStatic] = useState(false)

  useEffect(() => {
    // Get props from URL query params
    const params = new URLSearchParams(window.location.search)
    const propsParam = params.get('props')
    const staticMode = params.get('static') === 'true'
    setIsStatic(staticMode)
    
    if (propsParam) {
      try {
        const props = JSON.parse(decodeURIComponent(propsParam))
        setCardProps(props)
        
        if (staticMode) {
          // Static mode: mark ready immediately (no animation wait)
          setIsReady(true)
        } else {
          // Wait for confetti animation to reach peak (1400ms) then mark as ready
          setTimeout(() => {
            setIsReady(true)
          }, 2000) // Wait 2 seconds for animation to reach peak
        }
      } catch (error) {
        console.error('Error parsing card props:', error)
      }
    }
  }, [])

  if (!cardProps) {
    return (
      <div style={{ 
        width: '720px', 
        height: '540px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'white',
        margin: 0,
        padding: 0
      }}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{
      width: '720px',
      height: '540px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'white',
      margin: 0,
      padding: '24px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 0,
        padding: 0,
        position: 'relative'
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '100%',
          maxHeight: '100%'
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
              pauseConfetti={isStatic} // Disable confetti in static mode
              forceHovered={!isStatic} // Only force hover if not static
            />
          </div>
        </div>
        <style jsx global>{`
          /* Remove all default margins and padding */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 720px;
            height: 540px;
            overflow: hidden;
          }
          /* Make card responsive and proportionally scaled to fit padded area */
          /* Available space after 24px padding: 672px wide x 492px tall */
          /* Card should scale to fit BOTH width and height to ensure 24px padding all sides */
          [data-name="Gift Card"] {
            margin: 0 !important;
            display: block !important;
            /* Scale to fit container - use both width and height constraints */
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
            height: 100% !important;
            min-height: 0 !important;
            max-height: 100% !important;
            /* Maintain aspect ratio while fitting container */
            object-fit: contain;
          }
          /* Override ALL Tailwind responsive width classes */
          @media (min-width: 768px) {
            [data-name="Gift Card"].md\\:w-\\[300px\\] {
              width: 100% !important;
              height: 100% !important;
              min-width: 0 !important;
              max-width: 100% !important;
              min-height: 0 !important;
              max-height: 100% !important;
            }
          }
          /* Override w-full as well */
          [data-name="Gift Card"].w-full {
            width: 100% !important;
            height: 100% !important;
          }
          /* Ensure card content scales proportionally to fill container */
          [data-name="Gift Card"] > div {
            width: 100% !important;
            height: 100% !important;
          }
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
            /* Center the box illustration at the very center of the card */
            position: absolute !important;
            top: 42.5% !important;
            left: 50% !important;
            /* Control box scale: scale(1) = 100%, scale(1.5) = 150%, scale(0.8) = 80%, etc. */
            transform: translate(-50%, -50%) scale(1.25) !important;
            margin: 0 !important;
          }
          /* Also center Gift Container if it exists */
          [data-name="Gift Container"],
          [data-name="Gift Container/Goody"] {
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            /* Control container scale: scale(1) = 100%, scale(1.5) = 150%, scale(0.8) = 80%, etc. */
            transform: translate(-50%, -50%) scale(1) !important;
            margin: 0 !important;
          }
          /* Also center Gift Container if it exists */
          [data-name="Gift Container"],
          [data-name="Gift Container/Goody"] {
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            margin: 0 !important;
          }
        `}</style>
      </div>
      {isReady && (
        <div id="capture-ready" style={{ display: 'none' }}>Ready</div>
      )}
    </div>
  )
}

