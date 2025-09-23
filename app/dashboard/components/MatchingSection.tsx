// /app/dashboard/components/MatchingSection.tsx
"use client";

import MatchingStatusCard from './MatchingStatusCard';
import MatchedSchoolDisplay from './MatchedSchoolDisplay';

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

interface MatchingSectionProps {
  schoolData: SchoolData;
  allActiveStudentsComplete: boolean;
  matchedSchoolTeacher?: string;
  matchedSchoolEmail?: string;
  matchedSchoolRegion?: string;
}

export default function MatchingSection({
  schoolData,
  allActiveStudentsComplete,
  matchedSchoolTeacher,
  matchedSchoolEmail,
  matchedSchoolRegion
}: MatchingSectionProps) {
  
  // Check if school is matched
  const isMatched = schoolData?.matchedWithSchoolId != null;
  const hasMatchedSchoolInfo = schoolData?.matchedSchoolName != null;

  // Show matched school display when matched, otherwise show matching status
  if (isMatched && hasMatchedSchoolInfo && schoolData.matchedSchoolName) {
    return (
      <MatchedSchoolDisplay
        schoolData={schoolData}
        matchedSchoolName={schoolData.matchedSchoolName}
        matchedSchoolTeacher={matchedSchoolTeacher}
        matchedSchoolEmail={matchedSchoolEmail}
        matchedSchoolRegion={matchedSchoolRegion}
      />
    );
  }

  // Show regular matching status card
  return (
    <MatchingStatusCard 
      schoolData={schoolData}
      allActiveStudentsComplete={allActiveStudentsComplete}
    />
  );
}
