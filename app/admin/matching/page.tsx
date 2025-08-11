"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface School {
  id: string;
  name: string;
  region: string;
  grades: string[];
  studentCount: number;
  startMonth: string;
}

interface Match {
  matchId: string;
  score: number;
  quality: string;
  school1: {
    id: string;
    name: string;
    teacher: string;
    email: string;
    region: string;
    grades: string[];
    studentCount: number;
    startMonth: string;
  };
  school2: {
    id: string;
    name: string;
    teacher: string;
    email: string;
    region: string;
    grades: string[];
    studentCount: number;
    startMonth: string;
  };
  reasons: string[];
}

export default function AdminMatching() {
  const [schools, setSchools] = useState<School[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSchools, setIsLoadingSchools] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    setIsLoadingSchools(true);
    setError('');

    try {
      const response = await fetch('/api/matching/schools');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch schools');
      }

      setSchools(data.readyForMatching || []);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError('Error fetching schools: ' + err.message);
    } finally {
      setIsLoadingSchools(false);
    }
  };

  const runMatching = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/matching/schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ autoMatch: true })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to run matching');
      }

      setMatches(data.matches || []);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError('Error running matching: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'Excellent': return '#28a745';
      case 'Good': return '#17a2b8';
      case 'Fair': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getRegionColor = (region: string) => {
    const colors: { [key: string]: string } = {
      'Northeast': '#e3f2fd',
      'Southeast': '#f3e5f5', 
      'Midwest': '#fff3e0',
      'Southwest': '#fce4ec',
      'Mountain West': '#e8f5e8',
      'Pacific': '#fff8e1'
    };
    return colors[region] || '#f5f5f5';
  };

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
          <h1 style={{ marginBottom: '0.5rem' }}>🎯 School Matching Admin</h1>
          <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
            Find and create matches between schools from different regions.
          </p>
          {lastUpdated && (
            <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '2rem' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button 
            onClick={fetchSchools}
            className="btn btn-secondary"
            disabled={isLoadingSchools}
          >
            {isLoadingSchools ? '🔄 Loading...' : '🔄 Refresh Schools'}
          </button>
          
          <button 
            onClick={runMatching}
            className="btn btn-primary"
            disabled={isLoading || schools.length < 2}
            style={{ fontSize: '1.1rem', padding: '0.75rem 1.5rem' }}
          >
            {isLoading ? (
              <>
                <span className="loading"></span>
                <span style={{ marginLeft: '0.5rem' }}>Finding Matches...</span>
              </>
            ) : (
              '🎯 Run School Matching'
            )}
          </button>

          <Link 
            href="/api/admin/clear-data"
            className="btn"
            style={{ backgroundColor: '#dc3545', color: 'white' }}
          >
            🗑️ Clear All Data
          </Link>
        </div>

        {/* Schools Ready for Matching */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Schools Ready for Matching ({schools.length})</h3>
          
          {schools.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
              <h4>No schools ready for matching</h4>
              <p>Schools need to register, add all students, and request matching to appear here.</p>
              <Link href="/register-school" className="btn btn-primary">
                Register a School
              </Link>
            </div>
          ) : schools.length === 1 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
              <h4>Only 1 school ready for matching</h4>
              <p>Need at least 2 schools from different regions to create matches.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {schools.map(school => (
                <div 
                  key={school.id} 
                  className="card" 
                  style={{ 
                    background: getRegionColor(school.region),
                    border: '1px solid #dee2e6'
                  }}
                >
                  <h4 style={{ marginBottom: '0.5rem' }}>{school.name}</h4>
                  <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                    <p><strong>Region:</strong> {school.region}</p>
                    <p><strong>Grades:</strong> {school.grades.join(', ')}</p>
                    <p><strong>Students:</strong> {school.studentCount}</p>
                    <p><strong>Start:</strong> {school.startMonth}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Matching Results */}
        {matches.length > 0 && (
          <div className="card">
            <h3>🎉 Potential School Matches ({matches.length})</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {matches.map((match, index) => (
                <div 
                  key={match.matchId} 
                  className="card" 
                  style={{ 
                    background: '#f8f9fa',
                    border: `2px solid ${getQualityColor(match.quality)}`,
                    position: 'relative'
                  }}
                >
                  {/* Match Header */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <h4 style={{ margin: '0' }}>Match #{index + 1}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span 
                        style={{ 
                          background: getQualityColor(match.quality),
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '4px',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}
                      >
                        {match.quality} Match
                      </span>
                      <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                        Score: {match.score}
                      </span>
                    </div>
                  </div>

                  {/* Schools Comparison */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'center' }}>
                    {/* School 1 */}
                    <div 
                      className="card" 
                      style={{ 
                        background: getRegionColor(match.school1.region),
                        margin: '0',
                        border: '1px solid #dee2e6'
                      }}
                    >
                      <h5 style={{ marginBottom: '0.5rem', color: '#2c5aa0' }}>{match.school1.name}</h5>
                      <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        <strong>{match.school1.teacher}</strong>
                      </p>
                      <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                        <p><strong>Region:</strong> {match.school1.region}</p>
                        <p><strong>Grades:</strong> {match.school1.grades.join(', ')}</p>
                        <p><strong>Students:</strong> {match.school1.studentCount}</p>
                        <p><strong>Start:</strong> {match.school1.startMonth}</p>
                      </div>
                    </div>

                    {/* Connection Arrow */}
                    <div style={{ textAlign: 'center', fontSize: '1.5rem' }}>
                      ↔️
                    </div>

                    {/* School 2 */}
                    <div 
                      className="card" 
                      style={{ 
                        background: getRegionColor(match.school2.region),
                        margin: '0',
                        border: '1px solid #dee2e6'
                      }}
                    >
                      <h5 style={{ marginBottom: '0.5rem', color: '#2c5aa0' }}>{match.school2.name}</h5>
                      <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        <strong>{match.school2.teacher}</strong>
                      </p>
                      <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                        <p><strong>Region:</strong> {match.school2.region}</p>
                        <p><strong>Grades:</strong> {match.school2.grades.join(', ')}</p>
                        <p><strong>Students:</strong> {match.school2.studentCount}</p>
                        <p><strong>Start:</strong> {match.school2.startMonth}</p>
                      </div>
                    </div>
                  </div>

                  {/* Match Reasons */}
                  <div style={{ marginTop: '1rem' }}>
                    <h6 style={{ marginBottom: '0.5rem', color: '#495057' }}>Why this is a good match:</h6>
                    <ul style={{ marginBottom: '0', paddingLeft: '1.5rem' }}>
                      {match.reasons.map((reason, i) => (
                        <li key={i} style={{ color: '#6c757d', fontSize: '0.9rem' }}>{reason}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <button 
                      className="btn btn-primary"
                      style={{ marginRight: '0.5rem' }}
                      onClick={() => {
                        // TODO: Implement approve match
                        alert('Match approval feature coming soon!');
                      }}
                    >
                      ✅ Approve Match
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => {
                        // TODO: Implement contact teachers
                        alert(`Contact:\n${match.school1.email}\n${match.school2.email}`);
                      }}
                    >
                      📧 Contact Teachers
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Matches Message */}
        {matches.length === 0 && !isLoading && schools.length >= 2 && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h4>No compatible matches found</h4>
            <p style={{ color: '#6c757d' }}>
              Schools may be from the same region, have incompatible grades, or different start months.
            </p>
          </div>
        )}

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
