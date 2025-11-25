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
      padding: 0,
      overflow: 'hidden'
    }}>
      <div style={{
        width: '720px',
        height: '540px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 0,
        padding: 0,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <SentCard1
          {...cardProps}
          boxScale={1.3}
          showFooterReminder={false}
          showFooterProgress={false}
          pauseConfetti={isStatic} // Disable confetti in static mode
          forceHovered={!isStatic} // Only force hover if not static
        />
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
          /* Make SentCard1 fill the entire capture area - override default 300px width */
          /* Scale card from 300px to 720px = 2.4x scale */
          [data-name="Gift Card"] {
            width: 300px !important;
            height: auto !important;
            transform: scale(2.4) !important;
            transform-origin: center center !important;
            margin: 0 !important;
          }
          /* Ensure the scaled card fits within 720x540 */
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
          }
        `}</style>
      </div>
      {isReady && (
        <div id="capture-ready" style={{ display: 'none' }}>Ready</div>
      )}
    </div>
  )
}

