"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  interests: string[];
  otherInterests: string;
  hasInterests: boolean;
  status: 'ready' | 'needs-info' | 'matched';
}

interface SchoolData {
  id: string;
  schoolName: string;
  teacherFirstName: string;
  teacherLastName: string;
  teacherEmail: string;
  classSize: number;
  programStartMonth: string;
  students: any[];
}

const INTEREST_OPTIONS = [
  { value: 'sports', label: '🏀 Sports & Athletics' },
  { value: 'arts', label: '🎨 Arts & Creativity' },
  { value: 'reading', label: '📚 Reading & Books' },
  { value: 'technology', label: '💻 Technology & Gaming' },
  { value: 'animals', label: '🐕 Animals & Nature' },
  { value: 'entertainment', label: '🎬 Entertainment & Media' },
  { value: 'social', label: '👥 Social & Family' },
  { value: 'academic', label: '🧮 Academic Subjects' },
  { value: 'hobbies', label: '🎯 Hobbies & Collections' },
  { value: 'outdoors', label: '🏕️ Outdoor Activities' },
  { value: 'music', label: '🎵 Music & Performance' },
  { value: 'fashion', label: '👗 Fashion & Style' }
];

export default function TeacherDashboard() {
  const [showMissingInfo, setShowMissingInfo] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [schoolData, setSchoolData] = useState<SchoolData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [tempInterests, setTempInterests] = useState<string[]>([]);
  const [tempOtherInterests, setTempOtherInterests] = useState('');

  // For demo purposes, we'll use a hardcoded teacher email
  // In a real app, this would come from authentication
  const teacherEmail = 'jonas.rideout@gmail.com'; // Replace with actual logged-in teacher

  useEffect(() => {
    fetchSchoolData();
  }, []);

  const fetchSchoolData = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/schools?teacherEmail=${encodeURIComponent(teacherEmail)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load school data');
      }

      setSchoolData(data.school);
      
      // Transform students data to match our Student interface
      const transformedStudents: Student[] = data.school.students.map((student: any) => ({
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        grade: student.grade,
        interests: student.interests || [],
        otherInterests: student.otherInterests || '',
        hasInterests: (student.interests && student.interests.length > 0) || false,
        status: (student.interests && student.interests.length > 0) ? 'ready' : 'needs-info'
      }));

      setStudents(transformedStudents);
    } catch (err: any) {
      setError(err.message || 'Failed to load school data');
      console.error('Dashboard error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const studentsWithInterests = students.filter(s => s.hasInterests).length;
  const studentsNeedingInfo = students.filter(s => !s.hasInterests);
  const totalStudents = students.length;

  const handleEditInterests = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setEditingStudent(studentId);
      setTempInterests([...student.interests]);
      setTempOtherInterests(student.otherInterests);
    }
  };

  const handleInterestChange = (interest: string, checked: boolean) => {
    setTempInterests(prev => 
      checked 
        ? [...prev, interest]
        : prev.filter(i => i !== interest)
    );
  };

  const handleSaveInterests = async (studentId: string) => {
    try {
      const response = await fetch('/api/students', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          interests: tempInterests,
          otherInterests: tempOtherInterests
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update student');
      }

      // Update local state
      setStudents(prev => prev.map(student => 
        student.id === studentId 
          ? {
              ...student,
              interests: tempInterests,
              otherInterests: tempOtherInterests,
              hasInterests: tempInterests.length > 0,
              status: tempInterests.length > 0 ? 'ready' as const : 'needs-info' as const
            }
          : student
      ));

      setEditingStudent(null);
      setTempInterests([]);
      setTempOtherInterests('');
    } catch (err: any) {
      alert('Error saving interests: ' + err.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
    setTempInterests([]);
    setTempOtherInterests('');
  };

  const getInterestLabel = (value: string) => {
    const option = INTEREST_OPTIONS.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const renderStudentCard = (student: Student) => {
    const isEditing = editingStudent === student.id;

    if (!student.hasInterests && isEditing) {
      return (
        <div key={student.id} className="card" style={{ background: '#fff5f5', border: '2px solid #fed7d7' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: '#c53030', marginBottom: '0.25rem' }}>{student.firstName} {student.lastName}</h4>
            <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Grade {student.grade} • Adding interests</span>
          </div>
          
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '6px', border: '1px solid #fed7d7' }}>
            <h5 style={{ marginBottom: '1rem', color: '#495057' }}>Select {student.firstName}'s Interests:</h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
              {INTEREST_OPTIONS.map(interest => (
                <label key={interest.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="checkbox" 
                    checked={tempInterests.includes(interest.value)}
                    onChange={(e) => handleInterestChange(interest.value, e.target.checked)}
                  />
                  {interest.label}
                </label>
              ))}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Other Interests:</label>
              <textarea 
                className="form-textarea" 
                placeholder="Any other hobbies or interests..."
                rows={2}
                value={tempOtherInterests}
                onChange={(e) => setTempOtherInterests(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-secondary"
                onClick={handleCancelEdit}
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => handleSaveInterests(student.id)}
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                Save Interests
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (student.hasInterests) {
      return (
        <div key={student.id} className="card" style={{ background: '#f0f8ff', border: '2px solid #bee5eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <h4 style={{ color: '#0c5460', marginBottom: '0.25rem' }}>{student.firstName} {student.lastName}</h4>
              <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Grade {student.grade} • Has interests</span>
            </div>
            <span className="status-ready">
              ✅ Ready
            </span>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <strong style={{ color: '#495057' }}>Interests:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {student.interests.map(interest => (
                <span key={interest} className="tag">{getInterestLabel(interest)}</span>
              ))}
            </div>
            {student.otherInterests && (
              <p style={{ color: '#6c757d', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '0' }}>
                <em>Other:</em> {student.otherInterests}
              </p>
            )}
          </div>

          <div style={{ background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #bee5eb', textAlign: 'center' }}>
            <p style={{ color: '#6c757d', marginBottom: '0', fontStyle: 'italic' }}>
              Ready for matching when class is complete
            </p>
          </div>
        </div>
      );
    }

    // Student without interests (not editing)
    return (
      <div key={student.id} className="card" style={{ background: '#fff5f5', border: '2px solid #fed7d7' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h4 style={{ color: '#c53030', marginBottom: '0.25rem' }}>{student.firstName} {student.lastName}</h4>
            <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Grade {student.grade} • Missing interests</span>
          </div>
          <span className="status-needs-info">
            📝 Needs Info
          </span>
        </div>
        
        <div style={{ background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #fed7d7', textAlign: 'center' }}>
          <p style={{ color: '#6c757d', marginBottom: '1rem', fontStyle: 'italic' }}>
            No interests selected yet
          </p>
          <button 
            className="btn btn-primary" 
            onClick={() => handleEditInterests(student.id)}
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            Add Interests
          </button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="page">
        <header className="header">
          <div className="container">
            <div className="header-content">
              <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <img src="/RB@Y-logo.jpg" alt="Right Back at You" style={{ height: '40px' }} />
                The Right Back at You Project
              </Link>
              <nav className="nav">
                <Link href="/dashboard" className="nav-link">Dashboard</Link>
                <Link href="/register-school" className="nav-link">School Settings</Link>
                <Link href="/logout" className="nav-link">Logout</Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="container" style={{ flex: 1, paddingTop: '3rem' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="loading" style={{ margin: '0 auto 1rem' }}></div>
            <p>Loading your dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <header className="header">
          <div className="container">
            <div className="header-content">
              <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <img src="/RB@Y-logo.jpg" alt="Right Back at You" style={{ height: '40px' }} />
                The Right Back at You Project
              </Link>
              <nav className="nav">
                <Link href="/dashboard" className="nav-link">Dashboard</Link>
                <Link href="/register-school" className="nav-link">School Settings</Link>
                <Link href="/logout" className="nav-link">Logout</Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="container" style={{ flex: 1, paddingTop: '3rem' }}>
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
          <div style={{ textAlign: 'center' }}>
            <button onClick={fetchSchoolData} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/RB@Y-logo.jpg" alt="Right Back at You" style={{ height: '40px' }} />
              The Right Back at You Project
            </Link>
            <nav className="nav">
              <Link href="/dashboard" className="nav-link">Dashboard</Link>
              <Link href="/register-school" className="nav-link">School Settings</Link>
              <Link href="/logout" className="nav-link">Logout</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ flex: 1, paddingTop: '3rem' }}>
        
        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>Teacher Dashboard</h1>
          <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
            Welcome back, {schoolData?.teacherFirstName} {schoolData?.teacherLastName}! Here's your {schoolData?.schoolName} overview.
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-4" style={{ marginBottom: '3rem' }}>
          <div className="card text-center" style={{ background: '#f8f9fa' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#4a90e2', marginBottom: '0.5rem' }}>
              {schoolData?.classSize || 0}
            </div>
            <div style={{ color: '#6c757d', fontWeight: '600' }}>Total Students</div>
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
              {studentsWithInterests}
            </div>
            <div style={{ color: '#6c757d', fontWeight: '600' }}>Students Ready to Match</div>
            <div style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.25rem' }}>
              Have complete profiles
            </div>
          </div>

          <div className="card text-center" style={{ background: '#f8f9fa' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fd7e14', marginBottom: '0.5rem' }}>
              {schoolData?.programStartMonth || 'Not Set'}
            </div>
            <div style={{ color: '#6c757d', fontWeight: '600' }}>Start Date</div>
            <div style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.25rem' }}>
              Requested timeline
            </div>
          </div>
        </div>

        {/* Class Status & Actions */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ color: studentsNeedingInfo.length > 0 ? '#ffc107' : '#28a745', marginBottom: '0.5rem' }}>
                {studentsNeedingInfo.length > 0 ? '📝 Collecting Student Information' : '✅ Ready for Matching!'}
              </h3>
              <p style={{ color: '#6c757d', marginBottom: '0' }}>
                {studentsNeedingInfo.length > 0 
                  ? 'Complete all student interests before requesting to be matched with another school.'
                  : 'All students have provided their interest information. Ready to find a partner school!'
                }
              </p>
            </div>
            <div>
              <button 
                className="btn" 
                style={{ 
                  backgroundColor: studentsNeedingInfo.length > 0 ? '#6c757d' : '#28a745', 
                  color: 'white', 
                  cursor: studentsNeedingInfo.length > 0 ? 'not-allowed' : 'pointer',
                  padding: '1rem 2rem',
                  fontSize: '1.1rem'
                }}
                disabled={studentsNeedingInfo.length > 0}
                title={studentsNeedingInfo.length > 0 ? "Complete all student information first" : "Request matching with another school"}
              >
                {studentsNeedingInfo.length > 0 ? '🔒 Ready for Matching' : '🎯 Request Matching'}
              </button>
              {studentsNeedingInfo.length > 0 && (
                <p style={{ color: '#6c757d', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '0' }}>
                  {studentsNeedingInfo.length} students still need interest information
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-outline" 
            onClick={() => setShowMissingInfo(!showMissingInfo)}
          >
            {showMissingInfo ? '👥 Show All Students' : `📝 Missing Info (${studentsNeedingInfo.length})`}
          </button>
          <Link href="/register-student" className="btn btn-secondary">
            ➕ Add New Student
          </Link>
          <button 
            className="btn" 
            style={{ 
              backgroundColor: studentsNeedingInfo.length > 0 ? '#6c757d' : '#4a90e2', 
              color: 'white', 
              cursor: studentsNeedingInfo.length > 0 ? 'not-allowed' : 'pointer'
            }}
            disabled={studentsNeedingInfo.length > 0}
            title={studentsNeedingInfo.length > 0 ? "Complete all student information first" : "Download student match information"}
          >
            📥 Download Matches
          </button>
        </div>

        {/* Students List */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>{showMissingInfo ? 'Students Missing Information' : 'Your Students'}</h3>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                {showMissingInfo 
                  ? `${studentsNeedingInfo.length} students need interests`
                  : `${totalStudents} students • ${studentsWithInterests} ready`
                }
              </span>
            </div>
          </div>

          {totalStudents === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
              <h4>No students registered yet</h4>
              <p>Share your student registration link to get started!</p>
              <Link href="/register-student" className="btn btn-primary">
                Add First Student
              </Link>
            </div>
          ) : (
            <>
              {/* Student Cards */}
              <div className="grid grid-2" style={{ gap: '1.5rem' }}>
                {showMissingInfo 
                  ? studentsNeedingInfo.map(student => renderStudentCard(student))
                  : students.map(student => renderStudentCard(student))
                }
              </div>

              {!showMissingInfo && students.length > 4 && (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <button className="btn btn-outline">
                    Show All {totalStudents} Students
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer style={{ background: '#343a40', color: 'white', padding: '2rem 0', marginTop: '3rem' }}>
        <div className="container text-center">
          <p>&copy; 2024 The Right Back at You Project by Carolyn Mackler. Building empathy and connection through literature.</p>
        </div>
      </footer>
    </div>
  );
}
