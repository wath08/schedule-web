import { useRef, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  Laptop, 
  Info,
  Building,
  CalendarDays,
  User,
  MapPin,
  Coffee,
  Zap
} from 'lucide-react';
import timetableData from '../data/timetable.json';
import { useApp } from '../context/useApp';

export default function ClassTimetablePage() {
  const { currentDate } = useApp();
  const today = currentDate || new Date();
  // Today's day name in local time
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayIndex = today.getDay();
  const todayDayName = dayNames[todayIndex];

  // Days list for table
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Auto-scroll table on mobile so today's schedule is immediately visible
  const tableContainerRef = useRef(null);
  const todayHeaderRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const container = tableContainerRef.current;
      const header = todayHeaderRef.current;
      if (container && header) {
        const scrollPos = header.offsetLeft - (container.clientWidth / 2) + (header.clientWidth / 2);
        container.scrollTo({ left: Math.max(0, scrollPos), behavior: 'smooth' });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [todayDayName]);

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* 1. OFFICIAL RUPP TIMETABLE HEADER BANNER */}
      <section className="bg-white border-2 border-[#1c1c17] rounded-2xl p-6 sm:p-8 shadow-[6px_6px_0px_#1c1c17] relative overflow-hidden">
        {/* Background watermark */}
        <div className="absolute right-4 -bottom-10 opacity-5 pointer-events-none font-bold text-[120px] select-none text-[#1c1c17] font-['Space_Grotesk']">
          RUPP
        </div>

        <div className="flex flex-col gap-4 relative z-10">
          {/* Title Area */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="bg-[#e0d4fd] text-[#1e1635] font-['Space_Grotesk'] text-xs uppercase font-bold px-2.5 py-0.5 rounded border border-[#1c1c17]">
                  {timetableData.classGroup} • Gen 29
                </span>
                <span className="bg-[#a6f2cf] text-[#002115] font-['Space_Grotesk'] text-xs font-bold px-2.5 py-0.5 rounded border border-[#1c1c17]">
                  Evening Shift (5:30 PM – 8:30 PM)
                </span>
                <span className="bg-[#ffe24c] text-[#1c1c17] font-['Space_Grotesk'] text-xs font-bold px-2.5 py-0.5 rounded border border-[#1c1c17]">
                  Room 205 (Building B)
                </span>
              </div>

              <h1 className="font-['Space_Grotesk'] text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#1c1c17]">
                Official Class Timetable
              </h1>
              <p className="font-['Space_Grotesk'] text-sm sm:text-base font-bold text-[#ba1a1a]">
                {timetableData.major} • {timetableData.department}
              </p>
              <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#48454d] mt-1">
                {timetableData.periodDates} • {timetableData.totalWeeks} Weeks Total
              </p>
            </div>
          </div>

          {/* Quick Meta Stats Pill Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div className="bg-[#fcf9f0] border border-[#1c1c17] p-2.5 rounded-xl flex items-center gap-2.5">
              <Building className="w-4 h-4 text-[#ba1a1a] shrink-0" />
              <div>
                <span className="font-['Space_Grotesk'] text-[10px] font-bold text-[#48454d] uppercase block">
                  Main Classroom
                </span>
                <span className="font-['Space_Grotesk'] text-xs font-bold text-[#1c1c17]">
                  {timetableData.classroom}
                </span>
              </div>
            </div>

            <div className="bg-[#fcf9f0] border border-[#1c1c17] p-2.5 rounded-xl flex items-center gap-2.5">
              <Laptop className="w-4 h-4 text-[#1b6b4f] shrink-0" />
              <div>
                <span className="font-['Space_Grotesk'] text-[10px] font-bold text-[#48454d] uppercase block">
                  Friday Labs
                </span>
                <span className="font-['Space_Grotesk'] text-xs font-bold text-[#1c1c17]">
                  Lab 203 & 204 Building A
                </span>
              </div>
            </div>

            <div className="bg-[#fcf9f0] border border-[#1c1c17] p-2.5 rounded-xl flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#62597c] shrink-0" />
              <div>
                <span className="font-['Space_Grotesk'] text-[10px] font-bold text-[#48454d] uppercase block">
                  Class Hours
                </span>
                <span className="font-['Space_Grotesk'] text-xs font-bold text-[#1c1c17]">
                  5:30 PM – 8:30 PM (Evening)
                </span>
              </div>
            </div>

            <div className="bg-[#fcf9f0] border border-[#1c1c17] p-2.5 rounded-xl flex items-center gap-2.5">
              <CalendarDays className="w-4 h-4 text-[#d97706] shrink-0" />
              <div>
                <span className="font-['Space_Grotesk'] text-[10px] font-bold text-[#48454d] uppercase block">
                  Break Time
                </span>
                <span className="font-['Space_Grotesk'] text-xs font-bold text-[#1c1c17]">
                  7:00 PM – 7:15 PM (15 Mins)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE WEEKLY SCHEDULE GRID (MONDAY TO SATURDAY) */}
      <section className="bg-white border-2 border-[#1c1c17] rounded-2xl p-5 sm:p-6 shadow-[6px_6px_0px_#1c1c17] overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-[#1c1c17] mb-5">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-[#ba1a1a]" />
            <div>
              <h2 className="font-['Space_Grotesk'] text-xl font-bold uppercase tracking-tight text-[#1c1c17]">
                Master Weekly Schedule Table (Monday – Saturday)
              </h2>
              <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#48454d]">
                Exact mirror of the official RUPP Dean-approved timetable document.
              </p>
            </div>
          </div>

          <span className="font-['Space_Grotesk'] text-xs font-bold bg-[#f6f3ea] text-[#1c1c17] px-3 py-1 rounded-xl border border-[#1c1c17]">
            Room 205 (Building B) • Evening Shift
          </span>
        </div>

        {/* Scrollable Responsive Table */}
        <div ref={tableContainerRef} className="overflow-x-auto pb-2 scroll-smooth">
          <table className="w-full min-w-[760px] border-collapse border-2 border-[#1c1c17] font-['Space_Grotesk'] text-xs">
            {/* Table Header: Days of the week */}
            <thead>
              <tr className="bg-[#1c1c17] text-white">
                <th className="border-2 border-[#1c1c17] p-3 text-center w-28 uppercase tracking-wider font-bold bg-[#333]">
                  <div>Time</div>
                </th>
                {weekDays.map(day => {
                  const isToday = day === todayDayName;
                  return (
                    <th 
                      key={day}
                      ref={isToday ? todayHeaderRef : null}
                      className={`border-2 border-[#1c1c17] p-2.5 text-center transition-all ${
                        isToday ? 'bg-[#ffe24c] text-[#1c1c17]' : 'bg-[#1c1c17] text-white'
                      }`}
                    >
                      <div className="font-bold text-sm uppercase flex items-center justify-center gap-1">
                        {day}
                        {isToday && (
                          <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-ping" />
                        )}
                      </div>
                      {isToday && (
                        <div className="text-[9px] bg-[#1c1c17] text-[#ffe24c] px-1 rounded uppercase font-bold mt-1">
                          Today
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {/* PERIOD 1: 5:30 PM - 7:00 PM */}
              <tr>
                <td className="border-2 border-[#1c1c17] p-2.5 text-center font-bold bg-[#fcf9f0] align-middle">
                  <div className="text-xs text-[#ba1a1a]">Period 1</div>
                  <div className="text-sm text-[#1c1c17]">5:30 - 7:00</div>
                </td>

                {weekDays.map(day => {
                  const p1 = timetableData.schedule[day]?.periods[0];
                  const isToday = day === todayDayName;
                  const isLab = p1?.room?.toLowerCase().includes('lab');

                  return (
                    <td 
                      key={day}
                      className={`border-2 border-[#1c1c17] p-3 align-top transition-all ${
                        isToday ? 'bg-yellow-50/80 ring-2 ring-[#ffe24c] ring-inset' : 'bg-white'
                      }`}
                    >
                      {p1 ? (
                        <div className="flex flex-col justify-between h-full gap-2">
                          <div>
                            <span className="font-bold text-xs text-[#1c1c17] block leading-snug">
                              {p1.subject}
                            </span>
                          </div>

                          <div className="pt-2 border-t border-[#1c1c17]/15 flex flex-col gap-1">
                            <span className="font-bold text-[#1c1c17] text-[11px] flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-[#62597c]" />
                              {p1.lecturer}
                            </span>
                            <span className={`inline-flex items-center gap-1 self-start px-1.5 py-0.2 rounded text-[10px] font-bold border border-[#1c1c17]/30 ${
                              isLab ? 'bg-[#ffdad6] text-[#93000a] font-bold' : 'bg-[#f6f3ea] text-[#48454d]'
                            }`}>
                              <MapPin className="w-2.5 h-2.5 text-[#ba1a1a]" />
                              {p1.room}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-[#48454d] text-xs py-4">—</div>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* BREAK ROW: 7:00 PM - 7:15 PM */}
              <tr className="bg-[#f6f3ea] text-[#48454d]">
                <td className="border-2 border-[#1c1c17] p-1.5 text-center font-bold text-[10px] bg-[#ebe8df]">
                  Break (15m)
                </td>
                <td colSpan={6} className="border-2 border-[#1c1c17] p-1.5 text-center font-bold text-[11px] tracking-wider text-[#62597c]">
                  <span className="inline-flex items-center gap-1.5">
                    <Coffee className="w-3.5 h-3.5 text-[#ba1a1a]" />
                    7:00 PM – 7:15 PM • REFRESHMENT BREAK (15 MIN)
                  </span>
                </td>
              </tr>

              {/* PERIOD 2: 7:15 PM - 8:30 PM */}
              <tr>
                <td className="border-2 border-[#1c1c17] p-2.5 text-center font-bold bg-[#fcf9f0] align-middle">
                  <div className="text-xs text-[#ba1a1a]">Period 2</div>
                  <div className="text-sm text-[#1c1c17]">7:15 - 8:30</div>
                </td>

                {weekDays.map(day => {
                  const p2 = timetableData.schedule[day]?.periods[1];
                  const isToday = day === todayDayName;
                  const isLab = p2?.room?.toLowerCase().includes('lab');

                  return (
                    <td 
                      key={day}
                      className={`border-2 border-[#1c1c17] p-3 align-top transition-all ${
                        isToday ? 'bg-yellow-50/80 ring-2 ring-[#ffe24c] ring-inset' : 'bg-white'
                      }`}
                    >
                      {p2 ? (
                        <div className="flex flex-col justify-between h-full gap-2">
                          <div>
                            <span className="font-bold text-xs text-[#1c1c17] block leading-snug">
                              {p2.subject}
                            </span>
                          </div>

                          <div className="pt-2 border-t border-[#1c1c17]/15 flex flex-col gap-1">
                            <span className="font-bold text-[#1c1c17] text-[11px] flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-[#62597c]" />
                              {p2.lecturer}
                            </span>
                            <span className={`inline-flex items-center gap-1 self-start px-1.5 py-0.2 rounded text-[10px] font-bold border border-[#1c1c17]/30 ${
                              isLab ? 'bg-[#ffdad6] text-[#93000a] font-bold' : 'bg-[#f6f3ea] text-[#48454d]'
                            }`}>
                              <MapPin className="w-2.5 h-2.5 text-[#ba1a1a]" />
                              {p2.room}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-[#48454d] text-xs py-4">—</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. ALL 6 SUBJECTS & TEACHERS DIRECTORY (CARDS) */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-[#1b6b4f]" />
            <div>
              <h2 className="font-['Space_Grotesk'] text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#1c1c17]">
                Course & Lecturer Directory (6 Subjects)
              </h2>
              <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#48454d]">
                Detailed syllabus breakdown, required tools, and projector equipment requirements for each subject.
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-block font-['Space_Grotesk'] text-xs font-bold bg-[#a6f2cf] text-[#002115] px-3 py-1 rounded-xl border border-[#1c1c17]">
            Computer Science & Engineering (Y2 Sem 1)
          </span>
        </div>

        {/* 6 Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {timetableData.courses.map(course => (
            <div
              key={course.id}
              className={`border-2 border-[#1c1c17] rounded-2xl p-5 shadow-[5px_5px_0px_#1c1c17] flex flex-col justify-between bg-white hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_#1c1c17] transition-all`}
            >
              <div>
                {/* Course Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[#1c1c17]/20 mb-3">
                  <span className="font-['Space_Grotesk'] text-xs font-bold text-[#48454d]">
                    {course.days.join(' & ')}
                  </span>
                </div>

                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#1c1c17] leading-snug mb-2">
                  {course.name}
                </h3>

                <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#48454d] mb-3">
                  {course.description}
                </p>

                {/* Teacher Info */}
                <div className="bg-[#fcf9f0] border border-[#1c1c17] rounded-xl p-3 mb-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-['Space_Grotesk']">
                    <span className="text-[#48454d] font-bold">Lecturer:</span>
                    <span className="font-bold text-[#1c1c17]">{course.lecturer}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-['Space_Grotesk']">
                    <span className="text-[#48454d] font-bold">Primary Room:</span>
                    <span className="font-bold text-[#ba1a1a]">{course.room}</span>
                  </div>
                </div>

                {/* Software Tools & Projector Requirement */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-['Space_Grotesk'] text-[10px] uppercase font-bold text-[#48454d] block mb-1">
                      Recommended Tools / Tech:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {course.tools.map((t, idx) => (
                        <span key={idx} className="bg-[#f6f3ea] px-2 py-0.5 rounded font-['Space_Grotesk'] text-[10px] font-bold border border-[#1c1c17]/20">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#1c1c17]/15">
                    <span className="font-['Space_Grotesk'] text-[10px] uppercase font-bold text-[#ba1a1a] block">
                      Projector Requirement:
                    </span>
                    <p className="font-['Plus_Jakarta_Sans'] text-[11px] text-[#48454d]">
                      {course.projectorPriority}
                    </p>
                  </div>
                </div>
              </div>

              {/* Weekly Schedule Slots Footnote */}
              <div className="mt-4 pt-3 border-t-2 border-[#1c1c17]/20 flex flex-col gap-1 font-['Space_Grotesk'] text-[11px]">
                {course.scheduleSlots.map((slot, sIdx) => (
                  <div key={sIdx} className="flex items-center justify-between text-[#48454d]">
                    <span className="font-bold text-[#1c1c17]">{slot.day} ({slot.period}):</span>
                    <span>{slot.time} • <span className="font-bold">{slot.room}</span></span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CLASSROOM E2 & LAB GUIDELINES */}
      <section className="bg-[#f6f3ea] border-2 border-[#1c1c17] rounded-2xl p-6 shadow-[5px_5px_0px_#1c1c17]">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-5 h-5 text-[#ba1a1a]" />
          <h3 className="font-['Space_Grotesk'] text-lg font-bold uppercase tracking-tight text-[#1c1c17]">
            Important Guidelines for Class E2
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-['Plus_Jakarta_Sans'] text-xs text-[#48454d]">
          <div className="bg-white p-3.5 rounded-xl border border-[#1c1c17]">
            <h4 className="font-['Space_Grotesk'] font-bold text-sm text-[#1c1c17] mb-1 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#ba1a1a]" />
              Room 205 (Building B)
            </h4>
            <p>
              Monday, Tuesday, Wednesday, Thursday, and Saturday classes are held in Room 205. Please arrive before 5:15 PM so the assigned student has time to set up the projector and focus the screen.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#1c1c17]">
            <h4 className="font-['Space_Grotesk'] font-bold text-sm text-[#1c1c17] mb-1 flex items-center gap-1.5">
              <Laptop className="w-4 h-4 text-[#1b6b4f]" />
              Friday Labs (Lab 203 & 204 Building A)
            </h4>
            <p>
              On Fridays: Period 1 (Core Java) is in Lab 203; Period 2 (Database Systems) moves to Lab 204 (Building A). Bring your personal laptop with Java 21 LTS and MySQL Workbench installed.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#1c1c17]">
            <h4 className="font-['Space_Grotesk'] font-bold text-sm text-[#1c1c17] mb-1 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#d97706]" />
              Projector & Power Strips
            </h4>
            <p>
              Because Room 205 lacks fixed projectors, the student on duty must bring the projector, HDMI cable, and an extension power strip. After class, pack all cables carefully into the pouch.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
