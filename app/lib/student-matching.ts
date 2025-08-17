// app/lib/student-matching.ts

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  interests: string[];
  schoolId: string;
  penpalPreference?: 'ONE' | 'MULTIPLE'; // NEW: Pen pal preference
}

interface StudentMatch {
  student1Id: string;
  student2Id: string;
  sharedInterests: string[];
  matchScore: number;
}

/**
 * Calculate the match score between two students based on shared interests
 */
function calculateMatchScore(student1: Student, student2: Student): number {
  const interests1 = new Set(student1.interests);
  const interests2 = new Set(student2.interests);
  
  // Find shared interests
  const sharedInterests = [...interests1].filter(interest => interests2.has(interest));
  
  // Calculate score based on:
  // - Number of shared interests (primary factor)
  // - Grade compatibility (bonus points for same or adjacent grades)
  let score = sharedInterests.length * 10;
  
  // Grade compatibility bonus
  const grade1 = parseInt(student1.grade) || 0;
  const grade2 = parseInt(student2.grade) || 0;
  const gradeDiff = Math.abs(grade1 - grade2);
  
  if (gradeDiff === 0) {
    score += 5; // Same grade bonus
  } else if (gradeDiff === 1) {
    score += 2; // Adjacent grade bonus
  }
  
  return score;
}

/**
 * Calculate how many pen pals each student should get to ensure fair distribution
 */
function calculateDistribution(
  school1Students: Student[],
  school2Students: Student[]
): {
  school1Distribution: Map<string, number>;
  school2Distribution: Map<string, number>;
  totalConnectionsNeeded: number;
} {
  const school1Count = school1Students.length;
  const school2Count = school2Students.length;
  
  // Total connections needed = max(school1Count, school2Count)
  // This ensures everyone gets at least one pen pal
  const totalConnectionsNeeded = Math.max(school1Count, school2Count);
  
  // Calculate base distribution
  const school1BaseConnections = Math.floor(totalConnectionsNeeded / school1Count);
  const school1ExtraConnections = totalConnectionsNeeded % school1Count;
  
  const school2BaseConnections = Math.floor(totalConnectionsNeeded / school2Count);
  const school2ExtraConnections = totalConnectionsNeeded % school2Count;
  
  // Helper function to distribute connections fairly
  function distributeConnections(
    students: Student[], 
    baseConnections: number, 
    extraConnections: number
  ): Map<string, number> {
    const distribution = new Map<string, number>();
    
    // Students who prefer multiple pen pals
    const multiplePreferenceStudents = students.filter(s => s.penpalPreference === 'MULTIPLE');
    const singlePreferenceStudents = students.filter(s => s.penpalPreference !== 'MULTIPLE');
    
    // Give everyone the base number of connections
    students.forEach(student => {
      distribution.set(student.id, baseConnections);
    });
    
    // Distribute extra connections
    let extraToDistribute = extraConnections;
    
    // First, try to give extra connections to students who want multiple pen pals
    for (const student of multiplePreferenceStudents) {
      if (extraToDistribute > 0) {
        distribution.set(student.id, (distribution.get(student.id) || 0) + 1);
        extraToDistribute--;
      }
    }
    
    // If we still have extra connections and no more multiple-preference students,
    // distribute to single-preference students (they still get at least 1)
    for (const student of singlePreferenceStudents) {
      if (extraToDistribute > 0) {
        distribution.set(student.id, (distribution.get(student.id) || 0) + 1);
        extraToDistribute--;
      }
    }
    
    return distribution;
  }
  
  const school1Distribution = distributeConnections(school1Students, school1BaseConnections, school1ExtraConnections);
  const school2Distribution = distributeConnections(school2Students, school2BaseConnections, school2ExtraConnections);
  
  return {
    school1Distribution,
    school2Distribution,
    totalConnectionsNeeded
  };
}

/**
 * Find the best matches between students from two schools using many-to-many matching
 */
