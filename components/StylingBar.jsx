'use client'

import React from 'react'

const StylingBar = ({
  isSentTab,
  useColoredBackground,
  onThemingChange,
  animationType,
  onAnimationTypeChange,
  enable3D,
  onEnable3DChange,
  layoutNumber,
  isSingleView,
  style,
  layout2BoxType,
}) => {
  if (!isSentTab) return null

  const showTheming = layoutNumber === '1'
  const showAnimation = (layoutNumber === '2' || (layoutNumber === '1' && style === '2')) && !(layoutNumber === '2' && layout2BoxType === '3') && !(layoutNumber === '1' && style === '3')
  // Show 3D toggle for Box1/Envelope1, Box2/Envelope2, and Box3/Envelope3
  const show3D = (layoutNumber === '2' || (layoutNumber === '1' && (style === '1' || style === '2' || style === '3')) || (layoutNumber === '2' && layout2BoxType === '3'))

  return (
    <div className="w-fit bg-white rounded-full py-4 px-4 transition-all duration-300 ease-in-out">
      <div className="flex items-center overflow-x-auto md:overflow-visible">
        {/* Theming toggle - only show for layout 1 */}
        <div 
          className={`shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
            showTheming 
              ? 'max-w-[200px] opacity-100 mr-4' 
              : 'max-w-0 opacity-0 mr-0 pointer-events-none'
          }`}
        >
          <button
            onClick={() => !isSingleView && onThemingChange(!useColoredBackground)}
            disabled={isSingleView}
            className={`h-10 px-4 rounded-full border border-[#dde2e9] text-base font-medium transition-colors focus:outline-none whitespace-nowrap ${
              useColoredBackground 
                ? 'bg-[#5a3dff] text-white' 
                : 'bg-white text-[#525F7A] hover:bg-gray-50'
            } ${isSingleView ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
            aria-label="Toggle theming"
          >
            Theming
          </button>
        </div>
        
        {/* Animation selector */}
        <div 
          className={`shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
            showAnimation 
              ? 'max-w-[300px] opacity-100 mr-4' 
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
        
        {/* 3D toggle */}
        <div 
          className={`shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
            show3D 
              ? 'max-w-[200px] opacity-100 mr-4' 
              : 'max-w-0 opacity-0 mr-0 pointer-events-none'
          }`}
        >
          <button
            onClick={() => onEnable3DChange(!enable3D)}
            className={`h-10 px-4 rounded-full border border-[#dde2e9] text-base font-medium transition-colors focus:outline-none cursor-pointer whitespace-nowrap ${
              enable3D 
                ? 'bg-[#5a3dff] text-white' 
                : 'bg-white text-[#525F7A] hover:bg-gray-50'
            }`}
            aria-label="Toggle 3D effect"
          >
            3D
          </button>
        </div>
      </div>
    </div>
  )
}

export default React.memo(StylingBar)

