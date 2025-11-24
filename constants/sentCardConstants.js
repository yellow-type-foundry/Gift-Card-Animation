// Constants for SentCard components
export const PROGRESS_PILL_RADIUS = '100px'
export const HEADER_OVERLAY_BG = 'linear-gradient(to bottom, rgba(255, 253, 253, 0.3) 00%, rgba(255, 255, 255, 0.95) 95%)'
export const PROGRESS_GLOW_BOX_SHADOW = '0px 2px 4px -8px rgba(46,10,255,0.1), 0px 2px 2px 0px rgba(90,61,255,0.08), 0px 4px 8px -4px rgba(16,0,112,0.15)'

// Confetti animation configuration
// All confetti animations use these unified settings
export const CONFETTI_CONFIG = {
  // Color palette (multi-hue, soft pastels)
  colors: ['#7C66FF', '#5AD3FF', '#FF7AD9', '#FFD166', '#8CE99A'],
  
  // Particle count
  maxParticles: 240, 
  
  // Speed configuration
  speed: {
    min: 2,
    max: 3, // Random speed will be: min + Math.random() * max
  },
  
  // Horizontal drift
  horizontalDrift: 1.5,
  
  // Gravity/acceleration (affects how fast particles slow down and fall)
  gravity: 0.09,
  
  // Particle size (in pixels, before device pixel ratio)
  size: {
    min: 4,
    max: 4, // Random size will be: (min + Math.random() * max) * dpr
  },
  
  // Rotation
  rotation: {
    initial: Math.PI, // Random initial rotation: 0 to Math.PI
    velocity: {
      min: -0.15,
      max: 0.15, // Random rotation velocity: min + Math.random() * (max - min)
    },
  },
  
  // Boundary offset for recycling particles (in pixels, before device pixel ratio)
  boundaryOffset: 20,
}

// Footer configuration for Gift Sent cards
// All footer settings are unified here for easy management
export const FOOTER_CONFIG = {
  // Default layout (Batch - Layout 1)
  default: {
    equalPadding: false,
    topPadding: undefined, // Uses default from Footer component
    bottomPadding: 16,
    transparent: false,
    showProgress: true,
    showReminder: true,
    infoInSlot: false,
    hideInfoOnHover: true,
  },
  
  // Layout 1A (Batch - Duplicate of Layout 1)
  default1a: {
    equalPadding: false,
    topPadding: undefined, // Uses default from Footer component
    bottomPadding: 16,
    transparent: false,
    showProgress: true,
    showReminder: true,
    infoInSlot: false,
    hideInfoOnHover: true,
  },
  
  // Altered Layout 1 (Batch - Layout 2)
  altered1: {
    equalPadding: true,
    topPadding: 28,
    bottomPadding: 24,
    transparent: true,
    showProgress: false,
    showReminder: true,
    infoInSlot: true,
    hideInfoOnHover: true,
  },
  
  // Altered Layout 2 (Batch - Layout 3)
  altered2: {
    equalPadding: true,
    topPadding: 28,
    bottomPadding: 16,
    transparent: true,
    showProgress: false, // Progress is shown outside footer
    showReminder: true, // Reminder is shown outside footer (prop must be true for outside button to render)
    infoInSlot: true,
    hideInfoOnHover: false, // Info stays visible on hover
    // Progress bar outside footer
    progressOutside: {
      bottomPadding: 18,
    },
  },
  
  // Single card layout (SentCard4)
  single: {
    equalPadding: true,
    topPadding: 0,
    bottomPadding: 20,
    transparent: true,
    // Note: showProgress is controlled by overlayProgressOnEnvelope prop (true) in SentCard4
    // This config provides other footer settings
    showReminder: true,
    infoInSlot: false,
    hideInfoOnHover: true,
  },
}

