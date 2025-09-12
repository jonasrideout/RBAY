'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';

interface SchoolFormData {
  schoolName: string;
  teacherName: string;
  teacherEmail: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  gradeLevel: string;
  notes: string;
}

interface CreatedSchool {
  id: string;
  schoolName: string;
  teacherName: string;
  teacherEmail: string;
  dashboardToken: string;
  dashboardLink: string;
  registrationLink: string;
}

export default function CreateSchoolPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<'form' | 'confirmation'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [createdSchool, setCreatedSchool] = useState<CreatedSchool | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [adminUser, setAdminUser] = useState<string>('');

  const [formData, setFormData] = useState<SchoolFormData>({
    schoolName: '',
    teacherName: '',
    teacherEmail: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phoneNumber: '',
    gradeLevel: '',
    notes: ''
  });

  // Check admin auth on load
  useState(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/me');
        if (response.ok) {
          const data = await response.json();
          setAdminUser(data.email);
        } else {
          router.push('/admin/login');
        }
      } catch (error) {
        router.push('/admin/login');
      }
    };
    checkAuth();
  });

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      router.push('/');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.schoolName.trim() || !formData.teacherEmail.trim()) {
      alert('School name and teacher email are required.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/create-school', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to create school');
      }

      const result = await response.json();
      setCreatedSchool(result);
      setCurrentStep('confirmation');
    } catch (error) {
      console.error('Error creating school:', error);
      alert('Failed to create school. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLinks = async () => {
    if (!createdSchool) return;

    const text = `Teacher Dashboard: ${createdSchool.dashboardLink}\nStudent Registration: ${createdSchool.registrationLink}`;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to copy links:', error);
      alert('Failed to copy links to clipboard');
    }
  };

  const handleSendEmail = async () => {
    if (!createdSchool) return;

    setEmailStatus('sending');

    try {
      const response = await fetch('/api/admin/send-welcome-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherEmail: createdSchool.teacherEmail,
          teacherName: createdSchool.teacherName,
          schoolName: createdSchool.schoolName,
          dashboardLink: createdSchool.dashboardLink,
          registrationLink: createdSchool.registrationLink
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      setEmailStatus('sent');
      setTimeout(() => setEmailStatus('idle'), 3000);
    } catch (error) {
      console.error('Error sending email:', error);
      setEmailStatus('error');
      setTimeout(() => setEmailStatus('idle'), 3000);
    }
  };

  const renderForm = () => (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/admin/matching" className="btn btn-secondary" style={{ marginRight: '1rem' }}>
          Back to Dashboard
        </Link>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Add New School</h1>
        <p style={{ color: '#6c757d' }}>
          Enter school information and teacher contact details. The teacher will receive links to access their dashboard and add students.
        </p>
      </div>

      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto',
        background: '#fff',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid #e0e6ed',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#1a365d' }}>Required Information</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                School Name *
              </label>
              <input
                type="text"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleInputChange}
                className="form-control"
                required
                placeholder="Enter school name"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Teacher Email *
              </label>
              <input
                type="email"
                name="teacherEmail"
                value={formData.teacherEmail}
                onChange={handleInputChange}
                className="form-control"
                required
                placeholder="teacher@school.edu"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#1a365d' }}>Optional Information</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Teacher Name
              </label>
              <input
                type="text"
                name="teacherName"
                value={formData.teacherName}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Teacher's full name"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Street address"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="City"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="ST"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Zip Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="12345"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Grade Level
              </label>
              <select
                name="gradeLevel"
                value={formData.gradeLevel}
                onChange={handleInputChange}
                className="form-control"
              >
                <option value="">Select grade level</option>
                <option value="6th">6th Grade</option>
                <option value="7th">7th Grade</option>
                <option value="8th">8th Grade</option>
                <option value="9th">9th Grade</option>
                <option value="10th">10th Grade</option>
                <option value="11th">11th Grade</option>
                <option value="12th">12th Grade</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-control"
                rows={3}
                placeholder="Any additional information about this school or teacher"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Link href="/admin/matching" className="btn btn-secondary">
              Cancel
            </Link>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Creating School...' : 'Create School'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/admin/matching" className="btn btn-secondary" style={{ marginRight: '1rem' }}>
          Back to Dashboard
        </Link>
      </div>

      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '0.5rem', color: '#28a745' }}>School Created Successfully!</h1>
        <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
          {createdSchool?.schoolName} has been added to the system.
        </p>
      </div>

      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        background: '#fff',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid #e0e6ed',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#1a365d' }}>School Information</h3>
          <div style={{ 
            background: '#f8f9fa',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>School:</strong> {createdSchool?.schoolName}
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Teacher:</strong> {createdSchool?.teacherName || 'Not provided'}
            </div>
            <div>
              <strong>Email:</strong> {createdSchool?.teacherEmail}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#1a365d' }}>Generated Links</h3>
          <div style={{ 
            background: '#f8f9fa',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Teacher Dashboard:</strong>
              <div style={{ 
                fontSize: '0.9rem', 
                color: '#495057', 
                marginTop: '0.25rem',
                wordBreak: 'break-all'
              }}>
                {createdSchool?.dashboardLink}
              </div>
            </div>
            <div>
              <strong>Student Registration:</strong>
              <div style={{ 
                fontSize: '0.9rem', 
                color: '#495057', 
                marginTop: '0.25rem',
                wordBreak: 'break-all'
              }}>
                {createdSchool?.registrationLink}
              </div>
            </div>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={handleCopyLinks}
            className="btn btn-primary"
            style={{ 
              backgroundColor: copyStatus === 'copied' ? '#28a745' : '#007bff',
              width: '210px'
            }}
          >
            {copyStatus === 'copied' ? '✓ Links Copied!' : 'Copy Links'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href="/admin/schools/create" className="btn btn-secondary" style={{ marginRight: '1rem' }}>
            Add Another School
          </Link>
          <Link href="/admin/matching" className="btn btn-primary">
            View All Schools
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page">
      <Header 
        session={{ user: { email: adminUser } }} 
        onLogout={handleAdminLogout} 
      />

      <main className="container" style={{ flex: 1, paddingTop: '1.5rem' }}>
        {currentStep === 'form' ? renderForm() : renderConfirmation()}
      </main>

      <footer style={{ background: '#343a40', color: 'white', padding: '2rem 0', marginTop: '3rem' }}>
        <div className="container text-center">
          <p>&copy; 2024 The Right Back at You Project by Carolyn Mackler. Building empathy and connection through literature.</p>
        </div>
      </footer>
    </div>
  );
}
