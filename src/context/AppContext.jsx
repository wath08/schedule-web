import { useState, useEffect } from 'react';
import initialStudents from '../data/students.json';
import { AppContext } from './context';
import { getNextActiveDutyDate } from '../utils/semester';

function enrichStudent(s, isDutyDay = true) {
  const slotNumber = '#' + String(s.id).padStart(2, '0');
  const avatarColors = ['#a6f2cf', '#e0d4fd', '#ffe24c', '#ffdad6', '#cbe6ff', '#e2e3dd'];
  const avatarBg = avatarColors[(s.id - 1) % avatarColors.length];
  
  // If today is an active projector duty day (Mon, Tue, Wed, Thu, Sat):
  // Slots #01 - #04 are Active Today
  // Slots #05 - #08 are Up Next Tomorrow
  // Slots #09 - #30 are In Queue
  //
  // If today has NO projector duty (Friday Computer Lab Day or Sunday Rest Day):
  // Zero students are on duty today!
  // Slots #01 - #04 are Up Next for the next session (Saturday or Monday)
  // Slots #05 - #30 are In Queue
  const defaultStatus = isDutyDay
    ? (s.id <= 4 ? 'active' : s.id <= 8 ? 'tomorrow' : 'waiting')
    : (s.id <= 4 ? 'tomorrow' : 'waiting');
  
  return {
    ...s,
    slotNumber: s.slotNumber || slotNumber,
    status: s.status || defaultStatus,
    returned: s.returned !== undefined ? s.returned : false,
    room: s.room || 'Room 205 (Building B)',
    duty: s.duty || 'Prepare projector & clean whiteboard',
    avatarBg: s.avatarBg || avatarBg,
  };
}

export function AppProvider({ children }) {
  // Clear legacy stored states so users get the fresh synchronized state
  useEffect(() => {
    try {
      localStorage.removeItem('projector_duty_students_v9');
      localStorage.removeItem('projector_duty_students_v8');
      localStorage.removeItem('projector_duty_students_v7');
      localStorage.removeItem('projector_duty_students_v6');
      localStorage.removeItem('projector_duty_students_v5');
      localStorage.removeItem('projector_duty_students_v4');
      localStorage.removeItem('projector_duty_students_v3');
      localStorage.removeItem('projector_duty_students_v2');
      localStorage.removeItem('projector_duty_students');
      localStorage.removeItem('projector_duty_start_date');
      localStorage.removeItem('projector_duty_start_date_v2');
      localStorage.removeItem('projector_duty_start_date_v3');
    } catch {
      // ignore
    }
  }, []);

  // Duty cycle start date anchor (skips Friday/Sunday to Saturday/Monday)
  const [dutyStartDate, setDutyStartDate] = useState(() => {
    const now = new Date();
    const dow = now.getDay();
    const nextActive = getNextActiveDutyDate(now);
    const saved = localStorage.getItem('projector_duty_start_date_v4');
    if (saved) {
      // If today is Friday or Sunday, ensure duty start date doesn't linger on a past duty day
      if ((dow === 5 || dow === 0) && saved < nextActive.isoDate) {
        return nextActive.isoDate;
      }
      return saved;
    }
    return nextActive.isoDate;
  });

  const [students, setStudents] = useState(() => {
    const dow = (new Date()).getDay();
    const isDutyDay = dow !== 5 && dow !== 0;
    const base = initialStudents.map(s => enrichStudent(s, isDutyDay));
    const saved = localStorage.getItem('projector_duty_students_v10');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return base.map(init => {
          const found = parsed.find(p => p.id === init.id);
          if (!found) return init;
          // CRITICAL: On Friday (Lab Day) and Sunday (Rest Day), ZERO students are on duty today
          let status = found.status;
          if (!isDutyDay && status === 'active') {
            status = 'tomorrow';
          }
          return { ...init, status, returned: found.returned, returnedStatus: found.returnedStatus };
        });
      } catch {
        return base;
      }
    }
    return base;
  });

  // Dynamic live clock: checks every 10 seconds to ensure seamless midnight rollover
  const [currentDate, setCurrentDate] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentDate(now);

      const dow = now.getDay();
      const isDutyDay = dow !== 5 && dow !== 0;
      if (!isDutyDay) {
        setStudents(prev => {
          const hasActive = prev.some(s => s.status === 'active');
          if (!hasActive) return prev;
          return prev.map(s => s.status === 'active' ? { ...s, status: 'tomorrow' } : s);
        });
        const nextActive = getNextActiveDutyDate(now);
        setDutyStartDate(prev => {
          if (!prev || prev < nextActive.isoDate) {
            return nextActive.isoDate;
          }
          return prev;
        });
      }
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('projector_duty_students_v10', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('projector_duty_start_date_v4', dutyStartDate);
  }, [dutyStartDate]);

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3200);
  };

  const openResetModal = () => setIsResetModalOpen(true);
  const closeResetModal = () => setIsResetModalOpen(false);

  const restartDutyCycle = () => {
    const now = currentDate || new Date();
    const { isoDate, isFriday, isSunday } = getNextActiveDutyDate(now);

    setDutyStartDate(isoDate);
    localStorage.setItem('projector_duty_start_date_v4', isoDate);

    const isDutyDay = !isFriday && !isSunday;
    const freshStudents = initialStudents.map(s => enrichStudent(s, isDutyDay));
    setStudents(freshStudents);
    localStorage.setItem('projector_duty_students_v10', JSON.stringify(freshStudents));

    if (isFriday) {
      showToast(
        "Duty cycle reset! Friday is Lab Day (no projector needed) — rotation begins Saturday with Slot #01!",
        "success"
      );
    } else if (isSunday) {
      showToast(
        "Duty cycle reset! Sunday is Rest Day — rotation begins Monday with Slot #01!",
        "success"
      );
    } else {
      showToast(
        "Duty cycle restarted starting today with fresh classmates (Slot #01–#04)!",
        "success"
      );
    }
  };

  const markDelivered = (studentId) => {
    setStudents(prev =>
      prev.map(st =>
        st.id === studentId
          ? { ...st, checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: 'active' }
          : st
      )
    );
    showToast("Projector marked as delivered to class!", "success");
  };

  const markReturned = (studentId) => {
    setStudents(prev =>
      prev.map(st =>
        st.id === studentId
          ? { ...st, status: 'done', returnedStatus: true }
          : st
      )
    );
    showToast("Projector returned and safely stored!", "success");
  };

  const updateStudentStatus = (studentId, newStatus) => {
    setStudents(prev =>
      prev.map(st => (st.id === studentId ? { ...st, status: newStatus } : st))
    );
    showToast(`Duty status updated to ${newStatus}`);
  };

  const shufflePreview = () => {
    showToast("Simulating Cycle #2 round-robin duty queue!", "info");
  };

  const resetAllData = () => {
    openResetModal();
  };

  const todayStudents = students.filter(s => s.status === 'active');
  const doneStudents = students.filter(s => s.status === 'done');
  const waitingStudents = students.filter(s => s.status === 'waiting' || s.status === 'tomorrow');

  return (
    <AppContext.Provider
      value={{
        students,
        currentDate,
        dutyStartDate,
        todayStudents,
        doneStudents,
        waitingStudents,
        toast,
        showToast,
        selectedStudent,
        setSelectedStudent,
        markDelivered,
        markReturned,
        updateStudentStatus,
        shufflePreview,
        resetAllData,
        isResetModalOpen,
        openResetModal,
        closeResetModal,
        restartDutyCycle,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
