// app/admin/matching/page.tsx 
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import MatchingWorkflow from './components/MatchingWorkflow';
import SchoolCard from './components/SchoolCard';
import { School, StatusCounts } from './types';

interface SchoolPair {
  school1: School;
  school2: School;
  hasStudentPairings: boolean;
  bothSchoolsReady: boolean;
}

export default function AdminDashboard() {
  const [schools, setSchools] = useState<School[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    COLLECTING: 0,
    READY: 0,
    MATCHED: 0,
    CORRESPONDING: 0,
    DONE: 0
  });
  const [showMatchingWorkflow, setShowMatchingWorkflow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminUser, setAdminUser] = useState<string>('');
  // Track which school pairs have pen pal assignments
  const [pairAssignments, setPairAssignments] = useState<{[key: string]: boolean}>({});
  
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
    
    for (const school of matchedSchools) {
      if (processed.has(school.id) || !school.matchedWithSchoolId) continue;
      
      const pairKey = [school.id, school.matchedWithSchoolId].sort().join('-');
      
      try {
        const response = await fetch(`/api/admin/download-pairings?schoolId=${school.id}`);
        if (response.ok) {
          const data = await response.json();
          
          const hasAssignments = data.pairings && data.pairings.some((pairing: any) => 
            pairing.penpalCount > 0 || (pairing.penpals && pairing.penpals.length > 0)
          );
          
          assignments[pairKey] = hasAssignments;
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
  };

  const handleSchoolsUpdate = async (updatedSchools: School[]) => {
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
          await fetchAllSchools();
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
          await fetchAllSchools();
        } else {
          alert('Error clearing data: ' + (data.error || 'Unknown error'));
        }
      } catch (err) {
        alert('Error clearing data: ' + err);
      }
    }
  };

  // Helper function to check if both schools are ready for pen pal assignment
  const areBothSchoolsReady = (school1: School, school2: School): boolean => {
    const validStatuses = ['READY', 'MATCHED'];
    return validStatuses.includes(school1.status) && validStatuses.includes(school2.status);
  };

  // Organize schools by workflow stage
  const organizeSchoolsByWorkflow = () => {
    const unmatched: School[] = [];
    const matchedPairs: SchoolPair[] = [];
    
    const processed = new Set<string>();

    schools.forEach(school => {
      if (processed.has(school.id)) return;

      if (!school.matchedWithSchoolId) {
        // Unmatched school
        unmatched.push(school);
      } else {
        // Matched school - find its pair
        const matchedSchoolFull = schools.find(s => s.id === school.matchedWithSchoolId);
        if (matchedSchoolFull && !processed.has(matchedSchoolFull.id)) {
          const pairKey = [school.id, matchedSchoolFull.id].sort().join('-');
          const hasStudentPairings = pairAssignments[pairKey] || false;
          const bothSchoolsReady = areBothSchoolsReady(school, matchedSchoolFull);

          matchedPairs.push({
            school1: school,
            school2: matchedSchoolFull,
            hasStudentPairings,
            bothSchoolsReady
          });

          processed.add(school.id);
          processed.add(matchedSchoolFull.id);
        }
      }
    });

    // Further categorize matched pairs
    const awaitingReadiness = matchedPairs.filter(pair => !pair.bothSchoolsReady);
    const readyForPairing = matchedPairs.filter(pair => pair.bothSchoolsReady && !pair.hasStudentPairings);
    const completePairs = matchedPairs.filter(pair => pair.hasStudentPairings);

    return {
      unmatched,
      awaitingReadiness,
      readyForPairing,
      completePairs
    };
  };

  // Component for displaying school pairs side-by-side
  const SchoolPairDisplay = ({ pair, showAssignButton = false }: { pair: SchoolPair, showAssignButton?: boolean }) => (
    <div style={{
      background: '#fff',
      border: '1px solid #e0e6ed',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '1rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: showAssignButton ? '1fr 1fr 220px' : '1fr 1fr',
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
            {pair.school1.schoolName}
          </h4>
          <div style={{ fontSize: '0.9rem', color: '#4a5568', marginBottom: '0.5rem' }}>
            <strong>{pair.school1.teacherName}</strong>
            <a 
              href={`mailto:${pair.school1.teacherEmail}`}
              style={{ marginLeft: '0.5rem', textDecoration: 'none', opacity: 0.7 }}
              title={pair.school1.teacherEmail}
            >
              ✉️
            </a>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#718096' }}>
            <strong>{pair.school1.region}</strong> | {pair.school1.studentCounts?.ready || 0} students | Starts {pair.school1.startMonth}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#a0aec0', marginTop: '0.25rem' }}>
            Status: <strong>{pair.school1.status}</strong>
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
            {pair.school2.schoolName}
          </h4>
          <div style={{ fontSize: '0.9rem', color: '#4a5568', marginBottom: '0.5rem' }}>
            <strong>{pair.school2.teacherName}</strong>
            <a 
              href={`mailto:${pair.school2.teacherEmail}`}
              style={{ marginLeft: '0.5rem', textDecoration: 'none', opacity: 0.7 }}
              title={pair.school2.teacherEmail}
            >
              ✉️
            </a>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#718096' }}>
            <strong>{pair.school2.region}</strong> | {pair.school2.studentCounts?.ready || 0} students | Starts {pair.school2.startMonth}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#a0aec0', marginTop: '0.25rem' }}>
            Status: <strong>{pair.school2.status}</strong>
          </div>
        </div>

        {/* Actions Column (only when showAssignButton is true) */}
        {showAssignButton && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <button
              onClick={() => handleAssignPenPals(pair.school1.id, pair.school2.id)}
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
          </div>
        )}

        {/* Pen Pal List Actions (for complete pairs) */}
        {pair.hasStudentPairings && !showAssignButton && (
          <div style={{ 
            gridColumn: showAssignButton ? '3 / 4' : '1 / 3',
            display: 'flex', 
            gap: '0.5rem',
            justifyContent: 'center',
            marginTop: '1rem'
          }}>
            <button
              onClick={() => window.open(`/admin/pen-pal-list?schoolId=${pair.school1.id}`, '_blank')}
              style={{
                color: '#2563eb',
                backgroundColor: 'white',
                border: '1px solid #2563eb',
                borderRadius: '4px',
                padding: '0.75rem',
                fontSize: '0.85rem',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <div style={{ fontWeight: '600' }}>{pair.school1.schoolName}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>View Pen Pal List</div>
            </button>
            
            <button
              onClick={() => window.open(`/admin/pen-pal-list?schoolId=${pair.school2.id}`, '_blank')}
              style={{
                color: '#2563eb',
                backgroundColor: 'white',
                border: '1px solid #2563eb',
                borderRadius: '4px',
                padding: '0.75rem',
                fontSize: '0.85rem',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <div style={{ fontWeight: '600' }}>{pair.school2.schoolName}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>View Pen Pal List</div>
            </button>
          </div>
        )}
      </div>
    </div>
  );

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

  // Show matching workflow if active
  if (showMatchingWorkflow) {
    const unmatchedSchools = schools.filter(school => !school.matchedWithSchoolId);
    
    return (
      <div className="page">
        <Header 
          session={{ user: { email: adminUser } }} 
          onLogout={handleAdminLogout} 
        />

        <main className="container" style={{ flex: 1, paddingTop: '1.5rem' }}>
          <MatchingWorkflow 
            schools={unmatchedSchools} 
            onSchoolsUpdate={handleSchoolsUpdate}
            onTabChange={() => setShowMatchingWorkflow(false)}
          />
        </main>
      </div>
    );
  }

  const { unmatched, awaitingReadiness, readyForPairing, completePairs } = organizeSchoolsByWorkflow();

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
            
            <button 
              onClick={() => setShowMatchingWorkflow(true)}
              className="btn"
              style={{ 
                backgroundColor: '#2563eb',
                color: 'white'
              }}
            >
              Match Schools
            </button>
            
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
              
              <button onClick={handleSeedData} className="btn btn-primary" style={{ margin: 0 }}>
                Seed Data
              </button>

              <button onClick={handleClearData} className="btn" style={{ backgroundColor: '#dc3545', color: 'white', margin: 0 }}>
                Clear Data
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '2rem' }}>
            <strong>Error:</strong> {error}
            <button onClick={fetchAllSchools} style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem' }}>
              Retry
            </button>
          </div>
        )}

        {/* Section 1: Schools Available for Matching */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: '#1f2937', marginBottom: '1rem', fontSize: '1.4rem' }}>
            Schools Available for Matching ({unmatched.length})
          </h2>
          {unmatched.length === 0 ? (
            <div style={{ 
              background: '#fff', border: '1px solid #e0e6ed', borderRadius: '12px',
              textAlign: 'center', padding: '2rem', color: '#6c757d'
            }}>
              All schools have been matched. New schools will appear here when added.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {unmatched.map(school => (
                <SchoolCard key={school.id} school={school} showActions={false} />
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Matched Schools Awaiting Student Readiness */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: '#1f2937', marginBottom: '1rem', fontSize: '1.4rem' }}>
            Matched Schools Awaiting Student Readiness ({awaitingReadiness.length})
          </h2>
          {awaitingReadiness.length === 0 ? (
            <div style={{ 
              background: '#fff', border: '1px solid #e0e6ed', borderRadius: '12px',
              textAlign: 'center', padding: '2rem', color: '#6c757d'
            }}>
              No matched schools are waiting for student data collection.
            </div>
          ) : (
            <div>
              {awaitingReadiness.map((pair, index) => (
                <SchoolPairDisplay key={`awaiting-${index}`} pair={pair} />
              ))}
            </div>
          )}
        </section>

        {/* Section 3: Matched Schools Ready for Pen Pal Assignment */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: '#1f2937', marginBottom: '1rem', fontSize: '1.4rem' }}>
            Ready for Pen Pal Assignment ({readyForPairing.length})
          </h2>
          {readyForPairing.length === 0 ? (
            <div style={{ 
              background: '#fff', border: '1px solid #e0e6ed', borderRadius: '12px',
              textAlign: 'center', padding: '2rem', color: '#6c757d'
            }}>
              No school pairs are ready for pen pal assignment.
            </div>
          ) : (
            <div>
              {readyForPairing.map((pair, index) => (
                <SchoolPairDisplay key={`ready-${index}`} pair={pair} showAssignButton={true} />
              ))}
            </div>
          )}
        </section>

        {/* Section 4: Complete Pairs with Assigned Pen Pals */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: '#1f2937', marginBottom: '1rem', fontSize: '1.4rem' }}>
            Complete Pairs with Assigned Pen Pals ({completePairs.length})
          </h2>
          {completePairs.length === 0 ? (
            <div style={{ 
              background: '#fff', border: '1px solid #e0e6ed', borderRadius: '12px',
              textAlign: 'center', padding: '2rem', color: '#6c757d'
            }}>
              No school pairs have completed pen pal assignments yet.
            </div>
          ) : (
            <div>
              {completePairs.map((pair, index) => (
                <SchoolPairDisplay key={`complete-${index}`} pair={pair} />
              ))}
            </div>
          )}
        </section>

      </main>

      <footer style={{ background: '#343a40', color: 'white', padding: '2rem 0', marginTop: '3rem' }}>
        <div className="container text-center">
          <p>&copy; 2024 The Right Back at You Project by Carolyn Mackler. Building empathy and connection through literature.</p>
        </div>
      </footer>
    </div>
  );
}
