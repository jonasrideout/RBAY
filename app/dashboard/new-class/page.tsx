// /app/dashboard/new-class/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTeacherSession } from '@/lib/useTeacherSession';
import Header from '../../components/Header';
import SchoolFormFields from '../../register-school/components/SchoolFormFields';
import { SchoolFormData } from '../../register-school/types';
import { STATE_TO_REGION } from '../../register-school/constants';

const EMPTY_FORM_DATA: SchoolFormData = {
  teacherName: '',
  teacherEmail: '',
  teacherPhone: '',
  schoolName: '',
  schoolCity: '',
  schoolState: '',
  schoolCountry: 'United States',
  gradeLevels: [],
  classSize: '',
  programStartMonth: '',
  specialConsiderations: '',
  parentNotification: false,
  communicationPlatforms: [],
  communicationPlatformsOther: '',
  mailingAddress: '',
  hasMultipleClasses: false,
  teacherNames: []
};

// A value of "TBD" can show up on older/admin-created school rows in place
// of a real answer. Treat it the same as "not actually filled in yet" so we
// don't pre-fill the new class's form with a placeholder.
function cleanValue(value: string | null | undefined): string {
  if (!value || value === 'TBD') return '';
  return value;
}

export default function StartNewClassPage() {
  const { data: session, status } = useTeacherSession();
  const router = useRouter();

  const [pageState, setPageState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadError, setLoadError] = useState('');
  const [previousSchoolId, setPreviousSchoolId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SchoolFormData>(EMPTY_FORM_DATA);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const teacherEmail = session?.user?.email;
    if (!teacherEmail) {
      setLoadError('Could not determine your logged-in email address.');
      setPageState('error');
      return;
    }

    const loadCurrentSchool = async () => {
      try {
        const response = await fetch(`/api/schools?teacherEmail=${encodeURIComponent(teacherEmail)}`);
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 404) {
            // No active school on file at all — this teacher isn't
            // "returning" in the sense this page is built for. Send them
            // through the normal first-time registration instead.
            router.push('/register-school');
            return;
          }
          throw new Error(data.error || 'Failed to load your current school information');
        }

        const school = data.school;
        setPreviousSchoolId(school.id);

        const gradeLevels = cleanValue(school.gradeLevel)
          ? school.gradeLevel.split(',').map((g: string) => g.trim()).filter(Boolean)
          : [];

        setFormData({
          teacherName: school.teacherName || '',
          teacherEmail: school.teacherEmail || teacherEmail,
          teacherPhone: school.teacherPhone || '',
          schoolName: school.schoolName || '',
          schoolCity: school.schoolCity || '',
          schoolState: cleanValue(school.schoolState),
          schoolCountry: school.schoolCountry || 'United States',
          gradeLevels,
          // Class size and start month are inherently new-class values, so
          // these start blank even though everything else is pre-filled.
          classSize: '',
          programStartMonth: '',
          specialConsiderations: school.specialConsiderations || '',
          parentNotification: false,
          communicationPlatforms: school.communicationPlatforms || [],
          communicationPlatformsOther: '',
          mailingAddress: school.mailingAddress || '',
          hasMultipleClasses: school.hasMultipleClasses || false,
          teacherNames: school.teacherNames || []
        });

        setPageState('ready');
      } catch (err: any) {
        setLoadError(err.message || 'Something went wrong loading your school information.');
        setPageState('error');
      }
    };

    loadCurrentSchool();
  }, [session, status, router]);

  const updateFormData = (field: keyof SchoolFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (submitError) setSubmitError('');
  };

  const handleGradeLevelChange = (grade: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      gradeLevels: checked
        ? [...prev.gradeLevels, grade]
        : prev.gradeLevels.filter(g => g !== grade)
    }));
    if (submitError) setSubmitError('');
  };

  const getRegionForState = (state: string) => {
    return STATE_TO_REGION[state] || '';
  };

  const handleLogout = () => {
    router.push('/api/auth/signout?callbackUrl=' + encodeURIComponent(window.location.origin));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    const isUSSchool = formData.schoolCountry === 'United States';

    const requiredFields: (keyof SchoolFormData)[] = [
      'teacherName', 'teacherEmail', 'schoolName',
      'classSize', 'programStartMonth', 'mailingAddress'
    ];

    if (isUSSchool) {
      requiredFields.push('schoolState');
    }

    for (const field of requiredFields) {
      if (!formData[field]) {
        setSubmitError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }
    }

    if (formData.gradeLevels.length === 0) {
      setSubmitError('Please select at least one grade level');
      setIsSubmitting(false);
      return;
    }

    if (!formData.teacherEmail.includes('@')) {
      setSubmitError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    if (formData.communicationPlatforms.length === 0) {
      setSubmitError('Please select at least one communication platform');
      setIsSubmitting(false);
      return;
    }

    if (formData.communicationPlatforms.includes('Other') && !formData.communicationPlatformsOther.trim()) {
      setSubmitError('Please specify the other communication platform');
      setIsSubmitting(false);
      return;
    }

    try {
      const region = isUSSchool ? getRegionForState(formData.schoolState) : formData.schoolCountry;

      const communicationPlatformsFormatted = formData.communicationPlatforms
        .map(platform => {
          if (platform === 'Other' && formData.communicationPlatformsOther) {
            return `Other: ${formData.communicationPlatformsOther}`;
          }
          return platform;
        })
        .filter(p => p !== 'Other');

      const dataToSend = {
        teacherName: formData.teacherName,
        teacherEmail: formData.teacherEmail,
        teacherPhone: formData.teacherPhone,
        schoolName: formData.schoolName,
        schoolCity: formData.schoolCity,
        schoolAddress: '',
        schoolState: formData.schoolState,
        schoolCountry: formData.schoolCountry,
        schoolZip: '',
        region,
        gradeLevel: formData.gradeLevels.join(', '),
        expectedClassSize: formData.classSize,
        startMonth: formData.programStartMonth,
        specialConsiderations: formData.specialConsiderations,
        communicationPlatforms: communicationPlatformsFormatted,
        mailingAddress: formData.mailingAddress,
        hasMultipleClasses: formData.hasMultipleClasses,
        teacherNames: formData.teacherNames,
        isAdminFlow: false,
        previousSchoolId
      };

      const response = await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start this year\u2019s class');
      }

      router.push('/dashboard');

    } catch (err: any) {
      setSubmitError(err.message || 'There was an error starting your new class. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pageState === 'loading' || status === 'loading') {
    return (
      <div className="page">
        <Header session={session} onLogout={handleLogout} />
        <main className="container" style={{ flex: 1, paddingTop: '1.5rem' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="loading" style={{ margin: '0 auto 1rem' }}></div>
            <p>Loading your school information...</p>
          </div>
        </main>
      </div>
    );
  }

  if (pageState === 'error') {
    return (
      <div className="page">
        <Header session={session} onLogout={handleLogout} />
        <main className="container" style={{ flex: 1, paddingTop: '1.5rem' }}>
          <div className="alert alert-error">
            <strong>Error:</strong> {loadError}
          </div>
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <a href="/dashboard" className="btn btn-primary">Back to Dashboard</a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <Header session={session} onLogout={handleLogout} />

      <main className="container" style={{ flex: 1, paddingTop: '1.5rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          <div style={{ marginBottom: '1.5rem' }}>
            <h1 className="text-school-name" style={{ marginBottom: '0.5rem', fontSize: '1.8rem' }}>
              Start This Year&rsquo;s Class
            </h1>
            <p className="text-school-name" style={{ margin: 0 }}>
              We&rsquo;ve pre-filled your info from last year. Please confirm it&rsquo;s still
              accurate before starting your new class &mdash; update anything that&rsquo;s
              changed, like your grade level or communication platform.
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit}>
              <SchoolFormFields
                formData={formData}
                isLoading={isSubmitting}
                onUpdateFormData={updateFormData}
                onGradeLevelChange={handleGradeLevelChange}
                isEmailReadOnly={true}
              />

              {submitError && (
                <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                  {submitError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <a href="/dashboard" className="btn">
                  Cancel
                </a>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading"></span>
                      <span style={{ marginLeft: '0.5rem' }}>Starting Your Class...</span>
                    </>
                  ) : (
                    'Confirm & Start This Year\u2019s Class'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
