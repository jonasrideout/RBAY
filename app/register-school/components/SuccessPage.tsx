// /app/register-school/components/SuccessPage.tsx

"use client";

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';

interface SuccessPageProps {
  registeredSchool: {
    teacherEmail: string;
    schoolName: string;
    dashboardToken: string;  // Still needed for student registration
  };
}

export default function SuccessPage({ registeredSchool }: SuccessPageProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = () => {
    router.push('/api/auth/signout?callbackUrl=' + encodeURIComponent(window.location.origin));
  };

  const generateStudentLink = () => {
    if (typeof window !== 'undefined' && registeredSchool?.dashboardToken) {
      return `${window.location.origin}/register-student?token=${registeredSchool.dashboardToken}`;
    }
    return '';
  };

  const generateDashboardLink = () => {
    if (typeof window !== 'undefined') {
      // Session-based dashboard - no token needed
      return `${window.location.origin}/dashboard`;
    }
    return '';
  };

  return (
    <div className="page">
      <Header session={session} onLogout={handleLogout} />

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
                <p><strong>1. Access Your Dashboard:</strong></p>
                <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #dee2e6' }}>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>
                    You can access your dashboard anytime by logging in and going to:
                  </p>
                  <code style={{ color: '#e83e8c', fontSize: '0.9rem', wordBreak: 'break-all' }}>
                    {generateDashboardLink()}
                  </code>
                </div>
                
                <p><strong>2. Share Student Registration Link:</strong></p>
                <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #dee2e6' }}>
                  <code style={{ color: '#e83e8c', fontSize: '0.9rem', wordBreak: 'break-all' }}>
                    {generateStudentLink()}
                  </code>
                </div>
                
                <p><strong>3. Monitor Student Registration:</strong> Use your dashboard to track student signups</p>
                <p><strong>4. Complete Student Information:</strong> Help students add their interests</p>
                <p><strong>5. Request Matching:</strong> When all students are ready, request partner school matching</p>
                <p><strong>6. Start Writing:</strong> Begin the penpal correspondence!</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link 
                href="/dashboard"
                className="btn btn-primary"
              >
                Go to Dashboard
              </Link>
              <button 
                onClick={() => {
                  const dashboardLink = generateDashboardLink();
                  navigator.clipboard.writeText(dashboardLink);
                }}
                className="btn btn-secondary"
              >
                📋 Copy Dashboard Link
              </button>
              <button 
                onClick={() => navigator.clipboard.writeText(generateStudentLink())}
                className="btn btn-outline"
              >
                📋 Copy Student Link
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
