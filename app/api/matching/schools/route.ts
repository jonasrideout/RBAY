import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface SchoolForMatching {
  id: string;
  schoolName: string;
  teacherEmail: string;
  teacherFirstName: string;
  teacherLastName: string;
  region: string;
  gradeLevels: string[];
  classSize: number;
  programStartMonth: string;
  students: { id: string }[];
}

// Calculate match score between two schools (higher = better match)
function calculateMatchScore(school1: SchoolForMatching, school2: SchoolForMatching): number {
  let score = 0;
  
  // Different regions is required (if same region, return 0)
  if (school1.region === school2.region) {
    return 0;
  }
  
  // Same start month (required)
  if (school1.programStartMonth !== school2.programStartMonth) {
    return 0;
  }
  
  // Grade level overlap (required)
  const gradesOverlap = school1.gradeLevels.some(grade => school2.gradeLevels.includes(grade));
  if (!gradesOverlap) {
    return 0;
  }
  
  // Base score for meeting requirements
  score = 100;
  
  // Bonus for exact grade match
  const exactGradeMatch = school1.gradeLevels.length === school2.gradeLevels.length && 
                         school1.gradeLevels.every(grade => school2.gradeLevels.includes(grade));
  if (exactGradeMatch) {
    score += 50;
  } else {
    // Partial bonus for more overlapping grades
    const overlapCount = school1.gradeLevels.filter(grade => school2.gradeLevels.includes(grade)).length;
    score += overlapCount * 10;
  }
  
  // Student count compatibility (school1 can have 25-30 if school2 has 25)
  const actualStudents1 = school1.students.length;
  const actualStudents2 = school2.students.length;
  const minStudents = Math.min(actualStudents1, actualStudents2);
  const maxStudents = Math.max(actualStudents1, actualStudents2);
  
  // Check if within tolerance (smaller school + 5 >= larger school)
  if (minStudents + 5 >= maxStudents) {
    score += 30;
    
    // Bonus for exact student count match
    if (actualStudents1 === actualStudents2) {
      score += 20;
    }
  } else {
    // Outside tolerance, reduce score significantly
    score -= 50;
  }
  
  return score;
}

