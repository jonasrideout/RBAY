// /app/components/emails/WelcomeEmail.tsx
import { Html, Head, Body, Container, Text, Link, Button } from '@react-email/components';

interface WelcomeEmailProps {
  teacherName: string;
  schoolName: string;
  dashboardUrl: string;
  studentRegistrationUrl: string;
  isAdminCreated?: boolean;
}

export default function WelcomeEmail({
  teacherName,
  schoolName,
  dashboardUrl,
  studentRegistrationUrl,
  isAdminCreated = false
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <div style={headerStyle}>
            <Text style={titleStyle}>Right Back at You</Text>
            <Text style={subtitleStyle}>Building empathy and connection through literature</Text>
          </div>

          {/* Main Content */}
          <div style={contentStyle}>
            <Text style={greetingStyle}>Hello {teacherName}!</Text>
            
            {isAdminCreated ? (
              // Admin-created school email content
              <>
                <Text style={paragraphStyle}>
                  You've been added to the Right Back at You pen pal program for <strong>{schoolName}</strong>!
                </Text>

                <Text style={paragraphStyle}>
                  To get started, please click the button below to access your teacher dashboard:
                </Text>

                <div style={buttonContainerStyle}>
                  <Button href={dashboardUrl} style={buttonStyle}>
                    Access Your Dashboard
                  </Button>
                </div>

                <div style={highlightBoxStyle}>
                  <Text style={highlightTextStyle}>
                    <strong>Important First Steps:</strong>
                  </Text>
                  <Text style={highlightTextStyle}>
                    When you log in, you'll be prompted to complete your school profile with details like grade level, class size, and start date. This information helps us match you with the perfect partner school!
                  </Text>
                </div>

                <Text style={paragraphStyle}>
                  <strong>After completing your profile, you can:</strong>
                </Text>

                <ul style={listStyle}>
                  <li style={listItemStyle}>Start registering your students for the program</li>
                  <li style={listItemStyle}>Help students create their pen pal profiles</li>
                  <li style={listItemStyle}>Track your class's readiness for matching</li>
                  <li style={listItemStyle}>Access program resources and materials</li>
                </ul>

                <Text style={paragraphStyle}>
                  <strong>Student Registration Link:</strong>
                </Text>
                <Text style={paragraphStyle}>
                  Once your profile is complete, share this link with your students:
                </Text>
                <div style={linkBoxStyle}>
                  <Link href={studentRegistrationUrl} style={linkTextStyle}>
                    {studentRegistrationUrl}
                  </Link>
                </div>
              </>
            ) : (
              // Self-registered school email content
              <>
                <Text style={paragraphStyle}>
                  Welcome to the Right Back at You pen pal program! We're excited to help connect your students at <strong>{schoolName}</strong> with pen pals from distant schools through our literature-based program.
                </Text>

                <Text style={paragraphStyle}>
                  Your registration is complete! Click the button below to access your teacher dashboard:
                </Text>

                <div style={buttonContainerStyle}>
                  <Button href={dashboardUrl} style={buttonStyle}>
                    Access Your Dashboard
                  </Button>
                </div>

                <Text style={paragraphStyle}>
                  <strong>Your next steps:</strong>
                </Text>

                <ul style={listStyle}>
                  <li style={listItemStyle}>Visit your dashboard to monitor your school's progress</li>
                  <li style={listItemStyle}>Share the student registration link with your class</li>
                  <li style={listItemStyle}>Help students complete their pen pal profiles</li>
                  <li style={listItemStyle}>Request matching when your students are ready</li>
                </ul>

                <Text style={paragraphStyle}>
                  <strong>Student Registration Link:</strong>
                </Text>
                <Text style={paragraphStyle}>
                  Share this link with your students so they can register and create their profiles:
                </Text>
                <div style={linkBoxStyle}>
                  <Link href={studentRegistrationUrl} style={linkTextStyle}>
                    {studentRegistrationUrl}
                  </Link>
                </div>
              </>
            )}

            <Text style={paragraphStyle}>
              We're thrilled to have you as part of our community of educators building empathy and connection through literature!
            </Text>
          </div>

          {/* Footer */}
          <div style={footerStyle}>
            <Text style={footerTextStyle}>
              Questions? Contact us at carolyn.mackler@gmail.com
            </Text>
            <Text style={footerTextStyle}>
              The Right Back at You Project by Carolyn Mackler
            </Text>
          </div>
        </Container>
      </Body>
    </Html>
  );
}

// Styling
const bodyStyle = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  backgroundColor: '#f8f9fa',
  color: '#333',
  lineHeight: '1.6',
  margin: 0,
  padding: '20px 0',
};

const containerStyle = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  overflow: 'hidden',
};

const headerStyle = {
  textAlign: 'center' as const,
  padding: '30px 30px 20px 30px',
  backgroundColor: 'white',
  borderBottom: '1px solid #e9ecef',
};

const titleStyle = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#2c5aa0',
  margin: '0',
  marginBottom: '8px',
};

const subtitleStyle = {
  fontSize: '14px',
  fontWeight: '300',
  color: '#666',
  margin: '0',
};

const contentStyle = {
  padding: '30px',
};

const greetingStyle = {
  fontSize: '18px',
  fontWeight: '400',
  color: '#333',
  margin: '0 0 20px 0',
};

const paragraphStyle = {
  fontSize: '16px',
  fontWeight: '400',
  color: '#333',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
};

const buttonContainerStyle = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const buttonStyle = {
  backgroundColor: '#2c5aa0',
  color: 'white',
  padding: '15px 30px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: '500',
  fontSize: '16px',
  border: 'none',
  cursor: 'pointer',
};

const listStyle = {
  paddingLeft: '20px',
  margin: '16px 0',
};

const listItemStyle = {
  fontSize: '16px',
  fontWeight: '400',
  color: '#333',
  lineHeight: '1.6',
  marginBottom: '8px',
};

const highlightBoxStyle = {
  backgroundColor: '#e3f2fd',
  border: '1px solid #90caf9',
  borderRadius: '6px',
  padding: '16px',
  margin: '20px 0',
};

const highlightTextStyle = {
  fontSize: '15px',
  fontWeight: '400',
  color: '#1565c0',
  margin: '0 0 8px 0',
  lineHeight: '1.5',
};

const linkBoxStyle = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #e9ecef',
  borderRadius: '6px',
  padding: '12px',
  margin: '12px 0 20px 0',
  wordBreak: 'break-all' as const,
};

const linkTextStyle = {
  fontSize: '14px',
  color: '#2c5aa0',
  textDecoration: 'underline',
};

const footerStyle = {
  textAlign: 'center' as const,
  padding: '20px 30px',
  backgroundColor: '#f8f9fa',
  borderTop: '1px solid #e9ecef',
};

const footerTextStyle = {
  fontSize: '14px',
  fontWeight: '300',
  color: '#666',
  margin: '0 0 8px 0',
};
