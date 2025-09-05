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
}B@Y-logo.jpg" alt="Right Back at You" style={{ height: '40px' }} />
              The Right Back at You Project
            </Link>
            <nav className="nav">
              <Link href="/" className="nav-link">Home</Link>
              <Link href="/register-school" className="nav-link">Register School</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container" style={{ flex: 1, paddingTop: '3rem' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1rem', color: '#4a90e2' }}>Verify Your School</h2>
            <p style={{ color: '#6c757d', marginBottom: '2rem' }}>
              Please enter your school name to access the dashboard. You can use the full name or a shortened version.
            </p>
            
            <form onSubmit={handleVerification}>
              <div style={{ marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Enter your school name..."
                  style={{
                    width: '100%',
                    padding: '1rem',
                    fontSize: '1.1rem',
                    border: '2px solid #dee2e6',
                    borderRadius: '6px',
                    textAlign: 'center'
                  }}
                  disabled={isVerifying}
                  autoFocus
                />
              </div>
              
              {error && (
                <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                  {error}
                </div>
              )}
              
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isVerifying || !schoolName.trim()}
                style={{ 
                  fontSize: '1.1rem', 
                  padding: '1rem 2rem',
                  width: '100%'
                }}
              >
                {isVerifying ? (
                  <>
                    <span className="loading"></span>
                    <span style={{ marginLeft: '0.5rem' }}>Verifying...</span>
                  </>
                ) : (
                  'Access Dashboard'
                )}
              </button>
            </form>
            
            <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '6px' }}>
              <p style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '0' }}>
                <strong>Examples:</strong> "Pacific Elementary", "Pacific Elem", "Pacific", etc.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function TeacherDashboardContent() {
  const searchParams = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [schoolData, setSchoolData] = useState<SchoolData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [tempInterests, setTempInterests] = useState<string[]>([]);
  const [tempOtherInterests, setTempOtherInterests] = useState('');
  const [isRequestingMatching, setIsRequestingMatching] = useState(false);
  const [expandedReadyStudents, setExpandedReadyStudents] = useState<Set<string>>(new Set());
  
  // Removal mode states
  const [missingInfoRemovalMode, setMissingInfoRemovalMode] = useState(false);
  const [readyStudentsRemovalMode, setReadyStudentsRemovalMode] = useState(false);
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    studentName: string;
    studentId: string;
  }>({ show: false, studentName: '', studentId: '' });

  // Get parameters - support both token (new) and teacher email (legacy)
  const dashboardToken = searchParams.get('token');
  const teacherEmail = searchParams.get('teacher'); // Legacy support

  useEffect(() => {
    if (dashboardToken) {
      // Token-based access requires verification first
      setIsLoading(false);
    } else if (teacherEmail) {
      // Legacy email-based access works immediately
      fetchSchoolDataByEmail();
    } else {
      setError('Dashboard access requires a valid token. Please use the correct dashboard link.');
      setIsLoading(false);
    }
  }, [dashboardToken, teacherEmail]);

  const handleSchoolVerified = (verifiedSchoolData: SchoolData) => {
    setSchoolData(verifiedSchoolData);
    setIsVerified(true);
    transformAndSetStudents(verifiedSchoolData.students);
  };

  const fetchSchoolDataByEmail = async () => {
    if (!teacherEmail) return;
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/schools?teacherEmail=${encodeURIComponent(teacherEmail)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load school data');
      }

      setSchoolData(data.school);
      setIsVerified(true);
      transformAndSetStudents(data.school.students);
    } catch (err: any) {
      setError(err.message || 'Failed to load school data');
      console.error('Dashboard error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const transformAndSetStudents = (studentsData: any[]) => {
    const transformedStudents: Student[] = studentsData.map((student: any) => ({
      id: student.id,
      firstName: student.firstName,
      lastInitial: student.lastInitial,
      grade: student.grade,
      interests: student.interests || [],
      otherInterests: student.otherInterests || '',
      hasInterests: (student.interests && student.interests.length > 0) || false,
      status: (student.interests && student.interests.length > 0) ? 'ready' : 'needs-info'
    }));

    setStudents(transformedStudents);
  };

  const studentsWithInterests = students.filter(s => s.hasInterests);
  const studentsNeedingInfo = students.filter(s => !s.hasInterests);
  const totalStudents = students.length;
  const estimatedClassSize = schoolData?.expectedClassSize || 0;
  
  // Simplified ready logic - teacher decides when ready
  const hasActiveStudents = totalStudents > 0;
  const allActiveStudentsComplete = totalStudents > 0 && studentsNeedingInfo.length === 0;
  const readyForMatching = schoolData?.readyForMatching || false;

  const handleRequestMatching = async () => {
    if (!hasActiveStudents || (!teacherEmail && !dashboardToken)) return;
    
    setIsRequestingMatching(true);
    
    try {
      const requestBody = teacherEmail 
        ? { teacherEmail } 
        : { dashboardToken };

      const response = await fetch('/api/schools/request-matching', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to request matching');
      }

      // Update local state
      setSchoolData(prev => prev ? { ...prev, readyForMatching: true } : null);
      
    } catch (err: any) {
      alert('Error requesting matching: ' + err.message);
    } finally {
      setIsRequestingMatching(false);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    // Show inline confirmation dialog
    setConfirmDialog({
      show: true,
      studentName: `${student.firstName} ${student.lastInitial}.`,
      studentId: studentId
    });
  };

  const confirmRemoveStudent = async () => {
    const { studentId } = confirmDialog;
    
    try {
      const response = await fetch('/api/students', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove student');
      }

      // Update local state - remove the student from the list
      setStudents(prev => prev.filter(s => s.id !== studentId));
      
      // Close dialog
      setConfirmDialog({ show: false, studentName: '', studentId: '' });
      
    } catch (err: any) {
      alert('Error removing student: ' + err.message);
      setConfirmDialog({ show: false, studentName: '', studentId: '' });
    }
  };

  const cancelRemoveStudent = () => {
    setConfirmDialog({ show: false, studentName: '', studentId: '' });
  };

  const handleEditInterests = (studentId: string) => {
    if (readyForMatching) {
      alert('Cannot edit student information after matching has been requested. Contact support if you need to make changes.');
      return;
    }

    const student = students.find(s => s.id === studentId);
    if (student) {
      setEditingStudent(studentId);
      setTempInterests([...student.interests]);
      setTempOtherInterests(student.otherInterests);
    }
  };

  const handleInterestChange = (interest: string, checked: boolean) => {
    setTempInterests(prev => 
      checked 
        ? [...prev, interest]
        : prev.filter(i => i !== interest)
    );
  };

  const handleSaveInterests = async (studentId: string) => {
    if (readyForMatching) {
      alert('Cannot edit student information after matching has been requested.');
      return;
    }

    try {
      const response = await fetch('/api/students', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          interests: tempInterests,
          otherInterests: tempOtherInterests
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update student');
      }

      // Update local state
      setStudents(prev => prev.map(student => 
        student.id === studentId 
          ? {
              ...student,
              interests: tempInterests,
              otherInterests: tempOtherInterests,
              hasInterests: tempInterests.length > 0,
              status: tempInterests.length > 0 ? 'ready' as const : 'needs-info' as const
            }
          : student
      ));

      setEditingStudent(null);
      setTempInterests([]);
      setTempOtherInterests('');
    } catch (err: any) {
      alert('Error saving interests: ' + err.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
    setTempInterests([]);
    setTempOtherInterests('');
  };

  const toggleReadyStudentExpansion = (studentId: string) => {
    setExpandedReadyStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const getInterestLabel = (value: string) => {
    const option = INTEREST_OPTIONS.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const getInterestIcon = (value: string) => {
    const option = INTEREST_OPTIONS.find(opt => opt.value === value);
    return option ? option.icon : '🎯';
  };

  const generateStudentLink = () => {
    if (typeof window !== 'undefined' && schoolData?.dashboardToken) {
      return `${window.location.origin}/register-student?token=${schoolData.dashboardToken}`;
    } else if (typeof window !== 'undefined' && teacherEmail) {
      // Legacy support
      const encodedEmail = encodeURIComponent(teacherEmail);
      return `${window.location.origin}/register-student?teacher=${encodedEmail}`;
    }
    return '';
  };

  const generateDashboardLink = () => {
    if (typeof window !== 'undefined' && schoolData?.dashboardToken) {
      return `${window.location.origin}/dashboard?token=${schoolData.dashboardToken}`;
    } else if (typeof window !== 'undefined' && teacherEmail) {
      // Legacy support
      const encodedEmail = encodeURIComponent(teacherEmail);
      return `${window.location.origin}/dashboard?teacher=${encodedEmail}`;
    }
    return '';
  };

  // Show verification screen for token-based access
  if (dashboardToken && !isVerified) {
    return <SchoolVerification onVerified={handleSchoolVerified} token={dashboardToken} />;
  }

  const renderMissingInfoCard = (student: Student) => {
    const isEditing = editingStudent === student.id;

    if (isEditing) {
      return (
        <div key={student.id} className="card" style={{ background: '#fff5f5', border: '2px solid #fed7d7' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: '#c53030', marginBottom: '0.25rem' }}>{student.firstName} {student.lastInitial}.</h4>
            <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Grade {student.grade} • Adding interests</span>
          </div>
          
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '6px', border: '1px solid #fed7d7' }}>
            <h5 style={{ marginBottom: '1rem', color: '#495057' }}>Select {student.firstName}'s Interests:</h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
              {INTEREST_OPTIONS.map(interest => (
                <label key={interest.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="checkbox" 
                    checked={tempInterests.includes(interest.value)}
                    onChange={(e) => handleInterestChange(interest.value, e.target.checked)}
                  />
                  {interest.label}
                </label>
              ))}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Other Interests:</label>
              <textarea 
                className="form-textarea" 
                placeholder="Any other hobbies or interests..."
                rows={2}
                value={tempOtherInterests}
                onChange={(e) => setTempOtherInterests(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-secondary"
                onClick={handleCancelEdit}
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => handleSaveInterests(student.id)}
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                Save Interests
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Compact default state - single row with optional trashcan
    return (
      <div 
        key={student.id} 
        className="card" 
        style={{ 
          background: '#fff5f5', 
          border: '2px solid #fed7d7', 
          padding: '0.75rem',
          margin: '0'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ color: '#c53030', marginBottom: '0', fontSize: '1rem' }}>{student.firstName} {student.lastInitial}.</h4>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => handleEditInterests(student.id)}
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              disabled={readyForMatching}
            >
              {readyForMatching ? 'Locked' : 'Add Interests'}
            </button>
            {missingInfoRemovalMode && (
              <button
                onClick={() => handleRemoveStudent(student.id)}
                style={{
                  background: 'transparent',
                  color: '#dc3545',
                  border: '1px solid #dc3545',
                  borderRadius: '4px',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
                title={`Remove ${student.firstName} ${student.lastInitial}.`}
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderReadyStudentCard = (student: Student) => {
    const isExpanded = expandedReadyStudents.has(student.id);

    if (isExpanded) {
      // Expanded view - show full interests like current cards
      return (
        <div 
          key={student.id} 
          className="card" 
          style={{ background: '#f0f8ff', border: '2px solid #bee5eb', cursor: 'pointer', margin: '0' }}
          onClick={() => toggleReadyStudentExpansion(student.id)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <h4 style={{ color: '#0c5460', marginBottom: '0.25rem' }}>{student.firstName} {student.lastInitial}.</h4>
              <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Grade {student.grade} • Has interests</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="status-ready">
                ✅ Ready
              </span>
              {readyStudentsRemovalMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveStudent(student.id);
                  }}
                  style={{
                    background: 'transparent',
                    color: '#dc3545',
                    border: '1px solid #dc3545',
                    borderRadius: '4px',
                    padding: '0.25rem 0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                  title={`Remove ${student.firstName} ${student.lastInitial}.`}
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
          
          <div style={{ marginBottom: '0' }}>
            <strong style={{ color: '#495057' }}>Interests:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {student.interests.map(interest => (
                <span key={interest} className="tag">{getInterestLabel(interest)}</span>
              ))}
            </div>
            {student.otherInterests && (
              <p style={{ color: '#6c757d', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '0' }}>
                <em>Other:</em> {student.otherInterests}
              </p>
            )}
          </div>
        </div>
      );
    }

    // Collapsed view - just name and checkmark with optional trashcan
    return (
      <div 
        key={student.id} 
        className="card" 
        style={{ 
          background: '#f0f8ff', 
          border: '2px solid #bee5eb', 
          cursor: 'pointer',
          padding: '0.75rem',
          margin: '0'
        }}
        onClick={() => toggleReadyStudentExpansion(student.id)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ color: '#0c5460', marginBottom: '0', fontSize: '1rem' }}>{student.firstName} {student.lastInitial}.</h4>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="status-ready">
              ✅ Ready
            </span>
            {readyStudentsRemovalMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveStudent(student.id);
                }}
                style={{
                  background: 'transparent',
                  color: '#dc3545',
                  border: '1px solid #dc3545',
                  borderRadius: '4px',
                  padding: '0.25rem 0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
                title={`Remove ${student.firstName} ${student.lastInitial}.`}
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
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
        <main className="container" style={{ flex: 1, paddingTop: '3rem' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="loading" style={{ margin: '0 auto 1rem' }}></div>
            <p>Loading your dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
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
                <Link href="/register-school" className="nav-link">Register School</Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="container" style={{ flex: 1, paddingTop: '3rem' }}>
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
          {(teacherEmail || dashboardToken) && (
            <div style={{ textAlign: 'center' }}>
              <button onClick={teacherEmail ? fetchSchoolDataByEmail : () => window.location.reload()} className="btn btn-primary">
                Try Again
              </button>
            </div>
          )}
        </main>
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
              <img src="/R
