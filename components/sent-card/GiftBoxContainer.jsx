'use client'

import React from 'react'

const GiftBoxContainer = ({
  progress = { current: 4, total: 5 },
  boxColor = '#94d8f9'
}) => {
  const progressPercentage = progress.total > 0 
    ? (progress.current / progress.total) * 100 
    : 0

  // Calculate progress bar width dynamically
  // Container width: 168px, padding: 16px each side = 32px, progress bar padding: 3.405px each side = 6.81px
  // Available width: 168 - 32 - 6.81 = 129.19px
  // Minimum width: 59.027px
  const progressBarMaxWidth = 168 - 32 - 6.81
  const progressBarWidth = Math.max(59.027, (progressPercentage / 100) * progressBarMaxWidth)

  return (
    <div 
      className="box-border content-stretch flex gap-[10px] items-center justify-center px-[76px] py-[21px] relative size-full"
      data-name="Gift Container/Goody"
    >
      <div 
        className="border-[0.5px] border-[rgba(255,255,255,0)] border-solid relative rounded-[32px] shrink-0 overflow-hidden"
        style={{ width: '168px', height: '168px' }}
        data-name="Box"
      >
        {/* Base background and gradient overlay */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[32px]">
          <div 
            className="absolute inset-0 rounded-[32px]"
            style={{ backgroundColor: boxColor }}
          />
          <div 
            className="absolute inset-0 mix-blend-overlay rounded-[32px]"
            style={{ 
              mixBlendMode: 'overlay',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0) 34.459%, rgba(0,0,0,0.5) 100%)'
            }}
          />
        </div>

        {/* Inner content container */}
        <div className="content-stretch flex flex-col items-start overflow-hidden relative rounded-[inherit] w-full h-full" style={{ width: '168px', height: '168px' }}>
          {/* Logo Container (top, flex-grow) */}
          <div 
            className="basis-0 box-border content-stretch flex flex-col grow items-center min-h-px min-w-px px-[16px] py-[20px] relative shrink-0 w-full"
            data-name="Logo Container"
          >
            <div 
              className="h-[22px] mix-blend-overlay relative shrink-0 w-[121px]"
              style={{ mixBlendMode: 'overlay' }}
              data-name="Logo"
            >
              <div className="absolute inset-[-12.66%_-1.84%_-9.28%_-1.84%]">
                <img 
                  alt="" 
                  className="block max-w-none size-full" 
                  src="/assets/GiftSent/Gift Container/9bc812442d8f2243c9c74124dd128a8df145f983.svg"
                />
              </div>
            </div>
          </div>

          {/* Progress Bar (bottom, fixed) */}
          <div 
            className="box-border content-stretch flex flex-col gap-[10px] items-center justify-center pb-[12px] pt-0 px-[16px] relative shrink-0 w-full"
            data-name="Progress Bar"
          >
            <div 
              className="border-[0.5px] border-[rgba(255,255,255,0)] border-solid box-border content-stretch flex flex-col gap-[11.351px] items-start justify-center p-[3.405px] relative rounded-[100px] shrink-0 w-full overflow-hidden"
              data-name="Progress Bar"
            >
              {/* Progress bar background layers */}
              <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[100px]">
                <div 
                  className="absolute inset-0 rounded-[100px]"
                  style={{ backgroundColor: boxColor }}
                />
                <div 
                  className="absolute inset-0 mix-blend-overlay rounded-[100px]"
                  style={{ 
                    mixBlendMode: 'overlay',
                    backgroundColor: 'rgba(255,255,255,0.4)'
                  }}
                />
              </div>

              {/* Progress indicator */}
              <div 
                className="relative rounded-[40.865px] shrink-0 overflow-hidden"
                style={{ 
                  width: `${progressBarWidth}px`,
                  minWidth: '59.027px',
                  padding: '0.5px',
                  background: 'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)'
                }}
                data-name="Progress"
              >
                <div 
                  className="box-border content-stretch flex flex-col h-[27.243px] items-start justify-center px-[9.081px] py-0 relative rounded-[40.865px] w-full overflow-hidden"
                  style={{ 
                    backgroundColor: boxColor
                  }}
                >
                  <p 
                    className="font-['Goody_Sans:Medium',sans-serif] leading-[1.4] not-italic relative shrink-0 text-white w-full"
                    style={{
                      fontFamily: 'var(--font-goody-sans)',
                      fontSize: '15.892px',
                      fontWeight: 500,
                      lineHeight: 1.4,
                      color: '#ffffff'
                    }}
                  >
                    {progress.current}/{progress.total}
                  </p>
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      boxShadow: '0px -2.27px 4.541px 0px inset rgba(255,255,255,0.5), 0px 0px 4.541px 0px inset rgba(255,255,255,0.5), 0px -4.541px 13.622px 4.541px inset #56c5f6'
                    }}
                  />
                </div>
              </div>

              {/* Progress bar inset shadow */}
              <div 
                className="absolute inset-[-0.5px] pointer-events-none"
                style={{
                  boxShadow: '0px 1.135px 2.554px 0px inset rgba(0,0,0,0.1), 0px -1.135px 3.405px 0px inset rgba(255,255,255,0.5)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Box inset shadow */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: '0px 1.5px 16px 0px inset #ffffff, 0px 2px 4px 0px inset rgba(255,255,255,0.65)'
          }}
        />
      </div>
    </div>
  )
}

export default GiftBoxContainer

