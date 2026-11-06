import { useState } from 'react';
import { Lock, X, RotateCcw, AlertCircle } from 'lucide-react';
import { useApp } from '../context/useApp';
import { getNextActiveDutyDate } from '../utils/semester';

export default function ResetDutyModal() {
  const { isResetModalOpen, closeResetModal, restartDutyCycle, currentDate } = useApp();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isResetModalOpen) return null;

  const dutyTarget = getNextActiveDutyDate(currentDate || new Date());

  const handleClose = () => {
    setPassword('');
    setError('');
    closeResetModal();
  };

  const handleSign = (e) => {
    e.preventDefault();
    const trimmed = password.trim();
    if (trimmed === '240807') {
      restartDutyCycle();
      handleClose();
    } else {
      setError('Incorrect admin password. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={handleClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[#fcf9f0] border-2 border-[#1c1c17] rounded-3xl p-6 sm:p-7 shadow-[8px_8px_0px_#1c1c17] z-10 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b-2 border-[#1c1c17] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#ffe24c] border-2 border-[#1c1c17] shadow-[2px_2px_0px_#1c1c17] flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-[#1c1c17]" />
            </div>
            <div>
              <h3 className="font-['Space_Grotesk'] text-lg font-bold uppercase tracking-tight text-[#1c1c17]">
                Reset Duty Rotation
              </h3>
              <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#48454d]">
                Password Authorization Required
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-xl bg-white border-2 border-[#1c1c17] shadow-[2px_2px_0px_#1c1c17] flex items-center justify-center hover:bg-[#ebe8df] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
            type="button"
          >
            <X className="w-4 h-4 text-[#1c1c17]" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSign} className="flex flex-col gap-4">
          <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#48454d] leading-relaxed">
            {dutyTarget.isFriday ? (
              <>
                Today is <strong>Friday Computer Lab Day</strong> (Lab 203 & 204 Building A) — zero projector duty needed today. Resetting will cleanly begin duty on <strong>Saturday with Slot #01</strong>. Please enter admin password to confirm.
              </>
            ) : dutyTarget.isSunday ? (
              <>
                Today is <strong>Sunday Weekly Rest Day</strong> — zero projector duty. Resetting will cleanly begin duty on <strong>Monday with Slot #01</strong>. Please enter admin password to confirm.
              </>
            ) : (
              <>
                Restart duty rotation starting <strong>today with fresh classmates</strong>. Please enter the admin password to confirm.
              </>
            )}
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="font-['Space_Grotesk'] text-xs font-bold uppercase text-[#1c1c17]">
              Admin Password
            </label>
            <div className="relative">
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter password..."
                className="w-full bg-white border-2 border-[#1c1c17] rounded-xl pl-9 pr-3 py-2 text-sm font-['Space_Grotesk'] font-bold text-[#1c1c17] placeholder-[#48454d] focus:outline-none focus:ring-2 focus:ring-[#ffe24c] shadow-[2px_2px_0px_#1c1c17]"
              />
              <Lock className="w-4 h-4 text-[#48454d] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {error && (
              <p className="flex items-center gap-1 font-['Space_Grotesk'] text-xs font-bold text-[#ba1a1a] mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
            
          </div>

          {/* Action Buttons: Sign and Cancel */}
          <div className="pt-3 border-t-2 border-[#1c1c17] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="bg-white hover:bg-[#ebe8df] text-[#1c1c17] px-4 py-2 rounded-xl border-2 border-[#1c1c17] shadow-[2px_2px_0px_#1c1c17] font-['Space_Grotesk'] text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#ffe24c] hover:bg-yellow-300 text-[#1c1c17] px-5 py-2 rounded-xl border-2 border-[#1c1c17] shadow-[2px_2px_0px_#1c1c17] font-['Space_Grotesk'] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Sign</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
