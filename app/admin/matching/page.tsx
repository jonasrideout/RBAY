// app/admin/matching/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MatchingWorkflow from './components/MatchingWorkflow';
import SchoolCard from './components/SchoolCard';
import { School, StatusCounts, SelectedStatus } from './types';

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
  // NEW: Track which school pairs have pen pal assignments
  const [pairAssignments, setPairAssignments] = useState<{[key: string]: boolean}>({});

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

      // NEW: Check pen pal assignments for matched schools
      await checkPenPalAssignments(data.schools || []);

    } catch (err: any) {
      setError('Error fetching schools: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // FIXED: Function to check if pen pal assignments exist for school pairs
  const checkPenPalAssignments = async (schoolsList: School[]) => {
    const matchedSchools = schoolsList.filter(school => school.status === 'MATCHED');
    const assignments: {[key: string]: boolean} = {};
    
    // Group schools into pairs and check each pair
    const processed = new Set<string>();
    
    for (const school of matchedSchools) {
      if (processed.has(school.id) || !school.matchedSchool) continue;
      
      const pairKey = [school.id, school.matchedSchool.id].sort().join('-');
      
      try {
        // Check if any students from school1 have pen pal assignments with students from school2
        const response = await fetch(`/api/admin/download-pairings?schoolId=${school.id}`);
        if (response.ok) {
          const data = await response.json();
          
          // FIXED: Check for multiple pen pals structure (penpals array and penpalCount)
          const hasAssignments = data.pairings && data.pairings.some((pairing: any) => 
            pairing.penpalCount > 0 || (pairing.penpals && pairing.penpals.length > 0)
          );
          
          assignments[pairKey] = hasAssignments;
          
          // DEBUG: Log to help troubleshoot
          console.log(`Checking assignments for pair ${pairKey}:`, {
            hasAssignments,
            samplePairing: data.pairings?.[0],
            totalPairings: data.pairings?.length
          });
        } else {
          assignments[pairKey] = false;
        }
      } catch (error) {
        console.error(`Error checking assignments for ${pairKey}:`, error);
        assignments[pairKey] = false;
      }
      
      processed.add(school.id);
      processed.add(school.matchedSchool.id);
    }
    
    setPairAssignments(assignments);
  };

  const handleSchoolsUpdate = async (updatedSchools: School[]) => {
    // UPDATED: If empty array is passed, just refresh from API
    if (updatedSchools.length === 0) {
      await fetchAllSchools();
      return Promise.resolve();
    }
    
    // Otherwise, update local state (for other use cases)
    setSchools(updatedSchools);
    
    // Calculate and update status counts locally
    const newStatusCounts = updatedSchools.reduce((counts, school) => {
      counts[school.status] = (counts[school.status] || 0) + 1;
      return counts;
    }, {
      COLLECTING: 0,
      READY: 0,
      MATCHED: 0,
      CORRESPONDING: 0,
      DONE: 0
    });
    setStatusCounts(newStatusCounts);
    
    // Sync with API in background
    try {
      await fetchAllSchools();
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to sync with API:', error);
      return Promise.resolve();
    }
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

  const handleAssignPenPals = async (school1Id: string, school2Id: string) => {
    try {
      const response = await fetch('/api/admin/assign-penpals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          school1Id, 
          school2Id 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign pen pals');
      }

      // Refresh the page to show updated status
      fetchAllSchools();
      
    } catch (err: any) {
      console.error('Error assigning pen pals:', err);
      alert('Error assigning pen pals: ' + err.message);
    }
  };

  // NEW: Function to handle download
  const handleDownloadPairings = (schoolId: string, schoolName: string) => {
    const downloadUrl = `/api/admin/download-pairings?schoolId=${schoolId}`;
    
    // Create a temporary link and click it to trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${schoolName}_pen_pal_assignments.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // FIXED: Added handlers for seed and clear operations
  const handleSeedData = async () => {
    if (confirm('This will create test schools. Continue?')) {
      try {
        const response = await fetch('/api/admin/seed-data');
        const data = await response.json();
        
        if (response.ok) {
          alert('Test data seeded successfully!');
          await fetchAllSchools(); // Refresh the data
        } else {
          alert('Error seeding data: ' + (data.error || 'Unknown error'));
        }
      } catch (err) {
        alert('Error seeding data: ' + err);
      }
    }
  };

  const handleClearData = async () => {
    if (confirm('This will permanently delete ALL schools and students. Are you sure?')) {
      try {
        const response = await fetch('/api/admin/clear-data');
        const data = await response.json();
        
        if (response.ok) {
          alert('All data cleared successfully!');
          await fetchAllSchools(); // Refresh the data
        } else {
          alert('Error clearing data: ' + (data.error || 'Unknown error'));
        }
      } catch (err) {
        alert('Error clearing data: ' + err);
      }
    }
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
          <div style={{ 
            background: '#fff',
            border: '1px solid #e0e6ed',
            borderRadius: '12px',
            textAlign: 'center', 
            padding: '3rem' 
          }}>
            <h4>No matched schools yet</h4>
            <p style={{ color: '#6c757d' }}>
              Schools will appear here after they are paired together.
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.5rem' 
          }}>
            {pairs.map(([school1, school2], index) => {
              // FIXED: Check if this pair has pen pal assignments using updated structure
              const pairKey = [school1.id, school2.id].sort().join('-');
              const hasAssignments = pairAssignments[pairKey] || false;

              return (
                <div 
                  key={`${school1.id}-${school2.id}`}
                  style={{
                    background: '#fff',
                    border: '1px solid #e0e6ed',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                >
                  {/* 3-Column Layout */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 220px',
                    gap: '1.5rem',
                    alignItems: 'center'
                  }}>
                    {/* School 1 */}
                    <div style={{
                      padding: '1rem',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #dee2e6'
                    }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#1a365d' }}>
                        {school1.schoolName}
                      </h4>
                      <div style={{ fontSize: '0.9rem', color: '#4a5568', marginBottom: '0.5rem' }}>
                        <strong>{school1.teacherFirstName} {school1.teacherLastName}</strong>
                        <a 
                          href={`mailto:${school1.teacherEmail}`}
                          style={{ marginLeft: '0.5rem', textDecoration: 'none', opacity: 0.7 }}
                          title={school1.teacherEmail}
                        >
                          ✉️
                        </a>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#718096' }}>
                        <strong>{school1.region}</strong> | {school1.studentCounts?.ready || 0} students | Starts {school1.startMonth}
                      </div>
                    </div>

                    {/* School 2 */}
                    <div style={{
                      padding: '1rem',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #dee2e6'
                    }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#1a365d' }}>
                        {school2.schoolName}
                      </h4>
                      <div style={{ fontSize: '0.9rem', color: '#4a5568', marginBottom: '0.5rem' }}>
                        <strong>{school2.teacherFirstName} {school2.teacherLastName}</strong>
                        <a 
                          href={`mailto:${school2.teacherEmail}`}
                          style={{ marginLeft: '0.5rem', textDecoration: 'none', opacity: 0.7 }}
                          title={school2.teacherEmail}
                        >
                          ✉️
                        </a>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#718096' }}>
                        <strong>{school2.region}</strong> | {school2.studentCounts?.ready || 0} students | Starts {school2.startMonth}
                      </div>
                    </div>

                    {/* Actions Column - FIXED: Conditional logic based on actual pen pal assignments */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      width: '220px',
                      minWidth: '220px',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      {/* CONDITIONAL: Show Assign button if no assignments, hide if assignments exist */}
                      {!hasAssignments ? (
                        <button
                          onClick={() => handleAssignPenPals(school1.id, school2.id)}
                          style={{
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.75rem 1rem',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            width: '100%',
                            textAlign: 'center'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                        >
                          Assign Pen Pals
                        </button>
                      ) : (
                        // CONDITIONAL: Show pen pal list links if assignments exist
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '0.5rem',
                          width: '100%'
                        }}>
                          <button
                            onClick={() => window.open(`/admin/pen-pal-list?schoolId=${school1.id}`, '_blank')}
                            style={{
                              color: '#2563eb',
                              backgroundColor: 'white',
                              border: '1px solid #2563eb',
                              borderRadius: '4px',
                              padding: '0.75rem',
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              textAlign: 'center',
                              lineHeight: '1.2',
                              width: '100%'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = '#f0f8ff';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = 'white';
                            }}
                          >
                            <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                              {school1.schoolName}
                            </div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                              View Pen Pal List
                            </div>
                          </button>
                          
                          <button
                            onClick={() => window.open(`/admin/pen-pal-list?schoolId=${school2.id}`, '_blank')}
                            style={{
                              color: '#2563eb',
                              backgroundColor: 'white',
                              border: '1px solid #2563eb',
                              borderRadius: '4px',
                              padding: '0.75rem',
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              textAlign: 'center',
                              lineHeight: '1.2',
                              width: '100%'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = '#f0f8ff';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = 'white';
                            }}
                          >
                            <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                              {school2.schoolName}
                            </div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                              View Pen Pal List
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
          <div style={{ 
            background: '#fff',
            border: '1px solid #e0e6ed',
            borderRadius: '12px',
            textAlign: 'center', 
            padding: '3rem' 
          }}>
            <h4>No corresponding schools yet</h4>
            <p style={{ color: '#6c757d' }}>
              Schools will appear here when they begin exchanging letters.
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1.5rem' 
          }}>
            {pairs.map(([school1, school2]) => [school1, school2]).flat().map(school => (
              <SchoolCard
                key={school.id}
                school={school}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderStatusContent = () => {
    if (selectedStatus === 'READY') {
      return (
        <MatchingWorkflow 
          schools={schools} 
          onSchoolsUpdate={handleSchoolsUpdate}
          onTabChange={setSelectedStatus}
        />
      );
    }

    if (selectedStatus === 'MATCHED') {
      return renderMatchedPairs();
    }

    if (selectedStatus === 'CORRESPONDING') {
      return renderCorrespondingPairs();
    }

    // COLLECTING and DONE statuses
    const statusSchools = getSchoolsByStatus(selectedStatus);

    return (
      <div>
        <h3 style={{ marginBottom: '1.5rem' }}>
          {getStatusLabel(selectedStatus)} ({statusSchools.length})
        </h3>
        {statusSchools.length === 0 ? (
          <div style={{ 
            background: '#fff',
            border: '1px solid #e0e6ed',
            borderRadius: '12px',
            textAlign: 'center', 
            padding: '3rem' 
          }}>
            <h4>No schools in {getStatusLabel(selectedStatus).toLowerCase()} status</h4>
            <p style={{ color: '#6c757d' }}>
              Schools will appear here as they progress through the program.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))', gap: '1rem' }}>
            {statusSchools.map(school => (
              <SchoolCard key={school.id} school={school} />
            ))}
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

      <main className="container" style={{ flex: 1, paddingTop: '1.5rem' }}>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ marginBottom: '0.5rem', fontSize: '1.8rem' }}>Administrator Dashboard</h1>
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

        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '3rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {(Object.keys(statusCounts) as SelectedStatus[]).map((status) => (
            <div
              key={status}
              onClick={() => setSelectedStatus(status)}
              style={{
                background: '#fff',
                color: '#333',
                border: `2px solid ${selectedStatus === status ? '#ffd700' : '#e0e6ed'}`,
                borderRadius: '8px',
                padding: '1rem 1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                width: '160px',
                height: '80px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                {statusCounts[status]}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px', lineHeight: '1.2', paddingBottom: '0.5rem' }}>
                {getStatusLabel(status).toUpperCase()}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button 
            onClick={fetchAllSchools}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            {isLoading ? '🔄 Loading...' : '🔄 Refresh Data'}
          </button>
          
          {/* FIXED: Changed from Link to button to prevent auto-navigation */}
          <button 
            onClick={handleSeedData}
            className="btn btn-primary"
          >
            🌱 Seed Test Data
          </button>

          {/* FIXED: Changed from Link to button to prevent auto-navigation */}
          <button 
            onClick={handleClearData}
            className="btn"
            style={{ backgroundColor: '#dc3545', color: 'white' }}
          >
            🗑️ Clear All Data
          </button>
        </div>

        {renderStatusContent()}

      </main>

      <footer style={{ background: '#343a40', color: 'white', padding: '2rem 0', marginTop: '3rem' }}>
        <div className="container text-center">
          <p>&copy; 2024 The Right Back at You Project by Carolyn Mackler. Building empathy and connection through literature.</p>
        </div>
      </footer>
    </div>
  );
}
