"use client";

interface ExitWarningDialogProps {
  onCopyDashboardUrl: () => void;
  onSendEmail: () => void;
  onProceed: () => void;
}

export default function ExitWarningDialog({
  onCopyDashboardUrl,
  onSendEmail,
  onProceed
}: ExitWarningDialogProps) {
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
        <h3 style={{ 
          margin: '0 0 20px 0', 
          color: '#333',
          fontWeight: '400',
          fontSize: '1.3rem'
        }}>
          Send Links to Teacher?
        </h3>
        
        <p style={{ 
          marginBottom: '25px', 
          color: '#666',
          lineHeight: '1.5'
        }}>
          The teacher hasn't received their dashboard and student registration links yet. 
          Would you like to send them now?
        </p>
        
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'flex-end' 
        }}>
          <button
            onClick={onCopyDashboardUrl}
            className="btn btn-primary"
          >
            Copy Dashboard URL
          </button>
          
          <button
            onClick={onSendEmail}
            className="btn btn-primary"
          >
            Send Welcome Email
          </button>
          
          <button
            onClick={onProceed}
            className="btn"
            style={{
              backgroundColor: '#f5f5f5',
              color: '#666',
              border: '1px solid #ddd'
            }}
          >
            Proceed Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
