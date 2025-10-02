// /app/admin/matching/types.ts
export interface School {
  id: string;
  schoolName: string;
  teacherName: string;
  teacherEmail: string;
  dashboardToken: string;
  schoolAddress?: string;
  schoolCity?: string;
  schoolState: string;
  schoolZip?: string;
  region: string;
  gradeLevel: string;
  expectedClassSize: number;
  startMonth: string;
  letterFrequency?: string;
  status: 'COLLECTING' | 'READY' | 'MATCHED' | 'CORRESPONDING' | 'DONE';
  specialConsiderations?: string;
  createdAt: Date;
  updatedAt: Date;
  matchedWithSchoolId?: string;
  matchedSchool?: School;
  schoolGroupId?: string;  // NEW: For school group membership
  studentCounts?: {
    expected: number;
    registered: number;
    ready: number;
  };
  penPalAssignments?: {
    hasAssignments: boolean;
    studentsWithPenPals: number;
    totalStudents: number;
    allStudentsAssigned: boolean;
    assignmentPercentage: number;
  };
  studentStats?: {
    hasPenpalAssignments: boolean;
  };
}

export interface StatusCounts {
  COLLECTING: number;
  READY: number;
  MATCHED: number;
  CORRESPONDING: number;
  DONE: number;
}

export type SelectedStatus = 'COLLECTING' | 'READY' | 'MATCHED' | 'CORRESPONDING' | 'DONE';

export interface Filters {
  schoolSearch?: string;
  teacherSearch?: string;
  regions: string[];
  statuses: string[];
  classSizes: string[];
  grades: string[];
  startDate?: string;
}
