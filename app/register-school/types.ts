// /app/register-school/types.ts

export interface SchoolFormData {
  teacherFirstName: string;
  teacherLastName: string;
  teacherEmail: string;
  teacherPhone: string;
  schoolName: string;
  schoolCity: string; // Changed from schoolAddress, now optional
  schoolState: string;
  gradeLevels: string[];
  classSize: string;
  programStartMonth: string;
  letterFrequency: string;
  specialConsiderations: string;
  programAgreement: boolean;
  parentNotification: boolean;
}
