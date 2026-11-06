import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Layers, Calendar, CalendarDays, Users, Projector, Zap } from 'lucide-react';
import { useApp } from '../context/useApp';

export default function Sidebar() {
  const { doneStudents, students } = useApp();
  const location = useLocation();

  // Scroll detection for auto-hiding mobile bottom navigation bar
  const [isVisible, setIsVisible] = useState(true);
  const [prevPath, setPrevPath] = useState(location.pathname);
  const lastScrollY = useRef(0);

  // Reset to visible on page route change (React recommended render-time adjustment)
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setIsVisible(true);
  }

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show when near the top of the page
      if (currentScrollY < 40) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Minimum scroll delta threshold to prevent jitter
      const diff = currentScrollY - lastScrollY.current;
      if (Math.abs(diff) < 8) return;

      if (diff > 0) {
        // Scrolling DOWN -> Slide bottom bar down out of view
        setIsVisible(false);
      } else {
        // Scrolling UP -> Slide bottom bar up into view
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { to: '/', label: "Today's Duty Queue", shortLabel: "Today's", icon: Layers },
    { to: '/timetable', label: 'Class Timetable & Teachers', shortLabel: 'Class', icon: Calendar },
    { to: '/schedule', label: 'Weekly Carrier Schedule', shortLabel: 'Weekly', icon: CalendarDays },
    { to: '/students', label: 'Classmates Duty List', shortLabel: 'Classmates', icon: Users },
  ];

  const percent = Math.round((doneStudents.length / (students.length || 30)) * 100);
  const cycleNumber = Math.max(1, Math.floor(doneStudents.length / (students.length || 30)) + 1);

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-20 bottom-0 w-64 bg-[#f6f3ea] border-r-2 border-[#1c1c17] z-40 flex-col justify-between py-5">
        <div className="px-4">
          {/* Projector Duty Header Card */}
          <div className="p-3 mb-5 bg-[#a6f2cf] border-2 border-[#1c1c17] rounded-xl shadow-[3px_3px_0px_#1c1c17] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border-2 border-[#1c1c17] flex items-center justify-center font-bold text-lg shadow-[1px_1px_0px_#1c1c17]">
              <Projector className="w-5 h-5 text-[#1b6b4f]" />
            </div>
            <div>
              <div className="font-['Space_Grotesk'] font-bold text-base text-[#002115] leading-tight">
                Projector Duty
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-['Space_Grotesk'] text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-[#e0d4fd] text-[#1e1635] border-2 border-[#1c1c17] shadow-[3px_3px_0px_#1c1c17]'
                        : 'text-[#48454d] hover:bg-[#ebe8df] hover:text-[#1c1c17]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Energy Gauge */}
        <div className="px-4">
          <div className="bg-white border-2 border-[#1c1c17] p-3.5 rounded-xl shadow-[3px_3px_0px_#1c1c17]">
            <div className="flex items-center justify-between text-xs font-['Space_Grotesk'] font-bold text-[#6d5e00] uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-[#f6da41] fill-[#f6da41]" />
                Duty Progress
              </span>
              <span className="text-[11px] text-[#1b6b4f] bg-[#a6f2cf] px-1.5 py-0.2 rounded border border-[#1c1c17]">
                Cycle #{cycleNumber}
              </span>
            </div>
            <div className="w-full bg-[#f1eee5] border-2 border-[#1c1c17] h-3.5 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-[#f6da41] h-full transition-all duration-500" 
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px] font-['Space_Grotesk'] text-[#48454d] font-bold">
              <span>{doneStudents.length} of {students.length} Turned In</span>
              <span>{percent}%</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Horizontal Navigation Bar with Smooth Auto-Hide on Scroll */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#fcf9f0] border-t-2 border-[#1c1c17] z-50 flex items-center justify-around px-2 shadow-[0_-4px_0_0_#1c1c17] transition-transform duration-300 ease-in-out will-change-transform ${
        isVisible ? 'translate-y-0' : 'translate-y-[120%]'
      }`}>
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-xs font-['Space_Grotesk'] font-bold transition-all ${
                  isActive
                    ? 'bg-[#e0d4fd] text-[#1c1c17]'
                    : 'text-[#62597c] hover:text-[#1c1c17]'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] mt-0.5">{item.shortLabel || item.label.split(' ')[0]}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
