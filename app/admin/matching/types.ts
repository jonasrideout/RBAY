// app/admin/matching/types.ts

export interface School {
  id: string;
  schoolName: string;
  teacherFirstName: string;
  teacherLastName: string;
  teacherEmail: string;
  region: string;
  gradeLevel: string[];
  expectedClassSize: number;
  startMonth: string;
  letterFrequency: string;
  status: 'COLLECTING' | 'READY' | 'MATCHED' | 'CORRESPONDING' | 'DONE';
  lettersSent: number;
  lettersReceived: number;
  matchedWithSchoolId?: string;
  matchedSchool?: School;
  studentCounts: {
    expected: number;
    registered: number;
    ready: number;
  };
}

export interface StatusCounts {
  COLLECTING: number;
  READY: number;
  MATCHED: number;
  CORRESPONDING: number;
  DONE: number;
}

export type SelectedStatus = keyof StatusCounts;

export interface Filters {
  regions: string[];
  classSizes: string[];
  startDate: string;
  grades: string[];
}

export interface MatchingState {
  pinnedSchool: School | null;
  selectedMatch: School | null;
  showConfirmDialog: boolean;
  showWarning: boolean;
}