// Find the best match for a given school
function findBestMatch(targetSchool: SchoolForMatching, candidateSchools: SchoolForMatching[]): {
  school: SchoolForMatching;
  score: number;
} | null {
  let bestMatch = null;
  let bestScore = 0;
  
  for (const candidate of candidateSchools) {
    if (candidate.id === targetSchool.id) continue; // Don't match with self
    
    const score = calculateMatchScore(targetSchool, candidate);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = candidate;
    }
  }
  
  return bestMatch && bestScore > 0 ? { school: bestMatch, score: bestScore } : null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { autoMatch = true } = body;
    
    // Get all schools ready for matching with their students
    const schoolsReadyForMatching = await prisma.school.findMany({
      where: {
        readyForMatching: true,
        // TODO: Add field to track if already matched
      },
      include: {
        students: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            grade: true,
            interests: true
          }
        }
      }
    });
    
    if (schoolsReadyForMatching.length < 2) {
      return NextResponse.json({
        success: true,
        message: `Only ${schoolsReadyForMatching.length} school(s) ready for matching. Need at least 2 schools.`,
        schoolsFound: schoolsReadyForMatching.length,
        matches: []
      });
    }
    
    // Transform to our interface
    const schools: SchoolForMatching[] = schoolsReadyForMatching.map(school => ({
      id: school.id,
      schoolName: school.schoolName,
      teacherEmail: school.teacherEmail,
      teacherFirstName: school.teacherFirstName,
      teacherLastName: school.teacherLastName,
      region: school.region || 'Unknown',
      gradeLevels: school.gradeLevels,
      classSize: school.classSize,
      programStartMonth: school.programStartMonth,
      students: school.students
    }));
    
    // Find potential matches
    const potentialMatches: {
      school1: SchoolForMatching;
      school2: SchoolForMatching;
      score: number;
      reasons: string[];
    }[] = [];
    
    const processedSchools = new Set<string>();
    
    for (const school of schools) {
      if (processedSchools.has(school.id)) continue;
      
      const bestMatch = findBestMatch(school, schools.filter(s => !processedSchools.has(s.id)));
      
      if (bestMatch && bestMatch.score > 0) {
        // Generate match reasons
        const reasons: string[] = [];
        const school2 = bestMatch.school;
        
        // Check what makes this a good match
        if (school.region !== school2.region) {
          reasons.push(`Cross-regional: ${school.region} ↔ ${school2.region}`);
        }
        
        if (school.programStartMonth === school2.programStartMonth) {
          reasons.push(`Same start time: ${school.programStartMonth}`);
        }
        
        const exactGradeMatch = school.gradeLevels.length === school2.gradeLevels.length && 
                               school.gradeLevels.every(grade => school2.gradeLevels.includes(grade));
        if (exactGradeMatch) {
          reasons.push(`Exact grade match: ${school.gradeLevels.join(', ')}`);
        } else {
          const overlap = school.gradeLevels.filter(grade => school2.gradeLevels.includes(grade));
          reasons.push(`Grade overlap: ${overlap.join(', ')}`);
        }
        
        const students1 = school.students.length;
        const students2 = school2.students.length;
        if (students1 === students2) {
          reasons.push(`Exact student count: ${students1} each`);
        } else {
          reasons.push(`Similar student count: ${students1} and ${students2}`);
        }
        
        potentialMatches.push({
          school1: school,
          school2: school2,
          score: bestMatch.score,
          reasons
        });
        
        // Mark both schools as processed
        processedSchools.add(school.id);
        processedSchools.add(school2.id);
      }
    }
    
    // Sort matches by score (best first)
    potentialMatches.sort((a, b) => b.score - a.score);
    
    return NextResponse.json({
      success: true,
      message: `Found ${potentialMatches.length} potential school matches`,
      totalSchoolsReady: schools.length,
      matches: potentialMatches.map(match => ({
        matchId: `${match.school1.id}-${match.school2.id}`,
        score: match.score,
        school1: {
          id: match.school1.id,
          name: match.school1.schoolName,
          teacher: `${match.school1.teacherFirstName} ${match.school1.teacherLastName}`,
          email: match.school1.teacherEmail,
          region: match.school1.region,
          grades: match.school1.gradeLevels,
          studentCount: match.school1.students.length,
          startMonth: match.school1.programStartMonth
        },
        school2: {
          id: match.school2.id,
          name: match.school2.schoolName,
          teacher: `${match.school2.teacherFirstName} ${match.school2.teacherLastName}`,
          email: match.school2.teacherEmail,
          region: match.school2.region,
          grades: match.school2.gradeLevels,
          studentCount: match.school2.students.length,
          startMonth: match.school2.programStartMonth
        },
        reasons: match.reasons,
        quality: match.score >= 200 ? 'Excellent' : match.score >= 150 ? 'Good' : 'Fair'
      }))
    });
    
  } catch (error: any) {
    console.error('School matching error:', error);
    return NextResponse.json(
      { error: 'Failed to find school matches: ' + (error?.message || 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get summary of schools ready for matching
    const schoolsReadyForMatching = await prisma.school.findMany({
      where: {
        readyForMatching: true,
      },
      select: {
        id: true,
        schoolName: true,
        region: true,
        gradeLevels: true,
        programStartMonth: true,
        students: {
          select: {
            id: true
          }
        }
      }
    });
    
    // Group by region and start month for analysis
    const summary = schoolsReadyForMatching.reduce((acc, school) => {
      const key = `${school.region}-${school.programStartMonth}`;
      if (!acc[key]) {
        acc[key] = {
          region: school.region,
          startMonth: school.programStartMonth,
          schools: []
        };
      }
      acc[key].schools.push({
        id: school.id,
        name: school.schoolName,
        grades: school.gradeLevels,
        studentCount: school.students.length
      });
      return acc;
    }, {} as any);
    
    return NextResponse.json({
      success: true,
      totalSchools: schoolsReadyForMatching.length,
      summary: Object.values(summary),
      readyForMatching: schoolsReadyForMatching.map(school => ({
        id: school.id,
        name: school.schoolName,
        region: school.region,
        grades: school.gradeLevels,
        studentCount: school.students.length,
        startMonth: school.programStartMonth
      }))
    });
    
  } catch (error: any) {
    console.error('Get matching status error:', error);
    return NextResponse.json(
      { error: 'Failed to get matching status' },
      { status: 500 }
    );
  }
}
