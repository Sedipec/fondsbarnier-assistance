import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer footer-center bg-base-200 text-base-content p-4">
      <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
        <p>Copyright 2026 SEDIPEC - Tous droits reserves</p>
        <Link href="/about" className="link link-hover">
          A propos
        </Link>
      </div>
    </footer>
  );
}
