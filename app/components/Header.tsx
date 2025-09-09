// /app/components/Header.tsx

import Link from 'next/link';

interface HeaderProps {
  showLogin?: boolean;
  session?: any;
  onLogout?: () => void;
}

export default function Header({ showLogin = false, session, onLogout }: HeaderProps) {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src="/RB@Y-logo.jpg" alt="Right Back at You" style={{ height: '40px' }} />
            The Right Back at You Project
          </Link>
          <nav className={showLogin || session ? "nav-login" : "nav-invisible"}>
            {session ? (
              // Authenticated user - show logout button
              <button 
                onClick={onLogout}
                className="btn btn-primary"
                style={{ 
                  background: '#dc3545',
                  borderColor: '#dc3545'
                }}
              >
                Logout
              </button>
            ) : showLogin ? (
              // Unauthenticated user - show login button and helper text
              <>
                <Link href="/login" className="btn btn-primary">Login or Sign Up</Link>
                <span style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                  Sign in to register or access your school
                </span>
              </>
            ) : null}
          </nav>
        </div>
      </div>
    </header>
  );
}
