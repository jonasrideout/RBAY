// /app/dashboard/components/MatchingStatusCard.tsx
"use client";

import { useState } from 'react';
import SchoolEditModal from './SchoolEditModal';

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
    isGroup?: boolean;
    schools?: any[];
  };
  studentStats?: {
    expected: number;
    registered: number;
    ready: number;
    studentsWithPenpals: number;
    hasPenpalAssignments: boolean;
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
  
  const [showEditModal, setShowEditModal] = useState(false);

  // Check if school data is incomplete (has 'TBD' values or missing required data)
  const isIncomplete = schoolData.schoolState === 'TBD' || 
                      schoolData.gradeLevel === 'TBD' || 
                      schoolData.startMonth === 'TBD' ||
                      schoolData.expectedClassSize === 0;

  // Check if school is matched with another school/group
  const isMatched = schoolData?.matchedWithSchoolId != null;
  
  // Check status
  const readyForPairing = schoolData?.status === 'READY';
  const penPalsPaired = schoolData?.status === 'MATCHED';
  
  // Show card in three scenarios: incomplete profile, READY status, or MATCHED status
  const shouldShowCard = isIncomplete || readyForPairing || penPalsPaired;
  
  if (!shouldShowCard) {
    return null;
  }

  const handleModalSuccess = () => {
    // Refresh the dashboard data
    if (onSchoolUpdated) {
      onSchoolUpdated();
    } else {
      window.location.reload();
    }
  };

  const handleViewPenPals = () => {
    window.open(`/teacher/pen-pal-list?schoolId=${schoolData.id}`, '_blank');
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
                Your school profile is missing some required information. Please complete your profile to start registering students.
              </p>
              <button 
                onClick={() => setShowEditModal(true)}
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
        <SchoolEditModal
          show={showEditModal}
          schoolData={schoolData}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleModalSuccess}
        />
      </>
    );
  }

  // Show Pen Pals Paired card when status is MATCHED
  if (penPalsPaired) {
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
              Pen Pals Paired
            </h3>
            <p className="text-meta-info" style={{ marginBottom: '1rem' }}>
              Your students have been paired with pen pals! View the list below to see who is paired with whom.
            </p>
            <button 
              onClick={handleViewPenPals}
              className="btn"
              style={{ 
                padding: '0.75rem 1.5rem'
              }}
            >
              View Pen Pal List
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show Ready for Pen Pals card when status is READY (waiting for pairing)
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
