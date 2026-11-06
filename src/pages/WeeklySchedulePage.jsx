import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarDays, 
  CheckCircle2, 
  Clock, 
  Coffee, 
  Moon, 
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles,
  Search,
  BookOpen,
  MapPin
} from 'lucide-react';
import { useApp } from '../context/useApp';
import { 
  getAllWeeks, 
  getDaysForWeek, 
  getWeekNumber, 
  getWeekDateRange,
  TOTAL_WEEKS,
  getInfoForDate,
  formatISODate
} from '../utils/semester';

export default function WeeklySchedulePage() {
  const { students, currentDate } = useApp();
  const now = currentDate || new Date();
  
  // Default to dynamic current week
  const currentWeekNum = getWeekNumber(now);
  const [selectedWeek, setSelectedWeek] = useState(currentWeekNum);
  
  // Auto-sync selected week when live clock crosses into a new week
  const prevWeekRef = useRef(currentWeekNum);
  useEffect(() => {
    if (prevWeekRef.current !== currentWeekNum) {
      setSelectedWeek(currentWeekNum);
      prevWeekRef.current = currentWeekNum;
    }
  }, [currentWeekNum]);
  
  // Date finder state
  const [searchDate, setSearchDate] = useState(formatISODate(now));
  const [searchedResult, setSearchedResult] = useState(null);

  // All 18 weeks metadata calculated dynamically from reference date
  const allWeeks = getAllWeeks(now);
  const currentWeekMeta = getWeekDateRange(selectedWeek, now);
  
  // Days for the selected week
  const weekDays = getDaysForWeek(selectedWeek, students, now);

  // Handle date search
  const handleDateSearch = (dateStr) => {
    setSearchDate(dateStr);
    if (!dateStr) {
      setSearchedResult(null);
      return;
    }
    const info = getInfoForDate(dateStr, students);
    setSearchedResult(info);
  };

  const jumpToWeek = (weekNum) => {
    setSelectedWeek(weekNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border-2 border-[#1c1c17] shadow-[6px_6px_0px_#1c1c17]">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#ffe24c] border-2 border-[#1c1c17] shadow-[3px_3px_0px_#1c1c17] flex items-center justify-center shrink-0">
            <CalendarDays className="w-6 h-6 text-[#1c1c17]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#1c1c17]">
                Weekly Projector Carrier Schedule
              </h1>
              <span className="font-['Space_Grotesk'] text-xs font-bold bg-[#a6f2cf] text-[#002115] px-2.5 py-0.5 rounded-full border border-[#1c1c17] shadow-[1px_1px_0px_#1c1c17]">
                18 Weeks Total
              </span>
            </div>
            <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#48454d] mt-1">
              RUPP • Room 205 (Building B) • 26 Oct 2026 to 27 Feb 2027
            </p>
          </div>
        </div>

        {/* Action & Date Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <div className="flex items-center gap-2 bg-[#f6f3ea] px-3.5 py-2 rounded-xl border-2 border-[#1c1c17] shadow-[2px_2px_0px_#1c1c17]">
            <Clock className="w-4 h-4 text-[#ba1a1a] shrink-0" />
            <div className="font-['Space_Grotesk'] text-xs font-bold text-[#1c1c17] flex items-center gap-1.5 flex-wrap">
              <span>Today: {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' })}</span>
              <span className="text-[#cac4ce]">|</span>
              <span className="text-[#ba1a1a]">Week {currentWeekNum}</span>
            </div>
          </div>

          <Link
            to="/timetable"
            className="inline-flex items-center justify-center gap-1.5 bg-[#ffe24c] hover:bg-yellow-300 text-[#1c1c17] px-3.5 py-2 rounded-xl border-2 border-[#1c1c17] font-['Space_Grotesk'] text-xs font-bold shadow-[2px_2px_0px_#1c1c17] active:translate-x-[1px] active:translate-y-[1px] transition-all"
          >
            <BookOpen className="w-4 h-4 text-[#1c1c17]" />
            <span>Master Timetable →</span>
          </Link>
        </div>
      </div>

      {/* 2. DATE FINDER / WEEK CALCULATOR TOOL */}
      <div className="bg-[#fcf9f0] p-4 sm:p-5 rounded-2xl border-2 border-[#1c1c17] shadow-[4px_4px_0px_#1c1c17]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Search className="w-5 h-5 text-[#62597c]" />
            <div>
              <h3 className="font-['Space_Grotesk'] text-sm sm:text-base font-bold text-[#1c1c17]">
                Semester Date & Week Finder
              </h3>
              <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#48454d]">
                Pick any calendar day to find what week it is in and who is bringing the projector:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="date"
              min="2026-10-26"
              max="2027-02-27"
              value={searchDate}
              onChange={(e) => handleDateSearch(e.target.value)}
              className="bg-white border-2 border-[#1c1c17] rounded-xl px-3 py-1.5 font-['Space_Grotesk'] text-xs font-bold shadow-[2px_2px_0px_#1c1c17] focus:outline-none focus:ring-2 focus:ring-[#ffe24c]"
            />
            {searchedResult && (
              <button
                type="button"
                onClick={() => jumpToWeek(searchedResult.weekNum)}
                className="bg-[#1c1c17] text-[#ffe24c] hover:bg-[#333] px-3 py-1.5 rounded-xl font-['Space_Grotesk'] text-xs font-bold shadow-[2px_2px_0px_#1c1c17] transition-all cursor-pointer"
              >
                Jump to Week {searchedResult.weekNum}
              </button>
            )}
          </div>
        </div>

        {searchedResult && searchedResult.dayInfo && (
          <div className="mt-3 pt-3 border-t border-[#1c1c17]/20 flex flex-wrap items-center justify-between gap-2 text-xs font-['Space_Grotesk']">
            <div className="flex items-center gap-2">
              <span className="bg-[#ffe24c] px-2 py-0.5 rounded font-bold border border-[#1c1c17]">
                Week {searchedResult.weekNum} of 18
              </span>
              <span className="font-bold text-[#1c1c17]">
                {searchedResult.dayInfo.fullDateString}
              </span>
              {searchedResult.dayInfo.isOffDay ? (
                <span className="text-[#93000a] font-bold">(Sunday Off Day)</span>
              ) : (
                <span className="text-[#62597c] font-bold">
                  Carrier: {searchedResult.dayInfo.slotLabel} {searchedResult.dayInfo.assignedStudent?.name || 'Classmate'}
                </span>
              )}
            </div>
            {!searchedResult.dayInfo.isOffDay && searchedResult.dayInfo.scheduleInfo?.periods && (
              <span className="text-[#48454d] text-[11px]">
                Subjects: {searchedResult.dayInfo.scheduleInfo.periods.map(p => p.subject).join(' • ')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3. WEEK SELECTOR BAR (WEEKS 1 TO 18) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-[#1c1c17] shadow-[5px_5px_0px_#1c1c17] flex flex-col gap-4">
        {/* Navigation & Current Week Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#1c1c17]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedWeek(w => Math.max(1, w - 1))}
              disabled={selectedWeek === 1}
              className="p-2 rounded-xl border-2 border-[#1c1c17] bg-[#f6f3ea] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed shadow-[2px_2px_0px_#1c1c17] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
              title="Previous Week"
            >
              <ChevronLeft className="w-5 h-5 text-[#1c1c17]" />
            </button>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-['Space_Grotesk'] text-xl sm:text-2xl font-bold text-[#1c1c17]">
                  Week {selectedWeek} of {TOTAL_WEEKS}
                </span>
                {selectedWeek === 18 ? (
                  <span className="bg-[#ffdad6] text-[#93000a] font-['Space_Grotesk'] text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full border border-[#1c1c17] shadow-[1px_1px_0px_#1c1c17]">
                    Final Exam Week 🎓
                  </span>
                ) : currentWeekMeta.isCurrent ? (
                  <span className="bg-[#ffe24c] text-[#1c1c17] font-['Space_Grotesk'] text-[11px] font-bold uppercase px-2 py-0.5 rounded-full border border-[#1c1c17] shadow-[1px_1px_0px_#1c1c17] animate-pulse">
                    Current Week
                  </span>
                ) : null}
              </div>
              <p className="font-['Plus_Jakarta_Sans'] text-xs font-semibold text-[#62597c]">
                {selectedWeek === 18 
                  ? `${currentWeekMeta.label} • Final Semester Examination Week (No Regular Projector Duty)`
                  : `${currentWeekMeta.label} • Cycle ${currentWeekMeta.cycleNumber} (Class Days ${(selectedWeek - 1) * 6 + 1}–${Math.min(selectedWeek * 6, 108)})`
                }
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedWeek(w => Math.min(TOTAL_WEEKS, w + 1))}
              disabled={selectedWeek === TOTAL_WEEKS}
              className="p-2 rounded-xl border-2 border-[#1c1c17] bg-[#f6f3ea] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed shadow-[2px_2px_0px_#1c1c17] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
              title="Next Week"
            >
              <ChevronRight className="w-5 h-5 text-[#1c1c17]" />
            </button>
          </div>

          {/* Quick Jump to Today */}
          <button
            type="button"
            onClick={() => setSelectedWeek(currentWeekNum)}
            className={`px-3.5 py-1.5 rounded-xl border-2 border-[#1c1c17] font-['Space_Grotesk'] text-xs font-bold transition-all shadow-[2px_2px_0px_#1c1c17] cursor-pointer ${
              selectedWeek === currentWeekNum 
                ? 'bg-[#1c1c17] text-[#ffe24c]' 
                : 'bg-[#ffe24c] text-[#1c1c17] hover:bg-yellow-300'
            }`}
          >
            Jump to Today (Week {currentWeekNum})
          </button>
        </div>

        {/* 18-Week Horizontal Pill Grid */}
        <div className="flex flex-col gap-2">
          <p className="font-['Space_Grotesk'] text-xs font-bold uppercase text-[#48454d] tracking-wider">
            All 18 Semester Weeks:
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-1.5">
            {allWeeks.map(w => {
              const isSelected = w.weekNum === selectedWeek;
              const isCurrent = w.isCurrent;
              const isFinalExam = w.weekNum === 18;
              return (
                <button
                  key={w.weekNum}
                  type="button"
                  onClick={() => setSelectedWeek(w.weekNum)}
                  className={`p-2 rounded-xl border-2 text-center transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-[#1c1c17] bg-[#1c1c17] text-white shadow-[2px_2px_0px_#1c1c17]'
                      : isCurrent
                      ? 'border-[#1c1c17] bg-[#ffe24c] text-[#1c1c17] shadow-[2px_2px_0px_#1c1c17] font-bold'
                      : isFinalExam
                      ? 'border-[#1c1c17] bg-[#ffdad6] text-[#93000a] shadow-[2px_2px_0px_#1c1c17] font-bold hover:bg-[#ffb4ab]'
                      : w.isPast
                      ? 'border-[#1c1c17]/40 bg-[#f6f3ea] text-[#48454d] hover:border-[#1c1c17]'
                      : 'border-[#1c1c17]/30 bg-white text-[#1c1c17] hover:border-[#1c1c17]'
                  }`}
                >
                  <div className="font-['Space_Grotesk'] text-xs font-bold">
                    Week {w.weekNum}
                  </div>
                  <div className={`text-[10px] font-bold truncate ${
                    isFinalExam 
                      ? (isSelected ? 'text-[#ffdad6]' : 'text-[#ba1a1a]')
                      : 'opacity-75'
                  }`}>
                    {isFinalExam ? 'Final Exam' : w.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  {isCurrent && (
                    <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#ba1a1a] border border-white rounded-full" />
                  )}
                  {isFinalExam && !isCurrent && (
                    <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full border border-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Final Exam Banner when Week 18 is Selected */}
      {selectedWeek === 18 && (
        <div className="bg-[#ffe24c] border-2 border-[#1c1c17] rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#1c1c17] flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-white border-2 border-[#1c1c17] shadow-[2px_2px_0px_#1c1c17] flex items-center justify-center font-bold text-xl shrink-0">
            🎓
          </div>
          <div>
            <h3 className="font-['Space_Grotesk'] font-bold text-base sm:text-lg text-[#1c1c17] uppercase tracking-wide">
              Semester 1 Final Examination Week
            </h3>
            <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#211b00] font-medium mt-0.5">
              Week 18 (Feb 22 – Feb 27, 2027) is official final exam week for Class E2 Gen 29. Regular classroom projector carrying duty is paused for examinations.
            </p>
          </div>
        </div>
      )}

      {/* 4. DAILY BREAKDOWN CARDS FOR SELECTED WEEK */}
      <div className="space-y-5">
        {weekDays.map(day => {
          const isSunday = day.isOffDay;

          // Neo-brutalist theme colors based on day and status
          let cardBg = 'bg-white';
          let headerTheme = 'bg-[#f6f3ea]';
          let statusBadge = (
            <span className="font-['Space_Grotesk'] text-xs font-bold uppercase px-2.5 py-0.5 rounded-full border border-[#1c1c17] bg-white text-[#48454d]">
              Upcoming
            </span>
          );

          if (day.isToday) {
            headerTheme = 'bg-[#ffe24c]';
            statusBadge = (
              <span className="font-['Space_Grotesk'] text-xs font-bold uppercase px-2.5 py-0.5 rounded-full border border-[#1c1c17] bg-[#1c1c17] text-[#ffe24c] shadow-[2px_2px_0px_#1c1c17] flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Active Today
              </span>
            );
          } else if (day.isPast) {
            headerTheme = 'bg-[#a6f2cf]';
            statusBadge = (
              <span className="font-['Space_Grotesk'] text-xs font-bold uppercase px-2.5 py-0.5 rounded-full border border-[#1c1c17] bg-white text-[#002115] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#1b6b4f]" />
                Completed
              </span>
            );
          } else if (isSunday) {
            headerTheme = 'bg-[#e8ddff]';
            statusBadge = (
              <span className="font-['Space_Grotesk'] text-xs font-bold uppercase px-2.5 py-0.5 rounded-full border border-[#1c1c17] bg-white text-[#62597c] flex items-center gap-1">
                <Coffee className="w-3 h-3" />
                Campus Closed
              </span>
            );
          }

          return (
            <div
              key={day.isoDate || day.dayName}
              className={`border-2 border-[#1c1c17] rounded-2xl shadow-[5px_5px_0px_#1c1c17] overflow-hidden ${
                isSunday ? 'border-dashed opacity-85' : ''
              } ${cardBg}`}
            >
              {/* Day Header Bar */}
              <div className={`p-4 border-b-2 border-[#1c1c17] flex flex-wrap items-center justify-between gap-3 ${headerTheme}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border-2 border-[#1c1c17] shadow-[2px_2px_0px_#1c1c17] flex items-center justify-center font-bold">
                    {isSunday ? (
                      <Moon className="w-5 h-5 text-[#62597c]" />
                    ) : (
                      <Calendar className="w-5 h-5 text-[#1c1c17]" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-['Space_Grotesk'] text-lg font-bold text-[#1c1c17]">
                        {day.dayName}
                      </h2>
                      <span className="font-['Space_Grotesk'] text-sm font-semibold text-[#48454d]">
                        • {day.fullDateString}
                      </span>
                    </div>
                    <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#48454d]">
                      {!isSunday ? `Class Day ${day.classDayIndex} of 108 • Week ${selectedWeek} of 18` : 'Weekly Rest Day • No Classes'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {statusBadge}
                  {!isSunday && day.scheduleInfo?.room && (
                    <span className="hidden sm:inline-flex items-center gap-1 font-['Space_Grotesk'] text-xs font-bold bg-white text-[#1c1c17] px-2.5 py-0.5 rounded-lg border border-[#1c1c17] shadow-[1px_1px_0px_#1c1c17]">
                      <MapPin className="w-3 h-3 text-[#ba1a1a]" />
                      {day.scheduleInfo.room}
                    </span>
                  )}
                </div>
              </div>

              {/* Day Body */}
              <div className="p-4 sm:p-5 bg-white">
                {isSunday ? (
                  <div className="flex items-center gap-3 py-3 text-sm font-['Plus_Jakarta_Sans'] text-[#48454d]">
                    <Coffee className="w-5 h-5 text-[#62597c]" />
                    <span>No lectures scheduled on Sunday. The projector remains locked in the department cabinet.</span>
                  </div>
                ) : (
                  <div className="w-full flex flex-col gap-3">
                    <div className="flex items-center gap-2 pb-1 border-b border-[#1c1c17]/15">
                      <BookOpen className="w-4 h-4 text-[#62597c]" />
                      <h4 className="font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider text-[#1c1c17]">
                        Official RUPP Timetable (Evening Shift)
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {day.scheduleInfo?.periods?.map((period, pIdx) => (
                        <div 
                          key={pIdx}
                          className="bg-[#fcf9f0] border-2 border-[#1c1c17] rounded-xl p-3 shadow-[2px_2px_0px_#1c1c17] flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between text-[11px] font-['Space_Grotesk'] font-bold text-[#ba1a1a] mb-1">
                              <span>Period {pIdx + 1}</span>
                              <span>{period.time}</span>
                            </div>
                            <h5 className="font-['Space_Grotesk'] text-xs font-bold text-[#1c1c17] leading-tight">
                              {period.subject}
                            </h5>
                          </div>
                          <div className="mt-2 pt-2 border-t border-[#1c1c17]/15 flex items-center justify-between text-[11px] text-[#48454d] font-['Plus_Jakarta_Sans']">
                            <span className="font-semibold text-[#1c1c17]">{period.lecturer}</span>
                            <span className="bg-white px-1.5 py-0.5 rounded border border-[#1c1c17]/30 text-[10px] font-bold font-['Space_Grotesk']">
                              {period.room}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
