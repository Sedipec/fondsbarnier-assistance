import type { Metadata } from 'next';
import Footer from '@/components/shared/Footer';
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
      <body className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
