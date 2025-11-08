// /app/dashboard/components/UpdatePenpalPreferences.tsx
"use client";
import { useState, useEffect } from 'react';

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

export default function UpdatePenpalPreferences({
  students,
  requiredCount,
  currentCount,
  matchedSchoolName,
  onComplete,
  onCancel
}: UpdatePenpalPreferencesProps) {
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [isUpdating, setIsUpdating] = useState(false);

  // Pre-select students who already have MULTIPLE preference (locked)
  const studentsWithMultiple = students.filter(s => s.penpalPreference === 'MULTIPLE');
  const studentsWithOne = students.filter(s => s.penpalPreference === 'ONE');

  // Initialize with already-set students
  useEffect(() => {
    const initialSelected = new Set(studentsWithMultiple.map(s => s.id));
    setSelectedStudents(initialSelected);
  }, []);

  const handleToggleStudent = (studentId: string) => {
    // Don't allow toggling students who already have MULTIPLE
    if (studentsWithMultiple.some(s => s.id === studentId)) {
      return;
    }

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
  const canProceed = selectedCount === requiredCount;
  const additionalNeeded = Math.max(0, requiredCount - selectedCount);

  const handleDone = async () => {
    if (!canProceed) return;

    setIsUpdating(true);

    try {
      // Get list of students that need to be updated (excluding those already set to MULTIPLE)
      const studentsToUpdate = Array.from(selectedStudents).filter(
        studentId => !studentsWithMultiple.some(s => s.id === studentId)
      );

      // Update each student's preference
      const updatePromises = studentsToUpdate.map(studentId =>
        fetch('/api/students', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentId,
            penpalPreference: 'MULTIPLE'
          })
        })
      );

      const results = await Promise.all(updatePromises);
      
      // Check if all updates succeeded
      const allSucceeded = results.every(r => r.ok);
      
      if (!allSucceeded) {
        throw new Error('Some student updates failed');
      }

      // All updates successful - call completion handler
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
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        maxWidth: '700px',
        width: '90%',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Header */}
        <div style={{ padding: '2rem', paddingBottom: '1rem' }}>
          <h3 style={{ 
            fontSize: '1.2rem',
            fontWeight: '400',
            color: '#333',
            marginBottom: '1rem'
          }}>
            Update Pen Pal Preferences
          </h3>
          
          <p style={{ 
            color: '#495057',
            marginBottom: '1.5rem',
            lineHeight: '1.6'
          }}>
            To make sure everyone at {matchedSchoolName} gets at least one pen pal, please select <strong>{requiredCount}</strong> of your students to have more than one.
          </p>

          {/* Progress indicator */}
          <div style={{
            padding: '0.75rem',
            backgroundColor: canProceed ? '#d4edda' : '#f8f9fa',
            border: `1px solid ${canProceed ? '#c3e6cb' : '#dee2e6'}`,
            borderRadius: '6px',
            textAlign: 'center'
          }}>
            <span style={{ fontWeight: '500' }}>
              {selectedCount} of {requiredCount} required selected
              {canProceed && ' ✓'}
            </span>
          </div>
        </div>

        {/* Student list - scrollable */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 2rem',
          minHeight: 0
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            paddingBottom: '1rem'
          }}>
            {students.map(student => {
              const isLocked = studentsWithMultiple.some(s => s.id === student.id);
              const isSelected = selectedStudents.has(student.id);
              
              return (
                <div
                  key={student.id}
                  onClick={() => handleToggleStudent(student.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    backgroundColor: isSelected ? '#f8f9fa' : 'white',
                    opacity: isLocked ? 0.7 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={isLocked}
                    readOnly
                    style={{
                      marginRight: '1rem',
                      width: '18px',
                      height: '18px',
                      cursor: isLocked ? 'not-allowed' : 'pointer'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#333' }}>
                      {student.firstName} {student.lastInitial}.
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                      Grade {student.grade}
                      {isLocked && ' • Already set to multiple pen pals'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action buttons - sticky at bottom */}
        <div style={{ 
          padding: '1.5rem 2rem',
          borderTop: '1px solid #e9ecef',
          display: 'flex', 
          gap: '8px', 
          justifyContent: 'flex-end',
          backgroundColor: '#f8f9fa',
          borderRadius: '0 0 8px 8px'
        }}>
          <button 
            onClick={onCancel}
            className="btn"
            disabled={isUpdating}
            style={{
              padding: '0.75rem 1.5rem'
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
              backgroundColor: canProceed && !isUpdating ? '#28a745' : 'white',
              color: canProceed && !isUpdating ? 'white' : '#555',
              borderColor: canProceed && !isUpdating ? '#28a745' : '#ddd',
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
