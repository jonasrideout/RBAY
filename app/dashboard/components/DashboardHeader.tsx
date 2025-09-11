// /app/dashboard/components/DashboardHeader.tsx
"use client";
import { useState } from 'react';

interface SchoolData {
  id: string;
  schoolName: string;
  teacherName: string;
  teacherEmail: string;
  dashboardToken: string;
  expectedClassSize: number;
  startMonth: string;
  programStartMonth: string;
  status: 'COLLECTING' | 'READY' | 'MATCHED' | 'CORRESPONDING' | 'DONE';
  students: any[];
}

interface DashboardHeaderProps {
  schoolData: SchoolData;
  dashboardToken: string;
}

export default function DashboardHeader({ schoolData, dashboardToken }: DashboardHeaderProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const generateStudentLink = () => {
    if (typeof window !== 'undefined' && schoolData.dashboardToken) {
      return `${window.location.origin}/register-student?token=${schoolData.dashboardToken}`;
    }
    return '';
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generateStudentLink());
      setCopyStatus('copied');
      
      // Reset back to normal after 2 seconds
      setTimeout(() => {
        setCopyStatus('idle');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback - could show an error state if needed
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
      <div>
        <h1 style={{ marginBottom: '0.5rem', marginTop: '0' }}>{schoolData.schoolName}</h1>
        <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
          {schoolData.teacherName}
        </p>
      </div>
      
      <div>
        <h3 style={{ marginBottom: '0.5rem', textAlign: 'right', fontSize: '1rem', marginTop: '0' }}>
          Share This Link With Your Students
        </h3>
        <button 
          onClick={handleCopyLink}
          className="btn btn-primary"
          style={{ 
            width: '100%', 
            fontSize: '0.85rem', 
            padding: '0.75rem',
            backgroundColor: copyStatus === 'copied' ? '#28a745' : '#4a90e2',
            transition: 'all 0.3s ease',
            position: 'relative'
          }}
        >
          {copyStatus === 'copied' ? (
            <>
              <span style={{ marginRight: '0.5rem' }}>✓</span>
              Copied!
            </>
          ) : (
            'Copy Student Registration Link'
          )}
        </button>
      </div>
    </div>
  );
}
