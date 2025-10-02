'use client';

import { useState } from 'react';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const otherSchools = schools.filter(s => s.id !== currentSchoolId);
  const totalStudents = schools.reduce((sum, s) => sum + s.studentCount, 0);
  
  // Get the other teacher name(s) for the collapsed view
  const getOtherTeacherText = () => {
    if (otherSchools.length === 1) {
      return `${otherSchools[0].teacherName}'s class`;
    } else if (otherSchools.length === 2) {
      return `${otherSchools[0].teacherName}'s and ${otherSchools[1].teacherName}'s classes`;
    } else {
      return `${otherSchools.length} other classes`;
    }
  };

  return (
    <div 
      className="card" 
      style={{ 
        marginBottom: '24px',
        backgroundColor: '#f8f9fa',
        border: '2px solid #dee2e6',
        cursor: 'pointer'
      }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Collapsed View */}
      {!isExpanded && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span className="text-teacher-name" style={{ fontSize: '16px' }}>
              Combined Class Group.
            </span>
            <span className="text-meta-info" style={{ marginLeft: '6px', fontSize: '14px' }}>
              Your class is combined with {getOtherTeacherText()} for pen pal matching.
            </span>
          </div>
          <div style={{ 
            fontSize: '20px', 
            color: '#6c757d',
            paddingRight: '8px'
          }}>
            ▼
          </div>
        </div>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '8px'
          }}>
            <h3 className="text-teacher-name" style={{ 
              fontSize: '16px',
              marginBottom: '0'
            }}>
              Combined Class Group
            </h3>
            <div style={{ 
              fontSize: '20px', 
              color: '#6c757d',
              paddingLeft: '8px'
            }}>
              ▲
            </div>
          </div>
          
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
      )}
    </div>
  );
}
