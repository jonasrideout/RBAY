// /app/register-school/types.ts
export interface SchoolFormData {
  teacherName: string;
  teacherEmail: string;
  teacherPhone: string;
  schoolName: string;
  schoolCity: string;
  schoolState: string;
  schoolCountry: string;
  gradeLevels: string[];
  classSize: string;
  programStartMonth: string;
  specialConsiderations: string;
  parentNotification: boolean;
  communicationPlatforms: string[];
  communicationPlatformsOther: string;
  mailingAddress: string;
  hasMultipleClasses: boolean;
  teacherNames: string[];
}
