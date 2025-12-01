import React from 'react'
import { ENVELOPE_DIMENSIONS } from '@/constants/sentCardConstants'

/**
 * Card Shape (hexagon) SVG component
 */
export default function CardShape({ ids, base2TintColor, centered = false, containerOffset = 0 }) {
  return (
    <div
      className="absolute"
      style={{
        ...(centered
          ? {
              left: '50%',
              transform: 'translateX(-50%)',
              top: ENVELOPE_DIMENSIONS.cardShape.top,
            }
          : {
              left: containerOffset > 0
                ? `${parseFloat(ENVELOPE_DIMENSIONS.cardShape.left.replace('px', '')) - containerOffset}px`
                : ENVELOPE_DIMENSIONS.cardShape.left,
              top: ENVELOPE_DIMENSIONS.cardShape.top,
            }
        ),
        width: ENVELOPE_DIMENSIONS.cardShape.width,
        height: ENVELOPE_DIMENSIONS.cardShape.height,
        zIndex: 2,
        pointerEvents: 'none'
      }}
      data-node-id="1467:49194"
    >
      {/* Card shape overlay (hexagon shape) with inset wrapper */}
      <div
        className="absolute"
        style={{
          left: '1.64%',
          top: '1.23%',
          right: '1.64%',
          bottom: '1.23%',
          position: 'absolute'
        }}
      >
        <svg
          preserveAspectRatio="none"
          width="100%"
          height="100%"
          overflow="visible"
          style={{ display: 'block' }}
          viewBox="0 0 171 143"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter={`url(#${ids.cardFilterId})`}>
            <path
              d="M81.2603 1.38519L1.84066 67.3763C-0.613553 69.4155 -0.613553 73.1822 1.84066 75.2214L81.2603 141.213C83.4831 143.059 86.7066 143.059 88.9294 141.213L168.349 75.2214C170.803 73.1822 170.803 69.4155 168.349 67.3763L88.9294 1.38519C86.7066 -0.461729 83.4831 -0.461731 81.2603 1.38519Z"
              fill={base2TintColor}
              fillOpacity="0.2"
            />
          </g>
          <defs>
            <filter
              id={ids.cardFilterId}
              x="-40"
              y="-40"
              width="260"
              height="220"
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
              <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.65 0" />
              <feBlend mode="normal" in2="shape" result="effect1_innerShadow" />
              {/* White outer drop shadows */}
              <feDropShadow in="SourceGraphic" dx="0" dy="8" stdDeviation="3" floodColor="#FFFFFF" floodOpacity="1" result="cardOuterShadow1" />
              <feDropShadow in="SourceGraphic" dx="0" dy="8" stdDeviation="3" floodColor="#FFFFFF" floodOpacity="1" result="cardOuterShadow2" />
              <feMerge>
                <feMergeNode in="cardOuterShadow1" />
                <feMergeNode in="cardOuterShadow2" />
                <feMergeNode in="effect1_innerShadow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient
              id={ids.cardGradientId}
              x1="85"
              y1="-0.7"
              x2="85"
              y2="152"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="white" />
              <stop offset="1" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}

