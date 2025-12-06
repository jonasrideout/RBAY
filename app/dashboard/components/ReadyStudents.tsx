// /app/dashboard/components/ReadyStudents.tsx
"use client";

import StudentCard from './StudentCard';

interface Student {
  id: string;
  firstName: string;
  lastInitial: string;
  grade: string;
  interests: string[];
  otherInterests: string;
  hasInterests: boolean;
  status: 'ready' | 'needs-info' | 'matched';
}

interface ReadyStudentsProps {
  studentsWithInterests: Student[];
  readyStudentsRemovalMode: boolean;
  readyStudentsEditMode: boolean;
  expandedReadyStudents: Set<string>;
  penPalsAssigned: boolean;
  editingStudentId: string | null;
  editTempFirstName: string;
  editTempLastInitial: string;
  editTempGrade: string;
  editTempInterests: string[];
  editTempOtherInterests: string;
  onToggleRemovalMode: () => void;
  onToggleEditMode: () => void;
  onRemoveStudent: (studentId: string) => void;
  onEditStudent: (studentId: string) => void;
  onSaveEditStudent: () => void;
  onCancelEditStudent: () => void;
  onEditFirstNameChange: (value: string) => void;
  onEditLastInitialChange: (value: string) => void;
  onEditGradeChange: (value: string) => void;
  onEditInterestChange: (interest: string, checked: boolean) => void;
  onEditOtherInterestsChange: (value: string) => void;
  onToggleExpansion: (studentId: string) => void;
  readOnly?: boolean;
}

export default function ReadyStudents({
  studentsWithInterests,
  readyStudentsRemovalMode,
  readyStudentsEditMode,
  expandedReadyStudents,
  penPalsAssigned,
  editingStudentId,
  editTempFirstName,
  editTempLastInitial,
  editTempGrade,
  editTempInterests,
  editTempOtherInterests,
  onToggleRemovalMode,
  onToggleEditMode,
  onRemoveStudent,
  onEditStudent,
  onSaveEditStudent,
  onCancelEditStudent,
  onEditFirstNameChange,
  onEditLastInitialChange,
  onEditGradeChange,
  onEditInterestChange,
  onEditOtherInterestsChange,
  onToggleExpansion,
  readOnly = false
}: ReadyStudentsProps) {
  // Only show if there are ready students
  if (studentsWithInterests.length === 0) {
    return null;
  }

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem' 
      }}>
        <h3 style={{
          margin: '0',
          fontSize: '1.2rem',
          fontWeight: '400',
          color: '#333'
        }}>
          Ready Students ({studentsWithInterests.length})
        </h3>
        
        {/* Button group for Edit and Remove */}
        {!readOnly && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={readyStudentsEditMode ? "btn btn-secondary" : "btn"}
              onClick={onToggleEditMode}
              disabled={penPalsAssigned}
              title={penPalsAssigned ? "Cannot edit students after pen pals are assigned" : undefined}
              style={{
                fontSize: '14px',
                opacity: penPalsAssigned ? 0.6 : 1
              }}
            >
              {readyStudentsEditMode ? 'Finished' : 'Edit Student'}
            </button>
            <button
              className={readyStudentsRemovalMode ? "btn btn-secondary" : "btn"}
              onClick={onToggleRemovalMode}
              disabled={penPalsAssigned}
              title={penPalsAssigned ? "Cannot remove students after pen pals are assigned" : undefined}
              style={{
                fontSize: '14px',
                opacity: penPalsAssigned ? 0.6 : 1
              }}
            >
              {readyStudentsRemovalMode ? 'Finished' : 'Remove Student'}
            </button>
          </div>
        )}
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, minmax(200px, 1fr))',
        gap: '12px'
      }}>
        {studentsWithInterests.map(student => (
          <StudentCard
            key={student.id}
            student={student}
            type="ready"
            isExpanded={expandedReadyStudents.has(student.id)}
            isEditing={student.id === editingStudentId}
            showRemoveButton={readyStudentsRemovalMode}
            showEditButton={readyStudentsEditMode}
            penPalsAssigned={penPalsAssigned}
            tempFirstName={editTempFirstName}
            tempLastInitial={editTempLastInitial}
            tempGrade={editTempGrade}
            tempInterests={editTempInterests}
            tempOtherInterests={editTempOtherInterests}
            onExpandClick={() => onToggleExpansion(student.id)}
            onRemoveClick={() => onRemoveStudent(student.id)}
            onEditClick={() => onEditStudent(student.id)}
            onSaveEdit={onSaveEditStudent}
            onCancelEdit={onCancelEditStudent}
            onFirstNameChange={onEditFirstNameChange}
            onLastInitialChange={onEditLastInitialChange}
            onGradeChange={onEditGradeChange}
            onInterestChange={onEditInterestChange}
            onOtherInterestsChange={onEditOtherInterestsChange}
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  );
}
