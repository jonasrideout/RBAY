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

          {/* School and partner information */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ 
              fontSize: '1.4rem', 
              fontWeight: '600',
              margin: '0 0 1rem 0',
              color: '#1a365d'
            }}>
              {data.school.name}{data.school.partnerSchool ? ` and ${data.school.partnerSchool}` : ' and Partner School'}
            </h2>
            
            <h3 style={{ 
              fontSize: '1.1rem', 
              fontWeight: '500',
              margin: '0 0 1.5rem 0',
              color: '#4a5568'
            }}>
              {data.school.teacher}'s Class
            </h3>
          </div>

          {/* Student listings */}
          <div style={{ lineHeight: '1.6' }}>
            {data.pairings.map((pairing, index) => (
              <div key={index} style={{ marginBottom: '1.5rem' }}>
                {/* Student info with combined interests */}
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>{pairing.student.name}</strong>: {formatInterests(pairing.student.interests, pairing.student.otherInterests)}
                </div>
                
                {/* Multiple pen pal matches */}
                {pairing.penpals.length > 0 ? (
                  <div style={{ 
                    marginLeft: '1rem',
                    paddingLeft: '1rem',
                    borderLeft: '2px solid #e0e6ed'
                  }}>
                    {pairing.penpals.map((penpal, penpalIndex) => (
                      <div key={penpalIndex} style={{ color: '#4a5568', marginBottom: '0.25rem' }}>
                        ● <strong>Matched with {penpal.name}</strong>: {formatInterests(penpal.interests, penpal.otherInterests)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ 
                    marginLeft: '1rem',
                    color: '#dc3545',
                    fontStyle: 'italic'
                  }}>
                    ● No pen pal assigned yet
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary information */}
          {data.summary && (
            <div style={{ 
              marginTop: '2rem',
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              border: '1px solid #e0e6ed',
              fontSize: '0.9rem',
              color: '#4a5568'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div><strong>Total Students:</strong> {data.summary.totalStudents}</div>
                <div><strong>Students with Pen Pals:</strong> {data.summary.studentsWithPenpals}</div>
                <div><strong>Total Connections:</strong> {data.summary.totalPenpalConnections}</div>
                <div><strong>Average per Student:</strong> {data.summary.averagePenpalsPerStudent}</div>
              </div>
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
