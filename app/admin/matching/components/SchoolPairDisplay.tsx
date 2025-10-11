"use client";

import { useState } from 'react';
import UnmatchConfirmDialog from './UnmatchConfirmDialog';
import { MatchedPair, isSchool, isGroup, School, SchoolGroup } from '../types';

interface SchoolPairDisplayProps {
  pair: MatchedPair;
  showAssignButton?: boolean;
  showPenPalListButtons?: boolean;
  onAssignPenPals?: () => void;
  onViewPenPals?: (schoolId: string) => void;
  onUnmatch?: () => void;
}

export default function SchoolPairDisplay({ 
  pair, 
  showAssignButton = false,
  showPenPalListButtons = false,
  onAssignPenPals,
  onViewPenPals,
  onUnmatch
}: SchoolPairDisplayProps) {
  const [copyButtonText1, setCopyButtonText1] = useState('Copy URL');
  const [copyButtonText2, setCopyButtonText2] = useState('Copy URL');
  const [emailCopyText1, setEmailCopyText1] = useState('✉');
  const [emailCopyText2, setEmailCopyText2] = useState('✉');
  const [showUnmatchModal, setShowUnmatchModal] = useState(false);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [emailsSent, setEmailsSent] = useState(false);

  const getDashboardUrl = (school: School) => {
    const adminDashboardPath = `/dashboard?token=${school.dashboardToken}`;
    if (typeof window !== 'undefined') {
      const currentOrigin = window.location.origin;
      return `${currentOrigin}${adminDashboardPath}`;
    }
    return adminDashboardPath;
  };

  const openDashboard = (school: School) => {
    const url = getDashboardUrl(school);
    window.open(url, '_blank');
  };

  const copyDashboardUrl = async (school: School, isFirst: boolean) => {
    const url = getDashboardUrl(school);
    try {
      await navigator.clipboard.writeText(url);
      if (isFirst) {
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

  const copyEmailAddress = async (email: string, isFirst: boolean) => {
    try {
      await navigator.clipboard.writeText(email);
      if (isFirst) {
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

  const handleUnmatchClick = () => {
    if (pair.hasStudentPairings) {
      alert('Cannot unmatch after pen pals have been assigned');
      return;
    }
    setShowUnmatchModal(true);
  };

  const handleConfirmUnmatch = () => {
    setShowUnmatchModal(false);
    if (onUnmatch) {
      onUnmatch();
    }
  };

  const handleSendEmails = async () => {
    setSendingEmails(true);
    
    try {
      const response = await fetch('/api/admin/send-penpal-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unit1Id: pair.unit1.id,
          unit2Id: pair.unit2.id,
          matchType: pair.matchType
        })
      });

      const data = await response.json();

      if (data.success) {
        setEmailsSent(true);
        alert(`Pen pal assignment emails sent successfully to all teachers!`);
      } else {
        alert(`Error sending emails: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      alert('Failed to send pen pal assignment emails');
    } finally {
      setSendingEmails(false);
    }
  };

  // Check if emails have already been sent (from database)
  const checkEmailsSent = () => {
    const schools: any[] = [];
    
    if (isSchool(pair.unit1)) {
      schools.push(pair.unit1);
    } else {
      schools.push(...pair.unit1.schools);
    }
    
    if (isSchool(pair.unit2)) {
      schools.push(pair.unit2);
    } else {
      schools.push(...pair.unit2.schools);
    }
    
    // Check if ANY school has notificationEmailsSent = true
    return schools.some((school: any) => school.notificationEmailsSent === true);
  };

  const alreadySent = checkEmailsSent();

  const getUnitName = (unit: School | SchoolGroup): string => {
    return isSchool(unit) ? unit.schoolName : unit.name;
  };

  const getUnitRegion = (unit: School | SchoolGroup): string => {
    return isSchool(unit) ? unit.region : 'Multiple';
  };

  const renderCompactSchoolCard = (school: School, isFirst: boolean) => {
    const copyButtonText = isFirst ? copyButtonText1 : copyButtonText2;
    const emailCopyText = isFirst ? emailCopyText1 : emailCopyText2;

    return (
      <div style={{
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '6px',
        padding: '12px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontWeight: '300'
      }}>
        
        {/* Header with School Name + Buttons on same row */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          
          {/* Left side: School info */}
          <div style={{ flex: '1' }}>
            <h4 style={{
              margin: '0 0 2px 0',
              fontSize: '16px',
              fontWeight: '300',
              color: '#111',
              lineHeight: '1.2'
            }}>
              {school.schoolName}
            </h4>
            
            <div style={{
              fontSize: '12px',
              fontWeight: '300',
              color: '#555'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{school.teacherName}</span>
                <button
                  onClick={() => copyEmailAddress(school.teacherEmail, isFirst)}
                  className="btn-icon"
                  style={{
                    fontSize: '16px',
                    color: '#666',
                    fontWeight: '300'
                  }}
                  title={`Copy email: ${school.teacherEmail}`}
                >
                  {emailCopyText}
                </button>
              </div>
              {school.communicationPlatforms && Array.isArray(school.communicationPlatforms) && school.communicationPlatforms.length > 0 && (
                <div style={{ color: '#888', fontSize: '11px', marginTop: '2px' }}>
                  {school.communicationPlatforms.map(platform => {
                    if (platform.startsWith('Other:')) return platform.replace('Other:', '').trim();
                    return platform === 'Google Meet' ? 'Meet' : platform === 'Microsoft Teams' ? 'Teams' : platform;
                  }).join(' | ')}
                </div>
              )}
              <div style={{ color: '#888', fontSize: '11px' }}>
                Grades {school.gradeLevel}
              </div>
            </div>
          </div>

          {/* Right side: Buttons stacked vertically */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '3px'
          }}>
            <button
              onClick={() => openDashboard(school)}
              style={{
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '3px',
                color: '#555',
                fontSize: '11px',
                fontWeight: '400',
                cursor: 'pointer',
                padding: '4px 8px',
                textAlign: 'center',
                minWidth: '90px'
              }}
              title="Open school dashboard in new tab"
            >
              Open Dashboard
            </button>

            <button
              onClick={() => copyDashboardUrl(school, isFirst)}
              style={{
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '3px',
                color: '#555',
                fontSize: '11px',
                fontWeight: '400',
                cursor: 'pointer',
                padding: '4px 8px',
                textAlign: 'center',
                minWidth: '90px'
              }}
              title="Copy school dashboard URL to clipboard"
            >
              {copyButtonText === 'Copy URL' ? 'Copy URL' : 'Copied'}
            </button>

            {pair.hasStudentPairings && (
              <button
                onClick={() => {
                  const penPalListUrl = `/admin/pen-pal-list?schoolId=${school.id}`;
                  window.open(penPalListUrl, '_blank');
                }}
                style={{
                  background: 'white',
                  border: '1px solid #28a745',
                  borderRadius: '3px',
                  color: '#28a745',
                  fontSize: '11px',
                  fontWeight: '400',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  textAlign: 'center',
                  minWidth: '90px'
                }}
                title="Download pen pal assignments for this school"
              >
                Download List
              </button>
            )}
          </div>
        </div>

        {/* Data in single horizontal row */}
        <div style={{
          display: 'flex',
          gap: '16px',
          fontSize: '11px',
          fontWeight: '300',
          marginBottom: '6px'
        }}>
          <div>
            <span style={{ color: '#999', fontSize: '10px' }}>Region </span>
            <span style={{ color: '#333', fontWeight: '300' }}>{school.region.toUpperCase()}</span>
          </div>
          
          <div>
            <span style={{ color: '#999', fontSize: '10px' }}>Start </span>
            <span style={{ color: '#333', fontWeight: '300' }}>{school.startMonth.toUpperCase()}</span>
          </div>
          
          <div>
            <span style={{ color: '#999', fontSize: '10px' }}>Ready </span>
            <span style={{ color: '#333', fontWeight: '300' }}>{school.studentCounts?.ready || 0}</span>
          </div>
        </div>

        {/* Status on separate row */}
        <div style={{
          fontSize: '12px',
          fontWeight: '300',
          marginBottom: '8px'
        }}>
          <span style={{ color: '#999', fontSize: '11px' }}>Status </span>
          <span style={{ color: '#333', fontWeight: '300' }}>
            {pair.hasStudentPairings ? 'MATCHED + PAIRED' : school.status}
          </span>
        </div>

        {/* Special Considerations - if present */}
        {school.specialConsiderations && (
          <div style={{
            color: '#777',
            fontSize: '10px',
            fontStyle: 'italic',
            fontWeight: '300',
            marginTop: '6px',
            paddingTop: '6px',
            borderTop: '1px solid #f0f0f0',
            lineHeight: '1.3'
          }}>
            {school.specialConsiderations}
          </div>
        )}
      </div>
    );
  };

  const renderCompactGroupCard = (group: SchoolGroup) => {
    return (
      <div style={{
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '6px',
        padding: '12px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontWeight: '300'
      }}>
        
        {/* Header with Group Name */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px'
        }}>
          <h4 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '300',
            color: '#111',
            lineHeight: '1.2'
          }}>
            {group.name}
          </h4>
          <div style={{
            display: 'inline-block',
            padding: '2px 6px',
            backgroundColor: '#e8f5e9',
            border: '1px solid #4caf50',
            borderRadius: '3px',
            fontSize: '10px',
            color: '#2e7d32',
            fontWeight: 400
          }}>
            GROUP
          </div>
        </div>

        {/* Teachers list - one per line with download button */}
        {group.schools.map((school, idx) => (
          <div key={school.id} style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '6px',
            fontSize: '12px',
            fontWeight: '300',
            color: '#555',
            marginBottom: idx < group.schools.length - 1 ? '12px' : '16px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{school.schoolName} | {school.teacherName}</span>
                <button
                  onClick={() => copyEmailAddress(school.teacherEmail, idx === 0)}
                  className="btn-icon"
                  style={{
                    fontSize: '16px',
                    color: '#666',
                    fontWeight: '300'
                  }}
                  title={`Copy email: ${school.teacherEmail}`}
                >
                  ✉
                </button>
              </div>
              {school.communicationPlatforms && Array.isArray(school.communicationPlatforms) && school.communicationPlatforms.length > 0 && (
                <div style={{ color: '#888', fontSize: '11px', marginTop: '2px' }}>
                  {school.communicationPlatforms.map(platform => {
                    if (platform.startsWith('Other:')) return platform.replace('Other:', '').trim();
                    return platform === 'Google Meet' ? 'Meet' : platform === 'Microsoft Teams' ? 'Teams' : platform;
                  }).join(' | ')}
                </div>
              )}
              <div style={{ color: '#888', fontSize: '11px', marginTop: '2px' }}>
                Grades {school.gradeLevel}
              </div>
            </div>
            
            {pair.hasStudentPairings && (
              <button
                onClick={() => {
                  const penPalListUrl = `/admin/pen-pal-list?schoolId=${school.id}`;
                  window.open(penPalListUrl, '_blank');
                }}
                style={{
                  background: 'white',
                  border: '1px solid #28a745',
                  borderRadius: '3px',
                  color: '#28a745',
                  fontSize: '11px',
                  fontWeight: '400',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  textAlign: 'center',
                  minWidth: '90px'
                }}
                title="Download pen pal assignments for this school"
              >
                Download List
              </button>
            )}
          </div>
        ))}

        {/* Data in single horizontal row */}
        <div style={{
          display: 'flex',
          gap: '16px',
          fontSize: '11px',
          fontWeight: '300',
          marginBottom: '6px'
        }}>
          <div>
            <span style={{ color: '#999', fontSize: '10px' }}>Region </span>
            <span style={{ color: '#333', fontWeight: '300' }}>{group.schools[0]?.region.toUpperCase() || 'N/A'}</span>
          </div>
          
          <div>
            <span style={{ color: '#999', fontSize: '10px' }}>Start </span>
            <span style={{ color: '#333', fontWeight: '300' }}>{group.schools[0]?.startMonth.toUpperCase() || 'N/A'}</span>
          </div>
          
          <div>
            <span style={{ color: '#999', fontSize: '10px' }}>Ready </span>
            <span style={{ color: '#333', fontWeight: '300' }}>{group.studentCounts.ready}</span>
          </div>
        </div>

        {/* Status on separate row */}
        <div style={{
          fontSize: '11px',
          fontWeight: '300',
          marginBottom: '8px'
        }}>
          <span style={{ color: '#999', fontSize: '10px' }}>Status </span>
          <span style={{ color: '#333', fontWeight: '300' }}>
            {pair.hasStudentPairings ? 'MATCHED + PAIRED' : 
             group.schools.every(s => s.status === 'READY') ? 'READY' : 'COLLECTING'}
          </span>
        </div>

        {/* Special considerations below */}
        {group.schools.filter(s => s.specialConsiderations).map(school => (
          <div key={school.id} style={{
            color: '#777',
            fontSize: '10px',
            fontStyle: 'italic',
            fontWeight: '300',
            marginTop: '6px',
            paddingTop: '6px',
            borderTop: '1px solid #f0f0f0',
            lineHeight: '1.3'
          }}>
            <strong>{school.schoolName}:</strong> {school.specialConsiderations}
          </div>
        ))}
      </div>
    );
  };

  const renderLinkIcon = () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '20px'
    }}>
      <button
        onClick={handleUnmatchClick}
        disabled={pair.hasStudentPairings}
        style={{
          background: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
          cursor: pair.hasStudentPairings ? 'not-allowed' : 'pointer',
          opacity: pair.hasStudentPairings ? 0.3 : 1,
          padding: 0
        }}
        title={pair.hasStudentPairings ? 'Cannot unmatch after pen pals assigned' : 'Click to unmatch'}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      </button>
    </div>
  );

  return (
    <>
      <div style={{
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        borderLeft: '3px solid #28a745'
      }}>

        {/* Pair Container */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 20px 1fr',
          gap: '12px',
          alignItems: 'start'
        }}>
          
          {/* Unit 1 */}
          {isSchool(pair.unit1) ? 
            renderCompactSchoolCard(pair.unit1, true) : 
            renderCompactGroupCard(pair.unit1)
          }
          
          {/* Link Icon */}
          {renderLinkIcon()}
          
          {/* Unit 2 */}
          {isSchool(pair.unit2) ? 
            renderCompactSchoolCard(pair.unit2, false) : 
            renderCompactGroupCard(pair.unit2)
          }
          
        </div>

        {/* Action Buttons Row */}
        {(showAssignButton || pair.hasStudentPairings) && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #f0f0f0'
          }}>
            
            {showAssignButton && onAssignPenPals && !pair.hasStudentPairings && (
              <button
                onClick={onAssignPenPals}
                className="btn btn-primary"
                style={{ minWidth: '140px', fontSize: '12px' }}
              >
                Assign Pen Pals
              </button>
            )}

            {pair.hasStudentPairings && (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#28a745',
                  fontWeight: '500',
                  fontSize: '12px'
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  Pen Pals Assigned
                </div>

                <button
                  onClick={handleSendEmails}
                  disabled={sendingEmails || emailsSent || alreadySent}
                  style={{
                    background: (emailsSent || alreadySent) ? '#28a745' : 'white',
                    border: (emailsSent || alreadySent) ? '1px solid #28a745' : '1px solid #2c5aa0',
                    borderRadius: '3px',
                    color: (emailsSent || alreadySent) ? 'white' : '#2c5aa0',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: (sendingEmails || emailsSent || alreadySent) ? 'not-allowed' : 'pointer',
                    padding: '8px 16px',
                    textAlign: 'center',
                    minWidth: '180px',
                    opacity: (sendingEmails || emailsSent || alreadySent) ? 0.8 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {sendingEmails ? (
                    <>
                      <span className="loading" style={{ width: '12px', height: '12px', borderWidth: '2px' }} />
                      Sending...
                    </>
                  ) : (emailsSent || alreadySent) ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      Emails Sent
                    </>
                  ) : (
                    'Send Pen Pal Assignments'
                  )}
                </button>
              </>
            )}
            
          </div>
        )}

      </div>

      {showUnmatchModal && (
        <UnmatchConfirmDialog
          school1Name={getUnitName(pair.unit1)}
          school2Name={getUnitName(pair.unit2)}
          school1Region={getUnitRegion(pair.unit1)}
          school2Region={getUnitRegion(pair.unit2)}
          onConfirm={handleConfirmUnmatch}
          onCancel={() => setShowUnmatchModal(false)}
        />
      )}
    </>
  );
}
