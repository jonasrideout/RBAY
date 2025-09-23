// /app/dashboard/components/MatchingStatusCard.tsx
"use client";

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
  readOnly?: boolean;
  isAdminView?: boolean;
}

export default function MatchingStatusCard({ 
  schoolData, 
  allActiveStudentsComplete, 
  readOnly = false,
  isAdminView = false 
}: MatchingStatusCardProps) {
  
  // Check if school is already matched (this takes priority over status)
  const isMatched = schoolData?.matchedWithSchoolId != null;
  
  // Use status field for ready state (only relevant if not already matched)
  const readyForMatching = schoolData?.status === 'READY';

  // Only show status when in matching process (not when just ready)
  if (!readyForMatching && !isMatched) {
    return null;
  }

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          {isMatched ? (
            <>
              <h3 style={{ 
                color: '#1f2937', 
                marginBottom: '1rem', 
                fontSize: '1.4rem',
                fontWeight: '400',
                margin: 0
              }}>
                Matched with Partner School
              </h3>
              <p className="text-data-value" style={{ marginBottom: '0.5rem' }}>
                <span className="text-data-label">Partner School:</span> {schoolData.matchedSchoolName || 'Loading...'}
              </p>
              <p className="text-meta-info" style={{ marginBottom: '0', marginTop: '0.5rem' }}>
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
              <h3 style={{ 
                color: '#1f2937', 
                marginBottom: '1rem', 
                fontSize: '1.4rem',
                fontWeight: '400',
                margin: 0
              }}>
                Matching Requested
              </h3>
              <p className="text-meta-info" style={{ marginBottom: '0' }}>
                {readOnly && !isAdminView
                  ? 'This school has requested matching and is waiting for a partner school.'
                  : isAdminView
                  ? 'This school has requested matching and is waiting for a partner school.'
                  : 'Waiting for partner school. We will email you when matching is complete.'
                }
              </p>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
