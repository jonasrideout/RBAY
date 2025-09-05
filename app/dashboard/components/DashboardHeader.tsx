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

interface DashboardHeaderProps {
  schoolData: SchoolData;
  dashboardToken: string;
}

export default function DashboardHeader({ schoolData, dashboardToken }: DashboardHeaderProps) {
  const generateStudentLink = () => {
    if (typeof window !== 'undefined' && dashboardToken) {
      return `${window.location.origin}/register-student?token=${dashboardToken}`;
    }
    return '';
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
          onClick={() => navigator.clipboard.writeText(generateStudentLink())}
          className="btn btn-primary"
          style={{ width: '100%', fontSize: '0.85rem', padding: '0.75rem' }}
        >
          Copy Student Registration Link
        </button>
      </div>
    </div>
  );
}
