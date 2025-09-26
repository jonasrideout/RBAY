// /app/dashboard/components/MatchedSchoolDisplay.tsx
"use client";

import { useState, useEffect } from 'react';

interface SchoolData {
  id: string;
  schoolName: string;
  teacherName: string;
  teacherEmail: string;
  dashboardToken: string;
  expectedClassSize: number;
  startMonth: string;
  programStartMonth: string;
  status: 'COLLECTING' | 'READY' | 'MATCHED' | 'CORRESPONDING' | 'DONE';
  students: any[];
  matchedWithSchoolId?: string;
  matchedSchoolName?: string;
}

interface MatchedSchoolDisplayProps {
  schoolData: SchoolData;
  matchedSchoolName: string;
  matchedSchoolTeacher?: string;
  matchedSchoolEmail?: string;
  matchedSchoolRegion?: string;
}

export default function MatchedSchoolDisplay({ 
  schoolData, 
  matchedSchoolName,
  matchedSchoolTeacher,
  matchedSchoolEmail,
  matchedSchoolRegion
}: MatchedSchoolDisplayProps) {
  const [emailCopyText, setEmailCopyText] = useState('✉');
  const [hasStudentPairings, setHasStudentPairings] = useState(false);
  const [isCheckingPairings, setIsCheckingPairings] = useState(true);

  // Check if student pairings exist
  useEffect(() => {
    const checkStudentPairings = async () => {
      if (!schoolData.matchedWithSchoolId) {
        setIsCheckingPairings(false);
        return;
      }

      try {
        const response = await fetch(`/api/schools/${schoolData.id}/student-pairings`);
        if (response.ok) {
          const data = await response.json();
          setHasStudentPairings(data.hasPairings || false);
        }
      } catch (err) {
        console.error('Error checking student pairings:', err);
      } finally {
        setIsCheckingPairings(false);
      }
    };

    checkStudentPairings();
  }, [schoolData.id, schoolData.matchedWithSchoolId]);

  const copyEmailAddress = async () => {
    if (!matchedSchoolEmail) return;

    try {
      await navigator.clipboard.writeText(matchedSchoolEmail);
      setEmailCopyText('✓');
      setTimeout(() => setEmailCopyText('✉'), 1500);
    } catch (err) {
      console.error('Failed to copy email:', err);
      prompt('Copy this email:', matchedSchoolEmail);
    }
  };

  const openPenPalList = () => {
    const penPalListUrl = `/admin/pen-pal-list?schoolId=${schoolData.id}`;
    window.open(penPalListUrl, '_blank');
  };

  // Get expected class size from matched school data or use a fallback
  const expectedStudents = schoolData.expectedClassSize || '—';

  return (
    <div className="card" style={{ 
      marginBottom: '2rem',
      background: '#f8f9fa', 
      borderLeft: '3px solid #2c5aa0',
      padding: '1rem 1.5rem'
    }}>
      {/* Row 1: Header */}
      <h3 style={{ 
        color: '#333', 
        fontSize: '1.2rem',
        fontWeight: '400',
        margin: '0 0 1rem 0'
      }}>
        Matched with Partner School
      </h3>

      {/* Row 2: School Info in single line */}
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1rem',
        flexWrap: 'wrap'
      }}>
        <div className="text-data-value" style={{ 
          fontSize: '1.1rem',
          fontWeight: '400',
          color: '#333'
        }}>
          {matchedSchoolName}
        </div>
        
        <div style={{ color: '#999' }}>|</div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem'
        }}>
          <span className="text-data-value">
            {matchedSchoolTeacher || '—'}
          </span>
          {matchedSchoolEmail && (
            <button
              onClick={copyEmailAddress}
              className="btn-icon btn-icon-email"
              title={`Copy email: ${matchedSchoolEmail}`}
              style={{
                fontSize: '16px',
                color: '#666',
                fontWeight: '300',
                marginLeft: '0.25rem'
              }}
            >
              {emailCopyText}
            </button>
          )}
        </div>

        <div style={{ color: '#999' }}>|</div>
        
        <div className="text-data-value">
          {expectedStudents} students
        </div>

        <div style={{ color: '#999' }}>|</div>
        
        <div className="text-data-value">
          {matchedSchoolRegion || '—'}
        </div>
      </div>

      {/* Row 3: Updated Message */}
      <div className="text-meta-info" style={{ 
        margin: '0',
        fontSize: '14px'
      }}>
        Pen pals will be paired when both schools have completed collecting student information.
      </div>

      {/* Pen Pal List Button - only show when pairings exist */}
      {hasStudentPairings && (
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button 
            onClick={openPenPalList}
            className="btn btn-success"
            style={{ minWidth: '200px' }}
          >
            View Pen Pal Assignments
          </button>
        </div>
      )}

      {/* Loading state for pairings check */}
      {isCheckingPairings && (
        <div style={{ 
          marginTop: '0.5rem',
          textAlign: 'center', 
          color: '#666',
          fontSize: '14px',
          fontStyle: 'italic'
        }}>
          Checking for pen pal assignments...
        </div>
      )}
    </div>
  );
}
