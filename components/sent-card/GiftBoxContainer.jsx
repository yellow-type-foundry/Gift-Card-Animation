'use client'

import React from 'react'
import useProgressAnimation from '@/hooks/useProgressAnimation'

const GiftBoxContainer = ({
  progress = { current: 4, total: 5 },
  boxColor = '#94d8f9'
}) => {
  // Progress animation with delay and loading
  const {
    animatedProgress,
    animatedCurrent,
    validatedProgress
  } = useProgressAnimation(progress)

  // Calculate progress bar width dynamically
  // Container width: 176px, padding: 16px each side = 32px, progress bar padding: 3.405px each side = 6.81px
  // Available width: 176 - 32 - 6.81 = 137.19px
  // Minimum width: 59.027px
  const progressBarMaxWidth = 176 - 32 - 6.81
  const progressBarWidth = Math.max(59.027, (animatedProgress / 100) * progressBarMaxWidth)

  return (
    <div 
      className="box-border content-stretch flex gap-[10px] items-center justify-center relative size-full"
      data-name="Gift Container/Goody"
    >
      <div 
        className="border-[0.5px] border-[rgba(255,255,255,0)] border-solid relative rounded-[32px] shrink-0 overflow-hidden"
        style={{ width: '176px', height: '176px' }}
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
        <div className="content-stretch flex flex-col items-start overflow-hidden relative rounded-[inherit] w-full h-full" style={{ width: '176px', height: '176px' }}>
          {/* Logo Container (top, flex-grow) */}
          <div 
            className="basis-0 box-border content-stretch flex flex-col grow items-center min-h-px min-w-px px-[16px] py-[20px] relative shrink-0 w-full"
            data-name="Logo Container"
          >
            {/* Logo with text emboss style */}
            <div 
              className="h-[22px] mix-blend-overlay relative shrink-0 w-[121px]"
              style={{ mixBlendMode: 'overlay' }} // text emboss style
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
            className="box-border content-stretch flex flex-col gap-[10px] items-center justify-center pb-[16px] pt-0 px-[16px] relative shrink-0 w-full"
            data-name="Progress Bar"
          >
            {/* Stroke wrapper with gradient (0.5px outside) */}
            <div
              className="relative rounded-[100px] w-full"
              style={{
                padding: '.5px',
                background: 'linear-gradient(to top, rgb(255, 255, 255, 0.5) 0%, rgb(255, 255, 255, 0.7) 100%)',
                boxShadow: '0px -1px 3px 0px rgba(255,255,255,0.55), 0px 3px 4px 0px rgba(255,255,255,0.4)'
              }}
            >
              <div 
                className="border-[0.5px] border-[rgba(255,255,255,0)] border-solid box-border content-stretch flex flex-col gap-[11.351px] items-start justify-center p-[3.405px] relative rounded-[100px] size-full overflow-hidden"
                data-name="Progress Bar"
              >
              {/* Progress bar background layers */}
              <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[100px]">
                {/* 1. Color fill, normal mode, 100% (base layer) */}
                <div 
                  className="absolute inset-0 rounded-[100px]"
                  style={{ backgroundColor: boxColor }}
                />
                {/* 2. White fill, 40%, overlay mode (blends with color below) */}
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
                  minWidth: '60px',
                  padding: '0px',
                  background: 'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255, 255, 255, 0) 100%)',
                  transition: 'width 500ms ease-out'
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
                      color: '#ffffff',
                      zIndex: 1,
                      position: 'relative'
                    }}
                  >
                    {animatedCurrent}/{validatedProgress.total}
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

          {/* Specular Highlight */}
          <div 
            className="absolute left-[3.98%] right-[3.98%] top-0 pointer-events-none"
            style={{
              height: '28px',
              mixBlendMode: 'soft-light'
            }}
            data-name="Specular Highlight"
          >
            <div className="absolute inset-[-82.38%_-12.71%]">
              <img 
                alt="" 
                className="block max-w-none size-full" 
                src="/assets/5e8144bc8235e529f9163592afb375946eec80a3.svg"
              />
            </div>
          </div>

          {/* Shadow Highlight */}
          <div 
            className="absolute left-[3.98%] right-[3.98%] bottom-0 pointer-events-none"
            style={{
              height: '28px',
              mixBlendMode: 'multiply'
            }}
            data-name="Shadow Highlight"
          >
            <div className="absolute inset-[-118.52%_-19.75%]">
              <img 
                alt="" 
                className="block max-w-none size-full" 
                src="/assets/b368b833f1a35441c58064df65b762b08214287c.svg"
              />
            </div>
          </div>

          {/* Highlight layer */}
          <div 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              width: '162px',
              height: '162px',
              borderRadius: '36px',
              overflow: 'visible',
              zIndex: 99,
              mixBlendMode: 'overlay'
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                width: '168px',
                height: '168px',
                borderRadius: '36px',
                border: '16px solid transparent',
                background: 'linear-gradient(45deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)',
                filter: 'blur(12px)',
                opacity: 1
              }}
              data-name="Highlight"
            />
          </div>
        </div>

        {/* Shadow layer - outside inner container to allow blend mode */}
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            width: '168px',
            height: '168px',
            borderRadius: '36px',
            overflow: 'visible',
            zIndex: 99,
            mixBlendMode: 'overlay'
          }}
        >
          <div 
            className="absolute inset-0"
            style={{
              width: '162px',
              height: '162px',
              borderRadius: '36px',
              border: '16px solid transparent',
              background: 'linear-gradient(-45deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 100%)',
              filter: 'blur(14px)',
              opacity: 1,
              willChange: 'filter'
            }}
            data-name="Shadow"
          />
        </div>

        {/* Box inset shadow */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: '0px 2px 20px 0px inset #ffffff, 0px 0px 8px 0px inset rgba(255,255,255,0.85)'
          }}
        />
      </div>
    </div>
  )
}

export default GiftBoxContainer

