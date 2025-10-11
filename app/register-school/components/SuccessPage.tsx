"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTeacherSession } from '@/lib/useTeacherSession';
import Header from '../../components/Header';

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
  const { data: session } = useTeacherSession();
  const router = useRouter();
  
  // Copy button states
  const [studentLinkCopyStatus, setStudentLinkCopyStatus] = useState<'idle' | 'copied'>('idle');

  const handleLogout = () => {
    router.push('/api/auth/signout?callbackUrl=' + encodeURIComponent(getBaseUrl()));
  };

  // Use environment variable for consistent URL generation
  const getBaseUrl = () => {
    return process.env.NEXT_PUBLIC_APP_URL || 'https://nextjs-boilerplate-beta-three-49.vercel.app';
  };

  const generateStudentLink = () => {
    if (registeredSchool?.dashboardToken) {
      return `${getBaseUrl()}/register-student?token=${registeredSchool.dashboardToken}`;
    }
    return '';
  };

  const generateDashboardLink = () => {
    // Session-based dashboard - no token needed
    return `${getBaseUrl()}/dashboard`;
  };

  // Copy student registration link
  const handleCopyStudentLink = async () => {
    try {
      const studentLink = generateStudentLink();
      await navigator.clipboard.writeText(studentLink);
      setStudentLinkCopyStatus('copied');
      setTimeout(() => setStudentLinkCopyStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to copy student link:', err);
    }
  };

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
                  You can access your dashboard anytime by logging in
                </div>
                <Link 
                  href={generateDashboardLink()}
                  className="btn"
                  style={{ 
                    textDecoration: 'none',
                    backgroundColor: '#2c5aa0',
                    color: 'white',
                    border: '1px solid #2c5aa0',
                    fontWeight: '500',
                    padding: '0.75rem 1.5rem',
                    display: 'inline-block'
                  }}
                >
                  Go to Dashboard
                </Link>
              </div>
              
              <div>
                <div className="text-data-value" style={{ marginBottom: '0.5rem' }}>
                  <strong>2. Share Student Registration Link</strong>
                </div>
                <div className="text-meta-info" style={{ marginBottom: '0.75rem' }}>
                  Students can register using this link
                </div>
                <button 
                  onClick={handleCopyStudentLink}
                  className="btn"
                  style={{ 
                    backgroundColor: '#2c5aa0',
                    color: 'white',
                    border: '1px solid #2c5aa0',
                    fontWeight: '500',
                    padding: '0.75rem 1.5rem'
                  }}
                >
                  {studentLinkCopyStatus === 'copied' ? '✓ Link Copied!' : 'Copy Student Registration Link'}
                </button>
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
              className="btn"
              style={{ 
                textDecoration: 'none',
                padding: '1rem 2.5rem', 
                fontSize: '1rem',
                backgroundColor: '#2c5aa0',
                color: 'white',
                border: '1px solid #2c5aa0',
                fontWeight: '500'
              }}
            >
              Go to My Dashboard
            </Link>
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
