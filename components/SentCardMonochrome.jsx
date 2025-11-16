'use client'

import React from 'react'
import SentCard from './SentCard'

// Monochrome variant: fixed header background (no theming) and dark header text (handled by SentCard when override is provided)
export default function SentCardMonochrome(props) {
  return <SentCard {...props} headerBgOverride="#E3E7ED" />
}


