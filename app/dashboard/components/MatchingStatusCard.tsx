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
  readyForMatching: boolean;
  students: any[];
}

interface MatchingStatusCardProps {
  schoolData: SchoolData;
  allActiveStudentsComplete: boolean;
  onMatchingRequested: () => void;
}

export default function MatchingStatusCard({ schoolData, allActiveStudentsComplete, onMatchingRequested }: MatchingStatusCardProps) {
  const [isRequestingMatching, setIsRequestingMatching] = useState(false);
  
  const readyForMatching = schoolData?.readyForMatching || false;

  const handleRequestMatching = async () => {
    setIsRequestingMatching(true);
    
    try {
      const response = await fetch('/api/schools/request-matching', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dashboardToken: schoolData.dashboardToken })
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

  // Only show when all students have complete profiles
  if (!allActiveStudentsComplete) {
    return null;
  }

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <div>
        {readyForMatching ? (
          <>
            <h3 style={{ color: '#17a2b8', marginBottom: '0.5rem' }}>
              🎯 Matching Requested
            </h3>
            <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
              Waiting for partner school. We will email you when matching is complete.
            </p>
          </>
        ) : (
          <>
            <h3 style={{ color: '#28a745', marginBottom: '0.5rem' }}>
              ✅ Ready for Matching!
            </h3>
            <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
              All active students have provided their interest information. You can request matching when ready!
            </p>
          </>
        )}
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            className="btn" 
            style={{ 
              backgroundColor: readyForMatching ? '#17a2b8' : '#28a745', 
              color: 'white', 
              cursor: isRequestingMatching ? 'not-allowed' : 'pointer',
              padding: '1rem 2rem',
              fontSize: '1.1rem'
            }}
            disabled={isRequestingMatching}
            onClick={handleRequestMatching}
            title={readyForMatching ? "Matching has been requested" : "Request matching with current students"}
          >
            {readyForMatching ? '✅ Matching Requested' : (isRequestingMatching ? (
              <>
                <span className="loading"></span>
                <span style={{ marginLeft: '0.5rem' }}>Requesting...</span>
              </>
            ) : '🎯 Request Matching')}
          </button>
          
          <p style={{ color: '#6c757d', fontSize: '0.9rem', margin: '0' }}>
            All students ready - you can request matching anytime!
          </p>
        </div>
      </div>
    </div>
  );
}
