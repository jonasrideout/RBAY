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
            <span style={{ fontWeight: 300 }}>The Right Back at You Project</span>
          </Link>
          <nav className={showLogin || session ? "nav-login" : "nav-invisible"}>
            {session ? (
              // Authenticated user - show logout button and admin user display
              <>
                <button 
                  onClick={onLogout}
                  className="btn-blue"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#dc3545',
                    borderColor: '#dc3545'
                  }}
                >
                  Logout
                </button>
                <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: 300 }}>
                  Logged in as: {session.user?.email}
                </span>
              </>
            ) : showLogin ? (
              // Unauthenticated user - show login button and helper text
              <>
                <Link href="/login" className="btn-blue">
                  Login or Sign Up
                </Link>
                <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: 300 }}>
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
