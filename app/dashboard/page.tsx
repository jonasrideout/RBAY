"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import { useTeacherSession, useSessionWarning } from '@/lib/useTeacherSession';

// Import components
import DashboardHeader from './components/DashboardHeader';
import StudentMetricsGrid from './components/StudentMetricsGrid';
import MatchingSection from './components/MatchingSection';
import ReadyStudents from './components/ReadyStudents';
import ConfirmationDialog from './components/ConfirmationDialog';
import UpdatePenpalPreferences from './components/UpdatePenpalPreferences';
import GroupMembershipCard from './components/GroupMembershipCard';

interface Student {
  id: string;
  firstName: string;
  lastInitial: string;
  grade: string;
  interests: string[];
  otherInterests: string;
  hasInterests: boolean;
  status: 'ready' | 'needs-info' | 'matched';
  penpalPreference: 'ONE' | 'MULTIPLE';
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
  communicationPlatforms?: any;
  mailingAddress?: string;
  studentStats?: {
    expected: number;
    registered: number;
    ready: number;
    studentsWithPenpals: number;
    hasPenpalAssignments: boolean;
  };
  matchedSchool?: {
    id: string;
    schoolName: string;
    teacherName: string;
    teacherEmail: string;
    schoolCity?: string;
    schoolState?: string;
    expectedClassSize: number;
    actualStudentCount: number;
    region: string;
    communicationPlatforms?: any;
  };
  schoolGroup?: {
    id: string;
    name: string;
    schools: Array<{
      id: string;
      schoolName: string;
      teacherName: string;
      students: any[];
    }>;
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
  const searchParams = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [schoolData, setSchoolData] = useState<SchoolData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedReadyStudents, setExpandedReadyStudents] = useState<Set<string>>(new Set());
  const [isAdminViewing, setIsAdminViewing] = useState(false);
  
  // Removal mode state
  const [readyStudentsRemovalMode, setReadyStudentsRemovalMode] = useState(false);
  
