// /app/components/emails/PenpalPreferenceNeededEmail.tsx
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
} from '@react-email/components';

interface PenpalPreferenceNeededEmailProps {
  teacherName: string;
  schoolName: string;
  matchedSchoolName: string;
  required: number;
  current: number;
}

export default function PenpalPreferenceNeededEmail({
  teacherName,
  schoolName,
  matchedSchoolName,
  required,
  current,
}: PenpalPreferenceNeededEmailProps) {
  const remaining = Math.max(required - current, 0);

  return (
    <Html>
      <Head />
      <Preview>Please select students to have more than one pen pal</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>A Quick Step to Finish Pairing</Heading>

          <Text style={text}>
            Hi {teacherName},
          </Text>

          <Text style={text}>
            {matchedSchoolName} has finished registering their students, and their class is a bit
            larger than {schoolName}&rsquo;s. To make sure every one of their students gets a pen
            pal, please select {remaining} more student{remaining === 1 ? '' : 's'} from your
            class to be paired with more than one pen pal.
          </Text>

          <Text style={text}>
            Log in to your dashboard to make your selections.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href="https://penpal.carolynmackler.com/login">
              Go to Dashboard
            </Button>
          </Section>

          <Text style={footer}>
            Thanks!<br />
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

const footer = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '32px 0 0',
  fontWeight: '300',
};
