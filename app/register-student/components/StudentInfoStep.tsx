// /app/register-student/components/StudentInfoStep.tsx

import BasicInfoForm from './BasicInfoForm';
import InterestsForm from './InterestsForm';
import ParentConsentForm from './ParentConsentForm';

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
    <div className="card" style={{ maxWidth: '915px', margin: '0 auto' }}>
      <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', border: '1px solid #dee2e6' }}>
        <h4 style={{ color: '#495057', marginBottom: '0.5rem', fontWeight: 300 }}>
          {isTeacherFlow ? 'Adding Student to:' : 'Your School:'}
        </h4>
        <p style={{ fontSize: '1.1rem', fontWeight: '300', color: '#2c5aa0', marginBottom: '0.25rem' }}>
          {schoolInfo?.name}
        </p>
        <p style={{ color: '#6c757d', marginBottom: '0', fontSize: '0.95rem', fontWeight: 300 }}>
          Teacher: {schoolInfo?.teacher}
        </p>
      </div>

      <h2 className="text-h2 text-center mb-3" style={{ fontWeight: 300 }}>{isTeacherFlow ? 'Student Info' : 'Tell Us About Yourself'}</h2>
      <p className="text-center mb-4" style={{ color: '#6c757d', fontWeight: 300 }}>
        {isTeacherFlow 
          ? "Helps us find your student a great penpal who shares their interests!"
          : "Helps us find you a great penpal who shares your interests!"
        }
      </p>

      <form onSubmit={onSubmit}>
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

        <InterestsForm
          isTeacherFlow={isTeacherFlow}
          interests={formData.interests}
          otherInterests={formData.otherInterests}
          isLoading={isLoading}
          showError={!!error}
          onInterestChange={onInterestChange}
          onOtherInterestsChange={(value) => onUpdateFormData('otherInterests', value)}
        />

        <ParentConsentForm
          isTeacherFlow={isTeacherFlow}
          parentConsent={formData.parentConsent}
          isLoading={isLoading}
          onConsentChange={(value) => onUpdateFormData('parentConsent', value)}
        />

        <div className="form-group text-center">
          <button 
            type="submit" 
            className="btn-blue btn-blue-lg"
            disabled={isLoading}
            style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
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
