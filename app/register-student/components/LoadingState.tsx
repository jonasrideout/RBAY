// /app/register-student/components/LoadingState.tsx

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = "Loading registration form..." }: LoadingStateProps) {
  return (
    <div className="card">
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="loading" style={{ margin: '0 auto 1rem' }}></div>
        <p>{message}</p>
      </div>
    </div>
  );
}
