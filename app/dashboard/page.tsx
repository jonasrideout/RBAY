"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Student {
  id: string;
  firstName: string;
  lastInitial: string;  // Changed from lastName
  grade: string;
  interests: string[];
  otherInterests: string;
  hasInterests: boolean;
  status: 'ready' | 'needs-info' | 'matched';
}

interface SchoolData {
  id: string;
  schoolName: string;
  teacherName: string;
  teacherEmail: string;
  dashboardToken: string;
  expectedClassSize: number;
  startMonth: string;
  programStartMonth: string;
  readyForMatching: boolean;
  students: any[];
}

const INTEREST_OPTIONS = [
  { value: 'sports', label: '🏀 Sports & Athletics', icon: '🏀' },
  { value: 'arts', label: '🎨 Arts & Creativity', icon: '🎨' },
  { value: 'reading', label: '📚 Reading & Books', icon: '📚' },
  { value: 'technology', label: '💻 Technology & Gaming', icon: '💻' },
  { value: 'animals', label: '🐕 Animals & Nature', icon: '🐕' },
  { value: 'entertainment', label: '🎬 Entertainment & Media', icon: '🎬' },
  { value: 'social', label: '👥 Social & Family', icon: '👥' },
  { value: 'academic', label: '🧮 Academic Subjects', icon: '🧮' },
  { value: 'hobbies', label: '🎯 Hobbies & Collections', icon: '🎯' },
  { value: 'outdoors', label: '🏕️ Outdoor Activities', icon: '🏕️' },
  { value: 'music', label: '🎵 Music & Performance', icon: '🎵' },
  { value: 'fashion', label: '👗 Fashion & Style', icon: '👗' }
];

