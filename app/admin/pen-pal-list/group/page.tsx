// app/admin/pen-pal-list/group/page.tsx
"use client";

// One printable master list for a whole school group (e.g. all of the
// Xanh Tue Duc classes): one section per teacher, each section starting on
// a new page. This is a separate page on purpose - the single-school PDF
// pages (app/admin/pen-pal-list and app/teacher/pen-pal-list) are untouched.
// It reuses the same /api/admin/download-pairings data and the same slip
// layout, once per class in the group.
//
// Usage: /admin/pen-pal-list/group?groupId=<school group id>

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Student {
  name: string;
  grade: string;
  interests: string[];
  otherInterests: string | null;
  penpalPreference?: string;
  teacherName?: string;
}

interface Penpal {
  name: string;
  grade: string;
  school: string;
  city?: string | null;
  state?: string | null;
  country?: string;
  schoolGroupId?: string | null;
  teacherName?: string;
  hasMultipleClasses?: boolean;
  interests: string[];
  otherInterests: string | null;
}

interface StudentPairing {
  student: Student;
  penpals: Penpal[];
  penpalCount: number;
}

interface SchoolData {
  name: string;
  teacher: string;
  email: string;
  partnerSchool?: string;
  schoolGroupId?: string | null;
  hasMultipleClasses?: boolean;
  schoolCountry?: string;
}

interface PenPalData {
  school: SchoolData;
  pairings: StudentPairing[];
  generatedAt: string;
}

interface ConsolidatedStudent {
  studentName: string;
  studentInterests: string;
  penpals: {
    name: string;
    school: string;
    city?: string | null;
    state?: string | null;
    country?: string;
    schoolGroupId?: string | null;
    teacherName?: string;
    hasMultipleClasses?: boolean;
    interests: string;
  }[];
}

const FONT = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

// Same helper as the single-school pages
const formatInterests = (interests: string[], otherInterests: string | null) => {
  const parts = [];
  if (interests && interests.length > 0) parts.push(interests.join(', '));
  if (otherInterests && otherInterests.trim()) parts.push(otherInterests.trim());
  return parts.length > 0 ? parts.join(', ') : 'No interests listed';
};

// Same consolidation and sort as the single-school pages: grouped by the
// pen pal's teacher, then alphabetical by student name.
const consolidateStudents = (data: PenPalData): ConsolidatedStudent[] => {
  const studentMap = new Map<string, ConsolidatedStudent>();

  data.pairings.forEach(pairing => {
    const studentName = pairing.student.name;
    if (!studentMap.has(studentName)) {
      studentMap.set(studentName, {
        studentName,
        studentInterests: formatInterests(pairing.student.interests, pairing.student.otherInterests),
        penpals: []
      });
    }
    pairing.penpals.forEach(penpal => {
      studentMap.get(studentName)!.penpals.push({
        name: penpal.name,
        school: penpal.school,
        city: penpal.city,
        state: penpal.state,
        country: penpal.country,
        schoolGroupId: penpal.schoolGroupId,
        teacherName: penpal.teacherName,
        hasMultipleClasses: penpal.hasMultipleClasses,
        interests: formatInterests(penpal.interests, penpal.otherInterests)
      });
    });
  });

  const penpalTeacher = (s: ConsolidatedStudent) => s.penpals[0]?.teacherName || '';
  return Array.from(studentMap.values()).sort((a, b) => {
    const byTeacher = penpalTeacher(a).localeCompare(penpalTeacher(b), undefined, { numeric: true });
    if (byTeacher !== 0) return byTeacher;
    return a.studentName.localeCompare(b.studentName);
  });
};

