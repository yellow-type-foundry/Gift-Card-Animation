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
  viewType,
  onViewChange,
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
    <div className="w-full bg-white rounded-full p-4">
      <div className="w-full flex items-center justify-between gap-4 overflow-x-auto md:overflow-visible">
        {/* Theming toggle - only show for layout 1 */}
        {showTheming && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-base text-[#525F7A] font-medium">Theming</span>
            <button
              onClick={() => !isSingleView && onThemingChange(!useColoredBackground)}
              disabled={isSingleView}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5a3dff] focus:ring-offset-2 ${
                useColoredBackground ? 'bg-[#5a3dff]' : 'bg-gray-300'
              } ${isSingleView ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
              role="switch"
              aria-checked={useColoredBackground}
              aria-disabled={isSingleView}
              aria-label="Toggle theming"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  useColoredBackground ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}
        
        {/* Animation selector */}
        {showAnimation && (
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative inline-block">
              <select
                id="animation-select"
                value={animationType}
                onChange={onAnimationTypeChange}
                className="h-10 py-2 pl-4 pr-10 rounded-full border border-[#dde2e9] bg-white text-base font-medium text-[#525F7A] focus:outline-none focus:ring-2 focus:ring-[#5a3dff] focus:ring-offset-0 appearance-none cursor-pointer"
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
        )}
        
        {/* 3D toggle */}
        {show3D && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-base text-[#525F7A] font-medium">3D</span>
            <button
              onClick={() => onEnable3DChange(!enable3D)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5a3dff] focus:ring-offset-2 ${
                enable3D ? 'bg-[#5a3dff]' : 'bg-gray-300'
              } cursor-pointer`}
              role="switch"
              aria-checked={enable3D}
              aria-label="Toggle 3D effect"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  enable3D ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}
        
        {/* View selector */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <div className="relative inline-block">
            <select
              id="view-select"
              value={viewType}
              onChange={(e) => onViewChange(e.target.value)}
              className="h-10 py-2 pl-4 pr-10 rounded-full border border-[#dde2e9] bg-white text-base font-medium text-[#525F7A] focus:outline-none focus:ring-2 focus:ring-[#5a3dff] focus:ring-offset-0 appearance-none cursor-pointer"
            >
              <option value="mixed">View: Mixed</option>
              <option value="batch">View: Batch</option>
              <option value="single">View: Single</option>
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

