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
    "WhisTrust enables secure, anonymous whistleblowing and ethics reporting for organizations. Enterprise-grade security, RBAC, end-to-end encryption, and compliance-ready data handling.",
  keywords: [
    "whistleblowing platform",
    "anonymous reporting",
    "ethics reporting",
    "compliance software",
    "secure reporting",
    "whistleblower protection",
    "corporate compliance",
    "fraud reporting",
    "harassment reporting",
    "confidential reporting",
    "RBAC",
    "audit logging",
    "encrypted messaging",
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
      "Enterprise-grade anonymous whistleblowing platform with end-to-end encryption, RBAC, and compliance-ready features. Enable secure, confidential reporting in your organization.",
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
      "Enterprise-grade anonymous whistleblowing platform with end-to-end encryption and RBAC",
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
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
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
