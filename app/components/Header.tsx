// /app/components/Header.tsx
import Link from 'next/link';

interface HeaderProps {
  showLogin?: boolean;
  session?: any;
  onLogout?: () => void;
  // When true, applies the teacher-dashboard color palette (indigo/violet)
  // instead of the site default. Opt-in only, via inline overrides - this
  // component is shared with admin, login, and registration pages, which
  // must stay on the default styling untouched.
  themed?: boolean;
}

export default function Header({ showLogin = false, session, onLogout, themed = false }: HeaderProps) {
  const COLOR_INDIGO = '#3B3F8C';
  const COLOR_SLATE = '#8A87A0';
  const COLOR_CORAL = '#D98B7A';

  return (
    <header className="header" style={themed ? { backgroundColor: 'transparent', boxShadow: 'none', borderBottom: '1px solid #DAD7E8' } : undefined}>
      <div className="container">
        <div className="header-content">
          <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src="/RB@Y-logo.jpg" alt="Right Back at You" style={{ height: '40px' }} />
            <span style={{ fontWeight: themed ? 700 : 300, fontFamily: themed ? 'var(--font-heading)' : undefined, color: themed ? COLOR_INDIGO : undefined }}>The Right Back at You Project</span>
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
                    color: themed ? COLOR_CORAL : '#dc3545',
                    borderColor: themed ? COLOR_CORAL : '#dc3545',
                    borderRadius: themed ? '10px' : undefined
                  }}
                >
                  Logout
                </button>
                <span style={{ fontSize: '0.85rem', color: themed ? COLOR_SLATE : '#666', fontWeight: 300 }}>
                  Logged in as: {session.user?.email}
                </span>
              </>
            ) : showLogin ? (
              // Unauthenticated user - show login button and helper text
              <>
                <Link
                  href="/login"
                  className="btn-blue"
                  style={themed ? { backgroundColor: COLOR_INDIGO, borderColor: COLOR_INDIGO, borderRadius: '10px', color: 'white' } : undefined}
                >
                  Login or Sign Up
                </Link>
                <span style={{ fontSize: '0.85rem', color: themed ? COLOR_SLATE : '#666', fontWeight: 300 }}>
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
