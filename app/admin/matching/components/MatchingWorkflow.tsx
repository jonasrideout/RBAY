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

  // Apply filters whenever filters change
  const applyFilters = (newFilters: Filters, schoolsList: School[]) => {
    let filtered = schoolsList.filter(school => school.status === 'READY');

    const classSizeBuckets = [
      { label: 'Under 10', min: 0, max: 9 },
      { label: '10-20', min: 10, max: 20 },
      { label: '20-30', min: 20, max: 30 },
      { label: '30-40', min: 30, max: 40 },
      { label: '40-50', min: 40, max: 50 },
      { label: 'Over 50', min: 51, max: 999 }
    ];

    if (newFilters.regions.length > 0) {
      filtered = filtered.filter(school => newFilters.regions.includes(school.region));
    }

    if (newFilters.classSizes.length > 0) {
      filtered = filtered.filter(school => {
        const studentCount = school.studentCounts.ready;
        return newFilters.classSizes.some(bucket => {
          const bucketData = classSizeBuckets.find(b => b.label === bucket);
          return bucketData && studentCount >= bucketData.min && studentCount <= bucketData.max;
        });
      });
    }

    if (newFilters.startDate) {
      filtered = filtered.filter(school => school.startMonth === newFilters.startDate);
    }

    if (newFilters.grades.length > 0) {
      filtered = filtered.filter(school => 
        newFilters.grades.some(grade => school.gradeLevel.includes(grade))
      );
    }

    // Always show pinned school if one is selected
    if (pinnedSchool && !filtered.find(s => s.id === pinnedSchool.id)) {
      filtered = [pinnedSchool, ...filtered.filter(s => s.id !== pinnedSchool.id)];
    }

    setFilteredSchools(filtered);
  };

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
    applyFilters(newFilters, schools);
  };

  const handlePinSchool = (school: School) => {
    if (pinnedSchool && pinnedSchool.id === school.id) {
      setPinnedSchool(null);
    } else {
      setPinnedSchool(school);
    }
    // Reapply filters to ensure pinned school stays visible
    applyFilters(filters, schools);
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
  React.useEffect(() => {
    applyFilters(filters, schools);
  }, [schools, pinnedSchool]);

  const readySchools = filteredSchools.length > 0 ? filteredSchools : schools.filter(school => school.status === 'READY');

  return (
    <div>
      {/* Pinned School Banner */}
      {pinnedSchool && (
        <div style={{
          backgroundColor: '#e3f2fd',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          border: '2px solid #2196f3',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ color: '#1976d2', fontSize: '1.2rem' }}>📌</div>
          <div>
            <div style={{ fontWeight: '600', color: '#1976d2', marginBottom: '0.25rem' }}>
              Pinned School: {pinnedSchool.schoolName}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#4a5568' }}>
              {pinnedSchool.region} • {pinnedSchool.studentCounts.ready} students • Select another school below to match
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <FilterBar 
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* School Cards */}
      <h3 style={{ marginBottom: '1.5rem' }}>
        Ready for Matching ({readySchools.length})
      </h3>
      
      {readySchools.length === 0 ? (
        <div style={{ 
          background: '#fff',
          border: '1px solid #e0e6ed',
          borderRadius: '12px',
          textAlign: 'center', 
          padding: '3rem' 
        }}>
          <h4>No schools ready for matching</h4>
          <p style={{ color: '#6c757d' }}>
            Schools will appear here when they're ready to be matched.
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))', 
          gap: '1rem' 
        }}>
          {readySchools.map(school => (
            <SchoolCard
              key={school.id}
              school={school}
              isPinned={pinnedSchool?.id === school.id}
              showMatchIcon={pinnedSchool && pinnedSchool.id !== school.id}
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
