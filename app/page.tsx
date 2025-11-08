// /app/page.tsx

import Link from 'next/link';
import Header from './components/Header';

export default function Home() {
  return (
    <div className="page">
      {/* Header */}
      <Header showLogin={false} />

      {/* Main Content */}
      <main
        className="container"
        style={{
          flex: 1,
          paddingTop: '5rem',
          paddingBottom: '5rem',
          textAlign: 'center',
        }}
      >
        <section>
          <h1
            className="text-h1"
            style={{
              fontWeight: 300,
              marginBottom: '1.5rem',
            }}
          >
            We’ll Be Right Back
          </h1>
          <p
            style={{
              fontSize: '1.1rem',
              color: '#666',
              fontWeight: 300,
              lineHeight: 1.6,
              maxWidth: '700px',
              margin: '0 auto',
            }}
          >
            Our site is currently undergoing scheduled maintenance to improve your experience.  
            Please check back soon.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          background: '#f8f9fa',
          borderTop: '1px solid #e9ecef',
          color: '#666',
          padding: '2rem 0',
        }}
      >
        <div className="container" style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: 300, fontSize: '0.9rem' }}>
            © 2025 The Right Back at You Project by Carolyn Mackler.
          </p>
          <div style={{ marginTop: '1rem' }}>
            <Link
              href="/contact"
              style={{
                color: '#2c5aa0',
                textDecoration: 'none',
                margin: '0 1rem',
                fontWeight: 300,
                fontSize: '0.9rem',
              }}
            >
              Contact
            </Link>
            <Link
              href="/privacy"
              style={{
                color: '#2c5aa0',
                textDecoration: 'none',
                margin: '0 1rem',
                fontWeight: 300,
                fontSize: '0.9rem',
              }}
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              style={{
                color: '#2c5aa0',
                textDecoration: 'none',
                margin: '0 1rem',
                fontWeight: 300,
                fontSize: '0.9rem',
              }}
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
