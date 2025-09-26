// /app/register-student/components/ErrorState.tsx

import Link from 'next/link';

interface ErrorStateProps {
  error: string;
}

export default function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="card">
      <div className="alert alert-error">
        <strong>Error:</strong> {error}
      </div>
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <Link href="/login" className="btn btn-primary">
          Login as Teacher
        </Link>
      </div>
    </div>
  );
}
