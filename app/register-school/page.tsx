"use client";

export default function RegisterSchool() {
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
              <a href="/logout" className="nav-link">Logout</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ flex: 1, paddingTop: '3rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <div className="card">
            <h1 className="text-center mb-3">Register Your School</h1>
            <p className="text-center mb-4" style={{ color: '#6c757d' }}>
              Set up your school's information for The Right Back at You Project
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              
              // Generate dynamic student registration link
              const teacherEmailInput = document.getElementById('teacher-email') as HTMLInputElement;
              const teacherEmail = teacherEmailInput?.value || 's.johnson@school.edu';
              const encodedEmail = encodeURIComponent(teacherEmail);
              const studentLink = `${window.location.origin}/register-student?teacher=${encodedEmail}`;
              
              // Update the student link in success message
              const studentLinkElements = document.querySelectorAll('#student-link-success');
              studentLinkElements.forEach(element => {
                element.textContent = studentLink;
                (element as HTMLElement).style.wordBreak = 'break-all';
              });
              
              const success = document.getElementById('success');
              const form = document.getElementById('school-form');
              if (form) form.style.display = 'none';
              if (success) success.style.display = 'block';
            }}>
              
              {/* Teacher Information */}
              <div className="form-section" style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#2c5aa0', borderBottom: '2px solid #e9ecef', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                  Teacher Information
                </h3>
                
                <div className="grid grid-2" style={{ gap: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="teacher-first-name" className="form-label">First Name *</label>
                    <input 
                      type="text" 
                      id="teacher-first-name" 
                      name="teacher-first-name" 
                      className="form-input" 
                      placeholder="Sarah"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="teacher-last-name" className="form-label">Last Name *</label>
                    <input 
                      type="text" 
                      id="teacher-last-name" 
                      name="teacher-last-name" 
                      className="form-input" 
                      placeholder="Johnson"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-2" style={{ gap: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="teacher-email" className="form-label">Email Address *</label>
                    <input 
                      type="email" 
                      id="teacher-email" 
                      name="teacher-email" 
                      className="form-input" 
                      placeholder="s.johnson@school.edu"
                      required
                    />
                    <small style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                      Students will use this email to join your class
                    </small>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="teacher-phone" className="form-label">Phone Number</label>
                    <input 
                      type="tel" 
                      id="teacher-phone" 
                      name="teacher-phone" 
                      className="form-input" 
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* School Information */}
              <div className="form-section" style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#2c5aa0', borderBottom: '2px solid #e9ecef', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                  School Information
                </h3>
                
                <div className="form-group">
                  <label htmlFor="school-name" className="form-label">School Name *</label>
                  <input 
                    type="text" 
                    id="school-name" 
                    name="school-name" 
                    className="form-input" 
                    placeholder="Lincoln Elementary School"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="school-address" className="form-label">School Address *</label>
                  <textarea 
                    id="school-address" 
                    name="school-address" 
                    className="form-textarea" 
                    placeholder="123 Main Street, City, State, ZIP"
                    rows={3}
                    required
                  ></textarea>
                </div>

                <div className="grid grid-2" style={{ gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Grade Level(s) *</label>
                    <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '1rem' }}>
                      Select all grades you teach:
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="checkbox" name="grade-levels" value="3" />
                        3rd Grade
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="checkbox" name="grade-levels" value="4" />
                        4th Grade
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="checkbox" name="grade-levels" value="5" />
                        5th Grade
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="checkbox" name="grade-levels" value="6" />
                        6th Grade
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="checkbox" name="grade-levels" value="7" />
                        7th Grade
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="checkbox" name="grade-levels" value="8" />
                        8th Grade
                      </label>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="class-size" className="form-label">Expected Number of Students *</label>
                    <input 
                      type="number" 
                      id="class-size" 
                      name="class-size" 
                      className="form-input" 
                      placeholder="25"
                      min="1"
                      max="50"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Program Details */}
              <div className="form-section" style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#2c5aa0', borderBottom: '2px solid #e9ecef', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                  Program Details
                </h3>
                
                <div className="grid grid-2" style={{ gap: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="program-start-month" className="form-label">When would you like to start? *</label>
                    <select id="program-start-month" name="program-start-month" className="form-select" required>
                      <option value="">Select month</option>
                      <option value="January">January</option>
                      <option value="February">February</option>
                      <option value="March">March</option>
                      <option value="April">April</option>
                      <option value="May">May</option>
                      <option value="June">June</option>
                      <option value="July">July</option>
                      <option value="August">August</option>
                      <option value="September">September</option>
                      <option value="October">October</option>
                      <option value="November">November</option>
                      <option value="December">December</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="letter-frequency" className="form-label">How Often Will Students Write Letters? *</label>
                    <select id="letter-frequency" name="letter-frequency" className="form-select" required>
                      <option value="">Select frequency</option>
                      <option value="weekly">Weekly</option>
                      <option value="bi-weekly">Every Two Weeks</option>
                      <option value="monthly">Monthly</option>
                      <option value="flexible">Flexible/As Needed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="form-section" style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#2c5aa0', borderBottom: '2px solid #e9ecef', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                  Additional Information
                </h3>
                
                <div className="form-group">
                  <label htmlFor="special-considerations" className="form-label">
                    Special Considerations or Notes
                  </label>
                  <textarea 
                    id="special-considerations" 
                    name="special-considerations" 
                    className="form-textarea" 
                    placeholder="Any special needs, accommodations, or information about your class that would help with matching..."
                    rows={4}
                  ></textarea>
                </div>
              </div>

              {/* Agreement */}
              <div className="form-section" style={{ marginBottom: '2rem' }}>
                <div className="card" style={{ background: '#f8f9fa', padding: '1.5rem' }}>
                  <h4>Program Agreement</h4>
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <input type="checkbox" name="program-agreement" required />
                      <span>
                        I understand that this program involves students exchanging letters with students from another school, 
                        and I agree to facilitate this correspondence as part of our reading curriculum. I will ensure appropriate 
                        supervision and follow all school district policies regarding student communication. *
                      </span>
                    </label>
                  </div>
                  
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <input type="checkbox" name="parent-notification" required />
                      <span>
                        I will notify parents/guardians about this project and obtain any necessary permissions 
                        according to my school's policies. *
                      </span>
                    </label>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '1.5rem' }}>
                  <label className="form-label">How did you hear about The Right Back at You Project?</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="radio" name="how-heard" value="author-visit" />
                      Author visit/presentation
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="radio" name="how-heard" value="colleague" />
                      Colleague/teacher recommendation
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="radio" name="how-heard" value="social-media" />
                      Social media
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="radio" name="how-heard" value="scholastic" />
                      Scholastic materials
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="radio" name="how-heard" value="other" />
                      Other
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="form-group text-center" id="school-form">
                <button type="submit" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}>
                  Register My School
                </button>
                <p style={{ color: '#6c757d', marginTop: '1rem', fontSize: '0.9rem' }}>
                  After registration, you'll be able to add students or students can register directly with this link: 
                  <br />
                  <span id="student-link" style={{ color: '#4a90e2', fontWeight: '600' }}>
                    [Link will be generated after registration]
                  </span>
                </p>
              </div>
            </form>

          </div>

          {/* Success Message */}
          <div className="card text-center" id="success" style={{ display: 'none', background: '#d4edda' }}>
            <h2 style={{ color: '#155724' }}>🎉 School Registration Complete!</h2>
            <p style={{ color: '#155724', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
              Your school has been successfully registered for The Right Back at You Project.
            </p>
            
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '6px', marginBottom: '2rem', border: '1px solid #c3e6cb' }}>
              <h3 style={{ color: '#155724', marginBottom: '1rem' }}>Next Steps:</h3>
              <div style={{ textAlign: 'left', color: '#155724' }}>
                <p><strong>1. Share this link with your students:</strong></p>
                <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #dee2e6' }}>
                  <code id="student-link-success" style={{ color: '#e83e8c', fontSize: '0.9rem', wordBreak: 'break-all' }}>
                    [Link will be generated]
                  </code>
                </div>
                <p><strong>2. Monitor Student Registration:</strong> Check your dashboard as students sign up</p>
                <p><strong>3. Find a Partner School:</strong> We'll help match you with a compatible school</p>
                <p><strong>4. Author Visit:</strong> Schedule your virtual visit with Carolyn Mackler</p>
                <p><strong>5. Start Writing:</strong> Begin the penpal correspondence!</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/dashboard" className="btn btn-primary">Go to Dashboard</a>
              <a href="/students" className="btn btn-outline">Add Students</a>
            </div>
          </div>

          {/* Help Section */}
          <div className="card mt-3" style={{ background: '#f8f9fa' }}>
            <h3>Need Help?</h3>
            <p style={{ marginBottom: '1rem' }}>
              If you have questions about registering your school or setting up the program, please contact us:
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
