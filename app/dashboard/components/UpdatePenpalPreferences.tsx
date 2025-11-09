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

  // Separate students by their original preference
  const studentsWithMultiple = students.filter(s => s.penpalPreference === 'MULTIPLE');
  const studentsWithOne = students.filter(s => s.penpalPreference === 'ONE');

  // Initialize with already-set students
  useEffect(() => {
    const initialSelected = new Set(studentsWithMultiple.map(s => s.id));
    setSelectedStudents(initialSelected);
  }, []);

  const handleToggleStudent = (studentId: string, isInTopSection: boolean) => {
    // Check if this student was originally set to MULTIPLE (locked)
    const isLocked = studentsWithMultiple.some(s => s.id === studentId);
    
    if (isLocked) {
      return; // Can't toggle locked students
    }

    setSelectedStudents(prev => {
      const newSet = new Set(prev);
      if (isInTopSection) {
        // Clicking in top section - remove from selection (move to bottom)
        newSet.delete(studentId);
      } else {
        // Clicking in bottom section - add to selection (move to top)
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const selectedCount = selectedStudents.size;
  const canProceed = selectedCount >= requiredCount;

  // Separate students for display
  const studentsInTopSection = students.filter(s => selectedStudents.has(s.id));
  const studentsInBottomSection = students.filter(s => !selectedStudents.has(s.id));

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
            To make sure everyone at {matchedSchoolName} gets at least one pen pal, please select <strong>{requiredCount}</strong> of your students to have more than one. <strong>{selectedCount} of {requiredCount} required.</strong>
          </p>
        </div>

        {/* Top section - Students with MULTIPLE (fixed, non-scrollable, 3-column grid) */}
        {studentsInTopSection.length > 0 && (
          <div style={{ 
            padding: '0 2rem',
            borderBottom: studentsInBottomSection.length > 0 ? '2px solid #dee2e6' : 'none'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              paddingBottom: studentsInBottomSection.length > 0 ? '1rem' : '0'
            }}>
              {studentsInTopSection
                .sort((a, b) => {
                  // Sort: locked students first, then newly added
                  const aLocked = studentsWithMultiple.some(s => s.id === a.id);
                  const bLocked = studentsWithMultiple.some(s => s.id === b.id);
                  if (aLocked && !bLocked) return -1;
                  if (!aLocked && bLocked) return 1;
                  return 0;
                })
                .map(student => {
                  const isLocked = studentsWithMultiple.some(s => s.id === student.id);
                  
                  return (
                    <div
                      key={student.id}
                      onClick={() => handleToggleStudent(student.id, true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.3rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '6px',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        backgroundColor: '#f8f9fa',
                        opacity: 0.7,
                        transition: 'all 0.2s'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={true}
                        disabled={isLocked}
                        readOnly
                        style={{
                          marginRight: '0.3rem',
                          width: '12px',
                          height: '12px',
                          cursor: isLocked ? 'not-allowed' : 'pointer',
                          flexShrink: 0
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          color: '#333', 
                          fontSize: '0.8rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {student.firstName} {student.lastInitial}.
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#6c757d' }}>
                          Grade {student.grade}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Bottom section - Students with ONE (scrollable) */}
        {studentsInBottomSection.length > 0 && (
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 2rem',
            minHeight: 0
          }}>
            <div style={{
              paddingTop: studentsInTopSection.length > 0 ? '1rem' : '0'
            }}>
              <h4 style={{
                fontSize: '0.9rem',
                fontWeight: '500',
                color: '#495057',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Select Students
              </h4>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                paddingBottom: '1rem'
              }}>
                {studentsInBottomSection.map(student => {
                  return (
                    <div
                      key={student.id}
                      onClick={() => handleToggleStudent(student.id, false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.5rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        backgroundColor: 'white',
                        transition: 'all 0.2s'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={false}
                        readOnly
                        style={{
                          marginRight: '0.75rem',
                          width: '16px',
                          height: '16px',
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
          </div>
        )}

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
