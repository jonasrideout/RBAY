// /app/components/emails/MagicLinkEmail.tsx
import { Html, Head, Body, Container, Text, Link, Button } from '@react-email/components';

interface MagicLinkEmailProps {
  teacherEmail: string;
  teacherName?: string;
  magicLinkUrl: string;
  isNewUser: boolean;
}

export default function MagicLinkEmail({
  teacherEmail,
  teacherName = '',
  magicLinkUrl,
  isNewUser
}: MagicLinkEmailProps) {
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
            {isNewUser ? (
              // New User Email Content
              <>
                <Text style={greetingStyle}>Hello!</Text>
                
                <Text style={paragraphStyle}>
                  Thank you for your interest in the Right Back at You pen pal program! 
                  We're excited to help you connect your students with pen pals from distant 
                  schools through our literature-based program.
                </Text>

                <Text style={paragraphStyle}>
                  To get started, please click the link below to verify your email address:
                </Text>

                <div style={buttonContainerStyle}>
                  <Button href={magicLinkUrl} style={buttonStyle}>
                    Verify Email & Get Started
                  </Button>
                </div>

                <Text style={paragraphStyle}>
                  After verification, you'll be guided through a simple school registration 
                  process where you can:
                </Text>

                <ul style={listStyle}>
                  <li style={listItemStyle}>Register your school and classroom details</li>
                  <li style={listItemStyle}>Set up your teacher dashboard</li>
                  <li style={listItemStyle}>Begin adding students to the program</li>
                </ul>

                <div style={warningBoxStyle}>
                  <Text style={warningTextStyle}>
                    <strong>⏰ Important:</strong> This verification link will expire in 30 minutes for security.
                  </Text>
                </div>

                <Text style={paragraphStyle}>
                  Welcome to our community of educators building empathy and connection through literature!
                </Text>
              </>
            ) : (
              // Existing Teacher Email Content
              <>
                <Text style={greetingStyle}>Hello{teacherName ? ` ${teacherName}` : ''}!</Text>
                
                <Text style={paragraphStyle}>
                  Here's your secure login link to access your Right Back at You teacher dashboard:
                </Text>

                <div style={buttonContainerStyle}>
                  <Button href={magicLinkUrl} style={buttonStyle}>
                    Access Your Dashboard
                  </Button>
                </div>

                <Text style={paragraphStyle}>
                  Once logged in, you can:
                </Text>

                <ul style={listStyle}>
                  <li style={listItemStyle}>Manage your students and their profiles</li>
                  <li style={listItemStyle}>View your school's matching status</li>
                  <li style={listItemStyle}>Access program resources and updates</li>
                </ul>

                <div style={warningBoxStyle}>
                  <Text style={warningTextStyle}>
                    <strong>⏰ Important:</strong> This login link will expire in 30 minutes for your security.
                  </Text>
                </div>

                <Text style={paragraphStyle}>
                  If you didn't request this login link, you can safely ignore this email.
                </Text>
              </>
            )}

            {/* Alternative Link */}
            <div style={altLinkStyle}>
              <Text style={altLinkTextStyle}>
                If the button doesn't work, copy and paste this link into your browser:
              </Text>
              <Link href={magicLinkUrl} style={linkTextStyle}>
                {magicLinkUrl}
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div style={footerStyle}>
            <Text style={footerTextStyle}>
              This email was sent to: {teacherEmail}
            </Text>
            <Text style={footerTextStyle}>
              The Right Back at You Project by Carolyn Mackler
            </Text>
            <Text style={footerSmallTextStyle}>
              If you didn't request this email, you can safely ignore it.
            </Text>
          </div>
        </Container>
      </Body>
    </Html>
  );
}

// Styling using your CSS color scheme and typography
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

const warningBoxStyle = {
  backgroundColor: '#fff3cd',
  border: '1px solid #ffeaa7',
  borderRadius: '6px',
  padding: '16px',
  margin: '20px 0',
};

const warningTextStyle = {
  fontSize: '14px',
  fontWeight: '400',
  color: '#856404',
  margin: '0',
  lineHeight: '1.5',
};

const altLinkStyle = {
  marginTop: '30px',
  paddingTop: '20px',
  borderTop: '1px solid #e9ecef',
};

const altLinkTextStyle = {
  fontSize: '12px',
  fontWeight: '300',
  color: '#666',
  margin: '0 0 8px 0',
};

const linkTextStyle = {
  fontSize: '12px',
  color: '#2c5aa0',
  wordBreak: 'break-all' as const,
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

const footerSmallTextStyle = {
  fontSize: '12px',
  fontWeight: '300',
  color: '#999',
  margin: '16px 0 0 0',
};
