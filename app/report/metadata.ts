import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Submit Anonymous Report',
  description: 'Submit a secure, anonymous report about misconduct, fraud, harassment, or policy violations. Your identity is protected with end-to-end encryption.',
  keywords: [
    'submit anonymous report',
    'report misconduct',
    'whistleblowing form',
    'confidential reporting',
    'report fraud',
    'report harassment',
  ],
  openGraph: {
    title: 'Submit Anonymous Report - WhisTrust',
    description: 'Securely report misconduct, fraud, or policy violations anonymously',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Submit Anonymous Report',
    description: 'Secure, confidential reporting platform',
  },
  alternates: {
    canonical: '/report',
  },
  robots: {
    index: true,
    follow: true,
  },
}

