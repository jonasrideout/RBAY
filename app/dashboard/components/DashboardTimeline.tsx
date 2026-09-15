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

  const lineStyle = (leftState: 'active' | 'done' | 'upcoming') => ({
    flex: 1,
    height: '2px',
    backgroundColor: leftState === 'upcoming' ? '#e9ecef' : '#c3e6cb',
    margin: '0 8px'
  });

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      {/* Step circles */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={circleStyle(stepState(1))}>{stepState(1) === 'done' ? '✓' : '1'}</div>
        <div style={lineStyle(stepState(1))} />
        <div style={circleStyle(stepState(2))}>{stepState(2) === 'done' ? '✓' : '2'}</div>
        <div style={lineStyle(stepState(2))} />
        <div style={circleStyle(stepState(3))}>{stepState(3) === 'done' ? '✓' : '3'}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '13px', color: '#6c757d', textAlign: 'center' as const }}>
        <span style={{ flex: 1 }}>Register Students</span>
        <span style={{ flex: 1 }}>Ready to Pair</span>
        <span style={{ flex: 1 }}>Distribute Pen Pals</span>
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
          {/* Step 1 content - roster management stays available through step 2,
              since students can be added/removed right up until pen pals are
              actually assigned. */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: isReady ? '1.5rem' : 0 }}>
            <button
              onClick={handleCopyLink}
              className="btn"
              disabled={isProfileIncomplete || penPalsAssigned}
              style={{
                backgroundColor: copyStatus === 'copied' ? '#28a745' : 'white',
                color: copyStatus === 'copied' ? 'white' : '#555',
                border: copyStatus === 'copied' ? '1px solid #28a745' : '1px solid #ddd',
                fontSize: '13px',
                opacity: (isProfileIncomplete || penPalsAssigned) ? 0.6 : 1,
                cursor: (isProfileIncomplete || penPalsAssigned) ? 'not-allowed' : 'pointer'
              }}
            >
              {copyStatus === 'copied' ? '✓ Copied!' : 'Copy Student Link'}
            </button>

            <Link
              href={(isProfileIncomplete || penPalsAssigned) ? '#' : `/register-student?token=${schoolData.dashboardToken}`}
              className="btn"
              onClick={(e) => { if (isProfileIncomplete || penPalsAssigned) e.preventDefault(); }}
              style={{
                fontSize: '13px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: (isProfileIncomplete || penPalsAssigned) ? 0.6 : 1,
                cursor: (isProfileIncomplete || penPalsAssigned) ? 'not-allowed' : 'pointer',
                pointerEvents: (isProfileIncomplete || penPalsAssigned) ? 'none' : 'auto'
              }}
              title={penPalsAssigned ? 'Cannot add students after pen pals are assigned' : 'Add new student'}
            >
              Add New Student
            </Link>
          </div>

          {/* Step 2 content */}
          {!isReady ? (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: readyCheckboxDisabled ? 'not-allowed' : 'pointer', opacity: readyCheckboxDisabled ? 0.6 : 1 }}>
              <input
                type="checkbox"
                checked={false}
                disabled={readyCheckboxDisabled}
                onChange={handleReadyClick}
                title={readyCheckboxTitle}
              />
              <span className="text-data-value">
                {isRequestingMatching ? 'Marking ready…' : 'All students are in'}
              </span>
            </label>
          ) : !penPalsAssigned ? (
            <p className="text-meta-info" style={{ margin: 0, marginBottom: needsMultipleSelection ? '0.75rem' : 0 }}>
              {needsMultipleSelection
                ? (hasAnyMultipleSelected
                    ? `Select additional students to have more than 1 pen pal.`
                    : `Select students to have more than 1 pen pal.`)
                : liveRequirement
                ? `Waiting for ${liveRequirement.matchedSchoolName}'s class to finish registering their students.`
                : 'Waiting to be matched with a partner school.'}
            </p>
          ) : null}

          {isReady && !penPalsAssigned && needsMultipleSelection && liveRequirement && (
            <button
              className="btn"
              style={{ fontSize: '13px' }}
              onClick={() => onPenpalPreferenceCheckNeeded && onPenpalPreferenceCheckNeeded(liveRequirement.required, liveRequirement.current, liveRequirement.matchedSchoolName)}
            >
              Select Students
            </button>
          )}

          {/* Step 3 content */}
          {penPalsAssigned && (
            <div style={{ marginTop: '1.5rem' }}>
              <Link
                href={`/teacher/pen-pal-list?schoolId=${schoolData.id}`}
                className="btn"
                style={{ fontSize: '13px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
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
