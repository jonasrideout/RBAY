"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

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

  // Get teacher email from URL parameter
  const teacherEmail = searchParams.get('teacher');

  useEffect(() => {
    if (teacherEmail) {
      fetchSchoolData();
    } else {
      setError('Teacher email is required.');
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
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '8.5in',
      margin: '0 auto',
      padding: '1in',
      lineHeight: '1.4',
      color: '#000'
    }}>
      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body { margin: 0; }
          @page { margin: 0.5in; }
        }
      `}</style>

      {/* Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '2rem',
        borderBottom: '2px solid #000',
        paddingBottom: '1rem'
      }}>
        <h1 style={{ 
          margin: '0 0 0.5rem 0', 
          fontSize: '1.8rem',
          fontWeight: 'bold'
        }}>
          {schoolData?.schoolName} - Class Overview
        </h1>
        <p style={{ 
          margin: '0', 
          fontSize: '1.1rem',
          color: '#666'
        }}>
          Teacher: {schoolData?.teacherName} | Generated: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Metrics Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ 
          border: '2px solid #ddd',
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
            color: '#666'
          }}>
            Expected in class
          </div>
        </div>

        <div style={{ 
          border: '2px solid #ddd',
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
            color: '#666'
          }}>
            Actually signed up
          </div>
        </div>

        <div style={{ 
          border: '2px solid #ddd',
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
            color: '#666'
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
            borderBottom: '1px solid #fed7d7',
            paddingBottom: '0.5rem'
          }}>
            Students Missing Information ({studentsNeedingInfo.length})
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '0.5rem'
          }}>
            {studentsNeedingInfo.map(student => (
              <div 
                key={student.id}
                style={{ 
                  padding: '0.75rem',
                  border: '1px solid #fed7d7',
                  backgroundColor: '#fff5f5'
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
            borderBottom: '1px solid #bee5eb',
            paddingBottom: '0.5rem'
          }}>
            Ready Students ({studentsWithInterests.length})
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '0.5rem'
          }}>
            {studentsWithInterests.map(student => (
              <div 
                key={student.id}
                style={{ 
                  padding: '0.75rem',
                  border: '1px solid #bee5eb',
                  backgroundColor: '#f0f8ff'
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
          color: '#666'
        }}>
          <h3>No Students Registered Yet</h3>
          <p>Students will appear here once they begin registering for the program.</p>
        </div>
      )}

      {/* Footer */}
      <div style={{ 
        marginTop: '3rem',
        paddingTop: '1rem',
        borderTop: '1px solid #ddd',
        fontSize: '0.9rem',
        color: '#666',
        textAlign: 'center'
      }}>
        <p>The Right Back at You Project by Carolyn Mackler</p>
        <p>Building empathy and connection through literature</p>
      </div>
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
