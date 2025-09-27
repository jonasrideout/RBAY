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
  
  // Check if school is already matched (this takes priority over status)
  const isMatched = schoolData?.matchedWithSchoolId != null;
  
  // Use status field for ready state (only relevant if not already matched)
  const readyForPairing = schoolData?.status === 'READY';
  
  // Hide container when empty (when matched, since info is now in the 5th metric box)
  if (isMatched) {
    return null;
  }

  // Also hide if not ready for pairing (empty state)
  if (!readyForPairing) {
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
              : schoolData.matchedSchool
              ? `Ready for pen pals. When ${schoolData.matchedSchool.schoolName} is done collecting student data, pen pals will be paired.`
              : 'Ready for pen pals. When your partner school is done collecting student data, pen pals will be paired.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
