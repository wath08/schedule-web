import { useState, useEffect } from 'react';
import initialStudents from '../data/students.json';
import { AppContext } from './context';

function enrichStudent(s) {
  const slotNumber = '#' + String(s.id).padStart(2, '0');
  const avatarColors = ['#a6f2cf', '#e0d4fd', '#ffe24c', '#ffdad6', '#cbe6ff', '#e2e3dd'];
  const avatarBg = avatarColors[(s.id - 1) % avatarColors.length];
  
  // Real active semester schedule matching Thursday Nov 5 (Class Day 10 of 108):
  // Class Days 1–9 (Oct 26 - Nov 4) are completed & returned
  // Class Day 10 (Thursday Nov 5) is Active Duty Today (#10 Sreyleak Neth)
  // Class Day 11 is Up Next Tomorrow (#11 Dara Ouk)
  // Class Days 12–30 are In Queue
  const defaultStatus = s.id <= 9 ? 'done' : s.id === 10 ? 'active' : s.id === 11 ? 'tomorrow' : 'waiting';
  
  return {
    ...s,
    slotNumber: s.slotNumber || slotNumber,
    status: s.status || defaultStatus,
    returned: s.returned !== undefined ? s.returned : (s.id <= 9),
    room: s.room || 'Room 205 (Building B)',
    duty: s.duty || 'Prepare projector & clean whiteboard',
    avatarBg: s.avatarBg || avatarBg,
  };
}

export function AppProvider({ children }) {
  // Clear legacy stored states so all users get clean synchronized active state
  useEffect(() => {
    try {
      localStorage.removeItem('projector_duty_students_v5');
      localStorage.removeItem('projector_duty_students_v4');
      localStorage.removeItem('projector_duty_students_v3');
      localStorage.removeItem('projector_duty_students_v2');
      localStorage.removeItem('projector_duty_students');
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

  const [students, setStudents] = useState(() => {
    const base = initialStudents.map(enrichStudent);
    const saved = localStorage.getItem('projector_duty_students_v6');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return base.map(init => {
          const found = parsed.find(p => p.id === init.id);
          return found ? { ...init, status: found.status, returned: found.returned, returnedStatus: found.returnedStatus } : init;
        });
      } catch {
        return base;
      }
    }
    return base;
  });

  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('projector_duty_students_v6', JSON.stringify(students));
  }, [students]);

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3200);
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
    localStorage.removeItem('projector_duty_students_v6');
    setStudents(initialStudents.map(enrichStudent));
    showToast("Reset duty roster to synchronized active schedule");
  };

  const todayStudents = students.filter(s => s.status === 'active');
  const doneStudents = students.filter(s => s.status === 'done');
  const waitingStudents = students.filter(s => s.status === 'waiting' || s.status === 'tomorrow');

  return (
    <AppContext.Provider
      value={{
        students,
        currentDate,
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
