// /app/dashboard/components/DashboardTimeline.tsx
"use client";
import { useState, useMemo } from 'react';
import Link from 'next/link';

interface SchoolData {
  id: string;
  schoolName: string;
  teacherEmail: string;
  dashboardToken: string;
  status: 'COLLECTING' | 'READY' | 'MATCHED' | 'CORRESPONDING' | 'DONE';
  students: any[];
  matchedWithSchoolId?: string;
  matchedSchool?: {
    schoolName: string;
    actualStudentCount: number;
    isGroup?: boolean;
    schools?: Array<{ schoolName: string }>;
  };
  studentStats?: {
    hasPenpalAssignments: boolean;
  };
  schoolGroup?: {
    matchedWithGroupId?: string;
    schools: Array<{ students: any[] }>;
  };
}

interface DashboardTimelineProps {
  schoolData: SchoolData;
  readOnly?: boolean;
  isProfileIncomplete?: boolean;
  allActiveStudentsComplete?: boolean;
  onMatchingRequested?: () => void;
  onPenpalPreferenceCheckNeeded?: (required: number, current: number, matchedSchoolName: string) => void;
}

// Same math that used to live inline in the old "Ready to Pair" click
// handler, now run on every render so the dashboard always reflects the
// current, live requirement rather than a stale one-time check. (The
// authoritative version that actually triggers teacher notification emails
// lives server-side in /lib/penpalRequirement.ts - this is the display copy
// of the same calculation.)
function calculateLiveRequirement(schoolData: SchoolData): { required: number; current: number; matchedSchoolName: string } | null {
  if (!schoolData.matchedWithSchoolId && !schoolData.schoolGroup?.matchedWithGroupId) {
    return null;
  }

  const isInGroup = !!schoolData.schoolGroup;
  let totalStudentsInGroup: number;
  let thisSchoolStudentCount: number;

  let targetClassSize = 0;
  let matchedSchoolName = 'the matched school';

  if (schoolData.matchedWithSchoolId && schoolData.matchedSchool) {
    targetClassSize = schoolData.matchedSchool.actualStudentCount;
    if (schoolData.matchedSchool.isGroup && schoolData.matchedSchool.schools) {
      matchedSchoolName = schoolData.matchedSchool.schools.map(s => s.schoolName).join(' + ');
    } else {
      matchedSchoolName = schoolData.matchedSchool.schoolName;
    }
  }

  if (isInGroup) {
    const allGroupStudents = schoolData.schoolGroup!.schools.flatMap(school => school.students);
    totalStudentsInGroup = allGroupStudents.length;
    thisSchoolStudentCount = schoolData.students.length;
  } else {
    totalStudentsInGroup = schoolData.students.length;
    thisSchoolStudentCount = schoolData.students.length;
  }

  const totalGroupRequired = totalStudentsInGroup < targetClassSize
    ? targetClassSize - totalStudentsInGroup
    : 0;

  const thisSchoolRequired = isInGroup
    ? Math.ceil(totalGroupRequired * (thisSchoolStudentCount / totalStudentsInGroup))
    : totalGroupRequired;

  const thisSchoolCurrentMultiple = schoolData.students.filter(
    (s: any) => s.penpalPreference === 'MULTIPLE'
  ).length;

  return {
    required: thisSchoolRequired,
    current: thisSchoolCurrentMultiple,
    matchedSchoolName
  };
}

