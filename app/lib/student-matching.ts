// app/lib/student-matching.ts

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  interests: string[];
  schoolId: string;
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
 * Find the best matches between students from two schools
 */
export function matchStudents(
  school1Students: Student[],
  school2Students: Student[]
): StudentMatch[] {
  const matches: StudentMatch[] = [];
  const usedSchool1Students = new Set<string>();
  const usedSchool2Students = new Set<string>();
  
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
  
  // Greedily assign matches (each student can only be matched once)
  for (const match of allPossibleMatches) {
    if (!usedSchool1Students.has(match.student1Id) && 
        !usedSchool2Students.has(match.student2Id)) {
      matches.push({
        student1Id: match.student1Id,
        student2Id: match.student2Id,
        sharedInterests: match.sharedInterests,
        matchScore: match.matchScore
      });
      
      usedSchool1Students.add(match.student1Id);
      usedSchool2Students.add(match.student2Id);
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
  unmatchedSchool1: number;
  unmatchedSchool2: number;
  topSharedInterests: string[];
} {
  const totalMatches = matches.length;
  const averageMatchScore = matches.length > 0 
    ? matches.reduce((sum, match) => sum + match.matchScore, 0) / matches.length 
    : 0;
  
  const unmatchedSchool1 = school1Students.length - totalMatches;
  const unmatchedSchool2 = school2Students.length - totalMatches;
  
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
  
  return {
    totalMatches,
    averageMatchScore,
    unmatchedSchool1,
    unmatchedSchool2,
    topSharedInterests
  };
}
