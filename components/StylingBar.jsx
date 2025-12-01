'use client'

import React from 'react'

const StylingBar = ({
  isSentTab,
  animationType,
  onAnimationTypeChange,
  layoutNumber,
  style,
  layout2BoxType,
}) => {
  if (!isSentTab) return null

  const showAnimation = (layoutNumber === '1' && style === '2') || (layoutNumber === '2' && layout2BoxType === '2')

  return (
    <div className="w-fit bg-white rounded-full py-2 px-2 transition-all duration-300 ease-in-out">
      <div className="flex items-center overflow-x-auto md:overflow-visible">
        {/* Animation selector */}
        <div 
          className={`shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
            showAnimation 
              ? 'max-w-[300px] opacity-100' 
              : 'max-w-0 opacity-0 mr-0 pointer-events-none'
          }`}
        >
          <div className="relative inline-block">
            <select
              id="animation-select"
              value={animationType}
              onChange={(e) => onAnimationTypeChange(e.target.value)}
              className="h-10 py-2 pl-4 pr-10 rounded-full border border-[#dde2e9] bg-white text-base font-medium text-[#525F7A] focus:outline-none appearance-none cursor-pointer"
            >
              <option value="highlight">Animation: Shimmer</option>
              <option value="breathing">Animation: Breathing</option>
              <option value="none">Animation: None</option>
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="#525F7A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(StylingBar)

