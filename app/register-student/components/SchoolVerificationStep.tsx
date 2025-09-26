// /app/register-student/components/SchoolVerificationStep.tsx

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
    <div className="card">
      <h1 className="text-center mb-3">Join The Right Back at You Project</h1>
      <p className="text-center mb-4" style={{ color: '#6c757d' }}>
        Please enter your school name, teacher name, or teacher email to get started
      </p>
      
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="school-name" className="form-label">School Name, Teacher Name, or Teacher Email</label>
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
          <p style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '0.5rem', marginBottom: '0' }}>
            Examples: "Lincoln Elementary", "Ms. Johnson", or "teacher@school.edu"
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="form-group text-center">
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isLoading || !schoolToken}
            style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
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
  );
}
