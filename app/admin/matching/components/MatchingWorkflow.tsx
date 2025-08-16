'use client';

import { useState, useEffect } from 'react';
import { School, Filters } from '../types';
import SchoolCard from './SchoolCard';
import FilterBar from './FilterBar';

interface MatchingWorkflowProps {
  schools: School[];
  selectedStatus: string;
  onRefresh: () => void;
}

const MatchingWorkflow = ({ schools, selectedStatus, onRefresh }: MatchingWorkflowProps) => {
  const [pinnedSchool, setPinnedSchool] = useState<School | null>(null);
  const [filters, setFilters] = useState<Filters>({
    schoolSearch: '',
    teacherSearch: '',
    regions: [],
    classSizes: [],
    startDate: '',
    grades: []
  });
  const [filteredSchools, setFilteredSchools] = useState<School[]>(schools);

  useEffect(() => {
    setFilteredSchools(schools);
  }, [schools]);

  const handlePin = (school: School) => {
    setPinnedSchool(school);
  };

  const handleUnpin = () => {
    setPinnedSchool(null);
  };

  const handleMatch = async (targetSchool: School) => {
    if (!pinnedSchool) return;
    
    // Check if same region
    const sameRegion = pinnedSchool.region === targetSchool.region;
    
    if (sameRegion) {
      const confirmed = window.confirm(
        `Warning: Both schools are in the ${pinnedSchool.region} region. Cross-regional matching is preferred for the program goals. Do you want to proceed anyway?`
      );
      if (!confirmed) return;
    }

    // Show confirmation dialog
    const matchConfirmed = window.confirm(
      `Match ${pinnedSchool.schoolName} with ${targetSchool.schoolName}?`
    );
    
    if (matchConfirmed) {
      try {
        // TODO: Replace with actual API call
        console.log('Matching schools:', pinnedSchool.id, targetSchool.id);
        
        // Ask about pen pal assignment
        const assignPenPals = window.confirm(
          'Schools matched successfully! Do you want to assign pen pals now?'
        );
        
        if (assignPenPals) {
          window.location.href = `/admin/matching/students?school1=${pinnedSchool.id}&school2=${targetSchool.id}`;
        } else {
          // Reset state and refresh
          setPinnedSchool(null);
          onRefresh();
        }
      } catch (error) {
        console.error('Error matching schools:', error);
        alert('Error matching schools. Please try again.');
      }
    }
  };

  const handleAssignPenPals = (school1Id: string, school2Id: string) => {
    window.location.href = `/admin/matching/students?school1=${school1Id}&school2=${school2Id}`;
  };

  const applyFilters = () => {
    let filtered = schools;

    // Apply search filters
    if (filters.schoolSearch.trim()) {
      filtered = filtered.filter(school =>
        school.schoolName.toLowerCase().includes(filters.schoolSearch.toLowerCase())
      );
    }

    if (filters.teacherSearch.trim()) {
      filtered = filtered.filter(school =>
        school.teacherFirstName.toLowerCase().includes(filters.teacherSearch.toLowerCase()) ||
        school.teacherLastName.toLowerCase().includes(filters.teacherSearch.toLowerCase()) ||
        school.teacherEmail.toLowerCase().includes(filters.teacherSearch.toLowerCase())
      );
    }

    // Apply other filters
    if (filters.regions.length > 0) {
      filtered = filtered.filter(school => filters.regions.includes(school.region));
    }

    if (filters.classSizes.length > 0) {
      filtered = filtered.filter(school => {
        const classSize = school.expectedClassSize;
        return filters.classSizes.some(size => {
          switch (size) {
            case 'under-10': return classSize < 10;
            case '10-20': return classSize >= 10 && classSize <= 20;
            case '20-30': return classSize >= 20 && classSize <= 30;
            case '30-40': return classSize >= 30 && classSize <= 40;
            case '40-50': return classSize >= 40 && classSize <= 50;
            case 'over-50': return classSize > 50;
            default: return false;
          }
        });
      });
    }

    if (filters.grades.length > 0) {
      filtered = filtered.filter(school =>
        filters.grades.some(grade => school.gradeLevel.includes(grade))
      );
    }

    if (filters.startDate) {
      filtered = filtered.filter(school => school.startMonth === filters.startDate);
    }

    setFilteredSchools(filtered);
  };

  const clearFilters = () => {
    setFilters({
      schoolSearch: '',
      teacherSearch: '',
      regions: [],
      classSizes: [],
      startDate: '',
      grades: []
    });
    setFilteredSchools(schools);
  };

  const getAvailableSchools = () => {
    if (!pinnedSchool) return filteredSchools;
    
    return filteredSchools.filter(school => 
      school.id !== pinnedSchool.id && 
      school.region !== pinnedSchool.region
    );
  };

  const renderContent = () => {
    switch (selectedStatus) {
      case 'COLLECTING':
      case 'READY':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Filter Bar */}
            <FilterBar
              filters={filters}
              onFiltersChange={setFilters}
              onApplyFilters={applyFilters}
              onClearFilters={clearFilters}
              pinnedSchoolRegion={pinnedSchool?.region}
            />

            {/* Pinned School Display */}
            {pinnedSchool && (
              <div style={{ 
                border: '2px solid #3b82f6', 
                borderRadius: '8px', 
                padding: '1rem', 
                backgroundColor: '#eff6ff' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e40af' }}>
                    Pinned School (Select a partner from below)
                  </h3>
                  <button
                    onClick={handleUnpin}
                    style={{ color: '#2563eb', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Unpin
                  </button>
                </div>
                <SchoolCard school={pinnedSchool} isPinned={true} onPin={handleUnpin} />
              </div>
            )}

            {/* Schools Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pinnedSchool ? (
                <>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151' }}>
                    Available Partner Schools ({getAvailableSchools().length})
                  </h3>
                  {getAvailableSchools().length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                      No schools available for matching with the current filters.
                    </div>
                  ) : (
                    getAvailableSchools().map(school => (
                      <SchoolCard
                        key={school.id}
                        school={school}
                        showMatchIcon={true}
                        onMatch={() => handleMatch(school)}
                      />
                    ))
                  )}
                </>
              ) : (
                <>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151' }}>
                    Select a School to Pin ({filteredSchools.length} available)
                  </h3>
                  {filteredSchools.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                      No schools match the current filters.
                    </div>
                  ) : (
                    filteredSchools.map(school => (
                      <SchoolCard
                        key={school.id}
                        school={school}
                        onPin={() => handlePin(school)}
                      />
                    ))
                  )}
                </>
              )}
            </div>
          </div>
        );

      case 'MATCHED':
        const matchedPairs = schools.reduce((pairs: Array<[School, School]>, school) => {
          if (school.matchedWithSchoolId && !pairs.some(pair => 
            pair[0].id === school.matchedWithSchoolId || pair[1].id === school.matchedWithSchoolId
          )) {
            const partner = schools.find(s => s.id === school.matchedWithSchoolId);
            if (partner) {
              pairs.push([school, partner]);
            }
          }
          return pairs;
        }, []);

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {matchedPairs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                No matched school pairs found.
              </div>
            ) : (
              matchedPairs.map(([school1, school2], index) => (
                <div key={`${school1.id}-${school2.id}`} style={{ 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px', 
                  padding: '1.5rem', 
                  backgroundColor: 'white' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Two school cards side by side */}
                    <div style={{ display: 'flex', gap: '1.5rem', flex: 1 }}>
                      <div style={{ flex: 1 }}>
                        <SchoolCard 
                          school={school1} 
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <SchoolCard 
                          school={school2} 
                        />
                      </div>
                    </div>
                    
                    {/* Assign Pen Pals Button */}
                    <div style={{ marginLeft: '1.5rem' }}>
                      <button
                        onClick={() => handleAssignPenPals(school1.id, school2.id)}
                        style={{
                          backgroundColor: '#2563eb',
                          color: 'white',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '8px',
                          fontWeight: '500',
                          transitionDuration: '200ms',
                          whiteSpace: 'nowrap',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                      >
                        Assign Pen Pals
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'CORRESPONDING':
        const correspondingPairs = schools.reduce((pairs: Array<[School, School]>, school) => {
          if (school.matchedWithSchoolId && !pairs.some(pair => 
            pair[0].id === school.matchedWithSchoolId || pair[1].id === school.matchedWithSchoolId
          )) {
            const partner = schools.find(s => s.id === school.matchedWithSchoolId);
            if (partner) {
              pairs.push([school, partner]);
            }
          }
          return pairs;
        }, []);

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {correspondingPairs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                No corresponding school pairs found.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                {correspondingPairs.map(([school1, school2]) => [school1, school2]).flat().map(school => (
                  <SchoolCard
                    key={school.id}
                    school={school}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'DONE':
        return (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            Program completed schools will be displayed here.
          </div>
        );

      default:
        return (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            Select a status to view schools.
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {renderContent()}
    </div>
  );
};

export default MatchingWorkflow;
