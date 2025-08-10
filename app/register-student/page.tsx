"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface StudentFormData {
  teacherEmail: string;
  firstName: string;
  lastName: string;
  grade: string;
  interests: string[];
  otherInterests: string;
  parentName: string;
  parentEmail: string;
  parentConsent: boolean;
}

interface SchoolInfo {
  name: string;
  teacher: string;
  found: boolean;
}

type Step = 'school' | 'confirm' | 'info' | 'success';

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

export default function RegisterStudent() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<Step>('school');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<StudentFormData>({
    teacherEmail: '',
    firstName: '',
    lastName: '',
    grade: '',
    interests: [],
    otherInterests: '',
    parentName: '',
    parentEmail: '',
    parentConsent: false
  });
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [error, setError] = useState('');
  const [registeredStudent, setRegisteredStudent] = useState<any>(null);

  // Check if teacher email was provided in URL
  useEffect(() => {
    const teacherEmail = searchParams.get('teacher');
    if (teacherEmail) {
      setFormData(prev => ({ ...prev, teacherEmail }));
      // Auto-verify the school if email is in URL
      handleFindSchool(null, teacherEmail);
    }
  }, [searchParams]);

  const handleFindSchool = async (e: React.FormEvent | null, email?: string) => {
    if (e) e.preventDefault();
    
    const emailToUse = email || formData.teacherEmail;
    setIsLoading(true);
    setError('');
    
    if (!emailToUse.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/schools?teacherEmail=${encodeURIComponent(emailToUse)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'School not found');
      }

      setSchoolInfo({
        name: data.school.schoolName,
        teacher: `${data.school.teacherFirstName} ${data.school.teacherLastName}`,
        found: true
      });
      setFormData(prev => ({ ...prev, teacherEmail: emailToUse }));
      setCurrentStep('confirm');
    } catch (err: any) {
      setError(err.message || 'Unable to find a school with that email address. Please check the email and try again.');
    } finally {
      setIsLoading(false);
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
    
    if (!formData.firstName || !formData.lastName || !formData.grade || 
        !formData.parentName || !formData.parentEmail || !formData.parentConsent) {
      setError('Please fill in all required fields and check the parent consent box');
      setIsLoading(false);
      return;
    }
    
    if (!formData.parentEmail.includes('@')) {
      setError('Please enter a valid parent/guardian email address');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register student');
      }

      setRegisteredStudent(data.student);
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

  const renderSchoolStep = () => (
    <div className="card">
      <h1 className="text-center mb-3">Join The Right Back at You Project</h1>
      <p className="text-center mb-4" style={{ color: '#6c757d' }}>
        First, let's make sure your teacher has registered your school for this project.
      </p>

      <form onSubmit={(e) => handleFindSchool(e)}>
        <div className="form-group">
          <label htmlFor="teacher-email" className="form-label">
            What is your teacher's email address?
          </label>
          <input 
            type="email" 
            id="teacher-email" 
            className="form-input" 
            placeholder="ms.johnson@school.edu"
            value={formData.teacherEmail}
            onChange={(e) => updateFormData('teacherEmail', e.target.value)}
            disabled={isLoading}
            required
          />
          <small style={{ color: '#6c757d', fontSize: '0.9rem' }}>
            This helps us find your school and connect you to your class
          </small>
        </div>

        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="form-group text-center">
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="loading"></span>
                <span style={{ marginLeft: '0.5rem' }}>Finding School...</span>
              </>
            ) : (
              'Find My School'
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderConfirmStep = () => (
    <div className="card">
      <h1 className="text-center mb-3">Is This Your School?</h1>
      
      <div className="alert alert-success text-center" style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: '#155724', marginBottom: '0.5rem' }}>✅ We found your school:</h3>
        <p style={{ color: '#155724', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
          {schoolInfo?.name}
        </p>
        <p style={{ color: '#155724', fontSize: '1rem', marginBottom: '0' }}>
          Teacher: {schoolInfo?.teacher}
        </p>
      </div>

      <div className="text-center">
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#6c757d' }}>
          Please confirm this is the correct school before continuing.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={() => setCurrentStep('info')}
            style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
          >
            ✅ Yes, that's my school
          </button>
          
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => {
              setCurrentStep('school');
              setSchoolInfo(null);
              setError('');
            }}
            style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
          >
            ❌ No, try different email
          </button>
        </div>
      </div>
    </div>
  );

  const renderInfoStep = () => (
    <div className="card">
      <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', border: '1px solid #dee2e6' }}>
        <h4 style={{ color: '#495057', marginBottom: '0.5rem' }}>Your School:</h4>
        <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2c5aa0', marginBottom: '0.25rem' }}>
          {schoolInfo?.name}
        </p>
        <p style={{ color: '#6c757d', marginBottom: '0', fontSize: '0.95rem' }}>
          Teacher: {schoolInfo?.teacher}
        </p>
      </div>

      <h2 className="text-center mb-3">Tell Us About Yourself</h2>
      <p className="text-center mb-4" style={{ color: '#6c757d' }}>
        This information helps us find you a great penpal who shares your interests!
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-2" style={{ gap: '1rem' }}>
          <div className="form-group">
            <label htmlFor="first-name" className="form-label">First Name *</label>
            <input 
              type="text" 
              id="first-name" 
              className="form-input" 
              placeholder="Your first name"
              value={formData.firstName}
              onChange={(e) => updateFormData('firstName', e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="last-name" className="form-label">Last Name *</label>
            <input 
              type="text" 
              id="last-name" 
              className="form-input" 
              placeholder="Your last name"
              value={formData.lastName}
              onChange={(e) => updateFormData('lastName', e.target.value)}
              disabled={isLoading}
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
            <option value="">Select your grade</option>
            <option value="3">3rd Grade</option>
            <option value="4">4th Grade</option>
            <option value="5">5th Grade</option>
            <option value="6">6th Grade</option>
            <option value="7">7th Grade</option>
            <option value="8">8th Grade</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Your Interests & Hobbies</label>
          <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Select all that apply - this helps us find you a great penpal!
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
            placeholder="Tell us about any other hobbies, interests, or activities you enjoy..."
            rows={3}
            value={formData.otherInterests}
            onChange={(e) => updateFormData('otherInterests', e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="card" style={{ background: '#f8f9fa', padding: '1.5rem', margin: '1.5rem 0' }}>
          <h3>Parent/Guardian Information</h3>
          <p style={{ color: '#6c757d', marginBottom: '1rem' }}>
            We need a parent or guardian's permission for you to participate in this project.
          </p>
          
          <div className="grid grid-2">
            <div className="form-group">
              <label htmlFor="parent-name" className="form-label">Parent/Guardian Name *</label>
              <input 
                type="text" 
                id="parent-name" 
                className="form-input" 
                placeholder="Parent or guardian's name"
                value={formData.parentName}
                onChange={(e) => updateFormData('parentName', e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="parent-email" className="form-label">Parent/Guardian Email *</label>
              <input 
                type="email" 
                id="parent-email" 
                className="form-input" 
                placeholder="parent@example.com"
                value={formData.parentEmail}
                onChange={(e) => updateFormData('parentEmail', e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <input 
                type="checkbox" 
                checked={formData.parentConsent}
                onChange={(e) => updateFormData('parentConsent', e.target.checked)}
                disabled={isLoading}
                required 
              />
              <span>
                I have permission from my parent/guardian to participate in The Right Back at You Project, 
                including reading the book and exchanging letters with students from other schools. *
              </span>
            </label>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="form-group text-center">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => setCurrentStep('confirm')}
            disabled={isLoading}
            style={{ marginRight: '1rem' }}
          >
            ← Go Back
          </button>
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
              'Submit My Information'
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderSuccessStep = () => (
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

  return (
    <div className="page">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/RB@Y-logo.jpg" alt="Right Back at You" style={{ height: '40px' }} />
              The Right Back at You Project
            </Link>
            <nav className="nav">
              <Link href="/" className="nav-link">Home</Link>
              <Link href="/login" className="nav-link">Login</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container" style={{ flex: 1, paddingTop: '3rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {currentStep === 'school' && renderSchoolStep()}
          {currentStep === 'confirm' && renderConfirmStep()}
          {currentStep === 'info' && renderInfoStep()}
          {currentStep === 'success' && renderSuccessStep()}

          {/* Help Section */}
          <div className="card mt-3" style={{ background: '#f8f9fa' }}>
            <h3>Questions?</h3>
            <p style={{ marginBottom: '1rem' }}>
              If you need help or have questions about the project, ask your teacher or contact us:
            </p>
            <p style={{ marginBottom: '0' }}>
              <strong>Email:</strong> <a href="mailto:carolyn.mackler@gmail.com" style={{ color: '#4a90e2' }}>carolyn.mackler@gmail.com</a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: '#343a40', color: 'white', padding: '2rem 0', marginTop: '3rem' }}>
        <div className="container text-center">
          <p>&copy; 2024 The Right Back at You Project by Carolyn Mackler. Building empathy and connection through literature.</p>
        </div>
      </footer>
    </div>
  );
}
