import './globals.css'

export const metadata = {
  title: 'UI Card Prototype',
  description: 'Gift card component prototype',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

