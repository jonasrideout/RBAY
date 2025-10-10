// /app/register-school/components/SchoolRegistrationForm.tsx

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTeacherSession } from '@/lib/useTeacherSession';
import Header from '../../components/Header';
import SchoolFormFields from './SchoolFormFields';
import { SchoolFormData } from '../types';

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
              
              <SchoolFormFields
                formData={formData}
                isLoading={isLoading}
                onUpdateFormData={onUpdateFormData}
                onGradeLevelChange={onGradeLevelChange}
                editMode={false}
                isAdminMode={isAdminMode}
                isEmailReadOnly={isEmailReadOnly}
              />

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
          <p>&copy; 2025 The Right Back at You Project by Carolyn Mackler. Building empathy and connection through literature.</p>
        </div>
      </footer>

    </div>
  );
}
