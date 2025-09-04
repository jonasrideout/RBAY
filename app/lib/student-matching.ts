// app/lib/student-matching.ts

interface Student {
  id: string;
  firstName: string;
  lastInitial: string;  // Changed from lastName
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
 * Get the effective pen pal preference for a student (defaults to 'ONE' if not specified)
 */
function getEffectivePreference(student: Student): 'ONE' | 'MULTIPLE' {
  return student.penpalPreference === 'MULTIPLE' ? 'MULTIPLE' : 'ONE';
}

/**
 * Calculate how many pen pals each student should get to ensure fair distribution
 * while respecting individual preferences
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
  
  // Helper function to distribute connections with preference limits
  function distributeConnections(students: Student[]): Map<string, number> {
    const distribution = new Map<string, number>();
    
    // Separate students by preference
    const onePreferenceStudents = students.filter(s => getEffectivePreference(s) === 'ONE');
    const multiplePreferenceStudents = students.filter(s => getEffectivePreference(s) === 'MULTIPLE');
    
    // FIXED: Students with 'ONE' preference get exactly 1, never more
    onePreferenceStudents.forEach(student => {
      distribution.set(student.id, 1);
    });
    
    // Students with 'MULTIPLE' preference start with 1 and can get more
    multiplePreferenceStudents.forEach(student => {
      distribution.set(student.id, 1);
    });
    
    // Calculate how many extra connections we can distribute
    const otherSchoolSize = students === school1Students ? school2Count : school1Count;
    const maxPossibleConnections = Math.max(students.length, otherSchoolSize);
    const baseConnections = students.length; // Everyone gets at least 1
    const extraConnections = maxPossibleConnections - baseConnections;
    
    // Distribute extra connections ONLY to students who want MULTIPLE pen pals
    let extraToDistribute = Math.max(0, extraConnections);
    const multipleStudentCount = multiplePreferenceStudents.length;
    
    if (multipleStudentCount > 0 && extraToDistribute > 0) {
      // Shuffle the array so extras are distributed fairly (not just to first students)
      multiplePreferenceStudents.sort(() => Math.random() - 0.5);
      
      // Distribute extras evenly among MULTIPLE preference students
      const extraPerStudent = Math.floor(extraToDistribute / multipleStudentCount);
      const remainderExtras = extraToDistribute % multipleStudentCount;
      
      multiplePreferenceStudents.forEach((student, index) => {
        const currentCount = distribution.get(student.id) || 1;
        let extraForThisStudent = extraPerStudent;
        
        // Give remainder to first few students
        if (index < remainderExtras) {
          extraForThisStudent += 1;
        }
        
        distribution.set(student.id, currentCount + extraForThisStudent);
      });
    }
    
    return distribution;
  }
  
  const school1Distribution = distributeConnections(school1Students);
  const school2Distribution = distributeConnections(school2Students);
  
  // Calculate total connections needed (sum of all individual limits)
  const totalConnectionsNeeded = Math.min(
    Array.from(school1Distribution.values()).reduce((sum, count) => sum + count, 0),
    Array.from(school2Distribution.values()).reduce((sum, count) => sum + count, 0)
  );
  
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
  const { school1Distribution, school2Distribution } = 
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
  
  // FIXED: Greedily assign matches while respecting individual preference limits
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
  }
  
  // FIXED: Continue until we can't make any more valid matches (not just a total count)
  // The loop above will naturally stop when no more valid matches can be made
  
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
  
  // Updated to use lastInitial for privacy-friendly display format
  const distributionSummary = {
    school1: school1Students.map(student => ({
      studentId: student.id,
      name: `${student.firstName} ${student.lastInitial}.`,  // "Sarah J." format
      penpalCount: school1PenpalCounts.get(student.id) || 0,
      preference: getEffectivePreference(student)
    })),
    school2: school2Students.map(student => ({
      studentId: student.id,
      name: `${student.firstName} ${student.lastInitial}.`,  // "Sarah J." format  
      penpalCount: school2PenpalCounts.get(student.id) || 0,
      preference: getEffectivePreference(student)
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
