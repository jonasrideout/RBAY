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
  const isUnit1Ready = pinnedSchool 
    ? pinnedSchool.status === 'READY' 
    : pinnedGroup?.isReadyForMatching || false;
  
  const isUnit2Ready = selectedMatch 
    ? selectedMatch.status === 'READY' 
    : selectedGroup?.isReadyForMatching || false;
  
  const bothUnitsReady = isUnit1Ready && isUnit2Ready;
  const canAssignPenPals = isMatched && bothUnitsReady;

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
      return {
        name: group.name,
        type: 'Group',
        details: `${group.schools.length} schools | ${group.studentCounts.total} total students`,
        status: group.isReadyForMatching ? 'READY' : 'COLLECTING',
        isReady: group.isReadyForMatching
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
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
          {isMatched ? 'Match Successful!' : 'Confirm Match'}
        </h3>
        
        {showWarning && !isMatched && pinnedSchool && selectedMatch && (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '4px',
            padding: '10px',
            marginBottom: '15px',
            color: '#856404'
          }}>
            Warning: Both schools are in the same region ({pinnedSchool.region}). 
            Cross-regional matches are preferred for this program.
          </div>
        )}
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            marginBottom: '15px', 
            padding: '10px', 
            backgroundColor: isMatched ? '#e8f5e9' : '#f8f9fa', 
            borderRadius: '4px',
            border: isMatched ? '1px solid #4caf50' : 'none'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <strong>{unit1Info.name}</strong>
              {unit1Info.type === 'Group' && (
                <span style={{
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
                </span>
              )}
            </div>
            <span style={{ fontSize: '14px', color: '#666' }}>
              {unit1Info.details}
            </span>
            <div style={{ 
              fontSize: '12px', 
              color: unit1Info.isReady ? '#4caf50' : '#ff9800', 
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
            backgroundColor: isMatched ? '#e8f5e9' : '#f8f9fa', 
            borderRadius: '4px',
            border: isMatched ? '1px solid #4caf50' : 'none'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <strong>{unit2Info.name}</strong>
              {unit2Info.type === 'Group' && (
                <span style={{
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
                </span>
              )}
            </div>
            <span style={{ fontSize: '14px', color: '#666' }}>
              {unit2Info.details}
            </span>
            <div style={{ 
              fontSize: '12px', 
              color: unit2Info.isReady ? '#4caf50' : '#ff9800', 
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
                border: '1px solid #ccc',
                borderRadius: '4px',
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
                border: '1px solid #ccc',
                borderRadius: '4px',
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
              borderRadius: '4px',
              backgroundColor: isMatched ? '#f5f5f5' : '#2196f3',
              color: isMatched ? '#666' : 'white',
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
              borderRadius: '4px',
              backgroundColor: canAssignPenPals ? '#2196f3' : '#f5f5f5',
              color: canAssignPenPals ? 'white' : '#666',
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
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '4px',
            padding: '10px',
            marginTop: '15px',
            color: '#856404'
          }}>
            Both units must complete data collection (READY status) before pen pals can be assigned.
          </div>
        )}
      </div>
    </div>
  );
}
