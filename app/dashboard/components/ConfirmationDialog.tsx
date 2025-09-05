"use client";

interface ConfirmationDialogProps {
  show: boolean;
  studentName: string;
  studentId: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationDialog({ show, studentName, onConfirm, onCancel }: ConfirmationDialogProps) {
  if (!show) {
    return null;
  }

  return (
    <div className="card" style={{ 
      position: 'fixed', 
      top: '50%', 
      left: '50%', 
      transform: 'translate(-50%, -50%)',
      zIndex: 1000,
      minWidth: '300px',
      maxWidth: '400px',
      border: '2px solid #dc3545',
      backgroundColor: 'white'
    }}>
      <h4 style={{ marginBottom: '1rem', color: '#dc3545' }}>Remove Student</h4>
      <p style={{ marginBottom: '1.5rem', color: '#495057' }}>
        Are you sure you want to permanently remove {studentName}?
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button 
          className="btn btn-secondary"
          onClick={onCancel}
          style={{ padding: '0.5rem 1rem' }}
        >
          Cancel
        </button>
        <button 
          className="btn" 
          onClick={onConfirm}
          style={{ 
            backgroundColor: '#dc3545', 
            color: 'white', 
            padding: '0.5rem 1rem' 
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}
