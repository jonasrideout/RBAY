// /app/dashboard/components/DashboardHeader.tsx
"use client";
import { useState } from 'react';
import Link from 'next/link';

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
  communicationPlatforms?: any;
  matchedSchool?: {
    id: string;
    schoolName: string;
    teacherName: string;
    teacherEmail: string;
    schoolCity?: string;
    schoolState?: string;
    expectedClassSize: number;
    actualStudentCount: number;
    region: string;
    isGroup?: boolean;
    schools?: Array<{
      id: string;
      schoolName: string;
      teacherName: string;
      students: any[];
    }>;
  };
  studentStats?: {
    expected: number;
    registered: number;
    ready: number;
    studentsWithPenpals: number;
    hasPenpalAssignments: boolean;
  };
  schoolGroup?: {
    id: string;
    name: string;
    matchedWithGroupId?: string;
    schools: Array<{
      id: string;
      schoolName: string;
      teacherName: string;
      students: any[];
    }>;
  };
}

interface DashboardHeaderProps {
  schoolData: SchoolData;
  dashboardToken: string;
  readOnly?: boolean;
  adminBackButton?: boolean;
  allActiveStudentsComplete?: boolean;
  onMatchingRequested?: () => void;
  onPenpalPreferenceCheckNeeded?: (required: number, current: number, matchedSchoolName: string) => void;
  isProfileIncomplete?: boolean;
}