function GroupPenPalListContent() {
  const searchParams = useSearchParams();
  const groupId = searchParams?.get('groupId');

  const [groupName, setGroupName] = useState('');
  const [sections, setSections] = useState<PenPalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!groupId) {
      setError('No group ID provided');
      setIsLoading(false);
      return;
    }
    loadGroup(groupId);
  }, [groupId]);

  const loadGroup = async (id: string) => {
    try {
      const groupsResponse = await fetch('/api/admin/school-groups');
      if (!groupsResponse.ok) throw new Error('Failed to load school groups');
      const groupsData = await groupsResponse.json();

      const group = (groupsData.groups || []).find((g: any) => g.id === id);
      if (!group) throw new Error('School group not found');

      setGroupName(group.name);

      // One section per class, ordered by teacher name
      const schools = [...group.schools].sort((a: any, b: any) =>
        (a.teacherName || '').localeCompare(b.teacherName || '')
      );

      const results = await Promise.all(
        schools.map(async (school: any) => {
          const response = await fetch(`/api/admin/download-pairings?schoolId=${school.id}`);
          if (!response.ok) throw new Error(`Failed to load pen pals for ${school.teacherName}`);
          return response.json() as Promise<PenPalData>;
        })
      );

      setSections(results);
    } catch (err: any) {
      setError(err.message || 'Failed to load group pen pal data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page">
        <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Loading pen pal assignments...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Error</h2>
          <p style={{ color: '#dc3545', marginBottom: '2rem' }}>{error}</p>
          <Link href="/admin/matching" className="btn btn-primary">
            Back to Admin Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const partnerSchool = sections[0]?.school.partnerSchool;
  const generatedAt = sections[0]?.generatedAt || new Date().toISOString();

  return (
    <div className="page">
      {/* Header - only show on screen, not in print */}
      <header className="header no-print">
        <div className="container">
          <div className="header-content">
            <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/RB@Y-logo.png" alt="Right Back at You" style={{ height: '40px' }} />
              The Right Back at You Project
            </Link>
            <nav className="nav">
              <Link href="/" className="nav-link">Home</Link>
              <Link href="/admin/matching" className="nav-link">Admin</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container" style={{ flex: 1, paddingTop: '1.5rem' }}>
        {/* Action buttons - only show on screen, not in print */}
        <div className="no-print" style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link href="/admin/matching" className="btn btn-secondary">
            ← Back to Admin Dashboard
          </Link>
          <button onClick={() => window.print()} className="btn btn-primary">
            🖨️ Print / Download PDF
          </button>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '3rem 4rem',
          maxWidth: '1000px',
          margin: '0 auto',
          overflow: 'hidden'
        }}>
          {/* Header with logo (once, at the top) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
            paddingBottom: '1rem',
            borderBottom: '2px solid #e0e6ed'
          }}>
            <h1 style={{ color: '#4285f4', fontSize: '1.25rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
              THE RIGHT BACK AT YOU PROJECT
            </h1>
            <img src="/RB@Y-logo.png" alt="Right Back at You Logo" style={{ height: '60px' }} />
          </div>

          <h2 style={{ fontSize: '1.3rem', fontWeight: '300', margin: '0 0 2rem 0', color: '#1a365d', fontFamily: FONT }}>
            Pen Pals - {groupName}{partnerSchool ? ` and ${partnerSchool}` : ''}
          </h2>

          {sections.map((data, sectionIndex) => {
            const consolidatedStudents = consolidateStudents(data);
            const isInternationalPairing =
              data.school.schoolCountry !== 'United States' ||
              consolidatedStudents.some(student =>
                student.penpals.some(penpal => penpal.country && penpal.country !== 'United States')
              );

            return (
              <div
                key={sectionIndex}
                className={sectionIndex > 0 ? 'teacher-section new-page' : 'teacher-section'}
                style={{ marginTop: sectionIndex > 0 ? '3rem' : 0 }}
              >
                {/* Teacher heading for this class */}
                <h3 style={{
                  fontFamily: FONT,
                  fontSize: '1.15rem',
                  fontWeight: '600',
                  color: '#1a365d',
                  margin: '0 0 1rem 0',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid #e0e6ed'
                }}>
                  Teacher: {data.school.teacher}
                  <span style={{ fontWeight: '300', color: '#718096', marginLeft: '0.75rem' }}>
                    {consolidatedStudents.length} student{consolidatedStudents.length !== 1 ? 's' : ''}
                  </span>
                </h3>

                {/* Slips - same markup as the single-school admin page */}
                {consolidatedStudents.map((student, studentIndex) => (
                  <div key={studentIndex} className="student-card" style={{ position: 'relative' }}>
                    <div style={{
                      position: 'relative',
                      paddingTop: '0.75rem',
                      paddingBottom: '1.25rem',
                      paddingLeft: '0.5rem',
                      paddingRight: '0.5rem',
                      fontFamily: FONT,
                      fontWeight: '300',
                      lineHeight: '1.6',
                      borderTop: studentIndex > 0 ? '2px dashed #ccc' : 'none',
                      marginTop: studentIndex > 0 ? '1rem' : '0'
                    }}>
                      {studentIndex > 0 && (
                        <span style={{ position: 'absolute', right: '0', top: '-12px', fontSize: '1.2rem' }}>
                          ✂️
                        </span>
                      )}
                      <img
                        src="/slip-branding.png"
                        alt="The Right Back at You Project"
                        style={{
                          position: 'absolute',
                          right: '0.25in',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          height: '80px'
                        }}
                      />
                      <div style={{ marginBottom: '0.5rem', maxWidth: 'calc(100% - 180px)', paddingRight: '1rem' }}>
                        {student.studentName} | Interests: {student.studentInterests}
                      </div>
                      <div style={{ marginLeft: '1rem', color: '#4a5568', maxWidth: 'calc(100% - 180px)', paddingRight: '1rem' }}>
                        {student.penpals.map((penpal, penpalIndex) => {
                          const locationParts = [];
                          if (penpal.school) locationParts.push(penpal.school);
                          if (penpal.city) locationParts.push(penpal.city);
                          if (penpal.state) locationParts.push(penpal.state);
                          if (isInternationalPairing && penpal.country) locationParts.push(penpal.country);
                          const location = locationParts.join(', ');

                          const teacherInfo = ((penpal.schoolGroupId || penpal.hasMultipleClasses) && penpal.teacherName)
                            ? ` | ${penpal.teacherName}`
                            : '';

                          return (
                            <div key={penpalIndex} style={{ marginBottom: penpalIndex < student.penpals.length - 1 ? '0.5rem' : '0' }}>
                              <div style={{ marginBottom: '0.25rem' }}>
                                → Your Pen Pal: {penpal.name} - {location}{teacherInfo}
                              </div>
                              <div style={{ marginLeft: '1rem' }}>
                                Interests: {penpal.interests}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}

          {/* Footer info */}
          <div style={{
            marginTop: '3rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e0e6ed',
            fontSize: '0.9rem',
            color: '#718096',
            textAlign: 'center',
            fontFamily: FONT,
            fontWeight: '300'
          }}>
            <p>Generated on {new Date(generatedAt).toLocaleDateString()}</p>
            <p>The Right Back at You Project by Carolyn Mackler</p>
          </div>
        </div>
      </main>

      {/* Print-specific styles - same as the single-school admin page, plus
          a page break before each teacher's section after the first. */}
      <style jsx>{`
        @page {
          margin: 0;
          size: auto;
        }

        @media print {
          .no-print {
            display: none !important;
          }

          .page {
            margin: 0;
            padding: 0;
          }

          .container {
            max-width: none;
            padding: 0;
          }

          main {
            padding: 0 !important;
          }

          .teacher-section {
            padding-top: 0.5in;
          }

          .new-page {
            break-before: page;
            page-break-before: always;
            margin-top: 0 !important;
          }

          .student-card {
            page-break-inside: avoid;
            break-inside: avoid;
            -webkit-column-break-inside: avoid;
            overflow: hidden;
          }
        }
      `}</style>
    </div>
  );
}

export default function GroupPenPalListPage() {
  return (
    <Suspense fallback={
      <div className="page">
        <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Loading...</h2>
        </div>
      </div>
    }>
      <GroupPenPalListContent />
    </Suspense>
  );
}
