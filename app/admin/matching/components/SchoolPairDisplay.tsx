// app/admin/matching/components/SchoolPairDisplay.tsx
"use client";
import { School } from '../types';

interface SchoolPair {
  school1: School;
  school2: School;
  hasStudentPairings: boolean;
  bothSchoolsReady: boolean;
}

interface SchoolPairDisplayProps {
  pair: SchoolPair;
  showAssignButton?: boolean;
  onAssignPenPals: (school1Id: string, school2Id: string) => void;
}

export default function SchoolPairDisplay({ 
  pair, 
  showAssignButton = false, 
  onAssignPenPals 
}: SchoolPairDisplayProps) {
  
  // Helper function to generate dashboard URL
  const getDashboardUrl = (schoolId: string) => {
    const adminDashboardPath = `/admin/school-dashboard?schoolId=${schoolId}`;
    if (typeof window !== 'undefined') {
      const currentOrigin = window.location.origin;
      return `${currentOrigin}${adminDashboardPath}`;
    }
    return adminDashboardPath;
  };

  const openDashboard = (schoolId: string) => {
    const url = getDashboardUrl(schoolId);
    window.open(url, '_blank');
  };

  const copyDashboardUrl = async (schoolId: string) => {
    const url = getDashboardUrl(schoolId);
    try {
      await navigator.clipboard.writeText(url);
      // You could add a temporary state for copy feedback if needed
    } catch (err) {
      console.error('Failed to copy URL:', err);
      prompt('Copy this URL:', url);
    }
  };

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e0e6ed',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '1rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: showAssignButton ? '1fr 1fr 220px' : '1fr 1fr',
        gap: '1.5rem',
        alignItems: 'stretch'
      }}>
        {/* School 1 */}
        <div style={{
          padding: '1rem',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1a365d' }}>
              {pair.school1.schoolName}
            </h4>
            <div style={{ fontSize: '0.9rem', color: '#4a5568', marginBottom: '0.5rem' }}>
              <strong>{pair.school1.teacherName}</strong>
              <a 
                href={`mailto:${pair.school1.teacherEmail}`}
                style={{ marginLeft: '0.5rem', textDecoration: 'none', opacity: 0.7 }}
                title={pair.school1.teacherEmail}
              >
                ✉️
              </a>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#718096' }}>
              <strong>{pair.school1.region}</strong> | {pair.school1.studentCounts?.ready || 0} students | Starts {pair.school1.startMonth}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#a0aec0', marginTop: '0.25rem' }}>
              Status: <strong>{pair.school1.status}</strong>
            </div>
          </div>
          
          {/* Dashboard Links for School 1 */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            marginTop: '0.75rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid #e2e8f0'
          }}>
            <button
              onClick={() => openDashboard(pair.school1.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#6b7280',
                fontSize: '0.7rem',
                fontWeight: '600',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                padding: '0.35rem 0',
                textDecoration: 'underline',
                textUnderlineOffset: '2px',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
              title="Open school dashboard in new tab"
            >
              OPEN DASHBOARD
            </button>

            <button
              onClick={() => copyDashboardUrl(pair.school1.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#6b7280',
                fontSize: '0.7rem',
                fontWeight: '600',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                padding: '0.35rem 0',
                textDecoration: 'underline',
                textUnderlineOffset: '2px',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
              title="Copy school dashboard URL to clipboard"
            >
              COPY URL
            </button>
          </div>
        </div>

        {/* School 2 */}
        <div style={{
          padding: '1rem',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1a365d' }}>
              {pair.school2.schoolName}
            </h4>
            <div style={{ fontSize: '0.9rem', color: '#4a5568', marginBottom: '0.5rem' }}>
              <strong>{pair.school2.teacherName}</strong>
              <a 
                href={`mailto:${pair.school2.teacherEmail}`}
                style={{ marginLeft: '0.5rem', textDecoration: 'none', opacity: 0.7 }}
                title={pair.school2.teacherEmail}
              >
                ✉️
              </a>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#718096' }}>
              <strong>{pair.school2.region}</strong> | {pair.school2.studentCounts?.ready || 0} students | Starts {pair.school2.startMonth}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#a0aec0', marginTop: '0.25rem' }}>
              Status: <strong>{pair.school2.status}</strong>
            </div>
          </div>
          
          {/* Dashboard Links for School 2 */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            marginTop: '0.75rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid #e2e8f0'
          }}>
            <button
              onClick={() => openDashboard(pair.school2.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#6b7280',
                fontSize: '0.7rem',
                fontWeight: '600',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                padding: '0.35rem 0',
                textDecoration: 'underline',
                textUnderlineOffset: '2px',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
              title="Open school dashboard in new tab"
            >
              OPEN DASHBOARD
            </button>

            <button
              onClick={() => copyDashboardUrl(pair.school2.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#6b7280',
                fontSize: '0.7rem',
                fontWeight: '600',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                padding: '0.35rem 0',
                textDecoration: 'underline',
                textUnderlineOffset: '2px',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
              title="Copy school dashboard URL to clipboard"
            >
              COPY URL
            </button>
          </div>
        </div>

        {/* Assign Button Column (if needed) */}
        {showAssignButton && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <button
              onClick={() => onAssignPenPals(pair.school1.id, pair.school2.id)}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '0.75rem 1rem',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                width: '100%',
                textAlign: 'center'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            >
              Assign Pen Pals
            </button>
          </div>
        )}

        {/* Pen Pal List Buttons (for completed pairs) */}
        {pair.hasStudentPairings && !showAssignButton && (
          <div style={{ 
            gridColumn: '1 / 3',
            display: 'flex', 
            gap: '0.5rem',
            justifyContent: 'center',
            marginTop: '1rem'
          }}>
            <button
              onClick={() => window.open(`/admin/pen-pal-list?schoolId=${pair.school1.id}`, '_blank')}
              style={{
                color: '#2563eb',
                backgroundColor: 'white',
                border: '1px solid #2563eb',
                borderRadius: '4px',
                padding: '0.75rem',
                fontSize: '0.85rem',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <div style={{ fontWeight: '600' }}>{pair.school1.schoolName}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>View Pen Pal List</div>
            </button>
            
            <button
              onClick={() => window.open(`/admin/pen-pal-list?schoolId=${pair.school2.id}`, '_blank')}
              style={{
                color: '#2563eb',
                backgroundColor: 'white',
                border: '1px solid #2563eb',
                borderRadius: '4px',
                padding: '0.75rem',
                fontSize: '0.85rem',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <div style={{ fontWeight: '600' }}>{pair.school2.schoolName}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>View Pen Pal List</div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
