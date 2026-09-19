// /app/dashboard/components/RosterActions.tsx
"use client";
import { useState } from 'react';
import Link from 'next/link';

interface RosterActionsProps {
  expectedClassSize: number;
  registeredCount: number;
  dashboardToken: string;
  isProfileIncomplete?: boolean;
  penPalsAssigned?: boolean;
  rosterLocked?: boolean;
  readOnly?: boolean;
}

// Sits directly above the student roster - Copy Student Link and Add New
// Student used to live inside the timeline card, but that put them further
// from the thing they actually act on (the roster) and cluttered the
// timeline itself. Moved here so the action buttons and the list they
// affect read as one visual unit.
export default function RosterActions({
  expectedClassSize,
  registeredCount,
  dashboardToken,
  isProfileIncomplete = false,
  penPalsAssigned = false,
  rosterLocked = false,
  readOnly = false
}: RosterActionsProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const generateStudentLink = () => {
    if (typeof window !== 'undefined' && dashboardToken) {
      return `${window.location.origin}/register-student?token=${dashboardToken}`;
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

  const disabled = isProfileIncomplete || penPalsAssigned || rosterLocked;
  const COLOR_INDIGO = '#3B3F8C';
  const COLOR_DUSTY_BLUE = '#5B87A6';

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, color: COLOR_INDIGO, margin: 0 }}>
        Students ({expectedClassSize} expected, {registeredCount} registered)
      </p>

      {!readOnly && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleCopyLink}
            className="btn"
            disabled={disabled}
            style={{
              backgroundColor: copyStatus === 'copied' ? COLOR_INDIGO : 'white',
              color: copyStatus === 'copied' ? 'white' : COLOR_DUSTY_BLUE,
              border: copyStatus === 'copied' ? `1px solid ${COLOR_INDIGO}` : `1px solid ${COLOR_DUSTY_BLUE}`,
              borderRadius: '10px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              opacity: disabled ? 0.6 : 1,
              cursor: disabled ? 'not-allowed' : 'pointer'
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
            href={disabled ? '#' : `/register-student?token=${dashboardToken}`}
            className="btn"
            onClick={(e) => { if (disabled) e.preventDefault(); }}
            style={{
              fontSize: '13px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              borderRadius: '10px',
              color: COLOR_DUSTY_BLUE,
              border: `1px solid ${COLOR_DUSTY_BLUE}`,
              opacity: disabled ? 0.6 : 1,
              cursor: disabled ? 'not-allowed' : 'pointer',
              pointerEvents: disabled ? 'none' : 'auto'
            }}
            title={penPalsAssigned ? 'Cannot add students after pen pals are assigned' : rosterLocked ? 'Toggle "All students are in" off to add a student' : 'Add new student'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add New Student
          </Link>
        </div>
      )}
    </div>
  );
}
