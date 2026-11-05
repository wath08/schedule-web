import { Link } from 'react-router-dom';
import { GraduationCap, Calendar, Clock, Flame } from 'lucide-react';
import { useApp } from '../context/useApp';

export default function Navbar() {
  const { doneStudents, students, currentDate } = useApp();
  const now = currentDate || new Date();
  const todayDayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const isSunday = now.getDay() === 0;
  const isFriday = now.getDay() === 5;

  // Dynamic duty calculations
  const cycleNumber = Math.max(1, Math.floor(doneStudents.length / (students.length || 30)) + 1);
  const activeStudent = students.find(s => s.status === 'active') || students.find(s => s.status === 'today');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-[#fcf9f0] border-b-2 border-[#1c1c17] shadow-[0_4px_0_0_#1c1c17]">
      <div className="h-20 w-full px-4 lg:px-6 flex items-center justify-between gap-3 lg:gap-4">
        {/* Left: Brand & Cohort Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/"
            className="flex items-center bg-[#e0d4fd] border-2 border-[#1c1c17] px-3.5 py-2 rounded-xl shadow-[2px_2px_0px_#1c1c17] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#1c1c17] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
          >
            <span className="font-['Space_Grotesk'] font-bold text-base sm:text-lg uppercase tracking-tight text-[#635a7d] block leading-tight">
              Class E2 Gen29
            </span>
          </Link>

          <div className="hidden xl:flex items-center gap-1.5 bg-[#a6f2cf] border-2 border-[#1c1c17] px-3 py-1 rounded-full shadow-[2px_2px_0px_#1c1c17] rotate-[-1deg]">
            <GraduationCap className="w-4 h-4 text-[#1b6b4f]" />
            <span className="font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider text-[#002115]">
              RUPP • Room 205 (Building B)
            </span>
          </div>
        </div>

        {/* Center: Dynamic & Responsive Duty Telemetry Pill */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3 bg-white border-2 border-[#1c1c17] px-3 lg:px-4 py-1.5 rounded-xl shadow-[3px_3px_0px_#1c1c17] transition-all">
          <div className="hidden 2xl:flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#62597c]" />
            <span className="font-['Space_Grotesk'] text-xs text-[#1c1c17] font-bold">
              Class Duty Rotation
            </span>
          </div>
          <span className="hidden 2xl:inline text-[#cac4ce] font-bold">|</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1b6b4f] animate-pulse" />
            <span className="font-['Space_Grotesk'] text-xs text-[#1c1c17] font-bold">
              Cycle #{cycleNumber} • {doneStudents.length}/{students.length} Duties Completed
            </span>
          </div>
          <span className="text-[#cac4ce] font-bold">|</span>
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded border border-[#1c1c17] shrink-0 font-['Space_Grotesk'] text-xs font-bold ${
            isSunday ? 'bg-[#ffdad6] text-[#93000a]' : isFriday ? 'bg-[#d0e4ff] text-[#004a77]' : 'bg-[#ffe24c] text-[#211b00]'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>
              {isSunday ? (
                'Sunday (Off Day)'
              ) : isFriday ? (
                'Friday (Lab Day • Lab 203 & 204 Building A)'
              ) : activeStudent ? (
                `${todayDayName} (Active: ${activeStudent.name})`
              ) : (
                `${todayDayName} (Active Today)`
              )}
            </span>
          </div>
        </div>

        {/* Right: Public Board Indicator / Live Day Pill on Mobile */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 bg-[#ffe24c] border-2 border-[#1c1c17] px-2.5 sm:px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_#1c1c17]">
            <Flame className="w-3.5 h-3.5 text-[#ba1a1a] fill-[#ba1a1a]" />
            <span className="font-['Space_Grotesk'] text-xs text-[#211b00] font-bold tracking-tight">
              {isSunday ? 'Off Day' : isFriday ? 'Lab Day' : `${todayDayName.slice(0, 3)} Squad`}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
