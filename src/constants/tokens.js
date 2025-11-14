// Design Tokens
export const TOKENS = {
  // Colors
  colors: {
    border: {
      default: '#DDE2E9',
      zinc200: '#e4e4e7',
      slate300: '#cbd5e1',
    },
    text: {
      primary: '#000000',
      secondary: '#525f7a',
      tertiary: '#525f7a', // Content/Tertiary
      slate400: '#94a3b8',
      slate600: '#475569',
    },
    background: {
      white: '#ffffff',
      violet500: '#8b5cf6',
      violet600: '#7c3aed',
    },
    shadow: {
      default: '0px 4px 12px -4px rgba(0, 0, 0, 0.03), 0px 2px 3px 0px rgba(0, 0, 0, 0.05)',
      opening: '0px -8px 24px -4px rgba(0, 0, 0, 0.12), 0px -4px 8px -2px rgba(0, 0, 0, 0.08)',
    },
  },

  // Spacing
  spacing: {
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    xxl: '24px',
    cardPadding: '16px', // p-4
    cardGap: '16px',
    headerGap: '8px',
    giftBoxGap: '10px',
    actionsGap: '8px',
    expiryTextOffset: '6px',
  },

  // Sizes
  sizes: {
    card: {
      width: '300px',
      height: {
        closed: '384px',
        open: '352px',
      },
    },
    borderRadius: {
      card: '24px',
      button: '12px',
    },
    borderWidth: '0.884px',
    giftBox: {
      maxWidth: '200px',
      maxHeight: '200px',
    },
    text: {
      senderHeight: '20px',
      messageHeight: '58px',
      expiryMaxHeight: '30px',
      giftInfoMaxHeight: '100px',
      actionsMaxHeight: '30px',
    },
  },

  // Animation
  animation: {
    duration: {
      fast: '300ms',
      medium: '500ms',
      slow: '700ms',
    },
    easing: {
      easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      box1: 'cubic-bezier(0.2, 0, 0.4, 1)',
      box2: 'cubic-bezier(0.2, 0, 0.7, 1)',
    },
  },

  // Transforms
  transforms: {
    box1: {
      opening: {
        rotate: '15deg',
        translateX: '32px',
        translateY: '-8px',
        scale: '0.9',
      },
      hover: {
        rotate: '4deg',
        translateX: '16px',
        translateY: '-4px',
        scale: '1',
      },
    },
    box2: {
      opening: {
        rotate: '-15deg',
        translateX: '-36px',
        translateY: '-10px',
        scale: '0.9',
      },
    },
    message: {
      scale: {
        opening: '0.85',
        default: '1',
      },
    },
  },

  // Z-index
  zIndex: {
    box1: 10,
    box2: 0,
    innerContainer: 10,
  },
}

