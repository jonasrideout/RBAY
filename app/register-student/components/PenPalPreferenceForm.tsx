// /app/register-student/components/PenPalPreferenceForm.tsx

interface PenPalPreferenceFormProps {
  isTeacherFlow: boolean;
  penpalPreference: 'ONE' | 'MULTIPLE';
  isLoading: boolean;
  onPreferenceChange: (preference: 'ONE' | 'MULTIPLE') => void;
}

export default function PenPalPreferenceForm({
  isTeacherFlow,
  penpalPreference,
  isLoading,
  onPreferenceChange
}: PenPalPreferenceFormProps) {
  return (
    <div className="form-group">
      <label className="form-label">{isTeacherFlow ? "How many pen pals would this student like?" : "Pen Pal Preference"}</label>
      <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '1rem' }}>
        {isTeacherFlow 
          ? "" 
          : "Would you like to have one pen pal or would you be excited to write to two pen pals?"
        }
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          padding: '1rem', 
          border: penpalPreference === 'ONE' ? '2px solid #2196f3' : '1px solid #dee2e6',
          borderRadius: '8px', 
          cursor: 'pointer',
          backgroundColor: penpalPreference === 'ONE' ? '#f0f8ff' : 'white',
          transition: 'all 0.2s ease'
        }}>
          <input 
            type="radio" 
            name="penpalPreference"
            value="ONE"
            checked={penpalPreference === 'ONE'}
            onChange={() => onPreferenceChange('ONE')}
            disabled={isLoading}
            style={{ fontSize: '1.1rem' }}
          />
          <div>
            <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
              {isTeacherFlow ? "📝 Just one pen pal" : "📝 I'd prefer just one pen pal"}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
              Focus on building one great friendship
            </div>
          </div>
        </label>
        
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          padding: '1rem', 
          border: penpalPreference === 'MULTIPLE' ? '2px solid #2196f3' : '1px solid #dee2e6',
          borderRadius: '8px', 
          cursor: 'pointer',
          backgroundColor: penpalPreference === 'MULTIPLE' ? '#f0f8ff' : 'white',
          transition: 'all 0.2s ease'
        }}>
          <input 
            type="radio" 
            name="penpalPreference"
            value="MULTIPLE"
            checked={penpalPreference === 'MULTIPLE'}
            onChange={() => onPreferenceChange('MULTIPLE')}
            disabled={isLoading}
            style={{ fontSize: '1.1rem' }}
          />
          <div>
            <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
              {isTeacherFlow ? "✉️ Two pen pals" : "✉️ I'd love two pen pals"}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
              {isTeacherFlow ? "Excited to write to 2 different students" : "I'm excited to write to 2 different students"}
            </div>
          </div>
        </label>
      </div>
    </div>
  );
}