// Unified layout configuration for all Gift Sent card variants
// All layout controls (header, envelope, footer) are centralized here
// 
// To modify any layout's settings, edit the values in this object:
// - header.height: Header height in pixels (fixed height or minHeight when useFlex is true)
// - header.useFlex: Whether header should use flex: 1 to fill available height
// - envelope.scale: Scale factor for envelope/gift container (0.5 = 50%, 1 = 100%, 1.5 = 150%)
// - envelope.offsetY: Vertical offset in pixels
// - envelope.left/right/top: Positioning overrides (undefined = use default)
// - envelope.transformOrigin: CSS transform-origin value
// - Layout flags: Boolean flags for various layout behaviors
//
// Footer settings are in FOOTER_CONFIG above
export const LAYOUT_CONFIG = {
  // Default layout (Batch - Layout 1)
  default: {
    // Header settings
    header: {
      height: 280, // minHeight when useFlex is true
      useFlex: true, // Whether to use flex: 1 for fill height
    },
    // Envelope settings
    envelope: {
      scale: 1,
      offsetY: 0,
      left: undefined, // Uses default positioning
      right: undefined,
      top: undefined,
      transformOrigin: undefined,
    },
    // Layout flags
    hideUnion: false,
    confettiWhiteOverlay: false,
    envelopeHighZ: false,
    overlayProgressOnEnvelope: false,
    progressOutsideEnvelope: false,
  },
  
  // Layout 1A (Batch - Duplicate of Layout 1)
  default1a: {
    // Header settings
    header: {
      height: 280, // minHeight when useFlex is true
      useFlex: true, // Whether to use flex: 1 for fill height
    },
    // Envelope settings
    envelope: {
      scale: 1,
      offsetY: 0,
      left: undefined, // Uses default positioning
      right: undefined,
      top: undefined,
      transformOrigin: undefined,
    },
    // Layout flags
    hideUnion: false,
    confettiWhiteOverlay: false,
    envelopeHighZ: false,
    overlayProgressOnEnvelope: false,
    progressOutsideEnvelope: false,
  },
  
  // Altered Layout 1 (Batch - Layout 2)
  altered1: {
    // Header settings
    header: {
      height: 280, // minHeight when useFlex is true
      useFlex: true, // Fill available height
    },
    // Envelope settings
    envelope: {
      scale: 0.95,
      offsetY: 16,
      left: undefined,
      right: undefined,
      top: undefined,
      transformOrigin: undefined,
    },
    // Layout flags
    hideUnion: true,
    confettiWhiteOverlay: true,
    envelopeHighZ: true,
    overlayProgressOnEnvelope: true,
    progressOutsideEnvelope: false,
    hideEnvelope: true, // Empty the envelope container
  },
  
  // Altered Layout 2 (Batch - Layout 3)
  altered2: {
    // Header settings
    header: {
      height: 240, // minHeight when useFlex is true
      useFlex: true, // Fill available height
    },
    // Envelope settings
    envelope: {
      scale: 0.77, // Adjusted to achieve 170px max height (220.575px × 0.77 ≈ 170px)
      offsetY: 24,
      left: 0,
      right: 0,
      top: 0,
      transformOrigin: 'center top',
    },
    // Layout flags
    hideUnion: true,
    confettiWhiteOverlay: true,
    envelopeHighZ: true,
    overlayProgressOnEnvelope: true,
    progressOutsideEnvelope: true,
  },
  
  // Single card layout 1 (SentCard4) - Exact duplicate of Batch 1 (default)
  single1: {
    // Header settings
    header: {
      height: 280, // minHeight when useFlex is true
      useFlex: true, // Whether to use flex: 1 for fill height
    },
    // Envelope settings (not used when useGiftContainer is true)
    envelope: {
      scale: 1,
      offsetY: 0,
      left: undefined, // Uses default positioning
      right: undefined,
      top: undefined,
      transformOrigin: undefined,
    },
    // Gift container settings (exclusive to Single 1)
    giftContainer: {
      scale: 1,
      offsetY: 0,
      width: 360,
      height: 300,
      top: 80, // Uses default positioning (inset-0)
      left: undefined,
      right: undefined,
      bottom: undefined,
      transformOrigin: 'center top',
    },
    // Layout flags
    hideUnion: false,
    confettiWhiteOverlay: false,
    envelopeHighZ: false,
    overlayProgressOnEnvelope: false,
    progressOutsideEnvelope: false,
  },
  
  // Single card layout 1A - Uses box from Single 2 (envelope with hideEnvelope=true)
  single1a: {
    // Header settings
    header: {
      height: 280, // minHeight when useFlex is true
      useFlex: true, // Fill available height
    },
    // Envelope settings - scaled 1.1x and moved down 40px total
    envelope: {
      scale: 1.1, // 0.95 * 1.1 ≈ 1.045, but using 1.1 as requested
      offsetY: 56, // 16 + 20 + 20 = 56
      left: undefined,
      right: undefined,
      top: undefined,
      transformOrigin: undefined,
    },
    // Layout flags
    hideUnion: true,
    confettiWhiteOverlay: true,
    envelopeHighZ: true,
    overlayProgressOnEnvelope: true,
    progressOutsideEnvelope: false,
    hideEnvelope: true, // Hide envelope and show gift box instead
    enableConfetti: true, // Enable confetti for Single 1A
    showRedline: true, // Show redline for Single 1A
  },
  
  // Single card layout 3 (SentCard4)
  single3: {
    // Header settings
    header: {
      height: 240, // minHeight when useFlex is true
      useFlex: true, // Fill available height
    },
    // Gift container settings (similar to envelope)
    envelope: {
      scale: 1, // Not used for single, but kept for consistency
      offsetY: 0,
      left: undefined,
      right: undefined,
      top: undefined,
      transformOrigin: undefined,
    },
    // Layout flags
    hideUnion: false, // Not applicable
    confettiWhiteOverlay: false,
    envelopeHighZ: false,
    overlayProgressOnEnvelope: true,
    progressOutsideEnvelope: false,
  },
  
  // Single card layout 2 (SentCard4) - Duplicate of Batch 2 (altered1)
  single2: {
    // Header settings
    header: {
      height: 280, // minHeight when useFlex is true
      useFlex: true, // Fill available height
    },
    // Envelope settings (exactly like Batch 2)
    envelope: {
      scale: 0.95,
      offsetY: 16,
      left: undefined,
      right: undefined,
      top: undefined,
      transformOrigin: undefined,
    },
    // Layout flags (exactly like Batch 2)
    hideUnion: true,
    confettiWhiteOverlay: true,
    envelopeHighZ: true,
    overlayProgressOnEnvelope: true,
    progressOutsideEnvelope: false,
  },
}

// Envelope dimensions
export const ENVELOPE_DIMENSIONS = {
  base: {
    left: '50px',
    top: '83px',
    width: '195.5px',
    height: '220.575px'
  },
  cardShape: {
    left: '60px',
    top: '91.117px',
    width: '175.95px',
    height: '146.2px'
  },
  imageContainer: {
    left: '50px',
    top: '83px',
    width: '195.5px',
    height: '220.575px'
  },
  imageFade: {
    left: '51.25px',
    top: '83px',
    width: '195.5px',
    height: '220.575px'
  },
  imageBadge: {
    left: '65px',
    top: '115.5px',
    width: '165px',
    height: '45px'
  }
}

