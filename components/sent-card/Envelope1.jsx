import React from 'react'
import { ENVELOPE_DIMENSIONS } from '@/constants/sentCardConstants'

/**
 * Envelope1 SVG component
 */
export default function Envelope1({ ids, baseTintColor, centered = false, containerOffset = 0 }) {
  return (
    <div
      className="absolute"
      style={{
        ...(centered 
          ? { 
              left: '50%', 
              transform: 'translateX(-50%)',
              top: ENVELOPE_DIMENSIONS.base.top,
            }
          : {
              left: containerOffset > 0
                ? `${parseFloat(ENVELOPE_DIMENSIONS.base.left.replace('px', '')) - containerOffset}px`
                : ENVELOPE_DIMENSIONS.base.left,
              top: ENVELOPE_DIMENSIONS.base.top,
            }
        ),
        width: ENVELOPE_DIMENSIONS.base.width,
        height: ENVELOPE_DIMENSIONS.base.height,
        zIndex: 1,
        pointerEvents: 'none'
      }}
      data-name="Base"
      data-node-id="1467:49192"
    >
      {/* Background blur layer */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: 'blur(0px)',
          WebkitBackdropFilter: 'blur(0px)',
          top: '-8px',
          left: '-8px',
          right: '-8px',
          bottom: '-8px',
          pointerEvents: 'none',
          zIndex: 0
        }}
        aria-hidden="true"
      />
      <svg
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
        overflow="visible"
        style={{ display: 'block', position: 'relative', zIndex: 1 }}
        viewBox="0 0 196 219"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter={`url(#${ids.baseFilterId})`}>
          {/* Themed base fill */}
          <path
            d="M0 84.4092C0 80.8407 1.58824 77.4572 4.33359 75.1774L92.6391 1.84547C95.6021 -0.615154 99.8979 -0.615156 102.861 1.84546L191.166 75.1774C193.912 77.4572 195.5 80.8406 195.5 84.4092V206.176C195.5 212.804 190.127 218.176 183.5 218.176H12C5.37259 218.176 0 212.804 0 206.176V84.4092Z"
            fill={baseTintColor}
          />
          {/* Highlight gradient overlay */}
          <path
            d="M0 84.4092C0 80.8407 1.58824 77.4572 4.33359 75.1774L92.6391 1.84547C95.6021 -0.615154 99.8979 -0.615156 102.861 1.84546L191.166 75.1774C193.912 77.4572 195.5 80.8406 195.5 84.4092V206.176C195.5 212.804 190.127 218.176 183.5 218.176H12C5.37259 218.176 0 212.804 0 206.176V84.4092Z"
            fill={`url(#${ids.baseGradient1Id})`}
            fillOpacity="0.5"
          />
          <path
            d="M92.7988 2.03769C95.6693 -0.345946 99.8307 -0.345947 102.701 2.03769L191.007 75.3697C193.695 77.602 195.25 80.9148 195.25 84.4088V206.176C195.25 212.666 189.989 217.926 183.5 217.926H12C5.51072 217.926 0.250108 212.666 0.25 206.176V84.4088C0.250125 80.9148 1.80517 77.602 4.49316 75.3697L92.7988 2.03769Z"
            stroke={`url(#${ids.baseGradient2Id})`}
            strokeOpacity="0.8"
            strokeWidth="0.5"
          />
        </g>
        <defs>
          <filter
            id={ids.baseFilterId}
            x="-8"
            y="-8"
            width="211.5"
            height="334.176"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="0" />
            <feGaussianBlur stdDeviation="5" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.95 0" />
            <feBlend mode="normal" in2="shape" result="effect1_innerShadow" />
          </filter>
          <linearGradient
            id={ids.baseGradient1Id}
            x1="90"
            y1="100"
            x2="90"
            y2="-200"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" />
            <stop offset="1" stopColor="grey" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient
            id={ids.baseGradient2Id}
            x1="97"
            y1="10"
            x2="97"
            y2="131"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="0.6" stopColor="white" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

