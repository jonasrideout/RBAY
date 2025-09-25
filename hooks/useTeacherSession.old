// /hooks/useTeacherSession.ts
import { useState, useEffect } from 'react';

export interface TeacherSession {
  email: string;
  loginTime: number;
  expires: number;
}

export interface SessionData {
  user: {
    email: string;
  };
}

export interface UseTeacherSessionReturn {
  data: SessionData | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  needsWarning: boolean;
  timeUntilExpiry: number | null; // minutes until expiry
}

export function useTeacherSession(): UseTeacherSessionReturn {
  const [data, setData] = useState<SessionData | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [needsWarning, setNeedsWarning] = useState(false);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null);

  useEffect(() => {
    // Check for session warning header from middleware
    const checkSessionWarning = () => {
      // This would be set by middleware if session is near expiry
      const warningHeader = document.querySelector('meta[name="session-warning"]');
      if (warningHeader) {
        setNeedsWarning(true);
      }
    };

    // Verify session with server
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include', // Include cookies
        });

        if (response.ok) {
          const sessionInfo = await response.json();
          
          if (sessionInfo.valid && sessionInfo.session) {
            setData({
              user: {
                email: sessionInfo.session.email,
              },
            });
            setStatus('authenticated');
            
            // Calculate time until expiry
            const now = Date.now();
            const expiryTime = sessionInfo.session.expires;
            const minutesUntilExpiry = Math.floor((expiryTime - now) / (60 * 1000));
            setTimeUntilExpiry(minutesUntilExpiry);
            
            // Check if warning is needed (within 1 hour of expiry)
            if (sessionInfo.needsWarning || minutesUntilExpiry <= 60) {
              setNeedsWarning(true);
            }
          } else {
            setData(null);
            setStatus('unauthenticated');
            setNeedsWarning(false);
            setTimeUntilExpiry(null);
          }
        } else {
          setData(null);
          setStatus('unauthenticated');
          setNeedsWarning(false);
          setTimeUntilExpiry(null);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setData(null);
        setStatus('unauthenticated');
        setNeedsWarning(false);
        setTimeUntilExpiry(null);
      }
    };

    checkSession();
    checkSessionWarning();

    // Check session every 5 minutes to update expiry time and warning status
    const interval = setInterval(() => {
      checkSession();
    }, 5 * 60 * 1000);

    // Check more frequently when session is near expiry (every minute)
    let warningInterval: NodeJS.Timeout | null = null;
    if (needsWarning) {
      warningInterval = setInterval(() => {
        checkSession();
      }, 60 * 1000);
    }

    return () => {
      clearInterval(interval);
      if (warningInterval) {
        clearInterval(warningInterval);
      }
    };
  }, [needsWarning]);

  return {
    data,
    status,
    needsWarning,
    timeUntilExpiry,
  };
}

// Helper hook for session warning component
export function useSessionWarning() {
  const { needsWarning, timeUntilExpiry } = useTeacherSession();
  const [showWarning, setShowWarning] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (needsWarning && !dismissed && timeUntilExpiry !== null) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [needsWarning, dismissed, timeUntilExpiry]);

  const dismissWarning = () => {
    setDismissed(true);
    setShowWarning(false);
  };

  const extendSession = async () => {
    try {
      const response = await fetch('/api/auth/extend-session', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setDismissed(false);
        setShowWarning(false);
        // Session check will update automatically due to the interval in useTeacherSession
        return true;
      }
    } catch (error) {
      console.error('Failed to extend session:', error);
    }
    return false;
  };

  return {
    showWarning,
    timeUntilExpiry,
    dismissWarning,
    extendSession,
  };
}
