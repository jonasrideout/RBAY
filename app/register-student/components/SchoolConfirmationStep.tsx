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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '1rem',
      paddingLeft: '2rem',
      paddingRight: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '3rem',
        maxWidth: '700px',
        width: '100%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        {isMatch ? (
          <>
            <h1 style={{ 
              fontSize: '1.8rem',
              fontWeight: 700,
              color: '#3B3F8C',
              textAlign: 'center',
              marginBottom: '1rem',
              fontFamily: 'var(--font-heading)',
              lineHeight: 1.3
            }}>
              Is this your school?
            </h1>
            
            <div style={{ 
              background: '#EDEAF5', 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '2rem', 
              border: '2px solid #3B3F8C',
              textAlign: 'center'
            }}>
              <h2 style={{ 
                color: '#3B3F8C', 
                marginBottom: '0.5rem', 
                fontSize: '1.5rem',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)'
              }}>
                {foundSchoolInfo?.name}
              </h2>
              <p style={{ 
                color: '#8A87A0', 
                marginBottom: '0', 
                fontSize: '1rem',
                fontWeight: 300,
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                Teacher: {foundSchoolInfo?.teacher}
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => onConfirm(true)}
                className="btn-blue btn-blue-lg"
                style={{ color: '#3B3F8C', borderColor: '#3B3F8C', borderRadius: '10px' }}
              >
                ✓ Yes, that's my school
              </button>
              
              <button 
                onClick={() => onConfirm(false)}
                className="btn"
                style={{ 
                  background: '#F5F3FA',
                  border: '1px solid #DAD7E8',
                  color: '#8A87A0',
                  borderRadius: '10px',
                  padding: '1rem 2rem',
                  fontSize: '1.125rem',
                  fontWeight: 300
                }}
              >
                ← No, try again
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 style={{ 
              fontSize: '1.8rem',
              fontWeight: 700,
              color: '#3B3F8C',
              textAlign: 'center',
              marginBottom: '2rem',
              fontFamily: 'var(--font-heading)',
              lineHeight: 1.3
            }}>
              I can't find a school that matches the information you entered.
            </h1>
            
            <div style={{ textAlign: 'center' }}>
              <button 
                onClick={() => onConfirm(false)}
                className="btn-blue btn-blue-lg"
                style={{ color: '#3B3F8C', borderColor: '#3B3F8C', borderRadius: '10px' }}
              >
                ← Try Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
