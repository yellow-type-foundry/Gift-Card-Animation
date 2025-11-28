// Constants for SentCard components
export const PROGRESS_PILL_RADIUS = '100px'
export const HEADER_OVERLAY_BG = 'linear-gradient(to bottom, rgba(255, 253, 253, 0.3) 00%, rgba(255, 255, 255, 0.95) 95%)'
export const PROGRESS_GLOW_BOX_SHADOW = '0px 2px 4px -8px rgba(46,10,255,0.1), 0px 2px 2px 0px rgba(90,61,255,0.08), 0px 4px 8px -4px rgba(16,0,112,0.15)'

// Layout 0 specific confetti settings (completely separate from Layout 1)
export const CONFETTI_CONFIG_LAYOUT_0 = {
  // Gift box collision settings
  giftBox: {
    landingWidthPercent: 0.7, // 70% of box width for landing area (centered)
    topEdgeOnly: true, // Only top edge interaction, ignore other edges
    momentumPreservation: 0.98, // Horizontal momentum preservation (friction)
    verticalMomentumReduction: 0.3, // Vertical velocity reduction on landing
    gravityAssist: 0.1, // Gravity assist for rolling off edges
  },
  // Layer assignment
  layer: {
    usePositionBased: true, // Use position-based layer assignment (behind/in front of box)
    backBlur: 'blur(18px)', // Blur for particles behind box
    frontBlur: 'blur(1.25px)', // Blur for particles in front of box
  },
  // Velocity
  velocity: {
    boostMultiplier: 1.75, // 75% velocity boost for Layout 0 (increased from 1.5x for more momentum)
  },
  // Debug
  debug: {
    showBounds: false, // Show green outline for box bounds (dev only) - hidden
    borderRadius: 32, // Box border radius for debug outline
  },
  // Layout 0 box styling (separate from Single 2 box)
  box: {
    width: '176px', // Box width (can be overridden)
    height: '176px', // Box height (can be overridden)
    borderRadius: '32px', // Box border radius (can be overridden)
    scale: 1.125, // Box scale (matches envelope.scale in single0 config)
  },
}

