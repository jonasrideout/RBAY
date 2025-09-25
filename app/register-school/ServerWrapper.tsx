// /app/register-school/ServerWrapper.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import RegisterSchoolClient from './RegisterSchoolClient';

interface VerificationData {
  isEmailVerified: boolean;
  verifiedEmail: string;
  isAdminMode: boolean;
  isVerificationMode: boolean;
}

async function validateRegistrationToken(searchParams: { [key: string]: string | string[] | undefined }): Promise<VerificationData> {
  const isAdminMode = searchParams.admin === 'true';
  const isVerificationMode = searchParams.verified === 'true';

  // If not in verification mode, return default state
  if (!isVerificationMode) {
    return {
      isEmailVerified: false,
      verifiedEmail: '',
      isAdminMode,
      isVerificationMode: false
    };
  }

  // Get registration token from cookies
  const cookieStore = cookies();
  const registrationTokenCookie = cookieStore.get('registration-token');

  if (!registrationTokenCookie?.value) {
    console.log('No registration token found, redirecting to login');
    redirect('/login?error=verification_expired');
  }

  try {
    // Decode and validate registration token
    const tokenData = JSON.parse(Buffer.from(registrationTokenCookie.value, 'base64').toString());
    const now = Date.now();

    // Check token expiration and validity
    if (!tokenData.expires || !tokenData.email || now > tokenData.expires) {
      console.log('Registration token expired or invalid, redirecting to login');
      redirect('/login?error=verification_expired');
    }

    console.log('Registration token validated for email:', tokenData.email);

    return {
      isEmailVerified: true,
      verifiedEmail: tokenData.email,
      isAdminMode,
      isVerificationMode: true
    };

  } catch (error) {
    console.error('Error validating registration token:', error);
    redirect('/login?error=verification_failed');
  }
}

interface ServerWrapperProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ServerWrapper({ searchParams }: ServerWrapperProps) {
  const verificationData = await validateRegistrationToken(searchParams);

  return (
    <RegisterSchoolClient 
      isEmailVerified={verificationData.isEmailVerified}
      verifiedEmail={verificationData.verifiedEmail}
      isAdminMode={verificationData.isAdminMode}
      isVerificationMode={verificationData.isVerificationMode}
    />
  );
}
