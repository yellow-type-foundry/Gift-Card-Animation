// BACKUP: Batch 2 (altered1) configuration
// Created: Backup before making changes to Batch 2 envelope design
// 
// This file contains the original configuration for Batch 2 (altered1) layout
// from constants/sentCardConstants.js

export const LAYOUT_CONFIG_ALTERED1_BACKUP = {
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
  },
}

export const FOOTER_CONFIG_ALTERED1_BACKUP = {
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
}

