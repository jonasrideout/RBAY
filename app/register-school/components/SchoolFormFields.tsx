'use client';

import { useState, useEffect } from 'react';
import { SchoolFormData } from '../types';

interface SchoolFormFieldsProps {
  formData: SchoolFormData;
  isLoading: boolean;
  onUpdateFormData: (field: keyof SchoolFormData, value: any) => void;
  onGradeLevelChange: (grade: string, checked: boolean) => void;
  editMode?: boolean;
  isAdminMode?: boolean;
  isEmailReadOnly?: boolean;
}

const STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const GRADE_LEVELS = [
  'Kindergarten',
  '1st Grade',
  '2nd Grade',
  '3rd Grade',
  '4th Grade',
  '5th Grade',
  '6th Grade',
  '7th Grade',
  '8th Grade'
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const COMMUNICATION_PLATFORMS = [
  'Zoom',
  'Google Meet',
  'Microsoft Teams',
  'Other'
];

export default function SchoolFormFields({ 
  formData, 
  isLoading,
  onUpdateFormData,
  onGradeLevelChange,
  editMode = false,
  isAdminMode = false,
  isEmailReadOnly = false
}: SchoolFormFieldsProps) {
  const [showOtherPlatform, setShowOtherPlatform] = useState(false);
  const [communicationPlatforms, setCommunicationPlatforms] = useState<string[]>([]);
  const [otherPlatformText, setOtherPlatformText] = useState('');

  useEffect(() => {
    setShowOtherPlatform(communicationPlatforms.includes('Other'));
  }, [communicationPlatforms]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      onUpdateFormData(name as keyof SchoolFormData, checked);
    } else {
      onUpdateFormData(name as keyof SchoolFormData, value);
    }
  };

  const handlePlatformChange = (platform: string, checked: boolean) => {
    let newPlatforms = [...communicationPlatforms];
    
    if (checked) {
      if (!newPlatforms.includes(platform)) {
        newPlatforms.push(platform);
      }
    } else {
      newPlatforms = newPlatforms.filter(p => p !== platform);
      // If unchecking "Other", also clear the other text
      if (platform === 'Other') {
        setOtherPlatformText('');
      }
    }

    setCommunicationPlatforms(newPlatforms);
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      
      {/* School Name */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="schoolName" className="form-label">
          School Name *
        </label>
        <input
          type="text"
          id="schoolName"
          name="schoolName"
          value={formData.schoolName}
          onChange={handleChange}
          disabled={isLoading}
          className="form-input"
          required
        />
      </div>

      {/* Teacher Name */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="teacherName" className="form-label">
          Teacher Name *
        </label>
        <input
          type="text"
          id="teacherName"
          name="teacherName"
          value={formData.teacherName}
          onChange={handleChange}
          disabled={isLoading}
          className="form-input"
          required
        />
      </div>

      {/* Teacher Email */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="teacherEmail" className="form-label">
          Teacher Email *
        </label>
        <input
          type="email"
          id="teacherEmail"
          name="teacherEmail"
          value={formData.teacherEmail}
          onChange={handleChange}
          disabled={isLoading}
          readOnly={isEmailReadOnly}
          className="form-input"
          required
          style={isEmailReadOnly ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
        />
      </div>

      {/* Teacher Phone */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="teacherPhone" className="form-label">
          Teacher Phone
        </label>
        <input
          type="tel"
          id="teacherPhone"
          name="teacherPhone"
          value={formData.teacherPhone}
          onChange={handleChange}
          disabled={isLoading}
          className="form-input"
        />
      </div>

      {/* Mailing Address */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="mailingAddress" className="form-label">
          Mailing address for receiving pen pal letters {!isAdminMode && '*'}
        </label>
        <textarea
          id="mailingAddress"
          name="mailingAddress"
          value={(formData as any).mailingAddress || ''}
          onChange={handleChange}
          disabled={isLoading}
          rows={3}
          placeholder="Jonas Rideout&#10;Lincoln Elementary&#10;Lincoln, NY 10013"
          className="form-input"
          required={!isAdminMode}
          style={{ fontFamily: 'inherit', resize: 'vertical' }}
        />
      </div>

      {/* City and State */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label htmlFor="schoolCity" className="form-label">
            City
          </label>
          <input
            type="text"
            id="schoolCity"
            name="schoolCity"
            value={formData.schoolCity}
            onChange={handleChange}
            disabled={isLoading}
            className="form-input"
          />
        </div>

        <div>
          <label htmlFor="schoolState" className="form-label">
            State {!isAdminMode && '*'}
          </label>
          <select
            id="schoolState"
            name="schoolState"
            value={formData.schoolState}
            onChange={handleChange}
            disabled={isLoading}
            className="form-input"
            required={!isAdminMode}
          >
            <option value="">Select State</option>
            {STATES.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grade Levels */}
      {!editMode && !isAdminMode && (
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">
            Grade Level(s) *
          </label>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
            gap: '0.75rem',
            marginTop: '0.5rem'
          }}>
            {GRADE_LEVELS.map(grade => (
              <label key={grade} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.gradeLevels.includes(grade)}
                  onChange={(e) => onGradeLevelChange(grade, e.target.checked)}
                  disabled={isLoading}
                  style={{ marginRight: '0.5rem' }}
                />
                <span className="text-data-value">{grade}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Grade Level (Edit Mode) */}
      {editMode && (
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">
            Grade Level(s) *
          </label>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
            gap: '0.75rem',
            marginTop: '0.5rem'
          }}>
            {GRADE_LEVELS.map(grade => (
              <label key={grade} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.gradeLevels.includes(grade)}
                  onChange={(e) => onGradeLevelChange(grade, e.target.checked)}
                  disabled={isLoading}
                  style={{ marginRight: '0.5rem' }}
                />
                <span className="text-data-value">{grade}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Expected Class Size */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="classSize" className="form-label">
          Expected Class Size {!isAdminMode && '*'}
        </label>
        <input
          type="number"
          id="classSize"
          name="classSize"
          value={formData.classSize}
          onChange={handleChange}
          disabled={isLoading}
          min="1"
          className="form-input"
          required={!isAdminMode}
        />
      </div>

      {/* Program Start Month */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="programStartMonth" className="form-label">
          When do you plan to start the pen pal project? {!isAdminMode && '*'}
        </label>
        <select
          id="programStartMonth"
          name="programStartMonth"
          value={formData.programStartMonth}
          onChange={handleChange}
          disabled={isLoading}
          className="form-input"
          required={!isAdminMode}
        >
          <option value="">Select Month</option>
          {MONTHS.map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
      </div>

      {/* Communication Platforms */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label className="form-label">
          What platforms can you use to meet with other schools? {!isAdminMode && '*'}
        </label>
        <div style={{ marginTop: '0.5rem' }}>
          {COMMUNICATION_PLATFORMS.map(platform => (
            <label key={platform} style={{ display: 'block', marginBottom: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={communicationPlatforms.includes(platform)}
                onChange={(e) => handlePlatformChange(platform, e.target.checked)}
                disabled={isLoading}
                style={{ marginRight: '0.5rem' }}
              />
              <span className="text-data-value">{platform}</span>
            </label>
          ))}
          
          {showOtherPlatform && (
            <input
              type="text"
              value={otherPlatformText}
              onChange={(e) => setOtherPlatformText(e.target.value)}
              disabled={isLoading}
              placeholder="Please specify"
              className="form-input"
              style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}
              required
            />
          )}
        </div>
      </div>

      {/* Special Considerations */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="specialConsiderations" className="form-label">
          Special Considerations
        </label>
        <textarea
          id="specialConsiderations"
          name="specialConsiderations"
          value={formData.specialConsiderations}
          onChange={handleChange}
          disabled={isLoading}
          rows={3}
          className="form-input"
          placeholder="Any special needs, accessibility requirements, or other considerations..."
          style={{ fontFamily: 'inherit', resize: 'vertical' }}
        />
      </div>

      {/* Program Agreement */}
      {!editMode && !isAdminMode && (
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="programAgreement"
              checked={formData.programAgreement}
              onChange={handleChange}
              disabled={isLoading}
              style={{ marginRight: '0.75rem', marginTop: '0.25rem', flexShrink: 0 }}
              required
            />
            <span className="text-data-value">
              I agree to participate in the Right Back at You pen pal program and understand the commitment to facilitate letter exchanges between students. *
            </span>
          </label>
        </div>
      )}

      {/* Parent Notification (hidden field for now) */}
      <input
        type="hidden"
        name="parentNotification"
        value={formData.parentNotification.toString()}
      />

    </div>
  );
}
