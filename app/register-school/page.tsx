"use client";

import { useState } from 'react';
import Link from 'next/link';

interface SchoolFormData {
  teacherFirstName: string;
  teacherLastName: string;
  teacherEmail: string;
  teacherPhone: string;
  schoolName: string;
  schoolAddress: string;
  gradeLevels: string[];
  classSize: string;
  programStartMonth: string;
  letterFrequency: string;
  specialConsiderations: string;
  programAgreement: boolean;
  parentNotification: boolean;
}

export default function RegisterSchool() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredSchool, setRegisteredSchool] = useState<any>(null);
  const [formData, setFormData] = useState<SchoolFormData>({
    teacherFirstName: '',
    teacherLastName: '',
    teacherEmail: '',
    teacherPhone: '',
    schoolName: '',
    schoolAddress: '',
    gradeLevels: [],
    classSize: '',
    programStartMonth: '',
    letterFrequency: '',
    specialConsiderations: '',
    programAgreement: false,
    parentNotification: false
  });

  const updateFormData = (field: keyof SchoolFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleGradeLevelChange = (grade: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      gradeLevels: checked 
        ? [...prev.gradeLevels, grade]
        : prev.gradeLevels.filter(g => g !== grade)
    }));
    if (error) setError('');
  };

  const generateStudentLink = () => {
    if (typeof window !== 'undefined' && registeredSchool) {
      const encodedEmail = encodeURIComponent(registeredSchool.teacherEmail);
      return `${window.location.origin}/register-student?teacher=${encodedEmail}`;
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    const requiredFields = [
      'teacherFirstName', 'teacherLastName', 'teacherEmail', 'schoolName', 
      'schoolAddress', 'classSize', 'programStartMonth', 'letterFrequency'
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof SchoolFormData]) {
        setError('Please fill in all required fields');
        setIsLoading(false);
        return;
      }
    }

    if (formData.gradeLevels.length === 0) {
      setError('Please select at least one grade level');
      setIsLoading(false);
      return;
    }

    if (!formData.teacherEmail.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    if (!formData.programAgreement || !formData.parentNotification) {
      setError('Please check both agreement boxes to continue');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register school');
      }

      setRegisteredSchool(data.school);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'There was an error submitting your registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
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
                <Link href="/dashboard" className="nav-link">Dashboard</Link>
                <Link href="/logout" className="nav-link">Logout</Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="container" style={{ flex: 1, paddingTop: '3rem' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Success Message */}
            <div className="card text-center" style={{ background: '#d4edda' }}>
              <h2 style={{ color: '#155724' }}>🎉 School Registration Complete!</h2>
              <p style={{ color: '#155724', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                {registeredSchool?.schoolName} has been successfully registered for The Right Back at You Project.
              </p>
              
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '6px', marginBottom: '2rem', border: '1px solid #c3e6cb' }}>
                <h3 style={{ color: '#155724', marginBottom: '1rem' }}>Next Steps:</h3>
                <div style={{ textAlign: 'left', color: '#155724' }}>
                  <p><strong>1. Share this link with your students:</strong></p>
                  <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #dee2e6' }}>
                    <code style={{ color: '#e83e8c', fontSize: '0.9rem', wordBreak: 'break-all' }}>
                      {generateStudentLink()}
                    </code>
                  </div>
                  <p><strong>2. Monitor Student Registration:</strong> Check your dashboard as students sign up</p>
                  <p><strong>3. Find a Partner School:</strong> We'll help match you with a compatible school</p>
                  <p><strong>4. Author Visit:</strong> Schedule your virtual visit with Carolyn Mackler</p>
                  <p><strong>5. Start Writing:</strong> Begin the penpal correspondence!</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
                <button 
                  onClick={() => navigator.clipboard.writeText(generateStudentLink())}
                  className="btn btn-outline"
                >
                  Copy Student Link
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
              <Link href="/dashboard" className="nav-link">Dashboard</Link>
              <Link href="/logout" className="nav-link">Logout</Link>
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

            <form onSubmit={handleSubmit}>
              
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
                      className="form-input" 
                      placeholder="Sarah"
                      value={formData.teacherFirstName}
                      onChange={(e) => updateFormData('teacherFirstName', e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="teacher-last-name" className="form-label">Last Name *</label>
                    <input 
                      type="text" 
                      id="teacher-last-name" 
                      className="form-input" 
                      placeholder="Johnson"
                      value={formData.teacherLastName}
                      onChange={(e) => updateFormData('teacherLastName', e.target.value)}
                      disabled={isLoading}
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
                      className="form-input" 
                      placeholder="s.johnson@school.edu"
                      value={formData.teacherEmail}
                      onChange={(e) => updateFormData('teacherEmail', e.target.value)}
                      disabled={isLoading}
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
                      className="form-input" 
                      placeholder="(555) 123-4567"
                      value={formData.teacherPhone}
                      onChange={(e) => updateFormData('teacherPhone', e.target.value)}
                      disabled={isLoading}
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
                    className="form-input" 
                    placeholder="Lincoln Elementary School"
                    value={formData.schoolName}
                    onChange={(e) => updateFormData('schoolName', e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="school-address" className="form-label">School Address *</label>
                  <textarea 
                    id="school-address" 
                    className="form-textarea" 
                    placeholder="123 Main Street, City, State, ZIP"
                    rows={3}
                    value={formData.schoolAddress}
                    onChange={(e) => updateFormData('schoolAddress', e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="grid grid-2" style={{ gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Grade Level(s) *</label>
                    <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '1rem' }}>
                      Select all grades you teach:
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem' }}>
                      {['3', '4', '5', '6', '7', '8'].map(grade => (
                        <label key={grade} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input 
                            type="checkbox" 
                            checked={formData.gradeLevels.includes(grade)}
                            onChange={(e) => handleGradeLevelChange(grade, e.target.checked)}
                            disabled={isLoading}
                          />
                          {grade}{grade === '3' ? 'rd' : 'th'} Grade
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="class-size" className="form-label">Expected Number of Students *</label>
                    <input 
                      type="number" 
                      id="class-size" 
                      className="form-input" 
                      placeholder="25"
                      min="1"
                      max="50"
                      value={formData.classSize}
                      onChange={(e) => updateFormData('classSize', e.target.value)}
                      disabled={isLoading}
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
                    <select 
                      id="program-start-month" 
                      className="form-select" 
                      value={formData.programStartMonth}
                      onChange={(e) => updateFormData('programStartMonth', e.target.value)}
                      disabled={isLoading}
                      required
                    >
                      <option value="">Select month</option>
                      {[
                        'January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'
                      ].map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="letter-frequency" className="form-label">How Often Will Students Write Letters? *</label>
                    <select 
                      id="letter-frequency" 
                      className="form-select" 
                      value={formData.letterFrequency}
                      onChange={(e) => updateFormData('letterFrequency', e.target.value)}
                      disabled={isLoading}
                      required
                    >
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
                    className="form-textarea" 
                    placeholder="Any special needs, accommodations, or information about your class that would help with matching..."
                    rows={4}
                    value={formData.specialConsiderations}
                    onChange={(e) => updateFormData('specialConsiderations', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Agreement */}
              <div className="form-section" style={{ marginBottom: '2rem' }}>
                <div className="card" style={{ background: '#f8f9fa', padding: '1.5rem' }}>
                  <h4>Program Agreement</h4>
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <input 
                        type="checkbox" 
                        checked={formData.programAgreement}
                        onChange={(e) => updateFormData('programAgreement', e.target.checked)}
                        disabled={isLoading}
                        required 
                      />
                      <span>
                        I understand that this program involves students exchanging letters with students from another school, 
                        and I agree to facilitate this correspondence as part of our reading curriculum. I will ensure appropriate 
                        supervision and follow all school district policies regarding student communication. *
                      </span>
                    </label>
                  </div>
                  
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <input 
                        type="checkbox" 
                        checked={formData.parentNotification}
                        onChange={(e) => updateFormData('parentNotification', e.target.checked)}
                        disabled={isLoading}
                        required 
                      />
                      <span>
                        I will notify parents/guardians about this project and obtain any necessary permissions 
                        according to my school's policies. *
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {error && (
                <div className="alert alert-error">
                  <strong>Error:</strong> {error}
                </div>
              )}

              {/* Submit Button */}
              <div className="form-group text-center">
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isLoading}
                  style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}
                >
                  {isLoading ? (
                    <>
                      <span className="loading"></span>
                      <span style={{ marginLeft: '0.5rem' }}>Registering...</span>
                    </>
                  ) : (
                    'Register My School'
                  )}
                </button>
                <p style={{ color: '#6c757d', marginTop: '1rem', fontSize: '0.9rem' }}>
                  After registration, you'll receive a link to share with students for registration.
                </p>
              </div>
            </form>

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
