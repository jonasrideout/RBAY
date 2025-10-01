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
}

export default function SchoolCard({ 
  school, 
  isPinned = false, 
  showMatchIcon = false, 
  showActions = true,
  onPin, 
  onMatch 
}: SchoolCardProps) {
  const [copyButtonText, setCopyButtonText] = useState('Copy URL');
  const [emailCopyText, setEmailCopyText] = useState('✉');

  const getDashboardUrl = () => {
    const adminDashboardPath = `/admin/school-dashboard?schoolId=${school.id}`;
    if (typeof window !== 'undefined') {
      const currentOrigin = window.location.origin;
      return `${currentOrigin}${adminDashboardPath}`;
    }
    return adminDashboardPath;
  };

  const openDashboard = () => {
    const url = getDashboardUrl();
    window.open(url, '_blank');
  };

  const copyDashboardUrl = async () => {
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
      
      {/* Column 1: School Information */}
      <div className="school-info-column">
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
          title="Open school dashboard in new tab"
        >
          Open Dashboard
        </button>

        <button
          onClick={copyDashboardUrl}
          className="btn-school-action"
          title="Copy school dashboard URL to clipboard"
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
          <div className="text-normal text-data-value">
            Matched with {school.matchedSchool.schoolName}
          </div>
          <div className="text-teacher-name" style={{ marginTop: '4px' }}>
            {school.matchedSchool.teacherName} • {school.matchedSchool.region}
          </div>
        </div>
      )}
    </div>
  );
}
