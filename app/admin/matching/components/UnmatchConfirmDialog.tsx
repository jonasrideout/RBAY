"use client";

interface UnmatchConfirmDialogProps {
  school1Name: string;
  school2Name: string;
  school1Region: string;
  school2Region: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function UnmatchConfirmDialog({
  school1Name,
  school2Name,
  school1Region,
  school2Region,
  onConfirm,
  onCancel
}: UnmatchConfirmDialogProps) {
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
          Unmatch Schools?
        </h3>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            marginBottom: '15px', 
            padding: '10px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '4px'
          }}>
            <strong>{school1Name}</strong><br />
            <span style={{ fontSize: '14px', color: '#666' }}>
              {school1Region}
            </span>
          </div>
          
          <div style={{ textAlign: 'center', margin: '10px 0' }}>
            🔗 ❌
          </div>
          
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '4px'
          }}>
            <strong>{school2Name}</strong><br />
            <span style={{ fontSize: '14px', color: '#666' }}>
              {school2Region}
            </span>
          </div>
        </div>

        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '4px',
          padding: '10px',
          marginBottom: '20px',
          color: '#856404',
          fontSize: '14px'
        }}>
          Both schools will no longer be matched together and will return to the available schools list.
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
            Cancel
          </button>
          
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
            Yes, Unmatch
          </button>
        </div>
      </div>
    </div>
  );
}
