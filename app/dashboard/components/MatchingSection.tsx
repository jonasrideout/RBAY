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
  mailingAddress?: string;
  communicationPlatforms?: any;
  matchedSchool?: {
    id: string;
    schoolName: string;
    teacherName: string;
    teacherEmail: string;
    schoolCity?: string;
    schoolState?: string;
    expectedClassSize: number;
    region: string;
    isGroup?: boolean;
    mailingAddress?: string;
    schools?: Array<{
      id: string;
      schoolName: string;
      teacherName: string;
      mailingAddress?: string;
    }>;
  };
  studentStats?: {
    expected: number;
    registered: number;
    ready: number;
    studentsWithPenpals: number;
    hasPenpalAssignments: boolean;
  };
}

interface MatchingSectionProps {
  schoolData: SchoolData;
  allActiveStudentsComplete: boolean;
  matchedSchoolTeacher?: string;
  matchedSchoolRegion?: string;
  onSchoolUpdated?: () => void;
  readOnly?: boolean;
  isAdminView?: boolean;
}

export default function MatchingSection({
  schoolData,
  allActiveStudentsComplete,
  matchedSchoolTeacher,
  matchedSchoolRegion,
  onSchoolUpdated,
  readOnly = false,
  isAdminView = false
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
      readOnly={readOnly}
      isAdminView={isAdminView}
      onSchoolUpdated={onSchoolUpdated}
    />
  );
}
