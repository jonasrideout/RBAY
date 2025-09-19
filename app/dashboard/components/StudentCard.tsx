// /app/dashboard/components/StudentCard.tsx
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
  readOnly?: boolean;
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
  readOnly = false
}: StudentCardProps) {

  const getInterestLabel = (value: string) => {
    const option = INTEREST_OPTIONS.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  // Missing info card in editing mode
  if (type === 'missing-info' && isEditing) {
    return (
      <div className="card">
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ 
            color: '#333', 
            marginBottom: '0.25rem',
            fontWeight: '400',
            fontSize: '1.1rem'
          }}>
            {student.firstName} {student.lastInitial}.
          </h4>
          <span style={{ 
            color: '#777', 
            fontSize: '14px',
            fontWeight: '300'
          }}>
            Grade {student.grade} • {readOnly ? 'Viewing interests' : 'Adding interests'}
          </span>
        </div>
        
        <div style={{ 
          background: '#fafafa', 
          padding: '1.5rem', 
          borderRadius: '6px', 
          border: '1px solid #e0e0e0' 
        }}>
          <h5 style={{ 
            marginBottom: '1rem', 
            color: '#333',
            fontWeight: '400',
            fontSize: '1rem'
          }}>
            {readOnly ? `${student.firstName}'s Interests:` : `Select ${student.firstName}'s Interests:`}
          </h5>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '0.5rem', 
            marginBottom: '1rem' 
          }}>
            {INTEREST_OPTIONS.map(interest => (
              <label key={interest.value} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                fontSize: '14px',
                fontWeight: '300',
                color: '#555'
              }}>
                <input 
                  type="checkbox" 
                  checked={tempInterests.includes(interest.value)}
                  onChange={(e) => onInterestChange?.(interest.value, e.target.checked)}
                  disabled={readOnly}
                />
                {interest.label}
              </label>
            ))}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '400',
              color: '#333',
              fontSize: '14px'
            }}>
              Other Interests:
            </label>
            <textarea 
              className="form-textarea" 
              placeholder={readOnly ? "No other interests listed" : "Any other hobbies or interests..."}
              rows={2}
              value={tempOtherInterests}
              onChange={(e) => onOtherInterestsChange?.(e.target.value)}
              style={{ width: '100%' }}
              disabled={readOnly}
            />
          </div>
          {!readOnly && (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-secondary"
                onClick={onCancelEdit}
              >
                Cancel
              </button>
              <button 
                className="btn" 
                onClick={onSaveInterests}
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
      <div className="card" style={{ padding: '12px', margin: '0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ 
              color: '#333', 
              marginBottom: '0', 
              fontSize: '1rem',
              fontWeight: '400'
            }}>
              {student.firstName} {student.lastInitial}.
            </h4>
            <span style={{ 
              color: '#777', 
              fontSize: '12px',
              fontWeight: '300'
            }}>
              Grade {student.grade}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!readOnly && (
              <button 
                className="btn" 
                onClick={onEditClick}
                disabled={readyForMatching}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                {readyForMatching ? 'Locked' : 'Add Interests'}
              </button>
            )}
            {!readOnly && showRemoveButton && (
              <button
                onClick={onRemoveClick}
                className="btn btn-danger"
                style={{ 
                  fontSize: '12px',
                  padding: '6px 8px',
                  minWidth: 'auto'
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
        style={{ cursor: 'pointer', margin: '0' }}
        onClick={onExpandClick}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: '1rem' 
        }}>
          <div>
            <h4 style={{ 
              color: '#333', 
              marginBottom: '0.25rem',
              fontWeight: '400',
              fontSize: '1.1rem'
            }}>
              {student.firstName} {student.lastInitial}.
            </h4>
            <span style={{ 
              color: '#777', 
              fontSize: '14px',
              fontWeight: '300'
            }}>
              Grade {student.grade}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: '#f0f0f0',
              color: '#333',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '400'
            }}>
              ✅ Ready
            </span>
            {!readOnly && showRemoveButton && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveClick?.();
                }}
                className="btn btn-danger"
                style={{ 
                  fontSize: '12px',
                  padding: '4px 6px',
                  minWidth: 'auto'
                }}
                title={`Remove ${student.firstName} ${student.lastInitial}.`}
              >
                🗑️
              </button>
            )}
          </div>
        </div>
        
        <div style={{ marginBottom: '0' }}>
          <strong style={{ 
            color: '#333',
            fontSize: '14px',
            fontWeight: '400'
          }}>
            Interests:
          </strong>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '6px', 
            marginTop: '8px' 
          }}>
            {student.interests.map(interest => (
              <span 
                key={interest} 
                style={{
                  background: '#f0f0f0',
                  color: '#555',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '300'
                }}
              >
                {getInterestLabel(interest)}
              </span>
            ))}
          </div>
          {student.otherInterests && (
            <p style={{ 
              color: '#777', 
              fontSize: '14px', 
              marginTop: '8px', 
              marginBottom: '0',
              fontWeight: '300'
            }}>
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
          cursor: 'pointer',
          padding: '12px',
          margin: '0'
        }}
        onClick={onExpandClick}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ 
              color: '#333', 
              marginBottom: '0', 
              fontSize: '1rem',
              fontWeight: '400'
            }}>
              {student.firstName} {student.lastInitial}.
            </h4>
            <span style={{ 
              color: '#777', 
              fontSize: '12px',
              fontWeight: '300'
            }}>
              Grade {student.grade}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: '#f0f0f0',
              color: '#333',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '400'
            }}>
              ✅ Ready
            </span>
            {!readOnly && showRemoveButton && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveClick?.();
                }}
                className="btn btn-danger"
                style={{ 
                  fontSize: '12px',
                  padding: '4px 6px',
                  minWidth: 'auto'
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
