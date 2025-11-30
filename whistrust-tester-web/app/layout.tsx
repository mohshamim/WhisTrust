import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WhisTrust Testing Tool',
  description: 'Web-based automation testing tool for WhisTrust',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

