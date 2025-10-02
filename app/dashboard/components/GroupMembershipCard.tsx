'use client';

interface GroupSchool {
  id: string;
  schoolName: string;
  teacherName: string;
  studentCount: number;
}

interface GroupMembershipCardProps {
  groupName: string;
  schools: GroupSchool[];
  currentSchoolId: string;
}

export default function GroupMembershipCard({ 
  groupName, 
  schools, 
  currentSchoolId 
}: GroupMembershipCardProps) {
  const otherSchools = schools.filter(s => s.id !== currentSchoolId);
  const totalStudents = schools.reduce((sum, s) => sum + s.studentCount, 0);

  return (
    <div className="card" style={{ 
      marginBottom: '24px',
      backgroundColor: '#f8f9fa',
      border: '2px solid #dee2e6'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#6c757d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '18px',
          fontWeight: '300',
          flexShrink: 0
        }}>
          {schools.length}
        </div>

        <div style={{ flex: 1 }}>
          <h3 className="text-teacher-name" style={{ 
            fontSize: '16px',
            marginBottom: '8px'
          }}>
            Combined Class Group
          </h3>
          
          <p className="text-meta-info" style={{ 
            marginBottom: '12px',
            lineHeight: '1.5'
          }}>
            Your class is combined with {otherSchools.length === 1 ? 'another class' : `${otherSchools.length} other classes`} for pen pal matching. Each teacher manages their own students separately, but you'll be matched as one combined class of {totalStudents} students.
          </p>

          <div style={{
            borderTop: '1px solid #dee2e6',
            paddingTop: '12px',
            marginTop: '12px'
          }}>
            <div className="text-data-label" style={{ marginBottom: '8px' }}>
              Classes in This Group
            </div>
            {schools.map(school => (
              <div
                key={school.id}
                style={{
                  padding: '8px 0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: school.id === currentSchoolId 
                    ? 'rgba(108, 117, 125, 0.1)' 
                    : 'transparent',
                  paddingLeft: school.id === currentSchoolId ? '8px' : '0',
                  paddingRight: school.id === currentSchoolId ? '8px' : '0',
                  borderRadius: '4px'
                }}
              >
                <div>
                  <div className="text-school-name" style={{ fontSize: '14px' }}>
                    {school.schoolName}
                    {school.id === currentSchoolId && (
                      <span style={{ 
                        fontSize: '12px', 
                        color: '#6c757d',
                        marginLeft: '8px'
                      }}>
                        (your class)
                      </span>
                    )}
                  </div>
                  <div className="text-meta-info" style={{ fontSize: '12px' }}>
                    {school.teacherName}
                  </div>
                </div>
                <div className="text-data-value">
                  {school.studentCount} students
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
