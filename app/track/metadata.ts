import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Track Your Report',
  description: 'Track your anonymous report status using your unique tracking code. View case updates, status changes, and communicate securely with the compliance team.',
  keywords: [
    'track report',
    'case status',
    'tracking code',
    'report updates',
    'case tracking',
    'whistleblower follow-up',
  ],
  openGraph: {
    title: 'Track Your Report - WhisTrust',
    description: 'Check the status of your anonymous report using your tracking code',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Track Your Report',
    description: 'Monitor your anonymous report status',
  },
  alternates: {
    canonical: '/track',
  },
  robots: {
    index: true,
    follow: true,
  },
}

