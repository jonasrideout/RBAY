"use client";

import { useState } from 'react';

interface Student {
  id: string;
  firstName: string;
  lastInitial: string;
  grade: string;
  interests: string[];
  otherInterests: string;
  hasInterests: boolean;
  status: 'ready' | 'needs-info' | 'matched';
}

const INTEREST_OPTIONS = [
  { value: 'sports', label: '🏀 Sports & Athletics', icon: '🏀' },
  { value: 'arts', label: '🎨 Arts & Creativity', icon: '🎨' },
  { value: 'reading', label: '📚 Reading & Books', icon: '📚' },
  { value: 'technology', label: '💻 Technology & Gaming', icon: '💻' },
  { value: 'animals', label: '🐕 Animals & Nature', icon: '🐕' },
  { value: 'entertainment', label: '🎬 Entertainment & Media', icon: '🎬' },
  { value: 'social', label: '👥 Social & Family', icon: '👥' },
  { value: 'academic', label: '🧮 Academic Subjects', icon: '🧮' },
  { value: 'hobbies', label: '🎯 Hobbies & Collections', icon: '🎯' },
  { value: 'outdoors', label: '🏕️ Outdoor Activities', icon: '🏕️' },
  { value: 'music', label: '🎵 Music & Performance', icon: '🎵' },
  { value: 'fashion', label: '👗 Fashion & Style', icon: '👗' }
];

interface StudentCardProps {
  student: Student;
  type: 'missing-info' | 'ready';
  isExpanded?: boolean;
  isEditing?: boolean;
  showRemoveButton?: boolean;
  readyForMatching?: boolean;
  tempInterests?: string[];
  tempOtherInterests?: string;
  onEditClick?: () => void;
  onRemoveClick?: () => void;
  onExpandClick?: () => void;
  onSaveInterests?: () => void;
  onCancelEdit?: () => void;
  onInterestChange?: (interest: string, checked: boolean) => void;
  onOtherInterestsChange?: (value: string) => void;
  readOnly?: boolean; // Added readOnly prop
}

export default function StudentCard({
  student,
  type,
  isExpanded = false,
  isEditing = false,
  showRemoveButton = false,
  readyForMatching = false,
  tempInterests = [],
  tempOtherInterests = '',
  onEditClick,
  onRemoveClick,
  onExpandClick,
  onSaveInterests,
  onCancelEdit,
  onInterestChange,
  onOtherInterestsChange,
  readOnly = false // Added readOnly with default false
}: StudentCardProps) {

  const getInterestLabel = (value: string) => {
    const option = INTEREST_OPTIONS.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  // Missing info card in editing mode - show read-only form in admin mode
  if (type === 'missing-info' && isEditing) {
    return (
      <div className="card" style={{ background: '#fff5f5', border: '2px solid #fed7d7' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ color: '#c53030', marginBottom: '0.25rem' }}>{student.firstName} {student.lastInitial}.</h4>
          <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>
            Grade {student.grade} • {readOnly ? 'Viewing interests' : 'Adding interests'}
          </span>
        </div>
        
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '6px', border: '1px solid #fed7d7' }}>
          <h5 style={{ marginBottom: '1rem', color: '#495057' }}>
            {readOnly ? `${student.firstName}'s Interests:` : `Select ${student.firstName}'s Interests:`}
          </h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
            {INTEREST_OPTIONS.map(interest => (
              <label key={interest.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  checked={tempInterests.includes(interest.value)}
                  onChange={(e) => onInterestChange?.(interest.value, e.target.checked)}
                  disabled={readOnly} // Disable checkboxes in read-only mode
                />
                {interest.label}
              </label>
            ))}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Other Interests:</label>
            <textarea 
              className="form-textarea" 
              placeholder={readOnly ? "No other interests listed" : "Any other hobbies or interests..."}
              rows={2}
              value={tempOtherInterests}
              onChange={(e) => onOtherInterestsChange?.(e.target.value)}
              style={{ width: '100%' }}
              disabled={readOnly} // Disable textarea in read-only mode
            />
          </div>
          {/* Hide save/cancel buttons in read-only mode */}
          {!readOnly && (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-secondary"
                onClick={onCancelEdit}
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={onSaveInterests}
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                Save Interests
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Missing info card - compact default state
  if (type === 'missing-info') {
    return (
      <div 
        className="card" 
        style={{ 
          background: '#fff5f5', 
          border: '2px solid #fed7d7', 
          padding: '0.75rem',
          margin: '0'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ color: '#c53030', marginBottom: '0', fontSize: '1rem' }}>{student.firstName} {student.lastInitial}.</h4>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Hide Add Interests button in read-only mode */}
            {!readOnly && (
              <button 
                className="btn btn-primary" 
                onClick={onEditClick}
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                disabled={readyForMatching}
              >
                {readyForMatching ? 'Locked' : 'Add Interests'}
              </button>
            )}
            {/* Hide remove button in read-only mode */}
            {!readOnly && showRemoveButton && (
              <button
                onClick={onRemoveClick}
                style={{
                  background: 'transparent',
                  color: '#dc3545',
                  border: '1px solid #dc3545',
                  borderRadius: '4px',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
                title={`Remove ${student.firstName} ${student.lastInitial}.`}
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Ready student card - expanded view
  if (type === 'ready' && isExpanded) {
    return (
      <div 
        className="card" 
        style={{ background: '#f0f8ff', border: '2px solid #bee5eb', cursor: 'pointer', margin: '0' }}
        onClick={onExpandClick}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h4 style={{ color: '#0c5460', marginBottom: '0.25rem' }}>{student.firstName} {student.lastInitial}.</h4>
            <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Grade {student.grade} • Has interests</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="status-ready">
              ✅ Ready
            </span>
            {/* Hide remove button in read-only mode */}
            {!readOnly && showRemoveButton && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveClick?.();
                }}
                style={{
                  background: 'transparent',
                  color: '#dc3545',
                  border: '1px solid #dc3545',
                  borderRadius: '4px',
                  padding: '0.25rem 0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
                title={`Remove ${student.firstName} ${student.lastInitial}.`}
              >
                🗑️
              </button>
            )}
          </div>
        </div>
        
        <div style={{ marginBottom: '0' }}>
          <strong style={{ color: '#495057' }}>Interests:</strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
            {student.interests.map(interest => (
              <span key={interest} className="tag">{getInterestLabel(interest)}</span>
            ))}
          </div>
          {student.otherInterests && (
            <p style={{ color: '#6c757d', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '0' }}>
              <em>Other:</em> {student.otherInterests}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Ready student card - collapsed view
  if (type === 'ready') {
    return (
      <div 
        className="card" 
        style={{ 
          background: '#f0f8ff', 
          border: '2px solid #bee5eb', 
          cursor: 'pointer',
          padding: '0.75rem',
          margin: '0'
        }}
        onClick={onExpandClick}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ color: '#0c5460', marginBottom: '0', fontSize: '1rem' }}>{student.firstName} {student.lastInitial}.</h4>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="status-ready">
              ✅ Ready
            </span>
            {/* Hide remove button in read-only mode */}
            {!readOnly && showRemoveButton && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveClick?.();
                }}
                style={{
                  background: 'transparent',
                  color: '#dc3545',
                  border: '1px solid #dc3545',
                  borderRadius: '4px',
                  padding: '0.25rem 0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
                title={`Remove ${student.firstName} ${student.lastInitial}.`}
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
