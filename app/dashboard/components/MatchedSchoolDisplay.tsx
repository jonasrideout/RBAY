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

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <div style={{ marginBottom: hasStudentPairings ? '1.5rem' : '0' }}>
        <h3 style={{ 
          color: '#1f2937', 
          marginBottom: '1rem', 
          fontSize: '1.4rem',
          fontWeight: '400',
          margin: '0 0 1rem 0'
        }}>
          Matched with Partner School
        </h3>

        {/* Partner School Info */}
        <div style={{ 
          background: '#fafafa', 
          padding: '1.5rem', 
          borderRadius: '6px', 
          border: '1px solid #e0e0e0',
          marginBottom: hasStudentPairings ? '1rem' : '0'
        }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <h4 className="text-data-value" style={{ 
              marginBottom: '0.25rem',
              fontSize: '1.2rem',
              fontWeight: '400'
            }}>
              {matchedSchoolName}
            </h4>
          </div>

          {/* Teacher info with email copy button */}
          {matchedSchoolTeacher && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginBottom: '0.5rem'
            }}>
              <span className="text-data-value">
                Teacher: {matchedSchoolTeacher}
              </span>
              {matchedSchoolEmail && (
                <button
                  onClick={copyEmailAddress}
                  className="btn-icon btn-icon-email"
                  title={`Copy email: ${matchedSchoolEmail}`}
                  style={{
                    fontSize: '18px',
                    color: '#666',
                    fontWeight: '300'
                  }}
                >
                  {emailCopyText}
                </button>
              )}
            </div>
          )}

          {/* Region info */}
          {matchedSchoolRegion && (
            <div className="text-meta-info">
              Region: {matchedSchoolRegion}
            </div>
          )}

          <p className="text-meta-info" style={{ 
            marginBottom: '0',
            marginTop: '1rem'
          }}>
            Your students have been matched with a partner school! 
            {hasStudentPairings 
              ? ' Individual pen pal assignments are ready.' 
              : ' Individual pen pal assignments will be completed soon.'
            }
          </p>
        </div>

        {/* Pen Pal List Button */}
        {hasStudentPairings && (
          <div style={{ textAlign: 'center' }}>
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
            textAlign: 'center', 
            color: '#666',
            fontSize: '14px',
            fontStyle: 'italic'
          }}>
            Checking for pen pal assignments...
          </div>
        )}
      </div>
    </div>
  );
}
