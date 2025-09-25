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

        <main className="container" style={{ flex: 1, paddingTop: '1.5rem' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            
            {/* Page Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start', 
              marginBottom: '1.5rem' 
            }}>
              <div>
                <h1 className="text-school-name" style={{ marginBottom: '0.5rem', fontSize: '1.8rem' }}>
                  School Created Successfully!
                </h1>
                <p className="text-school-name" style={{ margin: 0 }}>
                  Admin Dashboard - {registeredSchool?.schoolName}
                </p>
              </div>
              
              <div>
                <Link href="/admin/matching" className="btn btn-primary">
                  ← Back to Admin Dashboard
                </Link>
              </div>
            </div>

            {/* Success Status Card */}
            <div className="card" style={{ 
              background: '#f8f9fa', 
              borderLeft: '3px solid #28a745',
              marginBottom: '1.5rem'
            }}>
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '400', 
                  color: '#333',
                  marginBottom: '0.5rem'
                }}>
                  ✓ School successfully added to the system
                </div>
                <div className="text-meta-info">
                  The teacher can now access their dashboard and begin registering students
                </div>
              </div>
            </div>

            {/* School Information Card */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
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
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                <div className="data-cell">
                  <div className="text-data-label">School Name</div>
                  <div className="text-data-value">{registeredSchool?.schoolName}</div>
                </div>
                <div className="data-cell">
                  <div className="text-data-label">Teacher Name</div>
                  <div className="text-data-value">{registeredSchool?.teacherName || 'Not provided'}</div>
                </div>
                <div className="data-cell">
                  <div className="text-data-label">Email Address</div>
                  <div className="text-data-value">{registeredSchool?.teacherEmail}</div>
                </div>
              </div>
            </div>

            {/* Generated Links Card */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ 
                color: '#333', 
                fontSize: '1.2rem',
                fontWeight: '400',
                borderBottom: '1px solid #e9ecef', 
                paddingBottom: '0.5rem', 
                marginBottom: '1.5rem' 
              }}>
                Generated Links
              </h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="text-data-label" style={{ marginBottom: '0.5rem' }}>Teacher Dashboard</div>
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '0.75rem', 
                  borderRadius: '4px', 
                  border: '1px solid #e9ecef',
                  wordBreak: 'break-all',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  color: '#555'
                }}>
                  {generateDashboardLink()}
                </div>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="text-data-label" style={{ marginBottom: '0.5rem' }}>Student Registration Link</div>
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '0.75rem', 
                  borderRadius: '4px', 
                  border: '1px solid #e9ecef',
                  wordBreak: 'break-all',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  color: '#555'
                }}>
                  {generateStudentLink()}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button 
                  onClick={handleCopyLinks}
                  className="btn btn-primary"
                  style={{ 
                    backgroundColor: linksCopyStatus === 'copied' ? '#28a745' : 'white',
                    color: linksCopyStatus === 'copied' ? 'white' : '#555',
                    borderColor: linksCopyStatus === 'copied' ? '#28a745' : '#ddd'
                  }}
                >
                  {linksCopyStatus === 'copied' ? '✓ Links Copied!' : 'Copy Both Links'}
                </button>

                <button 
                  onClick={handleSendEmail}
                  className="btn btn-primary"
                  disabled={emailStatus === 'sending'}
                  style={{ 
                    backgroundColor: emailStatus === 'sent' ? '#28a745' : 
                                   emailStatus === 'error' ? '#dc3545' : 'white',
                    color: emailStatus === 'sent' ? 'white' :
                           emailStatus === 'error' ? 'white' : '#555',
                    borderColor: emailStatus === 'sent' ? '#28a745' :
                                emailStatus === 'error' ? '#dc3545' : '#ddd'
                  }}
                >
                  {emailStatus === 'sending' ? (
                    <>
                      <span className="loading" style={{ marginRight: '0.5rem' }}></span>
                      Sending...
                    </>
                  ) : emailStatus === 'sent' ? '✓ Email Sent!' :
                     emailStatus === 'error' ? '✗ Send Failed' : 'Send Welcome Email'}
                </button>
              </div>
            </div>

            {/* Next Actions Card */}
            <div className="card" style={{ textAlign: 'center' }}>
              <h3 style={{ 
                color: '#333', 
                fontSize: '1.2rem',
                fontWeight: '400',
                marginBottom: '1.5rem' 
              }}>
                Next Actions
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Link 
                  href="/register-school?admin=true"
                  className="btn btn-primary"
                  style={{ textDecoration: 'none' }}
                >
                  Add Another School
                </Link>
                
                <Link 
                  href="/admin/matching"
                  className="btn btn-success"
                  style={{ textDecoration: 'none' }}
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

  // Regular teacher success page
  return (
    <div className="page">
      <Header session={session} onLogout={handleLogout} />

      <main className="container" style={{ flex: 1, paddingTop: '1.5rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          {/* Page Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            marginBottom: '1.5rem' 
          }}>
            <div>
              <h1 className="text-school-name" style={{ marginBottom: '0.5rem', fontSize: '1.8rem' }}>
                Registration Complete!
              </h1>
              <p className="text-school-name" style={{ margin: 0 }}>
                {registeredSchool?.schoolName} - Welcome to the Program
              </p>
            </div>
          </div>

          {/* Success Status Card */}
          <div className="card" style={{ 
            background: '#f8f9fa', 
            borderLeft: '3px solid #28a745',
            marginBottom: '1.5rem'
          }}>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ 
                fontSize: '1.2rem', 
                fontWeight: '400', 
                color: '#333',
                marginBottom: '0.5rem'
              }}>
                ✓ Your school has been successfully registered!
              </div>
              <div className="text-meta-info">
                You can now access your dashboard and begin registering students
              </div>
            </div>
          </div>

          {/* Next Steps Card */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ 
              color: '#333', 
              fontSize: '1.2rem',
              fontWeight: '400',
              borderBottom: '1px solid #e9ecef', 
              paddingBottom: '0.5rem', 
              marginBottom: '1.5rem' 
            }}>
              Your Next Steps
            </h3>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              
              <div>
                <div className="text-data-value" style={{ marginBottom: '0.5rem' }}>
                  <strong>1. Access Your Dashboard</strong>
                </div>
                <div className="text-meta-info" style={{ marginBottom: '0.75rem' }}>
                  You can access your dashboard anytime by logging in:
                </div>
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '0.75rem', 
                  borderRadius: '4px', 
                  border: '1px solid #e9ecef',
                  wordBreak: 'break-all',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  color: '#555'
                }}>
                  {generateDashboardLink()}
                </div>
              </div>
              
              <div>
                <div className="text-data-value" style={{ marginBottom: '0.5rem' }}>
                  <strong>2. Share Student Registration Link</strong>
                </div>
                <div className="text-meta-info" style={{ marginBottom: '0.75rem' }}>
                  Students can register using this link:
                </div>
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '0.75rem', 
                  borderRadius: '4px', 
                  border: '1px solid #e9ecef',
                  wordBreak: 'break-all',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  color: '#555'
                }}>
                  {generateStudentLink()}
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div className="text-data-value" style={{ marginBottom: '0.5rem' }}>
                    <strong>3. Monitor Registration</strong>
                  </div>
                  <div className="text-meta-info">
                    Use your dashboard to track student signups
                  </div>
                </div>
                
                <div>
                  <div className="text-data-value" style={{ marginBottom: '0.5rem' }}>
                    <strong>4. Complete Student Profiles</strong>
                  </div>
                  <div className="text-meta-info">
                    Help students add their interests
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div className="text-data-value" style={{ marginBottom: '0.5rem' }}>
                    <strong>5. Request Matching</strong>
                  </div>
                  <div className="text-meta-info">
                    When all students are ready, request partner school matching
                  </div>
                </div>
                
                <div>
                  <div className="text-data-value" style={{ marginBottom: '0.5rem' }}>
                    <strong>6. Start Writing!</strong>
                  </div>
                  <div className="text-meta-info">
                    Begin the penpal correspondence
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="card" style={{ textAlign: 'center' }}>
            <Link 
              href="/dashboard"
              className="btn btn-success"
              style={{ 
                textDecoration: 'none',
                padding: '1rem 2.5rem', 
                fontSize: '1rem'
              }}
            >
              Go to My Dashboard
            </Link>
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
