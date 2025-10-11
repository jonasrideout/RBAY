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
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
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
          // Show email verification step for new teachers
          setVerificationEmail(email.trim().toLowerCase());
          setShowVerification(true);
          setError('');
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
    setShowVerification(false);
    setError('');
  };

  const handleVerifyEmail = () => {
    setShowVerification(false);
    setEmail(verificationEmail);
    handleSendMagicLink({ preventDefault: () => {} } as React.FormEvent);
  };

  // Email verification screen for new teachers
  if (showVerification) {
    return (
      <div className="page">
        <Header showLogin={false} />
        <main className="container" style={{ flex: 1, paddingTop: '3rem', paddingBottom: '3rem' }}>
          <div className="card" style={{ 
            maxWidth: '600px', 
            margin: '0 auto'
          }}>
            <h1 style={{ 
              fontSize: '1.8rem',
              fontWeight: 300,
              color: '#2c5aa0',
              marginBottom: '1.5rem',
              textAlign: 'center',
              lineHeight: 1.3
            }}>
              Welcome to The Right Back at You Project!
            </h1>
            
            <p style={{ 
              fontSize: '1rem',
              fontWeight: 300,
              color: '#555',
              marginBottom: '2rem',
              lineHeight: 1.6,
              textAlign: 'center'
            }}>
              We'd love to have you join our pen-pal program! To get started, we need to verify your email address.
            </p>

            <div className="alert alert-warning" style={{ 
              marginBottom: '2rem',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, marginRight: '0.75rem' }}>
                  <svg style={{ width: '20px', height: '20px', color: '#856404' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 300, marginBottom: '0.5rem', color: '#555' }}>
                    Email to verify: <strong style={{ fontWeight: 500 }}>{verificationEmail}</strong>
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 300, color: '#666' }}>
                    After verification, you'll be guided through school registration to join the program.
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <button
                onClick={handleVerifyEmail}
                className="btn-blue"
                style={{ 
                  width: '100%',
                  marginBottom: '1rem'
                }}
              >
                Verify Email Address
              </button>

              <button
                onClick={() => {
                  setShowVerification(false);
                  setEmail('');
                  setVerificationEmail('');
                }}
                style={{ 
                  background: 'none', 
                  border: 'none',
                  color: '#2c5aa0',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: 300,
                  textDecoration: 'underline',
                  display: 'block',
                  margin: '0 auto'
                }}
              >
                Use a different email address
              </button>
            </div>

            <div style={{ 
              borderTop: '1px solid #e9ecef',
              paddingTop: '1.5rem',
              textAlign: 'center'
            }}>
              <Link 
                href="/" 
                style={{
                  color: '#2c5aa0',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 300
                }}
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (success) {
    return (
      <div className="page">
        <Header showLogin={false} />
        <main className="container" style={{ flex: 1, paddingTop: '3rem', paddingBottom: '3rem' }}>
          <div className="card" style={{ 
            maxWidth: '600px', 
            margin: '0 auto'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h1 style={{ 
                fontSize: '1.8rem',
                fontWeight: 300,
                color: '#2c5aa0',
                marginBottom: '1.5rem',
                lineHeight: 1.3
              }}>
                Welcome to The Right Back At You Project
              </h1>
              
              <p style={{ 
                fontSize: '1rem',
                fontWeight: 300,
                color: '#555',
                marginBottom: '1.5rem',
                lineHeight: 1.6
              }}>
                Check your email for a secure link to register your class.
              </p>

              <p style={{ 
                fontSize: '0.9rem',
                fontWeight: 300,
                color: '#666',
                marginBottom: '2rem'
              }}>
                The login link expires in 30 minutes for your security.
              </p>
            </div>

            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <button
                onClick={handleNewLink}
                className="btn-blue"
                style={{ 
                  width: 'auto',
                  display: 'inline-flex'
                }}
              >
                Send another login link
              </button>
            </div>

            <p style={{ 
              fontSize: '0.9rem',
              fontWeight: 300,
              color: '#666',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              You can close this tab now
            </p>

            <div style={{ 
              borderTop: '1px solid #e9ecef',
              paddingTop: '1.5rem',
              textAlign: 'center'
            }}>
              <Link 
                href="/" 
                style={{
                  color: '#2c5aa0',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 300
                }}
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <Header showLogin={false} />

      <main className="container" style={{ flex: 1, paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ 
              fontSize: '1.8rem',
              fontWeight: 300,
              color: '#2c5aa0',
              marginBottom: '1rem',
              lineHeight: 1.3
            }}>
              Welcome to the Right Back At You Project
            </h1>
            <p style={{ 
              fontSize: '0.95rem',
              fontWeight: 300,
              color: '#666'
            }}>
              Enter your email to receive a secure link to register your class.
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
                  <h3 style={{ 
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    color: '#c53030', 
                    margin: '0 0 0.25rem 0' 
                  }}>
                    Sign-in Error
                  </h3>
                  <div style={{ 
                    fontSize: '0.9rem',
                    fontWeight: 300,
                    color: '#721c24' 
                  }}>
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Magic Link Form */}
          <form onSubmit={handleSendMagicLink}>
            <div className="form-group">
              <label htmlFor="email" className="form-label" style={{ fontWeight: 300 }}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                required
                disabled={isLoading}
              />
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="btn-blue"
                style={{ 
                  width: 'auto',
                  display: 'inline-flex'
                }}
              >
                {isLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="loading" style={{ marginRight: '0.75rem' }}></div>
                    Sending Login Link...
                  </div>
                ) : (
                  'Send Login Link'
                )}
              </button>
            </div>
          </form>

          {/* Back to Home */}
          <div style={{ 
            marginTop: '2rem', 
            textAlign: 'center',
            borderTop: '1px solid #e9ecef',
            paddingTop: '1.5rem'
          }}>
            <Link 
              href="/" 
              style={{
                color: '#2c5aa0',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: 300
              }}
            >
              ← Back to Home
            </Link>
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
