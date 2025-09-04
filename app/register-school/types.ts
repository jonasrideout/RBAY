// /app/register-school/types.ts
export interface SchoolFormData {
  teacherName: string;
  teacherEmail: string;
  teacherPhone: string;
  schoolName: string;
  schoolCity: string; // Changed from schoolAddress, now optional
  schoolState: string;
  gradeLevels: string[];
  classSize: string;
  programStartMonth: string;
  specialConsiderations: string;
  programAgreement: boolean;
  parentNotification: boolean;
}
