export default function Home() {
  return (
    <div className="page">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <a href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/RB@Y-logo.jpg" alt="Right Back at You" style={{ height: '40px' }} />
              The Right Back at You Project
            </a>
            <nav className="nav">
              <a href="/login" className="nav-link">Login</a>
              <a href="/register" className="btn btn-primary">Register School</a>
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
            <a href="/register" className="btn btn-primary">Join the Project</a>
            <a href="/about" className="btn btn-outline">Learn More</a>
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

        {/* How It Works */}
        <section className="mt-4">
          <div className="card">
            <h2 className="text-center mb-3">The Three-Part Project</h2>
            <div className="grid grid-3">
              <div>
                <h4>Part 1: Shared Reading</h4>
                <p>Elementary and middle school students from two schools in different geographic regions read <em>Right Back at You</em> simultaneously. Scholastic provides discounted books and discussion guides.</p>
              </div>
              <div>
                <h4>Part 2: Author Visit</h4>
                <p>Author Carolyn Mackler conducts a joint virtual visit where students from both schools share thoughts on bullying and discuss solutions for building empathy and kindness.</p>
              </div>
              <div>
                <h4>Part 3: Pen Pal Correspondence</h4>
                <p>Students exchange letters with peers from the partner school, building connections across geographic boundaries and discovering their shared experiences.</p>
              </div>
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
            <a href="/register" className="btn btn-outline" style={{ borderColor: 'white', color: 'white' }}>
              Register Your School Today
            </a>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer style={{ background: '#343a40', color: 'white', padding: '2rem 0', marginTop: '3rem' }}>
        <div className="container text-center">
          <p>&copy; 2024 The Right Back at You Project by Carolyn Mackler. Building empathy and connection through literature.</p>
          <div style={{ marginTop: '1rem' }}>
            <a href="/contact" style={{ color: '#adb5bd', textDecoration: 'none', margin: '0 1rem' }}>Contact</a>
            <a href="/privacy" style={{ color: '#adb5bd', textDecoration: 'none', margin: '0 1rem' }}>Privacy</a>
            <a href="/terms" style={{ color: '#adb5bd', textDecoration: 'none', margin: '0 1rem' }}>Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
