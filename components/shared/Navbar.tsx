import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="navbar bg-base-100 shadow-sm">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl">
          FondsBarnierAssistance
        </Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link href="/about">A propos</Link>
          </li>
          <li>
            <Link href="/join-us">Nous rejoindre</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
