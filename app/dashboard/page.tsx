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
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#17a2b8', marginBottom: '0.5rem' }}>
              ✅ Matched
            </div>
            <div style={{ color: '#6c757d', fontWeight: '600' }}>Class Status</div>
            <div style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.25rem' }}>
              With Roosevelt Elementary
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
              <h3 style={{ color: '#28a745', marginBottom: '0.5rem' }}>🎉 Class Successfully Matched!</h3>
              <p style={{ color: '#6c757d', marginBottom: '0' }}>
                Your class has been paired with Roosevelt Elementary. All students have been matched with penpals.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className="btn btn-outline" onClick={() => {
                const confirmation = confirm('Are you sure you want to go back to collecting student information? This will remove your current school pairing.');
                if (confirmation) {
                  alert('Status changed to "Collecting Info" - you can now edit student information.');
                }
              }}>
                ← Back to Collecting
              </button>
              <button className="btn btn-primary">
                📧 Contact Roosevelt Elementary
              </button>
            </div>
          </div>
        </div>

        {/* Partner School Info (only shown when matched) */}
        <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)' }}>
          <h3 style={{ color: '#1976d2', marginBottom: '1rem' }}>🏫 Your Partner School</h3>
          <div className="grid grid-3">
            <div>
              <h4 style={{ color: '#1976d2', marginBottom: '0.5rem' }}>Roosevelt Elementary</h4>
              <p style={{ color: '#424242', marginBottom: '0.25rem' }}>
                <strong>Location:</strong> Portland, Oregon
              </p>
              <p style={{ color: '#424242', marginBottom: '0.25rem' }}>
                <strong>Teacher:</strong> Mr. Davis
              </p>
              <p style={{ color: '#424242', marginBottom: '0' }}>
                <strong>Students:</strong> 22 (5th Grade)
              </p>
            </div>
            <div>
              <h5 style={{ color: '#1976d2', marginBottom: '0.5rem' }}>Program Details</h5>
              <p style={{ color: '#424242', marginBottom: '0.25rem' }}>
                <strong>Start Date:</strong> March 2025
              </p>
              <p style={{ color: '#424242', marginBottom: '0.25rem' }}>
                <strong>Letter Frequency:</strong> Bi-weekly
              </p>
              <p style={{ color: '#424242', marginBottom: '0' }}>
                <strong>Matches:</strong> 24 pairs created
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <a href="/register-student?teacher=s.johnson@lincoln.edu" target="_blank" className="btn btn-outline" style={{ marginBottom: '0.5rem' }}>
                🔗 Student Registration Link
              </a>
              <button className="btn btn-outline">
                📋 View All Match Details
              </button>
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
          <button className="btn btn-primary" onClick={() => {
            // CSV download with actual match data
            const csvContent = `Student Name,Student Interests,Penpal Name,Penpal School,Penpal Interests
Sarah Mitchell,"Sports & Athletics, Arts & Creativity, Reading & Books",Jake Thompson,Roosevelt Elementary,"Soccer, Books, Art"
Marcus Johnson,"Sports & Athletics, Technology & Gaming, Academic Subjects",Emma Davis,Roosevelt Elementary,"Sports, Gaming, Math"
Lily Chen,"Arts & Creativity, Music & Performance, Reading & Books",Alex Rodriguez,Roosevelt Elementary,"Music, Reading, Art"
David Rodriguez,"Sports & Athletics, Animals & Nature",Maria Santos,Roosevelt Elementary,"Soccer, Animals"`;
            
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'lincoln-elementary-matches.csv';
            a.click();
            window.URL.revokeObjectURL(url);
          }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ color: '#c53030', marginBottom: '0.25rem' }}>David Rodriguez</h4>
                    <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Grade 5 • No interests selected</span>
                  </div>
                  <button className="btn btn-primary" onClick={() => {
                    const editForm = document.getElementById('edit-david');
                    const viewCard = document.getElementById('view-david');
                    if (editForm && viewCard) {
                      editForm.style.display = editForm.style.display === 'none' ? 'block' : 'none';
                      viewCard.style.display = editForm.style.display === 'none' ? 'block' : 'none';
                    }
                  }} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                    Add Interests
                  </button>
                </div>
                
                <div id="view-david">
                  <div style={{ background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #fed7d7', textAlign: 'center' }}>
                    <p style={{ color: '#6c757d', marginBottom: '0', fontStyle: 'italic' }}>
                      Click "Add Interests" to select this student's preferences
                    </p>
                  </div>
                </div>

                {/* Inline Edit Form */}
                <div id="edit-david" style={{ display: 'none' }}>
                  <div style={{ background: 'white', padding: '1.5rem', borderRadius: '6px', border: '1px solid #fed7d7' }}>
                    <h5 style={{ marginBottom: '1rem' }}>Select David's Interests:</h5>
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
                        <input type="checkbox" name="david-interests" value="music" />
                        🎵 Music & Performance
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
                      <button className="btn btn-outline" onClick={() => {
                        const editForm = document.getElementById('edit-david');
                        const viewCard = document.getElementById('view-david');
                        if (editForm && viewCard) {
                          editForm.style.display = 'none';
                          viewCard.style.display = 'block';
                        }
                      }}>
                        Cancel
                      </button>
                      <button className="btn btn-primary" onClick={() => {
                        alert('Interests saved for David Rodriguez!');
                        const editForm = document.getElementById('edit-david');
                        const viewCard = document.getElementById('view-david');
                        if (editForm && viewCard) {
                          editForm.style.display = 'none';
                          viewCard.style.display = 'block';
                        }
                      }}>
                        Save Interests
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Another Missing Info Student */}
              <div className="card" style={{ background: '#fff5f5', border: '2px solid #fed7d7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ color: '#c53030', marginBottom: '0.25rem' }}>Emily Watson</h4>
                    <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Grade 5 • No interests selected</span>
                  </div>
                  <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                    Add Interests
                  </button>
                </div>
                
                <div style={{ background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #fed7d7', textAlign: 'center' }}>
                  <p style={{ color: '#6c757d', marginBottom: '0', fontStyle: 'italic' }}>
                    Click "Add Interests" to select this student's preferences
                  </p>
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
              
              {/* Matched Student */}
              <div className="card" style={{ background: '#f8fff8', border: '2px solid #d4edda' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ color: '#155724', marginBottom: '0.25rem' }}>Sarah Mitchell</h4>
                    <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Grade 5 • Has interests</span>
                  </div>
                  <span style={{ background: '#d4edda', color: '#155724', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' }}>
                    ✅ Matched
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

                <div style={{ background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #c3e6cb' }}>
                  <strong style={{ color: '#1976d2' }}>📮 Matched with:</strong>
                  <p style={{ marginBottom: '0.5rem', marginTop: '0.25rem' }}>
                    <strong>Jake Thompson</strong> (Roosevelt Elementary)
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '0.25rem 0.5rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                      Soccer
                    </span>
                    <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '0.25rem 0.5rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                      Books
                    </span>
                    <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '0.25rem 0.5rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                      Art
                    </span>
                  </div>
                </div>
              </div>

              {/* Another Matched Student */}
              <div className="card" style={{ background: '#f8fff8', border: '2px solid #d4edda' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ color: '#155724', marginBottom: '0.25rem' }}>Marcus Johnson</h4>
                    <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Grade 5 • Has interests</span>
                  </div>
                  <span style={{ background: '#d4edda', color: '#155724', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' }}>
                    ✅ Matched
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

                <div style={{ background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #c3e6cb' }}>
                  <strong style={{ color: '#1976d2' }}>📮 Matched with:</strong>
                  <p style={{ marginBottom: '0.5rem', marginTop: '0.25rem' }}>
                    <strong>Emma Davis</strong> (Roosevelt Elementary)
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '0.25rem 0.5rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                      Sports
                    </span>
                    <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '0.25rem 0.5rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                      Gaming
                    </span>
                    <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '0.25rem 0.5rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                      Math
                    </span>
                  </div>
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

              {/* Show a few more matched students */}
              <div className="card" style={{ background: '#f8fff8', border: '2px solid #d4edda' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ color: '#155724', marginBottom: '0.25rem' }}>Lily Chen</h4>
                    <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Grade 5 • Has interests</span>
                  </div>
                  <span style={{ background: '#d4edda', color: '#155724', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' }}>
                    ✅ Matched
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

                <div style={{ background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #c3e6cb' }}>
                  <strong style={{ color: '#1976d2' }}>📮 Matched with:</strong>
                  <p style={{ marginBottom: '0.5rem', marginTop: '0.25rem' }}>
                    <strong>Alex Rodriguez</strong> (Roosevelt Elementary)
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '0.25rem 0.5rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                      Music
                    </span>
                    <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '0.25rem 0.5rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                      Reading
                    </span>
                    <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '0.25rem 0.5rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                      Art
                    </span>
                  </div>
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
