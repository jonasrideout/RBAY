export default function Login() {
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
              <a href="/" className="nav-link">Home</a>
              <a href="/register" className="nav-link">Register School</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ flex: 1, paddingTop: '3rem' }}>
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          
          <div className="card">
            <h1 className="text-center mb-3">Teacher Login</h1>
            <p className="text-center mb-4" style={{ color: '#6c757d' }}>
              Sign in to manage your school and students
            </p>

            <form>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  className="form-input" 
                  placeholder="your.email@school.edu"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  className="form-input" 
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div className="form-group">
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Sign In
                </button>
              </div>
            </form>

            <div className="text-center mt-3">
              <a href="/forgot-password" style={{ color: '#4a90e2', textDecoration: 'none' }}>
                Forgot your password?
              </a>
            </div>

            <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #e9ecef' }} />

            <div className="text-center">
              <p style={{ color: '#6c757d', marginBottom: '1rem' }}>
                New to The Right Back at You Project?
              </p>
              <a href="/register" className="btn btn-outline" style={{ width: '100%' }}>
                Register Your School
              </a>
            </div>

          </div>

          {/* Help Section */}
          <div className="card mt-3" style={{ background: '#f8f9fa' }}>
            <h3>Need Help?</h3>
            <p style={{ marginBottom: '1rem' }}>
              If you're having trouble logging in or need to register your school for the project, please contact us:
            </p>
            <p style={{ marginBottom: '0' }}>
              <strong>Email:</strong> <a href="mailto:carolyn.mackler@gmail.com" style={{ color: '#4a90e2' }}>carolyn.mackler@gmail.com</a>
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: '#343a40', color: 'white', padding: '2rem 0', marginTop: '3rem' }}>
        <div className="container text-center">
          <p>&copy; 2024 The Right Back at You Project by Carolyn Mackler. Building empathy and connection through literature.</p>
        </div>
      </footer>
    </div>
  );
}
