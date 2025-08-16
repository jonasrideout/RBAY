// app/admin/matching/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MatchingWorkflow from './components/MatchingWorkflow';
import SchoolCard from './components/SchoolCard';
import { School, StatusCounts, SelectedStatus } from './types';

export default function AdminDashboard() {
  const [schools, setSchools] = useState<School[]>([]);
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

  useEffect(() => {
    fetchAllSchools();
  }, []);

  const fetchAllSchools = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/all-schools');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch schools');
      }

      setSchools(data.schools || []);
      setStatusCounts(data.statusCounts || {
        COLLECTING: 0,
        READY: 0,
        MATCHED: 0,
        CORRESPONDING: 0,
        DONE: 0
      });

    } catch (err: any) {
      setError('Error fetching schools: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchoolsUpdate = (updatedSchools: School[]) => {
    setSchools(updatedSchools);
    // Refresh data to get updated counts
    fetchAllSchools();
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
    return schools.filter(school => school.status === status);
  };

  const handleAssignPenPals = async (school1Id: string, school2Id: string) => {
    try {
      const response = await fetch('/api/admin/assign-penpals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          school1Id, 
          school2Id 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign pen pals');
      }

      // Refresh the page to show updated status
      fetchAllSchools();
      
    } catch (err: any) {
      console.error('Error assigning pen pals:', err);
      alert('Error assigning pen pals: ' + err.message);
    }
  };

  const renderMatchedPairs = () => {
    const matchedSchools = getSchoolsByStatus('MATCHED');
    const pairs: [School, School][] = [];
    const processed = new Set<string>();

    matchedSchools.forEach(school => {
      if (processed.has(school.id) || !school.matchedSchool) return;
      
      pairs.push([school, school.matchedSchool]);
      processed.add(school.id);
      processed.add(school.matchedSchool.id);
    });

    return (
      <div>
        <h3 style={{ marginBottom: '1.5rem' }}>Matched School Pairs</h3>
        {pairs.length === 0 ? (
          <div style={{ 
            background: '#fff',
            border: '1px solid #e0e6ed',
            borderRadius: '12px',
            textAlign: 'center', 
            padding: '3rem' 
          }}>
            <h4>No matched schools yet</h4>
            <p style={{ color: '#6c757d' }}>
              Schools will appear here after they are paired together.
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.5rem' 
          }}>
            {pairs.map(([school1, school2], index) => (
              <div 
                key={`${school1.id}-${school2.id}`}
                style={{
                  background: '#fff',
                  border: '1px solid #e0e6ed',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                {/* 3-Column Layout */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr auto',
                  gap: '1.5rem',
                  alignItems: 'center'
                }}>
                  {/* School 1 */}
                  <div style={{
                    padding: '1rem',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6'
                  }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#1a365d' }}>
                      {school1.schoolName}
                    </h4>
                    <div style={{ fontSize: '0.9rem', color: '#4a5568', marginBottom: '0.5rem' }}>
                      <strong>{school1.teacherFirstName} {school1.teacherLastName}</strong>
                      <a 
                        href={`mailto:${school1.teacherEmail}`}
                        style={{ marginLeft: '0.5rem', textDecoration: 'none', opacity: 0.7 }}
                        title={school1.teacherEmail}
                      >
                        ✉️
                      </a>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#718096' }}>
                      <strong>{school1.region}</strong> | {school1.studentCounts.ready} students | Starts {school1.startMonth}
                    </div>
                  </div>

                  {/* School 2 */}
                  <div style={{
                    padding: '1rem',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6'
                  }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#1a365d' }}>
                      {school2.schoolName}
                    </h4>
                    <div style={{ fontSize: '0.9rem', color: '#4a5568', marginBottom: '0.5rem' }}>
                      <strong>{school2.teacherFirstName} {school2.teacherLastName}</strong>
                      <a 
                        href={`mailto:${school2.teacherEmail}`}
                        style={{ marginLeft: '0.5rem', textDecoration: 'none', opacity: 0.7 }}
                        title={school2.teacherEmail}
                      >
                        ✉️
                      </a>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#718096' }}>
                      <strong>{school2.region}</strong> | {school2.studentCounts.ready} students | Starts {school2.startMonth}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    minWidth: '180px'
                  }}>
                    {/* Check if students are assigned - for now just show assign button */}
                    <button
                      onClick={() => handleAssignPenPals(school1.id, school2.id)}
                      style={{
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.75rem 1rem',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                    >
                      Assign Pen Pals
                    </button>

                    {/* Placeholder download links - will be implemented later */}
                    <div style={{ 
                      display: 'none', // Hidden until pen pals are assigned
                      flexDirection: 'column', 
                      gap: '0.25rem' 
                    }}>
                      <a
                        href={`/api/admin/download-pairings?schoolId=${school1.id}`}
                        style={{
                          color: '#2563eb',
                          textDecoration: 'none',
                          fontSize: '0.85rem',
                          padding: '0.25rem'
                        }}
                      >
                        📄 Download {school1.schoolName} List
                      </a>
                      <a
                        href={`/api/admin/download-pairings?schoolId=${school2.id}`}
                        style={{
                          color: '#2563eb',
                          textDecoration: 'none',
                          fontSize: '0.85rem',
                          padding: '0.25rem'
                        }}
                      >
                        📄 Download {school2.schoolName} List
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCorrespondingPairs = () => {
    const correspondingSchools = getSchoolsByStatus('CORRESPONDING');
    const pairs: [School, School][] = [];
    const processed = new Set<string>();

    correspondingSchools.forEach(school => {
      if (processed.has(school.id) || !school.matchedSchool) return;
      
      pairs.push([school, school.matchedSchool]);
      processed.add(school.id);
      processed.add(school.matchedSchool.id);
    });

    return (
      <div>
        <h3 style={{ marginBottom: '1.5rem' }}>Corresponding School Pairs</h3>
        {pairs.length === 0 ? (
          <div style={{ 
            background: '#fff',
            border: '1px solid #e0e6ed',
            borderRadius: '12px',
            textAlign: 'center', 
            padding: '3rem' 
          }}>
            <h4>No corresponding schools yet</h4>
            <p style={{ color: '#6c757d' }}>
              Schools will appear here when they begin exchanging letters.
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1.5rem' 
          }}>
            {pairs.map(([school1, school2]) => [school1, school2]).flat().map(school => (
              <SchoolCard
                key={school.id}
                school={school}
              />
            ))}
          </div>
        )}
      </div>
    );
  };
