// /lib/penpalRequirement.ts
import { prisma } from './prisma';
import { sendPenpalPreferenceNeededEmail } from './email';

interface RequirementResult {
  required: number;
  current: number;
  matchedSchoolName: string;
}

// Mirrors the client-side calculation that used to live only in
// DashboardHeader.tsx's handleRequestPairingClick. Kept as a separate server
// copy because this needs to run from a server context (the student add/
// remove routes) without depending on already-loaded client state.
//
// Covers the common one-to-one school pairing case fully. Group pairings
// (schoolGroup / "group:" matchedWithSchoolId markers) are handled for the
// "this school is part of a group" side, but a school matched directly
// against a group is resolved by summing that group's rosters - full
// group-to-group proactive notification is not covered here; a teacher in
// that situation will still see the correct live number themselves next
// time they open their dashboard, just not get an automatic email for it.
export async function calculateRequirementForSchool(schoolId: string): Promise<RequirementResult | null> {
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    include: {
      students: { where: { isActive: true } },
      schoolGroup: {
        include: {
          schools: {
            include: { students: { where: { isActive: true } } }
          }
        }
      }
    }
  });

  if (!school || !school.matchedWithSchoolId) return null;

  const matchedId = school.matchedWithSchoolId;
  let targetClassSize = 0;
  let matchedSchoolName = 'the matched school';

  if (matchedId.startsWith('group:')) {
    const groupId = matchedId.replace('group:', '');
    const group = await prisma.schoolGroup.findUnique({
      where: { id: groupId },
      include: { schools: { include: { students: { where: { isActive: true } } } } }
    });
    if (!group) return null;
    targetClassSize = group.schools.reduce((sum, s) => sum + s.students.length, 0);
    matchedSchoolName = group.schools.map(s => s.schoolName).join(' + ');
  } else {
    const matchedSchool = await prisma.school.findUnique({
      where: { id: matchedId },
      include: { students: { where: { isActive: true } } }
    });
    if (!matchedSchool) return null;
    targetClassSize = matchedSchool.students.length;
    matchedSchoolName = matchedSchool.schoolName;
  }

  const isInGroup = !!school.schoolGroupId && !!school.schoolGroup;
  let totalStudentsInGroup: number;
  let thisSchoolStudentCount: number;

  if (isInGroup && school.schoolGroup) {
    const allGroupStudents = school.schoolGroup.schools.flatMap(s => s.students);
    totalStudentsInGroup = allGroupStudents.length;
    thisSchoolStudentCount = school.students.length;
  } else {
    totalStudentsInGroup = school.students.length;
    thisSchoolStudentCount = school.students.length;
  }

  let totalGroupRequired = 0;
  if (totalStudentsInGroup < targetClassSize) {
    totalGroupRequired = targetClassSize - totalStudentsInGroup;
  }

  let thisSchoolRequired: number;
  if (isInGroup) {
    thisSchoolRequired = Math.ceil(totalGroupRequired * (thisSchoolStudentCount / totalStudentsInGroup));
  } else {
    thisSchoolRequired = totalGroupRequired;
  }

  const thisSchoolCurrentMultiple = school.students.filter(
    s => s.penpalPreference === 'MULTIPLE'
  ).length;

  return {
    required: thisSchoolRequired,
    current: thisSchoolCurrentMultiple,
    matchedSchoolName
  };
}

// Recomputes the multiples requirement for one school and sends/clears the
// "come back and select students" email as needed. Only applies once a
// school is READY (or further along) - no point notifying a school that
// hasn't even said it's ready yet, since they'll see the real numbers
// whenever they do click Ready.
export async function checkAndNotifyPenpalRequirement(schoolId: string): Promise<void> {
  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school) return;
  if (!['READY', 'MATCHED', 'CORRESPONDING'].includes(school.status)) return;
  if (!school.matchedWithSchoolId) return;

  const result = await calculateRequirementForSchool(schoolId);
  if (!result) return;

  const needsAction = result.current < result.required;

  if (needsAction && !school.penpalPreferenceNotified) {
    // A gap just became outstanding (or grew) and we haven't already told
    // this teacher about it - send the email and mark them notified so
    // further roster changes elsewhere don't re-send while this is still
    // unresolved.
    try {
      await sendPenpalPreferenceNeededEmail({
        teacherEmail: school.teacherEmail,
        teacherName: school.teacherName,
        schoolName: school.schoolName,
        matchedSchoolName: result.matchedSchoolName,
        required: result.required,
        current: result.current
      });
    } catch (err) {
      console.error('Failed to send penpal preference needed email:', err);
    }

    await prisma.school.update({
      where: { id: schoolId },
      data: { penpalPreferenceNotified: true }
    });
  } else if (!needsAction && school.penpalPreferenceNotified) {
    // The requirement is now met (or no longer applies) - clear the flag so
    // a future gap correctly triggers a fresh email rather than staying
    // silent forever.
    await prisma.school.update({
      where: { id: schoolId },
      data: { penpalPreferenceNotified: false }
    });
  }
}

// Runs the check for a school AND its directly-matched partner school,
// since adding or removing a student on one side can change the
// requirement on the other. Call this after any student add/remove.
export async function checkAndNotifyBothSides(schoolId: string): Promise<void> {
  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school) return;

  await checkAndNotifyPenpalRequirement(schoolId);

  if (school.matchedWithSchoolId && !school.matchedWithSchoolId.startsWith('group:')) {
    await checkAndNotifyPenpalRequirement(school.matchedWithSchoolId);
  }
}
