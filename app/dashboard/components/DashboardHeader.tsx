// /app/dashboard/components/DashboardHeader.tsx
"use client";
import { useState, useEffect } from 'react';
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
}

interface DashboardHeaderProps {
  schoolData: SchoolData;
  dashboardToken: string;
  readOnly?: boolean;
  adminBackButton?: boolean;
  allActiveStudentsComplete?: boolean;
  onMatchingRequested?: () => void;
}

export default function DashboardHeader({ 
  schoolData, 
  dashboardToken, 
  readOnly = false, 
  adminBackButton = false,
  allActiveStudentsComplete = false,
  onMatchingRequested 
}: DashboardHeaderProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [isRequestingMatching, setIsRequestingMatching] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [penPalsAssigned, setPenPalsAssigned] = useState(false);
  const [checkingPenPals, setCheckingPenPals] = useState(false);
  
  // Check if school is already matched
  const isMatched = schoolData?.matchedWithSchoolId != null;
  // Remove readyForMatching logic since admin can match schools at will now
  
  // Check for pen pal assignments when school is matched
  useEffect(() => {
    if (isMatched && schoolData?.id) {
      checkPenPalAssignments();
    }
  }, [isMatched, schoolData?.id]);

  const checkPenPalAssignments = async () => {
    setCheckingPenPals(true);
    try {
      const response = await fetch(`/api/download-pairings?schoolId=${schoolData.id}`);
      if (response.ok) {
        const data = await response.json();
        // Check if any students have pen pals assigned
        const hasAssignments = data.pairings && data.pairings.some((student: any) => student.penpalCount > 0);
        setPenPalsAssigned(hasAssignments);
      } else {
        setPenPalsAssigned(false);
      }
    } catch (error) {
      console.error('Error checking pen pal assignments:', error);
      setPenPalsAssigned(false);
    } finally {
      setCheckingPenPals(false);
    }
  };
  
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
      
      // Reset back to normal after 2 seconds
      setTimeout(() => {
        setCopyStatus('idle');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback - could show an error state if needed
    }
  };

  const handleRequestPairingClick = () => {
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
      
      if (onMatchingRequested) {
        onMatchingRequested();
      }
      
    } catch (err: any) {
      alert('Error requesting pairing: ' + err.message);
    } finally {
      setIsRequestingMatching(false);
    }
  };

  const handleCancelPairing = () => {
    setShowConfirmation(false);
  };

  const handleDownloadPenPals = async () => {
    if (!penPalsAssigned) return;
    
    try {
      const response = await fetch(`/api/download-pairings?schoolId=${schoolData.id}`);
      if (response.ok) {
        const data = await response.json();
        
        // Create and download the file
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${schoolData.schoolName}_pen_pal_assignments.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to download pen pal assignments');
      }
    } catch (error) {
      console.error('Error downloading pen pals:', error);
      alert('Error downloading pen pal assignments. Please try again.');
    }
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
            Teacher Dashboard - {schoolData.teacherName}
          </p>
        </div>
        
        {/* Show admin back button in admin view */}
        {adminBackButton && (
          <div>
            <Link 
              href="/admin/matching" 
              className="btn btn-primary"
            >
              ← Back to Admin Dashboard
            </Link>
          </div>
        )}
        
        {/* Show all action buttons in teacher view */}
        {!readOnly && !adminBackButton && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '320px' }}>
            
            {/* Top row - Copy Link and Add Student */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button 
                onClick={handleCopyLink}
                className="btn btn-primary"
                style={{ 
                  backgroundColor: copyStatus === 'copied' ? '#28a745' : 'white',
                  color: copyStatus === 'copied' ? 'white' : '#555',
                  border: copyStatus === 'copied' ? '1px solid #28a745' : '1px solid #ddd',
                  transition: 'all 0.3s ease',
                  fontSize: '13px'
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
                href={`/register-student?token=${schoolData.dashboardToken}`}
                className="btn btn-primary"
                style={{
                  fontSize: '13px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Add new student"
              >
                Add New Student
              </Link>
            </div>

            {/* Bottom row - Download and Ready to Pair Pen Pals/Download Pen Pals */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button 
                className="btn btn-primary"
                disabled={schoolData.students.length === 0}
                onClick={() => {
                  if (schoolData.students.length > 0 && schoolData?.dashboardToken) {
                    window.open(`/dashboard/print?token=${schoolData.dashboardToken}`, '_blank');
                  }
                }}
                style={{
                  opacity: schoolData.students.length === 0 ? 0.6 : 1,
                  cursor: schoolData.students.length === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '13px'
                }}
                title={schoolData.students.length === 0 ? "Need students first" : "Download student information"}
              >
                Download Student Info
              </button>

              {/* Conditional button: Ready to Pair Pen Pals OR Download Pen Pals */}
              {!isMatched ? (
                // Ready to Pair Pen Pals Button - show when not matched
                <button 
                  className="btn btn-primary" 
                  disabled={isRequestingMatching || !allActiveStudentsComplete}
                  onClick={handleRequestPairingClick}
                  style={{
                    cursor: (isRequestingMatching || !allActiveStudentsComplete) ? 'not-allowed' : 'pointer',
                    opacity: (isRequestingMatching || !allActiveStudentsComplete) ? 0.6 : 1,
                    fontSize: '13px'
                  }}
                  title={
                    !allActiveStudentsComplete
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
              ) : (
                // Download Pen Pals Button - show when matched
                <button 
                  className="btn btn-primary" 
                  disabled={!penPalsAssigned || checkingPenPals}
                  onClick={handleDownloadPenPals}
                  style={{
                    backgroundColor: penPalsAssigned ? 'white' : '#f8f9fa',
                    color: penPalsAssigned ? '#555' : '#999',
                    border: penPalsAssigned ? '1px solid #ddd' : '1px solid #e0e0e0',
                    cursor: penPalsAssigned ? 'pointer' : 'not-allowed',
                    opacity: penPalsAssigned ? 1 : 0.6,
                    fontSize: '13px'
                  }}
                  title={
                    checkingPenPals 
                      ? "Checking pen pal assignments..." 
                      : penPalsAssigned 
                      ? "Download pen pal assignments" 
                      : "Pen pals not yet assigned"
                  }
                >
                  {checkingPenPals ? (
                    <>
                      <span className="loading"></span>
                      <span style={{ marginLeft: '0.25rem' }}>Checking...</span>
                    </>
                  ) : 'Download Pen Pals'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
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
                className="btn btn-primary"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmPairing}
                className="btn btn-success"
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
