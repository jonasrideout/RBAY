interface SchoolVerificationStepProps {
  schoolNameInput: string;
  setSchoolNameInput: (value: string) => void;
  error: string;
  setError: (value: string) => void;
  isLoading: boolean;
  schoolToken: string;
  onSubmit: (e: React.FormEvent) => void;
}

export default function SchoolVerificationStep({
  schoolNameInput,
  setSchoolNameInput,
  error,
  setError,
  isLoading,
  schoolToken,
  onSubmit
}: SchoolVerificationStepProps) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '3rem',
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
        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: 300,
          color: '#2c5aa0',
          textAlign: 'center',
          marginBottom: '1rem',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          lineHeight: 1.3
        }}>
          Join The Right Back at You Project
        </h1>
        
        <p style={{
          textAlign: 'center',
          marginBottom: '2.5rem',
          color: '#6c757d',
          fontSize: '1.1rem',
          fontWeight: '300',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          Please enter your school name, teacher name, or teacher email to get started
        </p>
        
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="school-name" className="form-label">
              School Name, Teacher Name, or Teacher Email
            </label>
            <input 
              type="text" 
              id="school-name" 
              className="form-input" 
              placeholder="Enter your school name, teacher's name, or teacher's email"
              value={schoolNameInput}
              onChange={(e) => {
                setSchoolNameInput(e.target.value);
                if (error) setError('');
              }}
              disabled={isLoading}
              required
            />
            <p style={{ 
              fontSize: '0.85rem', 
              color: '#6c757d', 
              marginTop: '0.5rem', 
              marginBottom: '0',
              fontWeight: '300',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              Examples: "Lincoln Elementary", "Ms. Johnson", or "teacher@school.edu"
            </p>
          </div>
          
          {error && (
            <div className="alert alert-error" style={{ fontWeight: '300' }}>
              <strong style={{ fontWeight: '400' }}>Error:</strong> {error}
            </div>
          )}
          
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button 
              type="submit" 
              className="btn-blue btn-blue-lg"
              disabled={isLoading || !schoolToken}
            >
              {isLoading ? (
                <>
                  <span className="loading"></span>
                  <span style={{ marginLeft: '0.5rem' }}>Verifying...</span>
                </>
              ) : (
                'Continue'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
