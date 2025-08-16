// app/admin/matching/components/MatchingWorkflow.tsx
"use client";

import React, { useState, useEffect } from 'react';
import SchoolCard from './SchoolCard';
import FilterBar from './FilterBar';
import ConfirmationDialog from './ConfirmationDialog';
import { School, Filters } from '../types';

interface MatchingWorkflowProps {
  schools: School[];
  onSchoolsUpdate: (schools: School[]) => void;
}

export default function MatchingWorkflow({ schools, onSchoolsUpdate }: MatchingWorkflowProps) {
  // Matching state
  const [pinnedSchool, setPinnedSchool] = useState<School | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<School | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<Filters>({
    regions: [],
    classSizes: [],
    startDate: '',
    grades: []
  });

  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [filtersApplied, setFiltersApplied] = useState(false);

  const classSizeBuckets = [
    { label: 'Under 10', min: 0, max: 9 },
    { label: '10-20', min: 10, max: 20 },
    { label: '20-30', min: 20, max: 30 },
    { label: '30-40', min: 30, max: 40 },
    { label: '40-50', min: 40, max: 50 },
    { label: 'Over 50', min: 51, max: 999 }
  ];

  // Get all ready schools, excluding the pinned one
  const getAvailableSchools = () => {
    let availableSchools = schools.filter(school => school.status === 'READY');
    
    // Remove pinned school from the list
    if (pinnedSchool) {
      availableSchools = availableSchools.filter(school => school.id !== pinnedSchool.id);
    }
    
    return availableSchools;
  };

  // Apply filters to the available schools
  const applyFilters = () => {
    let filtered = getAvailableSchools();

    if (filters.regions.length > 0) {
      filtered = filtered.filter(school => filters.regions.includes(school.region));
    }

    if (filters.classSizes.length > 0) {
      filtered = filtered.filter(school => {
        const studentCount = school.studentCounts.ready;
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
        filters.grades.some(grade => school.gradeLevel.includes(grade))
      );
    }

    setFilteredSchools(filtered);
    setFiltersApplied(true);
  };

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    applyFilters();
  };

  const handlePinSchool = (school: School) => {
    if (pinnedSchool && pinnedSchool.id === school.id) {
      // Unpin if clicking the same school
      setPinnedSchool(null);
    } else {
      setPinnedSchool(school);
    }
    
    // Reapply filters after pinning/unpinning
    if (filtersApplied) {
      applyFilters();
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
    
    setShowConfirmDialog(true);
  };

  const confirmMatch = async () => {
    if (!pinnedSchool || !selectedMatch) return;

    try {
      // TODO: Replace with actual API call
      console.log('Matching schools:', pinnedSchool, selectedMatch);
      
      // Update school statuses locally
      const updatedSchools = schools.map(school => {
        if (school.id === pinnedSchool.id || school.id === selectedMatch.id) {
          return { ...school, status: 'MATCHED' as const };
        }
        return school;
      });
      
      // Notify parent component
      onSchoolsUpdate(updatedSchools);
      
      // Reset state
      setPinnedSchool(null);
      setShowConfirmDialog(false);
      setSelectedMatch(null);
      setShowWarning(false);
      
    } catch (err) {
      console.error('Error matching schools:', err);
    }
  };

  const cancelMatch = () => {
    setShowConfirmDialog(false);
    setSelectedMatch(null);
    setShowWarning(false);
  };

  // Update filtered schools when schools prop changes
  useEffect(() => {
    if (filtersApplied) {
      applyFilters();
    } else {
      // If no filters applied, show all available schools
      setFilteredSchools(getAvailableSchools());
    }
  }, [schools, pinnedSchool]);

  // Reset filters when no pinned school
  useEffect(() => {
    if (!pinnedSchool) {
      setFilters({
        regions: [],
        classSizes: [],
        startDate: '',
        grades: []
      });
      setFiltersApplied(false);
      setFilteredSchools(getAvailableSchools());
    }
  }, [pinnedSchool]);

  const displaySchools = filtersApplied ? filteredSchools : getAvailableSchools();

  return (
    <div>
      {/* Pinned School - Full Card Display - Sticky */}
      {pinnedSchool && (() => {
        const currentPinnedSchool = pinnedSchool;
        return (
          <div style={{ 
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: 'white',
            paddingBottom: '1rem',
            marginBottom: '1rem'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#1976d2', marginTop: 0 }}>
              📌 Pinned School - Select a match below
            </h3>
            <SchoolCard
              school={currentPinnedSchool}
              isPinned={false}
              onPin={() => handlePinSchool(currentPinnedSchool)}
            />
          </div>
        );
      })()}

      {/* Filters - Only show when a school is pinned */}
      {pinnedSchool && (
        <FilterBar 
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onApplyFilters={handleApplyFilters}
        />
      )}

      {/* School Cards */}
      <h3 style={{ marginBottom: '1.5rem' }}>
        {pinnedSchool ? 'Select a School to Match' : 'Ready for Matching'} ({displaySchools.length})
      </h3>
      
      {displaySchools.length === 0 ? (
        <div style={{ 
          background: '#fff',
          border: '1px solid #e0e6ed',
          borderRadius: '12px',
          textAlign: 'center', 
          padding: '3rem' 
        }}>
          <h4>
            {pinnedSchool 
              ? 'No schools match the current filters' 
              : 'No schools ready for matching'
            }
          </h4>
          <p style={{ color: '#6c757d' }}>
            {pinnedSchool 
              ? 'Try adjusting your filters or clear them to see all available schools.'
              : 'Schools will appear here when they\'re ready to be matched.'
            }
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))', 
          gap: '1rem' 
        }}>
          {displaySchools.map(school => (
            <SchoolCard
              key={school.id}
              school={school}
              isPinned={false}
              showMatchIcon={!!pinnedSchool}
              onPin={() => handlePinSchool(school)}
              onMatch={() => handleMatchRequest(school)}
            />
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && pinnedSchool && selectedMatch && (
        <ConfirmationDialog
          pinnedSchool={pinnedSchool}
          selectedMatch={selectedMatch}
          showWarning={showWarning}
          onConfirm={confirmMatch}
          onCancel={cancelMatch}
        />
      )}
    </div>
  );
}
