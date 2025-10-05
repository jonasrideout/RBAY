'use client';

import { useState, useEffect } from 'react';

interface SchoolFormFieldsProps {
  formData: {
    schoolName: string;
    teacherName: string;
    teacherEmail: string;
    teacherPhone: string;
    schoolAddress: string;
    schoolCity: string;
    schoolState: string;
    schoolZip: string;
    gradeLevel: string;
    expectedClassSize: string;
    startMonth: string;
    specialConsiderations: string;
    communicationPlatforms: string[];
    communicationPlatformsOther: string;
    mailingAddress: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  errors: Record<string, string>;
  isAdminMode?: boolean;
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
  handleChange, 
  errors,
  isAdminMode = false 
}: SchoolFormFieldsProps) {
  const [showOtherPlatform, setShowOtherPlatform] = useState(false);

  useEffect(() => {
    setShowOtherPlatform(formData.communicationPlatforms.includes('Other'));
  }, [formData.communicationPlatforms]);

  const handlePlatformChange = (platform: string, checked: boolean) => {
    let newPlatforms = [...formData.communicationPlatforms];
    
    if (checked) {
      if (!newPlatforms.includes(platform)) {
        newPlatforms.push(platform);
      }
    } else {
      newPlatforms = newPlatforms.filter(p => p !== platform);
      // If unchecking "Other", also clear the other text
      if (platform === 'Other') {
        handleChange({
          target: { name: 'communicationPlatformsOther', value: '' }
        } as React.ChangeEvent<HTMLInputElement>);
      }
    }

    handleChange({
      target: { name: 'communicationPlatforms', value: newPlatforms }
    } as any);
  };

  return (
    <div className="space-y-6">
      {/* School Information */}
      <div>
        <h3 className="text-lg font-light mb-4" style={{ color: '#2c5aa0' }}>School Information</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="schoolName" className="block text-sm font-light mb-1">
              School Name *
            </label>
            <input
              type="text"
              id="schoolName"
              name="schoolName"
              value={formData.schoolName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.schoolName ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.schoolName && <p className="text-red-500 text-sm mt-1">{errors.schoolName}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="schoolAddress" className="block text-sm font-light mb-1">
                School Address
              </label>
              <input
                type="text"
                id="schoolAddress"
                name="schoolAddress"
                value={formData.schoolAddress}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label htmlFor="schoolCity" className="block text-sm font-light mb-1">
                City
              </label>
              <input
                type="text"
                id="schoolCity"
                name="schoolCity"
                value={formData.schoolCity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="schoolState" className="block text-sm font-light mb-1">
                State *
              </label>
              <select
                id="schoolState"
                name="schoolState"
                value={formData.schoolState}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.schoolState ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select State</option>
                {STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {errors.schoolState && <p className="text-red-500 text-sm mt-1">{errors.schoolState}</p>}
            </div>

            <div>
              <label htmlFor="schoolZip" className="block text-sm font-light mb-1">
                ZIP Code
              </label>
              <input
                type="text"
                id="schoolZip"
                name="schoolZip"
                value={formData.schoolZip}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Information */}
      <div>
        <h3 className="text-lg font-light mb-4" style={{ color: '#2c5aa0' }}>Teacher Information</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="teacherName" className="block text-sm font-light mb-1">
              Teacher Name *
            </label>
            <input
              type="text"
              id="teacherName"
              name="teacherName"
              value={formData.teacherName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.teacherName ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.teacherName && <p className="text-red-500 text-sm mt-1">{errors.teacherName}</p>}
          </div>

          <div>
            <label htmlFor="teacherEmail" className="block text-sm font-light mb-1">
              Teacher Email *
            </label>
            <input
              type="email"
              id="teacherEmail"
              name="teacherEmail"
              value={formData.teacherEmail}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.teacherEmail ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.teacherEmail && <p className="text-red-500 text-sm mt-1">{errors.teacherEmail}</p>}
          </div>

          <div>
            <label htmlFor="teacherPhone" className="block text-sm font-light mb-1">
              Teacher Phone
            </label>
            <input
              type="tel"
              id="teacherPhone"
              name="teacherPhone"
              value={formData.teacherPhone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="mailingAddress" className="block text-sm font-light mb-1">
              Mailing address for receiving pen pal letters {!isAdminMode && '*'}
            </label>
            <textarea
              id="mailingAddress"
              name="mailingAddress"
              value={formData.mailingAddress}
              onChange={handleChange}
              rows={3}
              placeholder="Jonas Rideout&#10;Lincoln Elementary&#10;Lincoln, NY 10013"
              className={`w-full px-3 py-2 border rounded-md ${errors.mailingAddress ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.mailingAddress && <p className="text-red-500 text-sm mt-1">{errors.mailingAddress}</p>}
          </div>
        </div>
      </div>

      {/* Class Information */}
      <div>
        <h3 className="text-lg font-light mb-4" style={{ color: '#2c5aa0' }}>Class Information</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="gradeLevel" className="block text-sm font-light mb-1">
              Grade Level *
            </label>
            <select
              id="gradeLevel"
              name="gradeLevel"
              value={formData.gradeLevel}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.gradeLevel ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select Grade Level</option>
              {GRADE_LEVELS.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
            {errors.gradeLevel && <p className="text-red-500 text-sm mt-1">{errors.gradeLevel}</p>}
          </div>

          <div>
            <label htmlFor="expectedClassSize" className="block text-sm font-light mb-1">
              Expected Class Size *
            </label>
            <input
              type="number"
              id="expectedClassSize"
              name="expectedClassSize"
              value={formData.expectedClassSize}
              onChange={handleChange}
              min="1"
              className={`w-full px-3 py-2 border rounded-md ${errors.expectedClassSize ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.expectedClassSize && <p className="text-red-500 text-sm mt-1">{errors.expectedClassSize}</p>}
          </div>

          <div>
            <label htmlFor="startMonth" className="block text-sm font-light mb-1">
              When do you plan to start the pen pal project? *
            </label>
            <select
              id="startMonth"
              name="startMonth"
              value={formData.startMonth}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.startMonth ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select Month</option>
              {MONTHS.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            {errors.startMonth && <p className="text-red-500 text-sm mt-1">{errors.startMonth}</p>}
          </div>

          <div>
            <label className="block text-sm font-light mb-2">
              What platforms can you use to meet with other schools? {!isAdminMode && '*'}
            </label>
            <div className="space-y-2">
              {COMMUNICATION_PLATFORMS.map(platform => (
                <label key={platform} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.communicationPlatforms.includes(platform)}
                    onChange={(e) => handlePlatformChange(platform, e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-light">{platform}</span>
                </label>
              ))}
              
              {showOtherPlatform && (
                <input
                  type="text"
                  name="communicationPlatformsOther"
                  value={formData.communicationPlatformsOther}
                  onChange={handleChange}
                  placeholder="Please specify"
                  className={`w-full px-3 py-2 border rounded-md ml-6 ${errors.communicationPlatformsOther ? 'border-red-500' : 'border-gray-300'}`}
                />
              )}
            </div>
            {errors.communicationPlatforms && <p className="text-red-500 text-sm mt-1">{errors.communicationPlatforms}</p>}
            {errors.communicationPlatformsOther && <p className="text-red-500 text-sm mt-1">{errors.communicationPlatformsOther}</p>}
          </div>

          <div>
            <label htmlFor="specialConsiderations" className="block text-sm font-light mb-1">
              Special Considerations
            </label>
            <textarea
              id="specialConsiderations"
              name="specialConsiderations"
              value={formData.specialConsiderations}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Any special needs, accessibility requirements, or other considerations..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
