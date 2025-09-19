// /app/dashboard/components/MissingInfoStudents.tsx
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

interface MissingInfoStudentsProps {
  studentsNeedingInfo: Student[];
  missingInfoRemovalMode: boolean;
  editingStudent: string | null;
  tempInterests: string[];
  tempOtherInterests: string;
  readyForMatching: boolean;
  onToggleRemovalMode: () => void;
  onEditInterests: (studentId: string) => void;
  onRemoveStudent: (studentId: string) => void;
  onSaveInterests: (studentId: string) => void;
  onCancelEdit: () => void;
  onInterestChange: (interest: string, checked: boolean) => void;
  onOtherInterestsChange: (value: string) => void;
  readOnly?: boolean;
}

export default function MissingInfoStudents({
  studentsNeedingInfo,
  missingInfoRemovalMode,
  editingStudent,
  tempInterests,
  tempOtherInterests,
  readyForMatching,
  onToggleRemovalMode,
  onEditInterests,
  onRemoveStudent,
  onSaveInterests,
  onCancelEdit,
  onInterestChange,
  onOtherInterestsChange,
  readOnly = false
}: MissingInfoStudentsProps) {
  // Only show if there are students needing info
  if (studentsNeedingInfo.length === 0) {
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
          Students Missing Information
        </h3>
        
        {/* Clean button styling */}
        {!readOnly && (
          <button
            className={missingInfoRemovalMode ? "btn btn-secondary" : "btn"}
            onClick={onToggleRemovalMode}
            disabled={readyForMatching}
            title={readyForMatching ? "Cannot remove students after matching requested" : undefined}
            style={{
              fontSize: '14px',
              opacity: readyForMatching ? 0.6 : 1
            }}
          >
            {missingInfoRemovalMode ? 'Finished' : 'Remove Student'}
          </button>
        )}
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px' 
      }}>
        {studentsNeedingInfo.map(student => (
          <StudentCard
            key={student.id}
            student={student}
            type="missing-info"
            isEditing={editingStudent === student.id}
            showRemoveButton={missingInfoRemovalMode}
            readyForMatching={readyForMatching}
            tempInterests={tempInterests}
            tempOtherInterests={tempOtherInterests}
            onEditClick={() => onEditInterests(student.id)}
            onRemoveClick={() => onRemoveStudent(student.id)}
            onSaveInterests={() => onSaveInterests(student.id)}
            onCancelEdit={onCancelEdit}
            onInterestChange={onInterestChange}
            onOtherInterestsChange={onOtherInterestsChange}
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  );
}
