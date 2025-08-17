// app/admin/pen-pal-list/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Student {
  name: string;
  grade: string;
  interests: string[];
}

interface Penpal {
  name: string;
  grade: string;
  school: string;
  interests: string[];
}

interface StudentPairing {
  student: Student;
  penpal: Penpal | null;
}

interface SchoolData {
  name: string;
  teacher: string;
  email: string;
}

interface PenPalData {
  school: SchoolData;
  pairings: StudentPairing[];
  generatedAt: string;
}

export default function PenPalListPage() {
  const searchParams = useSearchParams();
  const schoolId = searchParams.get('schoolId');
  
  const [data, setData] = useState<PenPalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!schoolId) {
      setError('No school ID provided');
      setIsLoading(false);
      return;
    }

    fetchPenPalData();
  }, [schoolId]);

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

  const handleDownloadFile = () => {
    // This will trigger the actual file download
    const downloadUrl = `/api/admin/download-pairings?schoolId=${schoolId}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${data?.school.name}_pen_pal_assignments.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
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
          <Link href="/admin/matching" className="btn btn-primary">
            Back to Admin Dashboard
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
          <Link href="/admin/matching" className="btn btn-primary">
            Back to Admin Dashboard
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
          <Link href="/admin/matching" className="btn btn-secondary">
            ← Back to Admin Dashboard
          </Link>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={handleDownloadPrint}
              className="btn btn-primary"
            >
              🖨️ Print List
            </button>
            <button 
              onClick={handleDownloadFile}
              className="btn btn-primary"
            >
              💾 Download File
            </button>
          </div>
        </div>

        {/* Formatted Pen Pal List - matches your PDF examples */}
        <div style={{ 
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          maxWidth: '800px',
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
            <div style={{ fontSize: '2rem' }}>
              📚👥
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
              {data.school.name} and Partner School
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
                {/* Student info */}
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>{pairing.student.name}</strong>: {pairing.student.interests.join(', ')}
                </div>
                
                {/* Pen pal matches */}
                {pairing.penpal ? (
                  <div style={{ 
                    marginLeft: '1rem',
                    paddingLeft: '1rem',
                    borderLeft: '2px solid #e0e6ed'
                  }}>
                    <div style={{ color: '#4a5568' }}>
                      ● <strong>Matched with {pairing.penpal.name}</strong>: {pairing.penpal.interests.join(', ')}
                    </div>
                    {pairing.penpal.school && (
                      <div style={{ 
                        fontSize: '0.9rem', 
                        color: '#718096',
                        marginTop: '0.25rem',
                        marginLeft: '1rem'
                      }}>
                        from {pairing.penpal.school}
                      </div>
                    )}
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
