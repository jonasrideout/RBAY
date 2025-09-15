// /app/dashboard/components/MatchingStatusCard.tsx
"use client";

import { useState } from 'react';

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

interface MatchingStatusCardProps {
  schoolData: SchoolData;
  allActiveStudentsComplete: boolean;
  onMatchingRequested: () => void;
  readOnly?: boolean;
  isAdminView?: boolean; // New prop to identify admin view
}

export default function MatchingStatusCard({ 
  schoolData, 
  allActiveStudentsComplete, 
  onMatchingRequested, 
  readOnly = false,
  isAdminView = false 
}: MatchingStatusCardProps) {
  const [isRequestingMatching, setIsRequestingMatching] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Check if school is already matched (this takes priority over status)
  const isMatched = schoolData?.matchedWithSchoolId != null;
  
  // Use status field for ready state (only relevant if not already matched)
  const readyForMatching = schoolData?.status === 'READY';

  const handleRequestMatchingClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmMatching = async () => {
    setShowConfirmation(false);
    setIsRequestingMatching(true);
    
    try {
      const response = await fetch('/api/schools/request-matching', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          teacherEmail: schoolData.teacherEmail,
          dashboardToken: schoolData.dashboardToken 
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to request matching');
      }
      
      onMatchingRequested();
      
    } catch (err: any) {
      alert('Error requesting matching: ' + err.message);
    } finally {
      setIsRequestingMatching(false);
    }
  };

  const handleCancelMatching = () => {
    setShowConfirmation(false);
  };

  // Only show when all students have complete profiles
  if (!allActiveStudentsComplete) {
    return null;
  }

  return (
    <>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            {isMatched ? (
              <>
                <h3 style={{ color: '#007bff', marginBottom: '0.5rem' }}>
                  🤝 Matched with Partner School
                </h3>
                <p style={{ color: '#6c757d', marginBottom: '0' }}>
                  <strong>Partner School:</strong> {schoolData.matchedSchoolName || 'Loading...'}
                </p>
                <p style={{ color: '#6c757d', marginBottom: '0', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  {readOnly && !isAdminView
                    ? 'This school has been matched with a partner school and can begin the correspondence phase.'
                    : isAdminView
                    ? 'This school has been matched with a partner school.'
                    : 'Your students have been matched with a partner school! Student pairings will be completed soon.'
                  }
                </p>
              </>
            ) : readyForMatching ? (
              <>
                <h3 style={{ color: '#17a2b8', marginBottom: '0.5rem' }}>
                  🎯 Matching Requested
                </h3>
                <p style={{ color: '#6c757d', marginBottom: '0' }}>
                  {readOnly && !isAdminView
                    ? 'This school has requested matching and is waiting for a partner school.'
                    : isAdminView
                    ? 'This school has requested matching and is waiting for a partner school.'
                    : 'Waiting for partner school. We will email you when matching is complete.'
                  }
                </p>
              </>
            ) : (
              <>
                <h3 style={{ color: '#28a745', marginBottom: '0.5rem' }}>
                  ✅ Ready for Matching!
                </h3>
                <p style={{ color: '#6c757d', marginBottom: '0' }}>
                  {readOnly && !isAdminView
                    ? 'All active students have provided their interest information. This school can request matching.'
                    : isAdminView
                    ? 'All students ready - you can request matching anytime!'
                    : 'All active students have provided their interest information. You can request matching when ready!'
                  }
                </p>
              </>
            )}
          </div>
          
          {/* Show action buttons only if not already matched and (in admin view or when not read-only) */}
          {!isMatched && (!readOnly || isAdminView) && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
              <button 
                className="btn" 
                style={{ 
                  backgroundColor: readyForMatching ? '#17a2b8' : '#28a745', 
                  color: 'white', 
                  cursor: (isRequestingMatching || readyForMatching) ? 'not-allowed' : 'pointer',
                  padding: '1rem 2rem',
                  fontSize: '1.1rem'
                }}
                disabled={isRequestingMatching || readyForMatching}
                onClick={handleRequestMatchingClick}
                title={readyForMatching ? "Matching has been requested" : `Request matching for ${schoolData.schoolName}`}
              >
                {readyForMatching ? '✅ Matching Requested' : (isRequestingMatching ? (
                  <>
                    <span className="loading"></span>
                    <span style={{ marginLeft: '0.5rem' }}>Requesting...</span>
                  </>
                ) : isAdminView ? `✅ Request Matching for ${schoolData.schoolName}` : '🎯 Request Matching')}
              </button>
              
              <p style={{ color: '#6c757d', fontSize: '0.9rem', margin: '0', textAlign: 'right' }}>
                {isAdminView 
                  ? 'All students ready - you can request matching anytime!'
                  : 'All students ready - you can request matching anytime!'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog - show for both admin and teacher views when not read-only and not already matched */}
      {!isMatched && (!readOnly || isAdminView) && showConfirmation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}>
            <h3 style={{ color: '#495057', marginBottom: '1rem' }}>
              {isAdminView ? `Request Matching for ${schoolData.schoolName}` : 'Confirm Matching Request'}
            </h3>
            <p style={{ color: '#6c757d', marginBottom: '2rem', lineHeight: '1.5' }}>
              {isAdminView 
                ? `Are you ready to request matching for ${schoolData.schoolName}? This will submit their class roster for the matching process.`
                : 'Are you ready to request matching for your students? This will submit your class roster for the matching process.'
              }
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={handleCancelMatching}
                className="btn"
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  padding: '0.75rem 1.5rem'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmMatching}
                className="btn"
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  padding: '0.75rem 1.5rem'
                }}
              >
                Yes, Request Matching
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
