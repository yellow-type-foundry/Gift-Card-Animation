'use client'

import React from 'react'
import SentCard from './SentCard'

// Monochrome2 variant: same as Monochrome with fixed header BG and dark header text
export default function SentCardMonochrome2(props) {
  return <SentCard {...props} headerBgOverride="#E3E7ED" />
}


