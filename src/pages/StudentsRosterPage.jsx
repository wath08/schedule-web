import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  LayoutGrid, 
  List,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/useApp';

export default function StudentsRosterPage() {
  const { students, setSelectedStudent, resetAllData } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Default view is always Table View (Image 2)
  const [viewMode, setViewMode] = useState('table');

  useEffect(() => {
    try {
      localStorage.removeItem('students_view_mode');
    } catch {
      // ignore
    }
  }, []);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      (student.slotNumber && student.slotNumber.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'done' ? student.status === 'done' :
      statusFilter === 'active' ? student.status === 'active' :
      statusFilter === 'tomorrow' ? student.status === 'tomorrow' :
      statusFilter === 'waiting' ? student.status === 'waiting' : true;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border-2 border-[#1c1c17] shadow-[6px_6px_0px_#1c1c17]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#a6f2cf] border-2 border-[#1c1c17] shadow-[3px_3px_0px_#1c1c17] flex items-center justify-center font-bold">
            <Users className="w-6 h-6 text-[#1b6b4f]" />
          </div>
          <div>
            <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#1c1c17]">
              Classmate Projector Duty Roster
            </h1>
            <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#48454d]">
              RUPP • Room 205 (Building B)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetAllData}
            className="bg-[#f6f3ea] hover:bg-[#ffe24c] px-3.5 py-1.5 rounded-xl border-2 border-[#1c1c17] font-['Space_Grotesk'] text-xs font-bold text-[#1c1c17] shadow-[2px_2px_0px_#1c1c17] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer flex items-center gap-1.5"
            title="Reset duty roster to match active semester schedule"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Roster</span>
          </button>
          <div className="bg-[#f6f3ea] px-3.5 py-1.5 rounded-xl border border-[#1c1c17] font-['Space_Grotesk'] text-xs font-bold text-[#1c1c17]">
            Classmates Registered
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#f6f3ea] p-3 rounded-2xl border-2 border-[#1c1c17] shadow-[3px_3px_0px_#1c1c17]">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: `All (${students.length})` },
            { id: 'done', label: `Turned In (${students.filter(s => s.status === 'done').length})` },
            { id: 'active', label: `Duty Today (${students.filter(s => s.status === 'active').length})` },
            { id: 'tomorrow', label: `Tomorrow (${students.filter(s => s.status === 'tomorrow').length})` },
            { id: 'waiting', label: `In Queue (${students.filter(s => s.status === 'waiting').length})` },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl font-['Space_Grotesk'] text-xs font-bold transition-all cursor-pointer ${
                statusFilter === f.id
                  ? 'bg-[#1c1c17] text-white shadow-[1px_1px_0px_#1c1c17]'
                  : 'bg-white text-[#48454d] hover:bg-[#ebe8df] border border-[#1c1c17]'
              }`}
              type="button"
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search & View Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search classmate..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border-2 border-[#1c1c17] rounded-xl pl-8 pr-3 py-1.5 text-xs font-['Space_Grotesk'] text-[#1c1c17] placeholder-[#48454d] focus:outline-none focus:ring-2 focus:ring-[#ffe24c] shadow-[2px_2px_0px_#1c1c17]"
            />
            <Search className="w-3.5 h-3.5 text-[#48454d] absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center bg-white border-2 border-[#1c1c17] rounded-xl p-1 shadow-[2px_2px_0px_#1c1c17]">
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-[#ffe24c] text-[#1c1c17]' : 'text-[#48454d] hover:text-[#1c1c17]'
              }`}
              title="Grid View"
              type="button"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleViewModeChange('table')}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-[#ffe24c] text-[#1c1c17]' : 'text-[#48454d] hover:text-[#1c1c17]'
              }`}
              title="Table View"
              type="button"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid or Table Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map(student => {
            const isDone = student.status === 'done';
            const isActive = student.status === 'active';
            const isTomorrow = student.status === 'tomorrow';

            return (
              <div
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className="bg-white border-2 border-[#1c1c17] rounded-2xl p-5 shadow-[4px_4px_0px_#1c1c17] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[6px_6px_0px_#1c1c17] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-['Space_Grotesk'] text-xs font-bold bg-[#1c1c17] text-[#ffe24c] px-2.5 py-0.5 rounded-lg border border-[#1c1c17]">
                      {student.slotNumber}
                    </span>

                    <span
                      className={`font-['Space_Grotesk'] text-xs font-bold uppercase px-2 py-0.5 rounded-full border border-[#1c1c17] ${
                        isActive
                          ? 'bg-[#ffe24c] text-[#211b00]'
                          : isDone
                          ? 'bg-[#a6f2cf] text-[#002115]'
                          : isTomorrow
                          ? 'bg-[#e0d4fd] text-[#1e1635]'
                          : 'bg-[#f1eee5] text-[#48454d]'
                      }`}
                    >
                      {isActive ? 'Duty Today' : isDone ? 'Returned' : isTomorrow ? 'Tomorrow' : 'In Queue'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 my-2">
                    <div
                      className="w-12 h-12 rounded-xl border-2 border-[#1c1c17] flex items-center justify-center font-['Space_Grotesk'] text-lg font-bold shadow-[2px_2px_0px_#1c1c17]"
                      style={{ backgroundColor: student.avatarBg || '#e0d4fd' }}
                    >
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#1c1c17]">
                        {student.name}
                      </h3>
                      <p className="font-['Space_Grotesk'] text-xs text-[#1b6b4f] font-semibold mt-0.5">
                        Projector & Whiteboard Duty
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1c1c17]/20 flex items-center justify-between text-xs font-['Space_Grotesk']">
                  <span className="font-bold flex items-center gap-1.5 text-[#1b6b4f]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Duty Slot
                  </span>
                  <span className="text-[#62597c] font-bold hover:underline">
                    View Details &gt;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white border-2 border-[#1c1c17] rounded-2xl shadow-[6px_6px_0px_#1c1c17] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f6f3ea] border-b-2 border-[#1c1c17] font-['Space_Grotesk'] text-xs font-bold uppercase text-[#1c1c17]">
                  <th className="p-3.5">Slot</th>
                  <th className="p-3.5">Classmate Name</th>
                  <th className="p-3.5">Assigned Duty</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y border-[#1c1c17]/20 font-['Plus_Jakarta_Sans'] text-sm">
                {filteredStudents.map(student => (
                  <tr
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className="hover:bg-[#fcf9f0] transition-colors cursor-pointer"
                  >
                    <td className="p-3.5 font-['Space_Grotesk'] font-bold text-xs">
                      <span className="bg-[#1c1c17] text-[#ffe24c] px-2 py-0.5 rounded border border-[#1c1c17]">
                        {student.slotNumber}
                      </span>
                    </td>
                    <td className="p-3.5 font-['Space_Grotesk'] font-bold text-[#1c1c17]">
                      {student.name}
                    </td>
                    <td className="p-3.5 text-xs font-['Space_Grotesk'] font-bold text-[#1b6b4f]">
                      Projector & Whiteboard Duty
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`font-['Space_Grotesk'] text-[11px] font-bold uppercase px-2 py-0.5 rounded-full border border-[#1c1c17] ${
                          student.status === 'active'
                            ? 'bg-[#ffe24c] text-[#211b00]'
                            : student.status === 'done'
                            ? 'bg-[#a6f2cf] text-[#002115]'
                            : student.status === 'tomorrow'
                            ? 'bg-[#e0d4fd] text-[#1e1635]'
                            : 'bg-[#f1eee5] text-[#48454d]'
                        }`}
                      >
                        {student.status === 'active' ? 'Duty Today' : student.status === 'done' ? 'Returned' : student.status === 'tomorrow' ? 'Tomorrow' : 'In Queue'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
