// app/admin/testing/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';

export default function AdminTestingPage() {
  const [adminUser, setAdminUser] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authResponse = await fetch('/api/admin/me');
        if (!authResponse.ok) {
          router.push('/admin/login');
          return;
        }
        const authData = await authResponse.json();
        setAdminUser(authData.email);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      router.push('/');
    }
  };

  const handleSeedData = async () => {
    if (confirm('This will create test schools. Continue?')) {
      try {
        const response = await fetch('/api/admin/seed-data', { method: 'POST' });
        const data = await response.json();
        
        if (response.ok) {
          alert('Test data seeded successfully!');
        } else {
          alert('Error seeding data: ' + (data.error || 'Unknown error'));
        }
      } catch (err) {
        alert('Error seeding data: ' + err);
      }
    }
  };

  const handleClearData = async () => {
    if (confirm('This will permanently delete ALL schools and students. Are you sure?')) {
      try {
        const response = await fetch('/api/admin/clear-data', { method: 'DELETE' });
        const data = await response.json();
        
        if (response.ok) {
          alert('All data cleared successfully!');
        } else {
          alert('Error clearing data: ' + (data.error || 'Unknown error'));
        }
      } catch (err) {
        alert('Error clearing data: ' + err);
      }
    }
  };

  return (
    <div className="page">
      <Header 
        session={{ user: { email: adminUser } }} 
        onLogout={handleAdminLogout} 
      />

      <main className="container" style={{ flex: 1, paddingTop: '1.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/admin/matching" className="btn btn-secondary" style={{ marginBottom: '1rem', display: 'inline-block' }}>
            ← Back to Dashboard
          </Link>
          
          <h1 style={{ marginBottom: '0.5rem', fontSize: '1.8rem' }}>Testing Tools</h1>
          <p className="text-school-name" style={{ margin: 0 }}>
            Database seeding and clearing functions for development and testing.
          </p>
        </div>

        <div className="card" style={{ maxWidth: '600px' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem' }}>Database Operations</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ 
              padding: '1.5rem', 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px',
              backgroundColor: '#f8f9fa'
            }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Seed Test Data</h3>
              <p style={{ marginBottom: '1rem', color: '#666', fontSize: '14px' }}>
                Creates sample schools and students for testing the matching and assignment workflows.
              </p>
              <button onClick={handleSeedData} className="btn btn-primary">
                Seed Data
              </button>
            </div>

            <div style={{ 
              padding: '1.5rem', 
              border: '2px solid #dc3545', 
              borderRadius: '8px',
              backgroundColor: '#fff5f5'
            }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#dc3545' }}>
                Clear All Data
              </h3>
              <p style={{ marginBottom: '1rem', color: '#666', fontSize: '14px' }}>
                <strong>Warning:</strong> This permanently deletes ALL schools, students, and pen pal assignments from the database. This action cannot be undone.
              </p>
              <button onClick={handleClearData} className="btn btn-danger">
                Clear Data
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer style={{ background: '#343a40', color: 'white', padding: '2rem 0', marginTop: '3rem' }}>
        <div className="container text-center">
          <p>&copy; 2024 The Right Back at You Project by Carolyn Mackler. Building empathy and connection through literature.</p>
        </div>
      </footer>
    </div>
  );
}
