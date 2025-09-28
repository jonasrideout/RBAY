// /app/register-school/components/SchoolRegistrationForm.tsx

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTeacherSession } from '@/lib/useTeacherSession';
import Header from '../../components/Header';
import { SchoolFormData } from '../types';
import { US_STATES, STATE_TO_REGION } from '../constants';

interface SchoolRegistrationFormProps {
  formData: SchoolFormData;
  isLoading: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
  onUpdateFormData: (field: keyof SchoolFormData, value: any) => void;
  onGradeLevelChange: (grade: string, checked: boolean) => void;
  isEmailReadOnly?: boolean;
  isAdminMode?: boolean;
}

export default function SchoolRegistrationForm({
  formData,
  isLoading,
  error,
  onSubmit,
  onUpdateFormData,
  onGradeLevelChange,
  isEmailReadOnly = false,
  isAdminMode = false
}: SchoolRegistrationFormProps) {
  const { data: session } = useTeacherSession();
  const router = useRouter();

  const handleLogout = () => {
    if (isAdminMode) {
      router.push('/admin/login');
    } else {
      router.push('/api/auth/signout?callbackUrl=' + encodeURIComponent(window.location.origin));
    }
  };

  const getRegionForState = (state: string) => {
    return STATE_TO_REGION[state] || '';
  };

  // Admin mode validation - only require school name, teacher name, teacher email
  const isFieldRequired = (field: string) => {
    if (isAdminMode) {
      return ['schoolName', 'teacherName', 'teacherEmail'].includes(field);
    }
    return true; // All fields required in regular mode
  };

  return (
    <div className="page">
      <Header 
        session={isAdminMode ? { user: { email: 'Admin User' } } : session} 
        onLogout={handleLogout} 
      />

      <main className="container" style={{ flex: 1, paddingTop: '1.5rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          {/* Page Header - matches dashboard style */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            marginBottom: '1.5rem' 
          }}>
            <div>
              <h1 className="text-school-name" style={{ marginBottom: '0.5rem', fontSize: '1.8rem' }}>
                {isAdminMode ? 'Register a New School' : 'Register Your School'}
              </h1>
              <p className="text-school-name" style={{ margin: 0 }}>
                {isAdminMode ? 'Admin Dashboard - Create School' : 'The Right Back at You Project'}
              </p>
            </div>
            
            {/* Admin navigation button */}
            {isAdminMode && (
              <div>
                <Link href="/admin/matching" className="btn">
                  ← Back to Admin Dashboard
                </Link>
              </div>
            )}
          </div>
          
          {/* Main Form Card */}
          <div className="card">
            <form onSubmit={onSubmit}>
              
              {/* Instructor Information Section */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  color: '#333', 
                  fontSize: '1.2rem',
                  fontWeight: '400',
                  borderBottom: '1px solid #e9ecef', 
                  paddingBottom: '0.5rem', 
                  marginBottom: '1.5rem' 
                }}>
                  Instructor Information
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1.5fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label htmlFor="teacher-name" className="form-label">
                      {isAdminMode ? 'Teacher Name' : 'Name'} *
                    </label>
                    <input 
                      type="text" 
                      id="teacher-name" 
                      className="form-input" 
                      value={formData.teacherName}
                      onChange={(e) => onUpdateFormData('teacherName', e.target.value)}
                      disabled={isLoading}
                      required={isFieldRequired('teacherName')}
                      placeholder="e.g., Sarah Johnson"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="teacher-email" className="form-label">
                      {isAdminMode ? 'Teacher Email' : 'Email Address'} *
                    </label>
                    <input 
                      type="email" 
                      id="teacher-email" 
                      className="form-input" 
                      value={formData.teacherEmail}
                      onChange={(e) => onUpdateFormData('teacherEmail', e.target.value)}
                      disabled={isLoading || (!isAdminMode && isEmailReadOnly)}
                      readOnly={!isAdminMode && isEmailReadOnly}
                      required={isFieldRequired('teacherEmail')}
                      style={(!isAdminMode && isEmailReadOnly) ? { 
                        backgroundColor: '#f8f9fa', 
                        color: '#6c757d',
                        cursor: 'not-allowed'
                      } : {}}
                    />
                    <small className="text-meta-info" style={{ display: 'block', marginTop: '0.25rem' }}>
                      {(!isAdminMode && isEmailReadOnly)
                        ? 'Email verified from your login' 
                        : isAdminMode 
                          ? 'Teacher will receive welcome email at this address'
                          : 'Students will join using this email'
                      }
                    </small>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="teacher-phone" className="form-label">
                      Phone Number{isFieldRequired('teacherPhone') ? ' *' : ''}
                    </label>
                    <input 
                      type="tel" 
                      id="teacher-phone" 
                      className="form-input" 
                      value={formData.teacherPhone}
                      onChange={(e) => onUpdateFormData('teacherPhone', e.target.value)}
                      disabled={isLoading}
                      required={isFieldRequired('teacherPhone')}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* School Information Section */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  color: '#333', 
                  fontSize: '1.2rem',
                  fontWeight: '400',
                  borderBottom: '1px solid #e9ecef', 
                  paddingBottom: '0.5rem', 
                  marginBottom: '1.5rem' 
                }}>
                  School Information
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="school-name" className="form-label">School Name *</label>
                    <input 
                      type="text" 
                      id="school-name" 
                      className="form-input" 
                      value={formData.schoolName}
                      onChange={(e) => onUpdateFormData('schoolName', e.target.value)}
                      disabled={isLoading}
                      required={isFieldRequired('schoolName')}
                      placeholder="e.g., Lincoln Elementary School"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="school-city" className="form-label">
                      City{isFieldRequired('schoolCity') ? ' *' : ''}
                    </label>
                    <input 
                      type="text" 
                      id="school-city" 
                      className="form-input" 
                      value={formData.schoolCity}
                      onChange={(e) => onUpdateFormData('schoolCity', e.target.value)}
                      disabled={isLoading}
                      required={isFieldRequired('schoolCity')}
                      placeholder="e.g., Springfield"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="school-state" className="form-label">
                      State{isFieldRequired('schoolState') ? ' *' : ''}
                    </label>
                    <select 
                      id="school-state" 
                      className="form-select" 
                      value={formData.schoolState}
                      onChange={(e) => onUpdateFormData('schoolState', e.target.value)}
                      disabled={isLoading}
                      required={isFieldRequired('schoolState')}
                    >
                      <option value="">Select</option>
                      {US_STATES.map(state => (
                        <option key={state.value} value={state.value}>{state.value}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Region Display */}
                {formData.schoolState && (
                  <div style={{ 
                    marginBottom: '1.5rem', 
                    padding: '1rem', 
                    background: '#f8f9fa', 
                    border: '1px solid #e9ecef', 
                    borderRadius: '6px',
                    borderLeft: '3px solid #2c5aa0'
                  }}>
                    <div className="text-data-value" style={{ fontWeight: '400', marginBottom: '0.25rem' }}>
                      Region: {getRegionForState(formData.schoolState)}
                    </div>
                    <div className="text-meta-info">
                      Schools will be matched with schools from other regions to promote cross-regional connections.
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 1.5fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">
                      Grade Level(s){isFieldRequired('gradeLevels') ? ' *' : ''}
                    </label>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(3, 1fr)', 
                      gap: '0.75rem', 
                      marginTop: '0.5rem' 
                    }}>
                      {['3', '4', '5', '6', '7', '8'].map(grade => (
                        <label key={grade} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          fontSize: '14px',
                          fontWeight: '400',
                          color: '#555'
                        }}>
                          <input 
                            type="checkbox" 
                            checked={formData.gradeLevels.includes(grade)}
                            onChange={(e) => onGradeLevelChange(grade, e.target.checked)}
                            disabled={isLoading}
                            required={isAdminMode ? false : isFieldRequired('gradeLevels') && formData.gradeLevels.length === 0}
                            style={{ accentColor: '#2c5aa0' }}
                          />
                          {grade}{grade === '3' ? 'rd' : 'th'} Grade
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="class-size" className="form-label">
                      Est. # of Students{isFieldRequired('classSize') ? ' *' : ''}
                    </label>
                    <input 
                      type="number" 
                      id="class-size" 
                      className="form-input" 
                      min="1"
                      max="50"
                      value={formData.classSize}
                      onChange={(e) => onUpdateFormData('classSize', e.target.value)}
                      disabled={isLoading}
                      required={isFieldRequired('classSize')}
                      placeholder="e.g., 25"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="program-start-month" className="form-label">
                      Preferred Start{isFieldRequired('programStartMonth') ? ' *' : ''}
                    </label>
                    <select 
                      id="program-start-month" 
                      className="form-select" 
                      value={formData.programStartMonth}
                      onChange={(e) => onUpdateFormData('programStartMonth', e.target.value)}
                      disabled={isLoading}
                      required={isFieldRequired('programStartMonth')}
                    >
                      <option value="">Select</option>
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

              {/* Additional Information Section */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  color: '#333', 
                  fontSize: '1.2rem',
                  fontWeight: '400',
                  borderBottom: '1px solid #e9ecef', 
                  paddingBottom: '0.5rem', 
                  marginBottom: '1.5rem' 
                }}>
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
                    placeholder="Any special considerations, scheduling preferences, or notes for matching..."
                  />
                </div>
              </div>

              {/* Agreement Section */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ 
                  background: '#f8f9fa', 
                  border: '1px solid #e9ecef',
                  borderRadius: '6px',
                  padding: '1.5rem' 
                }}>
                  <h4 style={{ 
                    color: '#333', 
                    fontSize: '1.1rem',
                    fontWeight: '400',
                    marginBottom: '1rem' 
                  }}>
                    Program Agreement
                  </h4>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '0.75rem',
                      fontSize: '14px',
                      fontWeight: '400',
                      color: '#555',
                      lineHeight: '1.5'
                    }}>
                      <input 
                        type="checkbox" 
                        checked={formData.programAgreement}
                        onChange={(e) => onUpdateFormData('programAgreement', e.target.checked)}
                        disabled={isLoading}
                        required={isFieldRequired('programAgreement')}
                        style={{ 
                          marginTop: '0.125rem',
                          accentColor: '#2c5aa0',
                          minWidth: '16px'
                        }}
                      />
                      <span>
                        {isAdminMode 
                          ? 'I confirm that this school will follow all program guidelines and obtain necessary permissions according to their school district policies. The teacher will ensure appropriate supervision and follow all policies regarding student communication.' 
                          : 'I understand that this program involves students exchanging letters with students from another school. I will ensure appropriate supervision and follow all school district policies regarding student communication. I will obtain any necessary permissions according to my school\'s policies.'
                        }{isFieldRequired('programAgreement') ? ' *' : ''}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="alert alert-error" style={{ marginBottom: '2rem' }}>
                  <strong>Error:</strong> {error}
                </div>
              )}

              {/* Submit Button */}
              <div style={{ textAlign: 'center' }}>
                <button 
                  type="submit" 
                  className="btn" 
                  disabled={isLoading}
                  style={{ 
                    padding: '1rem 2.5rem', 
                    fontSize: '1rem',
                    fontWeight: '400'
                  }}
                >
                  {isLoading ? (
                    <>
                      <span className="loading" style={{ marginRight: '0.5rem' }}></span>
                      {isAdminMode ? 'Creating School...' : 'Registering...'}
                    </>
                  ) : (
                    isAdminMode ? 'Create School' : 'Register My School'
                  )}
                </button>
                
                <div className="text-meta-info" style={{ marginTop: '1rem', textAlign: 'center' }}>
                  {isAdminMode 
                    ? 'The teacher will receive dashboard and student registration links via email.'
                    : 'After registration, you\'ll receive links for your dashboard and student registration.'
                  }
                </div>
              </div>
            </form>
          </div>

          {/* Help Section */}
          <div className="card" style={{ background: '#f8f9fa', marginTop: '1.5rem' }}>
            <h3 style={{ 
              color: '#333', 
              fontSize: '1.1rem',
              fontWeight: '400',
              marginBottom: '1rem' 
            }}>
              Need Help?
            </h3>
            <div className="text-data-value" style={{ marginBottom: '0.5rem' }}>
              If you have questions about {isAdminMode ? 'creating schools or' : ''} registering {isAdminMode ? '' : 'your school or'} setting up the program, please contact us:
            </div>
            <div className="text-data-value">
              <strong>Email:</strong> <a href="mailto:carolyn.mackler@gmail.com" style={{ color: '#2c5aa0', textDecoration: 'none' }}>carolyn.mackler@gmail.com</a>
            </div>
          </div>

        </div>
      </main>

      <footer style={{ background: '#343a40', color: 'white', padding: '2rem 0', marginTop: '3rem' }}>
        <div className="container text-center">
          <p>&copy; 2024 The Right Back at You Project by Carolyn Mackler. Building empathy and connection through literature.</p>
        </div>
      </footer>
    </div>
  );
}
