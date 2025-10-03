// app/admin/matching/components/SchoolCard.tsx
"use client";

import { useState } from 'react';
import { School } from '../types';

interface SchoolCardProps {
  school: School;
  isPinned?: boolean;
  showMatchIcon?: boolean;
  showActions?: boolean;
  onPin?: () => void;
  onMatch?: () => void;
  onUpdate?: () => void;
}

export default function SchoolCard({ 
  school, 
  isPinned = false, 
  showMatchIcon = false, 
  showActions = true,
  onPin, 
  onMatch,
  onUpdate
}: SchoolCardProps) {
  const [copyButtonText, setCopyButtonText] = useState('Copy URL');
  const [emailCopyText, setEmailCopyText] = useState('✉');
  const [showUnmatchModal, setShowUnmatchModal] = useState(false);
  const [isUnmatching, setIsUnmatching] = useState(false);

  // Check if this school is part of a group
  const isGrouped = !!(school.schoolGroupId && school.schoolGroup);

  const getDashboardUrl = () => {
    const adminDashboardPath = `/admin/school-dashboard?schoolId=${school.id}`;
    if (typeof window !== 'undefined') {
      const currentOrigin = window.location.origin;
      return `${currentOrigin}${adminDashboardPath}`;
    }
    return adminDashboardPath;
  };

  const openDashboard = () => {
    if (isGrouped) {
      // TODO: Open group dashboard view (side-by-side schools)
      // For now, do nothing
      return;
    }
    const url = getDashboardUrl();
    window.open(url, '_blank');
  };

  const copyDashboardUrl = async () => {
    if (isGrouped) {
      // Disabled for grouped schools (no single URL)
      return;
    }
    const url = getDashboardUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopyButtonText('Copied');
      setTimeout(() => setCopyButtonText('Copy URL'), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      prompt('Copy this URL:', url);
    }
  };

  const copyEmailAddress = async () => {
    try {
      await navigator.clipboard.writeText(school.teacherEmail);
      setEmailCopyText('✓');
      setTimeout(() => setEmailCopyText('✉'), 1500);
    } catch (err) {
      console.error('Failed to copy email:', err);
      prompt('Copy this email:', school.teacherEmail);
    }
  };

  const handleUnmatchClick = () => {
    if (school.studentStats?.hasPenpalAssignments) {
      alert('Cannot unmatch schools after pen pals have been assigned');
      return;
    }
    setShowUnmatchModal(true);
  };

  const handleUnmatchConfirm = async () => {
    setIsUnmatching(true);

    try {
      const response = await fetch(`/api/admin/unmatch-schools?t=${Date.now()}&r=${Math.random()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolId: school.id })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to unmatch schools');
      }

      setShowUnmatchModal(false);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error unmatching schools:', error);
      alert(error instanceof Error ? error.message : 'Failed to unmatch schools');
    } finally {
      setIsUnmatching(false);
    }
  };

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
    <>
      <div className={`card-school grid-school-card ${isPinned ? 'card-school-pinned' : ''}`}>
        
        {/* Column 1: School Information */}
        <div className="school-info-column">
          {isGrouped && school.schoolGroup ? (
            // GROUPED SCHOOL LAYOUT
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <h3 className="text-school-name" style={{ margin: 0 }}>
                  {school.schoolGroup.name}
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
                  school.schoolGroup.schools.forEach(s => {
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

              {school.schoolGroup.schools.map((groupSchool) => (
                <div key={groupSchool.id} style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '13px', color: '#333', lineHeight: '1.4' }}>
                    • {groupSchool.schoolName} ({groupSchool.teacherName}) - {groupSchool.studentCount} students
                  </div>
                  {groupSchool.specialConsiderations && (
                    <div style={{
                      fontSize: '12px',
                      fontStyle: 'italic',
                      color: '#6c757d',
                      marginLeft: '12px',
                      marginTop: '2px'
                    }}>
                      {groupSchool.specialConsiderations}
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            // INDIVIDUAL SCHOOL LAYOUT
            <>
              <h3 className="text-school-name">
                {school.schoolName}
              </h3>
              
              <div className="teacher-info">
                <span>{school.teacherName}</span>
                <button
                  onClick={copyEmailAddress}
                  className="btn-icon btn-icon-email"
                  title={`Copy email: ${school.teacherEmail}`}
                >
                  {emailCopyText}
                </button>
              </div>
              
              <div className="text-meta-info">
                Grades {school.gradeLevel}
              </div>

              {school.specialConsiderations && (
                <div className="special-considerations">
                  {school.specialConsiderations}
                </div>
              )}
            </>
          )}
        </div>

        {/* Column 2: Empty spacer */}
        <div></div>

        {/* Column 3: Data Grid */}
        <div className="grid-data-2x2">
          <div className="data-cell" style={{ gridColumn: '1', gridRow: '1' }}>
            <span className="text-data-label">Region</span>
            <span className="text-data-value-caps">{school.region}</span>
          </div>
          
          <div className="data-cell" style={{ gridColumn: '3', gridRow: '1' }}>
            <span className="text-data-label">Start Date</span>
            <span className="text-data-value-caps">{school.startMonth}</span>
          </div>
          
          <div className="data-cell" style={{ gridColumn: '4', gridRow: '1' }}>
            <span className="text-data-label">Status</span>
            <span className="text-data-value">{school.status}</span>
          </div>
          
          <div className="data-cell" style={{ gridColumn: '1', gridRow: '2' }}>
            <span className="text-data-label">Expected</span>
            <span className="text-data-value">{school.studentCounts?.expected || 0}</span>
          </div>
          
          <div className="data-cell" style={{ gridColumn: '3', gridRow: '2' }}>
            <span className="text-data-label">Registered</span>
            <span className="text-data-value">{school.studentCounts?.registered || 0}</span>
          </div>
        </div>

        {/* Column 4: Spacer (takes remaining space) */}
        <div></div>

        {/* Column 5: Action Buttons */}
        <div className="action-buttons-column">
          <button
            onClick={openDashboard}
            className="btn-school-action"
            title={isGrouped ? "Group dashboard (coming soon)" : "Open school dashboard in new tab"}
            disabled={isGrouped}
            style={isGrouped ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            Open Dashboard
          </button>

          <button
            onClick={copyDashboardUrl}
            className="btn-school-action"
            title={isGrouped ? "Not available for groups" : "Copy school dashboard URL to clipboard"}
            disabled={isGrouped}
            style={isGrouped ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            {copyButtonText}
          </button>
        </div>

        {/* Column 6: Pin Icon */}
        {showActions && (onPin || onMatch) && (
          <div className="flex items-center">
            {showMatchIcon ? (
              <button
                onClick={onMatch}
                className="btn-icon-link"
                title="Link with pinned school"
              >
                {renderIcon('lock')}
              </button>
            ) : (
              <button
                onClick={onPin}
                className={`btn-icon-pin ${isPinned ? 'btn-icon-pin-active' : ''}`}
                title={isPinned ? "Unpin school" : "Pin school"}
              >
                {renderIcon('pin')}
              </button>
            )}
          </div>
        )}

        {/* Matched School Display - spans full width */}
        {school.matchedWithSchoolId && school.matchedSchool && (
          <div className="matched-school-display">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handleUnmatchClick}
                className="btn-icon-link"
                title="Click to unmatch these schools"
                disabled={school.studentStats?.hasPenpalAssignments}
                style={{ 
                  opacity: school.studentStats?.hasPenpalAssignments ? 0.3 : 1,
                  cursor: school.studentStats?.hasPenpalAssignments ? 'not-allowed' : 'pointer'
                }}
              >
                {renderIcon('lock')}
              </button>
              <div>
                <div className="text-normal text-data-value">
                  Matched with {school.matchedSchool.schoolName}
                </div>
                <div className="text-teacher-name" style={{ marginTop: '4px' }}>
                  {school.matchedSchool.teacherName} • {school.matchedSchool.region}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Unmatch Confirmation Modal */}
      {showUnmatchModal && (
        <div className="modal-overlay" onClick={() => !isUnmatching && setShowUnmatchModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-school-name" style={{ marginBottom: '16px' }}>
              Unmatch Schools?
            </h2>
            <p className="text-normal" style={{ marginBottom: '20px' }}>
              Are you sure you want to unmatch <strong>{school.schoolName}</strong> from{' '}
              <strong>{school.matchedSchool?.schoolName}</strong>?
            </p>
            <p className="text-meta-info" style={{ marginBottom: '24px' }}>
              Both schools will remain in their current status ({school.status}) but will no longer be matched together.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowUnmatchModal(false)}
                className="btn btn-secondary"
                disabled={isUnmatching}
              >
                Cancel
              </button>
              <button
                onClick={handleUnmatchConfirm}
                className="btn btn-primary"
                disabled={isUnmatching}
              >
                {isUnmatching ? 'Unmatching...' : 'Yes, Unmatch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
