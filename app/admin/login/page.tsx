// app/admin/login/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Successful login - use window.location for more reliable redirect
        window.location.href = '/admin/matching';
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page">
      <Header />
      
      <main className="container" style={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        paddingTop: '2rem',
        paddingBottom: '2rem'
      }}>
        <div style={{
          background: '#fff',
          border: '1px solid #e0e6ed',
          borderRadius: '12px',
          padding: '2.5rem',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ 
              color: '#2c5aa0', 
              fontSize: '1.8rem', 
              marginBottom: '0.5rem',
              fontWeight: 'bold'
            }}>
              Administrator Login
            </h1>
            <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>
              Access the admin dashboard
            </p>
          </div>

          {error && (
            <div style={{
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: '6px',
              padding: '0.75rem',
              marginBottom: '1.5rem',
              color: '#c33',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#374151'
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="admin@example.com"
                disabled={isLoading}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#374151'
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your password"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                backgroundColor: isLoading ? '#9ca3af' : '#2c5aa0',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '0.875rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#1e3a8a';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#2c5aa0';
                }
              }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div style={{ 
            textAlign: 'center', 
            marginTop: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #e5e7eb'
          }}>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '0.85rem'
            }}>
              Contact the system administrator if you need access
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
