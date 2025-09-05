"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { verifyAdminToken } from '@/lib/adminTokens';

// Import components
import SchoolVerification from './components/SchoolVerification';
import DashboardHeader from './components/DashboardHeader';
import StudentMetricsGrid from './components/StudentMetricsGrid';
import MatchingStatusCard from './components/MatchingStatusCard';
import MissingInfoStudents from './components/MissingInfoStudents';
import ReadyStudents from './components/ReadyStudents';
import ConfirmationDialog from './components/ConfirmationDialog';

interface Student {
  id: string;
  firstName: string;
  lastInitial: string;
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

function TeacherDashboardContent() {
  const searchParams = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [schoolData, setSchoolData] = useState<SchoolData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [tempInterests, setTempInterests] = useState<string[]>([]);
  const [tempOtherInterests, setTempOtherInterests] = useState('');
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

  // Token-based verification state
  const [isVerified, setIsVerified] = useState(false);

  // Get token or adminToken from URL parameters
  const token = searchParams.get('token');
  const adminToken = searchParams.get('adminToken');

  useEffect(() => {
    if (adminToken) {
      // Handle admin token flow
      const adminPayload = verifyAdminToken(adminToken);
      if (adminPayload) {
        // Valid admin token - fetch school data and bypass verification
        fetchSchoolDataByToken(adminPayload.schoolToken, true);
      } else {
        setError('Invalid or expired admin token.');
        setIsLoading(false);
      }
    } else if (token) {
      // Handle regular token flow - requires verification
      setIsLoading(false);
    } else {
      setError('Dashboard token is required. Please use the correct dashboard link.');
      setIsLoading(false);
    }
  }, [token, adminToken]);

  const fetchSchoolDataByToken = async (schoolToken: string, skipVerification: boolean = false) => {
    try {
      const response = await fetch(`/api/schools?token=${encodeURIComponent(schoolToken)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load school data');
      }

      setSchoolData(data.school);
      
      if (skipVerification) {
        // Admin token - skip verification and show dashboard
        setIsVerified(true);
        // Pass the school data directly to avoid React state timing issues
        fetchStudentData(data.school.id, data.school);
      }
      // For regular tokens, verification happens in SchoolVerification component
      
    } catch (err: any) {
      setError(err.message || 'Failed to load school data');
      setIsLoading(false);
    }
  };

  const handleSchoolVerified = (verifiedSchoolData: SchoolData) => {
    setSchoolData(verifiedSchoolData);
    setIsVerified(true);
    fetchStudentData(verifiedSchoolData.id, verifiedSchoolData);
  };

  const fetchStudentData = async (schoolId: string, schoolDataParam?: SchoolData) => {
    try {
      // Use passed school data or fall back to state
      const sourceSchoolData = schoolDataParam || schoolData;
      
      // Transform students data to match our Student interface
      const transformedStudents: Student[] = sourceSchoolData?.students?.map((student: any) => ({
        id: student.id,
        firstName: student.firstName,
        lastInitial: student.lastInitial,
        grade: student.grade,
        interests: student.interests || [],
        otherInterests: student.otherInterests || '',
        hasInterests: (student.interests && student.interests.length > 0) || false,
        status: (student.interests && student.interests.length > 0) ? 'ready' : 'needs-info'
      })) || [];

      setStudents(transformedStudents);
      setIsLoading(false); // Stop loading once students are processed
    } catch (err: any) {
      console.error('Error processing student data:', err);
      setIsLoading(false);
    }
  };

  const studentsWithInterests = students.filter(s => s.hasInterests);
  const studentsNeedingInfo = students.filter(s => !s.hasInterests);
  const totalStudents = students.length;
  
  // Simplified ready logic - teacher decides when ready
  const hasActiveStudents = totalStudents > 0;
  const allActiveStudentsComplete = totalStudents > 0 && studentsNeedingInfo.length === 0;
  const readyForMatching = schoolData?.readyForMatching || false;

  const handleMatchingRequested = () => {
    setSchoolData(prev => prev ? { ...prev, readyForMatching: true } : null);
  };

  const handleRemoveStudent = async (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

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

      setStudents(prev => prev.filter(s => s.id !== studentId));
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

  const toggleMissingInfoRemovalMode = () => {
    setMissingInfoRemovalMode(!missingInfoRemovalMode);
    if (readyStudentsRemovalMode) {
      setReadyStudentsRemovalMode(false);
    }
  };

  const toggleReadyStudentsRemovalMode = () => {
    setReadyStudentsRemovalMode(!readyStudentsRemovalMode);
    if (missingInfoRemovalMode) {
      setMissingInfoRemovalMode(false);
    }
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
                <Link href="/" className="nav-link">Home</Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="container" style={{ flex: 1, paddingTop: '3rem' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="loading" style={{ margin: '0 auto 1rem' }}></div>
            <p>Loading dashboard...</p>
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
        </main>
      </div>
    );
  }

  // Show verification screen if not verified yet and using regular token
  if (!isVerified && token && !adminToken) {
    return <SchoolVerification onVerified={handleSchoolVerified} token={token} />;
  }

  if (!schoolData) {
    return null;
  }

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
              <Link href={`/dashboard?${adminToken ? `adminToken=${adminToken}` : `token=${token}`}`} className="nav-link">Dashboard</Link>
              <Link href="/register-school" className="nav-link">School Settings</Link>
              <Link href="/logout" className="nav-link">Logout</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container" style={{ flex: 1, paddingTop: '3rem' }}>
        
        <DashboardHeader 
          schoolData={schoolData} 
          dashboardToken={adminToken || token || ''} 
        />

        <StudentMetricsGrid 
          schoolData={schoolData}
          totalStudents={totalStudents}
          studentsWithInterests={studentsWithInterests}
        />

        <MatchingStatusCard 
          schoolData={schoolData}
          allActiveStudentsComplete={allActiveStudentsComplete}
          onMatchingRequested={handleMatchingRequested}
        />

        <MissingInfoStudents 
          studentsNeedingInfo={studentsNeedingInfo}
          missingInfoRemovalMode={missingInfoRemovalMode}
          editingStudent={editingStudent}
          tempInterests={tempInterests}
          tempOtherInterests={tempOtherInterests}
          readyForMatching={readyForMatching}
          onToggleRemovalMode={toggleMissingInfoRemovalMode}
          onEditInterests={handleEditInterests}
          onRemoveStudent={handleRemoveStudent}
          onSaveInterests={handleSaveInterests}
          onCancelEdit={handleCancelEdit}
          onInterestChange={handleInterestChange}
          onOtherInterestsChange={setTempOtherInterests}
        />

        <ReadyStudents 
          studentsWithInterests={studentsWithInterests}
          readyStudentsRemovalMode={readyStudentsRemovalMode}
          expandedReadyStudents={expandedReadyStudents}
          readyForMatching={readyForMatching}
          onToggleRemovalMode={toggleReadyStudentsRemovalMode}
          onRemoveStudent={handleRemoveStudent}
          onToggleExpansion={toggleReadyStudentExpansion}
        />

        <ConfirmationDialog 
          show={confirmDialog.show}
          studentName={confirmDialog.studentName}
          studentId={confirmDialog.studentId}
          onConfirm={confirmRemoveStudent}
          onCancel={cancelRemoveStudent}
        />

        {/* No students message */}
        {totalStudents === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', marginBottom: '2rem' }}>
            <h3 style={{ color: '#6c757d', marginBottom: '1rem' }}>No Students Registered Yet</h3>
            <p style={{ color: '#6c757d', marginBottom: '2rem' }}>
              Share the student registration link above to get started, or add students manually.
            </p>
            <Link 
              href={`/register-student?token=${schoolData?.dashboardToken}`}
              className="btn btn-primary"
            >
              Add First Student
            </Link>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Link 
            href={`/register-student?token=${schoolData?.dashboardToken}`}
            className="btn btn-secondary"
            style={readyForMatching ? { 
              opacity: 0.6, 
              cursor: 'not-allowed',
              pointerEvents: 'none'
            } : {}}
            title={readyForMatching ? "Cannot add students after matching is requested" : "Add new student"}
          >
            Add New Student
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
              if (hasActiveStudents && !readyForMatching && schoolData?.dashboardToken) {
                window.open(`/dashboard/print?token=${schoolData.dashboardToken}`, '_blank');
              }
            }}
            title={readyForMatching ? "Matching has been requested" : (!hasActiveStudents ? "Need students first" : "Download student information")}
          >
            Download Student Info
          </button>
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
