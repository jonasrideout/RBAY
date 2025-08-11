"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface School {
  id: string;
  name: string;
  teacher: string;
  email: string;
  region: string;
  grades: string[];
  studentCount: number;
  startMonth: string;
}

interface Match {
  matchId: string;
  score: number;
  quality: string;
  school1: School;
  school2: School;
  reasons: string[];
  status?: 'suggested' | 'approved';
  notes?: string;
}

export default function AdminMatching() {
  const [allSchools, setAllSchools] = useState<School[]>([]);
  const [suggestedMatches, setSuggestedMatches] = useState<Match[]>([]);
  const [approvedMatches, setApprovedMatches] = useState<Match[]>([]);
  const [selectedSchool1, setSelectedSchool1] = useState<School | null>(null);
  const [selectedSchool2, setSelectedSchool2] = useState<School | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSchools, setIsLoadingSchools] = useState(true);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterStartMonth, setFilterStartMonth] = useState('');
  
  // UI states
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'suggested' | 'manual' | 'approved'>('suggested');
  const [showingSchools, setShowingSchools] = useState<School[]>([]);

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    filterSchools();
  }, [allSchools, searchTerm, filterRegion, filterGrade, filterStartMonth]);

  const fetchSchools = async () => {
    setIsLoadingSchools(true);
    setError('');

    try {
      const response = await fetch('/api/matching/schools');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch schools');
      }

      const schools = (data.readyForMatching || []).map((school: any) => ({
        id: school.id,
        name: school.name,
        teacher: `${school.teacher || 'Unknown Teacher'}`,
        email: school.email || '',
        region: school.region,
        grades: school.grades,
        studentCount: school.studentCount,
        startMonth: school.startMonth
      }));

      setAllSchools(schools);
    } catch (err: any) {
      setError('Error fetching schools: ' + err.message);
    } finally {
      setIsLoadingSchools(false);
    }
  };

  const filterSchools = () => {
    let filtered = allSchools.filter(school => {
      // Search term matches name, teacher, or email
      const matchesSearch = searchTerm === '' || 
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.email.toLowerCase().includes(searchTerm.toLowerCase());

      // Region filter
      const matchesRegion = filterRegion === '' || school.region === filterRegion;

      // Grade filter
      const matchesGrade = filterGrade === '' || school.grades.includes(filterGrade);

      // Start month filter
      const matchesStartMonth = filterStartMonth === '' || school.startMonth === filterStartMonth;

      return matchesSearch && matchesRegion && matchesGrade && matchesStartMonth;
    });

    setShowingSchools(filtered);
  };

  const findSuggestedMatches = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/matching/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoMatch: true })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to find matches');
      }

      const matches = (data.matches || []).map((match: any) => ({
        ...match,
        status: 'suggested' as const
      }));

      setSuggestedMatches(matches);
      setActiveTab('suggested');
    } catch (err: any) {
      setError('Error finding matches: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const approveMatch = (match: Match, notes: string = '') => {
    const approvedMatch = {
      ...match,
      status: 'approved' as const,
      notes
    };

    setApprovedMatches(prev => [...prev, approvedMatch]);
    setSuggestedMatches(prev => prev.filter(m => m.matchId !== match.matchId));
    
    // TODO: Save to database
    console.log('Approved match:', approvedMatch);
  };

  const createManualMatch = (school1: School, school2: School, notes: string = '') => {
    if (!school1 || !school2 || school1.id === school2.id) return;

    const manualMatch: Match = {
      matchId: `manual-${school1.id}-${school2.id}`,
      score: 0, // Manual matches don't have algorithm scores
      quality: 'Manual',
      school1,
      school2,
      reasons: ['Manually paired by administrator'],
      status: 'approved',
      notes
    };

    setApprovedMatches(prev => [...prev, manualMatch]);
    setSelectedSchool1(null);
    setSelectedSchool2(null);
    
    // TODO: Save to database
    console.log('Created manual match:', manualMatch);
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'Excellent': return '#28a745';
      case 'Good': return '#17a2b8';
      case 'Fair': return '#ffc107';
      case 'Manual': return '#6f42c1';
      default: return '#6c757d';
    }
  };

  const getRegionColor = (region: string) => {
    const colors: { [key: string]: string } = {
      'Northeast': '#e3f2fd',
      'Southeast': '#f3e5f5', 
      'Midwest': '#fff3e0',
      'Southwest': '#fce4ec',
      'Mountain West': '#e8f5e8',
      'Pacific': '#fff8e1'
    };
    return colors[region] || '#f5f5f5';
  };

  const regions = ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'Mountain West', 'Pacific'];
  const grades = ['3', '4', '5', '6', '7', '8'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const renderSchoolCard = (school: School, isSelectable: boolean = false, isSelected: boolean = false) => (
    <div 
      key={school.id}
      className={`card ${isSelectable ? 'clickable' : ''}`}
      style={{ 
        background: isSelected ? '#e8f5e9' : getRegionColor(school.region),
        border: isSelected ? '2px solid #28a745' : '1px solid #dee2e6',
        cursor: isSelectable ? 'pointer' : 'default',
        margin: '0.5rem 0'
      }}
      onClick={() => {
        if (!isSelectable) return;
        
        if (!selectedSchool1) {
          setSelectedSchool1(school);
        } else if (!selectedSchool2 && school.id !== selectedSchool1.id) {
          setSelectedSchool2(school);
        } else {
          // Deselect if clicking on already selected school
          if (selectedSchool1?.id === school.id) setSelectedSchool1(null);
          if (selectedSchool2?.id === school.id) setSelectedSchool2(null);
        }
      }}
    >
      <h5 style={{ marginBottom: '0.5rem', color: '#2c5aa0' }}>{school.name}</h5>
      <p style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
        <strong>{school.teacher}</strong> ({school.email})
      </p>
      <div style={{ fontSize: '0.8rem', color: '#6c757d', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
        <p><strong>Region:</strong> {school.region}</p>
        <p><strong>Grades:</strong> {school.grades.join(', ')}</p>
        <p><strong>Students:</strong> {school.studentCount}</p>
        <p><strong>Start:</strong> {school.startMonth}</p>
      </div>
      {isSelected && (
        <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#d4edda', borderRadius: '4px' }}>
          <strong style={{ color: '#155724' }}>Selected for matching</strong>
        </div>
      )}
    </div>
  );

  const renderMatchCard = (match: Match, showApprovalButtons: boolean = false) => (
    <div 
      key={match.matchId}
      className="card" 
      style={{ 
        background: '#f8f9fa',
        border: `2px solid ${getQualityColor(match.quality)}`,
        marginBottom: '1rem'
      }}
    >
      {/* Match Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ margin: '0' }}>
          {match.school1.name} ↔ {match.school2.name}
        </h4>
        <span 
          style={{ 
            background: getQualityColor(match.quality),
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '4px',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}
        >
          {match.quality} {match.score > 0 && `(${match.score})`}
        </span>
      </div>

      {/* Schools Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
        {renderSchoolCard(match.school1)}
        <div style={{ textAlign: 'center', fontSize: '1.5rem' }}>↔️</div>
        {renderSchoolCard(match.school2)}
      </div>

      {/* Match Reasons */}
      <div style={{ marginBottom: '1rem' }}>
        <h6 style={{ marginBottom: '0.5rem', color: '#495057' }}>Match Details:</h6>
        <ul style={{ marginBottom: '0', paddingLeft: '1.5rem' }}>
          {match.reasons.map((reason, i) => (
            <li key={i} style={{ color: '#6c757d', fontSize: '0.9rem' }}>{reason}</li>
          ))}
        </ul>
      </div>

      {/* Notes */}
      {match.notes && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#e9ecef', borderRadius: '4px' }}>
          <strong>Admin Notes:</strong> {match.notes}
        </div>
      )}

      {/* Action Buttons */}
      {showApprovalButtons && (
        <div style={{ textAlign: 'center' }}>
          <button 
            className="btn btn-primary"
            style={{ marginRight: '0.5rem' }}
            onClick={() => {
              const notes = prompt('Optional notes for this match:') || '';
              approveMatch(match, notes);
            }}
          >
            ✅ Approve Match
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              alert(`Teacher Contacts:\n${match.school1.email}\n${match.school2.email}`);
            }}
          >
            📧 View Teacher Contacts
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="page">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/RB@Y-logo.jpg" alt="Right Back at You" style={{ height: '40px' }} />
              The Right Back at You Project
            </Link>
            <nav className="nav">
              <Link href="/" className="nav-link">Home</Link>
              <Link href="/admin/matching" className="nav-link">Admin</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ flex: 1, paddingTop: '3rem' }}>
        
        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>🎯 School Matching Admin</h1>
          <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
            Find suggested matches or manually pair schools from different regions.
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '2rem' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button 
            onClick={fetchSchools}
            className="btn btn-secondary"
            disabled={isLoadingSchools}
          >
            {isLoadingSchools ? '🔄 Loading...' : '🔄 Refresh Schools'}
          </button>
          
          <button 
            onClick={findSuggestedMatches}
            className="btn btn-primary"
            disabled={isLoading || allSchools.length < 2}
          >
            {isLoading ? '⏳ Finding...' : '🔍 Find Suggested Matches'}
          </button>

          <Link 
            href="/api/admin/clear-data"
            className="btn"
            style={{ backgroundColor: '#dc3545', color: 'white' }}
          >
            🗑️ Clear All Data
          </Link>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', marginBottom: '2rem', borderBottom: '1px solid #dee2e6' }}>
          {[
            { key: 'suggested', label: `🔍 Suggested Matches (${suggestedMatches.length})`, count: suggestedMatches.length },
            { key: 'manual', label: `🔧 Manual Pairing`, count: 0 },
            { key: 'approved', label: `✅ Approved Matches (${approvedMatches.length})`, count: approvedMatches.length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '1rem 1.5rem',
                border: 'none',
                background: activeTab === tab.key ? '#4a90e2' : 'transparent',
                color: activeTab === tab.key ? 'white' : '#6c757d',
                borderBottom: activeTab === tab.key ? '3px solid #4a90e2' : '3px solid transparent',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: activeTab === tab.key ? '600' : '400'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'suggested' && (
          <div>
            {suggestedMatches.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <h4>No suggested matches yet</h4>
                <p style={{ color: '#6c757d' }}>
                  Click "Find Suggested Matches" to see algorithm recommendations.
                </p>
              </div>
            ) : (
              <div>
                <h3>🔍 Algorithm Suggestions</h3>
                <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
                  Review these suggested matches and approve the ones you want to create.
                </p>
                {suggestedMatches.map(match => renderMatchCard(match, true))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'manual' && (
          <div>
            <h3>🔧 Manual School Pairing</h3>
            <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
              Search and filter schools, then click two schools to pair them manually.
            </p>

            {/* Search and Filters */}
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h4>Search & Filter Schools</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="Search name, teacher, email..."
                  className="form-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <select 
                  className="form-select"
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                >
                  <option value="">All Regions</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>

                <select 
                  className="form-select"
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value)}
                >
                  <option value="">All Grades</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}th Grade</option>
                  ))}
                </select>

                <select 
                  className="form-select"
                  value={filterStartMonth}
                  onChange={(e) => setFilterStartMonth(e.target.value)}
                >
                  <option value="">All Start Months</option>
                  {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>

              <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                Showing {showingSchools.length} of {allSchools.length} schools ready for matching
              </p>
            </div>

            {/* Selected Schools */}
            {(selectedSchool1 || selectedSchool2) && (
              <div className="card" style={{ marginBottom: '2rem', background: '#e8f5e9' }}>
                <h4>🎯 Creating Manual Match</h4>
                <div style={{ display: 'grid', gridTemplateColumns: selectedSchool1 && selectedSchool2 ? '1fr auto 1fr auto' : '1fr', gap: '1rem', alignItems: 'center' }}>
                  {selectedSchool1 ? (
                    renderSchoolCard(selectedSchool1, false, true)
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d', border: '2px dashed #ccc', borderRadius: '8px' }}>
                      Click a school below to select School #1
                    </div>
                  )}
                  
                  {selectedSchool1 && (
                    <>
                      <div style={{ textAlign: 'center', fontSize: '1.5rem' }}>↔️</div>
                      {selectedSchool2 ? (
                        renderSchoolCard(selectedSchool2, false, true)
                      ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d', border: '2px dashed #ccc', borderRadius: '8px' }}>
                          Click another school to select School #2
                        </div>
                      )}
                      
                      {selectedSchool2 && (
                        <div style={{ textAlign: 'center' }}>
                          <button 
                            className="btn btn-primary"
                            onClick={() => {
                              const notes = prompt('Optional notes for this manual pairing:') || '';
                              createManualMatch(selectedSchool1, selectedSchool2, notes);
                            }}
                            style={{ marginBottom: '0.5rem', width: '100%' }}
                          >
                            ✅ Create Match
                          </button>
                          <button 
                            className="btn btn-secondary"
                            onClick={() => {
                              setSelectedSchool1(null);
                              setSelectedSchool2(null);
                            }}
                            style={{ width: '100%' }}
                          >
                            ❌ Clear Selection
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Available Schools */}
            <div className="card">
              <h4>Available Schools ({showingSchools.length})</h4>
              {showingSchools.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                  <h5>No schools match your filters</h5>
                  <p>Try adjusting your search terms or filters above.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1rem' }}>
                  {showingSchools.map(school => 
                    renderSchoolCard(
                      school, 
                      true, 
                      selectedSchool1?.id === school.id || selectedSchool2?.id === school.id
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'approved' && (
          <div>
            {approvedMatches.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <h4>No approved matches yet</h4>
                <p style={{ color: '#6c757d' }}>
                  Approved matches will appear here after you approve suggestions or create manual pairings.
                </p>
              </div>
            ) : (
              <div>
                <h3>✅ Approved School Matches</h3>
                <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
                  These school partnerships have been approved and are ready for student-to-student matching.
                </p>
                {approvedMatches.map(match => renderMatchCard(match, false))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer style={{ background: '#343a40', color: 'white', padding: '2rem 0', marginTop: '3rem' }}>
        <div className="container text-center">
          <p>&copy; 2024 The Right Back at You Project by Carolyn Mackler. Building empathy and connection through literature.</p>
        </div>
      </footer>
    </div>
  );
}
