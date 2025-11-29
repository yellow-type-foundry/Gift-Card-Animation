# UI Card Prototype

A modern React + Next.js project for prototyping beautiful UI card designs with multiple layouts, animations, and social sharing capabilities.

## Features

- ⚛️ React 18
- 🚀 Next.js 16
- 🎨 Tailwind CSS for styling
- 🎯 Multiple card layouts (Layout 1, Layout 2, Layout 3)
- ✨ Advanced confetti animations with blur layers
- 📸 Card capture API for social sharing
- 🎨 Themed color system with dynamic color manipulation
- 📱 Responsive design
- 🎭 3D hover effects and animations

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3004`

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## Project Structure

```
├── app/
│   ├── api/
│   │   └── capture-card/     # API route for card image capture
│   ├── capture-page/         # Dedicated page for card capture
│   ├── globals.css           # Global styles
│   ├── layout.jsx            # Root layout
│   └── page.jsx              # Main page with layout controls
├── components/
│   ├── CardGrid.jsx          # Grid layout for cards
│   ├── ControlBar.jsx        # Layout/style controls
│   ├── GiftCard.jsx          # Gift card component
│   ├── Layout3Box.jsx        # Layout 3 box component
│   ├── Layout3Canvas.jsx    # Layout 3 canvas container
│   ├── SentCard.jsx         # Sent card component (Layout 1)
│   ├── SentCard1.jsx        # Alternative sent card component
│   ├── SentCard4.jsx        # Sent card variant
│   ├── ShareModal.jsx       # Social sharing modal
│   └── sent-card/           # Sent card sub-components
│       ├── Box2.jsx         # Gift box component
│       ├── Envelope1.jsx    # Envelope variant 1
│       ├── Envelope2.jsx    # Envelope variant 2
│       └── ...
├── constants/
│   ├── sentCardConstants.js # Layout and confetti configurations
│   ├── tokens.js            # Design tokens
│   └── giftBoxTokens.js     # Gift box design tokens
├── hooks/
│   ├── useConfettiLayout0.js # Confetti for Layout 1 Style B
│   ├── useConfettiLayout1.js # Confetti for Layout 1 Style A
│   ├── useCardTheme.js      # Card theming logic
│   └── ...
├── utils/
│   ├── colors.js            # Color manipulation utilities
│   └── cardData.js          # Card data generation
├── public/
│   └── assets/              # Static assets (images, SVGs)
└── scripts/
    └── postinstall.mjs      # Post-install scripts
```

## Layouts

The project supports three main layouts:

### Layout 1
- **Style A**: Box1 with Envelope1, breathing grid cells
- **Style B**: Box2 with Envelope2, advanced confetti with blur layers

### Layout 2
- Alternative card layout with different styling

### Layout 3
- Modern box design with:
  - Frosted glass effect (backdrop blur)
  - Themed color system
  - Progress blobs
  - Pull tab
  - Logo container
  - Progress indicator

## Key Features

### Confetti Animations
- Multiple blur layers for depth effect
- Gift box collision detection
- Gyroscope/tilt interaction on mobile
- Frame-based pausing for capture

### Card Capture
- API route for generating card images
- Puppeteer-based screenshot generation
- Vercel-optimized with chromium-min
- Social sharing integration

### Theming System
- Dynamic color manipulation (HSL-based)
- Themed shadows and gradients
- Consistent color theming across components

## Documentation

- `LAYOUT_ISOLATION_GUIDE.md` - Guide for maintaining layout isolation
- `VERCEL_TEST_CHECKLIST.md` - Deployment checklist for Vercel

## Development Notes

- Layout isolation is enforced through explicit layout guards (`isLayout1`, `isLayout2`, `isLayout3`)
- Performance optimizations include React.memo, memoized styles, and static style objects
- Color theming uses HSL manipulation for consistent theming across components

## Customization

- Edit layout configurations in `constants/sentCardConstants.js`
- Modify card components in `components/`
- Adjust design tokens in `constants/tokens.js`
- Update color theming in `utils/colors.js`
