// /app/dashboard/components/ReadyStudents.tsx
"use client";

import { useState } from 'react';
import StudentCard from './StudentCard';

interface Student {
  id: string;
  firstName: string;
  lastInitial: string;
  grade: string;
  teacherName?: string;
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
  editTempTeacherName: string;
  editTempInterests: string[];
  editTempOtherInterests: string;
  hasMultipleClasses: boolean;
  teacherNames: string[];
  onToggleRemovalMode: () => void;
  onToggleEditMode: () => void;
  onRemoveStudent: (studentId: string) => void;
  onEditStudent: (studentId: string) => void;
  onSaveEditStudent: () => void;
  onCancelEditStudent: () => void;
  onEditFirstNameChange: (value: string) => void;
  onEditLastInitialChange: (value: string) => void;
  onEditGradeChange: (value: string) => void;
  onEditTeacherNameChange: (value: string) => void;
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
  editTempTeacherName,
  editTempInterests,
  editTempOtherInterests,
  hasMultipleClasses,
  teacherNames,
  onToggleRemovalMode,
  onToggleEditMode,
  onRemoveStudent,
  onEditStudent,
  onSaveEditStudent,
  onCancelEditStudent,
  onEditFirstNameChange,
  onEditLastInitialChange,
  onEditGradeChange,
  onEditTeacherNameChange,
  onEditInterestChange,
  onEditOtherInterestsChange,
  onToggleExpansion,
  readOnly = false
}: ReadyStudentsProps) {
  // Default to 'teacher' sort if school has multiple classes, otherwise 'alphabetical'
  const [sortBy, setSortBy] = useState<'alphabetical' | 'teacher'>(
    hasMultipleClasses ? 'teacher' : 'alphabetical'
  );

  // Only show if there are ready students
  if (studentsWithInterests.length === 0) {
    return null;
  }

  // Sort students based on selected sort option
  const sortedStudents = [...studentsWithInterests].sort((a, b) => {
    if (sortBy === 'teacher') {
      // Sort by teacher name first, then alphabetically by student name
      const teacherA = a.teacherName || '';
      const teacherB = b.teacherName || '';
      if (teacherA !== teacherB) {
        return teacherA.localeCompare(teacherB);
      }
      return `${a.firstName} ${a.lastInitial}`.localeCompare(`${b.firstName} ${b.lastInitial}`);
    } else {
      // Sort alphabetically by student name
      return `${a.firstName} ${a.lastInitial}`.localeCompare(`${b.firstName} ${b.lastInitial}`);
    }
  });

  // Group students by teacher if sorting by teacher
  const groupedStudents: { teacher: string; students: Student[] }[] = [];
  if (sortBy === 'teacher' && hasMultipleClasses) {
    const teacherGroups = new Map<string, Student[]>();
    sortedStudents.forEach(student => {
      const teacher = student.teacherName || 'No Teacher Assigned';
      if (!teacherGroups.has(teacher)) {
        teacherGroups.set(teacher, []);
      }
      teacherGroups.get(teacher)!.push(student);
    });
    teacherGroups.forEach((students, teacher) => {
      groupedStudents.push({ teacher, students });
    });
  }

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h3 style={{
            margin: '0',
            fontSize: '1.2rem',
            fontWeight: '400',
            color: '#333'
          }}>
            Ready Students ({studentsWithInterests.length})
          </h3>
          
          {/* Sort dropdown - only show if multiple classes */}
          {hasMultipleClasses && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'alphabetical' | 'teacher')}
              className="form-select"
              style={{ 
                width: 'auto',
                fontSize: '0.9rem',
                padding: '0.25rem 0.5rem'
              }}
            >
              <option value="alphabetical">Alphabetical</option>
              <option value="teacher">By Teacher</option>
            </select>
          )}
        </div>
        
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

      {/* Render grouped by teacher or flat list */}
      {sortBy === 'teacher' && hasMultipleClasses ? (
        // Grouped by teacher
        <div>
          {groupedStudents.map(({ teacher, students }) => (
            <div key={teacher} style={{ marginBottom: '2rem' }}>
              <h4 style={{ 
                fontSize: '1rem',
                fontWeight: '500',
                color: '#2c5aa0',
                marginBottom: '0.75rem',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid #e0e0e0'
              }}>
                {teacher}
              </h4>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, minmax(200px, 1fr))',
                gap: '12px'
              }}>
                {students.map(student => (
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
                    tempTeacherName={editTempTeacherName}
                    tempInterests={editTempInterests}
                    tempOtherInterests={editTempOtherInterests}
                    hasMultipleClasses={hasMultipleClasses}
                    teacherNames={teacherNames}
                    onExpandClick={() => onToggleExpansion(student.id)}
                    onRemoveClick={() => onRemoveStudent(student.id)}
                    onEditClick={() => onEditStudent(student.id)}
                    onSaveEdit={onSaveEditStudent}
                    onCancelEdit={onCancelEditStudent}
                    onFirstNameChange={onEditFirstNameChange}
                    onLastInitialChange={onEditLastInitialChange}
                    onGradeChange={onEditGradeChange}
                    onTeacherNameChange={onEditTeacherNameChange}
                    onInterestChange={onEditInterestChange}
                    onOtherInterestsChange={onEditOtherInterestsChange}
                    readOnly={readOnly}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Flat alphabetical list
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          {sortedStudents.map(student => (
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
              tempTeacherName={editTempTeacherName}
              tempInterests={editTempInterests}
              tempOtherInterests={editTempOtherInterests}
              hasMultipleClasses={hasMultipleClasses}
              teacherNames={teacherNames}
              onExpandClick={() => onToggleExpansion(student.id)}
              onRemoveClick={() => onRemoveStudent(student.id)}
              onEditClick={() => onEditStudent(student.id)}
              onSaveEdit={onSaveEditStudent}
              onCancelEdit={onCancelEditStudent}
              onFirstNameChange={onEditFirstNameChange}
              onLastInitialChange={onEditLastInitialChange}
              onGradeChange={onEditGradeChange}
              onTeacherNameChange={onEditTeacherNameChange}
              onInterestChange={onEditInterestChange}
              onOtherInterestsChange={onEditOtherInterestsChange}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}
    </div>
  );
}