// Confetti animation configuration
// All confetti animations use these unified settings
// Layout 1 and other layouts use this config (Layout 0 uses CONFETTI_CONFIG_LAYOUT_0)
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
  // Unified default layout (Batch - Layout 0 & 1 merged into Layout 1)
  // Use cardStyle: 'box' for box style (Envelope2) or 'envelope' for envelope style (Envelope1)
  default: {
    equalPadding: false,
    topPadding: undefined, // Uses default from Footer component
    bottomPadding: 16,
    transparent: false,
    showProgress: true,
    showReminder: true,
    infoInSlot: false,
    hideInfoOnHover: false, // Gift info stays visible, only progress bar hides
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
    topPadding: 20,
    bottomPadding: 20,
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
    topPadding: 20,
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
  // Unified default layout (Batch - Layout 0 & 1 merged into Layout 1)
  // Use cardStyle: 'box' for box style (Envelope2) or 'envelope' for envelope style (Envelope1)
  // Layout 0 uses this config with cardStyle: 'box', Layout 1 uses this config with cardStyle: 'envelope'
  default: {
    // Header settings
    header: {
      height: 280, // minHeight when useFlex is true
      useFlex: true, // Whether to use flex: 1 for fill height
    },
    // Envelope settings (will be overridden based on cardStyle)
    envelope: {
      scale: 1, // Default for envelope style; box style uses 1.125
      offsetY: 0, // Default for envelope style; box style uses 24
      left: undefined, // Uses default positioning
      right: undefined,
      top: undefined,
      transformOrigin: undefined,
    },
    // Card style: 'box' = Envelope2, 'envelope' = Envelope1
    // Set dynamically: 'box' for Layout 0, 'envelope' for Layout 1
    cardStyle: 'envelope', // 'box' | 'envelope' - default is 'envelope' (Layout 1)
    // Layout flags
    hideUnion: false,
    confettiWhiteOverlay: false,
    envelopeHighZ: false,
    overlayProgressOnEnvelope: false,
    progressOutsideEnvelope: false,
    hideEnvelope: false, // Set dynamically based on cardStyle
    showGiftBoxWhenHidden: false,
    hideProgressBarInBox: false, // Set dynamically based on cardStyle
    enableConfetti: false, // Set dynamically based on cardStyle
    // Envelope container settings (only used when cardStyle: 'box')
    envelopeContainer: {
      padding: { top: 21, right: 76, bottom: 21, left: 76 },
      margin: { top: 0, right: 0, bottom: 30, left: 0 },
      // Box styling (envelope base) - optimized for batch view with confetti
      boxOpacity: 1.0,
      boxLuminance: 88,
      boxSaturation: 40,
      // Flap styling (envelope flap) - full brightness for batch visibility
      flapOpacity: 1.0,
      flapLuminance: 100,
      flapSaturation: 100,
    },
  },
  
  // Layout 1 Style B (Batch - Envelope2 with separate controls from Layout 2)
  // This is a separate control block that does NOT affect Layout 2 (altered1)
  layout1StyleB: {
    // Header settings
    header: {
      height: 280, // minHeight when useFlex is true
      useFlex: true, // Fill available height
    },
    // Envelope settings (separate from Layout 2)
    envelope: {
      scale: 1.25,
      offsetY: 32,
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
    hideEnvelope: true, // Use Envelope2
    showGiftBoxWhenHidden: false, // Use Envelope2, not Box2
    hidePaper: false, // Show paper component (true = hide, false = show)
    // Box2 settings (SINGLE CARD ONLY - standalone control, does NOT affect batch cards)
    // NOTE: These settings are ONLY used by single cards (Layout 1 Style B single)
    // Batch cards use Envelope2, so these box settings are ignored for batch
    box: {
      width: undefined,      // Box width (e.g., '176px') - undefined = use GIFT_BOX_TOKENS default
      height: undefined,     // Box height (e.g., '176px') - undefined = use GIFT_BOX_TOKENS default
      borderRadius: undefined, // Box border radius (e.g., '32px') - undefined = use GIFT_BOX_TOKENS default
      scale: 1,      // Box scale factor (e.g., 1.25) - undefined = use envelope.scale
      offsetY: 48,
    },
    // Logo container settings (SINGLE CARD ONLY - standalone control, does NOT affect batch cards)
    // NOTE: These settings control the logo container inside Box2 for single cards only
    logoContainer: {
      centerLogo: false,           // Center logo at the very center of the box (true) or top (false)
      paddingHorizontal: 20, // Horizontal padding (e.g., '16px') - undefined = use GIFT_BOX_TOKENS default
      paddingVertical: 32,   // Vertical padding (e.g., '20px') - undefined = use GIFT_BOX_TOKENS default
      logoScale: 1.1,         // Logo scale when centered (e.g., 1.4) - undefined = use default (1.4 when centered, 1 when not)
    },
    // Envelope container settings (LAYOUT 1 STYLE B SPECIFIC - independent control block)
    // NOTE: This is separate from Layout 2 (altered1) - changes here do NOT affect Layout 2
    // The paper/card is an essential part of the envelope and is always rendered
    // The padding.top value controls the vertical position of the paper relative to the envelope
    envelopeContainer: {
      padding: { top: 21, right: 76, bottom: 0, left: 76 }, // Paper position: top padding positions paper to appear inside envelope
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      // Box styling (envelope base) - separate controls for Layout 1 style B
      boxOpacity: 1,
      boxLuminance: 100, // Slightly brighter to compensate for white overlay
      boxSaturation: 85, // Slightly more saturated for overlay contrast
      // Flap styling (envelope flap) - separate controls for Layout 1 style B
      flapOpacity: 1.0,
      flapLuminance: 100,
      flapSaturation: 100,
    },
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
      scale: 1,
      offsetY: -8,
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
    showGiftBoxWhenHidden: false, // IMPORTANT: Keep Envelope2 for Batch 2, DO NOT change to Box2
    // Envelope container settings (BATCH 2 SPECIFIC - independent control block)
    // NOTE: The paper/card is an essential part of the envelope and is always rendered
    // The padding.top value controls the vertical position of the paper relative to the envelope
    // Paper appears to emerge from inside the envelope box (positioned above the box, below the flap)
    envelopeContainer: {
      padding: { top: 46.5, right: 76, bottom: 0, left: 76 }, // Paper position: top padding positions paper to appear inside envelope
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      // Box styling (envelope base) - optimized for confetti white overlay
      boxOpacity: 1,
      boxLuminance: 90, // Slightly brighter to compensate for white overlay
      boxSaturation: 42, // Slightly more saturated for overlay contrast
      // Flap styling (envelope flap) - enhanced for overlay visibility
      flapOpacity: 1.0,
      flapLuminance: 100,
      flapSaturation: 100,
    },
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
  
  // Single card layout 0 (SentCard)
  single0: {
    // Header settings
    header: {
      height: 280, // minHeight when useFlex is true
      useFlex: true, // Fill available height
    },
    // Envelope settings
    envelope: {
      scale: 1.125, // Scaled up 1.125x
      offsetY: 32, //
      left: undefined, // Uses default positioning
      right: undefined,
      top: undefined,
      transformOrigin: undefined,
    },
    // Box settings (Layout 0 specific - separate from Single 2)
    box: {
      width: '172px', // Box width (default: 176px, matches GIFT_BOX_TOKENS)
      height: '172px', // Box height (default: 176px, matches GIFT_BOX_TOKENS)
      borderRadius: '40px', // Box border radius (default: 32px, matches GIFT_BOX_TOKENS)
      scale: 1, // Box scale (matches envelope.scale)
    },
    // Layout flags
    hideUnion: false,
    confettiWhiteOverlay: false,
    envelopeHighZ: false,
    overlayProgressOnEnvelope: false,
    progressOutsideEnvelope: false,
    hideEnvelope: true, // Hide envelope container
    showGiftBoxWhenHidden: false, // Use Envelope2 (like Batch 2) instead of Box2
    hideProgressBarInBox: true, // Hide progress bar inside the box
    centerLogoInBox: true, // Center logo at the very center of the box
    enableConfetti: true, // Enable confetti for Single 0
    showRedline: false, // Hide redline for Single 0
    // Envelope container settings (SINGLE 0 SPECIFIC - independent control block)
    envelopeContainer: {
      padding: { top: 21, right: 76, bottom: 21, left: 76 },
      margin: { top: 0, right: 0, bottom: 30, left: 0 },
      // Box styling (envelope base) - optimized for single view with centered logo
      boxOpacity: 1.0,
      boxLuminance: 87, // Slightly dimmer for single view focus
      boxSaturation: 38, // Slightly less saturated for logo prominence
      // Flap styling (envelope flap) - balanced for single view
      flapOpacity: 1.0,
      flapLuminance: 100,
      flapSaturation: 100,
    },
  },
  
  // Single card layout 1 (SentCard4) - Exact duplicate of Batch 1 (default)
  single1: {
    // Header settings
    header: {
      height: 280, // minHeight when useFlex is true
      useFlex: true, // Whether to use flex: 1 for fill height
    },
    // Envelope settings (not used when useBox1 is true)
    envelope: {
      scale: 1,
      offsetY: 0,
      left: undefined, // Uses default positioning
      right: undefined,
      top: undefined,
      transformOrigin: undefined,
    },
    // Box1 settings (exclusive to Single 1)
    box1: {
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
  
  // Layout 1 Single Style B (Box2 with separate controls from Layout 2)
  // This is a separate control block that does NOT affect Layout 2 single cards (single2)
  layout1SingleStyleB: {
    // Header settings
    header: {
      height: 280, // minHeight when useFlex is true
      useFlex: true, // Fill available height
    },
    // Envelope settings (used for Box2 positioning/scale) - MUST match layout1StyleB batch exactly
    envelope: {
      scale: 1.25,
      offsetY: 40,
      left: undefined,
      right: undefined,
      top: undefined,
      transformOrigin: undefined,
    },
    // Box2 settings (LAYOUT 1 SINGLE STYLE B SPECIFIC - independent control block)
    // NOTE: These control the Box2 component dimensions and scale
    // If not provided, Box2 uses default values from GIFT_BOX_TOKENS
    box: {
      width: undefined,      // Box width (e.g., '176px') - undefined = use GIFT_BOX_TOKENS default
      height: undefined,     // Box height (e.g., '176px') - undefined = use GIFT_BOX_TOKENS default
      borderRadius: undefined, // Box border radius (e.g., '32px') - undefined = use GIFT_BOX_TOKENS default
      scale: undefined,      // Box scale factor (e.g., 1.25) - undefined = use envelope.scale
    },
    // Layout flags - MUST match what batch card actually shows (batch uses default config's hideUnion: false)
    hideUnion: false, // Batch card shows union shape, so single must match
    confettiWhiteOverlay: true,
    envelopeHighZ: true,
    overlayProgressOnEnvelope: true,
    progressOutsideEnvelope: false,
    hideEnvelope: true, // Use Box2
    showGiftBoxWhenHidden: true, // Use Box2, not Envelope2
    hideProgressBarInBox: true, // Hide progress bar in Box2
    centerLogoInBox: false,
    enableConfetti: false,
    // Envelope container settings (not used for Box2, but MUST match layout1StyleB batch for consistency)
    envelopeContainer: {
      padding: { top: 21, right: 76, bottom: 0, left: 76 }, // MUST match layout1StyleB
      margin: { top: 0, right: 0, bottom: 0, left: 0 }, // MUST match layout1StyleB
      // Box styling (envelope base) - MUST match layout1StyleB batch
      boxOpacity: 1,
      boxLuminance: 100, // MUST match layout1StyleB
      boxSaturation: 85, // MUST match layout1StyleB
      // Flap styling (envelope flap) - MUST match layout1StyleB batch
      flapOpacity: 1.0,
      flapLuminance: 100,
      flapSaturation: 100,
    },
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
      scale: 1,
      offsetY: 2.5,
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
    hideEnvelope: true, // Use Envelope2 instead of default envelope
    showGiftBoxWhenHidden: false, // Use Envelope2 (like Batch 2), not Box2
    // Envelope container settings (SINGLE 2 SPECIFIC - independent control block)
    envelopeContainer: {
      padding: { top: 21, right: 76, bottom: 21, left: 76 },
      margin: { top: 0, right: 0, bottom: 30, left: 0 },
      // Box styling (envelope base) - optimized for animations (highlight/breathing)
      boxOpacity: 1.0,
      boxLuminance: 89, // Slightly brighter for animation visibility
      boxSaturation: 41, // Balanced saturation for animation effects
      // Flap styling (envelope flap) - enhanced for animation contrast
      flapOpacity: 1.0,
      flapLuminance: 100,
      flapSaturation: 100,
    },
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

