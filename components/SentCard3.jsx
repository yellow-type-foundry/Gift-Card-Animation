'use client'

import React from 'react'
import SentCard1 from './SentCard1'

// SentCard (3): same as SentCard (2) with additional styling options
export default function SentCard3(props) {
  return <SentCard1
    {...props}
    headerBgOverride="#E3E7ED"
    hideUnion={true}
    footerPadEqual={true}
    footerTopPadding={20}
    footerBottomPadding={24}
    envelopeScale={0.9}
    envelopeOffsetY={6}
    confettiWhiteOverlay={true}
    envelopeHighZ={true}
    overlayProgressOnEnvelope={true}
    showFooterProgress={false}
    // Ensure reminder button shows in footer even if progress hidden
    showFooterReminder={true}
  />
}