  // Pen pal preference update state
  const [showPenpalPreferenceUpdate, setShowPenpalPreferenceUpdate] = useState(false);
  const [penpalPreferenceRequired, setPenpalPreferenceRequired] = useState(0);
  const [penpalPreferenceCurrent, setPenpalPreferenceCurrent] = useState(0);
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    studentName: string;
    studentId: string;
  }>({ show: false, studentName: '', studentId: '' });

   // Check if admin is viewing (by calling server-side endpoint)
  const checkIsAdmin = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/check-admin', {
        credentials: 'include'
      });
      const data = await response.json();
      return data.isAdmin;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  useEffect(() => {
    const checkAuthAndLoadDashboard = async () => {
      const tokenParam = searchParams?.get('token');
      const isAdmin = await checkIsAdmin();


      // Admin viewing with token - handle this FIRST before checking teacher auth
      if (isAdmin && tokenParam) {
        setIsAdminViewing(true);
        fetchSchoolByToken(tokenParam);
        return;
      }

      // Now check teacher authentication
      if (status === 'loading') return;

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
    };

    checkAuthAndLoadDashboard();
  }, [session, status, router, searchParams]);

  const fetchSchoolByToken = async (token: string) => {
    try {
      const response = await fetch(`/api/schools?token=${encodeURIComponent(token)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load school data');
      }

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
        communicationPlatforms: data.school.communicationPlatforms,
        mailingAddress: data.school.mailingAddress,
        schoolGroup: data.school.schoolGroup,
        studentStats: data.school.studentStats,
        matchedSchool: data.school.matchedWithSchool ? {
          id: data.school.matchedWithSchool.id,
          schoolName: data.school.matchedWithSchool.schoolName,
          teacherName: data.school.matchedWithSchool.teacherName,
          teacherEmail: data.school.matchedWithSchool.teacherEmail,
          schoolCity: data.school.matchedWithSchool.schoolCity,
          schoolState: data.school.matchedWithSchool.schoolState,
          expectedClassSize: data.school.matchedWithSchool.expectedClassSize,
          actualStudentCount: data.school.matchedWithSchool.actualStudentCount,
          region: data.school.matchedWithSchool.region,
          communicationPlatforms: data.school.matchedWithSchool.communicationPlatforms
        } : undefined
      };

      setSchoolData(transformedSchoolData);
      fetchStudentData(data.school.id, transformedSchoolData);
      
    } catch (err: any) {
      setError(err.message || 'Failed to load school data');
      setIsLoading(false);
    }
  };

  const fetchSchoolByEmail = async (email: string) => {
    try {
      const response = await fetch(`/api/schools?teacherEmail=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          router.push('/register-school');
          return;
        }
        throw new Error(data.error || 'Failed to load school data');
      }

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
        communicationPlatforms: data.school.communicationPlatforms,
        mailingAddress: data.school.mailingAddress,
        schoolGroup: data.school.schoolGroup,
        studentStats: data.school.studentStats,
        matchedSchool: data.school.matchedWithSchool ? {
          id: data.school.matchedWithSchool.id,
          schoolName: data.school.matchedWithSchool.schoolName,
          teacherName: data.school.matchedWithSchool.teacherName,
          teacherEmail: data.school.matchedWithSchool.teacherEmail,
          schoolCity: data.school.matchedWithSchool.schoolCity,
          schoolState: data.school.matchedWithSchool.schoolState,
          expectedClassSize: data.school.matchedWithSchool.expectedClassSize,
          actualStudentCount: data.school.matchedWithSchool.actualStudentCount,
          region: data.school.matchedWithSchool.region,
          communicationPlatforms: data.school.matchedWithSchool.communicationPlatforms
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
      const sourceSchoolData = schoolDataParam || schoolData;
      
      const transformedStudents: Student[] = sourceSchoolData?.students?.map((student: any) => ({
        id: student.id,
        firstName: student.firstName,
        lastInitial: student.lastInitial,
        grade: student.grade,
        interests: student.interests || [],
        otherInterests: student.otherInterests || '',
        hasInterests: student.profileCompleted || false,
        status: student.profileCompleted ? 'ready' : 'needs-info',
        penpalPreference: student.penpalPreference || 'ONE'
      })) || [];

      setStudents(transformedStudents);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error processing student data:', err);
      setIsLoading(false);
    }
  };

  const studentsWithInterests = students.filter(s => s.hasInterests);
  const totalStudents = students.length;
  
  const isProfileIncomplete = schoolData?.schoolState === 'TBD' || 
                            schoolData?.gradeLevel === 'TBD' || 
                            schoolData?.startMonth === 'TBD' ||
                            schoolData?.expectedClassSize === 0 ||
                            !schoolData?.mailingAddress ||
                            !schoolData?.communicationPlatforms ||
                            (Array.isArray(schoolData?.communicationPlatforms) && schoolData.communicationPlatforms.length === 0);
  
  const allActiveStudentsComplete = totalStudents > 0;
  const readyForMatching = schoolData?.status === 'READY';
  const penPalsAssigned = schoolData?.studentStats?.hasPenpalAssignments || false;

  const handleMatchingRequested = () => {
    setSchoolData(prev => prev ? { ...prev, status: 'READY' } : null);
  };

  const handleSchoolUpdated = () => {
    if (session?.user?.email) {
      fetchSchoolByEmail(session.user.email);
    }
  };

  const handlePenpalPreferenceCheckNeeded = (required: number, current: number) => {
    setPenpalPreferenceRequired(required);
    setPenpalPreferenceCurrent(current);
    setShowPenpalPreferenceUpdate(true);
  };

  const handlePenpalPreferenceUpdateComplete = async () => {
    setShowPenpalPreferenceUpdate(false);
    
    try {
      const response = await fetch('/api/schools/request-matching', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          teacherEmail: schoolData?.teacherEmail,
          dashboardToken: schoolData?.dashboardToken 
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to request pairing');
      }

      console.log('Request pairing successful after preference update:', data);
      window.location.reload();
      
    } catch (err: any) {
      console.error('Error requesting pairing after preference update:', err);
      alert('Error requesting pairing: ' + err.message);
    }
  };

  const handlePenpalPreferenceUpdateCancel = () => {
    setShowPenpalPreferenceUpdate(false);
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

      const updatedStudents = students.filter(s => s.id !== studentId);
      setStudents(updatedStudents);
      setConfirmDialog({ show: false, studentName: '', studentId: '' });

      if (updatedStudents.length === 0 && schoolData?.status === 'READY') {
        await fetch('/api/schools/reset-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            schoolId: schoolData.id,
            status: 'COLLECTING'
          })
        });
        setSchoolData(prev => prev ? { ...prev, status: 'COLLECTING' } : null);
      }
      
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
    if (isAdminViewing) {
      router.push('/admin/matching');
    } else {
      router.push('/api/auth/signout?callbackUrl=' + encodeURIComponent(window.location.origin));
    }
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
            {isAdminViewing ? (
              <Link href="/admin/matching" className="btn btn-primary">
                Back to Admin Dashboard
              </Link>
            ) : (
              <Link href="/register-school" className="btn btn-primary">
                Register School
              </Link>
            )}
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
        
        {!isAdminViewing && <SessionWarningBanner />}
        
        <DashboardHeader 
          schoolData={schoolData} 
          dashboardToken={schoolData.dashboardToken}
          readOnly={isAdminViewing}
          adminBackButton={isAdminViewing}
          allActiveStudentsComplete={allActiveStudentsComplete}
          onMatchingRequested={handleMatchingRequested}
          onPenpalPreferenceCheckNeeded={handlePenpalPreferenceCheckNeeded}
          isProfileIncomplete={isProfileIncomplete}
        />

        {/* Group Membership Card */}
        {schoolData.schoolGroup && (
          <GroupMembershipCard
            groupName={schoolData.schoolGroup.name}
            schools={schoolData.schoolGroup.schools.map(school => ({
              id: school.id,
              schoolName: school.schoolName,
              teacherName: school.teacherName,
              studentCount: school.students.filter((s: any) => s.isActive).length
            }))}
            currentSchoolId={schoolData.id}
          />
        )}

        <StudentMetricsGrid 
          schoolData={schoolData}
          totalStudents={totalStudents}
          studentsWithInterests={studentsWithInterests}
          matchedSchool={schoolData.matchedSchool}
          isMatched={schoolData?.matchedWithSchoolId != null || schoolData?.matchedSchool != null}
          readOnly={isAdminViewing}
        />

        <MatchingSection 
          schoolData={schoolData}
          allActiveStudentsComplete={allActiveStudentsComplete}
          matchedSchoolTeacher={schoolData.matchedSchool?.teacherName}
          matchedSchoolRegion={schoolData.matchedSchool?.region}
          onSchoolUpdated={handleSchoolUpdated}
          readOnly={isAdminViewing}
          isAdminView={isAdminViewing}
        />

        <ReadyStudents 
          studentsWithInterests={studentsWithInterests}
          readyStudentsRemovalMode={readyStudentsRemovalMode}
          expandedReadyStudents={expandedReadyStudents}
          penPalsAssigned={penPalsAssigned}
          onToggleRemovalMode={toggleReadyStudentsRemovalMode}
          onRemoveStudent={handleRemoveStudent}
          onToggleExpansion={toggleReadyStudentExpansion}
          readOnly={isAdminViewing}
        />

        {!isAdminViewing && (
          <>
            <ConfirmationDialog 
              show={confirmDialog.show}
              studentName={confirmDialog.studentName}
              studentId={confirmDialog.studentId}
              onConfirm={confirmRemoveStudent}
              onCancel={cancelRemoveStudent}
            />

            {showPenpalPreferenceUpdate && (
              <UpdatePenpalPreferences
                students={students}
                requiredCount={penpalPreferenceRequired}
                currentCount={penpalPreferenceCurrent}
                classSize={totalStudents}
                onComplete={handlePenpalPreferenceUpdateComplete}
                onCancel={handlePenpalPreferenceUpdateCancel}
              />
            )}
          </>
        )}

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
              {isAdminViewing 
                ? 'This school has not registered any students yet.'
                : 'Use the "Copy Student Link" button above to share with your students, or click "Add New Student" to add them manually.'
              }
            </p>
          </div>
        )}

      </main>

      <footer style={{ background: '#343a40', color: 'white', padding: '2rem 0', marginTop: '3rem' }}>
        <div className="container text-center">
          <p>&copy; 2025 The Right Back at You Project by Carolyn Mackler. Building empathy and connection through literature and letters.</p>
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
