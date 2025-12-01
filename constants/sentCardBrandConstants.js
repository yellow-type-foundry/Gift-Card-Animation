// Brand and logo constants for SentCard
// Extracted from components/SentCard.jsx to improve maintainability

export const BOX1_IMAGES = [
  '/assets/GiftSent/Gift Container/Apple.png',
  '/assets/GiftSent/Gift Container/Chipotle.png',
  '/assets/GiftSent/Gift Container/Columbia.png',
  '/assets/GiftSent/Gift Container/Goody.png',
  '/assets/GiftSent/Gift Container/Nike.png',
  '/assets/GiftSent/Gift Container/Supergoop.png',
  '/assets/GiftSent/Gift Container/Tiffany & Co.png'
]

// Map PNG logos to SVG logos for text emboss styling
export const LOGO_PNG_TO_SVG_MAP = {
  '/assets/GiftSent/Gift Container/Apple.png': '/assets/GiftSent/SVG Logo/Apple.svg',
  '/assets/GiftSent/Gift Container/Chipotle.png': '/assets/GiftSent/SVG Logo/Chipotle.svg',
  '/assets/GiftSent/Gift Container/Columbia.png': '/assets/GiftSent/SVG Logo/Logo.svg', // Using Logo.svg as default/fallback
  '/assets/GiftSent/Gift Container/Goody.png': '/assets/GiftSent/SVG Logo/Goody.svg',
  '/assets/GiftSent/Gift Container/Nike.png': '/assets/GiftSent/SVG Logo/Nike.svg',
  '/assets/GiftSent/Gift Container/Supergoop.png': '/assets/GiftSent/SVG Logo/Supergoop.svg',
  '/assets/GiftSent/Gift Container/Tiffany & Co.png': '/assets/GiftSent/SVG Logo/Tiffany & Co.svg',
}

// Map SVG logo paths to brand colors
export const LOGO_BRAND_COLORS = {
  '/assets/GiftSent/SVG Logo/Goody.svg': '#B89EFF',
  '/assets/GiftSent/SVG Logo/Chipotle.svg': '#AC2318',
  '/assets/GiftSent/SVG Logo/Logo.svg': '#1987C7', // Columbia
  '/assets/GiftSent/SVG Logo/Nike.svg': '#111111',
  '/assets/GiftSent/SVG Logo/Apple.svg': '#D6D6D6',
  '/assets/GiftSent/SVG Logo/Supergoop.svg': '#0000B4',
  '/assets/GiftSent/SVG Logo/Tiffany & Co.svg': '#81D8D0',
}

// Color constants for Single 2 and progress bars
export const SINGLE2_LUMINANCE = 62  // Luminance for Single 2 brand colors (0-100)
export const SINGLE2_SATURATION = 40  // Saturation for Single 2 brand colors (0-100)
export const PROGRESS_BAR_LUMINANCE = 60  // Luminance for progress bar indicator (0-100)
export const PROGRESS_BAR_SATURATION = 50 // Saturation for progress bar indicator (0-100)

