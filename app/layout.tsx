import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Collabuu - Influencer Marketing Platform',
  description:
    'Connect businesses with influencers for authentic collaborations',
  keywords: [
    'influencer marketing',
    'social media',
    'brand collaborations',
    'content creators',
  ],
  authors: [{ name: 'Collabuu' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
