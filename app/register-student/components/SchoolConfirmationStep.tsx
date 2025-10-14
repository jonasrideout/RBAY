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
        borderRadius: '12px',
        padding: '3rem',
        maxWidth: '700px',
        width: '100%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        {isMatch ? (
          <>
            <h1 style={{ 
              fontSize: '1.8rem',
              fontWeight: 300,
              color: '#2c5aa0',
              textAlign: 'center',
              marginBottom: '1rem',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              lineHeight: 1.3
            }}>
              Is this your school?
            </h1>
            
            <div style={{ 
              background: '#f0f8ff', 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '2rem', 
              border: '2px solid #2196f3',
              textAlign: 'center'
            }}>
              <h2 style={{ 
                color: '#2c5aa0', 
                marginBottom: '0.5rem', 
                fontSize: '1.5rem',
                fontWeight: 300,
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                {foundSchoolInfo?.name}
              </h2>
              <p style={{ 
                color: '#6c757d', 
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
              >
                ✓ Yes, that's my school
              </button>
              
              <button 
                onClick={() => onConfirm(false)}
                className="btn"
                style={{ 
                  background: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  color: '#6c757d',
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
              fontWeight: 300,
              color: '#2c5aa0',
              textAlign: 'center',
              marginBottom: '2rem',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              lineHeight: 1.3
            }}>
              I can't find a school that matches the information you entered.
            </h1>
            
            <div style={{ textAlign: 'center' }}>
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
    </div>
  );
}
