// /app/register-student/components/OtherInterestsForm.tsx

interface OtherInterestsFormProps {
  isTeacherFlow: boolean;
  otherInterests: string;
  isLoading: boolean;
  onOtherInterestsChange: (value: string) => void;
}

export default function OtherInterestsForm({
  isTeacherFlow,
  otherInterests,
  isLoading,
  onOtherInterestsChange
}: OtherInterestsFormProps) {
  return (
    <div className="form-group" style={{ marginBottom: 0 }}>
      <textarea 
        id="other-interests" 
        className="form-textarea" 
        placeholder={isTeacherFlow ? "Tell us about any other hobbies, interests, or activities..." : "Tell us about any other hobbies, interests, or activities you enjoy..."}
        rows={2}
        value={otherInterests}
        onChange={(e) => onOtherInterestsChange(e.target.value)}
        disabled={isLoading}
        style={{ borderRadius: '10px', fontFamily: 'inherit', minHeight: '65px' }}
      />
    </div>
  );
}
