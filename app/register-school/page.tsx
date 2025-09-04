// Changes needed in /app/register-school/page.tsx

// CHANGE 1: Update the validation check (around line 67)
// FROM:
if (!formData.programAgreement || !formData.parentNotification) {
  setError('Please check both agreement boxes to continue');
  setIsLoading(false);
  return;
}

// TO:
if (!formData.programAgreement) {
  setError('Please check the agreement box to continue');
  setIsLoading(false);
  return;
}

// CHANGE 2: Remove parentNotification from API payload (around line 90)
// FROM:
const dataToSend = {
  teacherName: formData.teacherName,
  teacherEmail: formData.teacherEmail,
  teacherPhone: formData.teacherPhone,
  schoolName: formData.schoolName,
  schoolCity: formData.schoolCity,
  schoolAddress: '',
  schoolState: formData.schoolState,
  schoolZip: '',
  region,
  gradeLevel: formData.gradeLevels.join(', '),
  expectedClassSize: formData.classSize,
  startMonth: formData.programStartMonth,
  specialConsiderations: formData.specialConsiderations,
  programAgreement: formData.programAgreement,
  parentNotification: formData.parentNotification  // <- REMOVE THIS LINE
};

// TO:
const dataToSend = {
  teacherName: formData.teacherName,
  teacherEmail: formData.teacherEmail,
  teacherPhone: formData.teacherPhone,
  schoolName: formData.schoolName,
  schoolCity: formData.schoolCity,
  schoolAddress: '',
  schoolState: formData.schoolState,
  schoolZip: '',
  region,
  gradeLevel: formData.gradeLevels.join(', '),
  expectedClassSize: formData.classSize,
  startMonth: formData.programStartMonth,
  specialConsiderations: formData.specialConsiderations,
  programAgreement: formData.programAgreement
  // parentNotification removed since we combined the checkboxes
};
