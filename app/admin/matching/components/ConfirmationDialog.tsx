// app/admin/matching/components/ConfirmationDialog.tsx
"use client";
import { School } from '../types';

interface ConfirmationDialogProps {
  pinnedSchool: School;
  selectedMatch: School;
  showWarning: boolean;
  isMatched?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onAssignPenPals?: () => void;
}

export default function ConfirmationDialog({
  pinnedSchool,
  selectedMatch,
  showWarning,
  isMatched = false,
  onConfirm,
  onCancel,
  onAssignPenPals
}: ConfirmationDialogProps) {
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
          {isMatched ? 'Schools Matched Successfully!' : 'Confirm School Match'}
        </h3>
        
        {showWarning && !isMatched && (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '4px',
            padding: '10px',
            marginBottom: '15px',
            color: '#856404'
          }}>
            ⚠️ Warning: Both schools are in the same region ({pinnedSchool.region}). 
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
            <strong>{pinnedSchool.schoolName}</strong><br />
            <span style={{ fontSize: '14px', color: '#666' }}>
              {pinnedSchool.region} | {pinnedSchool.studentCounts.ready} students | Starts {pinnedSchool.startMonth}
            </span>
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
            <strong>{selectedMatch.schoolName}</strong><br />
            <span style={{ fontSize: '14px', color: '#666' }}>
              {selectedMatch.region} | {selectedMatch.studentCounts.ready} students | Starts {selectedMatch.startMonth}
            </span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
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
            {isMatched ? 'Close' : 'Cancel'}
          </button>
          
          {isMatched ? (
            <button
              onClick={onAssignPenPals}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#2196f3',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Assign Pen Pals
            </button>
          ) : (
            <button
              onClick={onConfirm}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#2196f3',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Confirm Match
            </button>
          )}
          
          {isMatched && (
            <button
              onClick={onConfirm}
              style={{
                padding: '10px 20px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#f5f5f5',
                color: '#666',
                cursor: 'default',
                fontSize: '0.9rem'
              }}
              disabled
            >
              Matched
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
