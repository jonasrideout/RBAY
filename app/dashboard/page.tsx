"use client";

export default function TeacherDashboard() {
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
              <a href="/dashboard" className="nav-link">Dashboard</a>
              <a href="/register-school" className="nav-link">School Settings</a>
              <a href="/logout" className="nav-link">Logout</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ flex: 1, paddingTop: '3rem' }}>
        
        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>Teacher Dashboard</h1>
          <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
            Welcome back, Ms. Johnson! Here's your Lincoln Elementary class overview.
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-4" style={{ marginBottom: '3rem' }}>
          <div className="card text-center" style={{ background: '#f8f9fa' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#4a90e2', marginBottom: '0.5rem' }}>
              24
            </div>
            <div style={{ color: '#6c757d', fontWeight: '600' }}>Total Students</div>
            <div style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.25rem' }}>
              Enrolled in class
            </div>
          </div>

          <div className="card text-center" style={{ background: '#f8f9fa' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#28a745', marginBottom: '0.5rem' }}>
              18
            </div>
            <div style={{ color: '#6c757d', fontWeight: '600' }}>Have Interests</div>
            <div style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.25rem' }}>
              Selected categories
            </div>
          </div>

          <div className="card text-center" style={{ background: '#f8f9fa' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffc107', marginBottom: '0.5rem' }}>
              📝 Collecting Info
            </div>
            <div style={{ color: '#6c757d', fontWeight: '600' }}>Class Status</div>
            <div style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.25rem' }}>
              6 students need info
            </div>
          </div>

          <div className="card text-center" style={{ background: '#f8f9fa' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fd7e14', marginBottom: '0.5rem' }}>
              March
            </div>
            <div style={{ color: '#6c757d', fontWeight: '600' }}>Start Date</div>
            <div style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.25rem' }}>
              Requested timeline
            </div>
          </div>
        </div>

        {/* Class Status & Actions */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ color: '#ffc107', marginBottom: '0.5rem' }}>📝 Collecting Student Information</h3>
              <p style={{ color: '#6c757d', marginBottom: '0' }}>
                Complete all student interests before requesting to be matched with another school.
              </p>
            </div>
            <div>
              <button 
                className="btn" 
                style={{ 
                  backgroundColor: '#6c757d', 
                  color: 'white', 
                  cursor: 'not-allowed',
                  padding: '1rem 2rem',
                  fontSize: '1.1rem'
                }}
                disabled
                title="Complete all student information first"
              >
                🔒 Ready for Matching
              </button>
              <p style={{ color: '#6c757d', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '0' }}>
                6 students still need interest information
              </p>
            </div>
          </div>
        </div>



        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={() => {
            const missingInfoSection = document.getElementById('missing-info-section');
            const allStudentsSection = document.getElementById('all-students-section');
            if (missingInfoSection && allStudentsSection) {
              const isHidden = missingInfoSection.style.display === 'none';
              missingInfoSection.style.display = isHidden ? 'block' : 'none';
              allStudentsSection.style.display = isHidden ? 'none' : 'block';
            }
          }}>
            📝 Missing Info (6)
          </button>
          <button className="btn btn-secondary">
            ➕ Add New Student
          </button>
          <button 
            className="btn" 
            style={{ 
              backgroundColor: '#6c757d', 
              color: 'white', 
              cursor: 'not-allowed'
            }}
            disabled
            title="Complete all student information first"
          >
            📥 Download Matches
          </button>
        </div>

        {/* Missing Info Section */}
        <div id="missing-info-section" style={{ display: 'none' }}>
          <div className="card">
            <h3 style={{ color: '#dc3545', marginBottom: '1rem' }}>Students Missing Interest Information</h3>
            <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
              These students haven't selected any interest categories yet. Add their interests to complete your class roster.
            </p>

            <div className="grid grid-2" style={{ gap: '1.5rem' }}>
              
              {/* Missing Info Student */}
              <div className="card" style={{ background: '#fff5f5', border: '2px solid #fed7d7' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ color: '#c53030', marginBottom: '0.25rem' }}>David Rodriguez</h4>
                  <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Grade 5 • No interests selected</span>
                </div>
                
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '6px', border: '1px solid #fed7d7' }}>
                  <h5 style={{ marginBottom: '1rem', color: '#495057' }}>Select David's Interests:</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" name="david-interests" value="sports" />
                      🏀 Sports & Athletics
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" name="david-interests" value="arts" />
                      🎨 Arts & Creativity
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" name="david-interests" value="reading" />
                      📚 Reading & Books
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" name="david-interests" value="technology" />
                      💻 Technology & Gaming
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" name="david-interests" value="animals" />
                      🐕 Animals & Nature
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" name="david-interests" value="entertainment" />
                      🎬 Entertainment & Media
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" name="david-interests" value="social" />
                      👥 Social & Family
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" name="david-interests" value="academic" />
                      🧮 Academic Subjects
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" name="david-interests" value="hobbies" />
                      🎯 Hobbies & Collections
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" name="david-interests" value="outdoors" />
                      🏕️ Outdoor Activities
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" name="david-interests" value="music" />
                      🎵 Music & Performance
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" name="david-interests" value="fashion" />
                      👗 Fashion & Style
                    </label>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Other Interests:</label>
                    <textarea 
                      className="form-textarea" 
                      placeholder="Any other hobbies or interests..."
                      rows={2}
                      style={{ width: '100%' }}
                    ></textarea>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary" onClick={() => {
                      alert('Interests saved for David Rodriguez!');
                    }}>
                      Save Interests
                    </button>
                  </div>
                </div>
              </div>

              {/* Another Missing Info Student */}
              <div className="card" style={{ background: '#fff5f5', border: '2px solid #fed7d7' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ color: '#c53030', marginBottom: '0.25rem' }}>Emily Watson</h4>
                  <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Grade 5 • No interests selected</span>
                </div>
                
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '6px', border: '1px solid #fed7d7' }}>
                  <h5 style={{ marginBottom: '1rem', color: '#495057' }}>Select Emily's Interests:</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" name="emily-interests" value="sports" />
                      🏀 Sports & Athletics
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" name="emily-interests" value="arts" />
                      🎨 Arts & Creativity
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" name="emily-interests" value="reading" />
                      📚 Reading & Books
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" name="emily-interests" value="technology" />
                      💻 Technology & Gaming
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" name="emily-interests" value="animals" />
                      🐕 Animals & Nature
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" name="emily-interests" value="entertainment" />
                      🎬 Entertainment & Media
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" name="emily-interests" value="social" />
                      👥 Social & Family
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" name="emily-interests" value="academic" />
                      🧮 Academic Subjects
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" name="emily-interests" value="hobbies" />
                      🎯 Hobbies & Collections
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" name="emily-interests" value="outdoors" />
                      🏕️ Outdoor Activities
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" name="emily-interests" value="music" />
                      🎵 Music & Performance
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" name="emily-interests" value="fashion" />
                      👗 Fashion & Style
                    </label>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Other Interests:</label>
                    <textarea 
                      className="form-textarea" 
                      placeholder="Any other hobbies or interests..."
                      rows={2}
                      style={{ width: '100%' }}
                    ></textarea>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary" onClick={() => {
                      alert('Interests saved for Emily Watson!');
                    }}>
                      Save Interests
                    </button>
                  </div>
                </div>
              </div>

            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button className="btn btn-outline" onClick={() => {
                const missingInfoSection = document.getElementById('missing-info-section');
                const allStudentsSection = document.getElementById('all-students-section');
                if (missingInfoSection && allStudentsSection) {
                  missingInfoSection.style.display = 'none';
                  allStudentsSection.style.display = 'block';
                }
              }}>
                ← Back to All Students
              </button>
            </div>
          </div>
        </div>

        {/* All Students List */}
        <div id="all-students-section">
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>Your Students</h3>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                  24 students • All matched with Roosevelt Elementary
                </span>
              </div>
            </div>

            {/* Student Cards */}
            <div className="grid grid-2" style={{ gap: '1.5rem' }}>
              
              {/* Student with Interests (Not Matched Yet) */}
              <div className="card" style={{ background: '#f0f8ff', border: '2px solid #bee5eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ color: '#0c5460', marginBottom: '0.25rem' }}>Sarah Mitchell</h4>
                    <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Grade 5 • Has interests</span>
                  </div>
                  <span style={{ background: '#bee5eb', color: '#0c5460', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' }}>
                    ✅ Ready
                  </span>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ color: '#495057' }}>Interests:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <span className="tag">🏀 Sports & Athletics</span>
                    <span className="tag">🎨 Arts & Creativity</span>
                    <span className="tag">📚 Reading & Books</span>
                  </div>
                  <p style={{ color: '#6c757d', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '0' }}>
                    <em>Other:</em> Soccer, painting landscapes, fantasy novels
                  </p>
                </div>

                <div style={{ background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #bee5eb', textAlign: 'center' }}>
                  <p style={{ color: '#6c757d', marginBottom: '0', fontStyle: 'italic' }}>
                    Ready for matching when class is complete
                  </p>
                </div>
              </div>

              {/* Another Student with Interests */}
              <div className="card" style={{ background: '#f0f8ff', border: '2px solid #bee5eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ color: '#0c5460', marginBottom: '0.25rem' }}>Marcus Johnson</h4>
                    <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Grade 5 • Has interests</span>
                  </div>
                  <span style={{ background: '#bee5eb', color: '#0c5460', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' }}>
                    ✅ Ready
                  </span>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ color: '#495057' }}>Interests:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <span className="tag">🏀 Sports & Athletics</span>
                    <span className="tag">💻 Technology & Gaming</span>
                    <span className="tag">🧮 Academic Subjects</span>
                  </div>
                  <p style={{ color: '#6c757d', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '0' }}>
                    <em>Other:</em> Basketball, video game design, math puzzles
                  </p>
                </div>

                <div style={{ background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #bee5eb', textAlign: 'center' }}>
                  <p style={{ color: '#6c757d', marginBottom: '0', fontStyle: 'italic' }}>
                    Ready for matching when class is complete
                  </p>
                </div>
              </div>

              {/* Missing Info Student (when viewing all) */}
              <div className="card" style={{ background: '#fff5f5', border: '2px solid #fed7d7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ color: '#c53030', marginBottom: '0.25rem' }}>David Rodriguez</h4>
                    <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Grade 5 • Missing interests</span>
                  </div>
                  <span style={{ background: '#fed7d7', color: '#c53030', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' }}>
                    📝 Needs Info
                  </span>
                </div>
                
                <div style={{ background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #fed7d7', textAlign: 'center' }}>
                  <p style={{ color: '#6c757d', marginBottom: '1rem', fontStyle: 'italic' }}>
                    No interests selected yet
                  </p>
                  <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                    Add Interests
                  </button>
                </div>
              </div>

              {/* Another Student with Interests */}
              <div className="card" style={{ background: '#f0f8ff', border: '2px solid #bee5eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ color: '#0c5460', marginBottom: '0.25rem' }}>Lily Chen</h4>
                    <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Grade 5 • Has interests</span>
                  </div>
                  <span style={{ background: '#bee5eb', color: '#0c5460', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' }}>
                    ✅ Ready
                  </span>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ color: '#495057' }}>Interests:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <span className="tag">🎨 Arts & Creativity</span>
                    <span className="tag">🎵 Music & Performance</span>
                    <span className="tag">📚 Reading & Books</span>
                  </div>
                  <p style={{ color: '#6c757d', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '0' }}>
                    <em>Other:</em> Drawing manga, piano, mystery novels
                  </p>
                </div>

                <div style={{ background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #bee5eb', textAlign: 'center' }}>
                  <p style={{ color: '#6c757d', marginBottom: '0', fontStyle: 'italic' }}>
                    Ready for matching when class is complete
                  </p>
                </div>
              </div>

            </div>

            {/* Show More Button */}
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button className="btn btn-outline">
                Show All 24 Students
              </button>
            </div>
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
