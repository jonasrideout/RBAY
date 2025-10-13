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
  const isMatch = foundSchoolInfo?.found !== false;
  
  return (
    <div className="card">
      {isMatch ? (
        <>
          <h1 className="text-h2 text-center">Is this your school?</h1>
          
          <div style={{ 
            background: '#f0f8ff', 
            padding: '2rem', 
            borderRadius: '8px', 
            marginBottom: '2rem', 
            border: '2px solid #2196f3',
            textAlign: 'center'
          }}>
            <h2 style={{ 
              color: '#2c5aa0', 
              marginBottom: '0.5rem', 
              fontSize: '1.5rem',
              fontWeight: 600
            }}>
              {foundSchoolInfo?.name}
            </h2>
            <p style={{ 
              color: '#6c757d', 
              marginBottom: '0', 
              fontSize: '1rem',
              fontWeight: 400
            }}>
              Teacher: {foundSchoolInfo?.teacher}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={() => onConfirm(true)}
              className="btn-blue btn-blue-lg"
            >
              ✓ Yes, that's my school
            </button>
            
            <button 
              onClick={() => onConfirm(false)}
              className="btn btn-blue-lg"
              style={{ 
                background: '#f8f9fa',
                border: '1px solid #dee2e6',
                color: '#6c757d'
              }}
            >
              ← No, try again
            </button>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-h2 text-center">I can't find a school that matches the information you entered.</h1>
          
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button 
              onClick={() => onConfirm(false)}
              className="btn-blue btn-blue-lg"
            >
              ← Try Again
            </button>
          </div>
        </>
      )}
    </div>
  );
}
