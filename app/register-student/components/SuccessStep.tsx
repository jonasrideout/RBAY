// /app/register-student/components/SuccessStep.tsx
import Link from 'next/link';

interface SuccessStepProps {
  isTeacherFlow: boolean;
  registeredStudent: {
    firstName: string;
    schoolName?: string;
  } | null;
  schoolToken: string;
}

export default function SuccessStep({
  isTeacherFlow,
  registeredStudent,
  schoolToken
}: SuccessStepProps) {
  console.log('SuccessStep schoolToken:', schoolToken);
  const handleCloseWindow = () => {
    window.close();
  };

  if (isTeacherFlow) {
    // Teacher-added student success page
    return (
      <div className="card" style={{ 
        background: '#f8f9fa', 
        borderLeft: '3px solid #28a745',
        textAlign: 'center' as const,
        marginBottom: '1.5rem'
      }}>
        <div style={{ padding: '1rem 0' }}>
          <div style={{ 
            fontSize: '1.2rem', 
            fontWeight: '400', 
            color: '#333',
            marginBottom: '0.5rem'
          }}>
            ✓ {registeredStudent?.firstName} has been registered successfully!
          </div>
          <div className="text-meta-info">
            The student can now be managed from your dashboard and will be included in pen pal pairing.
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'center', 
          flexWrap: 'wrap', 
          marginTop: '1.5rem' 
        }}>
          <Link 
            href="/dashboard"
            className="btn"
            style={{ 
              padding: '0.75rem 1.5rem',
              textDecoration: 'none'
            }}
          >
            Return to Dashboard
          </Link>
          
          <a 
            href={`/register-student?token=${schoolToken}`}
            className="btn"
            style={{ 
              padding: '0.75rem 1.5rem',
              textDecoration: 'none'
            }}
          >
            Add Another Student
          </a>
        </div>
      </div>
    );
  } else {
    // Student self-registration success page
    return (
      <div className="card" style={{ 
        background: '#f8f9fa', 
        borderLeft: '3px solid #28a745',
        textAlign: 'center' as const,
        marginBottom: '1.5rem'
      }}>
        <div style={{ padding: '1rem 0' }}>
          <div style={{ 
            fontSize: '1.2rem', 
            fontWeight: '400', 
            color: '#333',
            marginBottom: '0.5rem'
          }}>
            ✓ Thank you, {registeredStudent?.firstName}!
          </div>
          <div className="text-meta-info" style={{ marginBottom: '1.5rem' }}>
            Your registration for The Right Back at You Project has been submitted successfully.
          </div>
        </div>

        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '6px', 
          margin: '1.5rem 0', 
          border: '1px solid #e9ecef' 
        }}>
          <div className="text-data-value" style={{ marginBottom: '1rem' }}>
            <strong>School:</strong> {registeredStudent?.schoolName}
          </div>
          <div className="text-data-value">
            Your teacher will receive your details and you'll be matched with a pen pal soon!
          </div>
        </div>

        <div className="text-meta-info" style={{ marginBottom: '1.5rem' }}>
          You can close this page now. Your teacher will let you know when it's time to start writing letters!
        </div>

        <button 
          onClick={handleCloseWindow}
          className="btn"
          style={{ 
            padding: '0.75rem 1.5rem'
          }}
        >
          Close this page
        </button>
      </div>
    );
  }
}
