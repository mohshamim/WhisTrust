import { NextResponse } from "next/server";

// Serve a simple SVG avatar placeholder to resolve 404s on /avatars/default.jpg
// Even though the URL ends with .jpg, browsers accept SVG responses with proper content type.
export async function GET() {
	// Neutral, accessible placeholder avatar
	const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" role="img" aria-label="Default avatar">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" fill="url(#g)"/>
  <circle cx="64" cy="48" r="24" fill="#94a3b8"/>
  <path d="M16 116c8-22 28-36 48-36s40 14 48 36" fill="#94a3b8"/>
</svg>`;

	return new NextResponse(svg, {
		status: 200,
		headers: {
			"Content-Type": "image/svg+xml; charset=utf-8",
			"Cache-Control": "public, max-age=86400, immutable"
		}
	});
}


