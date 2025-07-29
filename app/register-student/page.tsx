"use client";

export default function RegisterStudent() {
  // In a real app, this would be managed with React state
  // For now, we'll show all three steps in the same component
  
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
          
          {/* Step 1: School Validation */}
          <div className="card" id="step1">
            <h1 className="text-center mb-3">Join The Right Back at You Project</h1>
            <p className="text-center mb-4" style={{ color: '#6c757d' }}>
              First, let's make sure your teacher has registered your school for this project.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              // This form doesn't actually submit - just contains the email input
            }}>
              <div className="form-group">
                <label htmlFor="teacher-email" className="form-label">
                  What is your teacher's email address?
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
                  This helps us find your school and connect you to your class
                </small>
              </div>

              <div className="form-group text-center">
                <button type="button" className="btn btn-primary" onClick={() => {
                  const emailInput = document.getElementById('teacher-email') as HTMLInputElement;
                  const errorDiv = document.getElementById('school-not-found');
                  const step1 = document.getElementById('step1');
                  const step2 = document.getElementById('step2-confirm');
                  const schoolName = document.getElementById('school-name-confirm');
                  
                  if (emailInput && emailInput.value && emailInput.value.includes('@')) {
                    if (errorDiv) errorDiv.style.display = 'none';
                    if (step1) step1.style.display = 'none';
                    if (step2) step2.style.display = 'block';
                    if (schoolName) schoolName.textContent = 'Lincoln Elementary - 5th Grade (Ms. Johnson)';
                  } else {
                    if (errorDiv) errorDiv.style.display = 'block';
                  }
                }}>
                  Find My School
                </button>
              </div>
            </form>

            <div className="alert alert-error" id="school-not-found" style={{ display: 'none' }}>
              <strong>Teacher not found.</strong> That email address isn't registered yet. Please ask your teacher to register your school first, or double-check the email address.
            </div>
          </div>

          {/* Step 2: School Confirmation */}
          <div className="card" id="step2-confirm" style={{ display: 'none' }}>
            <h1 className="text-center mb-3">Is This Your School?</h1>
            
            <div className="alert alert-success text-center" style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#155724', marginBottom: '0.5rem' }}>✅ We found your school:</h3>
              <p style={{ color: '#155724', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0' }}>
                <span id="school-name-confirm">Lincoln Elementary - 5th Grade</span>
              </p>
            </div>

            <div className="text-center">
              <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#6c757d' }}>
                Please confirm this is the correct school before continuing.
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-primary" onClick={() => {
                  const step2Confirm = document.getElementById('step2-confirm');
                  const step3 = document.getElementById('step3');
                  const schoolNameFinal = document.getElementById('school-name-final');
                  const schoolNameSource = document.getElementById('school-name-confirm');
                  
                  if (step2Confirm) step2Confirm.style.display = 'none';
                  if (step3) step3.style.display = 'block';
                  if (schoolNameFinal && schoolNameSource) {
                    schoolNameFinal.textContent = schoolNameSource.textContent;
                  }
                  // Also set teacher name
                  const teacherNameFinal = document.getElementById('teacher-name-final');
                  if (teacherNameFinal) teacherNameFinal.textContent = 'Ms. Johnson';
                }} style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                  ✅ Yes, that's my school
                </button>
                
                <button type="button" className="btn btn-secondary" onClick={() => {
                  const step1 = document.getElementById('step1');
                  const step2Confirm = document.getElementById('step2-confirm');
                  const emailInput = document.getElementById('teacher-email') as HTMLInputElement;
                  
                  if (step1) step1.style.display = 'block';
                  if (step2Confirm) step2Confirm.style.display = 'none';
                  if (emailInput) emailInput.focus();
                }} style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                  ❌ No, try different email
                </button>
              </div>
            </div>
          </div>

          {/* Step 3: Student Information (renamed from step2) */}
          <div className="card" id="step3" style={{ display: 'none' }}>
            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', border: '1px solid #dee2e6' }}>
              <h4 style={{ color: '#495057', marginBottom: '0.5rem' }}>Your School:</h4>
              <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2c5aa0', marginBottom: '0.25rem' }}>
                <span id="school-name-final">Lincoln Elementary - 5th Grade</span>
              </p>
              <p style={{ color: '#6c757d', marginBottom: '0', fontSize: '0.95rem' }}>
                Teacher: <span id="teacher-name-final">Ms. Johnson</span>
              </p>
            </div>

            <h2 className="text-center mb-3">Tell Us About Yourself</h2>
            <p className="text-center mb-4" style={{ color: '#6c757d' }}>
              This information helps us find you a great penpal who shares your interests!
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              const step3 = document.getElementById('step3');
              const success = document.getElementById('success');
              if (step3) step3.style.display = 'none';
              if (success) success.style.display = 'block';
            }}>
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

              {/* Submit */}
              <div className="form-group text-center">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  const step2Confirm = document.getElementById('step2-confirm');
                  const step3 = document.getElementById('step3');
                  if (step2Confirm) step2Confirm.style.display = 'block';
                  if (step3) step3.style.display = 'none';
                }} style={{ marginRight: '1rem' }}>
                  ← Go Back
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                  Submit My Information
                </button>
              </div>
            </form>
          </div>

          {/* Success Message (hidden initially) */}
          <div className="card text-center" id="success" style={{ display: 'none', background: '#d4edda' }}>
            <h2 style={{ color: '#155724' }}>Thank You!</h2>
            <p style={{ color: '#155724', fontSize: '1.1rem' }}>
              Your information has been submitted successfully. Your teacher will receive your details and you'll be matched with a penpal soon!
            </p>
            <p style={{ color: '#6c757d', marginTop: '1.5rem' }}>
              You can close this page now. Your teacher will let you know when it's time to start writing letters!
            </p>
          </div>

          {/* Help Section */}
          <div className="card mt-3" style={{ background: '#f8f9fa' }}>
            <h3>Questions?</h3>
            <p style={{ marginBottom: '1rem' }}>
              If you need help or have questions about the project, ask your teacher or contact us:
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
