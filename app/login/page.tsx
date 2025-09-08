// /app/login/page.tsx

'use client';

import { signIn, getSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';

function LoginContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const errorParam = searchParams.get('error');

  useEffect(() => {
    // Check if user is already logged in
    getSession().then((session) => {
      if (session) {
        router.push('/dashboard');
      }
    });

    // Handle URL error parameters
    if (errorParam === 'AccessDenied') {
      setError('Access denied. Please try again or contact support.');
    } else if (errorParam) {
      setError('An error occurred during sign-in. Please try again.');
    }
  }, [errorParam, router]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: true,
      });
    } catch (error) {
      console.error('Sign-in error:', error);
      setError('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/RB@Y-logo.jpg" alt="Right Back at You" style={{ height: '40px' }} />
              The Right Back at You Project
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '2rem 1rem' 
      }}>
        <div style={{ 
          width: '100%', 
          maxWidth: '400px',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '2rem'
        }}>
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              color: '#2c5aa0', 
              marginBottom: '0.5rem' 
            }}>
              Welcome
            </h1>
            <p style={{ 
              color: '#6c757d', 
              fontSize: '1rem',
              lineHeight: '1.5'
            }}>
              Sign in to register or access your school
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ 
              marginBottom: '1.5rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.375rem',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, marginRight: '0.75rem' }}>
                  <svg 
                    style={{ height: '20px', width: '20px', color: '#ef4444' }} 
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
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: '#dc2626',
                    margin: '0 0 0.25rem 0'
                  }}>
                    Sign-in Error
                  </h3>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: '#b91c1c' 
                  }}>
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '0.75rem 1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '0.5rem',
              backgroundColor: 'white',
              color: '#374151',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1,
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = '#f9fafb';
                target.style.borderColor = '#d1d5db';
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading) {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = 'white';
                target.style.borderColor = '#e5e7eb';
              }
            }}
          >
            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <svg 
                  style={{ 
                    animation: 'spin 1s linear infinite',
                    marginLeft: '-0.25rem',
                    marginRight: '0.75rem',
                    height: '20px',
                    width: '20px',
                    color: '#374151'
                  }} 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle 
                    style={{ opacity: 0.25 }} 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  ></circle>
                  <path 
                    style={{ opacity: 0.75 }} 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing in...
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <svg 
                  style={{ width: '20px', height: '20px', marginRight: '0.75rem' }} 
                  viewBox="0 0 24 24"
                >
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </div>
            )}
          </button>

          {/* Help Text */}
          <div style={{ 
            marginTop: '1.5rem', 
            textAlign: 'center' 
          }}>
            <p style={{ 
              fontSize: '0.875rem', 
              color: '#6b7280',
              lineHeight: '1.5'
            }}>
              New users will be guided through school registration after signing in.
            </p>
          </div>

          {/* Back to Home */}
          <div style={{ 
            marginTop: '1.5rem', 
            textAlign: 'center',
            borderTop: '1px solid #e5e7eb',
            paddingTop: '1.5rem'
          }}>
            <Link 
              href="/" 
              style={{ 
                fontSize: '0.875rem', 
                color: '#3b82f6', 
                textDecoration: 'none',
                fontWeight: '500'
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
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '2rem',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <svg 
            style={{ 
              animation: 'spin 1s linear infinite',
              height: '32px',
              width: '32px',
              color: '#3b82f6'
            }} 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              style={{ opacity: 0.25 }} 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            ></circle>
            <path 
              style={{ opacity: 0.75 }} 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
