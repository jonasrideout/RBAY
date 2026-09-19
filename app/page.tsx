// /app/page.tsx

import Link from 'next/link';
import Header from './components/Header';

const COLOR_INDIGO = '#3B3F8C';
const COLOR_VIOLET = '#5B4F86';

export default function Home() {
  return (
    <div className="page" style={{ backgroundColor: '#EDEAF5' }}>
      {/* Header */}
      <Header showLogin={true} themed />

      {/* Main Content */}
      <main className="container" style={{ flex: 1, paddingTop: '3rem', paddingBottom: '3rem' }}>
        
        {/* Hero Section */}
        <section style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 700, color: COLOR_INDIGO, marginBottom: '1rem' }}>
            Building Empathy Through Literature &amp; Letters
          </h1>
          <p style={{ 
            fontSize: '1.1rem', 
            color: '#8A87A0', 
            marginBottom: '2rem',
            fontWeight: 300,
            lineHeight: 1.6,
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            Connect students across geographic regions to combat bullying and discover their shared humanity through conversation and a penpal correspondence.
          </p>
        </section>

        {/* Features */}
        <section style={{ marginTop: '3rem' }}>
          <h2 style={{ 
            fontFamily: 'var(--font-heading)',
            fontSize: '1.7rem',
            fontWeight: 700,
            color: COLOR_INDIGO,
            textAlign: 'center', 
            marginBottom: '2rem'
          }}>
            A Three-Part Project
          </h2>
          <div className="grid grid-3">
            <div className="card" style={{ borderRadius: '20px' }}>
              <h3 style={{ 
                fontFamily: 'var(--font-heading)',
                fontSize: '1.3rem',
                fontWeight: 700,
                color: COLOR_INDIGO,
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                📚 Shared Reading Experience
              </h3>
              <p style={{ fontWeight: 300, color: '#555', lineHeight: 1.6 }}>
                Students from different regions read <em>Right Back at You</em> at the same time, exploring with their class themes of bullying, empathy, and connection.
              </p>
            </div>
            
            <div className="card" style={{ borderRadius: '20px' }}>
              <h3 style={{ 
                fontFamily: 'var(--font-heading)',
                fontSize: '1.3rem',
                fontWeight: 700,
                color: COLOR_INDIGO,
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                🎤 Virtual Author Visit
              </h3>
              <p style={{ fontWeight: 300, color: '#555', lineHeight: 1.6 }}>
                Join author Carolyn Mackler in a virtual session where students from these two schools share anti-bullying solutions from their communities.
              </p>
            </div>
            
            <div className="card" style={{ borderRadius: '20px' }}>
              <h3 style={{ 
                fontFamily: 'var(--font-heading)',
                fontSize: '1.3rem',
                fontWeight: 700,
                color: COLOR_INDIGO,
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                ✉️ Cross-Regional Pen Pals
              </h3>
              <p style={{ fontWeight: 300, color: '#555', lineHeight: 1.6 }}>
                Students correspond with peers from different geographic areas, discovering commonalities despite their differences.
              </p>
            </div>
          </div>
        </section>

        {/* About the Book */}
        <section style={{ marginTop: '3rem' }}>
          <div className="card" style={{ borderRadius: '20px' }}>
            <h2 style={{ 
              fontFamily: 'var(--font-heading)',
              fontSize: '1.7rem',
              fontWeight: 700,
              color: COLOR_INDIGO,
              textAlign: 'center', 
              marginBottom: '2rem'
            }}>
              About <em>Right Back at You</em>
            </h2>
            <p style={{ 
              fontSize: '1.05rem', 
              textAlign: 'center', 
              marginBottom: '2rem',
              fontWeight: 300,
              color: '#555',
              lineHeight: 1.6
            }}>
              A powerful middle-grade novel by Carolyn Mackler told through letters between Talia (Western Pennsylvania, 1987) and Mason (New York City, 2023) - two seventh graders who discover that bullying transcends time and geography. Luckily, so does friendship!
            </p>
            <div className="grid grid-2">
              <div>
                <h4 style={{ 
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: COLOR_VIOLET,
                  marginBottom: '0.75rem'
                }}>
                  The Story
                </h4>
                <p style={{ fontWeight: 300, color: '#555', lineHeight: 1.6 }}>
                  When Talia and Mason find a mysterious way to communicate across thirty-six years and three hundred miles, they're both skeptical. But as they share their experiences being bullied, they form an unlikely friendship and realize they have more in common than they thought.
                </p>
              </div>
              <div>
                <h4 style={{ 
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: COLOR_VIOLET,
                  marginBottom: '0.75rem'
                }}>
                  The Impact
                </h4>
                <p style={{ fontWeight: 300, color: '#555', lineHeight: 1.6 }}>
                  Through Talia and Mason's correspondence, students explore universal themes of bullying, resilience, and empathy while learning that connection and understanding can bridge any divide - whether it's time, distance, or differences.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section style={{ textAlign: 'center', marginTop: '3rem' }}>
          <div className="card" style={{ 
            background: `linear-gradient(135deg, ${COLOR_INDIGO} 0%, #2A2D63 100%)`, 
            color: 'white',
            padding: '3rem 2rem',
            borderRadius: '20px'
          }}>
            <h2 style={{ 
              fontFamily: 'var(--font-heading)',
              color: 'white',
              fontSize: '1.8rem',
              fontWeight: 700,
              marginBottom: '1rem'
            }}>
              Ready to Build Empathy in Your Community?
            </h2>
            <p style={{ 
              fontSize: '1.05rem', 
              marginBottom: '2rem',
              fontWeight: 300,
              lineHeight: 1.6,
              maxWidth: '700px',
              margin: '0 auto 2rem'
            }}>
              Join schools across different regions as we encourage students to become part of the solution to bullying through literature, discussion, and meaningful connections.
            </p>
            <Link href="/login" className="btn-blue" style={{ 
              backgroundColor: 'white',
              color: COLOR_INDIGO,
              border: '2px solid white',
              borderRadius: '10px',
              display: 'inline-flex'
            }}>
              Join The Right Back at You Project Today
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer style={{ 
        background: 'transparent', 
        borderTop: '1px solid #DAD7E8',
        color: '#8A87A0', 
        padding: '2rem 0'
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: 300, fontSize: '0.9rem' }}>
            © 2025 The Right Back at You Project by Carolyn Mackler. Building empathy and connection through literature.
          </p>
          <div style={{ marginTop: '1rem' }}>
            <Link 
              href="/contact" 
              style={{ 
                color: COLOR_VIOLET, 
                textDecoration: 'none', 
                margin: '0 1rem',
                fontWeight: 300,
                fontSize: '0.9rem'
              }}
            >
              Contact
            </Link>
            <Link 
              href="/privacy" 
              style={{ 
                color: COLOR_VIOLET, 
                textDecoration: 'none', 
                margin: '0 1rem',
                fontWeight: 300,
                fontSize: '0.9rem'
              }}
            >
              Privacy
            </Link>
            <Link 
              href="/terms" 
              style={{ 
                color: COLOR_VIOLET, 
                textDecoration: 'none', 
                margin: '0 1rem',
                fontWeight: 300,
                fontSize: '0.9rem'
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
