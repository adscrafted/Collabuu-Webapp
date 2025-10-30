import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Collabuu - Connect • Collaborate • Grow',
  description:
    'The ultimate platform connecting businesses with influencers through advanced tokenomics and seamless collaboration.',
  keywords: [
    'influencer marketing',
    'social media',
    'brand collaborations',
    'content creators',
    'tokenomics',
    'QR code marketing',
    'performance-based marketing',
  ],
  authors: [{ name: 'Collabuu' }],
  icons: {
    icon: '/favicon.ico',
    apple: '/landing/images/favicon.svg',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Collabuu',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#00b366',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
