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

  const handleAssignPenPals = (school1Id: number, school2Id: number) => {
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
          <div className="space-y-6">
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
              <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-blue-800">
                    Pinned School (Select a partner from below)
                  </h3>
                  <button
                    onClick={handleUnpin}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Unpin
                  </button>
                </div>
                <SchoolCard school={pinnedSchool} mode="pinned" />
              </div>
            )}

            {/* Schools Grid */}
            <div className="space-y-4">
              {pinnedSchool ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Available Partner Schools ({getAvailableSchools().length})
                  </h3>
                  {getAvailableSchools().length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No schools available for matching with the current filters.
                    </div>
                  ) : (
                    getAvailableSchools().map(school => (
                      <SchoolCard
                        key={school.id}
                        school={school}
                        mode="selectable"
                        onMatch={() => handleMatch(school)}
                      />
                    ))
                  )}
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Select a School to Pin ({filteredSchools.length} available)
                  </h3>
                  {filteredSchools.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No schools match the current filters.
                    </div>
                  ) : (
                    filteredSchools.map(school => (
                      <SchoolCard
                        key={school.id}
                        school={school}
                        mode="pinnable"
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
          <div className="space-y-6">
            {matchedPairs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No matched school pairs found.
              </div>
            ) : (
              matchedPairs.map(([school1, school2], index) => (
                <div key={`${school1.id}-${school2.id}`} className="border rounded-lg p-6 bg-white">
                  <div className="flex items-center justify-between">
                    {/* Two school cards side by side */}
                    <div className="flex gap-6 flex-1">
                      <div className="flex-1">
                        <SchoolCard 
                          school={school1} 
                          mode="matched"
                          partner={school2}
                        />
                      </div>
                      <div className="flex-1">
                        <SchoolCard 
                          school={school2} 
                          mode="matched"
                          partner={school1}
                        />
                      </div>
                    </div>
                    
                    {/* Assign Pen Pals Button */}
                    <div className="ml-6">
                      <button
                        onClick={() => handleAssignPenPals(school1.id, school2.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 whitespace-nowrap"
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
          <div className="space-y-6">
            {correspondingPairs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No corresponding school pairs found.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {correspondingPairs.map(([school1, school2]) => [school1, school2]).flat().map(school => (
                  <SchoolCard
                    key={school.id}
                    school={school}
                    mode="corresponding"
                    partner={schools.find(s => s.id === school.matchedWithSchoolId)}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'DONE':
        return (
          <div className="text-center py-12 text-gray-500">
            Program completed schools will be displayed here.
          </div>
        );

      default:
        return (
          <div className="text-center py-12 text-gray-500">
            Select a status to view schools.
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  );
};

export default MatchingWorkflow;
