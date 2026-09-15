// /app/dashboard/components/DashboardHeader.tsx
"use client";
import { useState } from 'react';
import Link from 'next/link';

interface SchoolData {
  schoolName: string;
  teacherName: string;
  communicationPlatforms?: any;
  startMonth?: string;
  programStartMonth?: string;
}

interface PastClassSummary {
  id: string;
  schoolName: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  expectedClassSize: number;
  gradeLevel: string;
}

interface DashboardHeaderProps {
  schoolData: SchoolData;
  readOnly?: boolean;
  adminBackButton?: boolean;
  // Past-classes switcher: the teacher's other School rows (any year, any
  // active state), and whether the dashboard is currently showing one of
  // those past classes in read-only mode rather than their live one.
  pastClasses?: PastClassSummary[];
  isViewingPastClass?: boolean;
}

export default function DashboardHeader({
  schoolData,
  adminBackButton = false,
  pastClasses = [],
  isViewingPastClass = false
}: DashboardHeaderProps) {
  const [showClassSwitcher, setShowClassSwitcher] = useState(false);

  // Format communication platforms for display
  const formatCommunicationPlatforms = () => {
    if (!schoolData.communicationPlatforms || !Array.isArray(schoolData.communicationPlatforms) || schoolData.communicationPlatforms.length === 0) {
      return null;
    }
    return schoolData.communicationPlatforms.join(' | ');
  };

  const communicationPlatformsDisplay = formatCommunicationPlatforms();
  const startMonth = schoolData.startMonth || schoolData.programStartMonth;

  return (
    <div className="card" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 0,
      padding: '0.85rem 1.25rem',
      height: '100%'
    }}>
      <div>
        <p style={{ fontSize: '11px', fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.03em', margin: '0 0 0.35rem' }}>
          Your School
        </p>
        <h1 style={{ fontSize: '16px', fontWeight: 600, color: '#333', margin: '0 0 0.15rem' }}>
          {schoolData.schoolName}
        </h1>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '0.15rem', position: 'relative' }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 300, color: '#666' }}>
            {schoolData.teacherName}
          </p>

          {/* Past Classes switcher - hidden for real admin token views, since
              this is a teacher-facing way to browse their own class history.
              Sits inline with the teacher name rather than its own line, so
              this card doesn't run any taller than it needs to. */}
          {!adminBackButton && (
            <>
              <button
                type="button"
                onClick={() => setShowClassSwitcher(prev => !prev)}
                className="nav-link"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: '13px',
                  color: '#2c5aa0',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {isViewingPastClass ? 'Viewing a past class ▾' : 'Past Classes ▾'}
              </button>

              {showClassSwitcher && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '0.5rem',
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  minWidth: '260px',
                  zIndex: 50,
                  padding: '0.5rem 0'
                }}>
                  {isViewingPastClass && (
                    <a
                      href="/dashboard"
                      className="nav-link"
                      style={{ display: 'block', padding: '0.5rem 1rem', fontSize: '13px', textDecoration: 'none', color: '#333' }}
                    >
                      ← Back to Current Class
                    </a>
                  )}

                  {pastClasses.length === 0 ? (
                    <p style={{ padding: '0.5rem 1rem', fontSize: '13px', color: '#888', margin: 0 }}>
                      No past classes yet
                    </p>
                  ) : (
                    pastClasses.map(pastClass => (
                      <a
                        key={pastClass.id}
                        href={pastClass.isActive ? '/dashboard' : `/dashboard?viewSchoolId=${pastClass.id}`}
                        className="nav-link"
                        style={{
                          display: 'block',
                          padding: '0.5rem 1rem',
                          fontSize: '13px',
                          textDecoration: 'none',
                          color: pastClass.isActive ? '#2c5aa0' : '#333',
                          fontWeight: pastClass.isActive ? 500 : 300
                        }}
                      >
                        {pastClass.schoolName || 'Untitled Class'}
                        {' — '}
                        {new Date(pastClass.createdAt).getFullYear()}
                        {pastClass.isActive ? ' (current)' : ''}
                      </a>
                    ))
                  )}

                  <div style={{ borderTop: '1px solid #eee', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                    <a
                      href="/dashboard/new-class"
                      className="nav-link"
                      style={{ display: 'block', padding: '0.5rem 1rem', fontSize: '13px', textDecoration: 'none', color: '#28a745' }}
                    >
                      + Start This Year&rsquo;s Class
                    </a>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {communicationPlatformsDisplay && (
          <p style={{
            margin: 0,
            fontSize: '13px',
            fontWeight: '300',
            color: '#666'
          }}>
            {communicationPlatformsDisplay}
          </p>
        )}
        {startMonth && startMonth !== 'TBD' && (
          <p style={{ margin: 0, marginTop: '0.15rem', fontSize: '13px', fontWeight: 300, color: '#666' }}>
            Starting: {startMonth}
          </p>
        )}
      </div>

      {adminBackButton && (
        <div>
          <Link href="/admin/matching" className="btn">
            ← Back to Admin Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
