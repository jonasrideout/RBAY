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
  const teacherName = `${school.teacherFirstName} ${school.teacherLastName}`;
  const isReady = school.status === 'READY';

  // Get the current domain dynamically
  const getDashboardUrl = () => {
    if (typeof window !== 'undefined') {
      const currentOrigin = window.location.origin;
      return `${currentOrigin}/dashboard?teacher=${encodeURIComponent(school.teacherEmail)}`;
    }
    return `/dashboard?teacher=${encodeURIComponent(school.teacherEmail)}`;
  };

  const [buttonText, setButtonText] = useState('Teacher Dashboard');

  const copyDashboardUrl = async () => {
    const url = getDashboardUrl();
    try {
      await navigator.clipboard.writeText(url);
      setButtonText('Copied!');
      setTimeout(() => setButtonText('Teacher Dashboard'), 2000);
    } catch (err) {
      // Fallback for older browsers
      console.error('Failed to copy URL:', err);
      prompt('Copy this URL:', url);
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

  const getRegionDisplay = (region: string) => {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100%',
        textAlign: 'center'
      }}>
        <div style={{ 
          fontSize: '0.9rem', 
          fontWeight: '600', 
          color: '#4a5568',
          letterSpacing: '0.5px'
        }}>
          {region.toUpperCase()}
        </div>
      </div>
    );
  };

  return (
    <div 
      style={{ 
        background: '#fff',
        border: isPinned ? '2px solid #2196f3' : '1px solid #e0e6ed',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: isPinned ? '0 4px 12px rgba(33, 150, 243, 0.2)' : '0 4px 6px rgba(0,0,0,0.07)',
        transition: 'all 0.2s ease',
        display: 'grid',
        gridTemplateColumns: '50% 25% 20%',
        gap: '1.5rem',
        alignItems: 'stretch',
        minHeight: '120px',
        position: 'relative'
      }}
    >
      {/* Pin/Match Icon - Top Right */}
      {isReady && (onPin || onMatch) && (
        <div style={{ 
          position: 'absolute', 
          top: '15px', 
          right: '15px',
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
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                color: '#28a745',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
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
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                color: isPinned ? '#2196f3' : '#666',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title={isPinned ? "Unpin school" : "Pin school"}
            >
              {renderOutlineIcon('pin', 18)}
            </button>
          )}
        </div>
      )}

      {/* School Information (50%) */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        paddingTop: '0'
      }}>
        <div>
          <h3 style={{ 
            margin: '0 0 0.5rem 0', 
            color: '#1a365d', 
            fontSize: '1.3rem',
            fontWeight: '600',
            lineHeight: '1.2'
          }}>
            {school.schoolName}
          </h3>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            color: '#4a5568',
            fontSize: '1rem',
            marginBottom: '0.5rem'
          }}>
            <span style={{ fontWeight: '500' }}>{teacherName}</span>
            <a 
              href={`mailto:${school.teacherEmail}`}
              style={{ 
                textDecoration: 'none', 
                fontSize: '1.1rem',
                opacity: 0.7,
                transition: 'opacity 0.2s ease'
              }}
              title={school.teacherEmail}
            >
              ✉️
            </a>
          </div>
          {/* Teacher Dashboard Link */}
          <button
            onClick={copyDashboardUrl}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              fontSize: '0.9rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              opacity: 0.8,
              transition: 'opacity 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
            title="Click to copy teacher dashboard URL"
          >
            {buttonText}
          </button>
        </div>
        <div style={{ 
          color: '#718096', 
          fontSize: '0.95rem',
          marginTop: '0.5rem'
        }}>
          <strong>Grades:</strong> {school.gradeLevel.join(', ')}
        </div>
      </div>

      {/* Class Information (25%) - RIGHT ALIGNED VALUES */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-evenly',
        fontSize: '0.95rem'
      }}>
        <div style={{ 
          color: '#4a5568',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <strong>Start:</strong> 
          <span>{school.startMonth}</span>
        </div>
        <div style={{ 
          color: '#4a5568',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <strong>Expected:</strong> 
          <span>{school.studentCounts.expected}</span>
        </div>
        <div style={{ 
          color: '#4a5568',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <strong>Registered:</strong> 
          <span>{school.studentCounts.registered}</span>
        </div>
        <div style={{ 
          color: '#4a5568',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <strong>Ready:</strong> 
          <span>{school.studentCounts.ready}</span>
        </div>
      </div>

      {/* Region Display (20%) */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '80px'
      }}>
        {getRegionDisplay(school.region)}
      </div>

      {/* Matched School Display */}
      {school.status === 'MATCHED' && school.matchedSchool && (
        <div style={{ 
          gridColumn: '1 / -1',
          padding: '0.75rem', 
          background: 'linear-gradient(135deg, #f0fff4 0%, #e8f5e9 100%)', 
          borderRadius: '8px',
          marginTop: '1rem',
          borderLeft: '4px solid #38a169'
        }}>
          <strong style={{ color: '#2f855a' }}>
            🤝 Matched with: {school.matchedSchool.schoolName}
          </strong>
          <div style={{ fontSize: '0.9rem', color: '#4a5568', marginTop: '0.25rem' }}>
            {school.matchedSchool.teacherFirstName} {school.matchedSchool.teacherLastName} - {school.matchedSchool.region}
          </div>
        </div>
      )}

      {/* Corresponding Display */}
      {school.status === 'CORRESPONDING' && (
        <div style={{ 
          gridColumn: '1 / -1',
          padding: '0.75rem', 
          background: 'linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%)', 
          borderRadius: '8px',
          marginTop: '1rem',
          borderLeft: '4px solid #4299e1'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ color: '#2d3748' }}><strong>📤 Letters Sent:</strong> {school.lettersSent}</div>
            <div style={{ color: '#2d3748' }}><strong>📥 Letters Received:</strong> {school.lettersReceived}</div>
          </div>
          {school.matchedSchool && (
            <div style={{ fontSize: '0.9rem', color: '#4a5568' }}>
              <strong>✉️ Partner:</strong> {school.matchedSchool.schoolName} ({school.matchedSchool.region})
            </div>
          )}
        </div>
      )}
    </div>
  );
}
