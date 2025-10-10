"use client";

import { useState } from 'react';
import Link from 'next/link';

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

interface SchoolVerificationProps {
  onVerified: (schoolData: SchoolData) => void;
  token: string;
}

export default function SchoolVerification({ onVerified, token }: SchoolVerificationProps) {
  const [schoolName, setSchoolName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim()) return;

    setIsVerifying(true);
    setError('');

    try {
      // Get school data by token
      const response = await fetch(`/api/schools?token=${encodeURIComponent(token)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid dashboard token');
      }

      const school = data.school;
      
      // Verify school name with partial matching
      const enteredName = schoolName.trim().toLowerCase();
      const actualName = school.schoolName.toLowerCase();
      
      // Flexible matching logic
      const isExactMatch = enteredName === actualName;
      const isSubstringMatch = actualName.includes(enteredName) || enteredName.includes(actualName);
      const isWordMatch = enteredName.split(' ').some(word => 
        word.length > 2 && actualName.includes(word)
      );
      
      // Handle common abbreviations
      const normalizeSchoolName = (name: string) => {
        return name
          .replace(/elementary/gi, 'elem')
          .replace(/middle school/gi, 'ms')
          .replace(/school/gi, 'sch')
          .replace(/academy/gi, 'acad')
          .replace(/\s+/g, ' ')
          .trim();
      };
      
      const normalizedEntered = normalizeSchoolName(enteredName);
      const normalizedActual = normalizeSchoolName(actualName);
      const isAbbreviationMatch = 
        normalizedEntered === normalizedActual ||
        normalizedActual.includes(normalizedEntered) ||
        normalizedEntered.includes(normalizedActual);

      if (isExactMatch || isSubstringMatch || isWordMatch || isAbbreviationMatch) {
        onVerified(school);
      } else {
        setError(`School name doesn't match. Expected: "${school.schoolName}"`);
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

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
              <Link href="/" className="nav-link">Home</Link>
              <Link href="/register-school" className="nav-link">Register School</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container" style={{ flex: 1, paddingTop: '3rem' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ marginBottom: '1rem' }}>School Verification</h1>
          <p style={{ color: '#6c757d', marginBottom: '2rem' }}>
            Please enter your school name to access the dashboard.
          </p>

          <form onSubmit={handleVerification}>
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                type="text"
                placeholder="Enter your school name..."
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1.1rem',
                  border: '2px solid #dee2e6',
                  borderRadius: '6px',
                  textAlign: 'center'
                }}
                disabled={isVerifying}
                autoFocus
              />
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isVerifying || !schoolName.trim()}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                fontSize: '1.1rem'
              }}
            >
              {isVerifying ? (
                <>
                  <span className="loading"></span>
                  <span style={{ marginLeft: '0.5rem' }}>Verifying...</span>
                </>
              ) : (
                'Access Dashboard'
              )}
            </button>
          </form>

          <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '6px' }}>
            <h4 style={{ marginBottom: '0.5rem', color: '#495057' }}>Tips for verification:</h4>
            <ul style={{ color: '#6c757d', fontSize: '0.9rem', textAlign: 'left', margin: '0' }}>
              <li>You can use partial names (e.g., "Lincoln" for "Lincoln Elementary")</li>
              <li>Abbreviations work too (e.g., "Elem" for "Elementary")</li>
              <li>Case doesn't matter</li>
            </ul>
          </div>
        </div>
      </main>

      <footer style={{ background: '#343a40', color: 'white', padding: '2rem 0', marginTop: '3rem' }}>
        <div className="container text-center">
          <p>&copy; 2025 The Right Back at You Project by Carolyn Mackler. Building empathy and connection through literature.</p>
        </div>
      </footer>
    </div>
  );
}
