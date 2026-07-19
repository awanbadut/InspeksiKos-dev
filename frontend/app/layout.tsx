import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.inspeksikos.web.id'),
  title: {
    default: 'InspeksiKos - Platform Verifikasi & Audit Kejujuran Iklan Kos Padang',
    template: '%s | InspeksiKos Padang',
  },
  description:
    'Platform terverifikasi pertama di Padang yang memvalidasi kejujuran iklan kos secara nyata terintegrasi AI Vision Gemini, pengujian TDS kualitas air, speedtest internet, dan watermark lokasi GPS.',
  keywords: [
    'InspeksiKos',
    'Kos Padang',
    'Info Kos Padang',
    'Sewa Kos Padang',
    'Politeknik Negeri Padang',
    'UNAND',
    'Kos dekat PNP',
    'Audit Kos AI',
    'Verifikasi Kos Terpercaya',
  ],
  authors: [{ name: 'Tim InspeksiKos PNP' }],
  creator: 'InspeksiKos Team',
  publisher: 'InspeksiKos Padang',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: 'https://www.inspeksikos.web.id',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
  openGraph: {
    title: 'InspeksiKos - Audit Kejujuran Iklan Kos Terintegrasi AI',
    description: 'Cegah penipuan iklan kos di Padang. Validasi foto fisik ter-watermark GPS, kualitas air keran TDS, dan kecepatan wifi nyata.',
    url: 'https://www.inspeksikos.web.id',
    siteName: 'InspeksiKos',
    images: [
      {
        url: '/hero_hero-image.webp',
        width: 1200,
        height: 630,
        alt: 'InspeksiKos Padang',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InspeksiKos - Platform Verifikasi Kos Terpercaya Padang',
    description: 'Validasi fasilitas kos secara real-time terintegrasi AI Vision Gemini & Watermark GPS.',
    images: ['/hero_hero-image.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'InspeksiKos',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          crossOrigin=""
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
