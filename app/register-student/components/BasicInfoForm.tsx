// /app/register-student/components/BasicInfoForm.tsx

interface BasicInfoFormProps {
  isTeacherFlow: boolean;
  firstName: string;
  lastInitial: string;
  grade: string;
  penpalPreference: 'ONE' | 'MULTIPLE';
  isLoading: boolean;
  onFirstNameChange: (value: string) => void;
  onLastInitialChange: (value: string) => void;
  onGradeChange: (value: string) => void;
  onPenpalPreferenceChange: (value: 'ONE' | 'MULTIPLE') => void;
}

export default function BasicInfoForm({
  isTeacherFlow,
  firstName,
  lastInitial,
  grade,
  penpalPreference,
  isLoading,
  onFirstNameChange,
  onLastInitialChange,
  onGradeChange,
  onPenpalPreferenceChange
}: BasicInfoFormProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '250px 80px 150px 200px', gap: '1rem' }}>
      <div className="form-group">
        <label htmlFor="first-name" className="form-label">
          {isTeacherFlow ? "Student's first name *" : "First Name *"}
        </label>
        <input 
          type="text" 
          id="first-name" 
          className="form-input" 
          placeholder={isTeacherFlow ? "Student's first name" : "Your first name"}
          value={firstName}
          onChange={(e) => onFirstNameChange(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="last-initial" className="form-label">Last Initial *</label>
        <input 
          type="text" 
          id="last-initial" 
          className="form-input" 
          placeholder="Letters"
          value={lastInitial}
          onChange={(e) => onLastInitialChange(e.target.value)}
          disabled={isLoading}
          maxLength={2}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="grade" className="form-label">Grade *</label>
        <select 
          id="grade" 
          className="form-select" 
          value={grade}
          onChange={(e) => onGradeChange(e.target.value)}
          disabled={isLoading}
          required
        >
          <option value="">{isTeacherFlow ? "Select grade" : "Select grade"}</option>
          <option value="3">3rd Grade</option>
          <option value="4">4th Grade</option>
          <option value="5">5th Grade</option>
          <option value="6">6th Grade</option>
          <option value="7">7th Grade</option>
          <option value="8">8th Grade</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="penpal-preference" className="form-label">Pen Pals *</label>
        <select 
          id="penpal-preference" 
          className="form-select" 
          value={penpalPreference}
          onChange={(e) => onPenpalPreferenceChange(e.target.value as 'ONE' | 'MULTIPLE')}
          disabled={isLoading}
          required
        >
          <option value="ONE">Just one</option>
          <option value="MULTIPLE">More than one if possible</option>
        </select>
      </div>
    </div>
  );
}
