export default function RegisterStudent() {
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
              <a href="/login" className="nav-link">Login</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ flex: 1, paddingTop: '3rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          
          <div className="card">
            <h1 className="text-center mb-3">Student Registration</h1>
            <p className="text-center mb-4" style={{ color: '#6c757d' }}>
              Join The Right Back at You Project and connect with students from other schools!
            </p>

            <form>
              {/* Teacher Connection */}
              <div className="form-group">
                <label htmlFor="teacher-email" className="form-label">
                  Your Teacher's Email Address *
                </label>
                <input 
                  type="email" 
                  id="teacher-email" 
                  name="teacher-email" 
                  className="form-input" 
                  placeholder="ms.johnson@school.edu"
                  required
                />
                <small style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                  This helps us connect you to your school and classmates
                </small>
              </div>

              {/* Student Information */}
              <div className="grid grid-2">
                <div className="form-group">
                  <label htmlFor="first-name" className="form-label">First Name *</label>
                  <input 
                    type="text" 
                    id="first-name" 
                    name="first-name" 
                    className="form-input" 
                    placeholder="Your first name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="last-name" className="form-label">Last Name *</label>
                  <input 
                    type="text" 
                    id="last-name" 
                    name="last-name" 
                    className="form-input" 
                    placeholder="Your last name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="grade" className="form-label">Grade Level *</label>
                <select id="grade" name="grade" className="form-select" required>
                  <option value="">Select your grade</option>
                  <option value="3">3rd Grade</option>
                  <option value="4">4th Grade</option>
                  <option value="5">5th Grade</option>
                  <option value="6">6th Grade</option>
                  <option value="7">7th Grade</option>
                  <option value="8">8th Grade</option>
                </select>
              </div>

              {/* Interests Section */}
              <div className="form-group">
                <label className="form-label">Your Interests & Hobbies</label>
                <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Select all that apply - this helps us find you a great penpal!
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" name="interests" value="sports" />
                    🏀 Sports & Athletics
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" name="interests" value="arts" />
                    🎨 Arts & Creativity
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" name="interests" value="reading" />
                    📚 Reading & Books
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" name="interests" value="technology" />
                    💻 Technology & Gaming
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" name="interests" value="animals" />
                    🐕 Animals & Nature
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" name="interests" value="entertainment" />
                    🎬 Entertainment & Media
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" name="interests" value="social" />
                    👥 Social & Family
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" name="interests" value="academic" />
                    🧮 Academic Subjects
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" name="interests" value="hobbies" />
                    🎯 Hobbies & Collections
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" name="interests" value="outdoors" />
                    🏕️ Outdoor Activities
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" name="interests" value="music" />
                    🎵 Music & Performance
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" name="interests" value="fashion" />
                    👗 Fashion & Style
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="other-interests" className="form-label">Other Interests</label>
                <textarea 
                  id="other-interests" 
                  name="other-interests" 
                  className="form-textarea" 
                  placeholder="Tell us about any other hobbies, interests, or activities you enjoy..."
                  rows={3}
                ></textarea>
              </div>

              {/* Account Setup */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">Your Email Address *</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  className="form-input" 
                  placeholder="your.email@example.com"
                  required
                />
                <small style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                  This will be your login username
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Create Password *</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  className="form-input" 
                  placeholder="Create a secure password"
                  required
                />
              </div>

              {/* Parent/Guardian Information */}
              <div className="card" style={{ background: '#f8f9fa', padding: '1.5rem' }}>
                <h3>Parent/Guardian Information</h3>
                <p style={{ color: '#6c757d', marginBottom: '1rem' }}>
                  We need a parent or guardian's permission for you to participate in this project.
                </p>
                
                <div className="grid grid-2">
                  <div className="form-group">
                    <label htmlFor="parent-name" className="form-label">Parent/Guardian Name *</label>
                    <input 
                      type="text" 
                      id="parent-name" 
                      name="parent-name" 
                      className="form-input" 
                      placeholder="Parent or guardian's name"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="parent-email" className="form-label">Parent/Guardian Email *</label>
                    <input 
                      type="email" 
                      id="parent-email" 
                      name="parent-email" 
                      className="form-input" 
                      placeholder="parent@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <input type="checkbox" name="parent-consent" required />
                    <span>
                      I have permission from my parent/guardian to participate in The Right Back at You Project, 
                      including reading the book and exchanging letters with students from other schools. *
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="form-group text-center">
                <button type="submit" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                  Join the Project!
                </button>
              </div>
            </form>

          </div>

          {/* Help Section */}
          <div className="card mt-3" style={{ background: '#f8f9fa' }}>
            <h3>Questions?</h3>
            <p style={{ marginBottom: '1rem' }}>
              If you need help registering or have questions about the project, ask your teacher or contact us:
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
