// /app/dashboard/components/MatchingSection.tsx
"use client";

import MatchingStatusCard from './MatchingStatusCard';

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
  schoolState?: string;
  schoolCity?: string;
  gradeLevel?: string;
  teacherPhone?: string;
  specialConsiderations?: string;
}

interface MatchingSectionProps {
  schoolData: SchoolData;
  allActiveStudentsComplete: boolean;
  matchedSchoolTeacher?: string;
  matchedSchoolRegion?: string;
  onSchoolUpdated?: () => void;
}

export default function MatchingSection({
  schoolData,
  allActiveStudentsComplete,
  matchedSchoolTeacher,
  matchedSchoolRegion,
  onSchoolUpdated
}: MatchingSectionProps) {
  
  // Check if school is matched
  const isMatched = schoolData?.matchedWithSchoolId != null;
  const hasMatchedSchoolInfo = schoolData?.matchedSchoolName != null;

  // Don't show MatchedSchoolDisplay anymore - info is now in the 5th metric box
  // Just show matching status card for all cases

  // Show regular matching status card
  return (
    <MatchingStatusCard 
      schoolData={schoolData}
      allActiveStudentsComplete={allActiveStudentsComplete}
      onSchoolUpdated={onSchoolUpdated}
    />
  );
}
