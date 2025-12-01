'use client'

import React, { useRef, useEffect, useState } from 'react'

/**
 * Segmented control component with sliding chip indicator
 * @param {Array} options - Array of { value, label } objects
 * @param {string} value - Currently selected value
 * @param {Function} onChange - Callback when selection changes
 */
const SegmentedControl = ({ options, value, onChange }) => {
  const containerRef = useRef(null)
  const chipRef = useRef(null)
  const [chipStyle, setChipStyle] = useState({ width: 0, height: 0, left: 0 })

  useEffect(() => {
    if (!containerRef.current) return

    const activeIndex = options.findIndex(opt => opt.value === value)
    if (activeIndex === -1) return

    const container = containerRef.current
    const buttons = container.querySelectorAll('button')
    const activeButton = buttons[activeIndex]

    if (!activeButton) return

    const containerRect = container.getBoundingClientRect()
    const buttonRect = activeButton.getBoundingClientRect()

    setChipStyle({
      left: `${buttonRect.left - containerRect.left}px`,
      width: `${buttonRect.width}px`,
      height: `${buttonRect.height}px`,
    })
  }, [value, options])

  return (
    <div 
      ref={containerRef}
      className="relative inline-flex items-center gap-0 p-1 bg-[#f0f1f5] rounded-full"
      style={{ outline: '1px solid #e4e4e7', outlineOffset: '-1px' }}
    >
      {/* Sliding chip indicator */}
      <div
        ref={chipRef}
        className="absolute bg-white rounded-full shadow-sm z-0"
        style={{
          ...chipStyle,
          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
      
      {/* Buttons */}
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            relative z-10 px-5 py-2.5 h-10 rounded-full text-base font-medium transition-colors duration-200
            flex items-center justify-center
            ${value === option.value 
              ? 'text-black' 
              : 'text-[#525F7A]'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default React.memo(SegmentedControl)

