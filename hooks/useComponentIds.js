import { useRef } from 'react'

/**
 * Custom hook to generate stable unique IDs for SVG elements
 * @param {string} boxImage - Box image path for uniqueness
 * @param {string} from - Sender name for uniqueness
 * @returns {Object} Object containing all unique IDs
 */
export default function useComponentIds(boxImage, from) {
  const idRef = useRef(null)
  
  if (idRef.current === null) {
    const idSuffix = `${boxImage.replace(/[^a-zA-Z0-9]/g, '')}-${from.replace(/[^a-zA-Z0-9]/g, '')}`
    idRef.current = {
      baseFilterId: `filterBase-${idSuffix}`,
      baseGradient1Id: `paintBase1-${idSuffix}`,
      baseGradient2Id: `paintBase2-${idSuffix}`,
      imageFilterId: `filterImg-${idSuffix}`,
      imageClipId: `clipImg-${idSuffix}`,
      imageGradientSoftLightId: `paintImgSoft-${idSuffix}`,
      imageGradientShadowId: `paintImgShadow-${idSuffix}`,
      imageFadeFilterId: `filterImgFade-${idSuffix}`,
      gridCellGradId: `paintGridCell-${idSuffix}`,
      cardFilterId: `filterCard-${idSuffix}`,
      cardGradientId: `paintCard-${idSuffix}`,
      unionFilterId: `filterUnion-${idSuffix}`,
      unionGradientId: `paintUnion-${idSuffix}`
    }
  }
  
  return idRef.current
}

