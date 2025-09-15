"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';

// Import dashboard components (will reuse these)
import DashboardHeader from '../../dashboard/components/DashboardHeader';
import StudentMetricsGrid from '../../dashboard/components/StudentMetricsGrid';
import MatchingStatusCard from '../../dashboard/components/MatchingStatusCard';
import MissingInfoStudents from '../../dashboard/components/MissingInfoStudents';
import ReadyStudents from '../../dashboard/components/ReadyStudents';

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
  name: string; // Changed from schoolName to name to match API response
  teacherName: string;
  teacherEmail: string;
  location: string; // Added location field from API response
  status: 'COLLECTING' | 'READY' | 'MATCHED' | 'CORRESPONDING' | 'DONE';
  students: any[];
}

function AdminSchoolDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [schoolData, setSchoolData] = useState<SchoolData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminUser, setAdminUser] = useState<string>('');

  // Get schoolId from URL parameters
  const schoolId = searchParams.get('schoolId');

  // Check admin authentication and fetch school data
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const response = await fetch('/api/admin/me');
        if (response.ok) {
          const data = await response.json();
          setAdminUser(data.email);
        } else {
          router.push('/admin/login');
          return;
        }
      } catch (error) {
        router.push('/admin/login');
        return;
      }
    };

    if (!schoolId) {
      setError('School ID is required');
      setIsLoading(false);
      return;
    }

    checkAdminAuth();
  }, [schoolId, router]);

  // Fetch school data by ID
  useEffect(() => {
    if (!schoolId || !adminUser) return;

    const fetchSchoolData = async () => {
      try {
        const response = await fetch(`/api/admin/school-data?schoolId=${encodeURIComponent(schoolId)}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load school data');
        }

        // API returns school data directly, not nested under 'school' property
        setSchoolData(data);
        processStudentData(data);
        
      } catch (err: any) {
        setError(err.message || 'Failed to load school data');
        setIsLoading(false);
      }
    };

    fetchSchoolData();
  }, [schoolId, adminUser]);

  const processStudentData = (schoolDataParam: SchoolData) => {
    try {
      // Transform students data to match our Student interface
      const transformedStudents: Student[] = schoolDataParam?.students?.map((student: any) => ({
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
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error processing student data:', err);
      setError('Error processing student data');
      setIsLoading(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      router.push('/');
    }
  };

  const studentsWithInterests = students.filter(s => s.hasInterests);
  const studentsNeedingInfo = students.filter(s => !s.hasInterests);
  const totalStudents = students.length;

  // Read-only placeholder functions (not used in read-only mode)
  const noOpFunction = () => {};
  const noOpStringFunction = (id: string) => {};
  const noOpBooleanFunction = (interest: string, checked: boolean) => {};
  const noOpStringValueFunction = (value: string) => {};

  if (isLoading) {
    return (
      <div className="page">
        <Header 
          session={{ user: { email: adminUser } }} 
          onLogout={handleAdminLogout} 
        />
        <main className="container" style={{ flex: 1, paddingTop: '3rem' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="loading" style={{ margin: '0 auto 1rem' }}></div>
            <p>Loading school dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <Header 
          session={{ user: { email: adminUser } }} 
          onLogout={handleAdminLogout} 
        />
        <main className="container" style={{ flex: 1, paddingTop: '3rem' }}>
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Link href="/admin/matching" className="btn btn-primary">
              Back to Admin Dashboard
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
      <Header 
        session={{ user: { email: adminUser } }} 
        onLogout={handleAdminLogout} 
      />

      <main className="container" style={{ flex: 1, paddingTop: '3rem' }}>
        
        {/* Admin Navigation */}
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/admin/matching" className="btn btn-secondary">
            ← Back to Admin Dashboard
          </Link>
        </div>

        {/* Read-only notice */}
        <div style={{ 
          background: '#e3f2fd', 
          border: '1px solid #90caf9', 
          borderRadius: '6px', 
          padding: '1rem', 
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <strong style={{ color: '#1565c0' }}>Admin View:</strong>
          <span style={{ color: '#1976d2', marginLeft: '0.5rem' }}>
            This is a read-only view of {schoolData.name}'s dashboard
          </span>
        </div>

        <DashboardHeader 
          schoolData={schoolData} 
          dashboardToken=""
          readOnly={true}
        />

        <StudentMetricsGrid 
          schoolData={schoolData}
          totalStudents={totalStudents}
          studentsWithInterests={studentsWithInterests}
          readOnly={true}
        />

        <MatchingStatusCard 
          schoolData={schoolData}
          allActiveStudentsComplete={totalStudents > 0 && studentsNeedingInfo.length === 0}
          onMatchingRequested={noOpFunction}
          readOnly={true}
        />

        <MissingInfoStudents 
          studentsNeedingInfo={studentsNeedingInfo}
          missingInfoRemovalMode={false}
          editingStudent={null}
          tempInterests={[]}
          tempOtherInterests=""
          readyForMatching={true}
          onToggleRemovalMode={noOpFunction}
          onEditInterests={noOpStringFunction}
          onRemoveStudent={noOpStringFunction}
          onSaveInterests={noOpStringFunction}
          onCancelEdit={noOpFunction}
          onInterestChange={noOpBooleanFunction}
          onOtherInterestsChange={noOpStringValueFunction}
          readOnly={true}
        />

        <ReadyStudents 
          studentsWithInterests={studentsWithInterests}
          readyStudentsRemovalMode={false}
          expandedReadyStudents={new Set()}
          readyForMatching={true}
          onToggleRemovalMode={noOpFunction}
          onRemoveStudent={noOpStringFunction}
          onToggleExpansion={noOpStringFunction}
          readOnly={true}
        />

        {/* No students message - read-only version */}
        {totalStudents === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', marginBottom: '2rem' }}>
            <h3 style={{ color: '#6c757d', marginBottom: '1rem' }}>No Students Registered</h3>
            <p style={{ color: '#6c757d', marginBottom: '0' }}>
              This school has not registered any students yet.
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

function LoadingAdminDashboard() {
  return (
    <div className="page">
      <Header />
      <main className="container" style={{ flex: 1, paddingTop: '3rem' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Loading school dashboard...</div>
        </div>
      </main>
    </div>
  );
}

export default function AdminSchoolDashboard() {
  return (
    <Suspense fallback={<LoadingAdminDashboard />}>
      <AdminSchoolDashboardContent />
    </Suspense>
  );
}
