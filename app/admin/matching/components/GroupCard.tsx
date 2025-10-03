import { SchoolGroup } from '../types';

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
  const renderIcon = (type: 'pin' | 'lock') => {
    if (type === 'pin') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 9a3 3 0 1 1 6 0c0 2-3 3-3 3s-3-1-3-3"/>
          <path d="M12 12v9"/>
        </svg>
      );
    } else {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      );
    }
  };

  return (
    <div className={`card-school grid-school-card ${isPinned ? 'card-school-pinned' : ''}`}>
      
      {/* Column 1: Group Information */}
      <div className="school-info-column">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <h3 className="text-school-name" style={{ margin: 0 }}>
            {group.name}
          </h3>
          <span style={{
            display: 'inline-block',
            padding: '3px 8px',
            backgroundColor: '#e8f5e9',
            border: '1px solid #81c784',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '500',
            color: '#2e7d32',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            GROUP
          </span>
        </div>

        <div className="text-meta-info" style={{ marginBottom: '10px' }}>
          Grades {(() => {
            // Extract unique grade levels from all schools in group
            const grades = new Set<string>();
            group.schools.forEach(s => {
              // Parse grade strings like "3,4,5" or "3" or "4, 5"
              const schoolGrades = s.gradeLevel?.split(',').map(g => g.trim()) || [];
              schoolGrades.forEach(g => grades.add(g));
            });
            return Array.from(grades).sort((a, b) => {
              // Sort numerically if possible
              const numA = parseInt(a);
              const numB = parseInt(b);
              if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
              return a.localeCompare(b);
            }).join(', ');
          })()}
        </div>

        {group.schools.map((school) => (
          <div key={school.id} style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '11px', color: '#333', lineHeight: '1.4' }}>
              • {school.schoolName} ({school.teacherName}) - {school.studentCount} students
            </div>
            {school.specialConsiderations && (
              <div style={{
                fontSize: '12px',
                fontStyle: 'italic',
                color: '#6c757d',
                marginLeft: '12px',
                marginTop: '2px'
              }}>
                {school.specialConsiderations}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Column 2: Empty spacer */}
      <div></div>

      {/* Column 3: Data Grid */}
      <div className="grid-data-2x2">
        <div className="data-cell" style={{ gridColumn: '1', gridRow: '1' }}>
          <span className="text-data-label">Total</span>
          <span className="text-data-value">{group.studentCounts.total}</span>
        </div>
        
        <div className="data-cell" style={{ gridColumn: '3', gridRow: '1' }}>
          <span className="text-data-label">Ready</span>
          <span className="text-data-value">{group.studentCounts.ready}</span>
        </div>
        
        <div className="data-cell" style={{ gridColumn: '1', gridRow: '2' }}>
          <span className="text-data-label">Pen Pal Pref</span>
          <span className="text-data-value">
            {group.penPalPreferences.studentsWithMultiple}/{group.penPalPreferences.requiredMultiple}
            {group.penPalPreferences.meetsRequirement ? ' ✓' : ''}
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

      {/* Column 4: Spacer (takes remaining space) */}
      <div></div>

      {/* Column 5: Action Buttons */}
      <div className="action-buttons-column">
        <button
          className="btn-school-action"
          title="Group dashboard (coming soon)"
          disabled={true}
          style={{ opacity: 0.5, cursor: 'not-allowed' }}
        >
          Open Dashboard
        </button>

        <button
          className="btn-school-action"
          title="Not available for groups"
          disabled={true}
          style={{ opacity: 0.5, cursor: 'not-allowed' }}
        >
          Copy URL
        </button>
      </div>

      {/* Column 6: Pin Icon */}
      {showActions && (onPin || onMatch) && (
        <div className="flex items-center">
          {showMatchIcon ? (
            <button
              onClick={onMatch}
              className="btn-icon-link"
              title="Link with pinned group"
            >
              {renderIcon('lock')}
            </button>
          ) : (
            <button
              onClick={onPin}
              className={`btn-icon-pin ${isPinned ? 'btn-icon-pin-active' : ''}`}
              title={isPinned ? "Unpin group" : "Pin group"}
            >
              {renderIcon('pin')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
