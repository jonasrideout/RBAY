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

export default function StudentMetricsGrid({ 
  schoolData, 
  totalStudents, 
  studentsWithInterests, 
  readOnly = false 
}: StudentMetricsGridProps) {
  const estimatedClassSize = schoolData?.expectedClassSize || 0;
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
      
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

    </div>
  );
}
