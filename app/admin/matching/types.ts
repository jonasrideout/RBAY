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
  schoolGroupId?: string;
  schoolGroup?: {
    id: string;
    name: string;
    matchedWithGroupId?: string;
    schools: {
      id: string;
      schoolName: string;
      teacherName: string;
      gradeLevel: string; // ADDED
      specialConsiderations?: string; // ADDED
      studentCount: number; // ADDED
    }[];
  };
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
  penPalPreferences?: {
    studentsWithMultiple: number;
    requiredMultiple: number;
    meetsRequirement: boolean;
  };
  studentStats?: {
    hasPenpalAssignments: boolean;
  };
}

export interface SchoolGroup {
  id: string;
  name: string;
  type: 'group';
  matchedWithGroupId?: string;
  matchedWithGroup?: {
    id: string;
    name: string;
  };
  schools: {
    id: string;
    schoolName: string;
    teacherName: string;
    studentCount: number;
    gradeLevel: string;
    specialConsiderations?: string;
  }[];
  studentCounts: {
    total: number;
    ready: number;
  };
  penPalAssignments: {
    hasAssignments: boolean;
    studentsWithPenPals: number;
    totalStudents: number;
    allStudentsAssigned: boolean;
    assignmentPercentage: number;
  };
  penPalPreferences: {
    studentsWithMultiple: number;
    requiredMultiple: number;
    meetsRequirement: boolean;
  };
  isReadyForMatching: boolean;
}

export type MatchableUnit = School | SchoolGroup;

export function isSchool(unit: MatchableUnit): unit is School {
  return !('type' in unit) || unit.type !== 'group';
}

export function isGroup(unit: MatchableUnit): unit is SchoolGroup {
  return 'type' in unit && unit.type === 'group';
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

export interface MatchedPair {
  unit1: MatchableUnit;
  unit2: MatchableUnit;
  hasStudentPairings: boolean;
  bothUnitsReady: boolean;
  matchType: 'school-school' | 'group-group' | 'group-school';
}
