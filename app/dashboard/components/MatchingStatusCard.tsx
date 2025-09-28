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
  matchedSchool?: {
    id: string;
    schoolName: string;
    teacherName: string;
    teacherEmail: string;
    schoolCity?: string;
    schoolState?: string;
    expectedClassSize: number;
    region: string;
  };
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
  
  // Check if school is already matched
  const isMatched = schoolData?.matchedWithSchoolId != null;
  
  // Use status field for ready state
  const readyForPairing = schoolData?.status === 'READY';
  
  // Show the card when:
  // 1. Status is READY but not matched yet (pending pairing request)
  // 2. School is matched but no pen pals assigned yet (waiting for partner)
  const shouldShowCard = readyForPairing || (isMatched && !readOnly && !isAdminView);
  
  if (!shouldShowCard) {
    return null;
  }

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h3 style={{ 
            color: '#1f2937', 
            marginBottom: '1rem', 
            fontSize: '1.4rem',
            fontWeight: '400',
            margin: 0
          }}>
            Ready for Pen Pals
          </h3>
          <p className="text-meta-info" style={{ marginBottom: '0' }}>
            {readOnly && !isAdminView
              ? 'This school is ready for pen pal pairing and is waiting for a partner school.'
              : isAdminView
              ? 'This school is ready for pen pal pairing and is waiting for a partner school.'
              : isMatched && schoolData.matchedSchool
              ? `Ready for pen pals. When ${schoolData.matchedSchool.schoolName} is done collecting student data, pen pals will be paired.`
              : isMatched
              ? 'Ready for pen pals. When your partner school is done collecting student data, pen pals will be paired.'
              : 'Waiting for partner school. We will email you when matching is complete.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
