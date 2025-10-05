// app/teacher/pen-pal-list/page.tsx
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTeacherSession } from '@/lib/useTeacherSession';

interface Student {
  name: string;
  grade: string;
  interests: string[];
  otherInterests: string | null;
  penpalPreference?: string;
}

interface Penpal {
  name: string;
  grade: string;
  school: string;
  teacherName?: string;
  interests: string[];
  otherInterests: string | null;
}

interface StudentPairing {
  student: Student;
  penpals: Penpal[];
  penpalCount: number;
}

interface SchoolData {
  name: string;
  teacher: string;
  email: string;
  partnerSchool?: string;
}

interface PenPalData {
  school: SchoolData;
  pairings: StudentPairing[];
  summary?: {
    totalStudents: number;
    studentsWithPenpals: number;
    studentsWithoutPenpals: number;
    totalPenpalConnections: number;
    averagePenpalsPerStudent: string;
  };
  generatedAt: string;
}

// Group students by their pen pal's teacher
interface TeacherGroup {
  teacherName: string;
  schoolName: string;
  consolidatedStudents: {
    studentName: string;
    studentInterests: string;
    penpals: {
      name: string;
      interests: string;
    }[];
  }[];
}

function PenPalListContent() {
  const { data: session, status } = useTeacherSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const schoolId = searchParams?.get('schoolId');
  
  const [data, setData] = useState<PenPalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (!schoolId) {
      setError('No school ID provided');
      setIsLoading(false);
      return;
    }

    fetchPenPalData();
  }, [status, schoolId, router]);

  const fetchPenPalData = async () => {
    try {
      const response = await fetch(`/api/admin/download-pairings?schoolId=${schoolId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch pen pal data');
      }

      const penPalData = await response.json();
      setData(penPalData);
    } catch (err: any) {
      setError(err.message || 'Failed to load pen pal data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPrint = () => {
    window.print();
  };

  // Helper function to format interests display
  const formatInterests = (interests: string[], otherInterests: string | null) => {
    const parts = [];
    
    if (interests && interests.length > 0) {
      parts.push(interests.join(', '));
    }
    
    if (otherInterests && otherInterests.trim()) {
      parts.push(otherInterests.trim());
    }
    
    return parts.length > 0 ? parts.join(', ') : 'No interests listed';
  };

  // Organize students by teacher, consolidate duplicates, and sort
  const organizeByTeacher = (): TeacherGroup[] => {
    if (!data) return [];

    const teacherMap = new Map<string, {
      teacherName: string;
      schoolName: string;
      students: {
        studentName: string;
        studentInterests: string;
        penpalName: string;
        penpalInterests: string;
      }[];
    }>();

    data.pairings.forEach(pairing => {
      pairing.penpals.forEach(penpal => {
        const key = `${penpal.teacherName || 'Unknown Teacher'}_${penpal.school}`;
        
        if (!teacherMap.has(key)) {
          teacherMap.set(key, {
            teacherName: penpal.teacherName || 'Unknown Teacher',
            schoolName: penpal.school,
            students: []
          });
        }

        teacherMap.get(key)!.students.push({
          studentName: pairing.student.name,
          studentInterests: formatInterests(pairing.student.interests, pairing.student.otherInterests),
          penpalName: penpal.name,
          penpalInterests: formatInterests(penpal.interests, penpal.otherInterests)
        });
      });
    });

    // Convert to array and consolidate + sort students
    return Array.from(teacherMap.values()).map(group => {
      // Group students by name
      const studentMap = new Map<string, {
        studentName: string;
        studentInterests: string;
        penpals: { name: string; interests: string }[];
      }>();

      group.students.forEach(student => {
        if (!studentMap.has(student.studentName)) {
          studentMap.set(student.studentName, {
            studentName: student.studentName,
            studentInterests: student.studentInterests,
            penpals: []
          });
        }
        studentMap.get(student.studentName)!.penpals.push({
          name: student.penpalName,
          interests: student.penpalInterests
        });
      });

      // Convert to array and sort by first name
      const consolidatedStudents = Array.from(studentMap.values()).sort((a, b) => {
        return a.studentName.localeCompare(b.studentName);
      });

      return {
        teacherName: group.teacherName,
        schoolName: group.schoolName,
        consolidatedStudents
      };
    });
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="page">
        <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Loading pen pal assignments...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Error</h2>
          <p style={{ color: '#dc3545', marginBottom: '2rem' }}>{error}</p>
          <Link href="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page">
        <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>No Data Found</h2>
          <Link href="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const teacherGroups = organizeByTeacher();

  return (
    <div className="page">
      {/* Header - only show on screen, not in print */}
      <header className="header no-print">
        <div className="container">
          <div className="header-content">
            <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/RB@Y-logo.jpg" alt="Right Back at You" style={{ height: '40px' }} />
              The Right Back at You Project
            </Link>
            <nav className="nav">
              <Link href="/" className="nav-link">Home</Link>
              <Link href="/dashboard" className="nav-link">Dashboard</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container" style={{ flex: 1, paddingTop: '1.5rem' }}>
        {/* Action buttons - only show on screen, not in print */}
        <div className="no-print" style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '2rem',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link href="/dashboard" className="btn btn-secondary">
            ← Back to Dashboard
          </Link>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={handleDownloadPrint}
              className="btn btn-primary"
            >
              Print / Download PDF
            </button>
          </div>
        </div>

        {/* Formatted Pen Pal List */}
        <div style={{ 
          backgroundColor: 'white',
          padding: '3rem 4rem',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          {/* Header with logo */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '2rem',
            paddingBottom: '1rem',
            borderBottom: '2px solid #e0e6ed'
          }}>
            <div>
              <h1 style={{ 
                color: '#4285f4', 
                fontSize: '1.25rem', 
                fontWeight: '600',
                margin: '0 0 0.5rem 0'
              }}>
                THE RIGHT BACK AT YOU PROJECT
              </h1>
            </div>
            <div>
              <img 
                src="/RB@Y-logo.jpg" 
                alt="Right Back at You Logo" 
                style={{ height: '60px' }} 
              />
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ 
              fontSize: '1.3rem', 
              fontWeight: '300',
              margin: '0 0 0.5rem 0',
              color: '#1a365d',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              Pen Pals - {data.school.name}{data.school.partnerSchool ? ` and ${data.school.partnerSchool}` : ' and Partner School'}
            </h2>
          </div>

          {/* Student listings organized by teacher */}
          {teacherGroups.map((group, groupIndex) => (
            <div key={groupIndex} style={{ marginBottom: '3rem' }}>
              {/* Section header */}
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '300',
                margin: '0 0 1.5rem 0',
                color: '#2c5aa0',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                Students paired with {group.teacherName}, {group.schoolName}
              </h3>

              {/* Students in this group */}
              {group.consolidatedStudents.map((student, studentIndex) => (
                <div key={studentIndex}>
                  {/* Cut line with scissors on right */}
                  <div style={{
                    borderTop: '2px dashed #ccc',
                    position: 'relative',
                    marginBottom: '1rem'
                  }}>
                    <span style={{
                      position: 'absolute',
                      right: '0',
                      top: '-12px',
                      fontSize: '1.2rem'
                    }}>
                      ✂️
                    </span>
                  </div>

                  {/* Student entry with padding */}
                  <div style={{
                    paddingTop: '0.75rem',
                    paddingBottom: '1.25rem',
                    paddingLeft: '0.5rem',
                    paddingRight: '0.5rem',
                    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontWeight: '300',
                    lineHeight: '1.6'
                  }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      {student.studentName}  Interests: {student.studentInterests}
                    </div>
                    <div style={{
                      marginLeft: '1rem',
                      color: '#4a5568'
                    }}>
                      {student.penpals.map((penpal, penpalIndex) => (
                        <div key={penpalIndex} style={{ marginBottom: penpalIndex < student.penpals.length - 1 ? '0.5rem' : '0' }}>
                          <div style={{ marginBottom: '0.25rem' }}>
                            → Matched with {penpal.name} - {group.teacherName}'s class
                          </div>
                          <div style={{ marginLeft: '1rem' }}>
                            Interests: {penpal.interests}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Footer info */}
          <div style={{ 
            marginTop: '3rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e0e6ed',
            fontSize: '0.9rem',
            color: '#718096',
            textAlign: 'center',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontWeight: '300'
          }}>
            <p>Generated on {new Date(data.generatedAt).toLocaleDateString()}</p>
            <p>The Right Back at You Project by Carolyn Mackler</p>
          </div>
        </div>
      </main>

      {/* Print-specific styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          .page {
            margin: 0;
            padding: 0;
          }
          
          .container {
            max-width: none;
            padding: 0;
          }
          
          main {
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function PenPalListPage() {
  return (
    <Suspense fallback={
      <div className="page">
        <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Loading...</h2>
        </div>
      </div>
    }>
      <PenPalListContent />
    </Suspense>
  );
}
