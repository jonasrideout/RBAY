// /app/register-student/components/ErrorState.tsx
interface ErrorStateProps {
  error: string;
}

export default function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="card">
      <div className="alert alert-error">
        <strong>Error:</strong> {error}
      </div>
    </div>
  );
}
