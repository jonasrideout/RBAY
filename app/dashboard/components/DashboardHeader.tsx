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
  
  // Check if school is already matched or ready for matching
  const isMatched = schoolData?.matchedWithSchoolId != null;
  const readyForMatching = schoolData?.status === 'READY';
  
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

  const handleRequestMatchingClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmMatching = async () => {
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
        throw new Error(data.error || 'Failed to request matching');
      }
      
      if (onMatchingRequested) {
        onMatchingRequested();
      }
      
    } catch (err: any) {
      alert('Error requesting matching: ' + err.message);
    } finally {
      setIsRequestingMatching(false);
    }
  };

  const handleCancelMatching = () => {
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
        
        {/* Show copy button and request matching in teacher view */}
        {!readOnly && !adminBackButton && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '280px' }}>
            <h3 style={{ 
              marginBottom: '0', 
              textAlign: 'right', 
              fontSize: '14px',
              fontWeight: '400',
              color: '#555',
              marginTop: '0' 
            }}>
              Share This Link With Your Students
            </h3>
            
            <button 
              onClick={handleCopyLink}
              className="btn btn-primary"
              style={{ 
                backgroundColor: copyStatus === 'copied' ? '#28a745' : 'white',
                color: copyStatus === 'copied' ? 'white' : '#555',
                border: copyStatus === 'copied' ? '1px solid #28a745' : '1px solid #ddd',
                transition: 'all 0.3s ease'
              }}
            >
              {copyStatus === 'copied' ? (
                <>
                  <span style={{ marginRight: '0.5rem' }}>✓</span>
                  Copied!
                </>
              ) : (
                'Copy Student Registration Link'
              )}
            </button>

            {/* Request Matching Button - show when not already matched, gray out when students incomplete */}
            {!isMatched && (
              <button 
                className="btn btn-primary" 
                disabled={isRequestingMatching || readyForMatching || !allActiveStudentsComplete}
                onClick={handleRequestMatchingClick}
                style={{
                  backgroundColor: readyForMatching ? '#28a745' : 'white',
                  color: readyForMatching ? 'white' : '#555',
                  border: readyForMatching ? '1px solid #28a745' : '1px solid #ddd',
                  cursor: (isRequestingMatching || readyForMatching || !allActiveStudentsComplete) ? 'not-allowed' : 'pointer',
                  opacity: (isRequestingMatching || readyForMatching || !allActiveStudentsComplete) ? 0.6 : 1
                }}
                title={
                  readyForMatching 
                    ? "Matching has been requested" 
                    : !allActiveStudentsComplete
                    ? "Complete all student profiles first"
                    : "Request matching for your students"
                }
              >
                {readyForMatching ? 'Matching Requested' : (isRequestingMatching ? (
                  <>
                    <span className="loading"></span>
                    <span style={{ marginLeft: '0.5rem' }}>Requesting...</span>
                  </>
                ) : 'Request Matching')}
              </button>
            )}
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
              Confirm Matching Request
            </h3>
            <p style={{ color: '#6c757d', marginBottom: '2rem', lineHeight: '1.5' }}>
              Are you ready to request matching for your students? This will submit your class roster for the matching process.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={handleCancelMatching}
                className="btn btn-primary"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmMatching}
                className="btn btn-success"
              >
                Yes, Request Matching
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
