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
  onPenpalPreferenceCheckNeeded?: (required: number, current: number) => void;
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
    
    if (isInGroup) {
      const allGroupStudents = schoolData.schoolGroup!.schools.flatMap(school => school.students);
      totalStudentsInGroup = allGroupStudents.length;
      thisSchoolStudentCount = schoolData.students.length;
      
      const formulaRequired = Math.ceil((30 - totalStudentsInGroup) / 2);
      const maxPossible = Math.floor(totalStudentsInGroup * 0.8);
      totalGroupRequired = Math.min(formulaRequired, maxPossible);
      
      currentMultipleAcrossGroup = allGroupStudents.filter(
        (s: any) => s.penpalPreference === 'MULTIPLE'
      ).length;
      
    } else {
      totalStudentsInGroup = schoolData.students.length;
      thisSchoolStudentCount = schoolData.students.length;
      
      const formulaRequired = Math.ceil((30 - totalStudentsInGroup) / 2);
      const maxPossible = Math.floor(totalStudentsInGroup * 0.8);
      totalGroupRequired = Math.min(formulaRequired, maxPossible);
      
      currentMultipleAcrossGroup = schoolData.students.filter(
        (s: any) => s.penpalPreference === 'MULTIPLE'
      ).length;
    }
    
    if (totalGroupRequired > 0) {
      const shortfall = totalGroupRequired - currentMultipleAcrossGroup;
      
      if (shortfall > 0) {
        const thisSchoolRequired = Math.ceil(shortfall * (thisSchoolStudentCount / totalStudentsInGroup));
        
        const thisSchoolCurrentMultiple = schoolData.students.filter(
          (s: any) => s.penpalPreference === 'MULTIPLE'
        ).length;
        
        if (thisSchoolCurrentMultiple < thisSchoolRequired) {
          if (onPenpalPreferenceCheckNeeded) {
            onPenpalPreferenceCheckNeeded(thisSchoolRequired, thisSchoolCurrentMultiple);
          }
          return;
        }
      }
      
      setShowConfirmation(true);
      
    } else {
      setShowConfirmation(true);
    }
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
          <p className="text-school-name" style={{ margin: 0 }}>
            {schoolData.teacherName}
          </p>
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
                href={penPalsAssigned ? `/teacher/pen-pal-list?schoolId=${schoolData.id}` : '#'}
                className="btn"
                onClick={(e) => { if (!penPalsAssigned) e.preventDefault(); }}
                style={{
                  fontSize: '13px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: penPalsAssigned ? 1 : 0.6,
                  cursor: penPalsAssigned ? 'pointer' : 'not-allowed',
                  pointerEvents: penPalsAssigned ? 'auto' : 'none'
                }}
                title={penPalsAssigned ? "View and download pen pal assignments" : "Pen pals not assigned yet"}
              >
                Download Pen Pals
              </Link>

              {!penPalsAssigned ? (
                hasPairingRequested ? (
                  <button 
                    className="btn" 
                    disabled={true}
                    style={{
                      backgroundColor: '#f8f9fa',
                      color: '#999',
                      border: '1px solid #e0e0e0',
                      cursor: 'not-allowed',
                      opacity: 0.6,
                      fontSize: '13px'
                    }}
                    title="Waiting for pen pal assignments"
                  >
                    Pending Pen Pals
                  </button>
                ) : (
                  <button 
                    className="btn" 
                    disabled={isRequestingMatching || !allActiveStudentsComplete || schoolData.students.length === 0}
                    onClick={handleRequestPairingClick}
                    style={{
                      cursor: (isRequestingMatching || !allActiveStudentsComplete || schoolData.students.length === 0) ? 'not-allowed' : 'pointer',
                      opacity: (isRequestingMatching || !allActiveStudentsComplete || schoolData.students.length === 0) ? 0.6 : 1,
                      fontSize: '13px'
                    }}
                    title={
                      schoolData.students.length === 0
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
                    ) : 'Ready to Pair Pen Pals'}
                  </button>
                )
              ) : (
                <button 
                  className="btn" 
                  disabled={true}
                  style={{
                    backgroundColor: '#f8f9fa',
                    color: '#999',
                    border: '1px solid #e0e0e0',
                    cursor: 'not-allowed',
                    opacity: 0.6,
                    fontSize: '13px'
                  }}
                  title="Pen pals already assigned"
                >
                  Ready to Pair Pen Pals
                </button>
              )}
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
