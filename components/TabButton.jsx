import React from 'react'

/**
 * Reusable tab button component
 * @param {string} label - The text to display on the button
 * @param {boolean} isActive - Whether this tab is currently active
 * @param {Function} onClick - Click handler function
 */
const TabButton = ({ label, isActive, onClick }) => {
  const baseClasses = 'px-4 py-2 rounded-[12px] outline outline-1 outline-offset-[-1px] shrink-0 text-sm'
  const activeClasses = 'bg-white outline-zinc-300 text-black'
  const inactiveClasses = 'bg-[#f0f1f5] outline-zinc-200 text-[#525F7A]'
  
  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {label}
    </button>
  )
}

export default React.memo(TabButton)

