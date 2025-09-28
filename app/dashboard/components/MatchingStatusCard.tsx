// /app/dashboard/components/MatchingStatusCard.tsx
"use client";

import { useState } from 'react';
import { US_STATES, STATE_TO_REGION } from '@/app/register-school/constants';

interface SchoolData {
  id: string;
  schoolName: string;
  teacherName: string;
  teacherEmail: string;
  dashboardToken: string;
  expectedClassSize: number;
  startMonth: string;
  programStartMonth: string;
  status: 'COLLECTING' | 'READY' | 'MATCHED' | 'CORRESPONDING' | 'DONE';
  students: any[];
  matchedWithSchoolId?: string;
  matchedSchoolName?: string;
  schoolState?: string;
  schoolCity?: string;
  gradeLevel?: string;
  teacherPhone?: string;
  specialConsiderations?: string;
  matchedSchool?: {
    id: string;
    schoolName: string;
    teacherName: string;
    teacherEmail: string;
    schoolCity?: string;
    schoolState?: string;
    expectedClassSize: number;
    region: string;
  };
}

interface MatchingStatusCardProps {
  schoolData: SchoolData;
  allActiveStudentsComplete: boolean;
  readOnly?: boolean;
  isAdminView?: boolean;
  onSchoolUpdated?: () => void;
}

