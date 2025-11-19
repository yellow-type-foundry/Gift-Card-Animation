'use client'

import React, { useMemo, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import TabButton from '@/components/TabButton'

const ControlBar = ({
  activeTab,
  onTabChange,
  onShuffle,
  // Gift Sent specific props
  isSentTab,
  useColoredBackground,
  onThemingChange,
  layoutNumber,
  onLayoutChange,
  viewType,
  onViewChange,
  isSingleView,
  showSettingsMenu,
  onSettingsMenuToggle
}) => {
  const handleGiftTab = () => onTabChange('gift')
  const handleSentTab = () => onTabChange('sent')

  const handleViewChange = (e) => {
    const value = e.target.value
    onViewChange(value)
  }

  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const controlBarStyle = useMemo(() => ({
    WebkitOverflowScrolling: 'touch',
    height: '40px',
    maxWidth: '1272px',
    marginLeft: 'auto',
    marginRight: 'auto'
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

  const viewSelectStyle = useMemo(() => ({
    width: 'auto',
    minWidth: '100px'
  }), [])

  return (
    <div
      className="w-full flex items-center justify-center gap-4 mb-6 overflow-x-auto md:overflow-visible whitespace-nowrap px-5 md:px-0"
      style={controlBarStyle}
    >
      {/* Tabs - Centered */}
      <div className="flex items-center gap-2 shrink-0">
        <TabButton
          label="Gift Received"
          isActive={activeTab === 'gift'}
          onClick={handleGiftTab}
        />
        <TabButton
          label="Gift Sent"
          isActive={activeTab === 'sent'}
          onClick={handleSentTab}
        />
      </div>
      
      {/* Controls - Right side */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Gift Sent specific controls */}
        {isSentTab && (
        <>
          {/* Desktop: Theming and Layout controls - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-6 shrink-0">
            {/* Theming toggle */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#525F7A]">Theming</span>
              <button
                onClick={() => !isSingleView && onThemingChange(!useColoredBackground)}
                disabled={isSingleView}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5a3dff] focus:ring-offset-2 ${
                  useColoredBackground ? 'bg-[#5a3dff]' : 'bg-gray-300'
                } ${isSingleView ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
                role="switch"
                aria-checked={useColoredBackground}
                aria-disabled={isSingleView}
                aria-label="Toggle theming"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    useColoredBackground ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {/* Layout dropdown */}
            <div className="flex items-center gap-3">
              <label htmlFor="layout-select" className="text-sm text-[#525F7A]">Layout</label>
              <div className="relative inline-block">
                <select
                  id="layout-select"
                  value={layoutNumber}
                  onChange={onLayoutChange}
                  className="py-2 pl-3 pr-8 rounded-[12px] border border-[#dde2e9] bg-white text-sm text-[#525F7A] focus:outline-none focus:ring-2 focus:ring-[#5a3dff] focus:ring-offset-0 appearance-none cursor-pointer"
                  style={selectStyle}
                >
                  <option value="1">Layout 1</option>
                  <option value="2">Layout 2</option>
                  <option value="3">Layout 3</option>
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="#525F7A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
            {/* View selector */}
            <div className="flex items-center gap-3">
              <label htmlFor="view-select" className="text-sm text-[#525F7A]">View</label>
              <div className="relative inline-block">
                <select
                  id="view-select"
                  value={viewType}
                  onChange={handleViewChange}
                  className="py-2 pl-3 pr-8 rounded-[12px] border border-[#dde2e9] bg-white text-sm text-[#525F7A] focus:outline-none focus:ring-2 focus:ring-[#5a3dff] focus:ring-offset-0 appearance-none cursor-pointer"
                  style={viewSelectStyle}
                >
                  <option value="mixed">Mixed</option>
                  <option value="batch">Batch</option>
                  <option value="single">Single</option>
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="#525F7A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
        </>
        )}
      </div>
      
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
                className="md:hidden fixed right-6 bottom-24 w-64 bg-white rounded-[12px] border border-[#dde2e9] shadow-lg p-4 settings-menu-enter"
                style={menuStyle}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                <div className="space-y-4">
                  {/* Shuffle button */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#525F7A]">Shuffle</span>
                    <button
                      onClick={() => {
                        onShuffle()
                        onSettingsMenuToggle(false)
                      }}
                      className="px-3 py-1.5 rounded-[12px] border border-[#dde2e9] bg-white text-sm text-[#525F7A] hover:bg-gray-50 active:bg-gray-100 transition-colors focus:outline-none flex items-center justify-center"
                      aria-label="Shuffle cards"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L14 4L12 6M2 4H14M4 10L2 12L4 14M14 12H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  {/* Theming toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#525F7A]">Theming</span>
                    <button
                      onClick={() => !isSingleView && onThemingChange(!useColoredBackground)}
                      disabled={isSingleView}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5a3dff] focus:ring-offset-2 ${
                        useColoredBackground ? 'bg-[#5a3dff]' : 'bg-gray-300'
                      } ${isSingleView ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
                      role="switch"
                      aria-checked={useColoredBackground}
                      aria-disabled={isSingleView}
                      aria-label="Toggle theming"
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          useColoredBackground ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  {/* Layout dropdown */}
                  <div className="flex items-center justify-between">
                    <label htmlFor="layout-select-mobile" className="text-sm text-[#525F7A]">Layout</label>
                    <div className="relative inline-block">
                      <select
                        id="layout-select-mobile"
                        value={layoutNumber}
                        onChange={onLayoutChange}
                        className="py-2 pl-3 pr-8 rounded-[12px] border border-[#dde2e9] bg-white text-sm text-[#525F7A] focus:outline-none focus:ring-2 focus:ring-[#5a3dff] focus:ring-offset-0 appearance-none cursor-pointer"
                        style={selectStyle}
                      >
                        <option value="1">Layout 1</option>
                        <option value="2">Layout 2</option>
                        <option value="3">Layout 3</option>
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 4.5L6 7.5L9 4.5" stroke="#525F7A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  {/* View selector */}
                  <div className="flex items-center justify-between">
                    <label htmlFor="view-select-mobile" className="text-sm text-[#525F7A]">View</label>
                    <div className="relative inline-block">
                      <select
                        id="view-select-mobile"
                        value={viewType}
                        onChange={handleViewChange}
                        className="py-2 pl-3 pr-8 rounded-[12px] border border-[#dde2e9] bg-white text-sm text-[#525F7A] focus:outline-none focus:ring-2 focus:ring-[#5a3dff] focus:ring-offset-0 appearance-none cursor-pointer"
                        style={viewSelectStyle}
                      >
                        <option value="mixed">Mixed</option>
                        <option value="batch">Batch</option>
                        <option value="single">Single</option>
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
  )
}

export default React.memo(ControlBar)

