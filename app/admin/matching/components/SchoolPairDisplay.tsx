// app/admin/matching/components/SchoolPairDisplay.tsx
"use client";

import { useState } from 'react';

interface School {
  id: string;
  schoolName: string;
  teacherName: string;
  teacherEmail: string;
  gradeLevel: string;
  region: string;
  startMonth: string;
  status: string;
  specialConsiderations?: string;
  studentCounts?: {
    expected: number;
    registered: number;
    ready: number;
  };
}

interface SchoolPair {
  school1: School;
  school2: School;
  hasPenPals?: boolean;
}

interface SchoolPairDisplayProps {
  pair: SchoolPair;
  showAssignButton?: boolean;
  showPenPalListButtons?: boolean;
  onAssignPenPals?: (school1Id: string, school2Id: string) => void;
  onViewPenPals?: (schoolId: string) => void;
}

export default function SchoolPairDisplay({ 
  pair, 
  showAssignButton = false,
  showPenPalListButtons = false,
  onAssignPenPals,
  onViewPenPals
}: SchoolPairDisplayProps) {
  const [copyButtonText1, setCopyButtonText1] = useState('Copy URL');
  const [copyButtonText2, setCopyButtonText2] = useState('Copy URL');
  const [emailCopyText1, setEmailCopyText1] = useState('✉');
  const [emailCopyText2, setEmailCopyText2] = useState('✉');

  const getDashboardUrl = (schoolId: string) => {
    const adminDashboardPath = `/admin/school-dashboard?schoolId=${schoolId}`;
    if (typeof window !== 'undefined') {
      const currentOrigin = window.location.origin;
      return `${currentOrigin}${adminDashboardPath}`;
    }
    return adminDashboardPath;
  };

  const openDashboard = (schoolId: string) => {
    const url = getDashboardUrl(schoolId);
    window.open(url, '_blank');
  };

  const copyDashboardUrl = async (schoolId: string, isSchool1: boolean) => {
    const url = getDashboardUrl(schoolId);
    try {
      await navigator.clipboard.writeText(url);
      if (isSchool1) {
        setCopyButtonText1('Copied');
        setTimeout(() => setCopyButtonText1('Copy URL'), 2000);
      } else {
        setCopyButtonText2('Copied');
        setTimeout(() => setCopyButtonText2('Copy URL'), 2000);
      }
    } catch (err) {
      console.error('Failed to copy URL:', err);
      prompt('Copy this URL:', url);
    }
  };

  const copyEmailAddress = async (email: string, isSchool1: boolean) => {
    try {
      await navigator.clipboard.writeText(email);
      if (isSchool1) {
        setEmailCopyText1('✓');
        setTimeout(() => setEmailCopyText1('✉'), 1500);
      } else {
        setEmailCopyText2('✓');
        setTimeout(() => setEmailCopyText2('✉'), 1500);
      }
    } catch (err) {
      console.error('Failed to copy email:', err);
      prompt('Copy this email:', email);
    }
  };

  const renderSchoolCard = (school: School, isSchool1: boolean) => {
    const copyButtonText = isSchool1 ? copyButtonText1 : copyButtonText2;
    const emailCopyText = isSchool1 ? emailCopyText1 : emailCopyText2;

    return (
      <div className="card-school grid-school-card">
        
        {/* Column 1: School Information */}
        <div className="school-info-column">
          <h3 className="text-school-name">
            {school.schoolName}
          </h3>
          
          <div className="teacher-info">
            <span>{school.teacherName}</span>
            <button
              onClick={() => copyEmailAddress(school.teacherEmail, isSchool1)}
              className="btn-icon btn-icon-email"
              title={`Copy email: ${school.teacherEmail}`}
            >
              {emailCopyText}
            </button>
          </div>
          
          <div className="text-meta-info">
            Grades {school.gradeLevel}
          </div>

          {school.specialConsiderations && (
            <div className="special-considerations">
              {school.specialConsiderations}
            </div>
          )}
        </div>

        {/* Column 2: Empty spacer */}
        <div></div>

        {/* Column 3: Data Grid */}
        <div className="grid-data-3x2">
          <div className="data-cell">
            <span className="text-data-label">Region</span>
            <span className="text-data-value-caps">{school.region}</span>
          </div>
          
          <div className="data-cell">
            <span className="text-data-label">Start Date</span>
            <span className="text-data-value-caps">{school.startMonth}</span>
          </div>
          
          <div className="data-cell">
            <span className="text-data-label">Status</span>
            <span className="text-data-value">{school.status}</span>
          </div>
          
          <div className="data-cell">
            <span className="text-data-label">Expected</span>
            <span className="text-data-value">{school.studentCounts?.expected || 0}</span>
          </div>
          
          <div className="data-cell">
            <span className="text-data-label">Registered</span>
            <span className="text-data-value">{school.studentCounts?.registered || 0}</span>
          </div>
          
          <div className="data-cell">
            <span className="text-data-label">Ready</span>
            <span className="text-data-value">{school.studentCounts?.ready || 0}</span>
          </div>
        </div>

        {/* Column 4: Spacer (takes remaining space) */}
        <div></div>

        {/* Column 5: Action Buttons */}
        <div className="action-buttons-column">
          <button
            onClick={() => openDashboard(school.id)}
            className="btn-school-action"
            title="Open school dashboard in new tab"
          >
            Open Dashboard
          </button>

          <button
            onClick={() => copyDashboardUrl(school.id, isSchool1)}
            className="btn-school-action"
            title="Copy school dashboard URL to clipboard"
          >
            {copyButtonText}
          </button>

          {showPenPalListButtons && onViewPenPals && (
            <button
              onClick={() => onViewPenPals(school.id)}
              className="btn-school-action"
              title="View pen pal list for this school"
            >
              View Pen Pal List
            </button>
          )}
        </div>

        {/* Column 6: Empty (no pin icon for paired schools) */}
        <div></div>
      </div>
    );
  };

  const renderLinkIcon = () => (
    <div className="flex items-center justify-center">
      <div style={{
        background: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '50%',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666'
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      </div>
    </div>
  );

  return (
    <div style={{ marginBottom: '24px' }}>
      
      {/* School Pair Container */}
      <div className="grid-school-pair">
        
        {/* School 1 */}
        {renderSchoolCard(pair.school1, true)}
        
        {/* Link Icon */}
        {renderLinkIcon()}
        
        {/* School 2 */}
        {renderSchoolCard(pair.school2, false)}
        
      </div>

      {/* Action Buttons Row - spans full width below the pair */}
      {(showAssignButton || pair.hasPenPals) && (
        <div className="flex justify-center gap-md" style={{ marginTop: '16px' }}>
          
          {showAssignButton && onAssignPenPals && !pair.hasPenPals && (
            <button
              onClick={() => onAssignPenPals(pair.school1.id, pair.school2.id)}
              className="btn btn-primary"
              style={{ minWidth: '160px' }}
            >
              Assign Pen Pals
            </button>
          )}

          {pair.hasPenPals && (
            <div className="flex items-center gap-sm text-data-value" style={{ 
              color: '#28a745', 
              fontWeight: '500',
              fontSize: '14px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              Pen Pals Assigned
            </div>
          )}
          
        </div>
      )}

    </div>
  );
}
