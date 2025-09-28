// /app/dashboard/components/SchoolEditModal.tsx
"use client";

import { useState } from 'react';
import SchoolFormFields from '@/app/register-school/components/SchoolFormFields';
import { SchoolFormData } from '@/app/register-school/types';
import { STATE_TO_REGION } from '@/app/register-school/constants';

interface SchoolData {
  id: string;
  schoolName: string;
  teacherName: string;
  teacherEmail: string;
  teacherPhone?: string;
  schoolCity?: string;
  schoolState?: string;
  gradeLevel?: string;
  expectedClassSize: number;
  startMonth?: string;
  programStartMonth?: string;
  specialConsiderations?: string;
}

interface SchoolEditModalProps {
  show: boolean;
  schoolData: SchoolData;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SchoolEditModal({ 
  show, 
  schoolData, 
  onClose, 
  onSuccess 
}: SchoolEditModalProps) {
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Initialize form data from school data
  const [formData, setFormData] = useState<SchoolFormData>({
    teacherName: schoolData.teacherName || '',
    teacherEmail: schoolData.teacherEmail || '',
    teacherPhone: schoolData.teacherPhone || '',
    schoolName: schoolData.schoolName || '',
    schoolCity: schoolData.schoolCity || '',
    schoolState: schoolData.schoolState || '',
    gradeLevels: schoolData.gradeLevel ? schoolData.gradeLevel.split(', ') : [],
    classSize: schoolData.expectedClassSize?.toString() || '',
    programStartMonth: schoolData.startMonth || schoolData.programStartMonth || '',
    specialConsiderations: schoolData.specialConsiderations || '',
    programAgreement: true, // Not needed for edit mode
    parentNotification: true // Default value for edit mode
  });

  const handleUpdateFormData = (field: keyof SchoolFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGradeLevelChange = (grade: string, checked: boolean) => {
    setFormData(prev => {
      const currentGrades = prev.gradeLevels;
      let newGrades;
      
      if (checked) {
        newGrades = [...currentGrades, grade];
      } else {
        newGrades = currentGrades.filter(g => g !== grade);
      }
      
      return {
        ...prev,
        gradeLevels: newGrades
      };
    });
  };

  const getRegionForState = (state: string) => {
    return STATE_TO_REGION[state] || '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.schoolState || !formData.gradeLevels.length || 
          !formData.classSize || !formData.programStartMonth) {
        throw new Error('Please fill in all required fields');
      }

      const region = getRegionForState(formData.schoolState);
      
      const response = await fetch('/api/schools', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schoolId: schoolData.id,
          schoolState: formData.schoolState,
          schoolCity: formData.schoolCity || null,
          gradeLevel: formData.gradeLevels.join(', '),
          expectedClassSize: formData.classSize,
          startMonth: formData.programStartMonth,
          teacherPhone: formData.teacherPhone || null,
          specialConsiderations: formData.specialConsiderations || null,
          region: region
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update school information');
      }

      onSuccess();
      onClose();

    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!show) {
    return null;
  }

  return (
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
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
      }}>
        <div style={{ 
          padding: '2rem',
          borderBottom: '1px solid #e9ecef',
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          borderRadius: '8px 8px 0 0'
        }}>
          <h3 style={{ 
            color: '#495057', 
            marginBottom: '0.5rem',
            fontSize: '1.4rem',
            fontWeight: '400'
          }}>
            Complete School Profile
          </h3>
          <p className="text-meta-info" style={{ margin: 0 }}>
            Please provide the missing information to complete your school profile.
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '2rem' }}>
            <SchoolFormFields
              formData={formData}
              isLoading={isLoading}
              onUpdateFormData={handleUpdateFormData}
              onGradeLevelChange={handleGradeLevelChange}
              editMode={true}
              isAdminMode={false}
              isEmailReadOnly={true}
            />

            {/* Error Display */}
            {error && (
              <div className="alert alert-error" style={{ marginBottom: '2rem' }}>
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div style={{ 
            padding: '1.5rem 2rem',
            borderTop: '1px solid #e9ecef',
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'flex-end',
            backgroundColor: '#f8f9fa',
            borderRadius: '0 0 8px 8px'
          }}>
            <button 
              type="button"
              onClick={onClose}
              className="btn"
              disabled={isLoading}
              style={{ 
                padding: '0.75rem 1.5rem',
                backgroundColor: '#6c757d',
                color: 'white'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn"
              disabled={isLoading}
              style={{ 
                padding: '0.75rem 1.5rem',
                backgroundColor: '#28a745', 
                color: 'white'
              }}
            >
              {isLoading ? (
                <>
                  <span className="loading" style={{ marginRight: '0.5rem' }}></span>
                  Saving...
                </>
              ) : (
                'Save Profile'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
