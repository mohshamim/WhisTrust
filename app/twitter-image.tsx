import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const alt = 'WhisTrust - Secure Anonymous Reporting Platform'
export const size = {
  width: 1200,
  height: 675,
}
 
export const contentType = 'image/png'
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Shield Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '30px',
          }}
        >
          <svg
            width="100"
            height="100"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
              stroke="#B85C38"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            fontSize: '64px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '15px',
            textAlign: 'center',
          }}
        >
          WhisTrust
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: 'flex',
            fontSize: '32px',
            color: '#B85C38',
            marginBottom: '30px',
            textAlign: 'center',
          }}
        >
          Secure Anonymous Reporting
        </div>

        {/* Description */}
        <div
          style={{
            display: 'flex',
            fontSize: '22px',
            color: '#cccccc',
            maxWidth: '800px',
            textAlign: 'center',
          }}
        >
          Enterprise-grade security • End-to-end encryption • Compliance-ready
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

