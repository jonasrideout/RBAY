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
  expandedReadyStudents: Set<string>;
  readyForMatching: boolean;
  onToggleRemovalMode: () => void;
  onRemoveStudent: (studentId: string) => void;
  onToggleExpansion: (studentId: string) => void;
  readOnly?: boolean; // Added readOnly prop
}

export default function ReadyStudents({
  studentsWithInterests,
  readyStudentsRemovalMode,
  expandedReadyStudents,
  readyForMatching,
  onToggleRemovalMode,
  onRemoveStudent,
  onToggleExpansion,
  readOnly = false // Added readOnly with default false
}: ReadyStudentsProps) {
  // Only show if there are ready students
  if (studentsWithInterests.length === 0) {
    return null;
  }

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3>Ready Students ({studentsWithInterests.length})</h3>
        {/* Conditionally hide Remove Student button when readOnly */}
        {!readOnly && (
          <button
            className="btn"
            onClick={onToggleRemovalMode}
            style={{ 
              fontSize: '0.9rem',
              backgroundColor: readyStudentsRemovalMode ? 'transparent' : '#6c757d',
              color: readyStudentsRemovalMode ? '#6c757d' : 'white',
              border: readyStudentsRemovalMode ? '1px solid #6c757d' : 'none'
            }}
            disabled={readyForMatching}
            title={readyForMatching ? "Cannot remove students after matching requested" : undefined}
          >
            {readyStudentsRemovalMode ? 'Finished' : 'Remove Student'}
          </button>
        )}
      </div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '0.75rem'
      }}>
        {studentsWithInterests.map(student => (
          <StudentCard
            key={student.id}
            student={student}
            type="ready"
            isExpanded={expandedReadyStudents.has(student.id)}
            showRemoveButton={readyStudentsRemovalMode}
            onExpandClick={() => onToggleExpansion(student.id)}
            onRemoveClick={() => onRemoveStudent(student.id)}
            readOnly={readOnly} // Pass readOnly to StudentCard if it supports it
          />
        ))}
      </div>
    </div>
  );
}
