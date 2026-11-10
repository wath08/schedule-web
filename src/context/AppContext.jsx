import { useState, useEffect, useMemo } from 'react';
import initialStudents from '../data/students.json';
import { AppContext } from './context';
import { getNextActiveDutyDate, calculateDynamicRoster } from '../utils/semester';

const SHARED_CLOUD_SYNC_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a1c6126cbd7f81';

export function AppProvider({ children }) {
  // Clear legacy stored states so users get the fresh synchronized state
  useEffect(() => {
    try {
      localStorage.removeItem('projector_duty_students_v10');
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
      localStorage.removeItem('projector_duty_start_date_v4');
    } catch {
      // ignore
    }
  }, []);

  // Dynamic live clock: checks every 10 seconds to ensure seamless midnight rollover
  const [currentDate, setCurrentDate] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Duty cycle start date anchor (default is Nov 7, 2026 for the active cycle, or saved reset date)
  const [dutyStartDate, setDutyStartDate] = useState(() => {
    const saved = localStorage.getItem('projector_duty_start_date_v5');
    if (saved) return saved;
    return '2026-11-07';
  });

  // Cross-device cloud sync: ensure all phones, computers, and tablets share the same dutyStartDate
  useEffect(() => {
    let isMounted = true;

    const syncFromCloud = async () => {
      try {
        const res = await fetch(SHARED_CLOUD_SYNC_URL);
        if (!res.ok) return;
        const data = await res.json();
        const cloudDate = data?.data?.date;
        if (cloudDate && isMounted) {
          setDutyStartDate(prev => {
            if (prev !== cloudDate) {
              try {
                localStorage.setItem('projector_duty_start_date_v5', cloudDate);
              } catch {
                // ignore
              }
              return cloudDate;
            }
            return prev;
          });
        }
      } catch {
        // Fallback to local state if offline or network error
      }
    };

    syncFromCloud();
    const interval = setInterval(syncFromCloud, 20000); // Poll every 20s for real-time sync

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Calculate students dynamically in real time from currentDate & dutyStartDate
  const students = useMemo(() => {
    return calculateDynamicRoster(currentDate, dutyStartDate, initialStudents);
  }, [currentDate, dutyStartDate]);

  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

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
    const { isoDate, isFriday, isSunday, isAfter9pm, targetDayName } = getNextActiveDutyDate(now);

    setDutyStartDate(isoDate);
    try {
      localStorage.setItem('projector_duty_start_date_v5', isoDate);
    } catch {
      // ignore
    }

    // Broadcast reset date to cloud so all other devices update immediately
    fetch(SHARED_CLOUD_SYNC_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'duty_start_date',
        data: { date: isoDate }
      })
    }).catch(() => {
      // ignore network errors
    });

    if (isAfter9pm) {
      showToast(
        `Duty cycle reset! Past 9:00 PM — rotation begins ${targetDayName} with Slot #01!`,
        "success"
      );
    } else if (isFriday) {
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

  const markDelivered = () => {
    showToast("Projector marked as delivered to class!", "success");
  };

  const markReturned = () => {
    showToast("Projector returned and safely stored!", "success");
  };

  const updateStudentStatus = () => {
    showToast("Status is managed automatically by duty rotation.");
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
