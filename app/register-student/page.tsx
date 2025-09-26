// /app/register-student/page.tsx

"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTeacherSession } from '@/lib/useTeacherSession';
import Header from '../components/Header';

interface StudentFormData {
  schoolToken: string;
  firstName: string;
  lastInitial: string;
  grade: string;
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
}

type Step = 'schoolVerify' | 'schoolConfirm' | 'info' | 'success';

const INTEREST_OPTIONS = [
  { value: 'sports', label: '🏀 Sports & Athletics' },
  { value: 'arts', label: '🎨 Arts & Creativity' },
  { value: 'reading', label: '📚 Reading & Books' },
  { value: 'technology', label: '💻 Technology & Gaming' },
  { value: 'animals', label: '🐕 Animals & Nature' },
  { value: 'entertainment', label: '🎬 Entertainment & Media' },
  { value: 'social', label: '👥 Social & Family' },
  { value: 'academic', label: '🧮 Academic Subjects' },
  { value: 'hobbies', label: '🎯 Hobbies & Collections' },
  { value: 'outdoors', label: '🏕️ Outdoor Activities' },
  { value: 'music', label: '🎵 Music & Performance' },
  { value: 'fashion', label: '👗 Fashion & Style' }
];

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
      console.log('=== STUDENT REGISTRATION DEBUG ===');
      console.log('useTeacherSession status:', status);
      console.log('useTeacherSession session:', session);
      
      if (status === 'loading') {
        console.log('Session still loading, returning early');
        return;
      }
      
      const token = searchParams?.get('token');
      console.log('Token from URL:', token);
      
      // Always set the token in formData if present
      if (token) {
        setFormData(prev => ({ ...prev, schoolToken: token }));
      }
      
      // Check if we have a teacher session (authenticated user)
      if (status === 'authenticated' && session?.user?.email) {
        console.log('Found authenticated teacher session, using teacher flow for:', session.user.email);
        try {
          await fetchTeacherSchool(session.user.email);
        } catch (error) {
          console.error('Failed to fetch teacher school:', error);
          setError('Unable to load your school information. Please try using the student registration link instead.');
        }
        setSessionCheckComplete(true);
        return;
      }
      
      // No teacher session - mark session check as complete for student flow
      setSessionCheckComplete(true);
      
      // If no teacher session and no token, show error
      if (!token) {
        console.log('No token found and no teacher session, showing error');
        setError('Invalid registration link. Please use the link provided by your teacher or log in first.');
      }
    };
    
    checkAuthAndInitialize();
  }, [searchParams, status, session]);

  const fetchTeacherSchool = async (teacherEmail: string) => {
    console.log('fetchTeacherSchool called with:', teacherEmail);
    setIsLoading(true);
    try {
      const response = await fetch(`/api/schools?teacherEmail=${encodeURIComponent(teacherEmail)}`);
      const data = await response.json();
      console.log('fetchTeacherSchool API response:', response.ok, data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load school data');
      }

      // Set school info and skip directly to student info form
      setSchoolInfo({
        name: data.school.schoolName,
        teacher: data.school.teacherName,
        found: true,
        schoolId: data.school.id,
        teacherEmail: data.school.teacherEmail
      });

      // Set the dashboard token for form submission
      setFormData(prev => ({ 
        ...prev, 
        schoolToken: data.school.dashboardToken 
      }));

      console.log('Setting currentStep to info and isTeacherFlow to true');
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
        setError('No school found with that name, teacher name, or email');
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

  const renderSchoolVerifyStep = () => (
    <div className="card">
      <h1 className="text-center mb-3">Join The Right Back at You Project</h1>
      <p className="text-center mb-4" style={{ color: '#6c757d' }}>
        Please enter your school name, teacher name, or teacher email to get started
      </p>
      
      <form onSubmit={handleSchoolVerification}>
        <div className="form-group">
          <label htmlFor="school-name" className="form-label">School Name, Teacher Name, or Teacher Email</label>
          <input 
            type="text" 
            id="school-name" 
            className="form-input" 
            placeholder="Enter your school name, teacher's name, or teacher's email"
            value={schoolNameInput}
            onChange={(e) => {
              setSchoolNameInput(e.target.value);
              if (error) setError('');
            }}
            disabled={isLoading}
            required
          />
          <p style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '0.5rem', marginBottom: '0' }}>
            Examples: "Lincoln Elementary", "Ms. Johnson", or "teacher@school.edu"
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="form-group text-center">
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isLoading || !formData.schoolToken}
            style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
          >
            {isLoading ? (
              <>
                <span className="loading"></span>
                <span style={{ marginLeft: '0.5rem' }}>Verifying...</span>
              </>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderSchoolConfirmStep = () => (
    <div className="card">
      <h1 className="text-center mb-3">Is this your school?</h1>
      
      <div style={{ 
        background: '#f0f8ff', 
        padding: '2rem', 
        borderRadius: '8px', 
        marginBottom: '2rem', 
        border: '2px solid #2196f3',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#2c5aa0', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
          {foundSchoolInfo?.name}
        </h2>
        <p style={{ color: '#6c757d', marginBottom: '0', fontSize: '1rem' }}>
          Teacher: {foundSchoolInfo?.teacher}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button 
          onClick={() => handleSchoolConfirmation(true)}
          className="btn btn-primary"
          style={{ padding: '1rem 2rem', fontSize: '1.1rem', minWidth: '120px' }}
        >
          ✓ Yes, that's my school
        </button>
        
        <button 
          onClick={() => handleSchoolConfirmation(false)}
          className="btn"
          style={{ 
            padding: '1rem 2rem', 
            fontSize: '1.1rem', 
            minWidth: '120px',
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            color: '#6c757d'
          }}
        >
          ← No, try again
        </button>
      </div>
    </div>
  );

  const renderInfoStep = () => (
    <div className="card">
      <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', border: '1px solid #dee2e6' }}>
        <h4 style={{ color: '#495057', marginBottom: '0.5rem' }}>
          {isTeacherFlow ? 'Adding Student to:' : 'Your School:'}
        </h4>
        <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2c5aa0', marginBottom: '0.25rem' }}>
          {schoolInfo?.name}
        </p>
        <p style={{ color: '#6c757d', marginBottom: '0', fontSize: '0.95rem' }}>
          Teacher: {schoolInfo?.teacher}
        </p>
      </div>

      <h2 className="text-center mb-3">{isTeacherFlow ? 'Student Info' : 'Tell Us About Yourself'}</h2>
      <p className="text-center mb-4" style={{ color: '#6c757d' }}>
        {isTeacherFlow 
          ? "Helps us find your student a great penpal who shares their interests!"
          : "Helps us find you a great penpal who shares your interests!"
        }
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-2" style={{ gap: '1rem' }}>
          <div className="form-group">
            <label htmlFor="first-name" className="form-label">
              {isTeacherFlow ? "Student's first name *" : "First Name *"}
            </label>
            <input 
              type="text" 
              id="first-name" 
              className="form-input" 
              placeholder={isTeacherFlow ? "Student's first name" : "Your first name"}
              value={formData.firstName}
              onChange={(e) => updateFormData('firstName', e.target.value)}
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
              placeholder={isTeacherFlow ? "Enter the first 1 or 2 letters of their last name" : "Enter the first 1 or 2 letters of your last name"}
              value={formData.lastInitial}
              onChange={(e) => updateFormData('lastInitial', e.target.value)}
              disabled={isLoading}
              maxLength={2}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="grade" className="form-label">Grade Level *</label>
          <select 
            id="grade" 
            className="form-select" 
            value={formData.grade}
            onChange={(e) => updateFormData('grade', e.target.value)}
            disabled={isLoading}
            required
          >
            <option value="">{isTeacherFlow ? "Select their grade" : "Select your grade"}</option>
            <option value="3">3rd Grade</option>
            <option value="4">4th Grade</option>
            <option value="5">5th Grade</option>
            <option value="6">6th Grade</option>
            <option value="7">7th Grade</option>
            <option value="8">8th Grade</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">{isTeacherFlow ? "Interests & Hobbies *" : "Your Interests & Hobbies *"}</label>
          <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '1rem' }}>
            {isTeacherFlow 
              ? "Select at least one that applies"
              : "Select at least one that applies - this helps us find you a great penpal!"
            }
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
            {INTEREST_OPTIONS.map(interest => (
              <label key={interest.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  checked={formData.interests.includes(interest.value)}
                  onChange={(e) => handleInterestChange(interest.value, e.target.checked)}
                  disabled={isLoading}
                />
                {interest.label}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="other-interests" className="form-label">Other Interests</label>
          <textarea 
            id="other-interests" 
            className="form-textarea" 
            placeholder={isTeacherFlow ? "Tell us about any other hobbies, interests, or activities..." : "Tell us about any other hobbies, interests, or activities you enjoy..."}
            rows={3}
            value={formData.otherInterests}
            onChange={(e) => updateFormData('otherInterests', e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{isTeacherFlow ? "How many pen pals would this student like?" : "Pen Pal Preference"}</label>
          <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '1rem' }}>
            {isTeacherFlow 
              ? "" 
              : "Would you like to have one pen pal or would you be excited to write to multiple pen pals?"
            }
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '1rem', 
              border: formData.penpalPreference === 'ONE' ? '2px solid #2196f3' : '1px solid #dee2e6',
              borderRadius: '8px', 
              cursor: 'pointer',
              backgroundColor: formData.penpalPreference === 'ONE' ? '#f0f8ff' : 'white',
              transition: 'all 0.2s ease'
            }}>
              <input 
                type="radio" 
                name="penpalPreference"
                value="ONE"
                checked={formData.penpalPreference === 'ONE'}
                onChange={() => updateFormData('penpalPreference', 'ONE')}
                disabled={isLoading}
                style={{ fontSize: '1.1rem' }}
              />
              <div>
                <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                  {isTeacherFlow ? "📝 Just one pen pal" : "📝 I'd prefer just one pen pal"}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                  Focus on building one great friendship
                </div>
              </div>
            </label>
            
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '1rem', 
              border: formData.penpalPreference === 'MULTIPLE' ? '2px solid #2196f3' : '1px solid #dee2e6',
              borderRadius: '8px', 
              cursor: 'pointer',
              backgroundColor: formData.penpalPreference === 'MULTIPLE' ? '#f0f8ff' : 'white',
              transition: 'all 0.2s ease'
            }}>
              <input 
                type="radio" 
                name="penpalPreference"
                value="MULTIPLE"
                checked={formData.penpalPreference === 'MULTIPLE'}
                onChange={() => updateFormData('penpalPreference', 'MULTIPLE')}
                disabled={isLoading}
                style={{ fontSize: '1.1rem' }}
              />
              <div>
                <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                  {isTeacherFlow ? "✉️ Multiple pen pals if possible!" : "✉️ I'd love multiple pen pals if possible!"}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                  {isTeacherFlow ? "Excited to write to 2-3 different students" : "I'm excited to write to 2-3 different students"}
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="card" style={{ background: '#f8f9fa', padding: '1.5rem', margin: '1.5rem 0' }}>
          <h3>Parent/Guardian Permission</h3>
          
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '1rem' }}>
              <input 
                type="checkbox" 
                checked={formData.parentConsent}
                onChange={(e) => updateFormData('parentConsent', e.target.checked)}
                disabled={isLoading}
                required 
                style={{ marginTop: '0.25rem' }}
              />
              <span>
                {isTeacherFlow 
                  ? "My student has permission from their parent or guardian to participate in The Right Back at You Project. This includes reading the book and exchanging letters with students from other schools. *"
                  : "I have permission from my parent or guardian to participate in The Right Back at You Project. This includes reading the book and exchanging letters with students from other schools. *"
                }
              </span>
            </label>
          </div>

          <div style={{ background: '#e9ecef', padding: '1rem', borderRadius: '6px', marginTop: '1rem' }}>
            <p style={{ margin: '0', fontSize: '0.9rem', color: '#495057' }}>
              <strong>Privacy Protection:</strong> {isTeacherFlow 
                ? "We only collect your student's first name and last 1 or 2 initials to protect their privacy."
                : "We only collect your first name and last initial to protect your privacy. Your teacher will help coordinate any additional communication needed."
              }
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="form-group text-center">
          <button 
            type="submit" 
            className="btn btn-primary" 
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

  const renderSuccessStep = () => {
    if (isTeacherFlow) {
      // Teacher-added student success page
      return (
        <div className="card text-center" style={{ background: '#d4edda' }}>
          <h2 style={{ color: '#155724' }}>{registeredStudent?.firstName} Registered</h2>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
            <Link 
              href="/dashboard"
              className="btn btn-primary"
            >
              Return to Dashboard
            </Link>
            
            <Link 
              href={`/register-student?token=${formData.schoolToken}`}
              className="btn btn-secondary"
            >
              Add Another Student
            </Link>
          </div>
        </div>
      );
    } else {
      // Student self-registration success page
      return (
        <div className="card text-center" style={{ background: '#d4edda' }}>
          <h2 style={{ color: '#155724' }}>Thank You, {registeredStudent?.firstName}!</h2>
          <p style={{ color: '#155724', fontSize: '1.1rem' }}>
            Your registration for The Right Back at You Project has been submitted successfully. 
          </p>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '6px', margin: '1.5rem 0', border: '1px solid #c3e6cb' }}>
            <p style={{ color: '#155724', marginBottom: '1rem' }}>
              <strong>School:</strong> {registeredStudent?.schoolName}
            </p>
            <p style={{ color: '#155724', marginBottom: '0' }}>
              Your teacher will receive your details and you'll be matched with a penpal soon!
            </p>
          </div>
          <p style={{ color: '#6c757d', marginTop: '1.5rem' }}>
            You can close this page now. Your teacher will let you know when it's time to start writing letters!
          </p>
        </div>
      );
    }
  };

  // Don't render anything until session check is complete
  if (!sessionCheckComplete) {
    return (
      <div className="page">
        <Header />
        <main className="container" style={{ flex: 1, paddingTop: '3rem' }}>
          <div className="card">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="loading" style={{ margin: '0 auto 1rem' }}></div>
              <p>Loading registration form...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <Header />

      <main className="container" style={{ flex: 1, paddingTop: '3rem' }}>
        <div className="container">
          {/* Show loading during API calls */}
          {isLoading && currentStep !== 'info' && (
            <div className="card">
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div className="loading" style={{ margin: '0 auto 1rem' }}></div>
                <p>Processing...</p>
              </div>
            </div>
          )}

          {/* Show error state */}
          {error && !isLoading && (
            <div className="card">
              <div className="alert alert-error">
                <strong>Error:</strong> {error}
              </div>
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Link href="/login" className="btn btn-primary">
                  Login as Teacher
                </Link>
              </div>
            </div>
          )}

          {/* Show form steps when ready */}
          {!isLoading && !error && (
            <>
              {currentStep === 'schoolVerify' && renderSchoolVerifyStep()}
              {currentStep === 'schoolConfirm' && renderSchoolConfirmStep()}
              {currentStep === 'info' && renderInfoStep()}
              {currentStep === 'success' && renderSuccessStep()}
            </>
          )}

          {/* Help section - only show when not in success or error state */}
          {!error && currentStep !== 'success' && (
            <div className="card mt-3" style={{ background: '#f8f9fa' }}>
              <h3>Questions?</h3>
              <p style={{ marginBottom: '1rem' }}>
                If you need help or have questions about the project, ask your teacher or contact us:
              </p>
              <p style={{ marginBottom: '0' }}>
                <strong>Email:</strong> <a href="mailto:carolyn.mackler@gmail.com" style={{ color: '#4a90e2' }}>carolyn.mackler@gmail.com</a>
              </p>
            </div>
          )}
        </div>
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
