'use client'

import React, { useMemo, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import SegmentedControl from '@/components/SegmentedControl'

const ControlBar = ({
  activeTab,
  onTabChange,
  onShuffle,
  // Gift Sent specific props
  isSentTab,
  useColoredBackground,
  onThemingChange,
  animationType,
  onAnimationTypeChange,
  enable3D,
  onEnable3DChange,
  layoutNumber,
  onLayoutChange,
  viewType,
  onViewChange,
  isSingleView,
  showSettingsMenu,
  onSettingsMenuToggle,
  style,
  onStyleChange,
  layout2BoxType = '2',
  onLayout2BoxTypeChange = () => {}
}) => {

  const handleViewChange = (e) => {
    const value = e.target.value
    onViewChange(value)
  }

  const handleAnimationChange = (e) => {
    const value = e.target.value
    onAnimationTypeChange(value)
  }

  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])


  const controlBarStyle = useMemo(() => ({
    WebkitOverflowScrolling: 'touch',
    height: '40px',
    width: '100%'
  }), [])

  const mobileSettingsButtonStyle = useMemo(() => ({
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent'
  }), [])

  const backdropStyle = useMemo(() => ({
    zIndex: 9998
  }), [])

  const menuStyle = useMemo(() => ({
    zIndex: 9999
  }), [])

  const selectStyle = useMemo(() => ({
    width: 'auto',
    minWidth: '80px'
  }), [])


  return (
    <div className="w-full bg-white rounded-full p-4">
      <div
        className="w-full flex items-center justify-between overflow-x-auto md:overflow-visible whitespace-nowrap relative"
        style={controlBarStyle}
      >
      {/* Tabs - Left side */}
      <div className="flex items-center shrink-0">
        <SegmentedControl
          options={[
            { value: 'gift', label: 'Received' },
            { value: 'sent', label: 'Sent' }
          ]}
          value={activeTab}
          onChange={onTabChange}
        />
      </div>
      
      {/* Style selector - Center */}
      {isSentTab && (
        <div className="hidden md:flex items-center justify-center flex-1">
          <SegmentedControl
            options={[
              { value: '1', label: 'Style 1' },
              { value: '2', label: 'Style 2' },
              { value: '3', label: 'Style 3' }
            ]}
            value={layoutNumber === '1' ? style : layout2BoxType}
            onChange={layoutNumber === '1' ? onStyleChange : onLayout2BoxTypeChange}
          />
        </div>
      )}
      
      {/* Layout selector - Right side */}
      {isSentTab && (
        <div className="hidden md:flex items-center shrink-0">
          <SegmentedControl
            options={[
              { value: '1', label: 'Layout 1' },
              { value: '2', label: 'Layout 2' }
            ]}
            value={layoutNumber}
            onChange={(value) => onLayoutChange({ target: { value } })}
          />
        </div>
      )}
      
      {/* Mobile: Floating Settings Button - Bottom Right */}
      {isSentTab && isMounted && createPortal(
        <>
          <button
            type="button"
            id="settings-button-mobile"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onSettingsMenuToggle(!showSettingsMenu)
            }}
            onTouchStart={(e) => {
              e.stopPropagation()
            }}
            className="md:hidden fixed bottom-6 right-6 w-12 h-12 rounded-full border border-[#dde2e9] bg-white text-[#525F7A] hover:bg-gray-50 active:bg-gray-100 transition-colors focus:outline-none flex items-center justify-center touch-manipulation shadow-lg settings-button-enter"
            style={{ ...mobileSettingsButtonStyle, zIndex: 9997 }}
            aria-label="Settings"
          >
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.5 8C13.5 7.5 13.5 7.5 13 7.5C12.5 7.5 12.5 7.5 12.5 8C12.5 8.5 12.5 8.5 13 8.5C13.5 8.5 13.5 8.5 13.5 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.5 8C3.5 7.5 3.5 7.5 3 7.5C2.5 7.5 2.5 7.5 2.5 8C2.5 8.5 2.5 8.5 3 8.5C3.5 8.5 3.5 8.5 3.5 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 3.5C8 3 8 3 7.5 3C7 3 7 3 7 3.5C7 4 7 4 7.5 4C8 4 8 4 8 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 12.5C8 12 8 12 7.5 12C7 12 7 12 7 12.5C7 13 7 13 7.5 13C8 13 8 13 8 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {/* Mobile Settings Menu Dropdown */}
          {showSettingsMenu && (
            <>
              {/* Backdrop */}
              <div 
                className="md:hidden fixed inset-0 bg-black/20"
                style={backdropStyle}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onSettingsMenuToggle(false)
                }}
                onTouchStart={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onSettingsMenuToggle(false)
                }}
              />
              {/* Menu */}
              <div 
                className="md:hidden fixed right-6 bottom-24 w-64 bg-white rounded-full border border-[#dde2e9] shadow-lg p-4 settings-menu-enter"
                style={menuStyle}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                <div className="space-y-4">
                  {/* Layout selector - Mobile only */}
                  <div className="flex items-center justify-between">
                    <div className="relative inline-block">
                      <select
                        id="layout-select-mobile"
                        value={layoutNumber}
                        onChange={onLayoutChange}
                        className="h-10 py-2 pl-4 pr-10 rounded-full border border-[#dde2e9] bg-white text-base font-medium text-[#525F7A] focus:outline-none appearance-none cursor-pointer"
                        style={selectStyle}
                      >
                        <option value="1">Layout: Layout 1</option>
                        <option value="2">Layout: Layout 2</option>
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 4.5L6 7.5L9 4.5" stroke="#525F7A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                    {/* Style selector */}
                    <div className="flex items-center justify-between">
                      <span className="text-base text-[#525F7A] font-medium">Style</span>
                      <SegmentedControl
                        options={[
                          { value: '1', label: 'Style 1' },
                          { value: '2', label: 'Style 2' },
                          { value: '3', label: 'Style 3' }
                        ]}
                        value={layoutNumber === '1' ? style : layout2BoxType}
                        onChange={layoutNumber === '1' ? onStyleChange : onLayout2BoxTypeChange}
                      />
                    </div>
                  {/* Theming toggle - only show for layout 1 */}
                  {layoutNumber === '1' && (
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => onThemingChange(!useColoredBackground)}
                        className={`h-10 px-4 rounded-full border border-[#dde2e9] text-base font-medium transition-colors focus:outline-none cursor-pointer ${
                          useColoredBackground 
                            ? 'bg-[#5a3dff] text-white' 
                            : 'bg-white text-[#525F7A] hover:bg-gray-50'
                        }`}
                        aria-label="Toggle theming"
                      >
                        Theming
                      </button>
                    </div>
                  )}
                  {/* Animation selector - only show for layout 2 (hide when Box 3 is selected) */}
                  {layoutNumber === '2' && layout2BoxType !== '3' && (
                    <div className="flex items-center justify-between">
                      <div className="relative inline-block">
                        <select
                          id="animation-select-mobile"
                          value={animationType}
                          onChange={handleAnimationChange}
                          className="h-10 py-2 pl-4 pr-10 rounded-full border border-[#dde2e9] bg-white text-base font-medium text-[#525F7A] focus:outline-none appearance-none cursor-pointer"
                        >
                          <option value="highlight">Animation: Shimmer</option>
                          <option value="breathing">Animation: Breathing</option>
                          <option value="none">Animation: None</option>
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 4.5L6 7.5L9 4.5" stroke="#525F7A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* 3D toggle - show for layout 2 (including Box 3) and layout 1 style 1/2/3 */}
                  {((layoutNumber === '2') || (layoutNumber === '1' && (style === '1' || style === '2' || style === '3'))) && (
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => onEnable3DChange(!enable3D)}
                        className={`h-10 px-4 rounded-full border border-[#dde2e9] text-base font-medium transition-colors focus:outline-none cursor-pointer ${
                          enable3D 
                            ? 'bg-[#5a3dff] text-white' 
                            : 'bg-white text-[#525F7A] hover:bg-gray-50'
                        }`}
                        aria-label="Toggle 3D effect"
                      >
                        3D
                      </button>
                    </div>
                  )}
                  {/* View selector */}
                  <div className="flex items-center justify-between">
                    <div className="relative inline-block">
                      <select
                        id="view-select-mobile"
                        value={viewType}
                        onChange={handleViewChange}
                        className="h-10 py-2 pl-4 pr-10 rounded-full border border-[#dde2e9] bg-white text-base font-medium text-[#525F7A] focus:outline-none appearance-none cursor-pointer"
                      >
                        <option value="mixed">View: Mixed</option>
                        <option value="batch">View: Batch</option>
                        <option value="single">View: Single</option>
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 4.5L6 7.5L9 4.5" stroke="#525F7A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>,
        document.body
      )}
      </div>
    </div>
  )
}

export default React.memo(ControlBar)

