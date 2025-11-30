// Layout 3 box sizing tokens (keep visuals in sync with Figma)
export const BOX_WIDTH = 180
export const BOX_HEIGHT = 176
export const BOX_RADIUS = 36
export const BOTTOM_SHADOW_WIDTH = 156

// Static style objects (never change, can be reused)
export const STATIC_STYLES = {
  container: {
    width: `${BOX_WIDTH}px`,
    height: `${BOX_HEIGHT}px`,
    margin: '0 auto',
    overflow: 'visible',
    position: 'relative',
  },
  shadingContainer: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
  lightCornerWrapper: {
    position: 'absolute',
    left: 'calc(50% - 30px)',
    top: 'calc(50% - 35.5px)',
    transform: 'translate(-50%, -50%) rotate(180deg)',
    width: '100px',
    height: '90px',
    mixBlendMode: 'overlay',
  },
  lightCornerInner: {
    position: 'absolute',
    inset: '-15.56% -16% -17.78% -14%',
    width: 'auto',
    height: 'auto',
    maxWidth: 'none',
    display: 'block',
  },
  progressBlobsContainer: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: `${BOX_WIDTH}px`,
    height: `${BOX_HEIGHT}px`,
    minWidth: `${BOX_WIDTH}px`,
    maxWidth: `${BOX_WIDTH}px`,
    minHeight: `${BOX_HEIGHT}px`,
    maxHeight: `${BOX_HEIGHT}px`,
    // No z-index - blobs inside will layer directly with Logo (both are children of main box container)
    padding: '1px',
    filter: 'blur(1px)',
    transformOrigin: 'center center',
    willChange: 'auto',
    boxSizing: 'border-box',
  },
  logoWrapper: {
    position: 'relative',
    width: '181.5px',
    height: '36px',
    mixBlendMode: 'overlay',
    display: 'flex',
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '18px',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: 'block',
  },
  progressText: {
    position: 'relative',
    fontSize: '20px',
    fontFamily: "'Goody Sans', sans-serif",
    fontWeight: 'bold',
    lineHeight: 1,
    textAlign: 'center',
    whiteSpace: 'pre',
    letterSpacing: '-0.2px',
    mixBlendMode: 'normal',
    margin: 0,
  },
  pullTabIcon: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    mixBlendMode: 'overlay',
  },
  shadowImage: {
    display: 'block',
    width: `${BOTTOM_SHADOW_WIDTH}px`,
    height: 'auto',
  },
}

// Logo height mappings
export const LOGO_HEIGHTS = {
  'Goody.svg': '40px',
  'Chipotle.svg': '46px',
  'Apple.svg': '40px',
  'Nike.svg': '24px',
  'Supergoop.svg': '40px',
  'Tiffany & Co.svg': '16px',
  'Logo.svg': '20px', // Columbia
}

