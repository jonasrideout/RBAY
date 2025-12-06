// /app/dashboard/components/StudentCard.tsx
"use client";

import { useState } from 'react';

interface Student {
  id: string;
  firstName: string;
  lastInitial: string;
  grade: string;
  teacherName?: string;
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
  showEditButton?: boolean;
  readyForMatching?: boolean;
  penPalsAssigned?: boolean;
  tempFirstName?: string;
  tempLastInitial?: string;
  tempGrade?: string;
  tempTeacherName?: string;
  tempInterests?: string[];
  tempOtherInterests?: string;
  hasMultipleClasses?: boolean;
  teacherNames?: string[];
  onEditClick?: () => void;
  onRemoveClick?: () => void;
  onExpandClick?: () => void;
  onSaveEdit?: () => void;
  onSaveInterests?: () => void;
  onCancelEdit?: () => void;
  onFirstNameChange?: (value: string) => void;
  onLastInitialChange?: (value: string) => void;
  onGradeChange?: (value: string) => void;
  onTeacherNameChange?: (value: string) => void;
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
  showEditButton = false,
  readyForMatching = false,
  penPalsAssigned = false,
  tempFirstName = '',
  tempLastInitial = '',
  tempGrade = '',
  tempTeacherName = '',
  tempInterests = [],
  tempOtherInterests = '',
  hasMultipleClasses = false,
  teacherNames = [],
  onEditClick,
  onRemoveClick,
  onExpandClick,
  onSaveEdit,
  onSaveInterests,
  onCancelEdit,
  onFirstNameChange,
  onLastInitialChange,
  onGradeChange,
  onTeacherNameChange,
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
          <h4 className="text-data-value" style={{ 
            marginBottom: '0.25rem',
            fontSize: '1.1rem'
          }}>
            {student.firstName} {student.lastInitial}.
          </h4>
          <span className="text-meta-info">
            Grade {student.grade} • {readOnly ? 'Viewing interests' : 'Adding interests'}
          </span>
        </div>
        
        <div style={{ 
          background: '#fafafa', 
          padding: '1.5rem', 
          borderRadius: '6px', 
          border: '1px solid #e0e0e0' 
        }}>
          <h5 className="text-data-value" style={{ 
            marginBottom: '1rem', 
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
              <label key={interest.value} className="text-meta-info" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem'
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
            <label className="text-data-value" style={{ 
              display: 'block', 
              marginBottom: '0.5rem'
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
            <h4 className="text-data-value" style={{ 
              marginBottom: '0', 
              fontSize: '1rem'
            }}>
              {student.firstName} {student.lastInitial}.
            </h4>
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

  // Ready student card - EDITING mode
  if (type === 'ready' && isEditing) {
    return (
      <div className="card" style={{ margin: '0' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h4 className="text-data-value" style={{ 
            marginBottom: '0.25rem',
            fontSize: '1.1rem'
          }}>
            Editing Student
          </h4>
          <span className="text-meta-info">
            Update all student information
          </span>
        </div>
        
        <div style={{ 
          background: '#fafafa', 
          padding: '1.5rem', 
          borderRadius: '6px', 
          border: '1px solid #e0e0e0' 
        }}>
          {/* Name and Grade Fields */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="text-data-value" style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem'
                }}>
                  First Name:
                </label>
                <input 
                  type="text" 
                  className="form-input"
                  value={tempFirstName}
                  onChange={(e) => onFirstNameChange?.(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label className="text-data-value" style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem'
                }}>
                  Initials:
                </label>
                <input 
                  type="text" 
                  className="form-input"
                  value={tempLastInitial}
                  onChange={(e) => onLastInitialChange?.(e.target.value)}
                  maxLength={2}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <select 
              className="form-select"
              value={tempGrade}
              onChange={(e) => onGradeChange?.(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">Select</option>
              <option value="K">Kindergarten</option>
              <option value="1">1st Grade</option>
              <option value="2">2nd Grade</option>
              <option value="3">3rd Grade</option>
              <option value="4">4th Grade</option>
              <option value="5">5th Grade</option>
              <option value="6">6th Grade</option>
              <option value="7">7th Grade</option>
              <option value="8">8th Grade</option>
            </select>
            {hasMultipleClasses && (
              <div style={{ marginTop: '1rem' }}>
                <label className="text-data-value" style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem'
                }}>
                  Teacher:
                </label>
                <select 
                  className="form-select"
                  value={tempTeacherName}
                  onChange={(e) => onTeacherNameChange?.(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">Select teacher</option>
                  {teacherNames.map((name, index) => (
                    <option key={index} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Interests Section */}
          <h5 className="text-data-value" style={{ 
            marginBottom: '1rem', 
            fontSize: '1rem'
          }}>
            Select Interests:
          </h5>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '0.5rem', 
            marginBottom: '1rem' 
          }}>
            {INTEREST_OPTIONS.map(interest => (
              <label key={interest.value} className="text-meta-info" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem'
              }}>
                <input 
                  type="checkbox" 
                  checked={tempInterests.includes(interest.value)}
                  onChange={(e) => onInterestChange?.(interest.value, e.target.checked)}
                />
                {interest.label}
              </label>
            ))}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label className="text-data-value" style={{ 
              display: 'block', 
              marginBottom: '0.5rem'
            }}>
              Other Interests:
            </label>
            <textarea 
              className="form-textarea" 
              placeholder="Any other hobbies or interests..."
              rows={2}
              value={tempOtherInterests}
              onChange={(e) => onOtherInterestsChange?.(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button 
              className="btn btn-secondary"
              onClick={onCancelEdit}
            >
              Cancel
            </button>
            <button 
              className="btn" 
              onClick={onSaveEdit}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ready student card - expanded view (NOT editing)
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
            <h4 className="text-data-value" style={{ 
              marginBottom: '0.25rem',
              fontSize: '1.1rem'
            }}>
              {student.firstName} {student.lastInitial}.
            </h4>
            {student.teacherName && (
              <p className="text-meta-info" style={{ 
                marginTop: '0.25rem',
                marginBottom: '0',
                fontSize: '0.9rem'
              }}>
                {student.teacherName}
              </p>
            )}
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
            {!readOnly && showEditButton && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditClick?.();
                }}
                className="btn"
                style={{ 
                  fontSize: '12px',
                  padding: '4px 8px',
                  minWidth: 'auto'
                }}
                title={`Edit ${student.firstName} ${student.lastInitial}.`}
                disabled={penPalsAssigned}
              >
                ✏️
              </button>
            )}
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
          <strong className="text-data-value">
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
            <p className="text-meta-info" style={{ 
              marginTop: '8px', 
              marginBottom: '0'
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
            <h4 className="text-data-value" style={{ 
              marginBottom: '0', 
              fontSize: '1rem'
            }}>
              {student.firstName} {student.lastInitial}.
            </h4>
            {student.teacherName && (
              <p className="text-meta-info" style={{ 
                marginTop: '0.25rem',
                marginBottom: '0',
                fontSize: '0.85rem'
              }}>
                {student.teacherName}
              </p>
            )}
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
            {!readOnly && showEditButton && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditClick?.();
                }}
                className="btn"
                style={{ 
                  fontSize: '12px',
                  padding: '4px 8px',
                  minWidth: 'auto'
                }}
                title={`Edit ${student.firstName} ${student.lastInitial}.`}
                disabled={penPalsAssigned}
              >
                ✏️
              </button>
            )}
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
