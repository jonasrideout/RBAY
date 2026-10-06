"use client";
import { School, SchoolGroup, isSchool } from '../types';

interface ConfirmationDialogProps {
  pinnedSchool?: School | null;
  selectedMatch?: School | null;
  pinnedGroup?: SchoolGroup | null;
  selectedGroup?: SchoolGroup | null;
  showWarning: boolean;
  isMatched?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onAssignPenPals?: () => void;
  onClose?: () => void;
}

export default function ConfirmationDialog({
  pinnedSchool,
  selectedMatch,
  pinnedGroup,
  selectedGroup,
  showWarning,
  isMatched = false,
  onConfirm,
  onCancel,
  onAssignPenPals,
  onClose
}: ConfirmationDialogProps) {
  // Determine which units we're working with
  const unit1 = pinnedSchool || pinnedGroup;
  const unit2 = selectedMatch || selectedGroup;

  if (!unit1 || !unit2) return null;

 // Check if both units are ready for pen pal assignment
// For groups, ALL schools in the group must be READY
const isUnit1Ready = pinnedSchool 
  ? pinnedSchool.status === 'READY' 
  : pinnedGroup 
    ? pinnedGroup.schools.every(school => school.status === 'READY')
    : false;

const isUnit2Ready = selectedMatch 
  ? selectedMatch.status === 'READY' 
  : selectedGroup
    ? selectedGroup.schools.every(school => school.status === 'READY')
    : false;

const bothUnitsReady = isUnit1Ready && isUnit2Ready;
const canAssignPenPals = isMatched && bothUnitsReady;
  

  // Get display info for each unit
 // Get display info for each unit
const getUnitInfo = (school?: School | null, group?: SchoolGroup | null) => {
  if (school) {
    return {
      name: school.schoolName,
      type: 'School',
      details: `${school.region} | ${school.studentCounts?.ready || 0} students | Starts ${school.startMonth}`,
      status: school.status,
      isReady: school.status === 'READY'
    };
  } else if (group) {
    // For groups, check if ALL schools are READY
    const allSchoolsReady = group.schools.every(school => school.status === 'READY');
    return {
      name: group.name,
      type: 'Group',
      details: `${group.schools.length} schools | ${group.studentCounts.total} total students`,
      status: allSchoolsReady ? 'READY' : 'COLLECTING',
      isReady: allSchoolsReady
    };
  }
  return null;
};

  const unit1Info = getUnitInfo(pinnedSchool, pinnedGroup);
  const unit2Info = getUnitInfo(selectedMatch, selectedGroup);

  if (!unit1Info || !unit2Info) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(59, 63, 140, 0.35)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '20px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 10px 25px rgba(59, 63, 140, 0.2)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#3B3F8C' }}>
          {isMatched ? 'Match Successful!' : 'Confirm Match'}
        </h3>
        
        {showWarning && !isMatched && pinnedSchool && selectedMatch && (
          <div style={{
            backgroundColor: '#F5EBD3',
            border: '1px solid #C9A24B',
            borderRadius: '10px',
            padding: '10px',
            marginBottom: '15px',
            color: '#6B5A2E'
          }}>
            Warning: Both schools are in the same region ({pinnedSchool.region}). 
            Cross-regional matches are preferred for this program.
          </div>
        )}
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            marginBottom: '15px', 
            padding: '10px', 
            backgroundColor: isMatched ? '#EDEAF5' : '#F5F3FA', 
            borderRadius: '10px',
            border: isMatched ? '1px solid #3B3F8C' : 'none'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <strong>{unit1Info.name}</strong>
              {unit1Info.type === 'Group' && (
                <span style={{
                  display: 'inline-block',
                  padding: '2px 6px',
                  backgroundColor: '#EDEAF5',
                  border: '1px solid #3B3F8C',
                  borderRadius: '8px',
                  fontSize: '10px',
                  color: '#3B3F8C',
                  fontWeight: 400
                }}>
                  GROUP
                </span>
              )}
            </div>
            <span style={{ fontSize: '14px', color: '#8A87A0' }}>
              {unit1Info.details}
            </span>
            <div style={{ 
              fontSize: '12px', 
              color: unit1Info.isReady ? '#3B3F8C' : '#D98B7A', 
              fontWeight: '500', 
              marginTop: '4px' 
            }}>
              Status: {unit1Info.status}
            </div>
          </div>
          
          <div style={{ textAlign: 'center', margin: '10px 0' }}>
            {isMatched ? '🤝' : '↕️'}
          </div>
          
          <div style={{ 
            padding: '10px', 
            backgroundColor: isMatched ? '#EDEAF5' : '#F5F3FA', 
            borderRadius: '10px',
            border: isMatched ? '1px solid #3B3F8C' : 'none'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <strong>{unit2Info.name}</strong>
              {unit2Info.type === 'Group' && (
                <span style={{
                  display: 'inline-block',
                  padding: '2px 6px',
                  backgroundColor: '#EDEAF5',
                  border: '1px solid #3B3F8C',
                  borderRadius: '8px',
                  fontSize: '10px',
                  color: '#3B3F8C',
                  fontWeight: 400
                }}>
                  GROUP
                </span>
              )}
            </div>
            <span style={{ fontSize: '14px', color: '#8A87A0' }}>
              {unit2Info.details}
            </span>
            <div style={{ 
              fontSize: '12px', 
              color: unit2Info.isReady ? '#3B3F8C' : '#D98B7A', 
              fontWeight: '500', 
              marginTop: '4px' 
            }}>
              Status: {unit2Info.status}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          {!isMatched ? (
            <button
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                border: '1px solid #DAD7E8',
                borderRadius: '10px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                border: '1px solid #DAD7E8',
                borderRadius: '10px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Close
            </button>
          )}
          
          <button
            onClick={onConfirm}
            disabled={isMatched}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '10px',
              backgroundColor: isMatched ? '#F5F3FA' : '#3B3F8C',
              color: isMatched ? '#8A87A0' : 'white',
              cursor: isMatched ? 'default' : 'pointer',
              fontSize: '0.9rem'
            }}
          >
            {isMatched ? 'Match Confirmed!' : 'Confirm Match'}
          </button>
          
          <button
            onClick={onAssignPenPals}
            disabled={!canAssignPenPals}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '10px',
              backgroundColor: canAssignPenPals ? '#3B3F8C' : '#F5F3FA',
              color: canAssignPenPals ? 'white' : '#8A87A0',
              cursor: canAssignPenPals ? 'pointer' : 'default',
              fontSize: '0.9rem'
            }}
            title={
              !isMatched 
                ? "Match first" 
                : !bothUnitsReady 
                  ? "Both units must be ready" 
                  : "Assign pen pals between students"
            }
          >
            Assign Pen Pals
          </button>
        </div>
        
        {isMatched && !bothUnitsReady && (
          <div style={{
            backgroundColor: '#F5EBD3',
            border: '1px solid #C9A24B',
            borderRadius: '10px',
            padding: '10px',
            marginTop: '15px',
            color: '#6B5A2E'
          }}>
            Both units must complete data collection (READY status) before pen pals can be assigned.
          </div>
        )}
      </div>
    </div>
  );
}
