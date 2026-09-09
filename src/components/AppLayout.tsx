import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';

/** Top-level chrome: brand mark + primary nav. Content renders below. */
export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-blueprint-2/30 bg-ink text-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <BrandMark />
            <span className="font-display text-lg font-semibold uppercase tracking-widest">
              Sand Table
            </span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <NavItem to="/">Hangar</NavItem>
            <NavItem to="/settings">Settings</NavItem>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}

function NavItem({ to, children }: { to: string; children: ReactNode }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `rounded px-3 py-1.5 font-sans transition-colors ${
          isActive ? 'bg-blueprint text-white' : 'text-white/70 hover:text-white'
        }`
      }
    >
      {children}
    </NavLink>
  );
}

function BrandMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 64 64" aria-hidden="true">
      <line x1="14" y1="32" x2="50" y2="32" stroke="#7FA8CE" strokeWidth="3" />
      <rect x="10" y="28" width="8" height="8" fill="#2E7D5B" />
      <rect x="28" y="28" width="8" height="8" fill="#1D5FA8" />
      <rect x="46" y="28" width="8" height="8" fill="#7FA8CE" />
    </svg>
  );
}
