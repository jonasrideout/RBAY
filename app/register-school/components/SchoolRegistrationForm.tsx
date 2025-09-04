// /app/register-school/components/SchoolRegistrationForm.tsx

import Link from 'next/link';
import { SchoolFormData } from '../types';
import { US_STATES, STATE_TO_REGION } from '../constants';

interface SchoolRegistrationFormProps {
  formData: SchoolFormData;
  isLoading: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
  onUpdateFormData: (field: keyof SchoolFormData, value: any) => void;
  onGradeLevelChange: (grade: string, checked: boolean) => void;
}

export default function SchoolRegistrationForm({
  formData,
  isLoading,
  error,
  onSubmit,
  onUpdateFormData,
  onGradeLevelChange
}: SchoolRegistrationFormProps) {
  const getRegionForState = (state: string) => {
    return STATE_TO_REGION[state] || '';
  };

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

            <form onSubmit={onSubmit}>
              
              {/* Instructor Information */}
              <div className="form-section" style={{ marginBottom: '1rem' }}>
                <h3 style={{ color: '#2c5aa0', borderBottom: '2px solid #e9ecef', paddingBottom: '0.5rem', marginBottom: '1.2rem' }}>
                  Instructor Information
                </h3>
                
                {/* Single row with Name, Email, Phone */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1.5fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="teacher-name" className="form-label">Name *</label>
                    <input 
                      type="text" 
                      id="teacher-name" 
                      className="form-input" 
                      value={formData.teacherName}
                      onChange={(e) => onUpdateFormData('teacherName', e.target.value)}
                      disabled={isLoading}
                      required
                      placeholder="e.g., Sarah Johnson"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="teacher-email" className="form-label">Email Address *</label>
                    <input 
                      type="email" 
                      id="teacher-email" 
                      className="form-input" 
                      value={formData.teacherEmail}
                      onChange={(e) => onUpdateFormData('teacherEmail', e.target.value)}
                      disabled={isLoading}
                      required
                    />
                    <small style={{ color: '#6c757d', fontSize: '0.8rem' }}>
                      Students join using this email
                    </small>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="teacher-phone" className="form-label">Phone Number</label>
                    <input 
                      type="tel" 
                      id="teacher-phone" 
                      className="form-input" 
                      value={formData.teacherPhone}
                      onChange={(e) => onUpdateFormData('teacherPhone', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* School Information */}
              <div className="form-section" style={{ marginBottom: '1rem' }}>
                <h3 style={{ color: '#2c5aa0', borderBottom: '2px solid #e9ecef', paddingBottom: '0.5rem', marginBottom: '1.2rem' }}>
                  School Information
                </h3>
                
                {/* Single row with School Name, City, State */}
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="school-name" className="form-label">School Name *</label>
                    <input 
                      type="text" 
                      id="school-name" 
                      className="form-input" 
                      value={formData.schoolName}
                      onChange={(e) => onUpdateFormData('schoolName', e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="school-city" className="form-label">City</label>
                    <input 
                      type="text" 
                      id="school-city" 
                      className="form-input" 
                      value={formData.schoolCity}
                      onChange={(e) => onUpdateFormData('schoolCity', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="school-state" className="form-label">State *</label>
                    <select 
                      id="school-state" 
                      className="form-select" 
                      value={formData.schoolState}
                      onChange={(e) => onUpdateFormData('schoolState', e.target.value)}
                      disabled={isLoading}
                      required
                    >
                      <option value="">Select state</option>
                      {US_STATES.map(state => (
                        <option key={state.value} value={state.value}>{state.value}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Region Display - Full width across all three fields */}
                {formData.schoolState && (
                  <div style={{ 
                    marginTop: '0.5rem', 
                    padding: '0.75rem', 
                    background: '#e8f4f8', 
                    border: '1px solid #bee5eb', 
                    borderRadius: '4px' 
                  }}>
                    <strong style={{ color: '#0c5460' }}>
                      📍 Your Region: {getRegionForState(formData.schoolState)}
                    </strong>
                    <p style={{ 
                      fontSize: '0.9rem', 
                      color: '#6c757d', 
                      marginTop: '0.25rem', 
                      marginBottom: '0' 
                    }}>
                      You'll be matched with schools from other regions to promote cross-regional connections.
                    </p>
                  </div>
                )}

                {/* Grade Levels, Class Size, and Program Start on same row */}
                <div style={{ display: 'grid', gridTemplateColumns: '2.3fr 1.7fr 1.5fr', gap: '1.5rem', marginTop: '1.2rem' }}>
                  <div className="form-group">
                    <label className="form-label">Grade Level(s) *</label>
                    <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '0.8rem' }}>
                      Select the grade levels in this group:
                    </p>
                    <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'nowrap' }}>
                      {['3', '4', '5', '6', '7', '8'].map(grade => (
                        <label key={grade} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
                          <input 
                            type="checkbox" 
                            checked={formData.gradeLevels.includes(grade)}
                            onChange={(e) => onGradeLevelChange(grade, e.target.checked)}
                            disabled={isLoading}
                          />
                          {grade}{grade === '3' ? 'rd' : 'th'}
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="class-size" className="form-label">Estimated # of Students *</label>
                    <input 
                      type="number" 
                      id="class-size" 
                      className="form-input" 
                      min="1"
                      max="50"
                      value={formData.classSize}
                      onChange={(e) => onUpdateFormData('classSize', e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="program-start-month" className="form-label">Preferred start date? *</label>
                    <select 
                      id="program-start-month" 
                      className="form-select" 
                      value={formData.programStartMonth}
                      onChange={(e) => onUpdateFormData('programStartMonth', e.target.value)}
                      disabled={isLoading}
                      required
                    >
                      <option value="">Select month</option>
                      <option value="As soon as possible">As soon as possible</option>
                      <option value="Not sure yet">Not sure yet</option>
                      {[
                        'January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'
                      ].map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="form-section" style={{ marginBottom: '1rem' }}>
                <h3 style={{ color: '#2c5aa0', borderBottom: '2px solid #e9ecef', paddingBottom: '0.5rem', marginBottom: '1.2rem' }}>
                  Additional Information
                </h3>
                
                <div className="form-group">
                  <label htmlFor="special-considerations" className="form-label">
                    Special Considerations or Notes
                  </label>
                  <textarea 
                    id="special-considerations" 
                    className="form-textarea" 
                    rows={4}
                    value={formData.specialConsiderations}
                    onChange={(e) => onUpdateFormData('specialConsiderations', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Agreement */}
              <div className="form-section" style={{ marginBottom: '1.5rem' }}>
                <div className="card" style={{ background: '#f8f9fa', padding: '1.5rem' }}>
                  <h4>Program Agreement</h4>
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <input 
                        type="checkbox" 
                        checked={formData.programAgreement}
                        onChange={(e) => onUpdateFormData('programAgreement', e.target.checked)}
                        disabled={isLoading}
                        required 
                      />
                      <span>
                        I understand that this program involves students exchanging letters with students from another school. 
                        I will ensure appropriate supervision and follow all school district policies regarding student communication. 
                        I will obtain any necessary permissions according to my school's policies. *
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
                  After registration, you'll receive links for your dashboard and student registration.
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