export default function MatchingStatusCard({ 
  schoolData, 
  allActiveStudentsComplete, 
  readOnly = false,
  isAdminView = false,
  onSchoolUpdated
}: MatchingStatusCardProps) {
  
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [completionData, setCompletionData] = useState({
    schoolState: schoolData.schoolState || '',
    schoolCity: schoolData.schoolCity || '',
    gradeLevel: schoolData.gradeLevel || '',
    expectedClassSize: schoolData.expectedClassSize?.toString() || '',
    startMonth: schoolData.startMonth || '',
    teacherPhone: schoolData.teacherPhone || '',
    specialConsiderations: schoolData.specialConsiderations || ''
  });

  // Check if school data is incomplete (has 'TBD' values or missing required data)
  const isIncomplete = schoolData.schoolState === 'TBD' || 
                      schoolData.gradeLevel === 'TBD' || 
                      schoolData.startMonth === 'TBD' ||
                      schoolData.expectedClassSize === 0;

  // Check if school is already matched
  const isMatched = schoolData?.matchedWithSchoolId != null;
  
  // Use status field for ready state
  const readyForPairing = schoolData?.status === 'READY';
  
  // Show completion prompt if incomplete, otherwise show normal matching status
  const shouldShowCard = isIncomplete || readyForPairing || (isMatched && !readOnly && !isAdminView);
  
  if (!shouldShowCard) {
    return null;
  }

  const getRegionForState = (state: string) => {
    return STATE_TO_REGION[state] || '';
  };

  const handleCompletionSubmit = async () => {
    setIsUpdating(true);
    
    try {
      // Validate required fields
      if (!completionData.schoolState || !completionData.gradeLevel || 
          !completionData.expectedClassSize || !completionData.startMonth) {
        alert('Please fill in all required fields');
        setIsUpdating(false);
        return;
      }

      const region = getRegionForState(completionData.schoolState);
      
      const response = await fetch('/api/schools', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schoolId: schoolData.id,
          schoolState: completionData.schoolState,
          schoolCity: completionData.schoolCity || null,
          gradeLevel: completionData.gradeLevel,
          expectedClassSize: completionData.expectedClassSize,
          startMonth: completionData.startMonth,
          teacherPhone: completionData.teacherPhone || null,
          specialConsiderations: completionData.specialConsiderations || null,
          region: region
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update school information');
      }

      setShowCompletionModal(false);
      
      // Refresh the dashboard data
      if (onSchoolUpdated) {
        onSchoolUpdated();
      } else {
        window.location.reload();
      }

    } catch (error: any) {
      alert('Error updating school information: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGradeLevelChange = (grade: string, checked: boolean) => {
    const currentGrades = completionData.gradeLevel.split(', ').filter(g => g.trim());
    let newGrades;
    
    if (checked) {
      newGrades = [...currentGrades, grade];
    } else {
      newGrades = currentGrades.filter(g => g !== grade);
    }
    
    setCompletionData(prev => ({
      ...prev,
      gradeLevel: newGrades.join(', ')
    }));
  };

  // Show completion prompt if school data is incomplete
  if (isIncomplete) {
    return (
      <>
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: '1', minWidth: '300px' }}>
              <h3 style={{ 
                color: '#1f2937', 
                marginBottom: '1rem', 
                fontSize: '1.4rem',
                fontWeight: '400',
                margin: 0
              }}>
                Complete Your School Profile
              </h3>
              <p className="text-meta-info" style={{ marginBottom: '1rem' }}>
                Your school profile is missing some required information. Please complete your profile to access all features.
              </p>
              <button 
                onClick={() => setShowCompletionModal(true)}
                className="btn"
                style={{ 
                  padding: '0.75rem 1.5rem'
                }}
              >
                Complete School Profile
              </button>
            </div>
          </div>
        </div>

        {/* School Profile Completion Modal */}
        {showCompletionModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
            }}>
              <h3 style={{ color: '#495057', marginBottom: '1.5rem' }}>
                Complete School Information
              </h3>
              
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {/* State (Required) */}
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <select 
                    className="form-select" 
                    value={completionData.schoolState}
                    onChange={(e) => setCompletionData(prev => ({ ...prev, schoolState: e.target.value }))}
                    required
                  >
                    <option value="">Select State</option>
                    {US_STATES.map(state => (
                      <option key={state.value} value={state.value}>{state.value}</option>
                    ))}
                  </select>
                </div>

                {/* City (Optional) */}
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={completionData.schoolCity}
                    onChange={(e) => setCompletionData(prev => ({ ...prev, schoolCity: e.target.value }))}
                    placeholder="e.g., Springfield"
                  />
                </div>

                {/* Grade Levels (Required) */}
                <div className="form-group">
                  <label className="form-label">Grade Level(s) *</label>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '0.75rem', 
                    marginTop: '0.5rem' 
                  }}>
                    {['3', '4', '5', '6', '7', '8'].map(grade => (
                      <label key={grade} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        fontSize: '14px',
                        fontWeight: '400',
                        color: '#555'
                      }}>
                        <input 
                          type="checkbox" 
                          checked={completionData.gradeLevel.includes(grade)}
                          onChange={(e) => handleGradeLevelChange(grade, e.target.checked)}
                          style={{ accentColor: '#2c5aa0' }}
                        />
                        {grade}{grade === '3' ? 'rd' : 'th'} Grade
                      </label>
                    ))}
                  </div>
                </div>

                {/* Expected Class Size (Required) */}
                <div className="form-group">
                  <label className="form-label">Expected Number of Students *</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min="1"
                    max="50"
                    value={completionData.expectedClassSize}
                    onChange={(e) => setCompletionData(prev => ({ ...prev, expectedClassSize: e.target.value }))}
                    placeholder="e.g., 25"
                    required
                  />
                </div>

                {/* Start Month (Required) */}
                <div className="form-group">
                  <label className="form-label">Preferred Start Month *</label>
                  <select 
                    className="form-select" 
                    value={completionData.startMonth}
                    onChange={(e) => setCompletionData(prev => ({ ...prev, startMonth: e.target.value }))}
                    required
                  >
                    <option value="">Select Start Month</option>
                    <option value="As soon as possible">As soon as possible</option>
                    <option value="Not sure yet">Not sure yet</option>
                    {[
                      'January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'
                    ].map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>

                {/* Phone (Optional) */}
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    value={completionData.teacherPhone}
                    onChange={(e) => setCompletionData(prev => ({ ...prev, teacherPhone: e.target.value }))}
                    placeholder="(555) 123-4567"
                  />
                </div>

                {/* Special Considerations (Optional) */}
                <div className="form-group">
                  <label className="form-label">Special Considerations or Notes</label>
                  <textarea 
                    className="form-textarea" 
                    rows={3}
                    value={completionData.specialConsiderations}
                    onChange={(e) => setCompletionData(prev => ({ ...prev, specialConsiderations: e.target.value }))}
                    placeholder="Any special considerations, scheduling preferences, or notes..."
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button 
                  onClick={() => setShowCompletionModal(false)}
                  className="btn"
                  disabled={isUpdating}
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCompletionSubmit}
                  className="btn"
                  disabled={isUpdating}
                  style={{ 
                    backgroundColor: '#28a745', 
                    color: 'white', 
                    padding: '0.75rem 1.5rem' 
                  }}
                >
                  {isUpdating ? (
                    <>
                      <span className="loading" style={{ marginRight: '0.5rem' }}></span>
                      Updating...
                    </>
                  ) : (
                    'Save Profile'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Show regular matching status card for complete school profiles
  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h3 style={{ 
            color: '#1f2937', 
            marginBottom: '1rem', 
            fontSize: '1.4rem',
            fontWeight: '400',
            margin: 0
          }}>
            Ready for Pen Pals
          </h3>
          <p className="text-meta-info" style={{ marginBottom: '0' }}>
            {readOnly && !isAdminView
              ? 'This school is ready for pen pal pairing and is waiting for a partner school.'
              : isAdminView
              ? 'This school is ready for pen pal pairing and is waiting for a partner school.'
              : isMatched && schoolData.matchedSchool
              ? `Ready for pen pals. When ${schoolData.matchedSchool.schoolName} is done collecting student data, pen pals will be paired.`
              : isMatched
              ? 'Ready for pen pals. When your partner school is done collecting student data, pen pals will be paired.'
              : 'Waiting for partner school. We will email you when matching is complete.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
