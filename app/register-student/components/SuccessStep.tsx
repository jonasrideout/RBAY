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
  if (isTeacherFlow) {
    // Teacher-added student success page
    return (
      <div className="card text-center" style={{ background: '#d4edda' }}>
        <h2 style={{ color: '#155724' }}>{registeredStudent?.firstName} Registered</h2>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
          <Link 
            href="/dashboard"
            className="btn btn-primary"
          >
            Return to Dashboard
          </Link>
          
          <Link 
            href={`/register-student?token=${schoolToken}`}
            className="btn btn-secondary"
          >
            Add Another Student
          </Link>
        </div>
      </div>
    );
  } else {
    // Student self-registration success page
    return (
      <div className="card text-center" style={{ background: '#d4edda' }}>
        <h2 style={{ color: '#155724' }}>Thank You, {registeredStudent?.firstName}!</h2>
        <p style={{ color: '#155724', fontSize: '1.1rem' }}>
          Your registration for The Right Back at You Project has been submitted successfully. 
        </p>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '6px', margin: '1.5rem 0', border: '1px solid #c3e6cb' }}>
          <p style={{ color: '#155724', marginBottom: '1rem' }}>
            <strong>School:</strong> {registeredStudent?.schoolName}
          </p>
          <p style={{ color: '#155724', marginBottom: '0' }}>
            Your teacher will receive your details and you'll be matched with a penpal soon!
          </p>
        </div>
        <p style={{ color: '#6c757d', marginTop: '1.5rem' }}>
          You can close this page now. Your teacher will let you know when it's time to start writing letters!
        </p>
      </div>
    );
  }
}
