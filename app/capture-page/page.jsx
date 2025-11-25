'use client'

import { useEffect, useState } from 'react'
import SentCard1 from '@/components/SentCard1'

export default function CapturePage() {
  const [cardProps, setCardProps] = useState(null)

  useEffect(() => {
    // Get props from URL query params
    const params = new URLSearchParams(window.location.search)
    const propsParam = params.get('props')
    
    if (propsParam) {
      try {
        const props = JSON.parse(decodeURIComponent(propsParam))
        setCardProps(props)
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
        background: 'white'
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
          pauseConfetti={false}
          forceHovered={true}
          pauseAtFrame={180} // Pause at frame 180 (~3000ms at 60fps = well after peak, maximum particles visible)
        />
        <style jsx global>{`
          /* CRITICAL: Pause ALL CSS animations and transitions in capture mode */
          /* Only confetti animation (JavaScript-controlled) should run - everything else is frozen */
          *,
          *::before,
          *::after {
            animation-play-state: paused !important;
            animation-duration: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
          }
          
          /* Exception: Confetti canvas elements (they're controlled by JavaScript, not CSS) */
          canvas {
            animation-play-state: running !important;
            animation-duration: unset !important;
          }
          
          [data-name="InfoBarContent"] {
            gap: 0 !important;
            padding-bottom: 16px !important;
          }
          [data-name="ProgressSlot"] {
            display: none !important;
          }
          [data-name="ReminderBar"] {
            display: none !important;
          }
          [data-name="InfoBarContent"] > div.relative {
            min-height: 0 !important;
          }
          [data-name="Gift Message"] {
            align-items: center !important;
            text-align: center !important;
            margin: 0 auto !important;
          }
          [data-node-id="1467:49205"] {
            padding-bottom: 0 !important;
          }
          /* Canvas layers: Back z-index 1, Box z-index 2, Front z-index 4-5 */
          /* Ensure box is between back and front canvas layers */
          /* For Layout 0: Blur canvases z-index 3, Front canvas z-index 4 */
          /* For Layout 1: Back canvas z-index 1, Front canvas z-index 5 */
          [data-name="Envelope"],
          [data-name="Gift Container"] {
            z-index: 2 !important;
          }
          [data-name="Gift Container/Goody"] {
            z-index: 2 !important;
          }
          [data-name="Box"] {
            z-index: 2 !important;
          }
        `}</style>
      </div>
    </div>
  )
}
