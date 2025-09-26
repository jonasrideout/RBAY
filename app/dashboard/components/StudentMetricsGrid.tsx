// /app/dashboard/components/StudentMetricsGrid.tsx
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

interface Student {
  id: string;
  firstName: string;
  lastInitial: string;
  grade: string;
  interests: string[];
  otherInterests: string;
  hasInterests: boolean;
  status: 'ready' | 'needs-info' | 'matched';
}

interface MatchedSchool {
  id: string;
  schoolName: string;
  teacherName: string;
  teacherEmail: string;
  schoolCity?: string;
  schoolState?: string;
  expectedClassSize: number;
  region: string;
}

interface StudentMetricsGridProps {
  schoolData: SchoolData;
  totalStudents: number;
  studentsWithInterests: Student[];
  readOnly?: boolean;
  matchedSchool?: MatchedSchool;
  isMatched?: boolean;
}

export default function StudentMetricsGrid({ 
  schoolData, 
  totalStudents, 
  studentsWithInterests, 
  readOnly = false,
  matchedSchool,
  isMatched = false
}: StudentMetricsGridProps) {
  const estimatedClassSize = schoolData?.expectedClassSize || 0;
  const [emailCopyText, setEmailCopyText] = useState('✉');
  
  // Determine grid columns: 5 if matched, 4 if not matched
  const gridColumns = isMatched ? 'repeat(5, 1fr)' : 'repeat(4, 1fr)';
  
  // Format location for matched school
  const formatLocation = () => {
    if (matchedSchool?.schoolCity && matchedSchool?.schoolState) {
      return `${matchedSchool.schoolCity}, ${matchedSchool.schoolState}`;
    }
    return '—';
  };

  const copyTeacherEmail = async () => {
    if (!matchedSchool?.teacherEmail) return;

    try {
      await navigator.clipboard.writeText(matchedSchool.teacherEmail);
      setEmailCopyText('✓');
      setTimeout(() => setEmailCopyText('✉'), 1500);
    } catch (err) {
      console.error('Failed to copy email:', err);
      prompt('Copy this email:', matchedSchool.teacherEmail);
    }
  };
  
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: gridColumns, 
      gap: '1.5rem', 
      marginBottom: '3rem' 
    }}>
      
      {/* Box 1: Estimated Class Size */}
      <div className="card text-center">
        <div style={{ 
          fontSize: '2.5rem', 
          fontWeight: '300', 
          color: '#333', 
          marginBottom: '0.5rem' 
        }}>
          {estimatedClassSize}
        </div>
        <div className="text-data-value" style={{ marginBottom: '0.25rem' }}>
          Estimated Class Size
        </div>
        <div className="text-data-label">
          Expected in class
        </div>
      </div>

      {/* Box 2: Students Registered */}
      <div className="card text-center">
        <div style={{ 
          fontSize: '2.5rem', 
          fontWeight: '300', 
          color: '#333', 
          marginBottom: '0.5rem' 
        }}>
          {totalStudents}
        </div>
        <div className="text-data-value" style={{ marginBottom: '0.25rem' }}>
          Students Registered
        </div>
        <div className="text-data-label">
          Actually signed up
        </div>
      </div>

      {/* Box 3: Students Ready to Match */}
      <div className="card text-center">
        <div style={{ 
          fontSize: '2.5rem', 
          fontWeight: '300', 
          color: '#333', 
          marginBottom: '0.5rem' 
        }}>
          {studentsWithInterests.length}
        </div>
        <div className="text-data-value" style={{ marginBottom: '0.25rem' }}>
          Students Ready to Match
        </div>
        <div className="text-data-label">
          Have complete profiles
        </div>
      </div>

      {/* Box 4: Start Date */}
      <div className="card text-center">
        <div style={{ 
          fontSize: '1.8rem', 
          fontWeight: '300', 
          color: '#333', 
          marginBottom: '0.5rem' 
        }}>
          {schoolData?.startMonth || 'Not Set'}
        </div>
        <div className="text-data-value" style={{ marginBottom: '0.25rem' }}>
          Start Date
        </div>
        <div className="text-data-label">
          Requested timeline
        </div>
      </div>

      {/* Box 5: Matched School (only show when matched) */}
      {isMatched && matchedSchool && (
        <div className="card text-center" style={{ 
          borderLeft: '3px solid #2c5aa0',
          background: '#f8f9fa'
        }}>
          <div style={{ 
            fontSize: '1.2rem', 
            fontWeight: '400', 
            color: '#333', 
            marginBottom: '0.5rem',
            lineHeight: '1.3'
          }}>
            Matched with<br />{matchedSchool.schoolName}
          </div>
          <div className="text-data-value" style={{ marginBottom: '0.25rem' }}>
            {formatLocation()}
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '0.25rem' 
          }}>
            <span className="text-data-value">
              {matchedSchool.teacherName}
            </span>
            <button
              onClick={copyTeacherEmail}
              className="btn-icon btn-icon-email"
              title={`Copy email: ${matchedSchool.teacherEmail}`}
              style={{
                fontSize: '14px',
                color: '#666',
                fontWeight: '300',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {emailCopyText}
            </button>
          </div>
          <div className="text-data-label">
            {matchedSchool.expectedClassSize || 0} students
          </div>
        </div>
      )}

    </div>
  );
}
