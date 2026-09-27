// /app/dashboard/components/UpdatePenpalPreferences.tsx
"use client";
import { useState } from 'react';

interface Student {
  id: string;
  firstName: string;
  lastInitial: string;
  grade: string;
  penpalPreference: 'ONE' | 'MULTIPLE';
}

interface UpdatePenpalPreferencesProps {
  students: Student[];
  requiredCount: number;
  currentCount: number;
  matchedSchoolName: string;
  onComplete: () => void;
  onCancel: () => void;
}

// Single merged, scrollable list rather than a growing "selected" section up
// top plus a shrinking "pick from" section below - the old two-section
// layout meant the working area kept shrinking every time a teacher checked
// someone new, which became unusable on mobile once a few students were
// selected. Now nothing changes size as selections happen: the list itself
// scrolls, and only the "X of Y required" counter line at the very top
// updates live.
//
// Order is captured once when the modal first opens and never re-sorts
// while it's open, even as a teacher checks/unchecks students - re-sorting
// mid-session would mean rows jumping around under the teacher's cursor
// right as they click. A fresh open (next time this modal is shown) will
// recompute the order from scratch.
//
// All students are now freely toggleable, including ones who opted into
// MULTIPLE themselves during their own registration. A teacher may
// reasonably know better than a student whether that student can handle
// the extra letter-writing load, so nothing here is locked/disabled -
// unchecking a self-opted student will set their preference back to ONE,
// same as any teacher-assigned one.
export default function UpdatePenpalPreferences({
  students,
  requiredCount,
  matchedSchoolName,
  onComplete,
  onCancel
}: UpdatePenpalPreferencesProps) {
  // Fixed at mount: the order every row appears in for this entire session,
  // and the initial selection (whoever already has MULTIPLE).
  const [orderedStudents] = useState<Student[]>(() => [...students]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
    () => new Set(students.filter(s => s.penpalPreference === 'MULTIPLE').map(s => s.id))
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const selectedCount = selectedStudents.size;
  const canProceed = selectedCount >= requiredCount;

  const handleDone = async () => {
    if (!canProceed) return;

    setIsUpdating(true);

    try {
      // Anyone now selected but not already MULTIPLE needs to be set to
      // MULTIPLE; anyone who WAS MULTIPLE but is no longer selected needs
      // to be set back to ONE (a teacher can now override a student's own
      // earlier choice either direction).
      const updates: { studentId: string; penpalPreference: 'ONE' | 'MULTIPLE' }[] = [];

      for (const student of orderedStudents) {
        const isSelected = selectedStudents.has(student.id);
        const wasMultiple = student.penpalPreference === 'MULTIPLE';

        if (isSelected && !wasMultiple) {
          updates.push({ studentId: student.id, penpalPreference: 'MULTIPLE' });
        } else if (!isSelected && wasMultiple) {
          updates.push({ studentId: student.id, penpalPreference: 'ONE' });
        }
      }

      const results = await Promise.all(
        updates.map(update =>
          fetch('/api/students', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(update)
          })
        )
      );

      const allSucceeded = results.every(r => r.ok);
      if (!allSucceeded) {
        throw new Error('Some student updates failed');
      }

      onComplete();

    } catch (error) {
      console.error('Error updating student preferences:', error);
      alert('Error updating student preferences. Please try again.');
      setIsUpdating(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(59, 63, 140, 0.35)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        maxWidth: '700px',
        width: '90%',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 20px rgba(59, 63, 140, 0.2)'
      }}>
        {/* Header - fixed height, never grows regardless of selections */}
        <div style={{ padding: '2rem', paddingBottom: '1rem' }}>
          <h3 style={{ 
            fontFamily: 'var(--font-heading)',
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#3B3F8C',
            marginBottom: '1rem'
          }}>
            Update Pen Pal Preferences
          </h3>
          
          <p style={{ 
            color: '#8A87A0',
            marginBottom: 0,
            lineHeight: '1.6'
          }}>
            To make sure everyone at {matchedSchoolName} gets at least one pen pal, please select <strong>{requiredCount}</strong> of your students to have more than one. <strong>{selectedCount} of {requiredCount} selected.</strong>
          </p>
        </div>

        {/* Single scrollable list - the only part of the modal that grows or
            shrinks is this list's own internal scroll, never the modal
            itself or the header above it. */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 2rem',
          minHeight: 0,
          borderTop: '1px solid #E4E1ED',
          borderBottom: '1px solid #E4E1ED'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            padding: '1rem 0'
          }}>
            {orderedStudents.map(student => {
              const isSelected = selectedStudents.has(student.id);
              return (
                <div
                  key={student.id}
                  onClick={() => handleToggleStudent(student.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.5rem',
                    border: `1px solid ${isSelected ? '#3B3F8C' : '#DAD7E8'}`,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#EDEAF5' : 'white',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    style={{
                      marginRight: '0.75rem',
                      width: '16px',
                      height: '16px',
                      accentColor: '#3B3F8C',
                      cursor: 'pointer'
                    }}
                  />
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#333', fontSize: '0.9rem' }}>
                      {student.firstName} {student.lastInitial}.
                    </span>
                    <span style={{ color: '#6c757d' }}>|</span>
                    <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                      Grade {student.grade}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action buttons - sticky at bottom, fixed height */}
        <div style={{ 
          padding: '1.5rem 2rem',
          display: 'flex', 
          gap: '8px', 
          justifyContent: 'flex-end',
          backgroundColor: '#F5F3FA',
          borderRadius: '0 0 20px 20px'
        }}>
          <button 
            onClick={onCancel}
            className="btn"
            disabled={isUpdating}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '10px'
            }}
          >
            Cancel
          </button>
          <button 
            onClick={handleDone}
            className="btn"
            disabled={!canProceed || isUpdating}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '10px',
              backgroundColor: canProceed && !isUpdating ? '#3B3F8C' : 'white',
              color: canProceed && !isUpdating ? 'white' : '#555',
              borderColor: canProceed && !isUpdating ? '#3B3F8C' : '#ddd',
              cursor: canProceed && !isUpdating ? 'pointer' : 'not-allowed',
              opacity: canProceed && !isUpdating ? 1 : 0.6
            }}
          >
            {isUpdating ? (
              <>
                <span className="loading" style={{ marginRight: '0.5rem' }}></span>
                Updating...
              </>
            ) : (
              'Done'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
