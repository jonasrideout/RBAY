'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import SchoolCard from './SchoolCard';
import FilterBar from './FilterBar';
import ConfirmationDialog from './ConfirmationDialog';
import { School, Filters, SelectedStatus } from '../types';

interface MatchingWorkflowProps {
  schools: School[];
  onSchoolsUpdate: (schools: School[]) => Promise<void>;
  onTabChange?: (status: SelectedStatus) => void;
}

export default function MatchingWorkflow({ schools, onSchoolsUpdate, onTabChange }: MatchingWorkflowProps) {
  // Matching state
  const [pinnedSchool, setPinnedSchool] = useState<School | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<School | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [isMatched, setIsMatched] = useState(false);

  // Filter state - ENHANCED with search fields
  const [filters, setFilters] = useState<Filters>({
    schoolSearch: '',
    teacherSearch: '',
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
    { label: '21-30', min: 21, max: 30 },
    { label: '31-40', min: 31, max: 40 },
    { label: '41-50', min: 41, max: 50 },
    { label: 'Over 50', min: 51, max: 999 }
  ];

  // FIXED: Update pinned/selected schools when data refreshes to prevent stale ID issues
  useEffect(() => {
    if (pinnedSchool) {
      // Find the same school in the updated schools array by name (more reliable than ID)
      const updatedPinnedSchool = schools.find(s => 
        s.schoolName === pinnedSchool.schoolName && 
        s.teacherEmail === pinnedSchool.teacherEmail
      );
      if (updatedPinnedSchool && updatedPinnedSchool.id !== pinnedSchool.id) {
        console.log('Updating pinned school ID:', pinnedSchool.id, '->', updatedPinnedSchool.id);
        setPinnedSchool(updatedPinnedSchool);
      }
    }
    
    if (selectedMatch) {
      // Find the same school in the updated schools array by name (more reliable than ID)
      const updatedSelectedMatch = schools.find(s => 
        s.schoolName === selectedMatch.schoolName && 
        s.teacherEmail === selectedMatch.teacherEmail
      );
      if (updatedSelectedMatch && updatedSelectedMatch.id !== selectedMatch.id) {
        console.log('Updating selected match ID:', selectedMatch.id, '->', updatedSelectedMatch.id);
        setSelectedMatch(updatedSelectedMatch);
      }
    }
  }, [schools]);

  // Get all ready schools, excluding the pinned one
  const getAvailableSchools = () => {
    let availableSchools = schools.filter(school => school.status === 'READY');
    
    // Remove pinned school from the list
    if (pinnedSchool) {
      availableSchools = availableSchools.filter(school => school.id !== pinnedSchool.id);
    }
    
    return availableSchools;
  };

  // ENHANCED: Apply filters including search functionality
  const applyFilters = () => {
    let filtered = getAvailableSchools();

    // FIXED: Combined search logic - if both search fields have the same value, treat as combined search
    if (filters.schoolSearch && filters.teacherSearch && 
        filters.schoolSearch === filters.teacherSearch) {
      // Combined search: school name OR teacher name OR teacher email
      const searchTerm = filters.schoolSearch.toLowerCase().trim();
      filtered = filtered.filter(school => {
        const schoolName = school.schoolName.toLowerCase();
        const teacherName = school.teacherName.toLowerCase();
        const teacherEmail = school.teacherEmail.toLowerCase();
        return schoolName.includes(searchTerm) || 
               teacherName.includes(searchTerm) || 
               teacherEmail.includes(searchTerm);
      });
    } else {
      // Separate searches (legacy behavior for when fields differ)
      
      // School name search (case-insensitive, partial match)
      if (filters.schoolSearch && filters.schoolSearch.trim()) {
        const searchTerm = filters.schoolSearch.toLowerCase().trim();
        filtered = filtered.filter(school => 
          school.schoolName.toLowerCase().includes(searchTerm)
        );
      }

      // Teacher search (name OR email, case-insensitive, partial match)
      if (filters.teacherSearch && filters.teacherSearch.trim()) {
        const searchTerm = filters.teacherSearch.toLowerCase().trim();
        filtered = filtered.filter(school => {
          const teacherName = school.teacherName.toLowerCase();
          const teacherEmail = school.teacherEmail.toLowerCase();
          return teacherName.includes(searchTerm) || teacherEmail.includes(searchTerm);
        });
      }
    }

    // Region filtering
    if (filters.regions.length > 0) {
      filtered = filtered.filter(school => {
        const schoolRegion = String(school.region).toUpperCase();
        return filters.regions.some(filterRegion => 
          String(filterRegion).toUpperCase() === schoolRegion
        );
      });
    }

    // Class size filtering
    if (filters.classSizes.length > 0) {
      filtered = filtered.filter(school => {
        const studentCount = school.studentCounts?.ready || 0;
        return filters.classSizes.some(bucket => {
          const bucketData = classSizeBuckets.find(b => b.label === bucket);
          return bucketData && studentCount >= bucketData.min && studentCount <= bucketData.max;
        });
      });
    }

    // Start month filtering
    if (filters.startDate) {
      filtered = filtered.filter(school => school.startMonth === filters.startDate);
    }

    // Grade filtering
    if (filters.grades.length > 0) {
      filtered = filtered.filter(school => 
        filters.grades.some(grade => school.gradeLevel.includes(grade.replace('Grade ', '')))
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

  // ENHANCED: Clear filters function includes search fields
  const handleClearFilters = () => {
    const clearedFilters = {
      schoolSearch: '',
      teacherSearch: '',
      regions: [],
      classSizes: [],
      startDate: '',
      grades: []
    };
    setFilters(clearedFilters);
    setFiltersApplied(false);
    setFilteredSchools(getAvailableSchools());
  };

  // NEW: Auto-clear filters after pinning a school
  const autoClearFiltersAfterPinning = () => {
    const clearedFilters = {
      schoolSearch: '',
      teacherSearch: '',
      regions: [],
      classSizes: [],
      startDate: '',
      grades: []
    };
    setFilters(clearedFilters);
    setFiltersApplied(false);
    // Don't call setFilteredSchools here - let the useEffect handle it
  };

  const handlePinSchool = (school: School) => {
    if (pinnedSchool && pinnedSchool.id === school.id) {
      // Unpin if clicking the same school
      setPinnedSchool(null);
    } else {
      // Pin a new school
      setPinnedSchool(school);
      // AUTO-CLEAR: Clear all filters after successfully pinning a new school
      autoClearFiltersAfterPinning();
    }
    
    // Reapply filters after pinning/unpinning (this will respect the cleared filters)
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
    
    setIsMatched(false);
    setShowConfirmDialog(true);
  };

  const confirmMatch = async () => {
    if (!pinnedSchool || !selectedMatch) return;

    try {
      // Just confirm the match visually - no API call yet
      console.log('Match confirmed:', pinnedSchool.schoolName, 'with', selectedMatch.schoolName);
      
      // Set matched state to show new buttons in dialog
      setIsMatched(true);
      
    } catch (err) {
      console.error('Error confirming match:', err);
      alert('Error confirming match. Please try again.');
    }
  };

  const handleAssignPenPals = async () => {
    if (!pinnedSchool || !selectedMatch) return;

    try {
      console.log('Assigning pen pals with current IDs:', {
        pinnedSchoolId: pinnedSchool.id,
        selectedMatchId: selectedMatch.id
      });

      // UPDATED: Make actual API call to assign pen pals (which also updates school statuses)
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

      const result = await response.json();
      console.log('Pen pals assigned successfully:', result);

      // FIXED: Just refresh data from server without manipulating local state
      await onSchoolsUpdate([]);  // Empty array triggers fresh fetch in parent
      
      // Close dialog and reset state after successful assignment
      setTimeout(() => {
        setShowConfirmDialog(false);
        setSelectedMatch(null);
        setShowWarning(false);
        setIsMatched(false);
        setPinnedSchool(null);
        
        // Switch to MATCHED tab to show the 3-column layout
        if (onTabChange) {
          onTabChange('MATCHED');
        }
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

  // Update filtered schools when schools prop changes
  useEffect(() => {
    if (filtersApplied) {
      applyFilters();
    } else {
      // If no filters applied, show all available schools
      setFilteredSchools(getAvailableSchools());
    }
  }, [schools, pinnedSchool]);

  // CHANGED: Don't reset filters when no pinned school (requirement #1)
  useEffect(() => {
    // Only reset the region-specific logic, but keep other filters
    if (!pinnedSchool && filters.regions.some(r => r.startsWith('All except'))) {
      // Remove "All except" selections when unpinning
      const cleanedRegions = filters.regions.filter(r => !r.startsWith('All except'));
      setFilters(prev => ({ ...prev, regions: cleanedRegions }));
    }
  }, [pinnedSchool]);

  const displaySchools = filtersApplied ? filteredSchools : getAvailableSchools();

  // ADDED: Check if any filters are active
  const hasActiveFilters = filters.schoolSearch || filters.teacherSearch || 
    filters.regions.length > 0 || filters.classSizes.length > 0 || 
    filters.startDate || filters.grades.length > 0;

  return (
    <div>
      {/* Pinned School - Full Card Display - Sticky */}
      {pinnedSchool && (
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
            school={pinnedSchool!}
            isPinned={true}
            onPin={() => handlePinSchool(pinnedSchool!)}
          />
        </div>
      )}

      {/* CHANGED: Filters - Always show (requirement #1) */}
      <FilterBar 
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        pinnedSchoolRegion={pinnedSchool?.region}
      />

      {/* School Cards */}
      <h3 style={{ marginBottom: '1.5rem' }}>
        {pinnedSchool ? 'Select a School to Match' : 'Ready for Matching'} ({displaySchools.length})
        {hasActiveFilters && !pinnedSchool && (
          <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'normal' }}>
            {' '}- filtered results
          </span>
        )}
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
            {hasActiveFilters || pinnedSchool
              ? 'No schools match the current filters' 
              : 'No schools ready for matching'
            }
          </h4>
          <p style={{ color: '#6c757d' }}>
            {hasActiveFilters || pinnedSchool
              ? 'Try adjusting your filters or clear them to see all available schools.'
              : 'Schools will appear here when they\'re ready to be matched.'
            }
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
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
          isMatched={isMatched}
          onConfirm={confirmMatch}
          onCancel={cancelMatch}
          onAssignPenPals={handleAssignPenPals}
        />
      )}
    </div>
  );
}
