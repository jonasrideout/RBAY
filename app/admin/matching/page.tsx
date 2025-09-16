// app/admin/matching/page.tsx 
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import MatchingWorkflow from './components/MatchingWorkflow';
import SchoolCard from './components/SchoolCard';
import { School, StatusCounts } from './types';

type ActiveTab = 'collecting' | 'ready' | 'matched';

export default function AdminDashboard() {
  const [schools, setSchools] = useState<School[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    COLLECTING: 0,
    READY: 0,
    MATCHED: 0,
    CORRESPONDING: 0,
    DONE: 0
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>('collecting');
  const [showMatchingWorkflow, setShowMatchingWorkflow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminUser, setAdminUser] = useState<string>('');
  // Track which school pairs have pen pal assignments
  const [pairAssignments, setPairAssignments] = useState<{[key: string]: boolean}>({});
  // Track actual count of schools with both matching and student pairings
  const [schoolsWithPairingsCount, setSchoolsWithPairingsCount] = useState(0);
  
  const router = useRouter();

  useEffect(() => {
    checkAdminAuth();
    fetchAllSchools();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const response = await fetch('/api/admin/me');
      if (response.ok) {
        const data = await response.json();
        setAdminUser(data.email);
      } else {
        // Will be redirected by middleware, but this is a backup
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/admin/login');
    }
  };

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect even if API call fails
      router.push('/');
    }
  };

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

      // Check pen pal assignments for matched schools
      await checkPenPalAssignments(data.schools || []);

    } catch (err: any) {
      setError('Error fetching schools: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to check if pen pal assignments exist for school pairs
  const checkPenPalAssignments = async (schoolsList: School[]) => {
    const matchedSchools = schoolsList.filter(school => school.matchedWithSchoolId);
    const assignments: {[key: string]: boolean} = {};
    
    // Group schools into pairs and check each pair
    const processed = new Set<string>();
    let schoolsWithPairingsCount = 0;
    
    for (const school of matchedSchools) {
      if (processed.has(school.id) || !school.matchedWithSchoolId) continue;
      
      const pairKey = [school.id, school.matchedWithSchoolId].sort().join('-');
      
      try {
        // Check if any students from school1 have pen pal assignments with students from school2
        const response = await fetch(`/api/admin/download-pairings?schoolId=${school.id}`);
        if (response.ok) {
          const data = await response.json();
          
          // Check for multiple pen pals structure (penpals array and penpalCount)
          const hasAssignments = data.pairings && data.pairings.some((pairing: any) => 
            pairing.penpalCount > 0 || (pairing.penpals && pairing.penpals.length > 0)
          );
          
          assignments[pairKey] = hasAssignments;
          
          // Count individual schools with pairings
          if (hasAssignments) {
            schoolsWithPairingsCount += 2; // Both schools in the pair have pairings
          }
          
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
      if (school.matchedWithSchoolId) {
        processed.add(school.matchedWithSchoolId);
      }
    }
    
    setPairAssignments(assignments);
    setSchoolsWithPairingsCount(schoolsWithPairingsCount);
  };

  const handleSchoolsUpdate = async (updatedSchools: School[]) => {
    // Always refresh from API to maintain single source of truth
    try {
      await fetchAllSchools();
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to refresh school data:', error);
      return Promise.resolve();
    }
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

  // Handlers for seed and clear operations
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

  const getSchoolsByStatus = (status: 'COLLECTING' | 'READY' | 'MATCHED'): School[] => {
    return schools.filter(school => school.status === status);
  };

  // Check if both schools in a matched pair are READY status
  const areBothSchoolsReady = (school1: School, school2: School): boolean => {
    return school1.status === 'READY' && school2.status === 'READY';
  };

  const renderCollectingTab = () => {
    const collectingSchools = getSchoolsByStatus('COLLECTING');

    if (showMatchingWorkflow) {
      return (
        <div>
          <MatchingWorkflow 
            schools={schools} 
            onSchoolsUpdate={handleSchoolsUpdate}
            onTabChange={() => {}} // Not needed in this context
          />
        </div>
      );
    }

    return (
      <div>
        {collectingSchools.length === 0 ? (
          <div style={{ 
            background: '#fff',
            border: '1px solid #e0e6ed',
            borderRadius: '12px',
            textAlign: 'center', 
            padding: '3rem' 
          }}>
            <h4>No schools collecting information</h4>
            <p style={{ color: '#6c757d' }}>
              Schools will appear here when they begin the data collection process.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {collectingSchools.map(school => (
              <SchoolCard 
                key={school.id} 
                school={school} 
                showActions={false} // No pin/match icons in basic view
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderReadyTab = () => {
    return (
      <div>
        <MatchingWorkflow 
          schools={schools} 
          onSchoolsUpdate={handleSchoolsUpdate}
          onTabChange={(status) => {
            if (status === 'MATCHED') {
              setActiveTab('matched');
            }
          }}
        />
      </div>
    );
  };

  const renderMatchedTab = () => {
    // Get schools that have both school matches AND student pairings (regardless of status)
    const schoolsWithPairings = schools.filter(school => {
      if (!school.matchedWithSchoolId) return false;
      
      const pairKey = [school.id, school.matchedWithSchoolId].sort().join('-');
      return pairAssignments[pairKey] || false;
    });
    
    const pairs: [School, School][] = [];
    const processed = new Set<string>();

    schoolsWithPairings.forEach(school => {
      if (processed.has(school.id) || !school.matchedWithSchoolId) return;
      
      // Find the complete school object instead of using limited matchedSchool data
      const matchedSchoolFull = schools.find(s => s.id === school.matchedWithSchoolId);
      if (!matchedSchoolFull) return;
      
      // Only add if the matched school also has student pairings
      const pairKey = [school.id, matchedSchoolFull.id].sort().join('-');
      if (pairAssignments[pairKey]) {
        pairs.push([school, matchedSchoolFull]);
        processed.add(school.id);
        processed.add(matchedSchoolFull.id);
      }
    });

    return (
      <div>
        {pairs.length === 0 ? (
          <div style={{ 
            background: '#fff',
            border: '1px solid #e0e6ed',
            borderRadius: '12px',
            textAlign: 'center', 
            padding: '3rem' 
          }}>
            <h4>No schools matched + students paired yet</h4>
            <p style={{ color: '#6c757d' }}>
              Schools will appear here after they are paired together AND students have been assigned pen pals.
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.5rem' 
          }}>
            {pairs.map(([school1, school2], index) => {
              // Check if this pair has pen pal assignments using updated structure
              const pairKey = [school1.id, school2.id].sort().join('-');
              const hasAssignments = pairAssignments[pairKey] || false;
              
              // NEW: Check if both schools are READY before showing "Assign Pen Pals" button
              const bothSchoolsReady = areBothSchoolsReady(school1, school2);
              const showAssignButton = bothSchoolsReady && !hasAssignments;

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
                        <strong>{school1.teacherName}</strong>
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
                      <div style={{ fontSize: '0.8rem', color: '#a0aec0', marginTop: '0.25rem' }}>
                        Status: <strong>{school1.status}</strong>
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
                        <strong>{school2.teacherName}</strong>
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
                      <div style={{ fontSize: '0.8rem', color: '#a0aec0', marginTop: '0.25rem' }}>
                        Status: <strong>{school2.status}</strong>
                      </div>
                    </div>

                    {/* Actions Column */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      width: '220px',
                      minWidth: '220px',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      {/* Show Assign button only if both schools are READY and no assignments exist */}
                      {showAssignButton ? (
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
                      ) : !bothSchoolsReady ? (
                        // Show waiting message if schools aren't both ready
                        <div style={{ 
                          textAlign: 'center',
                          color: '#6b7280',
                          fontSize: '0.85rem',
                          fontStyle: 'italic',
                          padding: '0.75rem',
                          background: '#f9fafb',
                          borderRadius: '6px',
                          width: '100%'
                        }}>
                          Waiting for both schools to complete data collection
                        </div>
                      ) : hasAssignments ? (
                        // Show pen pal list links if assignments exist
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
                      ) : null}
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'collecting':
        return renderCollectingTab();
      case 'ready':
        return renderReadyTab();
      case 'matched':
        return renderMatchedTab();
      default:
        return renderCollectingTab();
    }
  };

  if (isLoading) {
    return (
      <div className="page">
        <Header />
        <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Header 
        session={{ user: { email: adminUser } }} 
        onLogout={handleAdminLogout} 
      />

      <main className="container" style={{ flex: 1, paddingTop: '1.5rem' }}>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1.5rem' 
        }}>
          <div>
            <h1 style={{ marginBottom: '0.5rem', fontSize: '1.8rem' }}>Administrator Dashboard</h1>
            <p style={{ color: '#6c757d', fontSize: '1.1rem', margin: 0 }}>
              Overview of all schools and their progress through the program.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/register-school?admin=true" className="btn btn-primary">
              Add School
            </Link>
            
            {/* Match Schools button - disabled on Tab 2 & 3 */}
            <button 
              onClick={() => {
                if (activeTab === 'collecting') {
                  setShowMatchingWorkflow(!showMatchingWorkflow);
                }
              }}
              className="btn"
              disabled={activeTab !== 'collecting'}
              style={{ 
                backgroundColor: activeTab === 'collecting' ? '#2563eb' : '#9ca3af',
                color: 'white',
                cursor: activeTab === 'collecting' ? 'pointer' : 'not-allowed',
                opacity: activeTab === 'collecting' ? 1 : 0.6
              }}
            >
              {activeTab === 'collecting' && showMatchingWorkflow ? 'Done Matching' : 'Match Schools'}
            </button>
            
            {/* Temporary Testing Buttons Container */}
            <div style={{
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '0.5rem',
              position: 'relative',
              display: 'flex',
              gap: '0.5rem'
            }}>
              <span style={{
                position: 'absolute',
                top: '-0.6rem',
                left: '0.5rem',
                backgroundColor: 'white',
                padding: '0 0.25rem',
                fontSize: '0.7rem',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                Temporary Testing Buttons
              </span>
              
              <button 
                onClick={handleSeedData}
                className="btn btn-primary"
                style={{ margin: 0 }}
              >
                Seed Data
              </button>

              <button 
                onClick={handleClearData}
                className="btn"
                style={{ backgroundColor: '#dc3545', color: 'white', margin: 0 }}
              >
                Clear Data
              </button>
            </div>
          </div>
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

        {/* 3-Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: '0',
          marginBottom: '2rem',
          borderBottom: '2px solid #e5e7eb'
        }}>
          {[
            { key: 'collecting', label: 'Schools Collecting Information', count: statusCounts.COLLECTING },
            { key: 'ready', label: 'Schools Ready to be Matched / Paired', count: statusCounts.READY },
            { key: 'matched', label: 'Matched Schools + Paired Students', count: schoolsWithPairingsCount }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key as ActiveTab);
                if (tab.key === 'collecting') {
                  setShowMatchingWorkflow(false); // Reset workflow state when switching to collecting tab
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.key ? '3px solid #2563eb' : '3px solid transparent',
                padding: '1rem 1.5rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: activeTab === tab.key ? '#2563eb' : '#6b7280',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {renderTabContent()}

      </main>

      <footer style={{ background: '#343a40', color: 'white', padding: '2rem 0', marginTop: '3rem' }}>
        <div className="container text-center">
          <p>&copy; 2024 The Right Back at You Project by Carolyn Mackler. Building empathy and connection through literature.</p>
        </div>
      </footer>
    </div>
  );
}
