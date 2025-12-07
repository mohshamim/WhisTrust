import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://whistrust.com"
  ),
  title: {
    default: "WhisTrust - Secure Anonymous Reporting Platform",
    template: "%s | WhisTrust",
  },
  description:
    "WhisTrust is a secure anonymous reporting system and ethics hotline software for organizations. Enterprise-grade whistleblowing platform with end-to-end encryption, GDPR/SOX compliance, and RBAC. Trusted by companies worldwide for confidential employee reporting.",
  keywords: [
    // Primary Low-Competition Keywords (High Volume)
    "anonymous reporting system",
    "ethics hotline software",
    "secure whistleblowing platform",
    "employee reporting software",
    "confidential reporting system",
    "compliance hotline software",
    "encrypted reporting platform",

    // Secondary Keywords (Medium Volume, Low Competition)
    "whistleblowing platform",
    "anonymous reporting",
    "ethics reporting",
    "compliance software",
    "secure reporting",
    "whistleblower protection",
    "corporate compliance",
    "fraud reporting",
    "harassment reporting",

    // Long-tail Keywords (Low Competition, High Intent)
    "best anonymous reporting system",
    "secure whistleblower platform",
    "encrypted compliance reporting",
    "multi-tenant whistleblowing",
    "GDPR compliant reporting system",
    "SOX compliance reporting software",
    "HIPAA compliant anonymous reporting",
    "end-to-end encrypted reporting",

    // Industry-Specific (Low Competition)
    "healthcare compliance reporting",
    "financial services whistleblowing",
    "education sector anonymous reporting",
    "manufacturing ethics hotline",

    // Feature-Focused (Very Low Competition)
    "RBAC compliance platform",
    "audit logging software",
    "real-time reporting system",
    "metadata stripping reporting",
  ],
  authors: [{ name: "WhisTrust" }],
  creator: "WhisTrust",
  publisher: "WhisTrust",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "WhisTrust - Secure Anonymous Reporting Platform",
    description:
      "Secure anonymous reporting system and ethics hotline software. Enterprise-grade whistleblowing platform with end-to-end encryption, GDPR/SOX compliance, and confidential employee reporting.",
    siteName: "WhisTrust",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "WhisTrust - Secure Anonymous Reporting Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WhisTrust - Secure Anonymous Reporting Platform",
    description:
      "Secure anonymous reporting system and ethics hotline software. Enterprise whistleblowing platform with encryption, GDPR/SOX compliance, and confidential reporting.",
    images: ["/twitter-image.png"],
    creator: "@whistrust",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen scrollbar-thin`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
