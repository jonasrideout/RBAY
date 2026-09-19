// /app/register-student/components/InterestsForm.tsx

const INTEREST_OPTIONS = [
  { value: 'sports', icon: '🏀', label: 'Sports & Athletics' },
  { value: 'arts', icon: '🎨', label: 'Arts & Creativity' },
  { value: 'reading', icon: '📚', label: 'Reading & Books' },
  { value: 'technology', icon: '💻', label: 'Technology & Gaming' },
  { value: 'animals', icon: '🐕', label: 'Animals & Nature' },
  { value: 'entertainment', icon: '🎬', label: 'Entertainment & Media' },
  { value: 'social', icon: '👥', label: 'Social & Family' },
  { value: 'academic', icon: '🧮', label: 'Academic Subjects' },
  { value: 'hobbies', icon: '🎯', label: 'Hobbies & Collections' },
  { value: 'outdoors', icon: '🏕️', label: 'Outdoor Activities' },
  { value: 'music', icon: '🎵', label: 'Music & Performance' },
  { value: 'fashion', icon: '👗', label: 'Fashion & Style' }
];

interface InterestsFormProps {
  isTeacherFlow: boolean;
  interests: string[];
  isLoading: boolean;
  showError?: boolean;
  onInterestChange: (interest: string, checked: boolean) => void;
}

export default function InterestsForm({
  isTeacherFlow,
  interests,
  isLoading,
  showError = false,
  onInterestChange
}: InterestsFormProps) {
  return (
    <div className="form-group" style={{ marginBottom: 0 }}>
      {showError && interests.length === 0 && (
        <div style={{ 
          color: '#dc3545', 
          fontSize: '0.9rem', 
          marginBottom: '1rem',
          padding: '0.5rem',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '8px'
        }}>
          ⚠️ Please select at least one interest
        </div>
      )}

      {/* Scoped hover state for the interest cards - a plain <style> tag
          works fine here since it's rendered once per component instance
          and only targets this component's own class names. */}
      <style>{`
        .interest-card {
          transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
        }
        .interest-card:hover:not(.interest-card-disabled) {
          border-color: #3B3F8C !important;
          box-shadow: 0 2px 8px rgba(59, 63, 140, 0.15);
          transform: translateY(-1px);
        }
      `}</style>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
        {INTEREST_OPTIONS.map(interest => {
          const isSelected = interests.includes(interest.value);
          return (
            <label
              key={interest.value}
              className={`interest-card${isLoading ? ' interest-card-disabled' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.85rem 1rem',
                borderRadius: '14px',
                border: `2px solid ${isSelected ? '#3B3F8C' : '#DAD7E8'}`,
                backgroundColor: isSelected ? '#EDEAF5' : 'white',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              <input 
                type="checkbox" 
                checked={isSelected}
                onChange={(e) => onInterestChange(interest.value, e.target.checked)}
                disabled={isLoading}
                style={{ accentColor: '#3B3F8C', width: '16px', height: '16px', flexShrink: 0 }}
              />
              <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{interest.icon}</span>
              <span style={{ fontSize: '0.95rem', color: '#333', fontWeight: isSelected ? 500 : 400 }}>
                {interest.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
