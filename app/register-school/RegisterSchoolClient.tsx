// /app/register-school/RegisterSchoolClient.tsx
"use client";

import { useState, useEffect } from 'react';
import { useTeacherSession } from '@/lib/useTeacherSession';
import { useRouter } from 'next/navigation';
import { SchoolFormData } from './types';
import { STATE_TO_REGION } from './constants';
import SchoolRegistrationForm from './components/SchoolRegistrationForm';
import SuccessPage from './components/SuccessPage';

interface RegisterSchoolClientProps {
  isEmailVerified: boolean;
  verifiedEmail: string;
  isAdminMode: boolean;
  isVerificationMode: boolean;
}

export default function RegisterSchoolClient({ 
  isEmailVerified, 
  verifiedEmail, 
  isAdminMode, 
  isVerificationMode 
}: RegisterSchoolClientProps) {
  const { data: session, status } = useTeacherSession();
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredSchool, setRegisteredSchool] = useState<any>(null);
  const [showExistingSchoolError, setShowExistingSchoolError] = useState(false);
  const [hasCheckedExistingSchool, setHasCheckedExistingSchool] = useState(false);

  const [formData, setFormData] = useState<SchoolFormData>({
    teacherName: '',
    teacherEmail: '',
    teacherPhone: '',
    schoolName: '',
    schoolCity: '',
    schoolState: '',
    gradeLevels: [],
    classSize: '',
    programStartMonth: '',
    specialConsiderations: '',
    programAgreement: false,
    parentNotification: false,
    communicationPlatforms: [],
    communicationPlatformsOther: '',
    mailingAddress: ''
  });

  // Pre-populate email from server-validated data
  useEffect(() => {
    if (isEmailVerified && verifiedEmail) {
      setFormData(prev => ({
        ...prev,
        teacherEmail: verifiedEmail
      }));
      console.log('Pre-populated email from server validation:', verifiedEmail);
    }
  }, [isEmailVerified, verifiedEmail]);

  // Handle authentication and existing school check for non-verified users
  useEffect(() => {
    // Skip authentication checks in admin mode or email verification mode
    if (isAdminMode || isEmailVerified) {
      setHasCheckedExistingSchool(true);
      return;
    }

    if (status === 'loading') return; // Still loading session

    if (status === 'unauthenticated') {
      // Redirect to login if not authenticated (shouldn't happen due to middleware)
      router.push('/login');
      return;
    }

    if (session?.user) {
      // Auto-populate email from session (only in regular authenticated mode)
      if (!isEmailVerified) {
        setFormData(prev => ({
          ...prev,
          teacherEmail: session.user.email || ''
        }));
      }

      // Check for existing school
      if (!hasCheckedExistingSchool && !isSubmitted) {
        setHasCheckedExistingSchool(true);
      }
    }
  }, [session, status, router, hasCheckedExistingSchool, isSubmitted, isAdminMode, isEmailVerified]);

  // Scroll to top when success page shows
  useEffect(() => {
    if (isSubmitted) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isSubmitted]);

  const updateFormData = (field: keyof SchoolFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleGradeLevelChange = (grade: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      gradeLevels: checked 
        ? [...prev.gradeLevels, grade]
        : prev.gradeLevels.filter(g => g !== grade)
    }));
    if (error) setError('');
  };

  const getRegionForState = (state: string) => {
    return STATE_TO_REGION[state] || '';
  };

  const handleGoToDashboard = () => {
    if (isAdminMode) {
      router.push('/admin/matching');
    } else {
      router.push('/dashboard');
    }
  };

  const handleRegisterNewSchool = () => {
    setShowExistingSchoolError(false);
    // Continue with registration form
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Admin mode validation - only require school name, teacher name, teacher email
    if (isAdminMode) {
      const adminRequiredFields = ['teacherName', 'teacherEmail', 'schoolName'];
      
      for (const field of adminRequiredFields) {
        if (!formData[field as keyof SchoolFormData]) {
          setError('Please fill in all required fields (Teacher Name, Teacher Email, School Name)');
          setIsLoading(false);
          return;
        }
      }

      if (!formData.teacherEmail.includes('@')) {
        setError('Please enter a valid teacher email address');
        setIsLoading(false);
        return;
      }
    } else {
      // Regular mode validation - all original required fields plus new ones
      const requiredFields = [
        'teacherName', 'teacherEmail', 'schoolName', 
        'schoolState', 'classSize', 'programStartMonth', 'mailingAddress'
      ];

      for (const field of requiredFields) {
        if (!formData[field as keyof SchoolFormData]) {
          setError('Please fill in all required fields');
          setIsLoading(false);
          return;
        }
      }

      if (formData.gradeLevels.length === 0) {
        setError('Please select at least one grade level');
        setIsLoading(false);
        return;
      }

      if (!formData.teacherEmail.includes('@')) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      if (!formData.programAgreement) {
        setError('Please check the agreement box to continue');
        setIsLoading(false);
        return;
      }

      // Validate communication platforms
      if (formData.communicationPlatforms.length === 0) {
        setError('Please select at least one communication platform');
        setIsLoading(false);
        return;
      }

      // If "Other" is selected, make sure they typed something
      if (formData.communicationPlatforms.includes('Other') && !formData.communicationPlatformsOther.trim()) {
        setError('Please specify the other communication platform');
        setIsLoading(false);
        return;
      }
    }

    try {
      // Transform data to match API expectations
      const region = getRegionForState(formData.schoolState);
      
      // Build communication platforms array with "Other: xxx" format if needed
      const communicationPlatformsFormatted = formData.communicationPlatforms.map(platform => {
        if (platform === 'Other' && formData.communicationPlatformsOther) {
          return `Other: ${formData.communicationPlatformsOther}`;
        }
        return platform;
      }).filter(p => p !== 'Other'); // Remove standalone "Other" since we replaced it
      
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
        communicationPlatforms: communicationPlatformsFormatted,
        mailingAddress: formData.mailingAddress,
        isAdminFlow: isAdminMode,
        isEmailVerified: isEmailVerified
      };

      const response = await fetch('/api/schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register school');
      }

      // If admin mode, redirect immediately to admin matching page
      if (isAdminMode) {
        router.push('/admin/matching');
        return;
      }

      // For regular teachers, show success page
      setRegisteredSchool(data.school);
      setIsSubmitted(true);
      setHasCheckedExistingSchool(true);
      setShowExistingSchoolError(false);

    } catch (err: any) {
      setError(err.message || 'There was an error submitting your registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication (skip in admin mode and verification mode)
  if (!isAdminMode && !isEmailVerified && status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Success state (only for regular teachers, not admin)
  if (isSubmitted && registeredSchool && !isAdminMode) {
    return <SuccessPage registeredSchool={registeredSchool} isAdminMode={false} />;
  }

  // Show existing school error (only for non-verified, non-admin users)
  if (showExistingSchoolError && !isSubmitted && !isAdminMode && !isEmailVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">School Already Registered</h2>
            <p className="text-gray-600 mb-6">
              You already have a school registered. Would you like to access your dashboard or register another school?
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handleGoToDashboard}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Go to My School Dashboard
            </button>
            
            <button
              onClick={handleRegisterNewSchool}
              className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Register Another School
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SchoolRegistrationForm
      formData={formData}
      isLoading={isLoading}
      error={error}
      onSubmit={handleSubmit}
      onUpdateFormData={updateFormData}
      onGradeLevelChange={handleGradeLevelChange}
      isEmailReadOnly={isEmailVerified || !isAdminMode} // Make email readonly for verified users
      isAdminMode={isAdminMode}
    />
  );
}