// School name verification component
function SchoolVerification({ onVerified, token }: { onVerified: (schoolData: SchoolData) => void, token: string }) {
  const [schoolName, setSchoolName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim()) return;

    setIsVerifying(true);
    setError('');

    try {
      // First, get school data by token
      const response = await fetch(`/api/schools?token=${encodeURIComponent(token)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid dashboard token');
      }

      const school = data.school;
      
      // Verify school name with partial matching
      const enteredName = schoolName.trim().toLowerCase();
      const actualName = school.schoolName.toLowerCase();
      
      // Flexible matching logic
      const isExactMatch = enteredName === actualName;
      const isSubstringMatch = actualName.includes(enteredName) || enteredName.includes(actualName);
      const isWordMatch = enteredName.split(' ').some(word => 
        word.length > 2 && actualName.includes(word)
      );
      
      // Handle common abbreviations
      const normalizeSchoolName = (name: string) => {
        return name
          .replace(/elementary/gi, 'elem')
          .replace(/middle school/gi, 'ms')
          .replace(/school/gi, 'sch')
          .replace(/academy/gi, 'acad')
          .replace(/\s+/g, ' ')
          .trim();
      };
      
      const normalizedEntered = normalizeSchoolName(enteredName);
      const normalizedActual = normalizeSchoolName(actualName);
      const isAbbreviationMatch = 
        normalizedEntered === normalizedActual ||
        normalizedActual.includes(normalizedEntered) ||
        normalizedEntered.includes(normalizedActual);

      if (isExactMatch || isSubstringMatch || isWordMatch || isAbbreviationMatch) {
        onVerified(school);
      } else {
        setError(`School name doesn't match. Expected: "${school.schoolName}"`);
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="page">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/RB@Y-logo.jpg" alt="Right Back at You" style={{ height: '40px' }} />
              The Right Back at You Project
            </Link>
            <nav className="nav">
              <Link href={generateDashboardLink()} className="nav-link">Dashboard</Link>
              <Link href="/register-school" className="nav-link">School Settings</Link>
              <Link href="/logout" className="nav-link">Logout</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ flex: 1, paddingTop: '3rem' }}>
        
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ marginBottom: '0.5rem', marginTop: '0' }}>{schoolData?.schoolName}</h1>
            <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
              {schoolData?.teacherName}
            </p>
          </div>
          
          {/* Student Registration Link - aligned with metrics grid */}
          <div>
            <h3 style={{ marginBottom: '0.5rem', textAlign: 'right', fontSize: '1rem', marginTop: '0' }}>Share This Link With Your Students</h3>
            <button 
              onClick={() => navigator.clipboard.writeText(generateStudentLink())}
              className="btn btn-primary"
              style={{ width: '100%', fontSize: '0.85rem', padding: '0.75rem' }}
            >
              📋 Copy Student Registration Link
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '3rem' }}>
          <div className="card text-center" style={{ background: '#f8f9fa' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#4a90e2', marginBottom: '0.5rem' }}>
              {estimatedClassSize}
            </div>
            <div style={{ color: '#6c757d', fontWeight: '600' }}>Estimated Class Size</div>
            <div style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.25rem' }}>
              Expected in class
            </div>
          </div>

          <div className="card text-center" style={{ background: '#f8f9fa' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#28a745', marginBottom: '0.5rem' }}>
              {totalStudents}
            </div>
            <div style={{ color: '#6c757d', fontWeight: '600' }}>Students Registered</div>
            <div style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.25rem' }}>
              Actually signed up
            </div>
          </div>

          <div className="card text-center" style={{ background: '#f8f9fa' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#17a2b8', marginBottom: '0.5rem' }}>
              {studentsWithInterests.length}
            </div>
            <div style={{ color: '#6c757d', fontWeight: '600' }}>Students Ready to Match</div>
            <div style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.25rem' }}>
              Have complete profiles
            </div>
          </div>

          <div className="card text-center" style={{ background: '#f8f9fa' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fd7e14', marginBottom: '0.5rem' }}>
              {schoolData?.startMonth || 'Not Set'}
            </div>
            <div style={{ color: '#6c757d', fontWeight: '600' }}>Start Date</div>
            <div style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.25rem' }}>
              Requested timeline
            </div>
          </div>
        </div>

        {/* Class Status & Actions - Only show when all students have complete profiles */}
        {allActiveStudentsComplete && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                {readyForMatching ? (
                  <>
                    <h3 style={{ color: '#17a2b8', marginBottom: '0.5rem' }}>
                      🎯 Matching Requested
                    </h3>
                    <p style={{ color: '#6c757d', marginBottom: '0' }}>
                      Waiting for partner school. We will email you when matching is complete.
                    </p>
                  </>
                ) : (
                  <>
                    <h3 style={{ color: '#28a745', marginBottom: '0.5rem' }}>
                      ✅ Ready for Matching!
                    </h3>
                    <p style={{ color: '#6c757d', marginBottom: '0' }}>
                      All active students have provided their interest information. You can request matching when ready!
                    </p>
                  </>
                )}
              </div>
              <div>
                <button 
                  className="btn" 
                  style={{ 
                    backgroundColor: readyForMatching ? '#17a2b8' : '#28a745', 
                    color: 'white', 
                    cursor: isRequestingMatching ? 'not-allowed' : 'pointer',
                    padding: '1rem 2rem',
                    fontSize: '1.1rem'
                  }}
                  disabled={isRequestingMatching}
                  onClick={handleRequestMatching}
                  title={readyForMatching ? "Matching has been requested" : "Request matching with current students"}
                >
                  {readyForMatching ? '✅ Matching Requested' : (isRequestingMatching ? (
                    <>
                      <span className="loading"></span>
                      <span style={{ marginLeft: '0.5rem' }}>Requesting...</span>
                    </>
                  ) : '🎯 Request Matching')}
                </button>
                <p style={{ color: '#6c757d', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '0' }}>
                  All students ready - you can request matching anytime!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Students Missing Information - Only show if there are students needing info */}
        {studentsNeedingInfo.length > 0 && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>Students Missing Information</h3>
              <button
                className="btn"
                onClick={() => {
                  setMissingInfoRemovalMode(!missingInfoRemovalMode);
                  if (readyStudentsRemovalMode) {
                    setReadyStudentsRemovalMode(false);
                  }
                }}
                style={{ 
                  fontSize: '0.9rem',
                  backgroundColor: missingInfoRemovalMode ? 'transparent' : '#6c757d',
                  color: missingInfoRemovalMode ? '#6c757d' : 'white',
                  border: missingInfoRemovalMode ? '1px solid #6c757d' : 'none'
                }}
                disabled={readyForMatching}
                title={readyForMatching ? "Cannot remove students after matching requested" : undefined}
              >
                {missingInfoRemovalMode ? 'Finished' : 'Remove Student'}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {studentsNeedingInfo.map(student => renderMissingInfoCard(student))}
            </div>
          </div>
        )}

        {/* Ready Students in 3-column layout */}
        {studentsWithInterests.length > 0 && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>Ready Students ({studentsWithInterests.length})</h3>
              <button
                className="btn"
                onClick={() => {
                  setReadyStudentsRemovalMode(!readyStudentsRemovalMode);
                  if (missingInfoRemovalMode) {
                    setMissingInfoRemovalMode(false);
                  }
                }}
                style={{ 
                  fontSize: '0.9rem',
                  backgroundColor: readyStudentsRemovalMode ? 'transparent' : '#6c757d',
                  color: readyStudentsRemovalMode ? '#6c757d' : 'white',
                  border: readyStudentsRemovalMode ? '1px solid #6c757d' : 'none'
                }}
                disabled={readyForMatching}
                title={readyForMatching ? "Cannot remove students after matching requested" : undefined}
              >
                {readyStudentsRemovalMode ? 'Finished' : 'Remove Student'}
              </button>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '0.75rem'
            }}>
              {studentsWithInterests.map(student => renderReadyStudentCard(student))}
            </div>
          </div>
        )}

        {/* Inline Confirmation Dialog */}
        {confirmDialog.show && (
          <div className="card" style={{ 
            position: 'fixed', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            minWidth: '300px',
            maxWidth: '400px',
            border: '2px solid #dc3545',
            backgroundColor: 'white'
          }}>
            <h4 style={{ marginBottom: '1rem', color: '#dc3545' }}>Remove Student</h4>
            <p style={{ marginBottom: '1.5rem', color: '#495057' }}>
              Are you sure you want to permanently remove {confirmDialog.studentName}?
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-secondary"
                onClick={cancelRemoveStudent}
                style={{ padding: '0.5rem 1rem' }}
              >
                Cancel
              </button>
              <button 
                className="btn" 
                onClick={confirmRemoveStudent}
                style={{ 
                  backgroundColor: '#dc3545', 
                  color: 'white', 
                  padding: '0.5rem 1rem' 
                }}
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* No students message */}
        {totalStudents === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', marginBottom: '2rem' }}>
            <h3 style={{ color: '#6c757d', marginBottom: '1rem' }}>No Students Registered Yet</h3>
            <p style={{ color: '#6c757d', marginBottom: '2rem' }}>
              Share the student registration link above to get started, or add students manually.
            </p>
            <Link 
              href={generateStudentLink()}
              className="btn btn-primary"
            >
              ➕ Add First Student
            </Link>
          </div>
        )}

        {/* Action Buttons - aligned to right */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Link 
            href={generateStudentLink()}
            className="btn btn-secondary"
            style={readyForMatching ? { 
              opacity: 0.6, 
              cursor: 'not-allowed',
              pointerEvents: 'none'
            } : {}}
            title={readyForMatching ? "Cannot add students after matching is requested" : "Add new student"}
          >
            ➕ Add New Student
          </Link>
          <button 
            className="btn" 
            style={{ 
              backgroundColor: (!hasActiveStudents || readyForMatching) ? '#6c757d' : '#4a90e2', 
              color: 'white', 
              cursor: (!hasActiveStudents || readyForMatching) ? 'not-allowed' : 'pointer'
            }}
            disabled={!hasActiveStudents || readyForMatching}
            onClick={() => {
              if (hasActiveStudents && !readyForMatching) {
                const printUrl = dashboardToken 
                  ? `/dashboard/print?token=${dashboardToken}`
                  : `/dashboard/print?teacher=${encodeURIComponent(teacherEmail || '')}`;
                window.open(printUrl, '_blank');
              }
            }}
            title={readyForMatching ? "Matching has been requested" : (!hasActiveStudents ? "Need students first" : "Download student information")}
          >
            📥 Download Student Info
          </button>
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

// Loading component for Suspense fallback
function LoadingDashboard() {
  return (
    <div className="page">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/RB@Y-logo.jpg" alt="Right Back at You" style={{ height: '40px' }} />
              The Right Back at You Project
            </Link>
            <nav className="nav">
              <Link href="/" className="nav-link">Home</Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="container" style={{ flex: 1, paddingTop: '3rem' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Loading dashboard...</div>
        </div>
      </main>
    </div>
  );
}

export default function TeacherDashboard() {
  return (
    <Suspense fallback={<LoadingDashboard />}>
      <TeacherDashboardContent />
    </Suspense>
  );
}
