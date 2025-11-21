// Design Tokens for GiftBoxContainer (Single 2)
// All styling values are centralized here for easy maintenance and reuse

export const GIFT_BOX_TOKENS = {
  // Box dimensions
  box: {
    width: '176px',
    height: '176px',
    borderRadius: '32px',
  },

  // Logo dimensions and styling
  logo: {
    width: '181.5px',
    height: '33px',
    containerPadding: {
      horizontal: '16px',
      vertical: '20px',
    },
    inset: '-12.66% -1.84% -9.28% -1.84%',
  },

  // Progress bar dimensions and spacing
  progressBar: {
    container: {
      borderRadius: '100px',
      bottomPadding: '16px',
      horizontalPadding: '16px',
    },
    strokeWrapper: {
      padding: '0.45px',
      borderRadius: '100px',
    },
    innerContainer: {
      padding: '3.405px',
      borderRadius: '100px',
      gap: '11.351px',
    },
    indicator: {
      borderRadius: '40.865px',
      height: '27.243px',
      minWidth: '60px',
      horizontalPadding: '9.081px',
      strokePadding: '0.5px',
    },
    // Progress bar width calculation
    // Container width: 176px
    // Outer padding: 16px each side = 32px
    // Stroke wrapper padding: 0.5px each side = 1px
    // Inner container padding: 3.405px each side = 6.81px
    // Available width: 176 - 32 - 1 - 6.81 = 136.19px
    widthCalculation: {
      containerWidth: 176,
      outerPadding: 16,
      strokePadding: 0.5,
      innerPadding: 3.405,
      minWidth: 60,
    },
  },

  // Highlight and shadow layer dimensions
  effects: {
    highlight: {
      width: '162px',
      height: '162px',
      borderRadius: '36px',
      blur: '12px',
    },
    highlightWrapper: {
      width: '168px',
      height: '168px',
      borderRadius: '36px',
      border: '16px solid transparent',
    },
    shadow: {
      width: '156px',
      height: '156px',
      borderRadius: '38px',
      blur: '16px',
    },
    shadowWrapper: {
      width: '168px',
      height: '168px',
      borderRadius: '36px',
      border: '16px solid transparent',
    },
    specularHighlight: {
      height: '28px',
      horizontalOffset: '3.98%',
    },
    shadowHighlight: {
      height: '28px',
      horizontalOffset: '3.98%',
    },
  },

  // Box shadow (hover effect)
  boxShadow: {
    top: '160px',
    height: '60px',
    width: '130px',
    leftOffset: '0.5px',
    imageInset: '-40.68% -18.32%',
    imageSize: {
      height: '59px',
      width: '131px',
    },
  },

  // Gradients
  gradients: {
    boxBase: 'linear-gradient(to bottom, rgba(0,0,0,0) 34.459%, rgba(0,0,0,0.5) 100%)',
    progressBarStroke: 'linear-gradient(to top, rgba(255, 255, 255, 0.7) 0%, rgba(0, 0, 0, 0.02) 100%)',
    progressIndicatorStroke: 'linear-gradient(to bottom, rgba(255,255,255,.65) 0%, rgba(255,255,255,0) 100%)',
    highlight: 'linear-gradient(45deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)',
    shadow: 'linear-gradient(-45deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 100%)',
  },

  // Shadows
  shadows: {
    boxInset: '0px 2px 20px 0px inset #ffffff, 0px 0px 8px 0px inset rgba(255,255,255,0.85)',
    progressBarStroke: '0px -1px 3px 0px rgba(255, 255, 255, 0.55), 0px 3px 4px 0px rgba(255,255,255,0.4)',
    progressBarContainerInset: '0px 1.135px 2.554px 0px inset rgba(0,0,0,0.1), 0px -1.135px 3.405px 0px inset rgba(255,255,255,0.5)',
    // Progress indicator inner shadow uses themedShadowColor - see hoverEffects
  },

  // Blend modes
  blendModes: {
    overlay: 'overlay',
    softLight: 'soft-light',
    multiply: 'multiply',
  },

  // Colors
  colors: {
    whiteOverlay: 'rgba(255,255,255,0.4)',
    progressText: '#ffffff',
    progressTextOpacity: 0.8,
  },

  // Hover effects
  hoverEffects: {
    colorAdjustment: {
      saturationIncrease: 3,
      lightnessIncrease: 2,
    },
    shadowColorAdjustment: {
      lightnessDecrease: 20,
    },
    transform: {
      translateY: '-4px',
    },
    noiseOpacity: {
      default: 0.95,
      hover: 0.75,
    },
    boxShadowOpacity: {
      default: 0,
      hover: 0.75,
    },
  },

  // Animations
  animations: {
    duration: {
      fast: '300ms',
      medium: '500ms',
    },
    easing: {
      easeOut: 'ease-out',
      progressBar: 'cubic-bezier(0.25, 0.10, 0.25, 1.0)',
    },
  },

  // Z-index layers
  zIndex: {
    highlight: 99,
    noise: 999,
    boxShadow: -1,
    progressText: 1,
  },

  // Asset paths
  assets: {
    noise: '/assets/GiftSent/Noise2.png',
    specularHighlight: '/assets/5e8144bc8235e529f9163592afb375946eec80a3.svg',
    shadowHighlight: '/assets/b368b833f1a35441c58064df65b762b08214287c.svg',
    boxShadow: '/assets/6f359e913554354f597a2d17f6b84af6c1b85d2e.svg',
  },
}

// Helper function to calculate progress bar max width
export const calculateProgressBarMaxWidth = () => {
  const { containerWidth, outerPadding, strokePadding, innerPadding } = GIFT_BOX_TOKENS.progressBar.widthCalculation
  return containerWidth - (outerPadding * 2) - (strokePadding * 2) - (innerPadding * 2)
}

// Helper function to calculate progress bar width
export const calculateProgressBarWidth = (progressPercentage, maxWidth) => {
  const { minWidth } = GIFT_BOX_TOKENS.progressBar.widthCalculation
  return Math.min(maxWidth, Math.max(minWidth, (progressPercentage / 100) * maxWidth))
}

