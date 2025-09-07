"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SchoolFormData } from './types';
import { STATE_TO_REGION } from './constants';
import SchoolRegistrationForm from './components/SchoolRegistrationForm';
import SuccessPage from './components/SuccessPage';

export default function RegisterSchool() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredSchool, setRegisteredSchool] = useState<any>(null);
  const [showExistingSchoolError, setShowExistingSchoolError] = useState(false);

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
    parentNotification: false
  });

  // Handle authentication and existing school check
  useEffect(() => {
    if (status === 'loading') return; // Still loading session

    if (status === 'unauthenticated') {
      // Redirect to login if not authenticated (shouldn't happen due to middleware, but just in case)
      router.push('/login');
      return;
    }

    if (session?.user) {
      // Auto-populate email from session
      setFormData(prev => ({
        ...prev,
        teacherEmail: session.user.email || ''
      }));

      // Check if user already has a school
      if (session.user.schoolId) {
        setShowExistingSchoolError(true);
      }
    }
  }, [session, status, router]);

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
    router.push('/dashboard');
  };

  const handleRegisterNewSchool = () => {
    setShowExistingSchoolError(false);
    // Continue with registration form
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Updated validation for removed letterFrequency field
    const requiredFields = [
      'teacherName', 'teacherEmail', 'schoolName', 
      'schoolState', 'classSize', 'programStartMonth'
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

    try {
      // Transform data to match API expectations
      const region = getRegionForState(formData.schoolState);
      const dataToSend = {
        teacherName: formData.teacherName,
        teacherEmail: formData.teacherEmail,
        teacherPhone: formData.teacherPhone,
        schoolName: formData.schoolName,
        schoolCity: formData.schoolCity, // Optional field
        schoolAddress: '', // Empty for now, will collect later
        schoolState: formData.schoolState,
        schoolZip: '', // Empty for now, will collect later
        region,
        gradeLevel: formData.gradeLevels.join(', '), // Convert array to string
        expectedClassSize: formData.classSize,
        startMonth: formData.programStartMonth,
        specialConsiderations: formData.specialConsiderations,
        programAgreement: formData.programAgreement
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

      setRegisteredSchool(data.school);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'There was an error submitting your registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show existing school error with choices
  if (showExistingSchoolError) {
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
              You already have a school registered: <strong>{session?.user.schoolName}</strong>
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

  if (isSubmitted) {
    return <SuccessPage registeredSchool={registeredSchool} />;
  }

  return (
    <SchoolRegistrationForm
      formData={formData}
      isLoading={isLoading}
      error={error}
      onSubmit={handleSubmit}
      onUpdateFormData={updateFormData}
      onGradeLevelChange={handleGradeLevelChange}
      isEmailReadOnly={true} // Make email read-only since it comes from session
    />
  );
}
