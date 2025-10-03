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

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
  };

  // Aggregate unique grades
  const aggregatedGrades = (() => {
    const grades = new Set<string>();
    group.schools.forEach(s => {
      const schoolGrades = s.gradeLevel?.split(',').map(g => g.trim()) || [];
      schoolGrades.forEach(g => grades.add(g));
    });
    return Array.from(grades).sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    }).join(',');
  })();

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

        {/* Teachers list */}
        {group.schools.map((school, index) => (
          <div key={school.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: index < group.schools.length - 1 ? '4px' : '10px' }}>
            <span className="text-teacher-name">{school.schoolName} | {school.teacherName}</span>
            <button
              onClick={() => handleCopyEmail(school.teacherName)} 
              className="btn-icon-copy"
              title="Copy email address"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                <rect x="8" y="8" width="14" height="14" rx="2" ry="2"/>
              </svg>
            </button>
          </div>
        ))}

        <div className="text-meta-info">
          Grades {aggregatedGrades}
        </div>
      </div>

      {/* Column 2: Empty spacer */}
      <div></div>

      {/* Column 3: Single Row Data Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div className="data-cell">
            <span className="text-data-label">Region</span>
            <span className="text-data-value-caps">{group.schools[0]?.region || 'N/A'}</span>
          </div>
          
          <div className="data-cell">
            <span className="text-data-label">Start</span>
            <span className="text-data-value-caps">{group.schools[0]?.startMonth || 'N/A'}</span>
          </div>
          
          <div className="data-cell">
            <span className="text-data-label">Ready</span>
            <span className="text-data-value">{group.studentCounts.ready}</span>
          </div>
        </div>

        <div className="text-meta-info" style={{ marginTop: '4px' }}>
          Status <span style={{ textTransform: 'uppercase', fontWeight: '400', color: '#495057' }}>
            {group.schools.every(s => s.status === 'READY') ? 'READY' : 'COLLECTING'}
          </span>
        </div>
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

      {/* Special Considerations - Below card */}
      {group.schools.some(s => s.specialConsiderations) && (
        <div style={{ gridColumn: '1 / -1', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e9ecef' }}>
          {group.schools.filter(s => s.specialConsiderations).map(school => (
            <div key={school.id} style={{ fontSize: '13px', fontStyle: 'italic', color: '#6c757d', marginBottom: '6px' }}>
              <strong>{school.schoolName}:</strong> {school.specialConsiderations}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
