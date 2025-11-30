import React from 'react'
import Image from 'next/image'
import { BOX_WIDTH, BOX_HEIGHT } from '@/constants/layout3Tokens'

const EnvelopeLayers = ({ coverImage, baseColor, isHovered = false }) => {
  // Paper dimensions from Figma
  const PAPER_WIDTH = 156
  const PAPER_HEIGHT = 64
  const PAPER_HEIGHT_HOVER = 84
  const PAPER_TOP_OFFSET = BOX_HEIGHT - PAPER_HEIGHT // Positioned at bottom
  const CELL_SIZE = 32.091
  const CELL_GAP = 4.459 // 36.55 - 32.091
  const CELL_OPACITY = 0.5

  // Calculate cell color from base color (lightened)
  const cellColor = baseColor || '#c6e7fa'
  
  // Paper height based on hover state
  const currentPaperHeight = isHovered ? PAPER_HEIGHT_HOVER : PAPER_HEIGHT

  return (
    <>
      {/* NEW-Back Shadow */}
      <div
        style={{
          position: 'absolute',
          height: '96px',
          left: 0,
          top: 0,
          width: `${BOX_WIDTH}px`,
          zIndex: 1,
        }}
        data-name="NEW-Back Shadow"
      >
        {/* TODO: Add back shadow image when asset is available */}
        {/* <img alt="" src={backShadowImage} style={{ display: 'block', width: '100%', height: '100%', maxWidth: 'none' }} /> */}
      </div>

      {/* NEW-Paper */}
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          height: '96px',
          left: 0,
          top: 0,
          width: `${BOX_WIDTH}px`,
          alignItems: 'center',
          justifyContent: 'flex-end',
          overflow: 'hidden',
          zIndex: 10,
        }}
        data-name="NEW-Paper"
      >
        <div
          style={{
            background: 'linear-gradient(to bottom, #e2f3fd, #ffffff)',
            border: '0.557px solid #bde7ff',
            height: `${currentPaperHeight}px`,
            position: 'relative',
            borderRadius: '12px 12px 0 0',
            width: `${PAPER_WIDTH}px`,
            boxShadow: 'inset 0px 1.114px 2.229px 0px #ffffff, inset 0px -2.229px 6.686px 0px rgba(0, 0, 0, 0.03)',
            transition: 'height 0.3s ease-out',
          }}
          data-name="Paper"
        >
          <div
            style={{
              height: `${currentPaperHeight}px`,
              overflow: 'hidden',
              position: 'relative',
              borderRadius: 'inherit',
              width: `${PAPER_WIDTH}px`,
              transition: 'height 0.3s ease-out',
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: '-11.45px',
                display: 'flex',
                flexDirection: 'column',
                gap: '5.571px',
                alignItems: 'flex-start',
                left: '6.68px',
                top: '6.69px',
                width: '142.629px',
              }}
              data-name="Container"
            >
              {/* Cover image */}
              <div
                style={{
                  height: '47px',
                  minHeight: '47px',
                  maxHeight: '47px',
                  position: 'relative',
                  borderRadius: '8px',
                  width: '100%',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
                data-name="Cover image"
              >
                {coverImage ? (
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: '8px', height: '47px', width: '100%' }}>
                    <Image
                      src={coverImage}
                      alt=""
                      fill
                      style={{
                        objectFit: 'cover',
                        objectPosition: '50% 50%',
                        borderRadius: '8px',
                        maxWidth: 'none',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        mixBlendMode: 'soft-light',
                        borderRadius: '8px',
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: '#c6e7fa',
                      borderRadius: '8px',
                      height: '47px',
                      width: '100%',
                    }}
                  />
                )}
              </div>

              {/* Cells grid with breathing animation */}
              <div
                style={{
                  display: 'inline-grid',
                  gridTemplateColumns: 'max-content',
                  gridTemplateRows: 'max-content',
                  lineHeight: 0,
                  position: 'relative',
                  placeItems: 'start',
                }}
                data-name="Cells"
              >
                {/* Cell 04 */}
                <div
                  style={{
                    gridArea: '1 / 1',
                    backgroundColor: cellColor,
                    marginLeft: 0,
                    marginTop: 0,
                    opacity: CELL_OPACITY,
                    borderRadius: '4.457px',
                    width: `${CELL_SIZE}px`,
                    height: `${CELL_SIZE}px`,
                  }}
                  data-name="Cell 04"
                />
                {/* Cell 03 */}
                <div
                  style={{
                    gridArea: '1 / 1',
                    backgroundColor: cellColor,
                    marginLeft: `${36.55}px`,
                    marginTop: 0,
                    opacity: CELL_OPACITY,
                    borderRadius: '4.457px',
                    width: `${CELL_SIZE}px`,
                    height: `${CELL_SIZE}px`,
                  }}
                  data-name="Cell 03"
                />
                {/* Cell 02 */}
                <div
                  style={{
                    gridArea: '1 / 1',
                    backgroundColor: cellColor,
                    marginLeft: `${73.1}px`,
                    marginTop: 0,
                    opacity: CELL_OPACITY,
                    borderRadius: '4.457px',
                    width: `${CELL_SIZE}px`,
                    height: `${CELL_SIZE}px`,
                  }}
                  data-name="Cell 02"
                />
                {/* Cell 01 */}
                <div
                  style={{
                    gridArea: '1 / 1',
                    backgroundColor: cellColor,
                    marginLeft: `${109.65}px`,
                    marginTop: 0,
                    opacity: CELL_OPACITY,
                    borderRadius: '4.457px',
                    width: `${CELL_SIZE}px`,
                    height: `${CELL_SIZE}px`,
                  }}
                  data-name="Cell 01"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW-Front Shadow */}
      <div
        style={{
          position: 'absolute',
          height: '96px',
          left: 0,
          top: 0,
          width: `${BOX_WIDTH}px`,
          zIndex: 3,
        }}
        data-name="NEW-Front Shadow"
      >
        {/* TODO: Add front shadow image when asset is available */}
        {/* <img alt="" src={frontShadowImage} style={{ display: 'block', width: '100%', height: '100%', maxWidth: 'none' }} /> */}
      </div>

      {/* NEW–Envelope shading */}
      <div
        style={{
          position: 'absolute',
          backgroundColor: 'rgba(255, 255, 255, 0.01)',
          height: '80px',
          left: 0,
          mixBlendMode: 'overlay',
          top: '96px',
          width: `${BOX_WIDTH}px`,
          zIndex: 4,
        }}
        data-name="NEW–Envelope shading"
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            boxShadow: 'inset 0px 3px 6px 0px #ffffff',
          }}
        />
      </div>
    </>
  )
}

export default EnvelopeLayers

