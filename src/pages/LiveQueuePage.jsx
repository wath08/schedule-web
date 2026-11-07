import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ChromaKeyCatMeme from '../components/ChromaKeyCatMeme';
import { 
  Users, 
  Clock, 
  Projector, 
  Calendar, 
  MapPin, 
  CalendarDays,
  Flame,
  Moon,
  ShieldCheck,
  Laptop,
  Terminal
} from 'lucide-react';
import { useApp } from '../context/useApp';
import { 
  getWeekNumber, 
  getWeekDateRange, 
  getDaysForWeek,
  getCurrentClassDay,
  formatISODate,
  parseDate,
  TOTAL_WEEKS,
  TOTAL_CLASS_DAYS
} from '../utils/semester';

const DUTY_ROLES = [
  'Lead Carrier & Pickup',
  'Cables & Power Setup',
  'Whiteboard & Markers',
  'Safe Return & Storage'
];

export default function LiveQueuePage() {
  const { 
    students, 
    doneStudents,
    currentDate,
    dutyStartDate
  } = useApp();

  // Dynamic cycle number calculation
  const cycleNumber = Math.max(1, Math.floor(doneStudents.length / (students.length || 30)) + 1);

  // Semester & week calculations (dynamically tracks real client time and midnight rollover)
  const today = currentDate || new Date();
  const currentWeekNum = getWeekNumber(today);
  const currentWeekMeta = getWeekDateRange(currentWeekNum, today);
  const currentWeekDays = getDaysForWeek(currentWeekNum, students, today);

  // Selected Day state (defaults to today's day name)
  const todayDayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const [selectedDayName, setSelectedDayName] = useState(todayDayName);

  // Auto-scroll 7-day schedule strip on mobile to center today/selected day card
  const stripContainerRef = useRef(null);
  const activeDayCardRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const container = stripContainerRef.current;
      const card = activeDayCardRef.current;
      if (container && card) {
        const scrollPos = card.offsetLeft - (container.clientWidth / 2) + (card.clientWidth / 2);
        container.scrollTo({ left: Math.max(0, scrollPos), behavior: 'smooth' });
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [selectedDayName]);

  // Auto-switch to next day when midnight passes (e.g. from Thursday to Friday at 12:00 AM)
  const prevTodayRef = useRef(todayDayName);
  useEffect(() => {
    if (prevTodayRef.current !== todayDayName) {
      setSelectedDayName(todayDayName);
      prevTodayRef.current = todayDayName;
    }
  }, [todayDayName]);

  // Find info for selected day
  const selectedDayInfo = currentWeekDays.find(d => d.dayName === selectedDayName) || currentWeekDays[0];
  const isSelectedSunday = selectedDayName === 'Sunday';
  const isSelectedFriday = selectedDayName === 'Friday';
  const selectedDayIso = selectedDayInfo?.isoDate;
  const isPreStart = Boolean(dutyStartDate && selectedDayIso && selectedDayIso < dutyStartDate);

  // Duty start date metadata
  const dutyStartDateObj = dutyStartDate ? parseDate(dutyStartDate) : null;
  const dutyStartDayName = dutyStartDateObj ? dutyStartDateObj.toLocaleDateString('en-US', { weekday: 'long' }) : 'Saturday';
  const dutyStartDateFormatted = dutyStartDateObj ? dutyStartDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Saturday info for current week
  const saturdayInfo = currentWeekDays.find(d => d.dayName === 'Saturday');
  const saturdayDateText = saturdayInfo ? `Saturday, ${saturdayInfo.dateString}` : 'Saturday';
  const isFirstDutySaturday = Boolean(dutyStartDate && saturdayInfo?.isoDate === dutyStartDate);

  // Handler to change day and smoothly scroll up to the top so names are immediately visible
  const handleSelectDay = (dayName) => {
    setSelectedDayName(dayName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get the 4 classmates for the selected day based on active duty start date
  let squadStudents = [];
  if (!isSelectedSunday && !isSelectedFriday && !isPreStart) {
    const start = new Date(dutyStartDate || formatISODate(today));
    const target = new Date(selectedDayIso || formatISODate(today));

    let dutyDayIndex = 0;
    if (target >= start) {
      const temp = new Date(start);
      while (temp < target) {
        const dow = temp.getDay();
        // Monday (1), Tuesday (2), Wednesday (3), Thursday (4), Saturday (6)
        if (dow === 1 || dow === 2 || dow === 3 || dow === 4 || dow === 6) {
          dutyDayIndex++;
        }
        temp.setDate(temp.getDate() + 1);
      }
    }

    const baseSlot = (dutyDayIndex * 4) % 30 + 1;
    const studentIds = [
      baseSlot,
      ((baseSlot) % 30) + 1,
      ((baseSlot + 1) % 30) + 1,
      ((baseSlot + 2) % 30) + 1
    ];

    squadStudents = studentIds
      .map(id => students.find(s => s.id === id))
      .filter(Boolean)
      .map(st => {
        let cardStatus = st.status;
        if (selectedDayInfo?.isToday) {
          cardStatus = 'active';
        } else if (selectedDayInfo?.isPast) {
          cardStatus = 'done';
        }
        return {
          ...st,
          status: cardStatus
        };
      });
  }

  return (
    <div className="flex flex-col gap-5 sm:gap-8 pb-14">
      {/* 1. TOP PRIORITY FOR MOBILE & DESKTOP: SELECTED / TODAY'S PROJECTOR SQUAD */}
      <section className="flex flex-col gap-3">
        <div className="bg-white border-2 border-[#1c1c17] rounded-2xl p-4 sm:p-6 shadow-[5px_5px_0px_#1c1c17]">
          {/* Squad Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 sm:pb-4 border-b-2 border-[#1c1c17] mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#1c1c17] text-[#ffe24c] px-2.5 py-0.5 rounded text-xs font-['Space_Grotesk'] font-bold uppercase tracking-wider">
                  {selectedDayName.toUpperCase()}
                </span>
                <span className="font-['Space_Grotesk'] text-xs font-bold text-[#1c1c17]">
                  {selectedDayInfo?.dateString || today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                {selectedDayInfo?.isToday && (
                  <span className="bg-[#ffe24c] text-[#211b00] px-2 py-0.5 rounded text-[10px] font-bold border border-[#1c1c17] flex items-center gap-1 animate-pulse">
                    <Flame className="w-3 h-3 text-[#ba1a1a] fill-[#ba1a1a]" />
                    ACTIVE TODAY
                  </span>
                )}
              </div>

              <h2 className="font-['Space_Grotesk'] text-lg sm:text-2xl font-bold uppercase tracking-tight text-[#1c1c17]">
                {isSelectedSunday 
                  ? 'Sunday Rest Day' 
                  : isSelectedFriday
                  ? 'Friday Computer Lab Day'
                  : isPreStart
                  ? `${selectedDayName} (Before Duty Start)`
                  : `${selectedDayName} Projector Duty Squad (4 Classmates)`}
              </h2>
              <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#48454d] mt-0.5">
                {isSelectedSunday 
                  ? 'No lectures scheduled. Classmates rest and prepare for next week.'
                  : isSelectedFriday
                  ? 'Classes meet in Lab 203 & 204 Building A. No projector duty needed!'
                  : isPreStart
                  ? 'This day occurred before the start of the current duty cycle.'
                  : 'Responsible for bringing the projector, setting up power cables in Room 205, and returning equipment after lecture.'
                }
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {isSelectedFriday ? (
                <div className="bg-[#d0e4ff] text-[#004a77] px-3 py-1 rounded-xl border border-[#1c1c17] font-['Space_Grotesk'] text-xs font-bold flex items-center gap-1.5 shadow-[2px_2px_0px_#1c1c17]">
                  <Laptop className="w-4 h-4 text-[#004a77]" />
                  <span>Lab Pass • Zero Duty</span>
                </div>
              ) : isSelectedSunday ? (
                <div className="bg-[#ffe24c] text-[#211b00] px-3 py-1 rounded-xl border border-[#1c1c17] font-['Space_Grotesk'] text-xs font-bold flex items-center gap-1.5 shadow-[2px_2px_0px_#1c1c17]">
                  <Moon className="w-4 h-4 text-[#ba1a1a]" />
                  <span>Sunday Pass • 100% Chill</span>
                </div>
              ) : isPreStart ? (
                <div className="bg-[#f1eee5] text-[#48454d] px-3 py-1 rounded-xl border border-[#1c1c17] font-['Space_Grotesk'] text-xs font-bold flex items-center gap-1.5 shadow-[2px_2px_0px_#1c1c17]">
                  <Clock className="w-4 h-4 text-[#62597c]" />
                  <span>Pre-cycle Day</span>
                </div>
              ) : (
                <div className="bg-[#a6f2cf] text-[#002115] px-3 py-1 rounded-xl border border-[#1c1c17] font-['Space_Grotesk'] text-xs font-bold flex items-center gap-1.5 shadow-[2px_2px_0px_#1c1c17]">
                  <ShieldCheck className="w-4 h-4 text-[#1b6b4f]" />
                  <span>4 Classmates Assigned</span>
                </div>
              )}
            </div>
          </div>

          {/* Conditional Content: Sunday Cat Meme vs Friday Lab Meme vs Pre-start Screen vs 4 Classmate Cards */}
          {isSelectedSunday ? (
            /* Sunday Funny Meme: Transparent Clapping Cat Video with Audio */
            <ChromaKeyCatMeme />
          ) : isSelectedFriday ? (
            /* Friday Lab Day: No Projector Needed Meme / Celebration Screen */
            <div className="bg-[#fcf9f0] border-2 border-[#1c1c17] rounded-2xl p-6 sm:p-8 shadow-[3px_3px_0px_#1c1c17] flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden">
              <div className="inline-flex items-center gap-2 bg-[#ffdad6] text-[#93000a] border-2 border-[#1c1c17] px-4 py-1.5 rounded-full font-['Space_Grotesk'] text-xs sm:text-sm font-bold uppercase shadow-[2px_2px_0px_#1c1c17] rotate-[-2deg]">
                <Laptop className="w-4 h-4" />
                <span>OFFICIAL LAB PASS • ZERO PROJECTOR DUTY</span>
              </div>

              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#a6f2cf] border-2 border-[#1c1c17] shadow-[3px_3px_0px_#1c1c17] flex items-center justify-center font-bold text-2xl text-[#1b6b4f]">
                <Terminal className="w-7 h-7 sm:w-8 sm:h-8 text-[#002115]" />
              </div>

              <div className="max-w-xl flex flex-col items-center gap-1">
                <h3 className="font-['Space_Grotesk'] text-xl sm:text-3xl font-bold uppercase tracking-tight text-[#1c1c17]">
                  "WE IN THE LAB TODAY, GANG!"
                </h3>
                <p className="font-['Space_Grotesk'] text-sm sm:text-lg font-bold text-[#004a77] uppercase tracking-wide">
                  Lab 203 & 204 Building A
                </p>
                <div className="mt-4 pt-3 border-t border-[#1c1c17]/20 flex flex-col sm:flex-row items-center gap-2.5">
                  <span className="font-['Space_Grotesk'] text-xs font-bold text-[#1c1c17]">
                    {isFirstDutySaturday ? 'First Projector Duty: ' : 'Next Projector Duty: '}
                    <strong>{saturdayDateText}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSelectDay('Saturday')}
                    className="bg-[#ffe24c] hover:bg-yellow-300 text-[#1c1c17] px-3 py-1 rounded-xl border border-[#1c1c17] font-['Space_Grotesk'] text-xs font-bold shadow-[2px_2px_0px_#1c1c17] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                  >
                    View Saturday Squad →
                  </button>
                </div>
              </div>
            </div>
          ) : isPreStart ? (
            /* Pre-start Day: Duty cycle started later */
            <div className="bg-[#fcf9f0] border-2 border-[#1c1c17] rounded-2xl p-6 sm:p-8 shadow-[3px_3px_0px_#1c1c17] flex flex-col items-center justify-center text-center gap-2.5">
              <span className="font-['Space_Grotesk'] text-xs font-bold uppercase px-3 py-1 rounded-full border border-[#1c1c17] bg-[#f1eee5] text-[#48454d]">
                Pre-cycle Day
              </span>
              <h3 className="font-['Space_Grotesk'] text-lg sm:text-xl font-bold text-[#1c1c17] mt-1">
                Duty Cycle Starts on {dutyStartDayName} ({dutyStartDateFormatted})
              </h3>
              <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#48454d] max-w-md leading-relaxed">
                No projector duties were scheduled for this day in the current rotation.
              </p>
              <button
                type="button"
                onClick={() => handleSelectDay(dutyStartDayName)}
                className="mt-2 bg-[#ffe24c] hover:bg-yellow-300 text-[#1c1c17] px-4 py-2 rounded-xl border-2 border-[#1c1c17] font-['Space_Grotesk'] text-xs font-bold shadow-[2px_2px_0px_#1c1c17] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>View First Duty Squad ({dutyStartDayName})</span>
                <span>→</span>
              </button>
            </div>
          ) : (
            /* 4 Classmate Cards for Normal Class Days */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {squadStudents.map((st, idx) => (
                <div
                  key={st.id}
                  className="bg-white border-2 border-[#1c1c17] rounded-xl p-3 sm:p-4 shadow-[3px_3px_0px_#1c1c17] flex flex-col justify-between"
                >
                  <div>
                    {/* Top: Slot & Status */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-['Space_Grotesk'] text-xs font-bold px-2 py-0.5 rounded bg-[#1c1c17] text-[#ffe24c] shadow-[1px_1px_0px_#1c1c17]">
                        {st.slotNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-bold border border-[#1c1c17] text-[10px] font-['Space_Grotesk'] uppercase ${
                        st.status === 'done' ? 'bg-[#a6f2cf] text-[#002115]' :
                        st.status === 'active' ? 'bg-[#ffe24c] text-[#211b00] ring-1 ring-[#1c1c17]' :
                        st.status === 'tomorrow' ? 'bg-[#e0d4fd] text-[#1e1635]' :
                        'bg-[#f6f3ea] text-[#48454d]'
                      }`}>
                        {st.status === 'done' ? 'Turned In' :
                         st.status === 'active' ? 'Active Today' :
                         st.status === 'tomorrow' ? 'Tomorrow' : 'In Queue'}
                      </span>
                    </div>

                    {/* Classmate Info */}
                    <div className="flex items-center gap-3 my-1">
                      <div 
                        className="w-11 h-11 rounded-xl border-2 border-[#1c1c17] flex items-center justify-center font-bold text-sm shrink-0 shadow-[2px_2px_0px_#1c1c17]"
                        style={{ backgroundColor: st.avatarBg }}
                      >
                        {st.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-['Space_Grotesk'] font-bold text-base sm:text-lg text-[#1c1c17] truncate leading-tight">
                          {st.name}
                        </h4>
                        <span className="text-xs font-['Plus_Jakarta_Sans'] font-semibold text-[#1b6b4f] block truncate mt-0.5">
                          {DUTY_ROLES[idx]}
                        </span>
                      </div>
                    </div>

                    <p className="hidden md:block font-['Plus_Jakarta_Sans'] text-xs text-[#48454d] line-clamp-2 mt-2">
                      Prepare projector, cables, and clean whiteboard in Room 205.
                    </p>
                  </div>

                  {/* Card footer */}
                  <div className="mt-2 sm:mt-3 pt-2 border-t border-[#1c1c17]/15 flex items-center justify-between text-xs font-['Space_Grotesk']">
                    <span className="text-[#62597c] text-[11px] font-semibold">
                      Room 205 (Building B)
                    </span>
                    <span className="text-[11px] font-bold text-[#1b6b4f]">
                      Assigned
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 2. MIDDLE: 7-DAY WEEK SELECTOR (CLICK A DAY TO VIEW ASSIGNED 4 CLASSMATES ABOVE) */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b-2 border-[#1c1c17]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#ffe24c] border-2 border-[#1c1c17] flex items-center justify-center font-bold text-[#1c1c17] shadow-[2px_2px_0px_#1c1c17]">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#1c1c17]" />
            </div>
            <div>
              <h2 className="font-['Space_Grotesk'] text-lg sm:text-2xl font-bold uppercase tracking-tight text-[#1c1c17]">
                7-Day Projector Duty Schedule
              </h2>
              <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#48454d]">
                Tap any day to inspect duty squad above
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs font-['Space_Grotesk'] font-bold overflow-x-auto pb-1 sm:pb-0">
            <span className="flex items-center gap-1.5 text-[#1b6b4f] shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1b6b4f]" />
              Passed
            </span>
            <span className="flex items-center gap-1.5 text-[#ba9700] shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffe24c] border border-[#1c1c17]" />
              Today
            </span>
            <span className="flex items-center gap-1.5 text-[#004a77] shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d0e4ff] border border-[#1c1c17]" />
              Lab Day
            </span>
            <span className="flex items-center gap-1.5 text-[#62597c] shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e0d4fd] border border-[#1c1c17]" />
              Upcoming
            </span>
          </div>
        </div>

        {/* Clean 7-Day Clickable Bar: horizontal scrollable on phone, 7-col grid on tablet/desktop */}
        <div 
          ref={stripContainerRef}
          className="flex sm:grid sm:grid-cols-7 overflow-x-auto no-scrollbar gap-2 sm:gap-3 pb-2 pt-1 scroll-smooth"
        >
          {currentWeekDays.map((day) => {
            const isSelected = selectedDayName === day.dayName;
            const isSunday = day.isOffDay;
            const isFriday = day.dayName === 'Friday';
            const isToday = day.isToday;
            const isDayPreStart = Boolean(dutyStartDate && day.isoDate && day.isoDate < dutyStartDate);
            const isPast = day.isPast && !isDayPreStart;
            const isTomorrow = day.assignedStudent?.status === 'tomorrow' || (day.isUpcoming && day.dayName === 'Friday') || (day.dayName === 'Saturday' && todayDayName === 'Thursday');
            const dayAbbr = day.dayName.substring(0, 3).toUpperCase();

            return (
              <button
                key={day.dayName}
                ref={isSelected ? activeDayCardRef : null}
                onClick={() => handleSelectDay(day.dayName)}
                type="button"
                className={`p-3 rounded-2xl border-2 border-[#1c1c17] flex flex-col justify-between text-left transition-all cursor-pointer min-w-[105px] sm:min-w-0 flex-1 shrink-0 min-h-[115px] ${
                  isSelected
                    ? 'bg-[#ffe24c] shadow-[4px_4px_0px_#1c1c17] translate-x-[-1px] translate-y-[-1px] ring-2 ring-[#1c1c17]'
                    : isToday
                    ? 'bg-[#fff9d6] shadow-[2px_2px_0px_#1c1c17] hover:bg-[#ffe24c]'
                    : isFriday
                    ? 'bg-[#f0f6ff] shadow-[2px_2px_0px_#1c1c17] hover:bg-[#d0e4ff]'
                    : isTomorrow
                    ? 'bg-[#f4effe] shadow-[2px_2px_0px_#1c1c17] hover:bg-[#e0d4fd]'
                    : isSunday
                    ? 'bg-[#fcf9f0] shadow-[2px_2px_0px_#1c1c17] hover:bg-[#ebe8df]'
                    : isDayPreStart
                    ? 'bg-[#f6f3ea] opacity-80 hover:opacity-100 shadow-[1px_1px_0px_#1c1c17]'
                    : 'bg-white hover:bg-[#fcf9f0] shadow-[2px_2px_0px_#1c1c17]'
                }`}
              >
                {/* Top Row: Day Abbr + Indicator */}
                <div className="flex items-center justify-between w-full pb-1 border-b border-[#1c1c17]/20">
                  <span className="font-['Space_Grotesk'] text-sm sm:text-base font-bold text-[#1c1c17]">
                    {dayAbbr}
                  </span>
                  {isToday ? (
                    <Flame className="w-3.5 h-3.5 text-[#ba1a1a] fill-[#ba1a1a]" />
                  ) : isFriday ? (
                    <Laptop className="w-3.5 h-3.5 text-[#004a77]" />
                  ) : isSunday ? (
                    <Moon className="w-3.5 h-3.5 text-[#62597c]" />
                  ) : (
                    <span className="text-[10px] font-['Space_Grotesk'] font-bold text-[#62597c]">
                      {day.dateString}
                    </span>
                  )}
                </div>

                {/* Center: Squad Tag */}
                <div className="py-2">
                  <span className="font-['Space_Grotesk'] text-xs font-bold text-[#1c1c17] block">
                    {isSunday ? 'Rest Day' : isFriday ? 'Lab Day' : isDayPreStart ? 'Pre-start' : '4 On Duty'}
                  </span>
                  <span className="text-[10px] font-['Plus_Jakarta_Sans'] text-[#48454d] block">
                    {isSunday ? 'No duty' : isFriday ? 'No Projector' : isDayPreStart ? 'Not started' : 'Projector Squad'}
                  </span>
                </div>

                {/* Bottom Status Pill */}
                <div className="pt-1.5 border-t border-[#1c1c17]/15">
                  <span className={`block text-center font-['Space_Grotesk'] text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                    isSelected
                      ? 'bg-[#1c1c17] text-[#ffe24c] border-[#1c1c17]'
                      : isToday
                      ? 'bg-[#1c1c17] text-[#ffe24c] border-[#1c1c17]'
                      : isFriday
                      ? 'bg-[#d0e4ff] text-[#004a77] border-[#1c1c17]'
                      : isDayPreStart
                      ? 'bg-[#f1eee5] text-[#62597c] border-[#1c1c17]'
                      : isPast
                      ? 'bg-[#a6f2cf] text-[#002115] border-[#1c1c17]'
                      : isTomorrow
                      ? 'bg-[#e0d4fd] text-[#1e1635] border-[#1c1c17]'
                      : isSunday
                      ? 'bg-white text-[#62597c] border-[#1c1c17]'
                      : 'bg-[#f6f3ea] text-[#48454d] border-[#1c1c17]'
                  }`}>
                    {isToday ? 'Live Today' :
                     isFriday ? 'Lab Pass' :
                     isDayPreStart ? 'Pre-start' :
                     isPast ? 'Done' :
                     isTomorrow ? 'Tomorrow' :
                     isSunday ? 'Off Day' : 'Upcoming'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. BOTTOM: CLASS OVERVIEW & SEMESTER PROGRESS */}
      <section className="flex flex-col gap-4 pt-2">
        <div className="flex flex-col justify-between gap-4 bg-white p-5 sm:p-7 rounded-2xl border-2 border-[#1c1c17] shadow-[5px_5px_0px_#1c1c17] relative overflow-hidden">
          {/* Decorative Pattern */}
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none text-[#1c1c17]">
            <svg fill="currentColor" height="220" viewBox="0 0 100 100" width="220">
              <circle cx="10" cy="10" r="4" /><circle cx="30" cy="10" r="4" /><circle cx="50" cy="10" r="4" /><circle cx="70" cy="10" r="4" /><circle cx="90" cy="10" r="4" />
              <circle cx="10" cy="30" r="4" /><circle cx="30" cy="30" r="4" /><circle cx="50" cy="30" r="4" /><circle cx="70" cy="30" r="4" /><circle cx="90" cy="30" r="4" />
              <circle cx="10" cy="50" r="4" /><circle cx="30" cy="50" r="4" /><circle cx="50" cy="50" r="4" /><circle cx="70" cy="50" r="4" /><circle cx="90" cy="50" r="4" />
              <circle cx="10" cy="70" r="4" /><circle cx="30" cy="70" r="4" /><circle cx="50" cy="70" r="4" /><circle cx="70" cy="70" r="4" /><circle cx="90" cy="70" r="4" />
            </svg>
          </div>

          <div className="flex flex-col gap-2 z-10">
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-[#a6f2cf] text-[#002115] px-3 py-1 rounded-full font-['Space_Grotesk'] text-xs uppercase font-bold border-2 border-[#1c1c17] shadow-[2px_2px_0px_#1c1c17] rotate-[-1deg]">
                <Clock className="w-3.5 h-3.5" />
                RUPP • Class E2
              </span>

              <span className="inline-flex items-center gap-1.5 bg-[#ffe24c] text-[#211b00] px-3 py-1 rounded-full font-['Space_Grotesk'] text-xs uppercase font-bold border-2 border-[#1c1c17] shadow-[2px_2px_0px_#1c1c17] rotate-[1deg]">
                <Calendar className="w-3.5 h-3.5" />
                Week {currentWeekNum} of {TOTAL_WEEKS} ({currentWeekMeta.startDateString.split(',')[0]} – {currentWeekMeta.endDateString.split(',')[0]})
              </span>

              <span className="inline-flex items-center gap-1.5 bg-[#e0d4fd] text-[#1e1635] px-3 py-1 rounded-full font-['Space_Grotesk'] text-xs uppercase font-bold border-2 border-[#1c1c17] shadow-[2px_2px_0px_#1c1c17]">
                <MapPin className="w-3.5 h-3.5" />
                Room 205 (Building B) • Class E2
              </span>
            </div>

            {/* Title & Badge */}
            <div className="flex items-center gap-3 mt-1.5">
              <h2 className="font-['Space_Grotesk'] text-2xl sm:text-4xl font-bold tracking-tight text-[#1c1c17]">
                PROJECTOR DUTY QUEUE
              </h2>
              <div className="w-10 h-10 rounded-xl bg-[#ffe24c] border-2 border-[#1c1c17] shadow-[3px_3px_0px_#1c1c17] flex items-center justify-center shrink-0">
                <Projector className="w-5 h-5 text-[#1c1c17]" />
              </div>
            </div>

            <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#48454d] max-w-2xl mt-0.5">
              Daily Class Equipment Rotation Roster • Oct 26, 2026 to Feb 27, 2027. Because Room 205 has no installed projector, 4 classmates team up to transport, set up, and return the projector and whiteboard supplies (Fridays are lab days in Lab 203 & 204 Building A, so no projector is needed!).
            </p>
          </div>
        </div>

        {/* Quick Action Navigation & Duty Progress Bar */}
        <div className="bg-white border-2 border-[#1c1c17] p-3.5 sm:p-4 rounded-2xl shadow-[4px_4px_0px_#1c1c17] flex flex-col gap-3">
          {/* Clean 3-Action Tile Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full">
            <Link
              to="/timetable"
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-[#ffe24c] hover:bg-[#ebd03f] text-[#1c1c17] rounded-xl font-['Space_Grotesk'] text-xs font-bold border-2 border-[#1c1c17] shadow-[2px_2px_0px_#1c1c17] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Class Timetable & Teachers</span>
              </div>
              <span className="text-xs font-bold">→</span>
            </Link>

            <Link
              to="/schedule"
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-[#e0d4fd] hover:bg-[#d0c0f8] text-[#1e1635] rounded-xl font-['Space_Grotesk'] text-xs font-bold border-2 border-[#1c1c17] shadow-[2px_2px_0px_#1c1c17] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
            >
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                <span>Browse 18 Weeks</span>
              </div>
              <span className="text-xs font-bold">→</span>
            </Link>

            <Link
              to="/students"
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-[#a6f2cf] hover:bg-[#92e2be] text-[#002115] rounded-xl font-['Space_Grotesk'] text-xs font-bold border-2 border-[#1c1c17] shadow-[2px_2px_0px_#1c1c17] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Classmate Duty-list</span>
              </div>
              <span className="text-xs font-bold">→</span>
            </Link>
          </div>

          {/* Clean Progress Row */}
          <div className="pt-2.5 border-t border-[#1c1c17]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-['Space_Grotesk'] font-bold text-[#48454d]">
            <div className="flex items-center gap-2">
              <span>Duty Progress:</span>
              <span className="bg-[#a6f2cf] text-[#002115] px-2.5 py-0.5 rounded-lg border border-[#1c1c17]">
                Day {getCurrentClassDay(today)} / {TOTAL_CLASS_DAYS} (Week {currentWeekNum} of {TOTAL_WEEKS})
              </span>
            </div>
            <span className="text-[11px] text-[#62597c] font-semibold">
              Cycle #{cycleNumber} • Classmates Rotation
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
