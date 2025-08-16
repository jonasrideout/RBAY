// app/admin/matching/components/FilterBar.tsx
"use client";

import { useState } from 'react';
import { Filters } from '../types';

interface FilterBarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onApplyFilters: () => void;
  pinnedSchoolRegion?: string; // Add this prop to know the pinned school's region
}

export default function FilterBar({ 
  filters, 
  onFiltersChange, 
  onApplyFilters, 
  pinnedSchoolRegion 
}: FilterBarProps) {
  const [dropdownStates, setDropdownStates] = useState({
    regions: false,
    classSizes: false,
    grades: false
  });

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
    { label: '20-30', min: 20, max: 30 },
    { label: '30-40', min: 30, max: 40 },
    { label: '40-50', min: 40, max: 50 },
    { label: 'Over 50', min: 51, max: 999 }
  ];

  const grades = ['K', '1', '2', '3', '4', '5', '6', '7', '8'];
  const startMonths = ['September', 'October', 'November', 'December', 'January', 'February'];

  const toggleDropdown = (dropdown: keyof typeof dropdownStates) => {
    setDropdownStates(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown]
    }));
  };

  const closeAllDropdowns = () => {
    setDropdownStates({
      regions: false,
      classSizes: false,
      grades: false
    });
  };

  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === 'regions') {
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
      onFiltersChange({ ...filters, [filterType]: value });
    }
  };

  const clearFilters = () => {
    onFiltersChange({
      regions: [],
      classSizes: [],
      startDate: '',
      grades: []
    });
    closeAllDropdowns();
    onApplyFilters();
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
      <div style={{ position: 'relative', minWidth: '140px' }}>
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
            padding: '6px 10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: '0.85rem',
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
            transition: 'transform 0.2s' 
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
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
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
                    alignItems: 'center',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    backgroundColor: isSelected ? '#f0f8ff' : 'transparent',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(isSelected)}
                    onChange={() => handleFilterChange(filterKey, option)}
                    style={{ marginRight: '8px' }}
                  />
                  {option}
                </label>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-end',
        marginBottom: '2rem',
        padding: '16px 20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e0e6ed',
        flexWrap: 'wrap'
      }}
      onClick={closeAllDropdowns}
    >
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
      <div style={{ minWidth: '120px' }}>
        <label style={{ 
          display: 'block', 
          fontSize: '0.8rem', 
          fontWeight: '600', 
          marginBottom: '4px', 
          color: '#4a5568' 
        }}>
          Start Month
        </label>
        <select
          value={filters.startDate}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
          style={{
            width: '100%',
            height: '36px',
            padding: '6px 10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '0.85rem',
            backgroundColor: 'white'
          }}
        >
          <option value="">All Months</option>
          {startMonths.map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
      </div>

      {/* Grades Filter */}
      <div onClick={(e) => e.stopPropagation()}>
        {renderMultiSelectDropdown('Grades', 'grades', grades.map(g => `Grade ${g}`), filters.grades)}
      </div>

      {/* Go Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          closeAllDropdowns();
          onApplyFilters();
        }}
        style={{
          height: '36px',
          padding: '0 20px',
          border: 'none',
          borderRadius: '4px',
          backgroundColor: '#2196f3',
          color: 'white',
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontWeight: '600'
        }}
      >
        Go
      </button>

      {/* Clear All Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          clearFilters();
        }}
        style={{
          height: '36px',
          padding: '0 16px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          backgroundColor: 'white',
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontWeight: '500',
          color: '#666'
        }}
      >
        Clear All
      </button>
    </div>
  );
}
