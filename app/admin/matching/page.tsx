"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import FilterBar from './components/FilterBar';
import ConfirmationDialog from './components/ConfirmationDialog';
import SchoolCard from './components/SchoolCard';
import SchoolPairDisplay from './components/SchoolPairDisplay';
import CreateGroupModal from './components/CreateGroupModal';
import GroupCard from './components/GroupCard';
import { School, SchoolGroup, MatchableUnit, MatchedPair, StatusCounts, Filters, isSchool, isGroup } from './types';

export default function AdminDashboard() {
  const [schools, setSchools] = useState<School[]>([]);
  const [groups, setGroups] = useState<SchoolGroup[]>([]);
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
  
  // Matching and filtering state
  const [pinnedUnit, setPinnedUnit] = useState<MatchableUnit | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchableUnit | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [isMatched, setIsMatched] = useState(false);
  
  // Group modal state
  const [showGroupModal, setShowGroupModal] = useState(false);
  
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
  const [filteredUnits, setFilteredUnits] = useState<MatchableUnit[]>([]);
  const [filtersApplied, setFiltersApplied] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    
    const initializeAdmin = async () => {
      try {
        const authResponse = await fetch('/api/admin/me');
        if (!authResponse.ok) {
          router.push('/admin/login');
          return;
        }
        const authData = await authResponse.json();
        if (mounted) {
          setAdminUser(authData.email);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        await fetchAllData();
      } catch (error) {
        console.error('Admin initialization failed:', error);
        router.push('/admin/login');
      }
    };

    initializeAdmin();

    return () => {
      mounted = false;
    };
  }, [router]);

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      router.push('/');
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/all-schools?v=3&t=${Date.now()}&r=${Math.random()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch data');
      }

      setSchools(data.schools || []);
      setGroups(data.groups || []);
      setStatusCounts(data.statusCounts || {
        COLLECTING: 0,
        READY: 0,
        MATCHED: 0,
        CORRESPONDING: 0,
        DONE: 0
      });

    } catch (err: any) {
      setError('Error fetching data: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchoolsUpdate = async () => {
    try {
      await fetchAllData();
      setPinnedUnit(null);
      setShowFilters(false);
      setFiltersApplied(false);
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to refresh data:', error);
      return Promise.resolve();
    }
  };

  const handleGroupCreated = async () => {
    setShowGroupModal(false);
    await fetchAllData();
  };

  const getStudentCount = (unit: MatchableUnit): number => {
    if (isGroup(unit)) {
      return unit.studentCounts.total;
    } else {
      return unit.studentCounts?.ready || 0;
    }
  };

  const unitHasPenPalAssignments = (unit: MatchableUnit): boolean => {
    return unit.penPalAssignments?.hasAssignments || false;
  };

  const isUnitReady = (unit: MatchableUnit): boolean => {
    if (isGroup(unit)) {
      return unit.isReadyForMatching && unit.penPalPreferences.meetsRequirement;
    } else {
      const validStatuses = ['READY', 'MATCHED'];
      return validStatuses.includes(unit.status) && 
             (unit.penPalPreferences?.meetsRequirement ?? true);
    }
  };

  const handleAssignPenPals = async (unit1: MatchableUnit, unit2: MatchableUnit) => {
    try {
      const body: any = {};
      
      if (isSchool(unit1)) {
        body.school1Id = unit1.id;
      } else {
        body.group1Id = unit1.id;
      }
      
      if (isSchool(unit2)) {
        body.school2Id = unit2.id;
      } else {
        body.group2Id = unit2.id;
      }

      const response = await fetch('/api/admin/assign-penpals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign pen pals');
      }

      fetchAllData();
      
    } catch (err: any) {
      console.error('Error assigning pen pals:', err);
      alert('Error assigning pen pals: ' + err.message);
    }
  };

  const handleUnmatchUnits = async (unit1: MatchableUnit, unit2: MatchableUnit) => {
    try {
      let unmatchId: string;
      
      if (isSchool(unit1)) {
        unmatchId = unit1.id;
      } else if (isSchool(unit2)) {
        unmatchId = unit2.id;
      } else {
        alert('Group unmatching not yet implemented');
        return;
      }

      const response = await fetch(`/api/admin/unmatch-schools?t=${Date.now()}&r=${Math.random()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolId: unmatchId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to unmatch');
      }

      await fetchAllData();
    } catch (error) {
      console.error('Error unmatching:', error);
      alert(error instanceof Error ? error.message : 'Failed to unmatch');
    }
  };

  const handlePinUnit = (unit: MatchableUnit) => {
    if (pinnedUnit && pinnedUnit.id === unit.id) {
      setPinnedUnit(null);
      setShowFilters(false);
      setFiltersApplied(false);
    } else {
      setPinnedUnit(unit);
      setShowFilters(true);
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

  const handleMatchRequest = (unit: MatchableUnit) => {
    if (!pinnedUnit) return;
    
    setSelectedMatch(unit);
    
    if (isSchool(pinnedUnit) && isSchool(unit)) {
      if (pinnedUnit.region === unit.region) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    } else {
      setShowWarning(false);
    }
    
    setIsMatched(false);
    setShowConfirmDialog(true);
  };

  const confirmMatch = async () => {
    if (!pinnedUnit || !selectedMatch) return;

    try {
      const body: any = {};
      
      if (isSchool(pinnedUnit)) {
        body.school1Id = pinnedUnit.id;
      } else {
        body.group1Id = pinnedUnit.id;
      }
      
      if (isSchool(selectedMatch)) {
        body.school2Id = selectedMatch.id;
      } else {
        body.group2Id = selectedMatch.id;
      }

      const response = await fetch('/api/admin/match-schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to match units');
      }

      setIsMatched(true);
      
    } catch (err) {
      console.error('Error matching units:', err);
      alert(`Error matching: ${err instanceof Error ? err.message : 'Please try again.'}`);
    }
  };

  const handleAssignPenPalsFromDialog = async () => {
    if (!pinnedUnit || !selectedMatch) return;
    await handleAssignPenPals(pinnedUnit, selectedMatch);
    
    setTimeout(() => {
      setShowConfirmDialog(false);
      setSelectedMatch(null);
      setShowWarning(false);
      setIsMatched(false);
    }, 1000);
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

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    const unmatchedSchools = schools.filter(school => 
      !school.schoolGroupId && !school.matchedWithSchoolId
    );
    
    const unmatchedGroups = groups.filter(group => 
      !group.matchedWithGroupId
    );
    
    let allUnmatched: MatchableUnit[] = [...unmatchedSchools, ...unmatchedGroups];

    if (filters.schoolSearch && filters.schoolSearch.trim()) {
      const searchTerm = filters.schoolSearch.toLowerCase().trim();
      
      allUnmatched = allUnmatched.filter(unit => {
        if (isSchool(unit)) {
          const schoolNameMatch = unit.schoolName?.toLowerCase().includes(searchTerm);
          const teacherNameMatch = unit.teacherName?.toLowerCase().includes(searchTerm);
          const teacherEmailMatch = unit.teacherEmail?.toLowerCase().includes(searchTerm);
          return schoolNameMatch || teacherNameMatch || teacherEmailMatch;
        } else {
          const groupNameMatch = unit.name.toLowerCase().includes(searchTerm);
          const schoolsMatch = unit.schools.some(school =>
            school.schoolName.toLowerCase().includes(searchTerm) ||
            school.teacherName.toLowerCase().includes(searchTerm)
          );
          return groupNameMatch || schoolsMatch;
        }
      });
    }

    if (filters.regions.length > 0) {
      allUnmatched = allUnmatched.filter(unit => {
        if (isSchool(unit)) {
          const schoolRegion = String(unit.region).toUpperCase();
          return filters.regions.some(filterRegion => 
            String(filterRegion).toUpperCase() === schoolRegion
          );
        }
        return true;
      });
    }

    if (filters.statuses.length > 0) {
      allUnmatched = allUnmatched.filter(unit => {
        if (isSchool(unit)) {
          return filters.statuses.includes(unit.status);
        }
        return true;
      });
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
      
      allUnmatched = allUnmatched.filter(unit => {
        const studentCount = getStudentCount(unit);
        return filters.classSizes.some(bucket => {
          const bucketData = classSizeBuckets.find(b => b.label === bucket);
          return bucketData && studentCount >= bucketData.min && studentCount <= bucketData.max;
        });
      });
    }

    if (filters.startDate) {
      allUnmatched = allUnmatched.filter(unit => {
        if (isSchool(unit)) {
          return unit.startMonth === filters.startDate;
        }
        return true;
      });
    }

    if (filters.grades.length > 0) {
      allUnmatched = allUnmatched.filter(unit => {
        if (isSchool(unit)) {
          return filters.grades.some(grade => 
            unit.gradeLevel.includes(grade.replace('Grade ', ''))
          );
        }
        return true;
      });
    }

    setFilteredUnits(allUnmatched);
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
    setFilteredUnits([]);
  };

  const organizeUnitsByWorkflow = () => {
    const unmatched: MatchableUnit[] = [];
    const matchedPairs: MatchedPair[] = [];
    
    const processedSchools = new Set<string>();
    const processedGroups = new Set<string>();

    schools.forEach(school => {
      if (processedSchools.has(school.id) || school.schoolGroupId) return;

      if (!school.matchedWithSchoolId) {
        unmatched.push(school);
      } else {
        const matchedSchoolFull = schools.find(s => s.id === school.matchedWithSchoolId);
        
        if (matchedSchoolFull && !processedSchools.has(matchedSchoolFull.id)) {
          const hasStudentPairings = unitHasPenPalAssignments(school) || unitHasPenPalAssignments(matchedSchoolFull);
          const bothUnitsReady = isUnitReady(school) && isUnitReady(matchedSchoolFull);

          matchedPairs.push({
            unit1: school,
            unit2: matchedSchoolFull,
            hasStudentPairings,
            bothUnitsReady,
            matchType: 'school-school'
          });

          processedSchools.add(school.id);
          processedSchools.add(matchedSchoolFull.id);
        }
      }
    });

    groups.forEach(group => {
      if (processedGroups.has(group.id)) return;

      if (!group.matchedWithGroupId) {
        unmatched.push(group);
      } else {
        if (group.matchedWithGroupId.startsWith('school:')) {
          const schoolId = group.matchedWithGroupId.replace('school:', '');
          const matchedSchool = schools.find(s => s.id === schoolId);
          
          if (matchedSchool && !processedSchools.has(matchedSchool.id)) {
            const hasStudentPairings = unitHasPenPalAssignments(group) || unitHasPenPalAssignments(matchedSchool);
            const bothUnitsReady = isUnitReady(group) && isUnitReady(matchedSchool);

            matchedPairs.push({
              unit1: group,
              unit2: matchedSchool,
              hasStudentPairings,
              bothUnitsReady,
              matchType: 'group-school'
            });

            processedGroups.add(group.id);
            processedSchools.add(matchedSchool.id);
          }
        } else {
          const matchedGroup = groups.find(g => g.id === group.matchedWithGroupId);
          
          if (matchedGroup && !processedGroups.has(matchedGroup.id)) {
            const hasStudentPairings = unitHasPenPalAssignments(group) || unitHasPenPalAssignments(matchedGroup);
            const bothUnitsReady = isUnitReady(group) && isUnitReady(matchedGroup);

            matchedPairs.push({
              unit1: group,
              unit2: matchedGroup,
              hasStudentPairings,
              bothUnitsReady,
              matchType: 'group-group'
            });

            processedGroups.add(group.id);
            processedGroups.add(matchedGroup.id);
          }
        }
      }
    });

    const awaitingReadiness = matchedPairs.filter(pair => !pair.bothUnitsReady);
    const readyForPairing = matchedPairs.filter(pair => pair.bothUnitsReady && !pair.hasStudentPairings);
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

  const { unmatched, awaitingReadiness, readyForPairing, completePairs } = organizeUnitsByWorkflow();
  
  let unmatchedToShow = filtersApplied ? filteredUnits : unmatched;
  if (pinnedUnit) {
    unmatchedToShow = unmatchedToShow.filter(unit => unit.id !== pinnedUnit.id);
  }

  const availableForGrouping = schools.filter(school => !school.schoolGroupId);

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
          alignItems: 'flex-start',
          marginBottom: '1.5rem' 
        }}>
          <div>
            <h1 className="text-school-name" style={{ marginBottom: '0.5rem' }}>
              Administrator Dashboard
            </h1>
            <p className="text-meta-info" style={{ margin: 0 }}>
              Overview of all schools and their progress through the program.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link href="/register-school?admin=true" className="btn btn-primary">
              Add School
            </Link>
            
            <button 
              onClick={() => setShowGroupModal(true)}
              className="btn btn-primary"
              style={{ minWidth: '130px' }}
            >
              Create Group
            </button>
            
            <button 
              onClick={() => {
                if (showFilters) {
                  handleClearFilters();
                  setShowFilters(false);
                } else {
                  setShowFilters(true);
                }
              }}
              className="btn btn-primary"
              style={{ minWidth: '160px' }}
            >
              {showFilters ? 'Hide Filters' : 'Search for Schools'}  
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '2rem' }}>
            <strong>Error:</strong> {error}
            <button onClick={fetchAllData} style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem' }}>
              Retry
            </button>
          </div>
        )}

        {pinnedUnit && (
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
              Pinned {isGroup(pinnedUnit) ? 'Group' : 'School'} - Select a match below
            </h3>
            {isSchool(pinnedUnit) ? (
              <SchoolCard
                school={pinnedUnit}
                isPinned={true}
                onPin={() => handlePinUnit(pinnedUnit)}
                showActions={true}
                onUpdate={handleSchoolsUpdate}
              />
            ) : (
              <GroupCard
                group={pinnedUnit}
                isPinned={true}
                onPin={() => handlePinUnit(pinnedUnit)}
                showActions={true}
              />
            )}
          </div>
        )}

        {showFilters && (
          <div style={{ marginBottom: '2rem' }}>
            <FilterBar 
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
              pinnedSchoolRegion={pinnedUnit && isSchool(pinnedUnit) ? pinnedUnit.region : undefined}
            />
          </div>
        )}

        <section style={{ marginBottom: '3rem' }}>
          <h2 className="text-teacher-name" style={{ marginBottom: '1rem', fontSize: '16px' }}>
            Schools & Groups Available for Matching ({unmatchedToShow.length})
          </h2>
          {unmatchedToShow.length === 0 ? (
            <div style={{ 
              background: '#fff', border: '1px solid #e0e6ed', borderRadius: '12px',
              textAlign: 'center', padding: '2rem', color: '#6c757d'
            }}>
              {filtersApplied 
                ? 'No schools or groups match the current filters. Try adjusting your search criteria.'
                : 'All schools and groups have been matched. New ones will appear here when added.'
              }
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {unmatchedToShow.map(unit => (
                isSchool(unit) ? (
                  <SchoolCard 
                    key={`school-${unit.id}`}
                    school={unit} 
                    showActions={true}
                    isPinned={pinnedUnit?.id === unit.id}
                    showMatchIcon={!!pinnedUnit && pinnedUnit.id !== unit.id}
                    onPin={() => handlePinUnit(unit)}
                    onMatch={() => handleMatchRequest(unit)}
                    onUpdate={handleSchoolsUpdate}
                  />
                ) : (
                  <GroupCard
                    key={`group-${unit.id}`}
                    group={unit}
                    showActions={true}
                    isPinned={pinnedUnit?.id === unit.id}
                    showMatchIcon={!!pinnedUnit && pinnedUnit.id !== unit.id}
                    onPin={() => handlePinUnit(unit)}
                    onMatch={() => handleMatchRequest(unit)}
                  />
                )
              ))}
            </div>
          )}
        </section>

        {!filtersApplied && (
          <>
            <section style={{ marginBottom: '3rem' }}>
              <h2 className="text-teacher-name" style={{ marginBottom: '1rem', fontSize: '16px' }}>
                Matched Pairs Awaiting Student Readiness ({awaitingReadiness.length})
              </h2>
              {awaitingReadiness.length === 0 ? (
                <div style={{ 
                  background: '#fff', border: '1px solid #e0e6ed', borderRadius: '12px',
                  textAlign: 'center', padding: '2rem', color: '#6c757d'
                }}>
                  No matched pairs are waiting for student data collection.
                </div>
              ) : (
                <div>
                  {awaitingReadiness.map((pair, index) => (
                    <SchoolPairDisplay 
                      key={`awaiting-${index}`} 
                      pair={pair} 
                      onAssignPenPals={() => handleAssignPenPals(pair.unit1, pair.unit2)}
                      onUnmatch={() => handleUnmatchUnits(pair.unit1, pair.unit2)}
                    />
                  ))}
                </div>
              )}
            </section>

            <section style={{ marginBottom: '3rem' }}>
              <h2 className="text-teacher-name" style={{ marginBottom: '1rem', fontSize: '16px' }}>
                Ready for Pen Pal Assignment ({readyForPairing.length})
              </h2>
              {readyForPairing.length === 0 ? (
                <div style={{ 
                  background: '#fff', border: '1px solid #e0e6ed', borderRadius: '12px',
                  textAlign: 'center', padding: '2rem', color: '#6c757d'
                }}>
                  No pairs are ready for pen pal assignment.
                </div>
              ) : (
                <div>
                  {readyForPairing.map((pair, index) => (
                    <SchoolPairDisplay 
                      key={`ready-${index}`} 
                      pair={pair} 
                      showAssignButton={true} 
                      onAssignPenPals={() => handleAssignPenPals(pair.unit1, pair.unit2)}
                      onUnmatch={() => handleUnmatchUnits(pair.unit1, pair.unit2)}
                    />
                  ))}
                </div>
              )}
            </section>

            <section style={{ marginBottom: '3rem' }}>
              <h2 className="text-teacher-name" style={{ marginBottom: '1rem', fontSize: '16px' }}>
                Complete Pairs with Assigned Pen Pals ({completePairs.length})
              </h2>
              {completePairs.length === 0 ? (
                <div style={{ 
                  background: '#fff', border: '1px solid #e0e6ed', borderRadius: '12px',
                  textAlign: 'center', padding: '2rem', color: '#6c757d'
                }}>
                  No pairs have completed pen pal assignments yet.
                </div>
              ) : (
                <div>
                  {completePairs.map((pair, index) => (
                    <SchoolPairDisplay 
                      key={`complete-${index}`} 
                      pair={pair} 
                      onAssignPenPals={() => handleAssignPenPals(pair.unit1, pair.unit2)}
                      onUnmatch={() => handleUnmatchUnits(pair.unit1, pair.unit2)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e9ecef' }}>
          <Link 
            href="/admin/testing" 
            style={{ 
              fontSize: '12px', 
              color: '#999', 
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              border: '1px solid #e9ecef',
              borderRadius: '4px',
              display: 'inline-block'
            }}
          >
            Testing Tools
          </Link>
        </div>

      </main>

      {showConfirmDialog && pinnedUnit && selectedMatch && (
        <ConfirmationDialog
          pinnedSchool={isSchool(pinnedUnit) ? pinnedUnit : null}
          selectedMatch={isSchool(selectedMatch) ? selectedMatch : null}
          pinnedGroup={isGroup(pinnedUnit) ? pinnedUnit : null}
          selectedGroup={isGroup(selectedMatch) ? selectedMatch : null}
          showWarning={showWarning}
          isMatched={isMatched}
          onConfirm={confirmMatch}
          onCancel={cancelMatch}
          onAssignPenPals={handleAssignPenPalsFromDialog}
          onClose={handleCloseAfterMatch}
        />
      )}

      {showGroupModal && (
        <CreateGroupModal
          availableSchools={availableForGrouping}
          onClose={() => setShowGroupModal(false)}
          onGroupCreated={handleGroupCreated}
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
