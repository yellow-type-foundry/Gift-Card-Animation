import React from 'react'
import { TOKENS } from '@/constants/tokens'

const PROGRESS_PILL_RADIUS = '100px'
const PROGRESS_GLOW_BOX_SHADOW =
  '0px 2px 4px -8px rgba(46,10,255,0.1), 0px 2px 2px 0px rgba(90,61,255,0.08), 0px 4px 8px -4px rgba(16,0,112,0.15)'

export default function Footer({
  isDone,
  isHovered,
  animatedProgress,
  animatedCurrent,
  validatedTotal,
  infoTitle,
  infoSubtitle,
  equalPadding = false,
  showProgress = true,
  showReminder = true,
  infoInSlot = false,
  bottomPadding = 16,
  topPadding,
  transparent = false
}) {
  return (
    <div
      className="box-border flex items-center justify-center pt-0 px-[16px] relative shrink-0 w-full"
      style={{ 
        position: 'relative', 
        zIndex: transparent ? 1 : 20, 
        width: '100%', 
        paddingTop: topPadding !== undefined ? `${topPadding}px` : (equalPadding ? '16px' : undefined), 
        paddingBottom: `${bottomPadding}px`,
        backgroundColor: transparent ? 'transparent' : 'white'
      }}
      data-node-id="1467:49205"
    >
      {/* Background blur + white gradient (bottom -> top) */}
      {!transparent && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backdropFilter: 'blur(00px)',
            WebkitBackdropFilter: 'blur(00px)',
            background: 'linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.75) 60%, rgba(255,255,255,0.0) 100%)',
            zIndex: -1
          }}
        />
      )}
      <div
        data-name="InfoBarContent"
        className="content-stretch flex flex-col gap-[12px] items-center justify-center text-center transition-all"
        style={{ width: '100%' }}
      >
        {/* Info first */}
        {infoTitle && !infoInSlot && (
          <div
            className="content-stretch flex flex-col gap-[4px] items-start leading-[1.4] not-italic relative shrink-0 text-center w-full"
            data-name="Gift Message"
          >
            <p
              className="[white-space-collapse:collapse] font-['Goody_Sans:Medium',sans-serif] h-[22px] overflow-ellipsis overflow-hidden relative shrink-0 text-[16px] text-nowrap w-[268px]"
              style={{
                fontFamily: 'var(--font-goody-sans)',
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: 1.4,
                color: transparent ? '#000000' : '#000000'
              }}
            >
              {infoTitle}
            </p>
            {infoSubtitle && (
              <p
                className="font-['Goody_Sans:Regular',sans-serif] h-[22px] relative shrink-0 text-[16px] w-[268px]"
                style={{
                  fontFamily: 'var(--font-goody-sans)',
                  fontSize: '16px',
                  fontWeight: 400,
                  lineHeight: 1.4,
                  color: transparent ? '#525f7a' : '#525f7a'
                }}
              >
                {infoSubtitle}
              </p>
            )}
          </div>
        )}
        {/* Progress / Reminder slot (also hosts info when infoInSlot) */}
        <div className="relative w-full flex items-center justify-center" style={{ minHeight: infoInSlot ? '44px' : '36px' }}>
          {infoInSlot && (infoTitle || infoSubtitle) && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                opacity: isHovered && !isDone ? 0 : 1,
                transform: isHovered && !isDone ? 'translateY(4px)' : 'translateY(0)',
                transition: 'opacity 200ms ease-out, transform 200ms ease-out',
                pointerEvents: isHovered && !isDone ? 'none' : 'auto'
              }}
              data-name="InfoSlot"
            >
              <div className="flex flex-col items-center justify-center gap-[4px] px-2" style={{ minHeight: '44px', width: '100%' }}>
                {infoTitle && (
                  <p
                    className="font-['Goody_Sans:Medium',sans-serif] text-[16px] leading-[1.4] text-center"
                    style={{
                      fontFamily: 'var(--font-goody-sans)',
                      fontSize: '16px',
                      fontWeight: 500,
                      lineHeight: 1.4,
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      maxWidth: '100%',
                      color: transparent ? '#000000' : '#000000'
                    }}
                  >
                    {infoTitle}
                  </p>
                )}
                {infoSubtitle && (
                  <p
                    className="font-['Goody_Sans:Regular',sans-serif] text-[16px] leading-[1.4] text-center"
                    style={{
                      fontFamily: 'var(--font-goody-sans)',
                      fontSize: '16px',
                      lineHeight: 1.4,
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      maxWidth: '100%',
                      color: transparent ? '#525F7A' : '#525F7A'
                    }}
                  >
                    {infoSubtitle}
                  </p>
                )}
              </div>
            </div>
          )}
          {showProgress && (
          <div
            data-name="ProgressSlot"
            className="absolute inset-0 flex items-center justify-center"
            style={{
              opacity: transparent ? 1 : (isHovered && !isDone ? 0 : 1),
              transform: transparent ? 'translateY(0)' : (isHovered && !isDone ? 'translateY(4px)' : 'translateY(0)'),
              transition: transparent ? 'none' : 'opacity 200ms ease-out, transform 200ms ease-out',
              pointerEvents: transparent ? 'auto' : (isHovered && !isDone ? 'none' : 'auto')
            }}
          >
            <div
              className="bg-[#f0f1f5] border border-[rgba(221,226,233,0)] border-solid box-border content-stretch flex flex-col gap-[10px] items-start justify-center p-[2px] relative rounded-[100px] shrink-0 w-[120px]"
              style={{
                borderRadius: PROGRESS_PILL_RADIUS,
                backgroundColor: '#f0f1f5'
              }}
              data-name="Progress Bar Container"
            >
              <div
                className="bg-gradient-to-b box-border content-stretch flex flex-col from-[#5a3dff] gap-[10px] items-center justify-center px-[8px] py-[3px] relative rounded-[100px] shrink-0"
                style={{
                  background: 'linear-gradient(to bottom, #5a3dff, #a799ff)',
                  borderRadius: PROGRESS_PILL_RADIUS,
                  width: isDone ? '100%' : `${animatedProgress}%`,
                  maxWidth: '100%',
                  minWidth: 'fit-content',
                  transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: PROGRESS_GLOW_BOX_SHADOW
                }}
                data-name="Progress Bar"
              >
                <p
                  className="font-['Goody_Sans:Medium',sans-serif] leading-[1.4] not-italic relative shrink-0 text-[14px] text-white text-center w-full"
                  style={{
                    fontFamily: 'var(--font-goody-sans)',
                    fontSize: '14px',
                    fontWeight: 500,
                    lineHeight: 1.4,
                    color: '#ffffff',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {isDone ? 'Done' : `${animatedCurrent}/${validatedTotal}`}
                </p>
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    boxShadow: '0px 3px 5px 2px inset rgba(255,255,255,0.5)',
                    borderRadius: PROGRESS_PILL_RADIUS
                  }}
                />
              </div>
              <div
                className="absolute inset-[-1px] pointer-events-none"
                style={{
                  boxShadow: '0px 1px 2.25px 0px inset #c2c6d6, 0px -1px 2.25px 0px inset #ffffff',
                  borderRadius: PROGRESS_PILL_RADIUS
                }}
              />
            </div>
          </div>
          )}
          {showReminder && !isDone && (
            <div
              data-name="ReminderBar"
              className="absolute inset-0 flex items-center justify-center"
              style={{
                opacity: isHovered ? 1 : 0,
                transform: isHovered ? 'translateY(0)' : 'translateY(4px)',
                transition: 'opacity 200ms ease-out, transform 200ms ease-out',
                pointerEvents: isHovered ? 'auto' : 'none'
              }}
            >
              <button
                data-name="ReminderButton"
                className="px-3.5 py-1 bg-white rounded-[12px] text-[#525F7A]"
                style={{
                  outlineOffset: '-1px',
                  outlineWidth: '1px',
                  outlineStyle: 'solid',
                  outlineColor: 'var(--color-border)',
                  borderRadius: '12px',
                  height: infoInSlot ? '44px' : '36px',
                  transition: 'transform 200ms ease-out, box-shadow 200ms ease-out, outline-color 200ms ease-out, background-color 200ms ease-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px -8px rgba(0,0,0,0.15), 0 3px 10px -4px rgba(0,0,0,0.10)'
                  e.currentTarget.style.outlineColor = '#cfd6e2'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.outlineColor = 'var(--color-border)'
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 6px 18px -8px rgba(0,0,0,0.15), 0 2px 8px -4px rgba(0,0,0,0.10)'
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px -8px rgba(0,0,0,0.15), 0 3px 10px -4px rgba(0,0,0,0.10)'
                }}
                type="button"
              >
                Send a reminder
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


