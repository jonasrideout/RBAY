// app/admin/matching/components/SchoolPairDisplay.tsx
"use client";

import { useState } from 'react';

interface School {
  id: string;
  schoolName: string;
  teacherName: string;
  teacherEmail: string;
  gradeLevel: string;
  region: string;
  startMonth: string;
  status: string;
  specialConsiderations?: string;
  studentCounts?: {
    expected: number;
    registered: number;
    ready: number;
  };
}

interface SchoolPair {
  school1: School;
  school2: School;
  hasPenPals?: boolean;
}

interface SchoolPairDisplayProps {
  pair: SchoolPair;
  showAssignButton?: boolean;
  showPenPalListButtons?: boolean;
  onAssignPenPals?: (school1Id: string, school2Id: string) => void;
  onViewPenPals?: (schoolId: string) => void;
}

export default function SchoolPairDisplay({ 
  pair, 
  showAssignButton = false,
  showPenPalListButtons = false,
  onAssignPenPals,
  onViewPenPals
}: SchoolPairDisplayProps) {
  const [copyButtonText1, setCopyButtonText1] = useState('Copy URL');
  const [copyButtonText2, setCopyButtonText2] = useState('Copy URL');
  const [emailCopyText1, setEmailCopyText1] = useState('✉');
  const [emailCopyText2, setEmailCopyText2] = useState('✉');

  const getDashboardUrl = (schoolId: string) => {
    const adminDashboardPath = `/admin/school-dashboard?schoolId=${schoolId}`;
    if (typeof window !== 'undefined') {
      const currentOrigin = window.location.origin;
      return `${currentOrigin}${adminDashboardPath}`;
    }
    return adminDashboardPath;
  };

  const openDashboard = (schoolId: string) => {
    const url = getDashboardUrl(schoolId);
    window.open(url, '_blank');
  };

  const copyDashboardUrl = async (schoolId: string, isSchool1: boolean) => {
    const url = getDashboardUrl(schoolId);
    try {
      await navigator.clipboard.writeText(url);
      if (isSchool1) {
        setCopyButtonText1('Copied');
        setTimeout(() => setCopyButtonText1('Copy URL'), 2000);
      } else {
        setCopyButtonText2('Copied');
        setTimeout(() => setCopyButtonText2('Copy URL'), 2000);
      }
    } catch (err) {
      console.error('Failed to copy URL:', err);
      prompt('Copy this URL:', url);
    }
  };

  const copyEmailAddress = async (email: string, isSchool1: boolean) => {
    try {
      await navigator.clipboard.writeText(email);
      if (isSchool1) {
        setEmailCopyText1('✓');
        setTimeout(() => setEmailCopyText1('✉'), 1500);
      } else {
        setEmailCopyText2('✓');
        setTimeout(() => setEmailCopyText2('✉'), 1500);
      }
    } catch (err) {
      console.error('Failed to copy email:', err);
      prompt('Copy this email:', email);
    }
  };

  const renderCompactSchoolCard = (school: School, isSchool1: boolean) => {
    const copyButtonText = isSchool1 ? copyButtonText1 : copyButtonText2;
    const emailCopyText = isSchool1 ? emailCopyText1 : emailCopyText2;

    return (
      <div style={{
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '6px',
        padding: '12px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontWeight: '300'
      }}>
        
        {/* Compact Header: School Name + Teacher */}
        <div style={{ marginBottom: '8px' }}>
          <h4 style={{
            margin: '0 0 2px 0',
            fontSize: '16px',
            fontWeight: '300',
            color: '#111',
            lineHeight: '1.2'
          }}>
            {school.schoolName}
          </h4>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: '300',
            color: '#555'
          }}>
            <span>{school.teacherName}</span>
            <button
              onClick={() => copyEmailAddress(school.teacherEmail, isSchool1)}
              className="btn-icon"
              style={{
                fontSize: '16px',
                color: '#666',
                fontWeight: '300'
              }}
              title={`Copy email: ${school.teacherEmail}`}
            >
              {emailCopyText}
            </button>
            <span style={{ color: '#888', fontSize: '11px' }}>
              • Grades {school.gradeLevel}
            </span>
          </div>
        </div>

        {/* Horizontal Data + Buttons Layout */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px'
        }}>
          
          {/* Data in single horizontal row */}
          <div style={{
            display: 'flex',
            gap: '16px',
            fontSize: '11px',
            fontWeight: '300'
          }}>
            <div>
              <span style={{ color: '#999', fontSize: '10px' }}>Region </span>
              <span style={{ color: '#333', fontWeight: '300' }}>{school.region.toUpperCase()}</span>
            </div>
            
            <div>
              <span style={{ color: '#999', fontSize: '10px' }}>Start </span>
              <span style={{ color: '#333', fontWeight: '300' }}>{school.startMonth.toUpperCase()}</span>
            </div>
            
            <div>
              <span style={{ color: '#999', fontSize: '10px' }}>Ready </span>
              <span style={{ color: '#333', fontWeight: '300' }}>{school.studentCounts?.ready || 0}</span>
            </div>
          </div>

          {/* Buttons stacked vertically and aligned to the right */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            marginLeft: 'auto'
          }}>
            <button
              onClick={() => openDashboard(school.id)}
              style={{
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '3px',
                color: '#555',
                fontSize: '11px',
                fontWeight: '400',
                cursor: 'pointer',
                padding: '4px 8px',
                textAlign: 'center',
                minWidth: '90px'
              }}
              title="Open school dashboard in new tab"
            >
              Open Dashboard
            </button>

            <button
              onClick={() => copyDashboardUrl(school.id, isSchool1)}
              style={{
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '3px',
                color: '#555',
                fontSize: '11px',
                fontWeight: '400',
                cursor: 'pointer',
                padding: '4px 8px',
                textAlign: 'center',
                minWidth: '90px'
              }}
              title="Copy school dashboard URL to clipboard"
            >
              {copyButtonText === 'Copy URL' ? 'Copy URL' : 'Copied'}
            </button>

            {showPenPalListButtons && onViewPenPals && (
              <button
                onClick={() => onViewPenPals(school.id)}
                style={{
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '3px',
                  color: '#555',
                  fontSize: '11px',
                  fontWeight: '400',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  textAlign: 'center',
                  minWidth: '90px'
                }}
                title="View pen pal list for this school"
              >
                View Pen Pals
              </button>
            )}
          </div>
          
        </div>

        {/* Special Considerations - if present */}
        {school.specialConsiderations && (
          <div style={{
            color: '#777',
            fontSize: '10px',
            fontStyle: 'italic',
            fontWeight: '300',
            marginTop: '6px',
            paddingTop: '6px',
            borderTop: '1px solid #f0f0f0',
            lineHeight: '1.3'
          }}>
            {school.specialConsiderations}
          </div>
        )}
      </div>
    );
  };

  const renderLinkIcon = () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '20px'
    }}>
      <div style={{
        background: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666'
      }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      </div>
    </div>
  );

  return (
    <div style={{
      background: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      borderLeft: '3px solid #28a745'
    }}>
      
      {/* Compact School Pair Container - Same width as single school */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 20px 1fr',
        gap: '12px',
        alignItems: 'start'
      }}>
        
        {/* School 1 - Compact */}
        {renderCompactSchoolCard(pair.school1, true)}
        
        {/* Link Icon */}
        {renderLinkIcon()}
        
        {/* School 2 - Compact */}
        {renderCompactSchoolCard(pair.school2, false)}
        
      </div>

      {/* Action Buttons Row - spans full width below the pair */}
      {(showAssignButton || pair.hasPenPals) && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #f0f0f0'
        }}>
          
          {showAssignButton && onAssignPenPals && !pair.hasPenPals && (
            <button
              onClick={() => onAssignPenPals(pair.school1.id, pair.school2.id)}
              className="btn btn-primary"
              style={{ minWidth: '140px', fontSize: '12px' }}
            >
              Assign Pen Pals
            </button>
          )}

          {pair.hasPenPals && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#28a745',
              fontWeight: '500',
              fontSize: '12px'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              Pen Pals Assigned
            </div>
          )}
          
        </div>
      )}

    </div>
  );
}
