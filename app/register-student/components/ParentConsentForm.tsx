// /app/register-student/components/ParentConsentForm.tsx

interface ParentConsentFormProps {
  isTeacherFlow: boolean;
  parentConsent: boolean;
  isLoading: boolean;
  onConsentChange: (checked: boolean) => void;
}

export default function ParentConsentForm({
  isTeacherFlow,
  parentConsent,
  isLoading,
  onConsentChange
}: ParentConsentFormProps) {
  return (
    <div className="card" style={{ background: '#f8f9fa', padding: '1.5rem', margin: '1.5rem 0' }}>
      <h3>Parent/Guardian Permission</h3>
      
      <div className="form-group">
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '1rem' }}>
          <input 
            type="checkbox" 
            checked={parentConsent}
            onChange={(e) => onConsentChange(e.target.checked)}
            disabled={isLoading}
            required 
            style={{ marginTop: '0.25rem' }}
          />
          <span>
            {isTeacherFlow 
              ? "My student has permission from their parent or guardian to participate in The Right Back at You Project. This includes reading the book and exchanging letters with students from other schools. *"
              : "I have permission from my parent or guardian to participate in The Right Back at You Project. This includes reading the book and exchanging letters with students from other schools. *"
            }
          </span>
        </label>
      </div>

      <div style={{ background: '#e9ecef', padding: '1rem', borderRadius: '6px', marginTop: '1rem' }}>
        <p style={{ margin: '0', fontSize: '0.9rem', color: '#495057' }}>
          <strong>Privacy Protection:</strong> {isTeacherFlow 
            ? "We only collect your student's first name and last 1 or 2 initials to protect their privacy."
            : "We only collect your first name and last initial to protect your privacy. Your teacher will help coordinate any additional communication needed."
          }
        </p>
      </div>
    </div>
  );
}
