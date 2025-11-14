import React from 'react'
import giftBoxImage from '../assets/Pattern-Unpacked.png'

const GiftBoxIllustrationPatternUnpacked = ({ className, style = "02" }) => {
  if (style === "02") {
    return (
      <div className={className} style={{ position: 'relative' }}>
        <img 
          src={giftBoxImage} 
          alt="Gift box" 
          className="w-full h-full object-contain"
          style={{ 
            width: '100%', 
            height: '100%',
            objectFit: 'contain'
          }}
        />
      </div>
    )
  }
  
  return null
}

export default GiftBoxIllustrationPatternUnpacked

