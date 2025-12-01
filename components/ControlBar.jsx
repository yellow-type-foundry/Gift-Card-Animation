'use client'

import React, { useMemo, useEffect, useState, useRef } from 'react'
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
  const [isLayoutChipHovered, setIsLayoutChipHovered] = useState(false)
  const layoutSelectorRef = useRef(null)
  const stylePopoverRef = useRef(null)
  const activeChipRef = useRef(null)
  const hoverTimeoutRef = useRef(null)
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 })
  const [popoverVisible, setPopoverVisible] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Attach hover handlers to the active chip
  useEffect(() => {
    if (!layoutSelectorRef.current) return

    const handleChipEnter = () => {
      // Clear any pending hide timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
        hoverTimeoutRef.current = null
      }
      setIsLayoutChipHovered(true)
      // Show popover with slight delay for smoother animation
      setTimeout(() => {
        setPopoverVisible(true)
      }, 50)
    }

    const handleChipLeave = (e) => {
      // Check if mouse is moving to popover
      const popover = stylePopoverRef.current
      if (popover && e.relatedTarget && popover.contains(e.relatedTarget)) {
        return // Don't hide if moving to popover
      }
      
      // Add delay before hiding to allow mouse movement
      hoverTimeoutRef.current = setTimeout(() => {
        setIsLayoutChipHovered(false)
        setPopoverVisible(false)
      }, 150) // 150ms delay
    }

    const handleChipClick = () => {
      // Clear any pending hide timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
        hoverTimeoutRef.current = null
      }
      setIsLayoutChipHovered(true)
      // Show popover immediately on click
      setPopoverVisible(true)
    }

    const updatePopoverPosition = (activeButton, layoutContainer) => {
      const containerRect = layoutContainer.getBoundingClientRect()
      const buttonRect = activeButton.getBoundingClientRect()

      // Position popover above the active chip, centered
      setPopoverPosition({
        top: 0, // Not used since we use bottom: 100%
        left: buttonRect.left - containerRect.left + (buttonRect.width / 2), // Center of chip relative to container
      })
    }

    const updateActiveChip = () => {
      const layoutContainer = layoutSelectorRef.current
      if (!layoutContainer) {
        // If container not found and isSentTab is true, retry after a short delay
        if (isSentTab) {
          setTimeout(() => updateActiveChip(), 50)
        }
        return
      }

      // Wait for next frame to ensure DOM is updated
      requestAnimationFrame(() => {
        // Find the SegmentedControl (it has relative class and contains buttons)
        const segmentedControl = layoutContainer.querySelector('div[class*="relative"]')
        if (!segmentedControl) {
          // If segmented control not found and isSentTab is true, retry after a short delay
          if (isSentTab) {
            setTimeout(() => updateActiveChip(), 50)
          }
          return
        }
        
        const buttons = segmentedControl.querySelectorAll('button')
        const activeIndex = layoutNumber === '1' ? 0 : 1
        const activeButton = buttons[activeIndex]

        if (!activeButton) {
          // If button not found and isSentTab is true, retry after a short delay
          if (isSentTab) {
            setTimeout(() => updateActiveChip(), 50)
          }
          return
        }

        // Remove old handlers if chip changed
        if (activeChipRef.current && activeChipRef.current !== activeButton) {
          activeChipRef.current.removeEventListener('mouseenter', handleChipEnter)
          activeChipRef.current.removeEventListener('mouseleave', handleChipLeave)
          activeChipRef.current.removeEventListener('click', handleChipClick)
        }

        // Add new handlers
        if (activeButton !== activeChipRef.current) {
          activeChipRef.current = activeButton
          activeButton.addEventListener('mouseenter', handleChipEnter)
          activeButton.addEventListener('mouseleave', handleChipLeave)
          activeButton.addEventListener('click', handleChipClick)
        }

        // Update popover position
        updatePopoverPosition(activeButton, layoutContainer)
      })
    }

    updateActiveChip()

    // Update on window resize and when layout changes
    const handleResize = () => {
      if (layoutSelectorRef.current && activeChipRef.current) {
        updatePopoverPosition(activeChipRef.current, layoutSelectorRef.current)
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
      if (activeChipRef.current) {
        activeChipRef.current.removeEventListener('mouseenter', handleChipEnter)
        activeChipRef.current.removeEventListener('mouseleave', handleChipLeave)
        activeChipRef.current.removeEventListener('click', handleChipClick)
      }
    }
  }, [layoutNumber, isSentTab])

  // Show popup when layout changes (after clicking a chip)
  useEffect(() => {
    if (layoutSelectorRef.current) {
      // Wait for DOM to update with new active chip
      requestAnimationFrame(() => {
        const layoutContainer = layoutSelectorRef.current
        if (!layoutContainer) return
        
        // Find the SegmentedControl
        const segmentedControl = layoutContainer.querySelector('div[class*="relative"]')
        if (!segmentedControl) return
        
        const buttons = segmentedControl.querySelectorAll('button')
        const activeIndex = layoutNumber === '1' ? 0 : 1
        const activeButton = buttons[activeIndex]
        
        if (activeButton) {
          // Update position
          const containerRect = layoutContainer.getBoundingClientRect()
          const buttonRect = activeButton.getBoundingClientRect()
          setPopoverPosition({
            top: 0,
            left: buttonRect.left - containerRect.left + (buttonRect.width / 2),
          })
          
          // Show popup after a brief delay
          setTimeout(() => {
            setIsLayoutChipHovered(true)
            setPopoverVisible(true)
          }, 100)
        }
      })
    }
  }, [layoutNumber])

  // Handle popover hover to keep it visible
  const handlePopoverEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    setIsLayoutChipHovered(true)
    setPopoverVisible(true)
  }

  const handlePopoverLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsLayoutChipHovered(false)
      setPopoverVisible(false)
    }, 150)
  }


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
      
      {/* Layout + Style selector - Right side */}
      {isSentTab && (
        <div 
          className="hidden md:flex items-center shrink-0 relative z-10"
        >
          {/* Layout selector */}
          <div ref={layoutSelectorRef}>
            <SegmentedControl
              options={[
                { value: '1', label: 'Layout 1' },
                { value: '2', label: 'Layout 2' }
              ]}
              value={layoutNumber}
              onChange={(value) => onLayoutChange({ target: { value } })}
            />
          </div>
          {/* Style selector - Popover (shown on hover of active chip) */}
          <div
            ref={stylePopoverRef}
            className="absolute bg-white rounded-full shadow-lg border border-[#dde2e9] z-50"
            style={{
              top: '100%',
              left: `${popoverPosition.left}px`,
              transform: `translateX(-50%) translateY(${popoverVisible ? '0' : '-10px'})`,
              marginTop: '8px',
              whiteSpace: 'nowrap',
              opacity: popoverVisible ? 1 : 0,
              pointerEvents: popoverVisible ? 'auto' : 'none',
              transition: 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              padding: '2px', // Even padding on all sides for extended hover area
              marginBottom: '-12px', // Compensate for bottom padding
              marginTop: '4px', // More space for easier mouse movement
              visibility: isLayoutChipHovered ? 'visible' : 'hidden', // Keep mounted but hidden
            }}
            onMouseEnter={handlePopoverEnter}
            onMouseLeave={handlePopoverLeave}
          >
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
                        className="h-10 py-2 pl-4 pr-10 rounded-full border border-[#dde2e9] bg-white text-base font-medium text-[#525F7A] focus:outline-none focus:ring-2 focus:ring-[#5a3dff] focus:ring-offset-0 appearance-none cursor-pointer"
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
                        onClick={() => !isSingleView && onThemingChange(!useColoredBackground)}
                        disabled={isSingleView}
                        className={`h-10 px-4 rounded-full border border-[#dde2e9] text-base font-medium transition-colors focus:outline-none ${
                          useColoredBackground 
                            ? 'bg-[#5a3dff] text-white' 
                            : 'bg-white text-[#525F7A] hover:bg-gray-50'
                        } ${isSingleView ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
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
                          className="h-10 py-2 pl-4 pr-10 rounded-full border border-[#dde2e9] bg-white text-base font-medium text-[#525F7A] focus:outline-none focus:ring-2 focus:ring-[#5a3dff] focus:ring-offset-0 appearance-none cursor-pointer"
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
                        className="h-10 py-2 pl-4 pr-10 rounded-full border border-[#dde2e9] bg-white text-base font-medium text-[#525F7A] focus:outline-none focus:ring-2 focus:ring-[#5a3dff] focus:ring-offset-0 appearance-none cursor-pointer"
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

