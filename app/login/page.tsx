'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const errorParam = searchParams?.get('error');

  useEffect(() => {
    // Handle URL error parameters from magic link verification
    if (errorParam === 'invalid_link') {
      setError('Invalid login link. Please request a new one.');
    } else if (errorParam === 'invalid_or_expired') {
      setError('Login link has expired. Please request a new one.');
    } else if (errorParam === 'teacher_not_found') {
      setError('Teacher account not found. Please register your school first.');
    } else if (errorParam === 'verification_failed') {
      setError('Login verification failed. Please try again.');
    } else if (errorParam === 'AccessDenied') {
      setError('Access denied. Please try again or contact support.');
    } else if (errorParam === 'no_code') {
      setError('Authentication was cancelled. Please try again.');
    } else if (errorParam === 'callback_error') {
      setError('An error occurred during authentication. Please try again.');
    } else if (errorParam) {
      setError('An error occurred during sign-in. Please try again.');
    }
  }, [errorParam, router]);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch('/api/auth/send-magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.needsRegistration) {
          setError('No school found for this email address. Please register your school first.');
        } else {
          throw new Error(data.error || 'Failed to send login link');
        }
        return;
      }

      setSuccess(true);
      setEmail(''); // Clear email field
    } catch (error) {
      console.error('Send magic link error:', error);
      setError(error instanceof Error ? error.message : 'Failed to send login link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewLink = () => {
    setSuccess(false);
    setError('');
  };

  if (success) {
    return (
      <div className="page">
        <Header showLogin={false} />
        <main className="container" style={{ flex: 1, paddingTop: '2rem' }}>
          <div className="card" style={{ 
            maxWidth: '400px', 
            margin: '0 auto',
            textAlign: 'center' 
          }}>
            {/* Success Icon */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#28a745',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto'
              }}>
                <svg style={{ width: '30px', height: '30px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h1 className="text-h2" style={{ marginBottom: '1rem' }}>
              Check Your Email
            </h1>
            
            <p className="text-meta-info" style={{ marginBottom: '2rem' }}>
              We've sent you a secure login link. Click the link in your email to access your teacher dashboard.
            </p>

            <div className="alert alert-warning" style={{ marginBottom: '2rem' }}>
              <strong>Note:</strong> The login link expires in 30 minutes for your security.
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <p className="text-meta-info" style={{ marginBottom: '1rem' }}>
                Don't see the email? Check your spam folder or:
              </p>
              <button
                onClick={handleNewLink}
                className="nav-link"
                style={{ background: 'none', border: 'none' }}
              >
                Send another login link
              </button>
            </div>

            <div style={{ 
              borderTop: '1px solid #e9ecef',
              paddingTop: '1.5rem'
            }}>
              <a href="/" className="nav-link">
                ← Back to Home
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <Header showLogin={false} />

      <main className="container" style={{ flex: 1, paddingTop: '2rem' }}>
        <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 className="text-h1" style={{ marginBottom: '0.5rem' }}>
              Welcome
            </h1>
            <p className="text-meta-info">
              Enter your email to receive a secure login link
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, marginRight: '0.75rem' }}>
                  <svg 
                    style={{ height: '20px', width: '20px', color: '#c53030' }} 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-normal" style={{ color: '#c53030', margin: '0 0 0.25rem 0' }}>
                    Sign-in Error
                  </h3>
                  <div style={{ color: '#721c24' }}>
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Magic Link Form */}
          <form onSubmit={handleSendMagicLink}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@school.edu"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="loading" style={{ marginRight: '0.75rem' }}></div>
                  Sending Login Link...
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg 
                    style={{ width: '20px', height: '20px', marginRight: '0.75rem' }} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  Send Login Link
                </div>
              )}
            </button>
          </form>

          {/* Help Text */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p className="text-meta-info">
              New teachers should register their school first, then return here to sign in.
            </p>
          </div>

          {/* Back to Home */}
          <div style={{ 
            marginTop: '1.5rem', 
            textAlign: 'center',
            borderTop: '1px solid #e9ecef',
            paddingTop: '1.5rem'
          }}>
            <a href="/" className="nav-link">
              ← Back to Home
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="page">
        <div className="container" style={{ textAlign: 'center', paddingTop: '2rem' }}>
          <div className="loading" style={{ margin: '0 auto' }}></div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
