// app/admin/matching/components/SchoolCard.tsx
"use client";

import { useState } from 'react';
import { School } from '../types';

interface SchoolCardProps {
  school: School;
  isPinned?: boolean;
  showMatchIcon?: boolean;
  onPin?: () => void;
  onMatch?: () => void;
}

export default function SchoolCard({ 
  school, 
  isPinned = false, 
  showMatchIcon = false, 
  onPin, 
  onMatch 
}: SchoolCardProps) {
  const teacherName = school.teacherName;
  const isReady = school.status === 'READY';

  // Generate admin dashboard URL
  const getDashboardUrl = () => {
    const adminDashboardPath = `/admin/school-dashboard?schoolId=${school.id}`;
    if (typeof window !== 'undefined') {
      const currentOrigin = window.location.origin;
      return `${currentOrigin}${adminDashboardPath}`;
    }
    return adminDashboardPath;
  };

  const [copyButtonText, setCopyButtonText] = useState('COPY URL');
  const [emailCopyText, setEmailCopyText] = useState('✉️');

  const openDashboard = () => {
    const url = getDashboardUrl();
    window.open(url, '_blank');
  };

  const copyDashboardUrl = async () => {
    const url = getDashboardUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopyButtonText('COPIED!');
      setTimeout(() => setCopyButtonText('COPY URL'), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      prompt('Copy this URL:', url);
    }
  };

  const copyEmailAddress = async () => {
    try {
      await navigator.clipboard.writeText(school.teacherEmail);
      setEmailCopyText('✓');
      setTimeout(() => setEmailCopyText('✉️'), 1500);
    } catch (err) {
      console.error('Failed to copy email:', err);
      prompt('Copy this email:', school.teacherEmail);
    }
  };

  const renderOutlineIcon = (type: 'pin' | 'lock', size = 16) => {
    if (type === 'pin') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <ellipse cx="12" cy="8" rx="3" ry="1.5"/>
          <path d="M9 8v1c0 1.5 1.5 2 3 2s3-0.5 3-2V8"/>
          <line x1="12" y1="11" x2="12" y2="20"/>
          <circle cx="12" cy="8" r="2" fill="none"/>
        </svg>
      );
    } else {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      );
    }
  };

  return (
    <div 
      style={{ 
        background: '#fff',
        border: isPinned ? '2px solid #2196f3' : '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1.25rem',
        marginBottom: '1rem',
        boxShadow: isPinned 
          ? '0 8px 25px rgba(33, 150, 243, 0.15), 0 2px 8px rgba(0,0,0,0.1)' 
          : '0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease',
        display: 'grid',
        gridTemplateColumns: '55% 35% 10%',
        gap: '1.25rem',
        alignItems: 'stretch',
        minHeight: '120px',
        position: 'relative'
      }}
    >
      {/* Pin/Match Icon - Top Right */}
      {isReady && (onPin || onMatch) && (
        <div style={{ 
          position: 'absolute', 
          top: '12px', 
          right: '12px',
          zIndex: 10
        }}>
          {showMatchIcon ? (
            <button
              onClick={onMatch}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                color: '#28a745',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f8f0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Link with pinned school"
            >
              {renderOutlineIcon('lock', 18)}
            </button>
          ) : (
            <button
              onClick={onPin}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                color: isPinned ? '#2196f3' : '#6b7280',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title={isPinned ? "Unpin school" : "Pin school"}
            >
              {renderOutlineIcon('pin', 18)}
            </button>
          )}
        </div>
      )}

      {/* School Information (60%) - NO REGION HERE */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'flex-start',
        gap: '0.5rem'
      }}>
        {/* School Name */}
        <h3 style={{ 
          margin: '0', 
          color: '#1f2937', 
          fontSize: '1.3rem',
          fontWeight: '600',
          lineHeight: '1.3'
        }}>
          {school.schoolName}
        </h3>

        {/* Teacher Name with Email - IMPROVED */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          color: '#4b5563',
          fontSize: '0.95rem'
        }}>
          <span style={{ fontWeight: '500' }}>{teacherName}</span>
          <button
            onClick={copyEmailAddress}
            style={{ 
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'none', 
              fontSize: '1.3rem',
              color: '#1f2937',
              transition: 'all 0.2s ease',
              padding: '2px'
            }}
            title={`Copy email: ${school.teacherEmail}`}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {emailCopyText}
          </button>
        </div>

        {/* Grades */}
        <div style={{ 
          color: '#6b7280', 
          fontSize: '0.9rem'
        }}>
          <span style={{ fontWeight: '500' }}>Grades:</span> {school.gradeLevel}
        </div>

        {/* Special Considerations - Subtle styling */}
        {school.specialConsiderations && (
          <div style={{ 
            color: '#4b5563', 
            fontSize: '0.85rem',
            fontStyle: 'italic',
            paddingLeft: '0.75rem',
            borderLeft: '2px solid #e5e7eb',
            marginTop: '0.25rem'
          }}>
            <span style={{ fontWeight: '500' }}>Special considerations:</span> {school.specialConsiderations}
          </div>
        )}
      </div>

      {/* Data & Actions (20%) - ADDED START MONTH BACK */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'flex-start',
        fontSize: '0.9rem',
        gap: '0.5rem'
      }}>
        {/* Data rows - Start month added back */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.15rem'
        }}>
          <div style={{ 
            color: '#4b5563',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: '1.1rem'
          }}>
            <span style={{ fontWeight: '500' }}>Region:</span> 
            <span>{school.region.toUpperCase()}</span>
          </div>
          <div style={{ 
            color: '#4b5563',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: '1.1rem'
          }}>
            <span style={{ fontWeight: '500' }}>Start:</span> 
            <span>{school.startMonth}</span>
          </div>
          <div style={{ 
            color: '#4b5563',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: '1.1rem'
          }}>
            <span style={{ fontWeight: '500' }}>Expected:</span> 
            <span>{school.studentCounts?.expected || 0}</span>
          </div>
          <div style={{ 
            color: '#4b5563',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: '1.1rem'
          }}>
            <span style={{ fontWeight: '500' }}>Registered:</span> 
            <span>{school.studentCounts?.registered || 0}</span>
          </div>
          <div style={{ 
            color: '#4b5563',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: '1.1rem'
          }}>
            <span style={{ fontWeight: '500' }}>Ready:</span> 
            <span>{school.studentCounts?.ready || 0}</span>
          </div>
        </div>

        {/* Dashboard Links - At bottom of right column */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          marginTop: '0.5rem',
          paddingTop: '0.5rem'
        }}>
          <button
            onClick={openDashboard}
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
            onClick={copyDashboardUrl}
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
            {copyButtonText}
          </button>
        </div>
      </div>

      {/* Empty Column (20%) - For spacing */}
      <div></div>

      {/* Matched School Display */}
      {school.status === 'MATCHED' && school.matchedSchool && (
        <div style={{ 
          gridColumn: '1 / -1',
          padding: '0.75rem', 
          background: 'linear-gradient(135deg, #f0fff4 0%, #e8f5e9 100%)', 
          borderRadius: '8px',
          marginTop: '0.75rem',
          borderLeft: '3px solid #38a169'
        }}>
          <strong style={{ color: '#2f855a', fontSize: '0.9rem' }}>
            Matched with: {school.matchedSchool.schoolName}
          </strong>
          <div style={{ fontSize: '0.85rem', color: '#4b5563', marginTop: '0.25rem' }}>
            {school.matchedSchool.teacherName} - {school.matchedSchool.region}
          </div>
        </div>
      )}

      {/* Corresponding Display */}
      {school.status === 'CORRESPONDING' && school.matchedSchool && (
        <div style={{ 
          gridColumn: '1 / -1',
          padding: '0.75rem', 
          background: 'linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%)', 
          borderRadius: '8px',
          marginTop: '0.75rem',
          borderLeft: '3px solid #4299e1'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#4b5563' }}>
            <strong>✉️ Corresponding with:</strong> {school.matchedSchool.schoolName} ({school.matchedSchool.region})
          </div>
        </div>
      )}
    </div>
  );
}
