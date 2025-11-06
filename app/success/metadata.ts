import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Report Submitted Successfully',
  description: 'Your anonymous report has been submitted securely. Use your tracking code to monitor progress and communicate with the compliance team.',
  openGraph: {
    title: 'Report Submitted - WhisTrust',
    description: 'Your report has been received and will be reviewed',
    type: 'website',
  },
  alternates: {
    canonical: '/success',
  },
  robots: {
    index: false, // Don't index success pages
    follow: false,
  },
}

