import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Button,
} from '@react-email/components';

interface PenPalAssignmentEmailProps {
  teacherName: string;
  schoolName: string;
  partnerSchoolNames: string[];
  penPalListUrl: string;
}

export default function PenPalAssignmentEmail({
  teacherName,
  schoolName,
  partnerSchoolNames,
  penPalListUrl,
}: PenPalAssignmentEmailProps) {
  const partnerText = partnerSchoolNames.length === 1 
    ? partnerSchoolNames[0]
    : partnerSchoolNames.slice(0, -1).join(', ') + ' and ' + partnerSchoolNames[partnerSchoolNames.length - 1];

  return (
    <Html>
      <Head />
      <Preview>Your pen pal assignments are ready to view!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Your Pen Pal Assignments Are Ready!</Heading>
          
          <Text style={text}>
            Hi {teacherName},
          </Text>
          
          <Text style={text}>
            Great news! Your students at {schoolName} have been matched with pen pals from {partnerText}.
          </Text>
          
          <Text style={text}>
            Click the button below to view your complete pen pal assignments and start the correspondence journey with your students.
          </Text>
          
          <Section style={buttonContainer}>
            <Button style={button} href={penPalListUrl}>
              View Pen Pal Assignments
            </Button>
          </Section>
          
          <Text style={text}>
            If the button doesn't work, you can copy and paste this link into your browser:
          </Text>
          
          <Text style={linkText}>
            {penPalListUrl}
          </Text>
          
          <Text style={footer}>
            Happy writing!<br />
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

const linkText = {
  color: '#2c5aa0',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 16px',
  wordBreak: 'break-all' as const,
};

const footer = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '32px 0 0',
  fontWeight: '300',
};
