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
  mailingAddress?: string;
  communicationPlatforms?: any;
  matchedSchool?: {
    id: string;
    schoolName: string;
    teacherName: string;
    teacherEmail: string;
    schoolCity?: string;
    schoolState?: string;
    expectedClassSize: number;
    region: string;
    communicationPlatforms?: any;
    isGroup?: boolean;
    mailingAddress?: string;
    schools?: Array<{
      id: string;
      schoolName: string;
      teacherName: string;
      mailingAddress?: string;
      communicationPlatforms?: any;
    }>;
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

// This card now covers two, non-overlapping jobs:
// 1. Prompting to complete an incomplete school profile (unrelated to the
//    timeline - still needed here).
// 2. Once matched, showing the partner school's practical details
//    (communication platform, mailing address) so a teacher knows how to
//    actually reach/mail their pen pal school. All "where are we in the
//    process" status language now lives in DashboardTimeline instead - this
//    card intentionally says nothing about readiness, waiting, or pairing
//    progress anymore, to avoid the two components repeating each other.
export default function MatchingStatusCard({ 
  schoolData, 
  readOnly = false,
  isAdminView = false,
  onSchoolUpdated
}: MatchingStatusCardProps) {
  
  const [showEditModal, setShowEditModal] = useState(false);

  // Check if school data is incomplete (has 'TBD' values or missing required data)
  const isIncomplete = schoolData.schoolState === 'TBD' || 
                      schoolData.gradeLevel === 'TBD' || 
                      schoolData.startMonth === 'TBD' ||
                      schoolData.expectedClassSize === 0 ||
                      !schoolData.mailingAddress ||
                      !schoolData.communicationPlatforms ||
                      (Array.isArray(schoolData.communicationPlatforms) && schoolData.communicationPlatforms.length === 0);

  const isMatched = schoolData?.matchedWithSchoolId != null;

  const handleModalSuccess = () => {
    if (onSchoolUpdated) {
      onSchoolUpdated();
    } else {
      window.location.reload();
    }
  };

  const formatPlatforms = (platforms: any): string | null => {
    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) return null;
    return platforms.join(' | ');
  };

  // Show completion prompt if school data is incomplete - unrelated to
  // matching status, still needed regardless of the timeline.
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

  // Not matched yet - nothing to show here; the timeline covers "waiting to
  // be matched" status language.
  if (!isMatched || !schoolData.matchedSchool) {
    return null;
  }

  // Matched - show the partner school's practical details only.
  const partner = schoolData.matchedSchool;

  if (partner.isGroup && partner.schools) {
    return (
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: '#1f2937', marginBottom: '1rem', fontSize: '1.4rem', fontWeight: '400', margin: 0 }}>
          Your Pen Pal Schools
        </h3>
        <div style={{ 
          marginTop: '1rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}>
          {partner.schools.map((school) => {
            const schoolPlatforms = formatPlatforms(school.communicationPlatforms);
            return (
              <div key={school.id}>
                <div style={{ fontSize: '14px', fontWeight: '400', color: '#333', marginBottom: '0.25rem' }}>
                  {school.schoolName}
                </div>
                {schoolPlatforms && (
                  <div style={{ fontSize: '13px', fontWeight: '300', color: '#666', marginBottom: '0.25rem' }}>
                    {schoolPlatforms}
                  </div>
                )}
                {school.mailingAddress && (
                  <div style={{ fontSize: '13px', fontWeight: '300', color: '#666', whiteSpace: 'pre-line' }}>
                    {school.mailingAddress}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const partnerPlatforms = formatPlatforms(partner.communicationPlatforms);

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <h3 style={{ color: '#1f2937', marginBottom: '1rem', fontSize: '1.4rem', fontWeight: '400', margin: 0 }}>
        Your Pen Pal School
      </h3>
      <div style={{ marginTop: '1rem' }}>
        <div style={{ fontSize: '14px', fontWeight: '400', color: '#333', marginBottom: '0.25rem' }}>
          {partner.schoolName}
        </div>
        {partnerPlatforms && (
          <div style={{ fontSize: '13px', fontWeight: '300', color: '#666', marginBottom: '0.25rem' }}>
            {partnerPlatforms}
          </div>
        )}
        {partner.mailingAddress && (
          <div style={{ fontSize: '13px', fontWeight: '300', color: '#666', whiteSpace: 'pre-line' }}>
            {partner.mailingAddress}
          </div>
        )}
      </div>
    </div>
  );
}
