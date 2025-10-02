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
  classSize: number;
  onComplete: () => void;
  onCancel: () => void;
}

export default function UpdatePenpalPreferences({
  students,
  requiredCount,
  currentCount,
  classSize,
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
  const canProceed = selectedCount >= requiredCount;
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
      zIndex: 1000
    }}>
      <div className="card" style={{
        maxWidth: '700px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        margin: '2rem'
      }}>
        <h3 style={{ 
          color: '#333', 
          marginBottom: '1rem', 
          fontSize: '1.3rem',
          fontWeight: '400'
        }}>
          Update Pen Pal Preferences
        </h3>
        
        <p style={{ 
          color: '#6c757d', 
          marginBottom: '1.5rem', 
          lineHeight: '1.6',
          fontSize: '0.95rem'
        }}>
          Because your class is small ({classSize} students), at least <strong>{requiredCount} students</strong> must be set to 'more than one pen pal' to ensure fair matching. Currently <strong>{currentCount}</strong> {currentCount === 1 ? 'student is' : 'students are'} set. Please select {additionalNeeded > 0 ? `at least ${additionalNeeded} more` : 'students below'}.
        </p>

        {/* Progress indicator */}
        <div style={{
          padding: '0.75rem',
          backgroundColor: canProceed ? '#d4edda' : '#fff3cd',
          border: `1px solid ${canProceed ? '#c3e6cb' : '#ffeaa7'}`,
          borderRadius: '6px',
          marginBottom: '1.5rem',
          textAlign: 'center',
          fontWeight: '500',
          fontSize: '0.95rem'
        }}>
          {selectedCount} of {requiredCount} required selected
          {canProceed && ' ✓'}
        </div>

        {/* Student list */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          maxHeight: '300px',
          overflowY: 'auto',
          padding: '0.5rem'
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
                  onChange={() => {}} // Handled by div onClick
                  style={{
                    marginRight: '1rem',
                    width: '18px',
                    height: '18px',
                    cursor: isLocked ? 'not-allowed' : 'pointer'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '400', color: '#333', fontSize: '0.95rem' }}>
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

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button 
            onClick={onCancel}
            className="btn"
            disabled={isUpdating}
            style={{ fontSize: '14px' }}
          >
            Cancel
          </button>
          <button 
            onClick={handleDone}
            className="btn"
            disabled={!canProceed || isUpdating}
            style={{
              backgroundColor: canProceed && !isUpdating ? '#28a745' : 'white',
              color: canProceed && !isUpdating ? 'white' : '#999',
              borderColor: canProceed && !isUpdating ? '#28a745' : '#ddd',
              cursor: canProceed && !isUpdating ? 'pointer' : 'not-allowed',
              opacity: canProceed && !isUpdating ? 1 : 0.6,
              fontSize: '14px'
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
