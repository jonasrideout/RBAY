// /app/dashboard/components/StudentMetricsGrid.tsx
"use client";

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

interface StudentMetricsGridProps {
  schoolData: SchoolData;
  totalStudents: number;
  studentsWithInterests: Student[];
  readOnly?: boolean;
}

export default function StudentMetricsGrid({ schoolData, totalStudents, studentsWithInterests, readOnly = false }: StudentMetricsGridProps) {
  const estimatedClassSize = schoolData?.expectedClassSize || 0;
  
  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '3rem' }}>
      
      <div className="card text-center">
        <div style={{ 
          fontSize: '2.5rem', 
          fontWeight: '300', 
          color: '#333', 
          marginBottom: '0.5rem' 
        }}>
          {estimatedClassSize}
        </div>
        <div style={{ 
          color: '#555', 
          fontWeight: '400',
          fontSize: '14px',
          marginBottom: '0.25rem'
        }}>
          Estimated Class Size
        </div>
        <div style={{ 
          fontSize: '12px', 
          color: '#777',
          fontWeight: '300'
        }}>
          Expected in class
        </div>
      </div>

      <div className="card text-center">
        <div style={{ 
          fontSize: '2.5rem', 
          fontWeight: '300', 
          color: '#333', 
          marginBottom: '0.5rem' 
        }}>
          {totalStudents}
        </div>
        <div style={{ 
          color: '#555', 
          fontWeight: '400',
          fontSize: '14px',
          marginBottom: '0.25rem'
        }}>
          Students Registered
        </div>
        <div style={{ 
          fontSize: '12px', 
          color: '#777',
          fontWeight: '300'
        }}>
          Actually signed up
        </div>
      </div>

      <div className="card text-center">
        <div style={{ 
          fontSize: '2.5rem', 
          fontWeight: '300', 
          color: '#333', 
          marginBottom: '0.5rem' 
        }}>
          {studentsWithInterests.length}
        </div>
        <div style={{ 
          color: '#555', 
          fontWeight: '400',
          fontSize: '14px',
          marginBottom: '0.25rem'
        }}>
          Students Ready to Match
        </div>
        <div style={{ 
          fontSize: '12px', 
          color: '#777',
          fontWeight: '300'
        }}>
          Have complete profiles
        </div>
      </div>

      <div className="card text-center">
        <div style={{ 
          fontSize: '1.8rem', 
          fontWeight: '300', 
          color: '#333', 
          marginBottom: '0.5rem' 
        }}>
          {schoolData?.startMonth || 'Not Set'}
        </div>
        <div style={{ 
          color: '#555', 
          fontWeight: '400',
          fontSize: '14px',
          marginBottom: '0.25rem'
        }}>
          Start Date
        </div>
        <div style={{ 
          fontSize: '12px', 
          color: '#777',
          fontWeight: '300'
        }}>
          Requested timeline
        </div>
      </div>

    </div>
  );
}
