// /app/components/emails/MagicLinkEmail.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
  Link,
} from '@react-email/components';

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
      <Preview>
        {isNewUser 
          ? 'Verify your email to get started with The Right Back at You Project'
          : 'Your login link for The Right Back at You Project'
        }
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            {isNewUser 
              ? 'Verify Your Email Address'
              : 'Your Login Link'
            }
          </Heading>
          
          <Text style={text}>
            Hi{teacherName ? ` ${teacherName}` : ''}!
          </Text>
          
          {isNewUser ? (
            // New User Email Content
            <>
              <Text style={text}>
                Thank you for your interest in The Right Back at You Project! We're excited to help you connect your students with pen pals from distant schools.
              </Text>

              <Text style={text}>
                To get started, please click the link below to verify your email address:
              </Text>

              <Section style={buttonContainer}>
                <Button style={button} href={magicLinkUrl}>
                  Verify Email & Get Started
                </Button>
              </Section>

              <Text style={text}>
                After verification, you'll be guided through a simple school registration process where you can:
              </Text>

              <Text style={text}>
                • Register your school and classroom details<br />
                • Set up your teacher dashboard<br />
                • Begin adding students to the program
              </Text>

              <Text style={warningText}>
                ⏰ Important: This verification link will expire in 30 minutes for security.
              </Text>

              <Text style={text}>
                Welcome to our community of educators building empathy and connection through literature!
              </Text>
            </>
          ) : (
            // Existing Teacher Email Content
            <>
              <Text style={text}>
                Here's your secure login link to access your teacher dashboard:
              </Text>

              <Section style={buttonContainer}>
                <Button style={button} href={magicLinkUrl}>
                  Access Your Dashboard
                </Button>
              </Section>

              <Text style={text}>
                Once logged in, you can:
              </Text>

              <Text style={text}>
                • Manage your students and their profiles<br />
                • View your school's matching status<br />
                • Inform us when all of your students have registered
              </Text>

              <Text style={warningText}>
                ⏰ Important: This login link will expire in 30 minutes for your security.
              </Text>

              <Text style={text}>
                If you didn't request this login link, you can safely ignore this email.
              </Text>
            </>
          )}

          <Section style={altLinkSection}>
            <Text style={altLinkText}>
              If the button doesn't work, copy and paste this link into your browser:
            </Text>
            <Link href={magicLinkUrl} style={linkText}>
              {magicLinkUrl}
            </Link>
          </Section>

          <Text style={footer}>
            This email was sent to: {teacherEmail}<br />
            <br />
            Right Back at You
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f8f9fa',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
  borderRadius: '8px',
};

const h1 = {
  color: '#2c5aa0',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.3',
  margin: '0 0 20px',
};

const text = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px',
  fontWeight: '300',
};

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#2c5aa0',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '500',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
  border: '2px solid #2c5aa0',
};

const warningText = {
  color: '#856404',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '20px 0 16px',
  fontWeight: '300',
  backgroundColor: '#fff3cd',
  border: '1px solid #ffeaa7',
  borderRadius: '4px',
  padding: '12px 16px',
};

const altLinkSection = {
  marginTop: '32px',
  paddingTop: '20px',
  borderTop: '1px solid #e9ecef',
};

const altLinkText = {
  color: '#666666',
  fontSize: '12px',
  lineHeight: '1.6',
  margin: '0 0 8px',
  fontWeight: '300',
};

const linkText = {
  color: '#2c5aa0',
  fontSize: '12px',
  wordBreak: 'break-all' as const,
  textDecoration: 'underline',
  fontWeight: '300',
};

const footer = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '32px 0 0',
  fontWeight: '300',
};
