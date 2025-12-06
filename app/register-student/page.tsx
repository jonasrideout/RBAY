// /app/register-student/page.tsx

"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTeacherSession } from '@/lib/useTeacherSession';
import Header from '../components/Header';

// Import components
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import SchoolVerificationStep from './components/SchoolVerificationStep';
import SchoolConfirmationStep from './components/SchoolConfirmationStep';
import StudentInfoStep from './components/StudentInfoStep';
import SuccessStep from './components/SuccessStep';

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

interface SchoolInfo {
  name: string;
  teacher: string;
  found: boolean;
  schoolId: string;
  teacherEmail?: string;
  hasMultipleClasses?: boolean;
  teacherNames?: string[];
}

type Step = 'schoolVerify' | 'schoolConfirm' | 'info' | 'success';

function RegisterStudentForm() {
  const searchParams = useSearchParams();
  const { data: session, status } = useTeacherSession();
  const [currentStep, setCurrentStep] = useState<Step>('schoolVerify');
  const [isLoading, setIsLoading] = useState(false);
  const [schoolNameInput, setSchoolNameInput] = useState('');
  const [foundSchoolInfo, setFoundSchoolInfo] = useState<SchoolInfo | null>(null);
  const [formData, setFormData] = useState<StudentFormData>({
    schoolToken: '',
    firstName: '',
    lastInitial: '',
    grade: '',
    teacherName: '',
    interests: [],
    otherInterests: '',
    penpalPreference: 'ONE',
    parentConsent: false
  });
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [error, setError] = useState('');
  const [registeredStudent, setRegisteredStudent] = useState<any>(null);
  const [isTeacherFlow, setIsTeacherFlow] = useState(false);
  const [sessionCheckComplete, setSessionCheckComplete] = useState(false);

  // Handle session-based or token-based flow
  useEffect(() => {
    const checkAuthAndInitialize = async () => {
      if (status === 'loading') {
        return;
      }
      
      const token = searchParams?.get('token');
      
      // Always set the token in formData if present
      if (token) {
        setFormData(prev => ({ ...prev, schoolToken: token }));
      }
      
      // If there's a token, use token-based flow (even if there's a teacher session)
      // This handles the "Add Another Student" button case
      if (token) {
        try {
          await fetchSchoolByToken(token);
        } catch (error) {
          console.error('Failed to fetch school by token:', error);
          setError('Invalid registration link. Please check with your teacher for the correct link.');
        }
        setSessionCheckComplete(true);
        return;
      }
      
      // No token but we have a teacher session - use email-based flow
      if (status === 'authenticated' && session?.user?.email) {
        try {
          await fetchTeacherSchool(session.user.email);
        } catch (error) {
          console.error('Failed to fetch teacher school:', error);
          setError('Unable to load your school information. Please try using the student registration link instead.');
        }
        setSessionCheckComplete(true);
        return;
      }
      
      // No teacher session and no token - show error
      setSessionCheckComplete(true);
      setError('Invalid registration link. Please use the link provided by your teacher or log in first.');
    };
    
    checkAuthAndInitialize();
  }, [searchParams, status, session]);

  const fetchSchoolByToken = async (token: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/schools?token=${encodeURIComponent(token)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid registration link');
      }

      // Set school info for token-based flow
      setSchoolInfo({
        name: data.school.schoolName,
        teacher: data.school.teacherName,
        found: true,
        schoolId: data.school.id,
        teacherEmail: data.school.teacherEmail,
        hasMultipleClasses: data.school.hasMultipleClasses || false,
        teacherNames: data.school.teacherNames || []
      });

      console.log('fetchSchoolByToken - Setting schoolInfo:', {
        hasMultipleClasses: data.school.hasMultipleClasses,
        teacherNames: data.school.teacherNames
      });

      // Check if the current user is a teacher with a session
      const hasTeacherSession = status === 'authenticated' && session?.user?.email;
      
      if (hasTeacherSession) {
        // Teacher with session using token - skip verification, go to form
        setCurrentStep('info');
        setIsTeacherFlow(true);
      } else {
        // Student flow - start with verification
        setCurrentStep('schoolVerify');
        setIsTeacherFlow(false);
      }
      
    } catch (err: any) {
      console.error('Error in fetchSchoolByToken:', err);
      throw err; // Re-throw to be handled by caller
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeacherSchool = async (teacherEmail: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/schools?teacherEmail=${encodeURIComponent(teacherEmail)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load school data');
      }

      // Set school info and skip directly to student info form
      setSchoolInfo({
        name: data.school.schoolName,
        teacher: data.school.teacherName,
        found: true,
        schoolId: data.school.id,
        teacherEmail: data.school.teacherEmail,
        hasMultipleClasses: data.school.hasMultipleClasses || false,
        teacherNames: data.school.teacherNames || []
      });

      // Set the dashboard token for form submission
      setFormData(prev => ({ 
        ...prev, 
        schoolToken: data.school.dashboardToken 
      }));

      setCurrentStep('info'); // Skip verification steps
      setIsTeacherFlow(true);
      
    } catch (err: any) {
      console.error('Error in fetchTeacherSchool:', err);
      throw err; // Re-throw to be handled by caller
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function for flexible matching (school name, teacher name, or teacher email)
  const doesInputMatch = (input: string, schoolName: string, teacherName: string, teacherEmail: string): boolean => {
    const inputLower = input.toLowerCase().trim();
    
    if (inputLower.length === 0) return false;
    
    // Match against school name - require 4+ characters
    const schoolLower = schoolName.toLowerCase();
    const schoolWords = inputLower.split(/\s+/);
    const schoolMatch = inputLower.length >= 4 && schoolWords.some(word => {
      if (word.length < 4) return false;
      return schoolLower.includes(word);
    });
    
    // Match against teacher name - require 3+ characters
    const teacherLower = teacherName.toLowerCase();
    const teacherMatch = inputLower.length >= 3 && teacherLower.includes(inputLower);
    
    // Match against teacher email - require 4+ characters
    const emailLower = teacherEmail.toLowerCase();
    const emailMatch = inputLower.length >= 4 && (emailLower.includes(inputLower) || inputLower.includes(emailLower.split('@')[0]));
    
    return schoolMatch || teacherMatch || emailMatch;
  };

  const handleSchoolVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    if (!schoolNameInput.trim()) {
      setError('Please enter your school name, teacher name, or teacher email');
      setIsLoading(false);
      return;
    }

    if (!formData.schoolToken) {
      setError('Invalid registration link. Please use the link provided by your teacher.');
      setIsLoading(false);
      return;
    }

    try {
      // Get school info using the token
      const response = await fetch(`/api/schools?token=${encodeURIComponent(formData.schoolToken)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid registration link');
      }

      const actualSchoolName = data.school.schoolName;
      const teacherName = data.school.teacherName;
      const teacherEmail = data.school.teacherEmail;
      
      // Check if the entered input matches school name, teacher name, or teacher email
      if (doesInputMatch(schoolNameInput, actualSchoolName, teacherName, teacherEmail)) {
        setFoundSchoolInfo({
          name: actualSchoolName,
          teacher: teacherName,
          found: true,
          schoolId: data.school.id,
          teacherEmail: teacherEmail
        });
        setCurrentStep('schoolConfirm');
      } else {
        // Show the school info but with a "not found" state
        setFoundSchoolInfo({
          name: actualSchoolName,
          teacher: teacherName,
          found: false,
          schoolId: data.school.id,
          teacherEmail: teacherEmail
        });
        setCurrentStep('schoolConfirm');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid registration link. Please check with your teacher for the correct link.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchoolConfirmation = (confirmed: boolean) => {
    if (confirmed && foundSchoolInfo) {
      setSchoolInfo(foundSchoolInfo);
      setCurrentStep('info');
    } else {
      // Go back to school verification
      setFoundSchoolInfo(null);
      setSchoolNameInput('');
      setCurrentStep('schoolVerify');
      setError('');
    }
  };

  const handleInterestChange = (interest: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      interests: checked 
        ? [...prev.interests, interest]
        : prev.interests.filter(i => i !== interest)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    if (!formData.firstName || !formData.lastInitial || !formData.grade || !formData.parentConsent || formData.interests.length === 0) {
      setError('Please fill in all required fields, select at least one interest, and check the parent consent box');
      setIsLoading(false);
      return;
    }

    if (formData.lastInitial.length > 2) {
      setError('Please enter only the first 1-2 letters of your last name');
      setIsLoading(false);
      return;
    }

    try {
      const submissionData = {
        teacherEmail: schoolInfo?.teacherEmail,
        firstName: formData.firstName,
        lastInitial: formData.lastInitial,
        grade: formData.grade,
        interests: formData.interests,
        otherInterests: formData.otherInterests,
        penpalPreference: formData.penpalPreference,
        parentConsent: formData.parentConsent
      };

      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register student');
      }

      setRegisteredStudent({
        ...data.student,
        schoolName: schoolInfo?.name
      });
      setCurrentStep('success');
    } catch (err: any) {
      setError(err.message || 'There was an error submitting your information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: keyof StudentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleLogout = () => {
    window.location.href = '/api/auth/signout?callbackUrl=' + encodeURIComponent(window.location.origin);  
  };

  // Don't render anything until session check is complete
  if (!sessionCheckComplete) {
    return (
      <div className="page">
        <Header />
        <main className="container" style={{ flex: 1, paddingTop: '3rem' }}>
          <LoadingState />
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <Header />

      <main className="container" style={{ flex: 1, paddingTop: '3rem' }}>
        {/* Show loading during API calls */}
        {isLoading && currentStep !== 'info' && (
          <LoadingState message="Processing..." />
        )}

        {/* Show error state */}
        {error && !isLoading && (
          <ErrorState error={error} />
        )}

        {/* Show form steps when ready */}
        {!isLoading && !error && (
          <>
            {currentStep === 'schoolVerify' && (
              <SchoolVerificationStep
                schoolNameInput={schoolNameInput}
                setSchoolNameInput={setSchoolNameInput}
                error={error}
                setError={setError}
                isLoading={isLoading}
                schoolToken={formData.schoolToken}
                onSubmit={handleSchoolVerification}
              />
            )}
            
            {currentStep === 'schoolConfirm' && (
              <SchoolConfirmationStep
                foundSchoolInfo={foundSchoolInfo}
                onConfirm={handleSchoolConfirmation}
              />
            )}
            
            {currentStep === 'info' && (
              <StudentInfoStep
                schoolInfo={schoolInfo}
                isTeacherFlow={isTeacherFlow}
                formData={formData}
                error={error}
                isLoading={isLoading}
                onSubmit={handleSubmit}
                onUpdateFormData={updateFormData}
                onInterestChange={handleInterestChange}
              />
            )}
            
            {currentStep === 'success' && (
              <SuccessStep
                isTeacherFlow={isTeacherFlow}
                registeredStudent={registeredStudent}
                schoolToken={formData.schoolToken}
              />
            )}
          </>
        )}
      </main>

      <footer style={{ background: '#343a40', color: 'white', padding: '2rem 0', marginTop: '3rem' }}>
        <div className="container text-center">
          <p>&copy; 2025 The Right Back at You Project by Carolyn Mackler. Building empathy and connection through literature.</p>
        </div>
      </footer>
    </div>
  );
}

function LoadingPage() {
  return (
    <div className="page">
      <Header />
      <main className="container" style={{ flex: 1, paddingTop: '3rem' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Loading...</div>
        </div>
      </main>
    </div>
  );
}

export default function RegisterStudent() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <RegisterStudentForm />
    </Suspense>
  );
}
