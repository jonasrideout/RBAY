// /app/register-student/components/StudentInfoStep.tsx

import BasicInfoForm from './BasicInfoForm';
import InterestsForm from './InterestsForm';
import OtherInterestsForm from './OtherInterestsForm';

interface SchoolInfo {
  name: string;
  teacher: string;
  found: boolean;
  schoolId: string;
  teacherEmail?: string;
  hasMultipleClasses?: boolean;
  teacherNames?: string[];
}

interface StudentFormData {
  schoolToken: string;
  firstName: string;
  lastInitial: string;
  grade: string;
  teacherName: string;
  interests: string[];
  otherInterests: string;
  penpalPreference: 'ONE' | 'MULTIPLE';
  parentConsent: boolean;
}

interface StudentInfoStepProps {
  schoolInfo: SchoolInfo | null;
  isTeacherFlow: boolean;
  formData: StudentFormData;
  error: string;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onUpdateFormData: (field: keyof StudentFormData, value: any) => void;
  onInterestChange: (interest: string, checked: boolean) => void;
}

// Small eyebrow label, matching the same convention used on the teacher
// dashboard (e.g. "YOUR SCHOOL" above the school name).
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: '11px', fontWeight: 500, color: '#8A87A0', textTransform: 'uppercase', letterSpacing: '0.03em', margin: '0 0 0.75rem' }}>
      {children}
    </p>
  );
}

export default function StudentInfoStep({
  schoolInfo,
  isTeacherFlow,
  formData,
  error,
  isLoading,
  onSubmit,
  onUpdateFormData,
  onInterestChange
}: StudentInfoStepProps) {
  return (
    <div style={{ maxWidth: '915px', margin: '0 auto' }}>
      <div style={{ background: '#F5F3FA', padding: '1rem 1.25rem', borderRadius: '14px', marginBottom: '1.5rem', border: '1px solid #DAD7E8' }}>
        <h4 style={{ color: '#8A87A0', marginBottom: '0.5rem', fontWeight: 300 }}>
          {isTeacherFlow ? 'Adding Student to:' : 'Your School:'}
        </h4>
        <p style={{ fontSize: '1.1rem', fontWeight: '300', color: '#3B3F8C', marginBottom: '0.25rem' }}>
          {schoolInfo?.name}
        </p>
        <p style={{ color: '#8A87A0', marginBottom: '0', fontSize: '0.95rem', fontWeight: 300 }}>
          Teacher: {schoolInfo?.teacher}
        </p>
      </div>

      <h2 className="text-h2 text-center mb-3" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#3B3F8C' }}>{isTeacherFlow ? 'Student Info' : 'Tell Us About Yourself'}</h2>
      <p className="text-center mb-4" style={{ color: '#8A87A0', fontWeight: 300 }}>
        {isTeacherFlow 
          ? "Helps us find your student a great penpal who shares their interests!"
          : "Helps us find you a great penpal who shares your interests!"
        }
      </p>

      <form onSubmit={onSubmit}>
        {/* Area 1: Student Info */}
        <div className="card" style={{ borderRadius: '20px', marginBottom: '1.25rem' }}>
          <SectionLabel>Student Info</SectionLabel>
          <BasicInfoForm
            isTeacherFlow={isTeacherFlow}
            firstName={formData.firstName}
            lastInitial={formData.lastInitial}
            grade={formData.grade}
            teacherName={formData.teacherName}
            penpalPreference={formData.penpalPreference}
            isLoading={isLoading}
            hasMultipleClasses={schoolInfo?.hasMultipleClasses || false}
            teacherNames={schoolInfo?.teacherNames || []}
            onFirstNameChange={(value) => onUpdateFormData('firstName', value)}
            onLastInitialChange={(value) => onUpdateFormData('lastInitial', value)}
            onGradeChange={(value) => onUpdateFormData('grade', value)}
            onTeacherNameChange={(value) => onUpdateFormData('teacherName', value)}
            onPenpalPreferenceChange={(value) => onUpdateFormData('penpalPreference', value)}
          />
        </div>

        {/* Area 2: Interests */}
        <div className="card" style={{ borderRadius: '20px', marginBottom: '1.25rem' }}>
          <SectionLabel>{isTeacherFlow ? 'Interests & Hobbies' : 'Your Interests & Hobbies'}</SectionLabel>
          <InterestsForm
            isTeacherFlow={isTeacherFlow}
            interests={formData.interests}
            isLoading={isLoading}
            showError={!!error}
            onInterestChange={onInterestChange}
          />
        </div>

        {/* Area 3: Anything else */}
        <div className="card" style={{ borderRadius: '20px', marginBottom: '1.5rem' }}>
          <SectionLabel>Anything Else?</SectionLabel>
          <OtherInterestsForm
            isTeacherFlow={isTeacherFlow}
            otherInterests={formData.otherInterests}
            isLoading={isLoading}
            onOtherInterestsChange={(value) => onUpdateFormData('otherInterests', value)}
          />
        </div>

        <div className="form-group text-center">
          <button 
            type="submit" 
            className="btn-blue btn-blue-lg"
            disabled={isLoading}
            style={{ padding: '1rem 2rem', fontSize: '1.1rem', color: '#3B3F8C', borderColor: '#3B3F8C', borderRadius: '10px' }}
          >
            {isLoading ? (
              <>
                <span className="loading"></span>
                <span style={{ marginLeft: '0.5rem' }}>Submitting...</span>
              </>
            ) : (
              isTeacherFlow ? 'Submit Student' : 'Submit My Information'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