export default function DashboardTimeline({
  schoolData,
  readOnly = false,
  isProfileIncomplete = false,
  allActiveStudentsComplete = false,
  onMatchingRequested,
  onPenpalPreferenceCheckNeeded
}: DashboardTimelineProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [isRequestingMatching, setIsRequestingMatching] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const penPalsAssigned = schoolData?.studentStats?.hasPenpalAssignments || false;
  const isReady = ['READY', 'MATCHED', 'CORRESPONDING', 'DONE'].includes(schoolData.status);
  const isMatched = !!schoolData.matchedWithSchoolId || !!schoolData.schoolGroup?.matchedWithGroupId;

  const liveRequirement = useMemo(() => calculateLiveRequirement(schoolData), [schoolData]);
  const needsMultipleSelection = !!liveRequirement && liveRequirement.current < liveRequirement.required;
  const hasAnyMultipleSelected = schoolData.students.some((s: any) => s.penpalPreference === 'MULTIPLE');

  const generateStudentLink = () => {
    if (typeof window !== 'undefined' && schoolData.dashboardToken) {
      return `${window.location.origin}/register-student?token=${schoolData.dashboardToken}`;
    }
    return '';
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generateStudentLink());
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleReadyClick = () => {
    if (needsMultipleSelection && liveRequirement) {
      if (onPenpalPreferenceCheckNeeded) {
        onPenpalPreferenceCheckNeeded(liveRequirement.required, liveRequirement.current, liveRequirement.matchedSchoolName);
      }
      return;
    }
    setShowConfirmation(true);
  };

  const handleUnreadyClick = async () => {
    setIsRequestingMatching(true);
    try {
      const response = await fetch('/api/schools/request-matching', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherEmail: schoolData.teacherEmail })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update readiness');
      }

      // Deliberately not calling onMatchingRequested here - that callback
      // optimistically sets status to READY, which is the wrong direction
      // for un-readying. The reload below picks up the real, correct state.
      setTimeout(() => window.location.reload(), 500);

    } catch (err: any) {
      console.error('Error un-readying:', err);
      alert('Error updating readiness: ' + err.message);
      setIsRequestingMatching(false);
    }
  };

  const handleToggleClick = () => {
    if (isReady) {
      handleUnreadyClick();
    } else {
      handleReadyClick();
    }
  };

  const handleConfirmPairing = async () => {
    setShowConfirmation(false);
    setIsRequestingMatching(true);

    try {
      const response = await fetch('/api/schools/request-matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherEmail: schoolData.teacherEmail,
          dashboardToken: schoolData.dashboardToken
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to request pairing');
      }

      if (onMatchingRequested) onMatchingRequested();
      setTimeout(() => window.location.reload(), 1000);

    } catch (err: any) {
      console.error('Error requesting pairing:', err);
      alert('Error requesting pairing: ' + err.message);
    } finally {
      setIsRequestingMatching(false);
    }
  };

  const handleCancelPairing = () => setShowConfirmation(false);

  const readyCheckboxDisabled =
    isProfileIncomplete ||
    isRequestingMatching ||
    schoolData.students.length === 0 ||
    !allActiveStudentsComplete ||
    !isMatched;

  // Once ready, the toggle should only ever be locked by the true final
  // freeze (pen pals actually assigned) - everything else that gated
  // turning it ON in the first place doesn't apply to turning it back OFF.
  const toggleDisabled = isReady
    ? (penPalsAssigned || isRequestingMatching)
    : readyCheckboxDisabled;

  const readyCheckboxTitle = isProfileIncomplete
    ? 'Complete your profile first'
    : !isMatched
    ? 'Must be matched with another school first'
    : schoolData.students.length === 0
    ? 'Need students first'
    : !allActiveStudentsComplete
    ? 'Complete all student profiles first'
    : 'Indicate readiness to pair pen pals';

  // Step circle state: 1 = current/active (highlighted), 2 = done, 3 = upcoming
  const stepState = (step: 1 | 2 | 3): 'active' | 'done' | 'upcoming' => {
    if (step === 1) return isReady ? 'done' : 'active';
    if (step === 2) return penPalsAssigned ? 'done' : (isReady ? 'active' : 'upcoming');
    return penPalsAssigned ? 'active' : 'upcoming';
  };

  const circleStyle = (state: 'active' | 'done' | 'upcoming') => ({
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: '14px',
    flexShrink: 0,
    backgroundColor: state === 'active' ? '#28a745' : state === 'done' ? '#c3e6cb' : '#e9ecef',
    color: state === 'active' ? 'white' : state === 'done' ? '#155724' : '#adb5bd',
    border: state === 'upcoming' ? '1px solid #dee2e6' : 'none'
  });

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      {/* Step circles + labels, laid out as one 3-column grid so each label
          is guaranteed to sit centered under its own circle rather than
          depending on two separate rows staying in sync. */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', marginBottom: '1.5rem' }}>
        {([1, 2, 3] as const).map((step, index) => (
          <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {index > 0 && (
              <div style={{
                position: 'absolute',
                top: '18px',
                right: '50%',
                width: '100%',
                height: '2px',
                backgroundColor: stepState((step - 1) as 1 | 2 | 3) === 'upcoming' ? '#e9ecef' : '#c3e6cb',
                zIndex: 0
              }} />
            )}
            <div style={{ ...circleStyle(stepState(step)), position: 'relative', zIndex: 1 }}>
              {stepState(step) === 'done' ? '✓' : step}
            </div>
            <span style={{ marginTop: '0.5rem', fontSize: '13px', color: '#6c757d', textAlign: 'center' }}>
              {step === 1 ? 'Register Students' : step === 2 ? 'Ready to Pair' : 'Distribute Pen Pals'}
            </span>
          </div>
        ))}
      </div>

      {readOnly ? (
        <p className="text-meta-info" style={{ margin: 0 }}>
          {penPalsAssigned
            ? 'Pen pals were assigned for this class.'
            : isReady
            ? 'This class was marked ready to pair.'
            : 'This class was still registering students.'}
        </p>
      ) : (
        <>
          {/* Step 1 content: roster management buttons plus the toggle that
              completes this step. Roster management itself stays available
              through step 2 too, since students can be added/removed right
              up until pen pals are actually assigned - only the toggle
              belongs exclusively to step 1. */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
            <button
              onClick={handleCopyLink}
              className="btn"
              disabled={isProfileIncomplete || penPalsAssigned || isReady}
              style={{
                backgroundColor: copyStatus === 'copied' ? '#28a745' : 'white',
                color: copyStatus === 'copied' ? 'white' : '#555',
                border: copyStatus === 'copied' ? '1px solid #28a745' : '1px solid #ddd',
                borderRadius: '10px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                opacity: (isProfileIncomplete || penPalsAssigned || isReady) ? 0.6 : 1,
                cursor: (isProfileIncomplete || penPalsAssigned || isReady) ? 'not-allowed' : 'pointer'
              }}
            >
              {copyStatus === 'copied' ? (
                '✓ Copied!'
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  Copy Student Link
                </>
              )}
            </button>

            <Link
              href={(isProfileIncomplete || penPalsAssigned || isReady) ? '#' : `/register-student?token=${schoolData.dashboardToken}`}
              className="btn"
              onClick={(e) => { if (isProfileIncomplete || penPalsAssigned || isReady) e.preventDefault(); }}
              style={{
                fontSize: '13px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                borderRadius: '10px',
                opacity: (isProfileIncomplete || penPalsAssigned || isReady) ? 0.6 : 1,
                cursor: (isProfileIncomplete || penPalsAssigned || isReady) ? 'not-allowed' : 'pointer',
                pointerEvents: (isProfileIncomplete || penPalsAssigned || isReady) ? 'none' : 'auto'
              }}
              title={penPalsAssigned ? 'Cannot add students after pen pals are assigned' : isReady ? 'Toggle "All students are in" off to add more students' : 'Add new student'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add New Student
            </Link>
          </div>

          {/* "All students are in" toggle - freely reversible up until pen
              pals are actually assigned, so a teacher can turn it off again
              if they realize they need to add or remove someone, then turn
              it back on when they're done. */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button
                type="button"
                role="switch"
                aria-checked={isReady}
                disabled={toggleDisabled}
                onClick={handleToggleClick}
                title={isReady ? 'Toggle off to make changes' : readyCheckboxTitle}
                style={{
                  width: '40px',
                  height: '22px',
                  borderRadius: '11px',
                  border: 'none',
                  position: 'relative',
                  flexShrink: 0,
                  backgroundColor: isReady ? '#28a745' : '#dee2e6',
                  cursor: toggleDisabled ? 'not-allowed' : 'pointer',
                  opacity: toggleDisabled ? 0.6 : 1,
                  transition: 'background-color 0.2s ease',
                  padding: 0
                }}
              >
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  left: isReady ? '20px' : '2px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
                  transition: 'left 0.2s ease'
                }} />
              </button>
              <span className="text-data-value">
                {isRequestingMatching ? 'Updating…' : 'All students are in'}
              </span>
            </div>

            {isReady && !penPalsAssigned && (
              <p className="text-meta-info" style={{ margin: 0, marginTop: '0.5rem' }}>
                Need to add or remove a student? Toggle this off to make changes, then toggle it back on when you&rsquo;re done.
              </p>
            )}
          </div>

          {/* Step 2 content - pure live status, no button of its own except
              when students need to be selected for an extra pen pal. */}
          {isReady && !penPalsAssigned && (
            <div style={{ paddingTop: '1rem', borderTop: '1px solid #f0f0f0' }}>
              <p className="text-meta-info" style={{ margin: 0, marginBottom: needsMultipleSelection ? '0.75rem' : 0 }}>
                {needsMultipleSelection
                  ? (hasAnyMultipleSelected
                      ? 'Select additional students to have more than 1 pen pal.'
                      : 'Select students to have more than 1 pen pal.')
                  : liveRequirement
                  ? `Waiting for ${liveRequirement.matchedSchoolName}'s class to finish registering their students. You can continue adding students until pen pals are matched.`
                  : 'Waiting to be matched with a partner school.'}
              </p>

              {needsMultipleSelection && liveRequirement && (
                <button
                  className="btn"
                  style={{ fontSize: '13px', borderRadius: '10px', marginTop: '0.75rem' }}
                  onClick={() => onPenpalPreferenceCheckNeeded && onPenpalPreferenceCheckNeeded(liveRequirement.required, liveRequirement.current, liveRequirement.matchedSchoolName)}
                >
                  Select Students
                </button>
              )}
            </div>
          )}

          {/* Step 3 content */}
          {penPalsAssigned && (
            <div style={{ paddingTop: '1rem', borderTop: '1px solid #f0f0f0' }}>
              <Link
                href={`/teacher/pen-pal-list?schoolId=${schoolData.id}`}
                className="btn"
                style={{ fontSize: '13px', borderRadius: '10px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
              >
                Download Pen Pal List
              </Link>
            </div>
          )}
        </>
      )}

      {showConfirmation && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white', padding: '2rem', borderRadius: '8px',
            maxWidth: '500px', width: '90%', textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}>
            <h3 style={{ color: '#495057', marginBottom: '1rem' }}>
              Ready to Pair Pen Pals?
            </h3>
            <p style={{ color: '#6c757d', marginBottom: '2rem', lineHeight: '1.5' }}>
              You can keep adding or removing students until {liveRequirement?.matchedSchoolName || 'the matched school'} has
              all their students in. We&rsquo;ll let you know if you need to come back and select
              additional students who may need more than one pen pal.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={handleCancelPairing} className="btn">
                Cancel
              </button>
              <button
                onClick={handleConfirmPairing}
                className="btn"
                style={{ backgroundColor: '#28a745', color: 'white', borderColor: '#28a745' }}
              >
                Yes, Ready to Pair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