export function matchStudents(
  school1Students: Student[],
  school2Students: Student[]
): StudentMatch[] {
  const matches: StudentMatch[] = [];
  
  // Calculate how many pen pals each student should get
  const { school1Distribution, school2Distribution, totalConnectionsNeeded } = 
    calculateDistribution(school1Students, school2Students);
  
  // Track how many connections each student currently has
  const school1Connections = new Map<string, number>();
  const school2Connections = new Map<string, number>();
  
  // Initialize connection counts
  school1Students.forEach(student => school1Connections.set(student.id, 0));
  school2Students.forEach(student => school2Connections.set(student.id, 0));
  
  // Create all possible match combinations with scores
  const allPossibleMatches: (StudentMatch & { student1: Student; student2: Student })[] = [];
  
  for (const student1 of school1Students) {
    for (const student2 of school2Students) {
      const score = calculateMatchScore(student1, student2);
      const sharedInterests = student1.interests.filter(interest => 
        student2.interests.includes(interest)
      );
      
      allPossibleMatches.push({
        student1Id: student1.id,
        student2Id: student2.id,
        sharedInterests,
        matchScore: score,
        student1,
        student2
      });
    }
  }
  
  // Sort by match score (highest first)
  allPossibleMatches.sort((a, b) => b.matchScore - a.matchScore);
  
  // Greedily assign matches based on distribution limits
  for (const match of allPossibleMatches) {
    const student1CurrentConnections = school1Connections.get(match.student1Id) || 0;
    const student2CurrentConnections = school2Connections.get(match.student2Id) || 0;
    
    const student1MaxConnections = school1Distribution.get(match.student1Id) || 1;
    const student2MaxConnections = school2Distribution.get(match.student2Id) || 1;
    
    // Check if both students can accept another connection
    if (student1CurrentConnections < student1MaxConnections && 
        student2CurrentConnections < student2MaxConnections) {
      
      matches.push({
        student1Id: match.student1Id,
        student2Id: match.student2Id,
        sharedInterests: match.sharedInterests,
        matchScore: match.matchScore
      });
      
      // Update connection counts
      school1Connections.set(match.student1Id, student1CurrentConnections + 1);
      school2Connections.set(match.student2Id, student2CurrentConnections + 1);
    }
    
    // Stop when we've created enough total connections
    if (matches.length >= totalConnectionsNeeded) {
      break;
    }
  }
  
  return matches;
}

/**
 * Generate a summary of the matching results
 */
export function generateMatchingSummary(
  matches: StudentMatch[],
  school1Students: Student[],
  school2Students: Student[]
): {
  totalMatches: number;
  averageMatchScore: number;
  school1StudentsWithPenpals: number;
  school2StudentsWithPenpals: number;
  school1StudentsWithoutPenpals: number;
  school2StudentsWithoutPenpals: number;
  topSharedInterests: string[];
  distributionSummary: {
    school1: { studentId: string; name: string; penpalCount: number; preference: string }[];
    school2: { studentId: string; name: string; penpalCount: number; preference: string }[];
  };
} {
  const totalMatches = matches.length;
  const averageMatchScore = matches.length > 0 
    ? matches.reduce((sum, match) => sum + match.matchScore, 0) / matches.length 
    : 0;
  
  // Count how many pen pals each student has
  const school1PenpalCounts = new Map<string, number>();
  const school2PenpalCounts = new Map<string, number>();
  
  school1Students.forEach(student => school1PenpalCounts.set(student.id, 0));
  school2Students.forEach(student => school2PenpalCounts.set(student.id, 0));
  
  matches.forEach(match => {
    school1PenpalCounts.set(match.student1Id, (school1PenpalCounts.get(match.student1Id) || 0) + 1);
    school2PenpalCounts.set(match.student2Id, (school2PenpalCounts.get(match.student2Id) || 0) + 1);
  });
  
  const school1StudentsWithPenpals = Array.from(school1PenpalCounts.values()).filter(count => count > 0).length;
  const school2StudentsWithPenpals = Array.from(school2PenpalCounts.values()).filter(count => count > 0).length;
  
  const school1StudentsWithoutPenpals = school1Students.length - school1StudentsWithPenpals;
  const school2StudentsWithoutPenpals = school2Students.length - school2StudentsWithPenpals;
  
  // Find most common shared interests
  const interestCounts: Record<string, number> = {};
  matches.forEach(match => {
    match.sharedInterests.forEach(interest => {
      interestCounts[interest] = (interestCounts[interest] || 0) + 1;
    });
  });
  
  const topSharedInterests = Object.entries(interestCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([interest]) => interest);
  
  // Create distribution summary
  const distributionSummary = {
    school1: school1Students.map(student => ({
      studentId: student.id,
      name: `${student.firstName} ${student.lastName}`,
      penpalCount: school1PenpalCounts.get(student.id) || 0,
      preference: student.penpalPreference || 'ONE'
    })),
    school2: school2Students.map(student => ({
      studentId: student.id,
      name: `${student.firstName} ${student.lastName}`,
      penpalCount: school2PenpalCounts.get(student.id) || 0,
      preference: student.penpalPreference || 'ONE'
    }))
  };
  
  return {
    totalMatches,
    averageMatchScore,
    school1StudentsWithPenpals,
    school2StudentsWithPenpals,
    school1StudentsWithoutPenpals,
    school2StudentsWithoutPenpals,
    topSharedInterests,
    distributionSummary
  };
}
