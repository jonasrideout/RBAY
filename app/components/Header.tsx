// /app/components/Header.tsx

import Link from 'next/link';

interface HeaderProps {
  showLogin?: boolean;
}

export default function Header({ showLogin = false }: HeaderProps) {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src="/RB@Y-logo.jpg" alt="Right Back at You" style={{ height: '40px' }} />
            The Right Back at You Project
          </Link>
          {showLogin && (
            <nav className="nav" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
              <Link href="/login" className="btn btn-primary">Login or Sign Up</Link>
              <span style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                Sign in to register or access your school
              </span>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
