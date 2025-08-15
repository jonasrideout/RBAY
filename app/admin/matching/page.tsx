"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface School {
  id: string;
  schoolName: string;
  teacherFirstName: string;
  teacherLastName: string;
  teacherEmail: string;
  region: string;
  gradeLevel: string[];
  expectedClassSize: number;
  startMonth: string;
  letterFrequency: string;
  status: 'COLLECTING' | 'READY' | 'MATCHED' | 'CORRESPONDING' | 'DONE';
  lettersSent: number;
  lettersReceived: number;
  matchedWithSchoolId?: string;
  matchedSchool?: School;
  studentCounts: {
    expected: number;
    registered: number;
    ready: number;
  };
}

interface StatusCounts {
  COLLECTING: number;
  READY: number;
  MATCHED: number;
  CORRESPONDING: number;
  DONE: number;
}

type SelectedStatus = keyof StatusCounts;

export default function AdminDashboard() {
  const [schools, setSchools] = useState<School[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    COLLECTING: 0,
    READY: 0,
    MATCHED: 0,
    CORRESPONDING: 0,
    DONE: 0
  });
  const [selectedStatus, setSelectedStatus] = useState<SelectedStatus>('COLLECTING');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllSchools();
  }, []);

  const fetchAllSchools = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/all-schools');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch schools');
      }

      setSchools(data.schools || []);
      setStatusCounts(data.statusCounts || {
        COLLECTING: 0,
        READY: 0,
        MATCHED: 0,
        CORRESPONDING: 0,
        DONE: 0
      });

    } catch (err: any) {
      setError('Error fetching schools: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: SelectedStatus) => {
    const colors = {
      COLLECTING: '#ffc107', // Yellow
      READY: '#17a2b8',      // Teal
      MATCHED: '#6f42c1',    // Purple
      CORRESPONDING: '#28a745', // Green
      DONE: '#6c757d'        // Gray
    };
    return colors[status];
  };

  const getStatusIcon = (status: SelectedStatus) => {
    const icons = {
      COLLECTING: '📝',
      READY: '✅',
      MATCHED: '🤝',
      CORRESPONDING: '✉️',
      DONE: '🎉'
    };
    return icons[status];
  };

  const getStatusLabel = (status: SelectedStatus) => {
    const labels = {
      COLLECTING: 'Collecting Information',
      READY: 'Ready for Matching',
      MATCHED: 'Matched',
      CORRESPONDING: 'Corresponding',
      DONE: 'Done'
    };
    return labels[status];
  };

  const getSchoolsByStatus = (status: SelectedStatus): School[] => {
    return schools.filter(school => school.status === status);
  };

  const renderSchoolCard = (school: School) => {
    const teacherName = `${school.teacherFirstName} ${school.teacherLastName}`;
    
    return (
      <div 
        key={school.id}
        className="card"
        style={{ 
          background: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '1rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        {/* School Header */}
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c5aa0' }}>
            {school.schoolName}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <strong>{teacherName}</strong>
            <a 
              href={`mailto:${school.teacherEmail}`}
              style={{ textDecoration: 'none', fontSize: '1.1rem' }}
              title={school.teacherEmail}
            >
              ✉️
            </a>
          </div>
        </div>

        {/* School Info Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '0.75rem',
          fontSize: '0.9rem',
          color: '#6c757d',
          marginBottom: '1rem'
        }}>
          <div><strong>Region:</strong> {school.region}</div>
          <div><strong>Grades:</strong> {school.gradeLevel.join(', ')}</div>
          <div>
            <strong>Students:</strong> Expected: {school.studentCounts.expected} | 
            Registered: {school.studentCounts.registered} | 
            Ready: {school.studentCounts.ready}
          </div>
          <div><strong>Start:</strong> {school.startMonth}</div>
        </div>

        {/* Matched School Info */}
        {school.status === 'MATCHED' && school.matchedSchool && (
          <div style={{ 
            padding: '0.75rem', 
            background: '#e8f5e9', 
            borderRadius: '4px',
            marginBottom: '1rem'
          }}>
            <strong style={{ color: '#155724' }}>
              Matched with: {school.matchedSchool.schoolName}
            </strong>
            <div style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.25rem' }}>
              {school.matchedSchool.teacherFirstName} {school.matchedSchool.teacherLastName} - {school.matchedSchool.region}
            </div>
          </div>
        )}

        {/* Correspondence Info */}
        {school.status === 'CORRESPONDING' && (
          <div style={{ 
            padding: '0.75rem', 
            background: '#d4edda', 
            borderRadius: '4px',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><strong>Letters Sent:</strong> {school.lettersSent}</div>
              <div><strong>Letters Received:</strong> {school.lettersReceived}</div>
            </div>
            {school.matchedSchool && (
              <div style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.5rem' }}>
                <strong>Partner:</strong> {school.matchedSchool.schoolName} ({school.matchedSchool.region})
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderMatchedPairs = () => {
    const matchedSchools = getSchoolsByStatus('MATCHED');
    const pairs: [School, School][] = [];
    const processed = new Set<string>();

    matchedSchools.forEach(school => {
      if (processed.has(school.id) || !school.matchedSchool) return;
      
      pairs.push([school, school.matchedSchool]);
      processed.add(school.id);
      processed.add(school.matchedSchool.id);
    });

    return (
      <div>
        <h3 style={{ marginBottom: '1.5rem' }}>Matched School Pairs</h3>
        {pairs.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h4>No matched schools yet</h4>
            <p style={{ color: '#6c757d' }}>
              Schools will appear here after they are paired together.
            </p>
          </div>
        ) : (
          pairs.map(([school1, school2], index) => (
            <div 
              key={`${school1.id}-${school2.id}`}
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr auto 1fr', 
                gap: '1rem', 
                alignItems: 'center',
                marginBottom: '2rem',
                padding: '1rem',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #dee2e6'
              }}
            >
              {renderSchoolCard(school1)}
              <div style={{ textAlign: 'center', fontSize: '1.5rem' }}>↔️</div>
              {renderSchoolCard(school2)}
            </div>
          ))
        )}
      </div>
    );
  };

  const renderCorrespondingPairs = () => {
    const correspondingSchools = getSchoolsByStatus('CORRESPONDING');
    const pairs: [School, School][] = [];
    const processed = new Set<string>();

    correspondingSchools.forEach(school => {
      if (processed.has(school.id) || !school.matchedSchool) return;
      
      pairs.push([school, school.matchedSchool]);
      processed.add(school.id);
      processed.add(school.matchedSchool.id);
    });

    return (
      <div>
        <h3 style={{ marginBottom: '1.5rem' }}>Corresponding School Pairs</h3>
        {pairs.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h4>No corresponding schools yet</h4>
            <p style={{ color: '#6c757d' }}>
              Schools will appear here when they begin exchanging letters.
            </p>
          </div>
        ) : (
          pairs.map(([school1, school2], index) => (
            <div 
              key={`${school1.id}-${school2.id}`}
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr auto 1fr', 
                gap: '1rem', 
                alignItems: 'center',
                marginBottom: '2rem',
                padding: '1rem',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #dee2e6'
              }}
            >
              {renderSchoolCard(school1)}
              <div style={{ textAlign: 'center', fontSize: '1.5rem' }}>
                ✉️
                <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                  {school1.lettersSent + school2.lettersSent} letters total
                </div>
              </div>
              {renderSchoolCard(school2)}
            </div>
          ))
        )}
      </div>
    );
  };

  const renderStatusContent = () => {
    const statusSchools = getSchoolsByStatus(selectedStatus);

    if (selectedStatus === 'MATCHED') {
      return renderMatchedPairs();
    }

    if (selectedStatus === 'CORRESPONDING') {
      return renderCorrespondingPairs();
    }

    return (
      <div>
        <h3 style={{ marginBottom: '1.5rem' }}>
          {getStatusLabel(selectedStatus)} ({statusSchools.length})
        </h3>
        {statusSchools.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h4>No schools in {getStatusLabel(selectedStatus).toLowerCase()} status</h4>
            <p style={{ color: '#6c757d' }}>
              Schools will appear here as they progress through the program.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
            {statusSchools.map(renderSchoolCard)}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="page">
        <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Loading Dashboard...</h2>
        </div>
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
              <Link href="/" className="nav-link">Home</Link>
              <Link href="/admin/matching" className="nav-link">Admin</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ flex: 1, paddingTop: '3rem' }}>
        
        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>📊 Administrator Dashboard</h1>
          <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
            Overview of all schools and their progress through the program.
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '2rem' }}>
            <strong>Error:</strong> {error}
            <button 
              onClick={fetchAllSchools}
              style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem' }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Status Boxes */}
        <div style={{ 
          display: 'flex', 
          gap: '0', 
          marginBottom: '3rem',
          height: '54px', // 0.75 inches = 54px (at 72dpi)
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {(Object.keys(statusCounts) as SelectedStatus[]).map((status, index) => (
            <div
              key={status}
              onClick={() => setSelectedStatus(status)}
              style={{
                flex: '1',
                background: selectedStatus === status ? getStatusColor(status) : '#f8f9fa',
                color: selectedStatus === status ? 'white' : '#333',
                borderRight: index < Object.keys(statusCounts).length - 1 ? '1px solid #dee2e6' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                fontWeight: selectedStatus === status ? '600' : '500'
              }}
            >
              <div style={{ fontSize: '1.5rem' }}>
                {getStatusIcon(status)}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {statusCounts[status]}
              </div>
              <div style={{ fontSize: '0.9rem' }}>
                {getStatusLabel(status)}
              </div>
              {selectedStatus === status && (
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  height: '3px',
                  background: 'rgba(255,255,255,0.8)'
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button 
            onClick={fetchAllSchools}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            {isLoading ? '🔄 Loading...' : '🔄 Refresh Data'}
          </button>
          
          <Link 
            href="/api/admin/seed-data"
            className="btn btn-primary"
          >
            🌱 Seed Test Data
          </Link>

          <Link 
            href="/api/admin/clear-data"
            className="btn"
            style={{ backgroundColor: '#dc3545', color: 'white' }}
          >
            🗑️ Clear All Data
          </Link>
        </div>

        {/* Dynamic Content */}
        {renderStatusContent()}

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
