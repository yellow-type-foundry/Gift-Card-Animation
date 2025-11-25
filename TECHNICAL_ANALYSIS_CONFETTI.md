# Technical Analysis: useConfettiLayout0.js

## Overview

The `useConfettiLayout0` React hook manages a confetti animation with specific features for "Layout 0". It handles starting, stopping, pausing, and cleaning up the confetti animation based on various triggers such as hovering over a card, opening/closing a modal (represented by `forceHovered`), and whether all items are accepted (`allAccepted`).

## Key Features

### Layout 0 Specific Features
- **Gift box collision detection**: Particles can collide with and land on a gift box element
- **Multiple blur canvas layers**: Uses multiple canvas layers with varying blur levels for depth effect
- **Velocity boosts**: Eruption effect with velocity boosts that decay over time
- **Gyroscope/tilt interaction**: Interactive effects on mobile devices using device orientation
- **Union cutout collision**: Particles can fall into and collide with a "union cutout" area
- **Mirrored particles**: Optional mirrored reflection effect below the card

### Animation Control
- **Hover-based triggering**: Animation starts when card is hovered (if `allAccepted` is true)
- **Modal-based triggering**: Animation can be forced via `forceHovered` prop (bypasses `allAccepted` check)
- **Frame-based pausing**: Can pause at a specific frame for capture (e.g., frame 180)
- **Fade-out on hover end**: Particles fade out when hover ends
- **Slow motion effect**: After 1300ms, particles enter slow motion mode (disabled during capture)

## Framework/Library and Key Technologies

### Framework
- **React**: Uses React hooks (`useEffect`, `useRef`) for managing side effects and state persistence

### Key Technologies/APIs/Patterns

#### React Hooks
- `useEffect`: Manages animation lifecycle, cleanup, and side effects
- `useRef`: Stores animation frame IDs, initialization flags, and timing references to persist across renders without causing re-renders

#### Canvas API
- Direct interaction with HTML `<canvas>` elements
- Methods used:
  - `canvas.getContext('2d')`: Get 2D rendering context
  - `clearRect()`: Clear canvas for redraw
  - `beginPath()`, `arc()`, `fill()`: Draw circular particles
  - `save()`, `restore()`: Manage drawing state
  - `translate()`, `rotate()`: Transform particle positions
  - `globalAlpha`, `fillStyle`: Control particle appearance

#### RequestAnimationFrame API
- `requestAnimationFrame()`: Browser-optimized animation loop
- `cancelAnimationFrame()`: Stop animation loop
- Used for smooth, 60fps animation

#### Device Orientation API
- `DeviceOrientationEvent`: Detects device tilt on mobile
- `window.addEventListener('deviceorientation')`: Listen for orientation changes
- Used for interactive particle movement based on device tilt

#### Performance API
- `performance.now()`: Precise timing for:
  - Animation start time tracking
  - Slow motion phase detection
  - Fade-out duration calculation

#### Environment Detection
- `process.env.NODE_ENV`: Conditional logging in development mode
- Mobile device detection: `/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)`

## Animation Physics

### Particle Properties
- **Position**: `x`, `y` coordinates
- **Velocity**: `vx` (horizontal), `vy` (vertical)
- **Rotation**: `rot` (current angle), `vrot` (rotational velocity)
- **Size**: Random size between min and max
- **Color**: Randomly selected from color palette
- **Opacity**: Fades in on spawn, fades out on hover end
- **Gravity**: Constant downward acceleration
- **Air resistance**: Velocity decay over time
- **Bounce energy**: Energy retained after collisions

### Collision Detection
- **Gift box collision**: Particles can land on top of the gift box
- **Union cutout collision**: Particles fall into and bounce within the union cutout area
- **Boundary constraints**: Particles bounce off card boundaries

### Eruption Effect
- **Initial spawn rate**: Low (0.25) at start
- **Max spawn rate**: High (0.95) after acceleration
- **Acceleration frames**: 30 frames to reach max spawn rate
- **Velocity boost**: Early particles get massive velocity boost (up to 2.5x), decaying over 60 frames

