import timetableData from '../data/timetable.json';

export const SEMESTER_START = '2026-10-26'; // Monday, Oct 26, 2026
export const SEMESTER_END = '2027-02-27';   // Saturday, Feb 27, 2027
export const TOTAL_WEEKS = 18;
export const CLASS_DAYS_PER_WEEK = 6;       // Monday through Saturday
export const TOTAL_CLASS_DAYS = TOTAL_WEEKS * CLASS_DAYS_PER_WEEK; // 108 days
export const TOTAL_STUDENTS = 30;

// Parse YYYY-MM-DD string into a local Date object safely
export function parseDate(str) {
  if (!str) return new Date();
  if (str instanceof Date) return str;
  const parts = str.split('-').map(Number);
  if (parts.length === 3) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return new Date(str);
}

// Format date to YYYY-MM-DD
export function formatISODate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Calculate week number (1 - 18) for a given date
export function getWeekNumber(date = new Date()) {
  const start = parseDate(SEMESTER_START);
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffTime = target.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 1;
  const week = Math.floor(diffDays / 7) + 1;
  return Math.min(Math.max(week, 1), TOTAL_WEEKS);
}

// Return date metadata for a specific week number (1 - 18)
export function getWeekDateRange(weekNum, referenceDate = new Date()) {
  const safeWeek = Math.min(Math.max(Number(weekNum) || 1, 1), TOTAL_WEEKS);
  const start = parseDate(SEMESTER_START);
  
  const weekStart = new Date(start);
  weekStart.setDate(start.getDate() + (safeWeek - 1) * 7);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const endLimit = parseDate(SEMESTER_END);
  const actualEnd = weekEnd > endLimit ? endLimit : weekEnd;

  const currentWeek = getWeekNumber(referenceDate);

  // Determine cycle number (Each cycle is 5 weeks of 6 days = 30 days)
  const cycleNumber = Math.floor((safeWeek - 1) / 5) + 1;
  const weekInCycle = ((safeWeek - 1) % 5) + 1;

  return {
    weekNum: safeWeek,
    cycleNumber,
    weekInCycle,
    startDate: weekStart,
    endDate: actualEnd,
    startDateString: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    endDateString: actualEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    label: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${actualEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
    isCurrent: currentWeek === safeWeek,
    isPast: currentWeek > safeWeek,
    isUpcoming: currentWeek < safeWeek,
  };
}

// Return all 18 weeks list (dynamically calculated relative to reference date)
export function getAllWeeks(referenceDate = new Date()) {
  const weeks = [];
  for (let w = 1; w <= TOTAL_WEEKS; w++) {
    weeks.push(getWeekDateRange(w, referenceDate));
  }
  return weeks;
}

// Generate the 6 class days + Sunday for a given week
export function getDaysForWeek(weekNum, studentsList = [], referenceDate = new Date()) {
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const start = parseDate(SEMESTER_START);
  const weekStart = new Date(start);
  weekStart.setDate(start.getDate() + (weekNum - 1) * 7);

  const todayStr = formatISODate(referenceDate);

  const days = [];
  for (let i = 0; i < 6; i++) {
    const curDate = new Date(weekStart);
    curDate.setDate(weekStart.getDate() + i);
    const iso = formatISODate(curDate);

    const dayName = dayNames[i];
    const scheduleInfo = timetableData.schedule[dayName];
    
    // Calculate global class day index (0 to 107)
    const classDayIndex = (weekNum - 1) * 6 + i;
    // Student slot 1 to 30
    const studentSlotNumber = (classDayIndex % 30) + 1;
    const studentSlotKey = `#${String(studentSlotNumber).padStart(2, '0')}`;

    // Find student in provided roster
    const assignedStudent = studentsList.find(s => 
      s.id === studentSlotNumber || s.slotNumber === studentSlotKey
    ) || null;

    const isToday = iso === todayStr;
    const isPast = iso < todayStr;
    const isUpcoming = iso > todayStr;

    days.push({
      dayName,
      date: curDate,
      isoDate: iso,
      dateString: curDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDateString: curDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      scheduleInfo,
      classDayIndex: classDayIndex + 1, // 1-based (1 to 108)
      studentSlotNumber,
      slotLabel: studentSlotKey,
      assignedStudent,
      isToday,
      isPast,
      isUpcoming,
      isOffDay: false
    });
  }

  // Also include Sunday for full week view
  const sundayDate = new Date(weekStart);
  sundayDate.setDate(weekStart.getDate() + 6);
  const sundayIso = formatISODate(sundayDate);
  days.push({
    dayName: 'Sunday',
    date: sundayDate,
    isoDate: sundayIso,
    dateString: sundayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    fullDateString: sundayDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
    scheduleInfo: null,
    classDayIndex: null,
    studentSlotNumber: null,
    slotLabel: null,
    assignedStudent: null,
    isToday: sundayIso === todayStr,
    isPast: sundayIso < todayStr,
    isUpcoming: sundayIso > todayStr,
    isOffDay: true
  });

  return days;
}

// Find information for any arbitrary date (YYYY-MM-DD or Date)
export function getInfoForDate(targetDate, studentsList = []) {
  const d = parseDate(targetDate);
  const weekNum = getWeekNumber(d);
  const days = getDaysForWeek(weekNum, studentsList);
  const iso = formatISODate(d);
  const dayInfo = days.find(day => day.isoDate === iso) || null;

  return {
    weekNum,
    weekInfo: getWeekDateRange(weekNum),
    dayInfo,
  };
}

// Get all duty dates across all 18 weeks for a specific student ID (1 - 30)
export function getStudentDutyDates(studentId) {
  const duties = [];
  const start = parseDate(SEMESTER_START);
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  for (let classDay = 0; classDay < TOTAL_CLASS_DAYS; classDay++) {
    const slot = (classDay % TOTAL_STUDENTS) + 1;
    if (slot === Number(studentId)) {
      const weekNum = Math.floor(classDay / 6) + 1;
      const dayIndex = classDay % 6; // 0 = Mon, 5 = Sat

      const dutyDate = new Date(start);
      dutyDate.setDate(start.getDate() + (weekNum - 1) * 7 + dayIndex);

      const dayName = dayNames[dayIndex];
      const scheduleInfo = timetableData.schedule[dayName];

      duties.push({
        turnIndex: duties.length + 1,
        classDay: classDay + 1,
        weekNum,
        dayName,
        date: dutyDate,
        isoDate: formatISODate(dutyDate),
        dateString: dutyDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        scheduleInfo
      });
    }
  }
  return duties;
}

export { timetableData };
