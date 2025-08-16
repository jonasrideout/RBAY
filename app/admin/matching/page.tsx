import { useState, useEffect } from 'react';

interface School {
  id: string;
  schoolName: string;
  teacherFirstName: string;
  teacherLastName: string;
  teacherEmail: string;
  region: string;
  gradeLevel: string[];
  expectedClassSize: number;
  startMonth: string;
  letterFrequency: string;
  status: 'COLLECTING' | 'READY' | 'MATCHED' | 'CORRESPONDING' | 'DONE';
  lettersSent: number;
  lettersReceived: number;
  matchedWithSchoolId?: string;
  matchedSchool?: School;
  studentCounts: {
    expected: number;
    registered: number;
    ready: number;
  };
}

interface StatusCounts {
  COLLECTING: number;
  READY: number;
  MATCHED: number;
  CORRESPONDING: number;
  DONE: number;
}

type SelectedStatus = keyof StatusCounts;

export default function AdminDashboard() {
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    COLLECTING: 0,
    READY: 0,
    MATCHED: 0,
    CORRESPONDING: 0,
    DONE: 0
  });
  const [selectedStatus, setSelectedStatus] = useState<SelectedStatus>('COLLECTING');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Matching functionality state
  const [pinnedSchool, setPinnedSchool] = useState<School | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<School | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    regions: [] as string[],
    classSizes: [] as string[],
    startDate: '',
    grades: [] as string[]
  });

  const regions = [
    'NORTHEAST', 'SOUTHEAST', 'MIDWEST', 'SOUTHWEST', 'MOUNTAIN WEST', 'PACIFIC'
  ];

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

  // Add dropdown state management
  const [dropdownStates, setDropdownStates] = useState({
    regions: false,
    classSizes: false,
    grades: false
  });

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
    if (filterType === 'regions' || filterType === 'classSizes' || filterType === 'grades') {
      setFilters(prev => {
        const currentValues = prev[filterType];
        const newValues = currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value];
        return { ...prev, [filterType]: newValues };
      });
    } else {
      setFilters(prev => ({ ...prev, [filterType]: value }));
    }
  };

  // Mock data for demonstration
  useEffect(() => {
    const mockSchools: School[] = [
      {
        id: '1',
        schoolName: 'Pacific Elementary',
        teacherFirstName: 'Sarah',
        teacherLastName: 'Johnson',
        teacherEmail: 'sarah.johnson@pacific-elem.edu',
        region: 'PACIFIC',
        gradeLevel: ['3', '4', '5'],
        expectedClassSize: 25,
        startMonth: 'September',
        letterFrequency: 'monthly',
        status: 'READY',
        lettersSent: 0,
        lettersReceived: 0,
        studentCounts: {
          expected: 25,
          registered: 23,
          ready: 20
        }
      },
      {
        id: '2',
        schoolName: 'Northeast Academy',
        teacherFirstName: 'Michael',
        teacherLastName: 'Chen',
        teacherEmail: 'michael.chen@northeast-academy.edu',
        region: 'NORTHEAST',
        gradeLevel: ['4', '5'],
        expectedClassSize: 18,
        startMonth: 'October',
        letterFrequency: 'monthly',
        status: 'READY',
        lettersSent: 0,
        lettersReceived: 0,
        studentCounts: {
          expected: 18,
          registered: 16,
          ready: 15
        }
      },
      {
        id: '3',
        schoolName: 'Mountain View Elementary',
        teacherFirstName: 'Lisa',
        teacherLastName: 'Rodriguez',
        teacherEmail: 'lisa.rodriguez@mountain-view.edu',
        region: 'MOUNTAIN WEST',
        gradeLevel: ['3', '4', '5', '6'],
        expectedClassSize: 30,
        startMonth: 'September',
        letterFrequency: 'monthly',
        status: 'READY',
        lettersSent: 0,
        lettersReceived: 0,
        studentCounts: {
          expected: 30,
          registered: 28,
          ready: 25
        }
      },
      {
        id: '4',
        schoolName: 'Midwest Elementary',
        teacherFirstName: 'David',
        teacherLastName: 'Thompson',
        teacherEmail: 'david.thompson@midwest-elem.edu',
        region: 'MIDWEST',
        gradeLevel: ['2', '3', '4'],
        expectedClassSize: 22,
        startMonth: 'September',
        letterFrequency: 'monthly',
        status: 'COLLECTING',
        lettersSent: 0,
        lettersReceived: 0,
        studentCounts: {
          expected: 22,
          registered: 18,
          ready: 12
        }
      },
      {
        id: '5',
        schoolName: 'Southwest Elementary',
        teacherFirstName: 'Maria',
        teacherLastName: 'Garcia',
        teacherEmail: 'maria.garcia@southwest-elem.edu',
        region: 'SOUTHWEST',
        gradeLevel: ['4', '5', '6'],
        expectedClassSize: 20,
        startMonth: 'October',
        letterFrequency: 'monthly',
        status: 'COLLECTING',
        lettersSent: 0,
        lettersReceived: 0,
        studentCounts: {
          expected: 20,
          registered: 15,
          ready: 8
        }
      }
    ];

    setSchools(mockSchools);
    setFilteredSchools(mockSchools);
    setStatusCounts({
      COLLECTING: 2,
      READY: 3,
      MATCHED: 0,
      CORRESPONDING: 0,
      DONE: 0
    });
    setIsLoading(false);
  }, []);

  // Apply filters whenever filters change or schools change
  useEffect(() => {
    if (selectedStatus !== 'READY') {
      setFilteredSchools(schools);
      return;
    }

    let filtered = schools.filter(school => school.status === 'READY');

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

    // Always show pinned school if one is selected
    if (pinnedSchool && !filtered.find(s => s.id === pinnedSchool.id)) {
      filtered = [pinnedSchool, ...filtered.filter(s => s.id !== pinnedSchool.id)];
    }

    setFilteredSchools(filtered);
  }, [filters, schools, selectedStatus, pinnedSchool]);

  const fetchAllSchools = async () => {
    setIsLoading(true);
    setError('');
    console.log('Refreshing school data...');
    setIsLoading(false);
  };

  const handlePinSchool = (school: School) => {
    if (pinnedSchool && pinnedSchool.id === school.id) {
      setPinnedSchool(null);
    } else {
      setPinnedSchool(school);
    }
  };

  const handleMatchRequest = (school: School) => {
    if (!pinnedSchool) return;
    
    setSelectedMatch(school);
    
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
      console.log('Matching schools:', pinnedSchool, selectedMatch);
      
      const updatedSchools = schools.map(school => {
        if (school.id === pinnedSchool.id || school.id === selectedMatch.id) {
          return { ...school, status: 'MATCHED' as const };
        }
        return school;
      });
      
      setSchools(updatedSchools);
      setPinnedSchool(null);
      setShowConfirmDialog(false);
      setSelectedMatch(null);
      setShowWarning(false);
      
      setStatusCounts(prev => ({
        ...prev,
        READY: prev.READY - 2,
        MATCHED: prev.MATCHED + 2
      }));
      
    } catch (err) {
      console.error('Error matching schools:', err);
    }
  };

  const clearFilters = () => {
    setFilters({
      regions: [],
      classSizes: [],
      startDate: '',
      grades: []
    });
  };

  const getStatusLabel = (status: SelectedStatus) => {
    const labels = {
      COLLECTING: 'Collecting Information',
      READY: 'Ready for Matching',
      MATCHED: 'Matched',
      CORRESPONDING: 'Corresponding',
      DONE: 'Done'
    };
    return labels[status];
  };

  const getSchoolsByStatus = (status: SelectedStatus): School[] => {
    if (status === 'READY') {
      return filteredSchools;
    }
    return schools.filter(school => school.status === status);
  };

  const getRegionDisplay = (region: string) => {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100%',
        textAlign: 'center'
      }}>
        <div style={{ 
          fontSize: '0.9rem', 
          fontWeight: '600', 
          color: '#4a5568',
          letterSpacing: '0.5px'
        }}>
          {region.toUpperCase()}
        </div>
      </div>
    );
  };

  const renderOutlineIcon = (type: 'pin' | 'lock', size = 16) => {
    if (type === 'pin') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <ellipse cx="12" cy="8" rx="3" ry="1.5"/>
          <path d="M9 8v1c0 1.5 1.5 2 3 2s3-0.5 3-2V8"/>
          <line x1="12" y1="11" x2="12" y2="20"/>
          <circle cx="12" cy="8" r="2" fill="none"/>
        </svg>
      );
    } else {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <circle cx="12" cy="16" r="1"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      );
    }
  };

  const renderSchoolCard = (school: School) => {
    const teacherName = `${school.teacherFirstName} ${school.teacherLastName}`;
    const isReady = school.status === 'READY';
    const isPinned = pinnedSchool && pinnedSchool.id === school.id;
    const showMatchIcon = isReady && pinnedSchool && pinnedSchool.id !== school.id;
    
    return (
      <div 
        key={school.id}
        style={{ 
          background: '#fff',
          border: isPinned ? '2px solid #2196f3' : '1px solid #e0e6ed',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1rem',
          boxShadow: isPinned ? '0 4px 12px rgba(33, 150, 243, 0.2)' : '0 4px 6px rgba(0,0,0,0.07)',
          transition: 'all 0.2s ease',
          display: 'grid',
          gridTemplateColumns: '50% 25% 20%',
          gap: '1.5rem',
          alignItems: 'stretch',
          minHeight: '120px',
          position: 'relative'
        }}
      >
        {isReady && (
          <div style={{ 
            position: 'absolute', 
            top: '15px', 
            right: '15px',
            zIndex: 10
          }}>
            {showMatchIcon ? (
              <button
                onClick={() => handleMatchRequest(school)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#28a745',
                  transition: 'background-color 0.2s ease'
                }}
                title="Match with pinned school"
              >
                {renderOutlineIcon('lock', 18)}
              </button>
            ) : (
              <button
                onClick={() => handlePinSchool(school)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: isPinned ? '#2196f3' : '#666',
                  transition: 'all 0.2s ease'
                }}
                title={isPinned ? "Unpin school" : "Pin school"}
              >
                {renderOutlineIcon('pin', 18)}
              </button>
            )}
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          paddingTop: '0'
        }}>
          <div>
            <h3 style={{ 
              margin: '0 0 0.5rem 0', 
              color: '#1a365d', 
              fontSize: '1.3rem',
              fontWeight: '600',
              lineHeight: '1.2'
            }}>
              {school.schoolName}
            </h3>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              color: '#4a5568',
              fontSize: '1rem'
            }}>
              <span style={{ fontWeight: '500' }}>{teacherName}</span>
              <a 
                href={`mailto:${school.teacherEmail}`}
                style={{ 
                  textDecoration: 'none', 
                  fontSize: '1.1rem',
                  opacity: 0.7,
                  transition: 'opacity 0.2s ease'
                }}
                title={school.teacherEmail}
              >
                ✉️
              </a>
            </div>
          </div>
          <div style={{ 
            color: '#718096', 
            fontSize: '0.95rem',
            marginTop: '0.5rem'
          }}>
            <strong>Grades:</strong> {school.gradeLevel.join(', ')}
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-evenly',
          fontSize: '0.95rem'
        }}>
          <div style={{ color: '#4a5568' }}>
            <strong>Start:</strong> {school.startMonth}
          </div>
          <div style={{ color: '#4a5568' }}>
            <strong>Expected:</strong> {school.studentCounts.expected}
          </div>
          <div style={{ color: '#4a5568' }}>
            <strong>Registered:</strong> {school.studentCounts.registered}
          </div>
          <div style={{ color: '#4a5568' }}>
            <strong>Ready:</strong> {school.studentCounts.ready}
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '80px'
        }}>
          {getRegionDisplay(school.region)}
        </div>
      </div>
    );
  };

  const renderFilters = () => {
    if (selectedStatus !== 'READY') return null;

    const renderMultiSelectDropdown = (
      label: string, 
      filterKey: keyof typeof dropdownStates,
      options: string[], 
      selectedValues: string[]
    ) => (
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
              : selectedValues.length === 1 
                ? selectedValues[0]
                : `${selectedValues.length} selected`
            }
          </span>
          <span style={{ transform: dropdownStates[filterKey] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
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
            {options.map(option => (
              <label
                key={option}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  backgroundColor: selectedValues.includes(option) ? '#f0f8ff' : 'transparent',
                  borderBottom: '1px solid #f0f0f0'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={() => handleFilterChange(filterKey, option)}
                  style={{ marginRight: '8px' }}
                />
                {option}
              </label>
            ))}
          </div>
        )}
      </div>
    );

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

        {/* Clear Filters */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            clearFilters();
            closeAllDropdowns();
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
  };

  const renderStatusContent = () => {
    const statusSchools = getSchoolsByStatus(selectedStatus);

    return (
      <div>
        {pinnedSchool && selectedStatus === 'READY' && (
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

        <h3 style={{ marginBottom: '1.5rem' }}>
          {getStatusLabel(selectedStatus)} ({statusSchools.length})
        </h3>
        {statusSchools.length === 0 ? (
          <div style={{ 
            background: '#fff',
            border: '1px solid #e0e6ed',
            borderRadius: '12px',
            textAlign: 'center', 
            padding: '3rem' 
          }}>
            <h4>No schools in {getStatusLabel(selectedStatus).toLowerCase()} status</h4>
            <p style={{ color: '#6c757d' }}>
              Schools will appear here as they progress through the program.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))', gap: '1rem' }}>
            {statusSchools.map(renderSchoolCard)}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif'
    }}>
      <header style={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #e0e6ed',
        padding: '1rem 0'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: '600' }}>The Right Back at You Project</span>
          </div>
          <nav style={{ display: 'flex', gap: '1rem' }}>
            <a href="#" style={{ textDecoration: 'none', color: '#4a5568', fontWeight: '500' }}>Home</a>
            <a href="#" style={{ textDecoration: 'none', color: '#2196f3', fontWeight: '500' }}>Admin</a>
          </nav>
        </div>
      </header>

      <main style={{ 
        flex: 1, 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '1.5rem 1rem' 
      }}>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ marginBottom: '0.5rem', fontSize: '1.8rem' }}>Administrator Dashboard</h1>
          <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
            Overview of all schools and their progress through the program.
          </p>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '3rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {(Object.keys(statusCounts) as SelectedStatus[]).map((status) => (
            <div
              key={status}
              onClick={() => setSelectedStatus(status)}
              style={{
                background: '#fff',
                color: '#333',
                border: `2px solid ${selectedStatus === status ? '#ffd700' : '#e0e6ed'}`,
                borderRadius: '8px',
                padding: '1rem 1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                width: '160px',
                height: '80px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                {statusCounts[status]}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px', lineHeight: '1.2', paddingBottom: '0.5rem' }}>
                {getStatusLabel(status).toUpperCase()}
              </div>
            </div>
          ))}
        </div>

        {renderFilters()}

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button 
            onClick={fetchAllSchools}
            disabled={isLoading}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #6c757d',
              borderRadius: '4px',
              backgroundColor: '#6c757d',
              color: 'white',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem'
            }}
          >
            {isLoading ? '🔄 Loading...' : '🔄 Refresh Data'}
          </button>
        </div>

        {renderStatusContent()}

      </main>

      {showConfirmDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
              Confirm School Match
            </h3>
            
            {showWarning && (
              <div style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '4px',
                padding: '10px',
                marginBottom: '15px',
                color: '#856404'
              }}>
                ⚠️ Warning: Both schools are in the same region ({pinnedSchool?.region}). 
                Cross-regional matches are preferred for this program.
              </div>
            )}
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <strong>{pinnedSchool?.schoolName}</strong><br />
                <span style={{ fontSize: '14px', color: '#666' }}>
                  {pinnedSchool?.region} | {pinnedSchool?.studentCounts.ready} students | Starts {pinnedSchool?.startMonth}
                </span>
              </div>
              
              <div style={{ textAlign: 'center', margin: '10px 0' }}>↕️</div>
              
              <div style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <strong>{selectedMatch?.schoolName}</strong><br />
                <span style={{ fontSize: '14px', color: '#666' }}>
                  {selectedMatch?.region} | {selectedMatch?.studentCounts.ready} students | Starts {selectedMatch?.startMonth}
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setSelectedMatch(null);
                  setShowWarning(false);
                }}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmMatch}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#2196f3',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Confirm Match
              </button>
            </div>
          </div>
        </div>
      )}

      <footer style={{ 
        backgroundColor: '#343a40', 
        color: 'white', 
        padding: '2rem 0', 
        marginTop: '3rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <p>&copy; 2024 The Right Back at You Project by Carolyn Mackler. Building empathy and connection through literature.</p>
        </div>
      </footer>
    </div>
  );
}
