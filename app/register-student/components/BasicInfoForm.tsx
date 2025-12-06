// /app/register-student/components/BasicInfoForm.tsx
import { useState } from 'react';

interface BasicInfoFormProps {
  isTeacherFlow: boolean;
  firstName: string;
  lastInitial: string;
  grade: string;
  teacherName: string;
  penpalPreference: 'ONE' | 'MULTIPLE';
  isLoading: boolean;
  hasMultipleClasses: boolean;
  teacherNames: string[];
  onFirstNameChange: (value: string) => void;
  onLastInitialChange: (value: string) => void;
  onGradeChange: (value: string) => void;
  onTeacherNameChange: (value: string) => void;
  onPenpalPreferenceChange: (value: 'ONE' | 'MULTIPLE') => void;
}

export default function BasicInfoForm({
  isTeacherFlow,
  firstName,
  lastInitial,
  grade,
  teacherName,
  penpalPreference,
  isLoading,
  hasMultipleClasses,
  teacherNames,
  onFirstNameChange,
  onLastInitialChange,
  onGradeChange,
  onTeacherNameChange,
  onPenpalPreferenceChange
}: BasicInfoFormProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingPreference, setPendingPreference] = useState<'ONE' | 'MULTIPLE' | null>(null);

  const handlePenpalPreferenceChange = (value: 'ONE' | 'MULTIPLE') => {
    // Only show confirmation for student self-registration when selecting MULTIPLE
    if (!isTeacherFlow && value === 'MULTIPLE' && penpalPreference !== 'MULTIPLE') {
      setPendingPreference(value);
      setShowConfirmDialog(true);
    } else {
      onPenpalPreferenceChange(value);
    }
  };

  const handleConfirm = () => {
    if (pendingPreference) {
      onPenpalPreferenceChange(pendingPreference);
    }
    setShowConfirmDialog(false);
    setPendingPreference(null);
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
    setPendingPreference(null);
  };

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: hasMultipleClasses ? '220px 100px 120px 180px 80px' : '260px 110px 150px 80px', gap: '1rem' }}>
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

        {hasMultipleClasses && (
          <div className="form-group">
            <label htmlFor="teacher-name" className="form-label">Teacher *</label>
            <select 
              id="teacher-name" 
              className="form-select" 
              value={teacherName}
              onChange={(e) => onTeacherNameChange(e.target.value)}
              disabled={isLoading}
              required
            >
              <option value="">Select teacher</option>
              {teacherNames.map((name, index) => (
                <option key={index} value={name}>{name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="penpal-preference" className="form-label">Pen Pals *</label>
          <select 
            id="penpal-preference" 
            className="form-select" 
            value={penpalPreference}
            onChange={(e) => handlePenpalPreferenceChange(e.target.value as 'ONE' | 'MULTIPLE')}
            disabled={isLoading}
            required
          >
            <option value="ONE">1</option>
            <option value="MULTIPLE">2</option>
          </select>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            border: '3px solid #2c5aa0',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}>
            <h3 style={{ 
              color: '#2c5aa0', 
              marginBottom: '1rem',
              fontSize: '1.5rem',
              fontWeight: '300'
            }}>
              Multiple Pen Pals
            </h3>
            <p style={{ 
              color: '#495057', 
              marginBottom: '2rem', 
              lineHeight: '1.5',
              fontSize: '1.1rem',
              fontWeight: '300'
            }}>
              We'll do our best to pair you with 2 pen pals! This depends on the number of students at your matched school, so we can't guarantee it. Are you ready to commit to writing letters to 2 pen pals if we can match you?
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={handleCancel}
                className="btn"
                style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirm}
                className="btn"
                style={{
                  backgroundColor: '#2c5aa0',
                  color: 'white',
                  borderColor: '#2c5aa0',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem'
                }}
              >
                Yes, I'm Sure
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
