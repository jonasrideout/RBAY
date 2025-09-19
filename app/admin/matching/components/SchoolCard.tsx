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
    <div style={{
      background: 'white',
      border: isPinned ? '2px solid #333' : '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '16px',
      boxShadow: isPinned 
        ? '0 4px 16px rgba(0,0,0,0.1)' 
        : '0 2px 8px rgba(0,0,0,0.06)',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: '300',
      display: 'grid',
      gridTemplateColumns: '300px 100px 200px 1fr auto auto',
      gap: '20px',
      alignItems: 'start'
    }}>
      
      {/* Column 1: School Information */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <h3 style={{
          margin: '0',
          color: '#111',
          fontSize: '22px',
          fontWeight: '300',
          lineHeight: '1.3'
        }}>
          {school.schoolName}
        </h3>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#555',
          fontSize: '14px',
          fontWeight: '300'
        }}>
          <span>{school.teacherName}</span>
          <button
            onClick={copyEmailAddress}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#666',
              padding: '0',
              fontWeight: '300'
            }}
            title={`Copy email: ${school.teacherEmail}`}
          >
            {emailCopyText}
          </button>
        </div>
        
        <div style={{
          color: '#666',
          fontSize: '13px',
          fontWeight: '300'
        }}>
          Grades {school.gradeLevel}
        </div>

        {school.specialConsiderations && (
          <div style={{
            color: '#777',
            fontSize: '12px',
            fontStyle: 'italic',
            fontWeight: '300',
            paddingLeft: '12px',
            borderLeft: '2px solid #eee',
            lineHeight: '1.4',
            marginTop: '4px'
          }}>
            {school.specialConsiderations}
          </div>
        )}
      </div>

      {/* Column 2: Empty spacer */}
      <div></div>

      {/* Column 3: Data Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '12px 16px',
        fontSize: '14px',
        fontWeight: '300'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ color: '#999', fontSize: '12px', fontWeight: '300' }}>Region</span>
          <span style={{ color: '#333', fontWeight: '300' }}>{school.region.toUpperCase()}</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ color: '#999', fontSize: '12px', fontWeight: '400' }}>Start Date</span>
          <span style={{ color: '#333', fontWeight: '400' }}>{school.startMonth.toUpperCase()}</span>
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

      {/* Column 4: Spacer (takes remaining space) */}
      <div></div>

      {/* Column 5: Action Buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '8px',
        minWidth: '110px'
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
            cursor: 'pointer',
            padding: '8px 12px',
            textAlign: 'center'
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
            cursor: 'pointer',
            padding: '8px 12px',
            textAlign: 'center'
          }}
          title="Copy school dashboard URL to clipboard"
        >
          {copyButtonText}
        </button>
      </div>

      {/* Column 6: Pin Icon */}
      {showActions && (onPin || onMatch) && (
        <div style={{
          display: 'flex',
          alignItems: 'center'
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
                color: '#333'
              }}
              title="Link with pinned school"
            >
              {renderIcon('lock')}
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
                color: isPinned ? 'white' : '#333'
              }}
              title={isPinned ? "Unpin school" : "Pin school"}
            >
              {renderIcon('pin')}
            </button>
          )}
        </div>
      )}

      {/* Matched School Display - spans full width */}
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
    </div>
  );
}