### Slow Motion
- **Start time**: After 1300ms of animation
- **Factor**: 0.095 (9.5% of normal speed)
- **Effect**: Particles float in space with reduced gravity and air resistance
- **Disabled during capture**: When `pauseAtFrame` is set, slow motion is disabled

## State Management

### Refs Used
- `pauseRef`: Tracks pause state without causing effect re-runs
- `pauseAtFrameRef`: Stores target frame for capture mode
- `hasInitializedRef`: Prevents animation restart on every effect run
- `animIdRef`: Stores animation frame ID for cleanup
- `prevForceHoveredRef`: Tracks previous `forceHovered` value
- `prevIsHoveredRef`: Tracks previous `isHovered` value
- `isFadingOutRef`: Tracks if particles are fading out
- `fadeOutStartTimeRef`: Tracks when fade-out started

### Effect Dependencies
```javascript
[isHovered, allAccepted, confettiCanvasRef, cardRef, confettiCanvasFrontRef, confettiCanvasMirroredRef, blurCanvasRefs, forceHovered]
```

## Animation Lifecycle

### Initialization
1. Check if conditions are met (`canStart`)
2. Check if already initialized (prevent restart)
3. Set up canvas contexts
4. Find DOM elements (gift box, union shape)
5. Initialize particle array
6. Start animation loop

### Running
1. Spawn new particles based on spawn rate
2. Update particle physics (gravity, air resistance, collisions)
3. Apply slow motion if applicable
4. Draw particles to appropriate canvas layers
5. Check for pause conditions (frame-based or manual)
6. Continue loop with `requestAnimationFrame`

### Cleanup
1. Cancel animation frame
2. Clear all canvases
3. Reset initialization flags
4. Remove event listeners (device orientation)
5. Reset timing references

## Modal Integration

### forceHovered Parameter
- **Purpose**: Allows programmatic control of animation (bypasses hover requirement)
- **Usage**: Set to `true` when modal opens to play confetti in modal
- **Behavior**: 
  - Bypasses `allAccepted` check
  - Can start even if `shouldPause` is true
  - Animation pauses in draw loop if needed

### Modal Close Detection
- Detects when `forceHovered` changes from `true` to `false`
- Immediately stops animation and clears canvases
- Resets all state flags

## Capture Mode

### Frame-Based Pausing
- `pauseAtFrame` parameter: Target frame to pause at (e.g., 180)
- Animation pauses when `frameCount >= pauseAtFrame`
- Exposes `window.__confettiFrameCount` and `window.__confettiPaused` for Puppeteer
- Slow motion is disabled during capture mode

### Puppeteer Integration
- Puppeteer waits for `window.__confettiFrameCount >= 180` and `window.__confettiPaused === true`
- Ensures consistent capture at the same frame every time

## External Resources

### React Hooks Documentation
- [useEffect](https://react.dev/reference/react/useEffect)
- [useRef](https://react.dev/reference/react/useRef)

### Web APIs Documentation
- [HTML Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Window.requestAnimationFrame()](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
- [Device Orientation API](https://developer.mozilla.org/en-US/docs/Web/API/Device_Orientation_API)
- [Performance.now()](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now)

## Module Imports

```javascript
import { useEffect, useRef } from 'react'
import { CONFETTI_CONFIG_LAYOUT_0 } from '@/constants/sentCardConstants'
```

The hook imports configuration constants from a centralized constants file, suggesting a modular project structure with shared configuration.

## Performance Considerations

1. **Canvas clearing**: Only clears and redraws what's necessary
2. **Particle limits**: Maximum particle count prevents performance degradation
3. **Off-screen culling**: Particles outside viewport are not drawn
4. **Refs over state**: Uses refs to avoid unnecessary re-renders
5. **Conditional initialization**: Prevents restarting animation on every effect run
6. **Event listener cleanup**: Properly removes device orientation listeners

## Known Issues Fixed

1. **Slow motion persistence**: Fixed by resetting `animationStartTime` when fade-out starts
2. **Animation continuing after modal closes**: Fixed by detecting `forceHovered` change and stopping animation
3. **Infinite loops**: Prevented by checking `hasInitializedRef` before restarting

