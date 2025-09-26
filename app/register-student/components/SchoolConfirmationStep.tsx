// /app/register-student/components/SchoolConfirmationStep.tsx

interface SchoolInfo {
  name: string;
  teacher: string;
  found: boolean;
  schoolId: string;
  teacherEmail?: string;
}

interface SchoolConfirmationStepProps {
  foundSchoolInfo: SchoolInfo | null;
  onConfirm: (confirmed: boolean) => void;
}

export default function SchoolConfirmationStep({
  foundSchoolInfo,
  onConfirm
}: SchoolConfirmationStepProps) {
  return (
    <div className="card">
      <h1 className="text-center mb-3">Is this your school?</h1>
      
      <div style={{ 
        background: '#f0f8ff', 
        padding: '2rem', 
        borderRadius: '8px', 
        marginBottom: '2rem', 
        border: '2px solid #2196f3',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#2c5aa0', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
          {foundSchoolInfo?.name}
        </h2>
        <p style={{ color: '#6c757d', marginBottom: '0', fontSize: '1rem' }}>
          Teacher: {foundSchoolInfo?.teacher}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button 
          onClick={() => onConfirm(true)}
          className="btn btn-primary"
          style={{ padding: '1rem 2rem', fontSize: '1.1rem', minWidth: '120px' }}
        >
          ✓ Yes, that's my school
        </button>
        
        <button 
          onClick={() => onConfirm(false)}
          className="btn"
          style={{ 
            padding: '1rem 2rem', 
            fontSize: '1.1rem', 
            minWidth: '120px',
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            color: '#6c757d'
          }}
        >
          ← No, try again
        </button>
      </div>
    </div>
  );
}
