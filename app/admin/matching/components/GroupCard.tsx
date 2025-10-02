import { SchoolGroup } from '../types';
import Link from 'next/link';

interface GroupCardProps {
  group: SchoolGroup;
  showActions?: boolean;
  isPinned?: boolean;
  showMatchIcon?: boolean;
  onPin?: () => void;
  onMatch?: () => void;
}

export default function GroupCard({
  group,
  showActions = false,
  isPinned = false,
  showMatchIcon = false,
  onPin,
  onMatch
}: GroupCardProps) {
  const totalStudents = group.studentCounts.total;
  const readyStudents = group.studentCounts.ready;
  const schoolCount = group.schools.length;

  return (
    <div 
      className="card"
      style={{
        background: isPinned ? '#e3f2fd' : '#fff',
        border: isPinned ? '2px solid #1976d2' : '1px solid #e0e6ed',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1rem'
      }}
    >
      <div className="grid-school-card">
        {/* Column 1: Group Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 className="text-school-name" style={{ margin: 0, fontSize: '18px' }}>
              {group.name}
            </h3>
            <div style={{
              display: 'inline-block',
              padding: '4px 8px',
              backgroundColor: '#e8f5e9',
              border: '1px solid #4caf50',
              borderRadius: '4px',
              fontSize: '11px',
              color: '#2e7d32',
              fontWeight: 400
            }}>
              GROUP
            </div>
          </div>
          
          <div className="text-meta-info">
            {schoolCount} school{schoolCount !== 1 ? 's' : ''} in group
          </div>
          
          {/* List schools in group */}
          <div style={{ marginTop: '0.5rem' }}>
            {group.schools.map((school, idx) => (
              <div key={school.id} className="text-meta-info" style={{ fontSize: '11px', marginLeft: '0.5rem' }}>
                • {school.schoolName} ({school.teacherName}) - {school.studentCount} students
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Spacer */}
        <div />

        {/* Column 3: Combined Data Grid */}
        <div className="grid-data-2x2">
          <div className="data-cell" style={{ gridColumn: '1', gridRow: '1' }}>
            <span className="text-data-label">Total Students</span>
            <span className="text-data-value">{totalStudents}</span>
          </div>
          
          <div className="data-cell" style={{ gridColumn: '3', gridRow: '1' }}>
            <span className="text-data-label">Ready</span>
            <span className="text-data-value">{readyStudents}</span>
          </div>
          
          <div className="data-cell" style={{ gridColumn: '1', gridRow: '2' }}>
            <span className="text-data-label">Pen Pal Pref</span>
            <span className="text-data-value">
              {group.penPalPreferences.studentsWithMultiple}/{group.penPalPreferences.requiredMultiple}
              {group.penPalPreferences.meetsRequirement ? ' ✓' : ' ✗'}
            </span>
          </div>
          
          {group.penPalAssignments.hasAssignments && (
            <div className="data-cell" style={{ gridColumn: '3', gridRow: '2' }}>
              <span className="text-data-label">Assigned</span>
              <span className="text-data-value">
                {group.penPalAssignments.assignmentPercentage}%
              </span>
            </div>
          )}
        </div>

        {/* Column 4: Flex spacer */}
        <div />

        {/* Column 5: Status/Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
          {group.matchedWithGroupId && (
            <div style={{
              padding: '6px 12px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#856404',
              fontWeight: 400
            }}>
              MATCHED
            </div>
          )}
          
          {group.isReadyForMatching && !group.matchedWithGroupId && (
            <div style={{
              padding: '6px 12px',
              backgroundColor: '#d4edda',
              border: '1px solid #28a745',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#155724',
              fontWeight: 400
            }}>
              READY TO MATCH
            </div>
          )}
        </div>

        {/* Column 6: Action Buttons */}
        {showActions && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {onPin && (
              <button
                onClick={onPin}
                className="btn btn-secondary"
                style={{
                  fontSize: '13px',
                  padding: '0.5rem 1rem',
                  backgroundColor: isPinned ? '#1976d2' : '#6c757d',
                  color: 'white',
                  minWidth: '100px'
                }}
              >
                {isPinned ? 'Unpin' : 'Pin'}
              </button>
            )}
            
            {showMatchIcon && onMatch && (
              <button
                onClick={onMatch}
                className="btn btn-primary"
                style={{
                  fontSize: '13px',
                  padding: '0.5rem 1rem',
                  minWidth: '100px'
                }}
              >
                Match →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
