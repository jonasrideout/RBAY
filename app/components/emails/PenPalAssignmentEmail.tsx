import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface PenPalAssignmentEmailProps {
  teacherName: string;
  schoolName: string;
  partnerSchoolNames: string[];
}

export default function PenPalAssignmentEmail({
  teacherName,
  schoolName,
  partnerSchoolNames,
}: PenPalAssignmentEmailProps) {
  const partnerText = partnerSchoolNames.length === 1 
    ? partnerSchoolNames[0]
    : partnerSchoolNames.slice(0, -1).join(', ') + ' and ' + partnerSchoolNames[partnerSchoolNames.length - 1];

  return (
    <Html>
      <Head />
      <Preview>Your pen pal assignments are ready!</Preview>
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
            To view your pen pal assignments and download the list for your class, please log in to your dashboard at:
          </Text>
          
          <Text style={linkText}>
            https://penpal.carolynmackler.com/login
          </Text>
          
          <Text style={text}>
            Once logged in, click the "Download Pen Pals" button to get your formatted list.
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