export default function DashboardHeader({ 
  schoolData, 
  dashboardToken, 
  readOnly = false, 
  adminBackButton = false,
  allActiveStudentsComplete = false,
  onMatchingRequested,
  onPenpalPreferenceCheckNeeded,
  isProfileIncomplete = false 
}: DashboardHeaderProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [isRequestingMatching, setIsRequestingMatching] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Check if school has requested pairing (status is READY)
  const hasPairingRequested = schoolData?.status === 'READY';
  
  // Get pen pal assignment status from school data
  const penPalsAssigned = schoolData?.studentStats?.hasPenpalAssignments || false;
  
  // Format communication platforms for display
  const formatCommunicationPlatforms = () => {
    if (!schoolData.communicationPlatforms || !Array.isArray(schoolData.communicationPlatforms) || schoolData.communicationPlatforms.length === 0) {
      return null;
    }
    
    return schoolData.communicationPlatforms.join(' | ');
  };
  
  const communicationPlatformsDisplay = formatCommunicationPlatforms();
  
  const generateStudentLink = () => {
    if (typeof window !== 'undefined' && schoolData.dashboardToken) {
      return `${window.location.origin}/register-student?token=${schoolData.dashboardToken}`;
    }
    return '';
  };
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generateStudentLink());
      setCopyStatus('copied');
      
      setTimeout(() => {
        setCopyStatus('idle');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleRequestPairingClick = async () => {
    const isInGroup = !!schoolData.schoolGroup;
    
    let totalStudentsInGroup: number;
    let thisSchoolStudentCount: number;
    let totalGroupRequired: number;
    let currentMultipleAcrossGroup: number;
    
    // Determine the target class size to match against
    let targetClassSize = 30; // Default to 30 if not matched
    let matchedSchoolName = 'the matched school';
    
    if (schoolData.matchedWithSchoolId && schoolData.matchedSchool) {
      // School is matched - use actual matched school/group size
      targetClassSize = schoolData.matchedSchool.actualStudentCount;
      
      // Get the name - handle both individual schools and groups
      if (schoolData.matchedSchool.isGroup && schoolData.matchedSchool.schools) {
        // For groups, create a combined name from all schools
        matchedSchoolName = schoolData.matchedSchool.schools
          .map(s => s.schoolName)
          .join(' + ');
      } else {
        matchedSchoolName = schoolData.matchedSchool.schoolName;
      }
    }
    
    if (isInGroup) {
      const allGroupStudents = schoolData.schoolGroup!.schools.flatMap(school => school.students);
      totalStudentsInGroup = allGroupStudents.length;
      thisSchoolStudentCount = schoolData.students.length;
      
      // Required: exact number to ensure no one gets more than 2 pen pals
      totalGroupRequired = Math.abs(targetClassSize - totalStudentsInGroup);
      
      currentMultipleAcrossGroup = allGroupStudents.filter(
        (s: any) => s.penpalPreference === 'MULTIPLE'
      ).length;
      
    } else {
      totalStudentsInGroup = schoolData.students.length;
      thisSchoolStudentCount = schoolData.students.length;
      
      // Required: exact number to ensure no one gets more than 2 pen pals
      totalGroupRequired = Math.abs(targetClassSize - totalStudentsInGroup);
      
      currentMultipleAcrossGroup = schoolData.students.filter(
        (s: any) => s.penpalPreference === 'MULTIPLE'
      ).length;
    }
    
    // Calculate the requirement for this specific school
    let thisSchoolRequired: number;
    
    if (isInGroup) {
      // For grouped schools: calculate proportional share
      thisSchoolRequired = Math.ceil(totalGroupRequired * (thisSchoolStudentCount / totalStudentsInGroup));
    } else {
      // For standalone schools: use the total requirement
      thisSchoolRequired = totalGroupRequired;
    }
    
    // Check if this school meets its requirement
    const thisSchoolCurrentMultiple = schoolData.students.filter(
      (s: any) => s.penpalPreference === 'MULTIPLE'
    ).length;
    
    if (thisSchoolCurrentMultiple < thisSchoolRequired) {
      if (onPenpalPreferenceCheckNeeded) {
        onPenpalPreferenceCheckNeeded(thisSchoolRequired, thisSchoolCurrentMultiple, matchedSchoolName);
      }
      return;
    }
    
    setShowConfirmation(true);
  };

  const handleConfirmPairing = async () => {
    setShowConfirmation(false);
    setIsRequestingMatching(true);
    
    try {
      const response = await fetch('/api/schools/request-matching', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          teacherEmail: schoolData.teacherEmail,
          dashboardToken: schoolData.dashboardToken 
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to request pairing');
      }

      console.log('Request pairing successful:', data);
      
      if (onMatchingRequested) {
        onMatchingRequested();
      }
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (err: any) {
      console.error('Error requesting pairing:', err);
      alert('Error requesting pairing: ' + err.message);
    } finally {
      setIsRequestingMatching(false);
    }
  };

  const handleCancelPairing = () => {
    setShowConfirmation(false);
  };
  
  return (
    <>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: '1.5rem' 
      }}>
        <div>
          <h1 className="text-school-name" style={{ marginBottom: '0.5rem', fontSize: '1.8rem' }}>
            {schoolData.schoolName}
          </h1>
          <p className="text-school-name" style={{ margin: 0, marginBottom: '0.25rem' }}>
            {schoolData.teacherName}
          </p>
          {communicationPlatformsDisplay && (
            <p style={{ 
              margin: 0, 
              fontSize: '11px', 
              fontWeight: '300', 
              color: '#666' 
            }}>
              {communicationPlatformsDisplay}
            </p>
          )}
        </div>
        
        {adminBackButton && (
          <div>
            <Link 
              href="/admin/matching" 
              className="btn"
            >
              ← Back to Admin Dashboard
            </Link>
          </div>
        )}
        
        {!readOnly && !adminBackButton && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '440px' }}>
            
            {/* Top row - Copy Link and Add Student */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button 
                onClick={handleCopyLink}
                className="btn"
                disabled={isProfileIncomplete || penPalsAssigned}
                style={{ 
                  backgroundColor: copyStatus === 'copied' ? '#28a745' : 'white',
                  color: copyStatus === 'copied' ? 'white' : '#555',
                  border: copyStatus === 'copied' ? '1px solid #28a745' : '1px solid #ddd',
                  transition: 'all 0.3s ease',
                  fontSize: '13px',
                  opacity: (isProfileIncomplete || penPalsAssigned) ? 0.6 : 1,
                  cursor: (isProfileIncomplete || penPalsAssigned) ? 'not-allowed' : 'pointer'
                }}
              >
                {copyStatus === 'copied' ? (
                  <>
                    <span style={{ marginRight: '0.25rem' }}>✓</span>
                    Copied!
                  </>
                ) : (
                  'Copy Student Link'
                )}
              </button>

              <Link 
                href={(isProfileIncomplete || penPalsAssigned) ? '#' : `/register-student?token=${schoolData.dashboardToken}`}
                className="btn"
                onClick={(e) => { if (isProfileIncomplete || penPalsAssigned) e.preventDefault(); }}
                style={{
                  fontSize: '13px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: (isProfileIncomplete || penPalsAssigned) ? 0.6 : 1,
                  cursor: (isProfileIncomplete || penPalsAssigned) ? 'not-allowed' : 'pointer',
                  pointerEvents: (isProfileIncomplete || penPalsAssigned) ? 'none' : 'auto'
                }}
                title={penPalsAssigned ? "Cannot add students after pen pals are assigned" : "Add new student"}
              >
                Add New Student
              </Link>
            </div>

            {/* Bottom row - Download Pen Pals and Ready to Pair Pen Pals */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <Link
                href={(isProfileIncomplete || !penPalsAssigned) ? '#' : `/teacher/pen-pal-list?schoolId=${schoolData.id}`}
                className="btn"
                onClick={(e) => { if (isProfileIncomplete || !penPalsAssigned) e.preventDefault(); }}
                style={{
                  fontSize: '13px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: (isProfileIncomplete || !penPalsAssigned) ? 0.6 : 1,
                  cursor: (isProfileIncomplete || !penPalsAssigned) ? 'not-allowed' : 'pointer',
                  pointerEvents: (isProfileIncomplete || !penPalsAssigned) ? 'none' : 'auto'
                }}
                title={isProfileIncomplete ? "Complete your profile first" : penPalsAssigned ? "View and download pen pal assignments" : "Pen pals not assigned yet"}
              >
                Download Pen Pals
              </Link>

              <button 
                className="btn" 
                disabled={isProfileIncomplete || penPalsAssigned || hasPairingRequested || isRequestingMatching || !allActiveStudentsComplete || schoolData.students.length === 0 || (!schoolData.matchedWithSchoolId && !schoolData.schoolGroup?.matchedWithGroupId)}
                onClick={handleRequestPairingClick}
                style={{
                  cursor: (isProfileIncomplete || penPalsAssigned || hasPairingRequested || isRequestingMatching || !allActiveStudentsComplete || schoolData.students.length === 0 || (!schoolData.matchedWithSchoolId && !schoolData.schoolGroup?.matchedWithGroupId)) ? 'not-allowed' : 'pointer',
                  opacity: (isProfileIncomplete || penPalsAssigned || hasPairingRequested || isRequestingMatching || !allActiveStudentsComplete || schoolData.students.length === 0 || (!schoolData.matchedWithSchoolId && !schoolData.schoolGroup?.matchedWithGroupId)) ? 0.6 : 1,
                  fontSize: '13px'
                }}
                title={
                  isProfileIncomplete
                    ? "Complete your profile first"
                    : penPalsAssigned
                    ? "Pen pals already assigned"
                    : hasPairingRequested
                    ? "Waiting for pen pal assignments"
                    : (!schoolData.matchedWithSchoolId && !schoolData.schoolGroup?.matchedWithGroupId)
                    ? "Must be matched with another school first"
                    : schoolData.students.length === 0
                    ? "Need students first"
                    : !allActiveStudentsComplete
                    ? "Complete all student profiles first"
                    : "Indicate readiness to pair pen pals"
                }
              >
                {isRequestingMatching ? (
                  <>
                    <span className="loading"></span>
                    <span style={{ marginLeft: '0.25rem' }}>Requesting...</span>
                  </>
                ) : hasPairingRequested && !penPalsAssigned ? (
                  'Pending Pen Pals'
                ) : (
                  'Ready to Pair Pen Pals'
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {showConfirmation && (
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
            maxWidth: '500px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}>
            <h3 style={{ color: '#495057', marginBottom: '1rem' }}>
              Ready to Pair Pen Pals?
            </h3>
            <p style={{ color: '#6c757d', marginBottom: '2rem', lineHeight: '1.5' }}>
              Are you ready to indicate that your students are ready to be paired with pen pals? This will mark your class as ready for the pairing process.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={handleCancelPairing}
                className="btn"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmPairing}
                className="btn"
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  borderColor: '#28a745'
                }}
              >
                Yes, Ready to Pair
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
