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
  readyForMatching: boolean;
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
}

export default function StudentMetricsGrid({ schoolData, totalStudents, studentsWithInterests }: StudentMetricsGridProps) {
  const estimatedClassSize = schoolData?.expectedClassSize || 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '3rem' }}>
      <div className="card text-center" style={{ background: '#f8f9fa' }}>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#4a90e2', marginBottom: '0.5rem' }}>
          {estimatedClassSize}
        </div>
        <div style={{ color: '#6c757d', fontWeight: '600' }}>Estimated Class Size</div>
        <div style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.25rem' }}>
          Expected in class
        </div>
      </div>

      <div className="card text-center" style={{ background: '#f8f9fa' }}>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#28a745', marginBottom: '0.5rem' }}>
          {totalStudents}
        </div>
        <div style={{ color: '#6c757d', fontWeight: '600' }}>Students Registered</div>
        <div style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.25rem' }}>
          Actually signed up
        </div>
      </div>

      <div className="card text-center" style={{ background: '#f8f9fa' }}>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#17a2b8', marginBottom: '0.5rem' }}>
          {studentsWithInterests.length}
        </div>
        <div style={{ color: '#6c757d', fontWeight: '600' }}>Students Ready to Match</div>
        <div style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.25rem' }}>
          Have complete profiles
        </div>
      </div>

      <div className="card text-center" style={{ background: '#f8f9fa' }}>
        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fd7e14', marginBottom: '0.5rem' }}>
          {schoolData?.startMonth || 'Not Set'}
        </div>
        <div style={{ color: '#6c757d', fontWeight: '600' }}>Start Date</div>
        <div style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.25rem' }}>
          Requested timeline
        </div>
      </div>
    </div>
  );
}
