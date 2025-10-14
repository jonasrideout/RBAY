// /app/register-student/components/InterestsForm.tsx

const INTEREST_OPTIONS = [
  { value: 'sports', label: '🏀 Sports & Athletics' },
  { value: 'arts', label: '🎨 Arts & Creativity' },
  { value: 'reading', label: '📚 Reading & Books' },
  { value: 'technology', label: '💻 Technology & Gaming' },
  { value: 'animals', label: '🐕 Animals & Nature' },
  { value: 'entertainment', label: '🎬 Entertainment & Media' },
  { value: 'social', label: '👥 Social & Family' },
  { value: 'academic', label: '🧮 Academic Subjects' },
  { value: 'hobbies', label: '🎯 Hobbies & Collections' },
  { value: 'outdoors', label: '🏕️ Outdoor Activities' },
  { value: 'music', label: '🎵 Music & Performance' },
  { value: 'fashion', label: '👗 Fashion & Style' }
];

interface InterestsFormProps {
  isTeacherFlow: boolean;
  interests: string[];
  otherInterests: string;
  isLoading: boolean;
  onInterestChange: (interest: string, checked: boolean) => void;
  onOtherInterestsChange: (value: string) => void;
}

export default function InterestsForm({
  isTeacherFlow,
  interests,
  otherInterests,
  isLoading,
  onInterestChange,
  onOtherInterestsChange
}: InterestsFormProps) {
  return (
    <>
      <div className="form-group">
        <label className="form-label">{isTeacherFlow ? "Interests & Hobbies *" : "Your Interests & Hobbies *"}</label>
        <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: '300' }}>
          {isTeacherFlow 
            ? "Select at least one that applies"
            : "Select at least one that applies - this helps us find you a great penpal!"
          }
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
          {INTEREST_OPTIONS.map(interest => (
            <label key={interest.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input 
                type="checkbox" 
                checked={interests.includes(interest.value)}
                onChange={(e) => onInterestChange(interest.value, e.target.checked)}
                disabled={isLoading}
              />
              {interest.label}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="other-interests" className="form-label">Other Interests</label>
        <textarea 
          id="other-interests" 
          className="form-textarea" 
          placeholder={isTeacherFlow ? "Tell us about any other hobbies, interests, or activities..." : "Tell us about any other hobbies, interests, or activities you enjoy..."}
          rows={3}
          value={otherInterests}
          onChange={(e) => onOtherInterestsChange(e.target.value)}
          disabled={isLoading}
        />
      </div>
    </>
  );
}
