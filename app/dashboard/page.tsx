"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
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

function TeacherDashboardContent() {
  const searchParams = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [schoolData, setSchoolData] = useState<SchoolData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [tempInterests, setTempInterests] = useState<string[]>([]);
  const [tempOtherInterests, setTempOtherInterests] = useState('');
  const [isRequestingMatching, setIsRequestingMatching] = useState(false);
  const [expandedReadyStudents, setExpandedReadyStudents] = useState<Set<string>>(new Set());

  // Get teacher email from URL parameter
  const teacherEmail = searchParams.get('teacher');

  useEffect(() => {
    if (teacherEmail) {
      fetchSchoolData();
    } else {
      setError('Teacher email is required. Please use the correct dashboard link.');
      setIsLoading(false);
    }
  }, [teacherEmail]);

  const fetchSchoolData = async () => {
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
      
      // Transform students data to match our Student interface
      const transformedStudents: Student[] = data.school.students.map((student: any) => ({
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        grade: student.grade,
        interests: student.interests || [],
        otherInterests: student.otherInterests || '',
        hasInterests: (student.interests && student.interests.length > 0) || false,
        status: (student.interests && student.interests.length > 0) ? 'ready' : 'needs-info'
      }));

      setStudents(transformedStudents);
    } catch (err: any) {
      setError(err.message || 'Failed to load school data');
      console.error('Dashboard error:', err);
    } finally {
      setIsLoading(false);
    }
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
    if (!hasActiveStudents || !teacherEmail) return;
    
    setIsRequestingMatching(true);
    
    try {
      const response = await fetch('/api/schools/request-matching', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teacherEmail })
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
    if (typeof window !== 'undefined' && teacherEmail) {
      const encodedEmail = encodeURIComponent(teacherEmail);
      return `${window.location.origin}/register-student?teacher=${encodedEmail}`;
    }
    return '';
  };

  const renderMissingInfoCard = (student: Student) => {
    const isEditing = editingStudent === student.id;

    if (isEditing) {
      return (
        <div key={student.id} className="card" style={{ background: '#fff5f5', border: '2px solid #fed7d7' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: '#c53030', marginBottom: '0.25rem' }}>{student.firstName} {student.lastName}</h4>
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

    // Compact default state - single row like Ready Students cards
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
            <h4 style={{ color: '#c53030', marginBottom: '0', fontSize: '1rem' }}>{student.firstName} {student.lastName}</h4>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => handleEditInterests(student.id)}
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
            disabled={readyForMatching}
          >
            {readyForMatching ? 'Locked' : 'Add Interests'}
          </button>
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
              <h4 style={{ color: '#0c5460', marginBottom: '0.25rem' }}>{student.firstName} {student.lastName}</h4>
              <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Grade {student.grade} • Has interests</span>
            </div>
            <span className="status-ready">
              ✅ Ready
            </span>
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

    // Collapsed view - just name and checkmark
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
            <h4 style={{ color: '#0c5460', marginBottom: '0', fontSize: '1rem' }}>{student.firstName} {student.lastName}</h4>
          </div>
          <span className="status-ready">
            ✅ Ready
          </span>
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
                <Link href={`/dashboard?teacher=${encodeURIComponent(teacherEmail || '')}`} className="nav-link">Dashboard</Link>
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
          {teacherEmail && (
            <div style={{ textAlign: 'center' }}>
              <button onClick={fetchSchoolData} className="btn btn-primary">
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
              <img src="/RB@Y-logo.jpg" alt="Right Back at You" style={{ height: '40px' }} />
              The Right Back at You Project
            </Link>
            <nav className="nav">
              <Link href={`/dashboard?teacher=${encodeURIComponent(teacherEmail || '')}`} className="nav-link">Dashboard</Link>
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
            <h1 style={{ marginBottom: '0.5rem' }}>Teacher Dashboard</h1>
            <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
              Welcome back, {schoolData?.teacherName}! Here's your {schoolData?.schoolName} overview.
            </p>
          </div>
          
          {/* Student Registration Link - aligned with Add Interests buttons */}
          <div>
            <h3 style={{ marginBottom: '0.5rem' }}>Share This Link With Your Students</h3>
            <button 
              onClick={() => navigator.clipboard.writeText(generateStudentLink())}
              className="btn btn-primary"
            >
              📋 Copy Student Registration Link
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-4" style={{ marginBottom: '3rem' }}>
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
              <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                {studentsNeedingInfo.length} students need interests
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {studentsNeedingInfo.map(student => renderMissingInfoCard(student))}
            </div>
          </div>
        )}

        {/* Ready Students in 3-column layout */}
        {studentsWithInterests.length > 0 && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3>Ready Students ({studentsWithInterests.length})</h3>
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

        {/* No students message */}
        {totalStudents === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', marginBottom: '2rem' }}>
            <h3 style={{ color: '#6c757d', marginBottom: '1rem' }}>No Students Registered Yet</h3>
            <p style={{ color: '#6c757d', marginBottom: '2rem' }}>
              Share the student registration link above to get started, or add students manually.
            </p>
            <Link 
              href={`/register-student?teacher=${encodeURIComponent(teacherEmail || '')}`}
              className="btn btn-primary"
            >
              ➕ Add First Student
            </Link>
          </div>
        )}

        {/* Action Buttons - aligned to right */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Link 
            href={`/register-student?teacher=${encodeURIComponent(teacherEmail || '')}`}
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
              if (hasActiveStudents && !readyForMatching && teacherEmail) {
                window.open(`/dashboard/print?teacher=${encodeURIComponent(teacherEmail)}`, '_blank');
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
