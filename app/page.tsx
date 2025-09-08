import Link from 'next/link';

export default function Home() {
  return (
    <div className="page">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/RB@Y-logo.jpg" alt="Right Back at You" style={{ height: '40px' }} />
              The Right Back at You Project
            </Link>
            <nav className="nav">
            <Link href="/login" className="btn btn-primary">Login or Sign Up</Link>
            <span style={{ fontSize: '0.85rem', color: '#6c757d' }}>
            Sign in to register or access your school
              </span>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ flex: 1, paddingTop: '3rem' }}>
        
        {/* Hero Section */}
        <section className="text-center mb-4">
          <h1>Building Empathy Through Literature & Letters</h1>
          <p style={{ fontSize: '1.2rem', color: '#6c757d', marginBottom: '2rem' }}>
            Connect students across geographic regions to combat bullying and discover their shared humanity through the power of penpal correspondence
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" className="btn btn-primary">Get Started</Link>
            <Link href="/about" className="btn btn-outline">Learn More</Link>
          </div>
        </section>

        {/* Features */}
        <section className="mt-4">
          <h2 className="text-center mb-3">The Three-Part Project</h2>
          <div className="grid grid-3">
            <div className="card text-center">
              <h3>📚 Shared Reading Experience</h3>
              <p>Students from different regions read "Right Back at You" together, exploring themes of bullying, empathy, and connection.</p>
            </div>
            
            <div className="card text-center">
              <h3>🎤 Virtual Author Visit</h3>
              <p>Join author Carolyn Mackler in a virtual session where students share anti-bullying solutions from their communities.</p>
            </div>
            
            <div className="card text-center">
              <h3>✉️ Cross-Regional Pen Pals</h3>
              <p>Students correspond with peers from different geographic areas, discovering commonalities despite their differences.</p>
            </div>
          </div>
        </section>

        {/* About the Book */}
        <section className="mt-4">
          <div className="card">
            <h2 className="text-center mb-3">About "Right Back at You"</h2>
            <p style={{ fontSize: '1.1rem', textAlign: 'center', marginBottom: '1.5rem' }}>
              A powerful middle-grade novel told through letters between Talia (Western Pennsylvania, 1987) and Mason (New York City, 2023) - two seventh graders who discover that bullying transcends time and geography.
            </p>
            <div className="grid grid-2">
              <div>
                <h4>The Story</h4>
                <p>When Talia and Mason find a mysterious way to communicate across thirty-six years and three hundred miles, they're both skeptical. But as they share their experiences of being bullied, they form an unlikely friendship and realize they have more in common than they thought.</p>
              </div>
              <div>
                <h4>The Impact</h4>
                <p>Through their correspondence, students explore universal themes of bullying, resilience, and empathy while learning that connection and understanding can bridge any divide - whether it's time, distance, or differences.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center mt-4 mb-4">
          <div className="card" style={{ background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)', color: 'white' }}>
            <h2 style={{ color: 'white' }}>Ready to Build Empathy in Your Community?</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
              Join schools across different regions in encouraging students to become part of the solution to bullying through literature, discussion, and meaningful connections.
            </p>
            <Link href="/login" className="btn btn-outline" style={{ borderColor: 'white', color: 'white' }}>
              Join the Project Today
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer style={{ background: '#343a40', color: 'white', padding: '2rem 0', marginTop: '3rem' }}>
        <div className="container text-center">
          <p>&copy; 2024 The Right Back at You Project by Carolyn Mackler. Building empathy and connection through literature.</p>
          <div style={{ marginTop: '1rem' }}>
            <Link href="/contact" style={{ color: '#adb5bd', textDecoration: 'none', margin: '0 1rem' }}>Contact</Link>
            <Link href="/privacy" style={{ color: '#adb5bd', textDecoration: 'none', margin: '0 1rem' }}>Privacy</Link>
            <Link href="/terms" style={{ color: '#adb5bd', textDecoration: 'none', margin: '0 1rem' }}>Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
