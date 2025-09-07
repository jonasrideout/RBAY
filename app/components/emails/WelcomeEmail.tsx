// /app/components/emails/WelcomeEmail.tsx

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  teacherName: string;
  schoolName: string;
  dashboardUrl: string;
  studentRegistrationUrl: string;
}

export default function WelcomeEmail({
  teacherName,
  schoolName,
  dashboardUrl,
  studentRegistrationUrl,
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Right Back at You - Your pen pal project awaits!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to Right Back at You!</Heading>
          
          <Text style={text}>
            Dear {teacherName},
          </Text>
          
          <Text style={text}>
            Congratulations! <strong>{schoolName}</strong> has been successfully registered for the Right Back at You pen pal project. 
            We're excited to help your students connect with peers from distant schools through this meaningful literary experience.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={dashboardUrl}>
              Access Your Dashboard
            </Button>
          </Section>

          <Text style={text}>
            <strong>Next Steps:</strong>
          </Text>
          
          <Text style={text}>
            1. <strong>Review your dashboard</strong> using the button above to see your school's status and progress
          </Text>
          
          <Text style={text}>
            2. <strong>Register your students</strong> by sharing this link with them:
          </Text>
          
          <Section style={linkContainer}>
            <Link href={studentRegistrationUrl} style={link}>
              {studentRegistrationUrl}
            </Link>
          </Section>
          
          <Text style={text}>
            3. <strong>Monitor progress</strong> as students complete their profiles and we work on matching them with pen pals
          </Text>

          <Hr style={hr} />
          
          <Text style={text}>
            <strong>Important Notes:</strong>
          </Text>
          
          <Text style={text}>
            • Students will need the registration link above to sign up
            • All students must complete their profiles before matching begins
            • You can track student progress in your dashboard
            • Matching will begin once we have sufficient participating schools
          </Text>

          <Text style={text}>
            If you have any questions or need assistance, please don't hesitate to reach out. 
            We're here to make this pen pal experience as smooth and enriching as possible for your students.
          </Text>

          <Text style={text}>
            Thank you for joining the Right Back at You project!
          </Text>

          <Text style={signature}>
            Best regards,<br />
            The Right Back at You Team
          </Text>

          <Hr style={hr} />
          
          <Text style={footer}>
            This email was sent because {schoolName} was registered for the Right Back at You project.
            If you did not register for this program, please contact us immediately.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Email styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 8px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#007ee6',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
  margin: '0 auto',
};

const linkContainer = {
  textAlign: 'center' as const,
  margin: '16px 0',
  padding: '12px',
  backgroundColor: '#f8f9fa',
  border: '1px solid #e9ecef',
  borderRadius: '4px',
};

const link = {
  color: '#007ee6',
  fontSize: '14px',
  textDecoration: 'none',
  wordBreak: 'break-all' as const,
};

const signature = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '32px 8px 16px 8px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '16px 8px',
};
