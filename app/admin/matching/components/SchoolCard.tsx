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

  const [copyButtonText, setCopyButtonText] = useState('Copy URL');
  const [emailCopyText, setEmailCopyText] = useState('✉');

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

  const renderOutlineIcon = (type: 'pin' | 'lock', size = 18) => {
    if (type === 'pin') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <ellipse cx="12" cy="8" rx="3" ry="1.5"/>
          <path d="M9 8v1c0 1.5 1.5 2 3 2s3-0.5 3-2V8"/>
          <line x1="12" y1="11" x2="12" y2="20"/>
          <circle cx="12" cy="8" r="2" fill="none"/>
        </svg>
      );
    } else {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      );
    }
  };

  return (
    <div 
      style={{ 
        background: 'white',
        border: isPinned ? '2px solid #333' : '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '16px',
        boxShadow: isPinned 
          ? '0 4px 16px rgba(0,0,0,0.1)' 
          : '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'all 0.15s ease',
        display: 'grid',
        gridTemplateColumns: '400px 180px 110px',
        gap: '16px',
        alignItems: 'start',
        position: 'relative',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontWeight: '300'
      }}
    >
      {/* Pin/Match Icon - Back to absolute positioning */}
      {showActions && (onPin || onMatch) && (
        <div style={{ 
          position: 'absolute', 
          top: '16px', 
          right: '16px',
          zIndex: 10
        }}>
          {showMatchIcon ? (
            <button
              onClick={onMatch}
              style={{
                background: 'white',
                border: '1px solid #666',
                borderRadius: '4px',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                color: '#333',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
                e.currentTarget.style.borderColor = '#333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#666';
              }}
              title="Link with pinned school"
            >
              {renderOutlineIcon('lock', 16)}
            </button>
          ) : (
            <button
              onClick={onPin}
              style={{
                background: isPinned ? '#333' : 'white',
                border: '1px solid #666',
                borderRadius: '4px',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                color: isPinned ? 'white' : '#333',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isPinned) {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                  e.currentTarget.style.borderColor = '#333';
                }
              }}
              onMouseLeave={(e) => {
                if (!isPinned) {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#666';
                }
              }}
              title={isPinned ? "Unpin school" : "Pin school"}>
              {renderOutlineIcon('pin', 16)}
            </button>
          )}
        </div>
      )}

      {/* School Information */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px'
      }}>
        {/* School Name */}
        <h3 style={{ 
          margin: '0', 
          color: '#111', 
          fontSize: '24px',
          fontWeight: '300',
          lineHeight: '1.2',
          letterSpacing: '-0.5px'
        }}>
          {school.schoolName}
        </h3>

        {/* Teacher Info */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          color: '#555',
          fontSize: '15px',
          fontWeight: '400'
        }}>
          <span>{teacherName}</span>
          <button
            onClick={copyEmailAddress}
            style={{ 
              background: 'white',
              border: '1px solid #ccc',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '12px',
              color: '#666',
              transition: 'all 0.15s ease',
              padding: '4px 6px',
              fontWeight: '300'
            }}
            title={`Copy email: ${school.teacherEmail}`}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f8f8';
              e.currentTarget.style.borderColor = '#999';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#ccc';
            }}
          >
            {emailCopyText}
          </button>
        </div>

        {/* Grades */}
        <div style={{ 
          color: '#666', 
          fontSize: '14px',
          fontWeight: '300'
        }}>
          Grades {school.gradeLevel}
        </div>

        {/* Special Considerations */}
        {school.specialConsiderations && (
          <div style={{ 
            color: '#777', 
            fontSize: '13px',
            fontStyle: 'italic',
            fontWeight: '300',
            paddingLeft: '12px',
            borderLeft: '2px solid #eee',
            lineHeight: '1.4'
          }}>
            {school.specialConsiderations}
          </div>
        )}
      </div>

      {/* Data Grid */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '16px 20px',
        fontSize: '14px',
        fontWeight: '300'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ color: '#999', fontSize: '12px', fontWeight: '400' }}>Region</span>
          <span style={{ color: '#333', fontWeight: '400' }}>{school.region.toUpperCase()}</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ color: '#999', fontSize: '12px', fontWeight: '400' }}>Start Date</span>
          <span style={{ color: '#333', fontWeight: '400' }}>{school.startMonth}</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ color: '#999', fontSize: '12px', fontWeight: '400' }}>Status</span>
          <span style={{ color: '#333', fontWeight: '400' }}>{school.status}</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ color: '#999', fontSize: '12px', fontWeight: '400' }}>Expected</span>
          <span style={{ color: '#333', fontWeight: '400' }}>{school.studentCounts?.expected || 0}</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ color: '#999', fontSize: '12px', fontWeight: '400' }}>Registered</span>
          <span style={{ color: '#333', fontWeight: '400' }}>{school.studentCounts?.registered || 0}</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ color: '#999', fontSize: '12px', fontWeight: '400' }}>Ready</span>
          <span style={{ color: '#333', fontWeight: '400' }}>{school.studentCounts?.ready || 0}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '8px',
        alignSelf: 'center'
      }}>
        <button
          onClick={openDashboard}
          style={{
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            color: '#555',
            fontSize: '12px',
            fontWeight: '400',
            letterSpacing: '0.5px',
            cursor: 'pointer',
            padding: '8px 12px',
            textAlign: 'center',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f8f8f8';
            e.currentTarget.style.borderColor = '#999';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.borderColor = '#ccc';
          }}
          title="Open school dashboard in new tab"
        >
          Open Dashboard
        </button>

        <button
          onClick={copyDashboardUrl}
          style={{
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            color: '#555',
            fontSize: '12px',
            fontWeight: '400',
            letterSpacing: '0.5px',
            cursor: 'pointer',
            padding: '8px 12px',
            textAlign: 'center',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f8f8f8';
            e.currentTarget.style.borderColor = '#999';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.borderColor = '#ccc';
          }}
          title="Copy school dashboard URL to clipboard"
        >
          {copyButtonText}
        </button>
      </div>

      {/* Matched School Display */}
      {school.matchedWithSchoolId && school.matchedSchool && (
        <div style={{ 
          gridColumn: '1 / -1',
          padding: '16px', 
          background: '#fafafa', 
          borderRadius: '6px',
          marginTop: '16px',
          borderLeft: '3px solid #ddd',
          fontWeight: '300'
        }}>
          <div style={{ color: '#333', fontSize: '14px', fontWeight: '400' }}>
            Matched with {school.matchedSchool.schoolName}
          </div>
          <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
            {school.matchedSchool.teacherName} • {school.matchedSchool.region}
          </div>
        </div>
      )}

      {/* Legacy CORRESPONDING Display */}
      {school.status === 'CORRESPONDING' && school.matchedSchool && (
        <div style={{ 
          gridColumn: '1 / -1',
          padding: '16px', 
          background: '#fafafa', 
          borderRadius: '6px',
          marginTop: '16px',
          borderLeft: '3px solid #ddd',
          fontWeight: '300'
        }}>
          <div style={{ fontSize: '13px', color: '#666' }}>
            Corresponding with {school.matchedSchool.schoolName} ({school.matchedSchool.region})
          </div>
        </div>
      )}
    </div>
  );
}
