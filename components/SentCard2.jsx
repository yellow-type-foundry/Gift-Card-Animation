'use client'

import React from 'react'
import SentCard1 from './SentCard1'

// SentCard (2): fixed header background (no theming) and dark header text (handled by SentCard1 when override is provided)
export default function SentCard2(props) {
  return <SentCard1 {...props} headerBgOverride="#E3E7ED" />
}

