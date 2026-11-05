import { 
  X, 
  CheckCircle2, 
  MapPin, 
  Sparkles,
  ClipboardCheck
} from 'lucide-react';
import { useApp } from '../context/useApp';

export default function StudentDetailModal() {
  const { 
    selectedStudent, 
    setSelectedStudent, 
    markDelivered, 
    markReturned, 
    updateStudentStatus 
  } = useApp();

  if (!selectedStudent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      {/* Backdrop click to close */}
      <div 
        className="fixed inset-0" 
        onClick={() => setSelectedStudent(null)} 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-[#fcf9f0] border-2 border-[#1c1c17] rounded-3xl p-6 sm:p-7 shadow-[8px_8px_0px_#1c1c17] z-10 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b-2 border-[#1c1c17] pb-3">
          <div className="flex items-center gap-2">
            <span className="font-['Space_Grotesk'] text-xs font-bold bg-[#1c1c17] text-[#ffe24c] px-3 py-1 rounded-xl border border-[#1c1c17]">
              {selectedStudent.slotNumber}
            </span>
            <span className="font-['Space_Grotesk'] text-xs font-bold text-[#1b6b4f]">
              Classmate Roster
            </span>
          </div>

          <button
            onClick={() => setSelectedStudent(null)}
            className="w-8 h-8 rounded-xl bg-white border-2 border-[#1c1c17] shadow-[2px_2px_0px_#1c1c17] flex items-center justify-center hover:bg-[#ebe8df] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            type="button"
          >
            <X className="w-4 h-4 text-[#1c1c17]" />
          </button>
        </div>

        {/* Student Profile Info */}
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl border-2 border-[#1c1c17] shadow-[3px_3px_0px_#1c1c17] flex items-center justify-center font-['Space_Grotesk'] text-2xl font-bold shrink-0"
            style={{ backgroundColor: selectedStudent.avatarBg || '#e0d4fd' }}
          >
            {selectedStudent.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h3 className="font-['Space_Grotesk'] text-xl font-bold text-[#1c1c17]">
              {selectedStudent.name}
            </h3>
          </div>
        </div>

        {/* Classroom & Duty Info Box */}
        <div className="bg-white border-2 border-[#1c1c17] p-4 rounded-xl shadow-[3px_3px_0px_#1c1c17] space-y-3">
          <div>
            <span className="text-[10px] font-['Space_Grotesk'] font-bold uppercase tracking-wider text-[#62597c] block">
              Classroom Location
            </span>
            <p className="font-['Space_Grotesk'] font-bold text-sm text-[#1c1c17] flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-4 h-4 text-[#ba1a1a]" />
              {selectedStudent.room || 'Room 205 (Building B) • Class E2'}
            </p>
          </div>

          <div className="pt-2.5 border-t border-[#1c1c17]/20">
            <span className="text-[10px] font-['Space_Grotesk'] font-bold uppercase tracking-wider text-[#1b6b4f] block">
              Class Duty Responsibilities
            </span>
            <div className="flex items-center gap-2 mt-1">
              <ClipboardCheck className="w-4 h-4 text-[#1b6b4f] shrink-0" />
              <p className="font-['Space_Grotesk'] font-bold text-xs text-[#002115]">
                Prepare projector, bring to class, and clean whiteboard
              </p>
            </div>
          </div>
        </div>

        {/* Duty Status Switcher */}
        <div>
          <label className="block text-xs font-['Space_Grotesk'] font-bold uppercase text-[#48454d] mb-1.5">
            Update Duty Status
          </label>
          <select
            value={selectedStudent.status}
            onChange={e => updateStudentStatus(selectedStudent.id, e.target.value)}
            className="w-full bg-white border-2 border-[#1c1c17] rounded-xl px-3 py-2 font-['Space_Grotesk'] text-sm font-bold shadow-[2px_2px_0px_#1c1c17] focus:outline-none"
          >
            <option value="done">Completed & Returned</option>
            <option value="active">Active Duty Today</option>
            <option value="tomorrow">Up Next Tomorrow</option>
            <option value="waiting">Waiting in Queue</option>
          </select>
        </div>

        {/* Quick Check-in / Return Actions */}
        <div className="pt-2 border-t-2 border-[#1c1c17] flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              markDelivered(selectedStudent.id);
              setSelectedStudent(null);
            }}
            className="flex-1 bg-[#ffe24c] hover:bg-yellow-300 text-[#1c1c17] py-2.5 rounded-xl border-2 border-[#1c1c17] shadow-[2px_2px_0px_#1c1c17] font-['Space_Grotesk'] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Mark In Class
          </button>

          <button
            type="button"
            onClick={() => {
              markReturned(selectedStudent.id);
              setSelectedStudent(null);
            }}
            className="flex-1 bg-[#a6f2cf] hover:bg-[#90e6be] text-[#002115] py-2.5 rounded-xl border-2 border-[#1c1c17] shadow-[2px_2px_0px_#1c1c17] font-['Space_Grotesk'] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#1b6b4f]" />
            Mark Returned
          </button>
        </div>
      </div>
    </div>
  );
}
