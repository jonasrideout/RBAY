"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  interests: string[];
  otherInterests: string;
  hasInterests: boolean;
}

interface SchoolData {
  id: string;
  schoolName: string;
  teacherName: string;
  teacherEmail: string;
  expectedClassSize: number;
  startMonth: string;
  students: any[];
}

function DashboardPrintContent() {
  const searchParams = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [schoolData, setSchoolData] = useState<SchoolData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Get token from URL parameter (not teacher email)
  const token = searchParams?.get('token');

  useEffect(() => {
    if (token) {
      fetchSchoolData();
    } else {
      setError('Dashboard token is required.');
      setIsLoading(false);
    }
  }, [token]);

  const fetchSchoolData = async () => {
    if (!token) return;
    
    setIsLoading(true);
    setError('');

    try {
      // Use token-based API call instead of teacher email
      const response = await fetch(`/api/schools?token=${encodeURIComponent(token)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load school data');
      }

      setSchoolData(data.school);
      
      // Transform students data
      const transformedStudents: Student[] = data.school.students.map((student: any) => ({
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        grade: student.grade,
        interests: student.interests || [],
        otherInterests: student.otherInterests || '',
        hasInterests: (student.interests && student.interests.length > 0) || false
      }));

      setStudents(transformedStudents);
    } catch (err: any) {
      setError(err.message || 'Failed to load school data');
      console.error('Print page error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const studentsWithInterests = students.filter(s => s.hasInterests);
  const studentsNeedingInfo = students.filter(s => !s.hasInterests);
  const totalStudents = students.length;
  const estimatedClassSize = schoolData?.expectedClassSize || 0;

  if (isLoading) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <p>Loading class overview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <p>Error: {error}</p>
      </div>
    );
  }

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
              <Link href="/admin/matching" className="nav-link">Admin</Link>
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
          <Link 
            href="/dashboard" 
            className="btn btn-secondary"
          >
            ← Back to Teacher Dashboard
          </Link>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => window.print()}
              className="btn btn-primary"
            >
              🖨️ Print / Download PDF
            </button>
          </div>
        </div>

        {/* Formatted Class Overview - matches PDF format */}
        <div style={{ 
          backgroundColor: 'white',
          padding: '3rem 4rem',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          {/* Header with logo - matches PDF format */}
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
                fontSize: '1.5rem', 
                fontWeight: '600',
                margin: '0 0 0.5rem 0'
              }}>
                THE RIGHT BACK AT YOU
              </h1>
              <h2 style={{ 
                color: '#4285f4', 
                fontSize: '1.25rem', 
                fontWeight: '600',
                margin: 0
              }}>
                PROJECT
              </h2>
            </div>
            <div>
              <img 
                src="/RB@Y-logo.jpg" 
                alt="Right Back at You Logo" 
                style={{ height: '60px' }} 
              />
            </div>
          </div>

          {/* School information */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ 
              fontSize: '1.4rem', 
              fontWeight: '600',
              margin: '0 0 1rem 0',
              color: '#1a365d'
            }}>
              {schoolData?.schoolName} - Class Overview
            </h2>
            
            <h3 style={{ 
              fontSize: '1.1rem', 
              fontWeight: '500',
              margin: '0 0 1.5rem 0',
              color: '#4a5568'
            }}>
              {schoolData?.teacherName}'s Class
            </h3>
          </div>

          {/* Metrics Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{ 
              border: '2px solid #e0e6ed',
              padding: '1rem',
              textAlign: 'center',
              backgroundColor: '#f8f9fa'
            }}>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                color: '#4a90e2',
                marginBottom: '0.5rem'
              }}>
                {estimatedClassSize}
              </div>
              <div style={{ 
                fontWeight: 'bold',
                marginBottom: '0.25rem'
              }}>
                Estimated Class Size
              </div>
              <div style={{ 
                fontSize: '0.9rem', 
                color: '#4a5568'
              }}>
                Expected in class
              </div>
            </div>

            <div style={{ 
              border: '2px solid #e0e6ed',
              padding: '1rem',
              textAlign: 'center',
              backgroundColor: '#f8f9fa'
            }}>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                color: '#28a745',
                marginBottom: '0.5rem'
              }}>
                {totalStudents}
              </div>
              <div style={{ 
                fontWeight: 'bold',
                marginBottom: '0.25rem'
              }}>
                Students Registered
              </div>
              <div style={{ 
                fontSize: '0.9rem', 
                color: '#4a5568'
              }}>
                Actually signed up
              </div>
            </div>

            <div style={{ 
              border: '2px solid #e0e6ed',
              padding: '1rem',
              textAlign: 'center',
              backgroundColor: '#f8f9fa'
            }}>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                color: '#17a2b8',
                marginBottom: '0.5rem'
              }}>
                {studentsWithInterests.length}
              </div>
              <div style={{ 
                fontWeight: 'bold',
                marginBottom: '0.25rem'
              }}>
                Students Ready to Match
              </div>
              <div style={{ 
                fontSize: '0.9rem', 
                color: '#4a5568'
              }}>
                Have complete profiles
              </div>
            </div>
          </div>

          {/* Students Missing Information */}
          {studentsNeedingInfo.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ 
                fontSize: '1.3rem',
                marginBottom: '1rem',
                color: '#c53030',
                fontWeight: '600'
              }}>
                Students Missing Information ({studentsNeedingInfo.length})
              </h2>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '0.75rem'
              }}>
                {studentsNeedingInfo.map(student => (
                  <div 
                    key={student.id}
                    style={{ 
                      padding: '0.75rem',
                      border: '1px solid #fed7d7',
                      backgroundColor: '#fff5f5',
                      borderRadius: '4px'
                    }}
                  >
                    {student.firstName} {student.lastName}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ready Students */}
          {studentsWithInterests.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ 
                fontSize: '1.3rem',
                marginBottom: '1rem',
                color: '#0c5460',
                fontWeight: '600'
              }}>
                Ready Students ({studentsWithInterests.length})
              </h2>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '0.75rem'
              }}>
                {studentsWithInterests.map(student => (
                  <div 
                    key={student.id}
                    style={{ 
                      padding: '0.75rem',
                      border: '1px solid #bee5eb',
                      backgroundColor: '#f0f8ff',
                      borderRadius: '4px'
                    }}
                  >
                    {student.firstName} {student.lastName}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Students Message */}
          {totalStudents === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              color: '#4a5568'
            }}>
              <h3>No Students Registered Yet</h3>
              <p>Students will appear here once they begin registering for the program.</p>
            </div>
          )}

          {/* Footer info */}
          <div style={{ 
            marginTop: '3rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e0e6ed',
            fontSize: '0.9rem',
            color: '#718096',
            textAlign: 'center'
          }}>
            <p>Generated on {new Date().toLocaleDateString()}</p>
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

// Loading component for Suspense fallback
function LoadingPrint() {
  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <p>Loading class overview...</p>
    </div>
  );
}

export default function DashboardPrint() {
  return (
    <Suspense fallback={<LoadingPrint />}>
      <DashboardPrintContent />
    </Suspense>
  );
}
