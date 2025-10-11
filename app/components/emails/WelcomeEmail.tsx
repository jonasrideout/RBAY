// /app/components/emails/WelcomeEmail.tsx
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
      <Preview>
        {isAdminCreated 
          ? `Complete your school profile for ${schoolName}`
          : `Welcome to The Right Back at You Project!`
        }
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            {isAdminCreated 
              ? 'Complete Your School Profile'
              : 'Welcome to The Right Back at You Project'
            }
          </Heading>
          
          <Text style={text}>
            Hi {teacherName},
          </Text>
          
          {isAdminCreated ? (
            // Admin-created school email content
            <>
              <Text style={text}>
                You've been added to The Right Back at You Project for {schoolName}.
              </Text>

              <Text style={text}>
                To get started, please complete your school profile with details like grade level, class size, and start date. This information helps us match you with the perfect partner school.
              </Text>

              <Section style={buttonContainer}>
                <Button style={button} href={dashboardUrl}>
                  Complete Your Profile
                </Button>
              </Section>

              <Text style={text}>
                <strong>After completing your profile, you can:</strong>
              </Text>

              <Text style={text}>
                • Start registering your students for the program<br />
                • Help students create their pen-pal profiles<br />
                • Track your class's readiness for matching<br />
                • Access program resources and materials
              </Text>
            </>
          ) : (
            // Self-registered school email content
            <>
              <Text style={text}>
                Welcome to The Right Back at You Project! We're excited to help connect your students at {schoolName} with pen pals from distant schools through our literature-based program.
              </Text>

              <Text style={text}>
                Your registration is complete! Click the button below to access your teacher dashboard.
              </Text>

              <Section style={buttonContainer}>
                <Button style={button} href={dashboardUrl}>
                  Access Your Dashboard
                </Button>
              </Section>

              <Text style={text}>
                <strong>Your next steps:</strong>
              </Text>

              <Text style={text}>
                • Visit your dashboard to monitor your school's progress<br />
                • Share the student registration link with your class<br />
                • Help students complete their pen pal profiles<br />
                • Request matching when your students are ready
              </Text>

              <Text style={text}>
                <strong>Student Registration Link:</strong>
              </Text>
              
              <Text style={text}>
                Share this link with your students so they can register and create their profiles:
              </Text>
              
              <Section style={linkBox}>
                <Link href={studentRegistrationUrl} style={linkText}>
                  {studentRegistrationUrl}
                </Link>
              </Section>
            </>
          )}

          <Text style={footer}>
            We're thrilled to have you as part of our community!<br />
            <br />
            Questions? Contact us at carolyn.mackler@gmail.com<br />
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

const linkBox = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #e9ecef',
  borderRadius: '4px',
  padding: '12px',
  margin: '16px 0',
  wordBreak: 'break-all' as const,
};

const linkText = {
  color: '#2c5aa0',
  fontSize: '14px',
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
