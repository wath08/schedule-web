import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import ResetDutyModal from './components/ResetDutyModal';

// Pages
import LiveQueuePage from './pages/LiveQueuePage';
import ClassTimetablePage from './pages/ClassTimetablePage';
import WeeklySchedulePage from './pages/WeeklySchedulePage';
import StudentsRosterPage from './pages/StudentsRosterPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#fcf9f0] text-[#1c1c17] flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-[#e0d4fd] selection:text-[#1c1c17]">
          {/* Top Sticky Header */}
          <Navbar />

          <div className="flex flex-1 pt-20">
            {/* Left Persistent Navigation Rail (Desktop) + Mobile Bottom Bar */}
            <Sidebar />

            {/* Main Scrollable Canvas */}
            <main className="flex-1 lg:pl-64 w-full">
              <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6 pb-24 lg:pb-12">
                <Routes>
                  <Route path="/" element={<LiveQueuePage />} />
                  <Route path="/timetable" element={<ClassTimetablePage />} />
                  <Route path="/schedule" element={<WeeklySchedulePage />} />
                  <Route path="/students" element={<StudentsRosterPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </main>
          </div>

          {/* Global Notification Toast */}
          <Toast />

          {/* Reset Duty Password Security Modal */}
          <ResetDutyModal />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
