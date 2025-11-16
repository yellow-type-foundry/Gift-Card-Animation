'use client'

import React from 'react'
import SentCard from './SentCard'

// Monochrome2 variant: same as Monochrome with fixed header BG and dark header text
export default function SentCardMonochrome2(props) {
  return <SentCard
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


