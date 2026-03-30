import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { SessionProvider } from '@/components/auth/SessionProvider';
import Navbar from '@/components/shared/Navbar';
import './globals.css';

const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const plausibleUrl = process.env.NEXT_PUBLIC_PLAUSIBLE_URL || 'https://plausible.io';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://fondsbarnier-assistance.fr',
  ),
  title: {
    default: 'FondsBarnierAssistance - Assistance sinistres inondation',
    template: '%s | FondsBarnierAssistance',
  },
  description:
    'Constituez et suivez votre dossier Fonds Barnier (Cat Nat) pour votre sinistre inondation.',
  openGraph: {
    title: 'FondsBarnierAssistance - Assistance sinistres inondation',
    description:
      'Constituez et suivez votre dossier Fonds Barnier (Cat Nat) pour votre sinistre inondation.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'FondsBarnierAssistance',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FondsBarnierAssistance - Assistance sinistres inondation',
    description:
      'Constituez et suivez votre dossier Fonds Barnier (Cat Nat) pour votre sinistre inondation.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" data-theme="light" className={inter.variable}>
      <head>
        {plausibleDomain && (
          <Script
            strategy="afterInteractive"
            data-domain={plausibleDomain}
            src={`${plausibleUrl}/js/script.js`}
          />
        )}
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <Navbar />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
