import type { Metadata } from 'next';
import Navbar from '@/components/shared/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'FondsBarnierAssistance - Assistance sinistres inondation',
  description:
    'Constituez et suivez votre dossier Fonds Barnier (Cat Nat) pour votre sinistre inondation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" data-theme="light">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
