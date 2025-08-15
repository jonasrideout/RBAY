const getRegionMap = (region: string) => {
    const regionColor = getStatusColor(selectedStatus);
    
    // Define which states belong to each region
    const regionStates: { [key: string]: string[] } = {
      'Northeast': ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA', 'DC'],
      'Southeast': ['DE', 'MD', 'VA', 'WV', 'KY', 'TN', 'NC', 'SC', 'GA', 'FL', 'AL', 'MS'],
      'Midwest': ['OH', 'IN', 'IL', 'MI', 'WI', 'MN', 'IA', 'MO', 'ND', 'SD', 'NE', 'KS'],
      'Southwest': ['TX', 'OK', 'AR', 'LA', 'NM', 'AZ'],
      'Mountain West': ['MT', 'WY', 'CO', 'UT', 'ID', 'NV'],
      'Pacific': ['WA', 'OR', 'CA', 'AK', 'HI']
    };

    const highlightedStates = regionStates[region] || [];

    return (
      <svg 
        viewBox="0 0 1000 600" 
        style={{ width: '100%', height: '100%' }}
      >
        {/* US Outline Border */}
        <path 
          d="M 844 206 L 900 190 L 950 210 L 980 240 L 990 280 L 950 320 L 900 350 L 844 380 L 800 400 L 760 420 L 720 450 L 740 480 L 780 520 L 800 560 L 750 580 L 700 570 L 650 550 L 600 530 L 550 520 L 500 "use client";

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

  const getRegionMap = (region: string) => {
    const regionColor = getStatusColor(selectedStatus);

    return (
      <div style={{ textAlign: 'center' }}>
        <svg 
          viewBox="0 0 100 60" 
          style={{ width: '100%', height: '80px', marginBottom: '0.5rem' }}
        >
          {/* Simple US outline */}
          <path 
            d="M 15 20 L 85 15 L 95 30 L 90 45 L 75 50 L 50 53 L 25 50 L 10 45 L 5 30 L 15 20 Z"
            fill="none" 
            stroke="#999" 
            strokeWidth="1"
          />
          
          {/* Simple colored region representation */}
          <circle 
            cx="50" 
            cy="30" 
            r="8" 
            fill={regionColor} 
            opacity="0.7"
          />
        </svg>
        <div style={{ fontSize: '0.8rem', color: '#6c757d', fontWeight: '500' }}>
          {region}
        </div>
      </div>
    );
  };460l24-4 8-12-8-16-24 0-16 16 0 12 16 4z" fill={highlightedStates.includes('TX') ? regionColor : 'transparent'} stroke="#ddd" strokeWidth="1" />
        <path d="M460 420l18-4 6-8-4-8-18-2-10 8-2 8 6 8 4 0z" fill={highlightedStates.includes('OK') ? regionColor : 'transparent'} stroke="#ddd" strokeWidth="1" />
        <path d="M520 460l18-4 6-8-4-8-18-2-10 8-2 8 6 8 4 0z" fill={highlightedStates.includes('AR') ? regionColor : 'transparent'} stroke="#ddd" strokeWidth="1" />
        <path d="M500 500l20-4 6-10-6-10-20 0-12 10 0 10 12 4z" fill={highlightedStates.includes('LA') ? regionColor : 'transparent'} stroke="#ddd" strokeWidth="1" />
        <path d="M380 460l20-4 6-10-6-10-20 0-12 10 0 10 12 4z" fill={highlightedStates.includes('NM') ? regionColor : 'transparent'} stroke="#ddd" strokeWidth="1" />
        <path d="M340 460l18-4 6-8-4-8-18-2-10 8-2 8 6 8 4 0z" fill={highlightedStates.includes('AZ') ? regionColor : 'transparent'} stroke="#ddd" strokeWidth="1" />
        
        {/* Mountain West */}
        <path d="M420 340l20-4 6-10-6-10-20 0-12 10 0 10 12 4z" fill={highlightedStates.includes('MT') ? regionColor : 'transparent'} stroke="#ddd" strokeWidth="1" />
        <path d="M420 380l18-4 6-8-4-8-18-2-10 8-2 8 6 8 4 0z" fill={highlightedStates.includes('WY') ? regionColor : 'transparent'} stroke="#ddd" strokeWidth="1" />
        <path d="M420 420l18-4 6-8-4-8-18-2-10 8-2 8 6 8 4 0z" fill={highlightedStates.includes('CO') ? regionColor : 'transparent'} stroke="#ddd" strokeWidth="1" />
        <path d="M360 420l20-4 6-10-6-10-20 0-12 10 0 10 12 4z" fill={highlightedStates.includes('UT') ? regionColor : 'transparent'} stroke="#ddd" strokeWidth="1" />
        <path d="M360 380l18-4 6-8-4-8-18-2-10 8-2 8 6 8 4 0z" fill={highlightedStates.includes('ID') ? regionColor : 'transparent'} stroke="#ddd" strokeWidth="1" />
        <path d="M300 420l20-4 6-10-6-10-20 0-12 10 0 10 12 4z" fill={highlightedStates.includes('NV') ? regionColor : 'transparent'} stroke="#ddd" strokeWidth="1" />
        
        {/* Pacific */}
        <path d="M280 340l18-4 6-8-4-8-18-2-10 8-2 8 6 8 4 0z" fill={highlightedStates.includes('WA') ? regionColor : 'transparent'} stroke="#ddd" strokeWidth="1" />
        <path d="M280 380l18-4 6-8-4-8-18-2-10 8-2 8 6 8 4 0z" fill={highlightedStates.includes('OR') ? regionColor : 'transparent'} stroke="#ddd" strokeWidth="1" />
        <path d="M260 420l24-4 8-12-8-16-24 0-16 16 0 12 16 4z" fill={highlightedStates.includes('CA') ? regionColor : 'transparent'} stroke="#ddd" strokeWidth="1" />
        <path d="M160 520l16-2 4-6-2-8-16-2-8 6-2 8 4 6 4 0z" fill={highlightedStates.includes('AK') ? regionColor : 'transparent'} stroke="#ddd" strokeWidth="1" />
        <path d="M200 540l14-2 4-6-2-6-14-2-8 4-2 6 4 6 4 0z" fill={highlightedStates.includes('HI') ? regionColor : 'transparent'} stroke="#ddd" strokeWidth="1" />
      </svg>
    );
  };

  const renderSchoolCard = (school: School) => {
    const teacherName = `${school.teacherFirstName} ${school.teacherLastName}`;
    
    return (
      <div 
        key={school.id}
        style={{ 
          background: '#fff',
          border: '1px solid #e0e6ed',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          transition: 'all 0.2s ease',
          display: 'grid',
          gridTemplateColumns: '50% 25% 25%',
          gap: '1.5rem',
          alignItems: 'stretch',
          minHeight: '120px'
        }}
      >
        {/* School Info Column */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ 
              margin: '0 0 0.5rem 0', 
              color: '#1a365d', 
              fontSize: '1.3rem',
              fontWeight: '600',
              lineHeight: '1.2'
            }}>
              {school.schoolName}
            </h3>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              color: '#4a5568',
              fontSize: '1rem'
            }}>
              <span style={{ fontWeight: '500' }}>{teacherName}</span>
              <a 
                href={`mailto:${school.teacherEmail}`}
                style={{ 
                  textDecoration: 'none', 
                  fontSize: '1.1rem',
                  opacity: 0.7,
                  transition: 'opacity 0.2s ease'
                }}
                title={school.teacherEmail}
              >
                ✉️
              </a>
            </div>
          </div>
          <div style={{ 
            color: '#718096', 
            fontSize: '0.95rem',
            marginTop: '0.5rem'
          }}>
            <strong>Grades:</strong> {school.gradeLevel.join(', ')}
          </div>
        </div>

        {/* Class Info Column */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-evenly',
          fontSize: '0.95rem'
        }}>
          <div style={{ color: '#4a5568' }}>
            <strong>Start:</strong> {school.startMonth}
          </div>
          <div style={{ color: '#4a5568' }}>
            <strong>Expected:</strong> {school.studentCounts.expected}
          </div>
          <div style={{ color: '#4a5568' }}>
            <strong>Registered:</strong> {school.studentCounts.registered}
          </div>
          <div style={{ color: '#4a5568' }}>
            <strong>Ready:</strong> {school.studentCounts.ready}
          </div>
        </div>

        {/* Map Column */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '80px'
        }}>
          {getRegionMap(school.region)}
        </div>

        {/* Status-specific info overlays */}
        {school.status === 'MATCHED' && school.matchedSchool && (
          <div style={{ 
            gridColumn: '1 / -1',
            padding: '0.75rem', 
            background: 'linear-gradient(135deg, #f0fff4 0%, #e8f5e9 100%)', 
            borderRadius: '8px',
            marginTop: '1rem',
            borderLeft: '4px solid #38a169'
          }}>
            <strong style={{ color: '#2f855a' }}>
              🤝 Matched with: {school.matchedSchool.schoolName}
            </strong>
            <div style={{ fontSize: '0.9rem', color: '#4a5568', marginTop: '0.25rem' }}>
              {school.matchedSchool.teacherFirstName} {school.matchedSchool.teacherLastName} - {school.matchedSchool.region}
            </div>
          </div>
        )}

        {school.status === 'CORRESPONDING' && (
          <div style={{ 
            gridColumn: '1 / -1',
            padding: '0.75rem', 
            background: 'linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%)', 
            borderRadius: '8px',
            marginTop: '1rem',
            borderLeft: '4px solid #4299e1'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
              <div style={{ color: '#2d3748' }}><strong>📤 Letters Sent:</strong> {school.lettersSent}</div>
              <div style={{ color: '#2d3748' }}><strong>📥 Letters Received:</strong> {school.lettersReceived}</div>
            </div>
            {school.matchedSchool && (
              <div style={{ fontSize: '0.9rem', color: '#4a5568' }}>
                <strong>✉️ Partner:</strong> {school.matchedSchool.schoolName} ({school.matchedSchool.region})
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

    // Single column layout for individual schools
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))', gap: '1rem' }}>
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
