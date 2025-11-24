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
        
        // Wait for confetti animation to reach peak (1400ms) then mark as ready
        setTimeout(() => {
          setIsReady(true)
        }, 2000) // Wait 2 seconds for animation to reach peak
      } catch (error) {
        console.error('Error parsing card props:', error)
      }
    }
  }, [])

  if (!cardProps) {
    return (
      <div style={{ 
        width: '512px', 
        height: '512px', 
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
      width: '512px',
      height: '512px',
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
          showFooterReminder={false}
          showFooterProgress={false}
          pauseConfetti={false} // Let it animate, Puppeteer will wait for peak
          forceHovered={true} // Force hover to start confetti
        />
      </div>
      {isReady && (
        <div id="capture-ready" style={{ display: 'none' }}>Ready</div>
      )}
    </div>
  )
}

