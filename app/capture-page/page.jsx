'use client'

import { useEffect, useState } from 'react'
import SentCard from '@/components/SentCard'

export default function CapturePage() {
  console.log('[CapturePage] Component rendering')
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
        
        console.log('[CapturePage] Props loaded:', {
          staticMode,
          immediateFrame: staticMode ? null : 75,
          forceHovered: !staticMode,
          enableConfetti: true,
          hideEnvelope: true,
          showGiftBoxWhenHidden: true,
          hideProgressBarInBox: true
        })
        
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

  console.log('[CapturePage] State:', { cardProps: !!cardProps, isStatic, isReady })
  
  if (!cardProps) {
    console.log('[CapturePage] No cardProps yet, showing loading...')
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
  
  console.log('[CapturePage] Rendering SentCard with immediateFrame:', isStatic ? null : 75)

  return (
    <div style={{
      width: '720px',
      height: '540px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'white',
      margin: 0,
      padding: 0,  // No padding - card fills entire image
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 0,
        padding: 0,
        position: 'relative',
        overflow: 'hidden'
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
            justifyContent: 'center',
            transform: 'scale(1)',
            transformOrigin: 'center center'
          }}>
            <SentCard
              {...cardProps}
              boxScale={1.25}
              envelopeOffsetY={-20}  // Adjust vertical position: negative = up, positive = down
              sentDate=""  // Hide date stamp, show only sender name
              showFooterReminder={false}
              showFooterProgress={false}
              footerTransparent={true}  // Remove white background from info bar
              hideUnion={true}
              enableConfetti={cardProps.enableConfetti !== undefined ? cardProps.enableConfetti : true}  // Use prop value if provided, else enable for capture
              hideEnvelope={cardProps.hideEnvelope !== undefined ? cardProps.hideEnvelope : true}  // Use prop value if provided (batch cards use Envelope2, not Box2)
              showGiftBoxWhenHidden={cardProps.showGiftBoxWhenHidden !== undefined ? cardProps.showGiftBoxWhenHidden : true}  // Use prop value if provided (batch cards have false, single cards have true)
              hideProgressBarInBox={cardProps.hideProgressBarInBox !== undefined ? cardProps.hideProgressBarInBox : true}  // Use prop value if provided
              centerLogoInBox={cardProps.showGiftBoxWhenHidden && cardProps.hideEnvelope ? true : (cardProps.centerLogoInBox !== undefined ? cardProps.centerLogoInBox : false)}  // Center logo for single card, style B, layout 1 (Box2)
              logoScale={cardProps.showGiftBoxWhenHidden && cardProps.hideEnvelope ? 0.95 : undefined}  // Scale logo to 0.9 for single card, style B, layout 1 (Box2) in captured image
              pauseConfetti={isStatic} // Disable confetti in static mode
              forceHovered={!isStatic} // Only force hover if not static
              immediateFrame={isStatic ? null : 75} // Render confetti at frame 70 (peak eruption)
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
          /* Card sizing - stretch to fill container with flex, no rounded corners on card only */
          [data-name="Gift Card"] {
            margin: 0 !important;
            width: 100% !important;
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            border-radius: 0 !important;
          }
          /* Remove rounded corners from card wrapper, but keep box rounded */
          [data-name="Gift Card"] > div {
            border-radius: 0 !important;
          }
          /* Make card inner content stretch */
          [data-name="Gift Card"] > div {
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            height: 100% !important;
          }
          /* Distribute header, middle (box), and footer evenly */
          [data-name="Gift Card"] [data-name="Header"] {
            flex-shrink: 0 !important;
          }
          [data-name="Gift Card"] [data-name="Envelope"],
          [data-name="Gift Card"] [data-name="Gift Container"] {
            flex: 1 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          [data-name="Gift Card"] [data-name="Footer"] {
            flex-shrink: 0 !important;
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
          /* Box scaling is now controlled by boxScale prop on SentCard */
          /* Gift Container positioning left as default */
          
          /* Dots background - adjust position, size, opacity */
          [data-name="Gift Container"] > div[aria-hidden="true"],
          [data-name="Envelope"] > div[aria-hidden="true"] {
            /* Adjust position: top: 50% is center, increase for lower */
            top: 50% !important;
            /* Adjust size */
            width: 420px !important;
            height: 420px !important;
            /* Adjust opacity: 0 = hidden, 1 = fully visible */
            opacity: 1 !important;
          }
        `}</style>
      </div>
      {isReady && (
        <div id="capture-ready" style={{ display: 'none' }}>Ready</div>
      )}
    </div>
  )
}

