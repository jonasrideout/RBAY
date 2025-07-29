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
          <h1>Connect Students Through Reading & Writing</h1>
          <p style={{ fontSize: '1.2rem', color: '#6c757d', marginBottom: '2rem' }}>
            Match students from different schools to share their love of books through penpal letters
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/register" className="btn btn-primary">Get Started</a>
            <a href="/about" className="btn btn-outline">Learn More</a>
          </div>
        </section>

        {/* Features */}
        <section className="grid grid-3 mt-4">
          <div className="card text-center">
            <h3>📚 Book-Based Learning</h3>
            <p>Students discuss their reading with peers from other schools, deepening comprehension and engagement.</p>
          </div>
          
          <div className="card text-center">
            <h3>🤝 Smart Matching</h3>
            <p>Our algorithm pairs students based on shared interests, reading levels, and compatible class sizes.</p>
          </div>
          
          <div className="card text-center">
            <h3>🛡️ Safe & Moderated</h3>
            <p>Teacher oversight and content moderation ensure a safe, educational environment for all students.</p>
          </div>
        </section>

        {/* How It Works */}
        <section className="mt-4">
          <div className="card">
            <h2 className="text-center mb-3">How It Works</h2>
            <div className="grid grid-2">
              <div>
                <h4>For Teachers:</h4>
                <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                  <li>Register your school and class</li>
                  <li>Add students and their interests</li>
                  <li>Get matched with a compatible school</li>
                  <li>Receive printable penpal assignments</li>
                  <li>Facilitate letter writing in class</li>
                </ul>
              </div>
              <div>
                <h4>For Students:</h4>
                <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                  <li>Share your interests and hobbies</li>
                  <li>Get matched with a penpal who shares your interests</li>
                  <li>Write letters about books you're reading</li>
                  <li>Learn about life in a different school/community</li>
                  <li>Build writing skills and make new friends</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center mt-4 mb-4">
          <div className="card" style={{ background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)', color: 'white' }}>
            <h2 style={{ color: 'white' }}>Ready to Connect Your Students?</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
              Join schools across the country in building literacy, empathy, and communication skills through the power of penpal relationships.
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
          <p>&copy; 2024 The Right Back at You Project. Connecting students through literacy and friendship.</p>
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
