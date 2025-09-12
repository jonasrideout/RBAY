// /app/register-school/components/SuccessPage.tsx

"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import { sendWelcomeEmail } from '@/lib/email';

interface SuccessPageProps {
  registeredSchool: {
    teacherEmail: string;
    teacherName?: string;
    schoolName: string;
    dashboardToken: string;
    dashboardLink?: string;
    registrationLink?: string;
    emailSent?: boolean;
  };
  isAdminMode?: boolean;
}

export default function SuccessPage({ registeredSchool, isAdminMode = false }: SuccessPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  
  // Copy button states
  const [linksCopyStatus, setLinksCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleLogout = () => {
    if (isAdminMode) {
      router.push('/admin/login');
    } else {
      router.push('/api/auth/signout?callbackUrl=' + encodeURIComponent(getBaseUrl()));
    }
  };

  // Use environment variable for consistent URL generation
  const getBaseUrl = () => {
    return process.env.NEXT_PUBLIC_APP_URL || 'https://nextjs-boilerplate-beta-three-49.vercel.app';
  };

  const generateStudentLink = () => {
    if (isAdminMode && registeredSchool?.registrationLink) {
      return registeredSchool.registrationLink;
    }
    if (registeredSchool?.dashboardToken) {
      return `${getBaseUrl()}/register-student?token=${registeredSchool.dashboardToken}`;
    }
    return '';
  };

  const generateDashboardLink = () => {
    if (isAdminMode && registeredSchool?.dashboardLink) {
      return registeredSchool.dashboardLink;
    }
    // Session-based dashboard - no token needed
    return `${getBaseUrl()}/dashboard`;
  };

  // Copy both links for admin
  const handleCopyLinks = async () => {
    try {
      const dashboardLink = generateDashboardLink();
      const studentLink = generateStudentLink();
      const text = `Teacher Dashboard: ${dashboardLink}\nStudent Registration: ${studentLink}`;
      
      await navigator.clipboard.writeText(text);
      setLinksCopyStatus('copied');
      setTimeout(() => setLinksCopyStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to copy links:', err);
    }
  };

  // Send welcome email for admin
  const handleSendEmail = async () => {
    setEmailStatus('sending');

    try {
      const response = await fetch('/api/admin/send-welcome-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherEmail: registeredSchool.teacherEmail,
          teacherName: registeredSchool.teacherName || 'Teacher',
          schoolName: registeredSchool.schoolName,
          dashboardToken: registeredSchool.dashboardToken
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      setEmailStatus('sent');
      setTimeout(() => setEmailStatus('idle'), 3000);
    } catch (error) {
      console.error('Error sending email:', error);
      setEmailStatus('error');
      setTimeout(() => setEmailStatus('idle'), 3000);
    }
  };

  // Admin mode success page
  if (isAdminMode) {
    return (
      <div className="page">
        <Header 
          session={{ user: { email: 'Admin User' } }} 
          onLogout={handleLogout} 
        />

        <main className="container" style={{ flex: 1, paddingTop: '3rem' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card text-center" style={{ background: '#d4edda' }}>
              <h2 style={{ color: '#155724' }}>School Created Successfully!</h2>
              <p style={{ color: '#155724', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                {registeredSchool?.schoolName} has been added to the system.
              </p>
              
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '6px', marginBottom: '2rem', border: '1px solid #c3e6cb' }}>
                <h3 style={{ color: '#155724', marginBottom: '1rem' }}>School Information</h3>
                <div style={{ textAlign: 'left', color: '#155724' }}>
                  <p><strong>School:</strong> {registeredSchool?.schoolName}</p>
                  <p><strong>Teacher:</strong> {registeredSchool?.teacherName || 'Not provided'}</p>
                  <p><strong>Email:</strong> {registeredSchool?.teacherEmail}</p>
                </div>
              </div>

              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '6px', marginBottom: '2rem', border: '1px solid #c3e6cb' }}>
                <h3 style={{ color: '#155724', marginBottom: '1rem' }}>Generated Links</h3>
                <div style={{ textAlign: 'left', color: '#155724', fontSize: '0.9rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Teacher Dashboard:</strong>
                    <div style={{ 
                      background: '#f8f9fa', 
                      padding: '0.5rem', 
                      borderRadius: '4px', 
                      marginTop: '0.25rem',
                      wordBreak: 'break-all',
                      border: '1px solid #dee2e6'
                    }}>
                      {generateDashboardLink()}
                    </div>
                  </div>
                  <div>
                    <strong>Student Registration:</strong>
                    <div style={{ 
                      background: '#f8f9fa', 
                      padding: '0.5rem', 
                      borderRadius: '4px', 
                      marginTop: '0.25rem',
                      wordBreak: 'break-all',
                      border: '1px solid #dee2e6'
                    }}>
                      {generateStudentLink()}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginBottom: '2rem'
              }}>
                <button 
                  onClick={handleCopyLinks}
                  className="btn btn-primary"
                  style={{ 
                    backgroundColor: linksCopyStatus === 'copied' ? '#28a745' : '#007bff',
                    width: '210px'
                  }}
                >
                  {linksCopyStatus === 'copied' ? 'Links Copied!' : 'Copy Links'}
                </button>

                <button 
                  onClick={handleSendEmail}
                  className="btn btn-secondary"
                  disabled={emailStatus === 'sending'}
                  style={{ 
                    backgroundColor: emailStatus === 'sent' ? '#28a745' : 
                                   emailStatus === 'error' ? '#dc3545' : '#6c757d',
                    width: '210px'
                  }}
                >
                  {emailStatus === 'sending' ? 'Sending...' : 
                   emailStatus === 'sent' ? 'Email Sent!' :
                   emailStatus === 'error' ? 'Send Failed' : 'Send Welcome Email'}
                </button>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link 
                  href="/register-school?admin=true"
                  className="btn btn-outline"
                >
                  Add Another School
                </Link>
                
                <Link 
                  href="/admin/matching"
                  className="btn btn-primary"
                >
                  View All Schools
                </Link>
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

  // Regular teacher success page (existing functionality)
  return (
    <div className="page">
      <Header session={session} onLogout={handleLogout} />

      <main className="container" style={{ flex: 1, paddingTop: '3rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Success Message */}
          <div className="card text-center" style={{ background: '#d4edda' }}>
            <h2 style={{ color: '#155724' }}>School Registration Complete!</h2>
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
