// app/admin/matching/page.tsx 
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import FilterBar from './components/FilterBar';
import ConfirmationDialog from './components/ConfirmationDialog';
import SchoolCard from './components/SchoolCard';
import SchoolPairDisplay from './components/SchoolPairDisplay';
import { School, StatusCounts, Filters } from './types';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminUser, setAdminUser] = useState<string>('');
  
  // Track which school pairs have pen pal assignments
  const [pairAssignments, setPairAssignments] = useState<{[key: string]: boolean}>({});
  
  // Matching and filtering state
  const [pinnedSchool, setPinnedSchool] = useState<School | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<School | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [isMatched, setIsMatched] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState<Filters>({
    schoolSearch: '',
    teacherSearch: '',
    regions: [],
    statuses: [],
    classSizes: [],
    startDate: '',
    grades: []
  });
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [filtersApplied, setFiltersApplied] = useState(false);
  
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

  const handleSchoolsUpdate = async () => {
    try {
      await fetchAllSchools();
      // Clear matching state after successful update
      setPinnedSchool(null);
      setShowFilters(false);
      setFiltersApplied(false);
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

  // Seed and clear operations
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

  // Matching workflow functions
  const handlePinSchool = (school: School) => {
    if (pinnedSchool && pinnedSchool.id === school.id) {
      // Unpin if clicking the same school
      setPinnedSchool(null);
      setShowFilters(false);
      setFiltersApplied(false);
    } else {
      // Pin a new school and show filters
      setPinnedSchool(school);
      setShowFilters(true);
      // Clear any existing filters
      setFilters({
        schoolSearch: '',
        teacherSearch: '',
        regions: [],
        statuses: [],
        classSizes: [],
        startDate: '',
        grades: []
      });
      setFiltersApplied(false);
    }
  };

  const handleMatchRequest = (school: School) => {
    if (!pinnedSchool) return;
    
    setSelectedMatch(school);
    
    // Check if same region for warning
    if (pinnedSchool.region === school.region) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
    
    setIsMatched(false);
    setShowConfirmDialog(true);
  };

  const confirmMatch = async () => {
    if (!pinnedSchool || !selectedMatch) return;

    try {
      const response = await fetch('/api/admin/match-schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          school1Id: pinnedSchool.id,
          school2Id: selectedMatch.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to match schools');
      }

      setIsMatched(true);
      
    } catch (err) {
      console.error('Error matching schools:', err);
      alert(`Error matching schools: ${err instanceof Error ? err.message : 'Please try again.'}`);
    }
  };

  const handleAssignPenPalsFromDialog = async () => {
    if (!pinnedSchool || !selectedMatch) return;

    try {
      const response = await fetch('/api/admin/assign-penpals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          school1Id: pinnedSchool.id,
          school2Id: selectedMatch.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign pen pals');
      }

      // Refresh data and close dialog
      await handleSchoolsUpdate();
      
      setTimeout(() => {
        setShowConfirmDialog(false);
        setSelectedMatch(null);
        setShowWarning(false);
        setIsMatched(false);
      }, 1000);
      
    } catch (err) {
      console.error('Error assigning pen pals:', err);
      alert(`Error assigning pen pals: ${err instanceof Error ? err.message : 'Please try again.'}`);
    }
  };

  const cancelMatch = () => {
    setShowConfirmDialog(false);
    setSelectedMatch(null);
    setShowWarning(false);
    setIsMatched(false);
  };

  const handleCloseAfterMatch = async () => {
    await handleSchoolsUpdate();
    setShowConfirmDialog(false);
    setSelectedMatch(null);
    setShowWarning(false);
    setIsMatched(false);
  };

  // Filter handling
  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    // Get all unmatched schools (across all sections)
    const unmatchedSchools = schools.filter(school => !school.matchedWithSchoolId);
    
    let filtered = unmatchedSchools;

    // Apply filters (same logic as MatchingWorkflow)
    if (filters.schoolSearch && filters.schoolSearch.trim()) {
      const searchTerm = filters.schoolSearch.toLowerCase().trim();
      filtered = filtered.filter(school => 
        school.schoolName.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.teacherSearch && filters.teacherSearch.trim()) {
      const searchTerm = filters.teacherSearch.toLowerCase().trim();
      filtered = filtered.filter(school => {
        const teacherName = school.teacherName.toLowerCase();
        const teacherEmail = school.teacherEmail.toLowerCase();
        return teacherName.includes(searchTerm) || teacherEmail.includes(searchTerm);
      });
    }

    if (filters.regions.length > 0) {
      filtered = filtered.filter(school => {
        const schoolRegion = String(school.region).toUpperCase();
        return filters.regions.some(filterRegion => 
          String(filterRegion).toUpperCase() === schoolRegion
        );
      });
    }

    if (filters.statuses.length > 0) {
      filtered = filtered.filter(school => 
        filters.statuses.includes(school.status)
      );
    }

    if (filters.classSizes.length > 0) {
      const classSizeBuckets = [
        { label: 'Under 10', min: 0, max: 9 },
        { label: '10-20', min: 10, max: 20 },
        { label: '21-30', min: 21, max: 30 },
        { label: '31-40', min: 31, max: 40 },
        { label: '41-50', min: 41, max: 50 },
        { label: 'Over 50', min: 51, max: 999 }
      ];
      
      filtered = filtered.filter(school => {
        const studentCount = school.studentCounts?.ready || 0;
        return filters.classSizes.some(bucket => {
          const bucketData = classSizeBuckets.find(b => b.label === bucket);
          return bucketData && studentCount >= bucketData.min && studentCount <= bucketData.max;
        });
      });
    }

    if (filters.startDate) {
      filtered = filtered.filter(school => school.startMonth === filters.startDate);
    }

    if (filters.grades.length > 0) {
      filtered = filtered.filter(school => 
        filters.grades.some(grade => school.gradeLevel.includes(grade.replace('Grade ', '')))
      );
    }

    setFilteredSchools(filtered);
    setFiltersApplied(true);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      schoolSearch: '',
      teacherSearch: '',
      regions: [],
      statuses: [],
      classSizes: [],
      startDate: '',
      grades: []
    };
    setFilters(clearedFilters);
    setFiltersApplied(false);
    setFilteredSchools([]);
  };

  // Organize schools by workflow stage
  const organizeSchoolsByWorkflow = () => {
    const unmatched: School[] = [];
    const matchedPairs: SchoolPair[] = [];
    
    const processed = new Set<string>();

    schools.forEach(school => {
      if (processed.has(school.id)) return;

      if (!school.matchedWithSchoolId) {
        unmatched.push(school);
      } else {
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

  const { unmatched, awaitingReadiness, readyForPairing, completePairs } = organizeSchoolsByWorkflow();
  
  // Get schools to display (filtered or unmatched, excluding pinned school)
  let unmatchedToShow = filtersApplied ? filteredSchools : unmatched;
  // Remove pinned school from the list
  if (pinnedSchool) {
    unmatchedToShow = unmatchedToShow.filter(school => school.id !== pinnedSchool.id);
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
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/register-school?admin=true" className="btn btn-primary">
              Add School
            </Link>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-primary btn-toggle"
            >
            {showFilters ? 'Hide Filters' : 'Search for Schools'}  
            </button>
            
            <div style={{
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '8px',
              position: 'relative',
              display: 'flex',
              gap: '8px'
            }}>
              <span style={{
                position: 'absolute',
                top: '-8px',
                left: '8px',
                backgroundColor: 'white',
                padding: '0 4px',
                fontSize: '11px',
                color: '#6b7280',
                fontWeight: '400'
              }}>
                Temporary Testing Buttons
              </span>
              
              <button onClick={handleSeedData} className="btn btn-primary">
                Seed Data
              </button>

              <button onClick={handleClearData} className="btn btn-danger">
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

        {/* Pinned School Display */}
        {pinnedSchool && (
          <div style={{ 
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: 'white',
            paddingBottom: '1rem',
            marginBottom: '1rem',
            borderBottom: '2px solid #e5e7eb'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#1976d2', marginTop: 0 }}>
              📌 Pinned School - Select a match below
            </h3>
            <SchoolCard
              school={pinnedSchool}
              isPinned={true}
              onPin={() => handlePinSchool(pinnedSchool)}
              showActions={true}
            />
          </div>
        )}

        {/* Filter Bar */}
        {showFilters && (
          <div style={{ marginBottom: '2rem' }}>
            <FilterBar 
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
              pinnedSchoolRegion={pinnedSchool?.region}
            />
          </div>
        )}

        {/* Section 1: Schools Available for Matching */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: '#1f2937', marginBottom: '1rem', fontSize: '1.4rem' }}>
            Schools Available for Matching ({unmatchedToShow.length})
          </h2>
          {unmatchedToShow.length === 0 ? (
            <div style={{ 
              background: '#fff', border: '1px solid #e0e6ed', borderRadius: '12px',
              textAlign: 'center', padding: '2rem', color: '#6c757d'
            }}>
              {filtersApplied 
                ? 'No schools match the current filters. Try adjusting your search criteria.'
                : 'All schools have been matched. New schools will appear here when added.'
              }
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {unmatchedToShow.map(school => (
                <SchoolCard 
                  key={school.id} 
                  school={school} 
                  showActions={true}
                  isPinned={pinnedSchool?.id === school.id}
                  showMatchIcon={!!pinnedSchool && pinnedSchool.id !== school.id}
                  onPin={() => handlePinSchool(school)}
                  onMatch={() => handleMatchRequest(school)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Only show other sections when not filtering */}
        {!filtersApplied && (
          <>
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
                    <SchoolPairDisplay 
                      key={`awaiting-${index}`} 
                      pair={pair} 
                      onAssignPenPals={handleAssignPenPals}
                    />
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
                    <SchoolPairDisplay 
                      key={`ready-${index}`} 
                      pair={pair} 
                      showAssignButton={true} 
                      onAssignPenPals={handleAssignPenPals}
                    />
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
                    <SchoolPairDisplay 
                      key={`complete-${index}`} 
                      pair={pair} 
                      onAssignPenPals={handleAssignPenPals}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

      </main>

      {showConfirmDialog && pinnedSchool && selectedMatch && (
        <ConfirmationDialog
          pinnedSchool={pinnedSchool}
          selectedMatch={selectedMatch}
          showWarning={showWarning}
          isMatched={isMatched}
          onConfirm={confirmMatch}
          onCancel={cancelMatch}
          onAssignPenPals={handleAssignPenPalsFromDialog}
          onClose={handleCloseAfterMatch}
        />
      )}

      <footer style={{ background: '#343a40', color: 'white', padding: '2rem 0', marginTop: '3rem' }}>
        <div className="container text-center">
          <p>&copy; 2024 The Right Back at You Project by Carolyn Mackler. Building empathy and connection through literature.</p>
        </div>
      </footer>
    </div>
  );
}
