"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import { useTeacherSession, useSessionWarning } from '@/lib/useTeacherSession';

// Import components
import DashboardHeader from './components/DashboardHeader';
import StudentMetricsGrid from './components/StudentMetricsGrid';
import MatchingSection from './components/MatchingSection';
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
  status: 'COLLECTING' | 'READY' | 'MATCHED' | 'CORRESPONDING' | 'DONE';
  students: any[];
  matchedWithSchoolId?: string;
  matchedSchoolName?: string;
  schoolState?: string;
  schoolCity?: string;
  gradeLevel?: string;
  teacherPhone?: string;
  specialConsiderations?: string;
  matchedSchool?: {
    id: string;
    schoolName: string;
    teacherName: string;
    teacherEmail: string;
    schoolCity?: string;
    schoolState?: string;
    expectedClassSize: number;
    region: string;
  };
}

// Session Warning Component
function SessionWarningBanner() {
  const { showWarning, timeUntilExpiry, dismissWarning, extendSession } = useSessionWarning();
  const [isExtending, setIsExtending] = useState(false);

  const handleExtendSession = async () => {
    setIsExtending(true);
    const success = await extendSession();
    setIsExtending(false);
    
    if (!success) {
      alert('Failed to extend session. Please save your work and sign in again.');
    }
  };

  if (!showWarning || timeUntilExpiry === null) {
    return null;
  }

  return (
    <div className="alert alert-warning" style={{ 
      position: 'sticky', 
      top: '0', 
      zIndex: 1000,
      marginBottom: '1rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong>Session Expiring Soon!</strong> Your session will expire in {timeUntilExpiry} minute{timeUntilExpiry !== 1 ? 's' : ''}. 
          You'll be automatically logged out unless you take action.
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={handleExtendSession}
            disabled={isExtending}
            className="btn btn-success"
            style={{ minWidth: '120px' }}
          >
            {isExtending ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loading" style={{ marginRight: '0.5rem' }}></div>
                Extending...
              </div>
            ) : (
              'Stay Logged In'
            )}
          </button>
          <button 
            onClick={dismissWarning}
            className="nav-link"
            style={{ background: 'none', border: 'none', color: '#856404' }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

function TeacherDashboardContent() {
  const { data: session, status } = useTeacherSession();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [schoolData, setSchoolData] = useState<SchoolData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedReadyStudents, setExpandedReadyStudents] = useState<Set<string>>(new Set());
  
  // Removal mode state
  const [readyStudentsRemovalMode, setReadyStudentsRemovalMode] = useState(false);
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    studentName: string;
    studentId: string;
  }>({ show: false, studentName: '', studentId: '' });

  // Session-based authentication and school lookup
  useEffect(() => {
    if (status === 'loading') return; // Still loading session

    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (session?.user?.email) {
      fetchSchoolByEmail(session.user.email);
    } else {
      setError('User email not found in session');
      setIsLoading(false);
    }
  }, [session, status, router]);

  const fetchSchoolByEmail = async (email: string) => {
    try {
      const response = await fetch(`/api/schools?teacherEmail=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          // No school found - redirect to registration
          router.push('/register-school');
          return;
        }
        throw new Error(data.error || 'Failed to load school data');
      }

      // Transform the response to include matched school information
      const transformedSchoolData: SchoolData = {
        id: data.school.id,
        schoolName: data.school.schoolName,
        teacherName: data.school.teacherName,
        teacherEmail: data.school.teacherEmail,
        dashboardToken: data.school.dashboardToken,
        expectedClassSize: data.school.expectedClassSize,
        startMonth: data.school.startMonth,
        programStartMonth: data.school.programStartMonth,
        status: data.school.status,
        students: data.school.students,
        matchedWithSchoolId: data.school.matchedWithSchoolId,
        matchedSchoolName: data.school.matchedWithSchool?.schoolName || undefined,
        schoolState: data.school.schoolState,
        schoolCity: data.school.schoolCity,
        gradeLevel: data.school.gradeLevel,
        teacherPhone: data.school.teacherPhone,
        specialConsiderations: data.school.specialConsiderations,
        matchedSchool: data.school.matchedWithSchool ? {
          id: data.school.matchedWithSchool.id,
          schoolName: data.school.matchedWithSchool.schoolName,
          teacherName: data.school.matchedWithSchool.teacherName,
          teacherEmail: data.school.matchedWithSchool.teacherEmail,
          schoolCity: data.school.matchedWithSchool.schoolCity,
          schoolState: data.school.matchedWithSchool.schoolState,
          expectedClassSize: data.school.matchedWithSchool.expectedClassSize,
          region: data.school.matchedWithSchool.region
        } : undefined
      };

      setSchoolData(transformedSchoolData);
      fetchStudentData(data.school.id, transformedSchoolData);
      
    } catch (err: any) {
      setError(err.message || 'Failed to load school data');
      setIsLoading(false);
    }
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
        hasInterests: student.profileCompleted || false,
        status: student.profileCompleted ? 'ready' : 'needs-info'
      })) || [];

      setStudents(transformedStudents);
      setIsLoading(false); // Stop loading once students are processed
    } catch (err: any) {
      console.error('Error processing student data:', err);
      setIsLoading(false);
    }
  };

  const studentsWithInterests = students.filter(s => s.hasInterests);
  const totalStudents = students.length;
  
  // Check if school profile is incomplete
  const isProfileIncomplete = schoolData?.schoolState === 'TBD' || 
                              schoolData?.gradeLevel === 'TBD' || 
                              schoolData?.startMonth === 'TBD' ||
                              schoolData?.expectedClassSize === 0;
  
  // Simplified ready logic - all students have complete profiles
  const allActiveStudentsComplete = totalStudents > 0;
  const readyForMatching = schoolData?.status === 'READY';

  const handleMatchingRequested = () => {
    // Update local state to reflect matching request
    setSchoolData(prev => prev ? { ...prev, status: 'READY' } : null);
  };

  const handleSchoolUpdated = () => {
    // Refresh school data after profile completion
    if (session?.user?.email) {
      fetchSchoolByEmail(session.user.email);
    }
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

  const toggleReadyStudentsRemovalMode = () => {
    setReadyStudentsRemovalMode(!readyStudentsRemovalMode);
  };

  const handleLogout = () => {
    router.push('/api/auth/signout?callbackUrl=' + encodeURIComponent(window.location.origin));  
  };

  if (isLoading) {
    return (
      <div className="page">
        <Header session={session} onLogout={handleLogout} />
        <main className="container" style={{ flex: 1, paddingTop: '1.5rem', minWidth: '1200px' }}>
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
        <Header session={session} onLogout={handleLogout} />
        <main className="container" style={{ flex: 1, paddingTop: '1.5rem' }}>
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Link href="/" className="btn btn-primary" style={{ marginRight: '1rem' }}>
              Go Home
            </Link>
            <Link href="/register-school" className="btn btn-primary">
              Register School
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!schoolData) {
    return null;
  }

  return (
    <div className="page">
      <Header session={session} onLogout={handleLogout} />

      <main className="container" style={{ flex: 1, paddingTop: '1.5rem' }}>
        
        <SessionWarningBanner />
        
        <DashboardHeader 
          schoolData={schoolData} 
          dashboardToken={schoolData.dashboardToken}
          allActiveStudentsComplete={allActiveStudentsComplete}
          onMatchingRequested={handleMatchingRequested}
          isProfileIncomplete={isProfileIncomplete}
        />

        <StudentMetricsGrid 
          schoolData={schoolData}
          totalStudents={totalStudents}
          studentsWithInterests={studentsWithInterests}
          matchedSchool={schoolData.matchedSchool}
          isMatched={schoolData?.matchedWithSchoolId != null}
        />

        <MatchingSection 
          schoolData={schoolData}
          allActiveStudentsComplete={allActiveStudentsComplete}
          matchedSchoolTeacher={schoolData.matchedSchool?.teacherName}
          matchedSchoolRegion={schoolData.matchedSchool?.region}
          onSchoolUpdated={handleSchoolUpdated}
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
            <h3 style={{ 
              color: '#1f2937', 
              marginBottom: '1rem', 
              fontSize: '1.4rem',
              fontWeight: '400'
            }}>
              No Students Registered Yet
            </h3>
            <p className="text-meta-info" style={{ marginBottom: '2rem' }}>
              Use the "Copy Student Link" button above to share with your students, or click "Add New Student" to add them manually.
            </p>
          </div>
        )}

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
      <Header />
      <main className="container" style={{ flex: 1, paddingTop: '1.5rem' }}>
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
