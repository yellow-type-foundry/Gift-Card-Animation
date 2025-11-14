# UI Card Prototype

A modern React + Next.js project for prototyping beautiful UI card designs.

## Features

- ⚛️ React 18
- 🚀 Next.js 14
- 🎨 Tailwind CSS for styling
- 🎯 Beautiful card components with hover effects
- 📱 Responsive design

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3005`

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
│   ├── globals.css       # Global styles
│   ├── layout.jsx        # Root layout
│   └── page.jsx          # Home page
├── components/
│   └── GiftCard.jsx      # Gift card component
├── constants/
│   └── tokens.js         # Design tokens
├── public/
│   └── assets/           # Static assets
├── package.json
├── next.config.js
└── tailwind.config.js
```

## Customization

Edit `components/GiftCard.jsx` to modify the card design, or create new card variations in `app/page.jsx`.

