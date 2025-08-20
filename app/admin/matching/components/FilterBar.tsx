// app/admin/matching/components/FilterBar.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { Filters } from '../types';

interface FilterBarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  pinnedSchoolRegion?: string;
}

export default function FilterBar({ 
  filters, 
  onFiltersChange, 
  onApplyFilters,
  onClearFilters,
  pinnedSchoolRegion 
}: FilterBarProps) {
  const [dropdownStates, setDropdownStates] = useState({
    regions: false,
    classSizes: false,
    grades: false,
    startDate: false
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const allRegions = [
    'NORTHEAST', 'SOUTHEAST', 'MIDWEST', 'SOUTHWEST', 'MOUNTAIN WEST', 'PACIFIC'
  ];

  // Create regions list based on pinned school
  const getRegionsOptions = () => {
    if (!pinnedSchoolRegion) {
      return allRegions;
    }

    // Filter out the pinned school's region and add "All except X" option
    const otherRegions = allRegions.filter(region => 
      region.toUpperCase() !== pinnedSchoolRegion.toUpperCase()
    );
    
    return [`All except ${pinnedSchoolRegion.toUpperCase()}`, ...otherRegions];
  };

  const regions = getRegionsOptions();

  const classSizeBuckets = [
    { label: 'Under 10', min: 0, max: 9 },
    { label: '10-20', min: 10, max: 20 },
    { label: '21-30', min: 21, max: 30 },
    { label: '31-40', min: 31, max: 40 },
    { label: '41-50', min: 41, max: 50 },
    { label: 'Over 50', min: 51, max: 999 }
  ];

  const grades = ['K', '1', '2', '3', '4', '5', '6', '7', '8'];
  const startMonths = ['September', 'October', 'November', 'December', 'January', 'February'];

  // Check if any filters are active
  const hasActiveFilters = Boolean(
    (filters.schoolSearch && filters.schoolSearch.trim()) ||
    (filters.teacherSearch && filters.teacherSearch.trim()) ||
    filters.regions.length > 0 ||
    filters.classSizes.length > 0 ||
    filters.grades.length > 0 ||
    (filters.startDate && filters.startDate.trim())
  );

  // Auto-close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeAllDropdowns();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = (dropdown: keyof typeof dropdownStates) => {
    setDropdownStates(prev => ({
      regions: false,
      classSizes: false,
      grades: false,
      startDate: false,
      [dropdown]: !prev[dropdown]
    }));
  };

  const closeAllDropdowns = () => {
    setDropdownStates({
      regions: false,
      classSizes: false,
      grades: false,
      startDate: false
    });
  };

  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === 'combinedSearch') {
      // Update both schoolSearch and teacherSearch simultaneously
      onFiltersChange({ 
        ...filters, 
        schoolSearch: value,
        teacherSearch: value
      });
    } else if (filterType === 'regions') {
      // Handle special "All except X" option
      if (value.startsWith('All except') && pinnedSchoolRegion) {
        // Select all regions except the pinned one
        const otherRegions = allRegions.filter(region => 
          region.toUpperCase() !== pinnedSchoolRegion.toUpperCase()
        );
        onFiltersChange({ ...filters, regions: otherRegions });
        return;
      }
      
      // Handle normal region selection
      const currentValues = filters.regions;
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      onFiltersChange({ ...filters, regions: newValues });
    } else if (filterType === 'classSizes' || filterType === 'grades') {
      const currentValues = filters[filterType];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      onFiltersChange({ ...filters, [filterType]: newValues });
    } else {
      // Handle other single-value filters
      onFiltersChange({ ...filters, [filterType]: value });
    }
  };

  const renderMultiSelectDropdown = (
    label: string, 
    filterKey: keyof typeof dropdownStates,
    options: string[], 
    selectedValues: string[]
  ) => {
    // For regions, check if "All except X" is effectively selected
    const isAllExceptSelected = Boolean(
      filterKey === 'regions' && 
      pinnedSchoolRegion && 
      selectedValues.length === allRegions.length - 1 &&
      !selectedValues.includes(pinnedSchoolRegion.toUpperCase())
    );

    return (
      <div style={{ position: 'relative', minWidth: '120px' }}>
        <label style={{ 
          display: 'block', 
          fontSize: '0.8rem', 
          fontWeight: '600', 
          marginBottom: '4px', 
          color: '#4a5568' 
        }}>
          {label}
        </label>
        <button
          onClick={() => toggleDropdown(filterKey)}
          style={{
            width: '100%',
            height: '36px',
            padding: '6px 8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: '0.7rem',
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span style={{ 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
            marginRight: '4px'
          }}>
            {selectedValues.length === 0 
              ? `All ${label}` 
              : isAllExceptSelected
                ? `All except ${pinnedSchoolRegion?.toUpperCase()}`
                : selectedValues.length === 1 
                  ? selectedValues[0]
                  : `${selectedValues.length} selected`
            }
          </span>
          <span style={{ 
            transform: dropdownStates[filterKey] ? 'rotate(180deg)' : 'rotate(0deg)', 
            transition: 'transform 0.2s',
            fontSize: '0.6rem'
          }}>
            ▼
          </span>
        </button>
        
        {dropdownStates[filterKey] && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderTop: 'none',
            borderRadius: '0 0 4px 4px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            minWidth: '180px'
          }}>
            {options.map(option => {
              const isSelected = option.startsWith('All except') 
                ? isAllExceptSelected
                : selectedValues.includes(option);
                
              return (
                <label
                  key={option}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    backgroundColor: isSelected ? '#f0f8ff' : 'transparent',
                    borderBottom: '1px solid #f0f0f0',
                    lineHeight: '1.2'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(isSelected)}
                    onChange={() => handleFilterChange(filterKey, option)}
                    style={{ marginRight: '8px', marginTop: '1px', flexShrink: 0 }}
                  />
                  <span style={{ wordBreak: 'break-word' }}>
                    {option}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderStartMonthDropdown = () => {
    return (
      <div style={{ position: 'relative', minWidth: '120px' }}>
        <label style={{ 
          display: 'block', 
          fontSize: '0.8rem', 
          fontWeight: '600', 
          marginBottom: '4px', 
          color: '#4a5568' 
        }}>
          Start Month
        </label>
        <button
          onClick={() => toggleDropdown('startDate')}
          style={{
            width: '100%',
            height: '36px',
            padding: '6px 8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: '0.7rem',
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span style={{ 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
            marginRight: '4px'
          }}>
            {filters.startDate || 'All Months'}
          </span>
          <span style={{ 
            transform: dropdownStates.startDate ? 'rotate(180deg)' : 'rotate(0deg)', 
            transition: 'transform 0.2s',
            fontSize: '0.6rem'
          }}>
            ▼
          </span>
        </button>
        
        {dropdownStates.startDate && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderTop: 'none',
            borderRadius: '0 0 4px 4px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            minWidth: '140px'
          }}>
            <div
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                backgroundColor: !filters.startDate ? '#f0f8ff' : 'transparent',
                borderBottom: '1px solid #f0f0f0'
              }}
              onClick={() => {
                handleFilterChange('startDate', '');
                closeAllDropdowns();
              }}
            >
              ✓ All Months
            </div>
            {startMonths.map(month => (
              <div
                key={month}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  backgroundColor: filters.startDate === month ? '#f0f8ff' : 'transparent',
                  borderBottom: '1px solid #f0f0f0'
                }}
                onClick={() => {
                  handleFilterChange('startDate', month);
                  closeAllDropdowns();
                }}
              >
                {filters.startDate === month ? '✓ ' : ''}{month}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        marginBottom: '2rem',
        padding: '16px 20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e0e6ed',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-end',
        flexWrap: 'wrap'
      }}
    >
      {/* Combined Search */}
      <div style={{ minWidth: '160px' }}>
        <label style={{ 
          display: 'block', 
          fontSize: '0.8rem', 
          fontWeight: '600', 
          marginBottom: '4px', 
          color: '#4a5568' 
        }}>
          Search schools or teachers
        </label>
        <input
          type="text"
          value={filters.schoolSearch || ''}
          onChange={(e) => handleFilterChange('combinedSearch', e.target.value)}
          style={{
            width: '100%',
            height: '36px',
            padding: '6px 10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '0.85rem',
            backgroundColor: 'white'
          }}
        />
      </div>

      {/* Regions Filter */}
      <div onClick={(e) => e.stopPropagation()}>
        {renderMultiSelectDropdown('Regions', 'regions', regions, filters.regions)}
      </div>

      {/* Class Size Filter */}
      <div onClick={(e) => e.stopPropagation()}>
        {renderMultiSelectDropdown(
          'Class Size', 
          'classSizes', 
          classSizeBuckets.map(b => b.label), 
          filters.classSizes
        )}
      </div>

      {/* Start Month Filter */}
      <div onClick={(e) => e.stopPropagation()}>
        {renderStartMonthDropdown()}
      </div>

      {/* Grades Filter */}
      <div onClick={(e) => e.stopPropagation()}>
        {renderMultiSelectDropdown('Grades', 'grades', grades.map(g => `Grade ${g}`), filters.grades)}
      </div>

      {/* Side-by-side Buttons - FIXED: 45px width each, 2px gap, 36px height to match filters */}
      <div style={{ 
        display: 'flex', 
        gap: '2px',
        alignItems: 'flex-end'
      }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            closeAllDropdowns();
            onApplyFilters();
          }}
          style={{
            height: '36px',
            width: '45px',
            border: hasActiveFilters ? 'none' : '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: hasActiveFilters ? '#2196f3' : 'white',
            color: hasActiveFilters ? 'white' : '#666',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: '500'
          }}
        >
          Go
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            closeAllDropdowns();
            onClearFilters();
          }}
          style={{
            height: '36px',
            width: '45px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: '500',
            color: '#666'
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
