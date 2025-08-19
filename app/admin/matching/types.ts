// /app/admin/matching/types.ts

export interface School {
  id: string;
  schoolName: string;
  teacherName: string; // UPDATED: Single field instead of separate first/last
  teacherEmail: string;
  schoolAddress?: string;
  schoolCity?: string;
  schoolState: string;
  schoolZip?: string;
  region: string;
  gradeLevel: string; // UPDATED: String format instead of array
  expectedClassSize: number;
  startMonth: string;
  letterFrequency?: string;
  status: 'COLLECTING' | 'READY' | 'MATCHED' | 'CORRESPONDING' | 'DONE';
  specialConsiderations?: string;
  createdAt: Date;
  updatedAt: Date;
  matchedWithSchoolId?: string;
  matchedSchool?: School;
  studentCounts?: {
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

export type SelectedStatus = 'COLLECTING' | 'READY' | 'MATCHED' | 'CORRESPONDING' | 'DONE';

export interface Filters {
  schoolSearch?: string;
  teacherSearch?: string;
  regions: string[];
  classSizes: string[];
  grades: string[];
  startDate?: string;
}
