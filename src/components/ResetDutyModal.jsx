import { useState, useEffect } from 'react';
import { Lock, X, RotateCcw, AlertCircle, Clock } from 'lucide-react';
import { useApp } from '../context/useApp';
import { getNextActiveDutyDate } from '../utils/semester';

const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 60 * 1000; // 1 minute lockout
const STORAGE_KEY_ATTEMPTS = 'duty_admin_fail_attempts';
const STORAGE_KEY_LOCKOUT = 'duty_admin_lockout_until';

function getStoredLockoutRemaining() {
  try {
    const lockUntil = parseInt(localStorage.getItem(STORAGE_KEY_LOCKOUT) || '0', 10);
    const now = Date.now();
    if (lockUntil > now) {
      return Math.ceil((lockUntil - now) / 1000);
    }
  } catch {
    // ignore
  }
  return 0;
}

export default function ResetDutyModal() {
  const { isResetModalOpen, closeResetModal, restartDutyCycle, currentDate } = useApp();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [lockoutRemaining, setLockoutRemaining] = useState(getStoredLockoutRemaining);

  // Sync lockout countdown when modal is opened
  useEffect(() => {
    if (!isResetModalOpen) return;

    const syncTimer = setTimeout(() => {
      setLockoutRemaining(getStoredLockoutRemaining());
    }, 0);

    return () => clearTimeout(syncTimer);
  }, [isResetModalOpen]);

  // Tick down the 1-minute countdown timer every second
  useEffect(() => {
    if (!isResetModalOpen || lockoutRemaining <= 0) return;

    const interval = setInterval(() => {
      const remaining = getStoredLockoutRemaining();
      setLockoutRemaining(remaining);
      if (remaining === 0) {
        try {
          localStorage.removeItem(STORAGE_KEY_LOCKOUT);
          localStorage.removeItem(STORAGE_KEY_ATTEMPTS);
        } catch {
          // ignore
        }
        setError('');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isResetModalOpen, lockoutRemaining]);

  if (!isResetModalOpen) return null;

  const dutyTarget = getNextActiveDutyDate(currentDate || new Date());
  const isLocked = lockoutRemaining > 0;

  const handleClose = () => {
    if (isLocked) return; // Cannot close while locked out
    setPassword('');
    setError('');
    closeResetModal();
  };

  const handleSign = (e) => {
    e.preventDefault();
    if (isLocked) return;

    const trimmed = password.trim();
    if (trimmed === '240807') {
      try {
        localStorage.removeItem(STORAGE_KEY_ATTEMPTS);
        localStorage.removeItem(STORAGE_KEY_LOCKOUT);
      } catch {
        // ignore
      }
      restartDutyCycle();
      handleClose();
    } else {
      let currentAttempts = 0;
      try {
        currentAttempts = parseInt(localStorage.getItem(STORAGE_KEY_ATTEMPTS) || '0', 10) || 0;
      } catch {
        // ignore
      }
      const attempts = currentAttempts + 1;

      if (attempts >= MAX_ATTEMPTS) {
        const lockUntil = Date.now() + LOCKOUT_DURATION_MS;
        try {
          localStorage.setItem(STORAGE_KEY_LOCKOUT, String(lockUntil));
          localStorage.setItem(STORAGE_KEY_ATTEMPTS, String(attempts));
        } catch {
          // ignore
        }
        setLockoutRemaining(60);
        setError('Too many incorrect attempts! Locked for 1 minute.');
        setPassword('');
      } else {
        try {
          localStorage.setItem(STORAGE_KEY_ATTEMPTS, String(attempts));
        } catch {
          // ignore
        }
        const remainingAttempts = MAX_ATTEMPTS - attempts;
        setError(
          `Incorrect admin password. ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.`
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={isLocked ? undefined : handleClose} />

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
            disabled={isLocked}
            className={`w-8 h-8 rounded-xl border-2 border-[#1c1c17] shadow-[2px_2px_0px_#1c1c17] flex items-center justify-center transition-all ${
              isLocked
                ? 'bg-[#ebe8df] opacity-40 cursor-not-allowed shadow-none'
                : 'bg-white hover:bg-[#ebe8df] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer'
            }`}
            type="button"
            title={isLocked ? `Locked (${lockoutRemaining}s)` : 'Close'}
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
            <label className="font-['Space_Grotesk'] text-xs font-bold uppercase text-[#1c1c17] flex items-center justify-between">
              <span>Admin Password</span>
              {isLocked && (
                <span className="text-[#ba1a1a] text-[11px] font-bold">
                  Locked ({lockoutRemaining}s)
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="password"
                autoFocus={!isLocked}
                disabled={isLocked}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder={isLocked ? `Locked. Try again in ${lockoutRemaining}s...` : 'Enter password...'}
                className={`w-full border-2 border-[#1c1c17] rounded-xl pl-9 pr-3 py-2 text-sm font-['Space_Grotesk'] font-bold text-[#1c1c17] placeholder-[#48454d] focus:outline-none focus:ring-2 focus:ring-[#ffe24c] shadow-[2px_2px_0px_#1c1c17] transition-all ${
                  isLocked ? 'bg-[#ebe8df] cursor-not-allowed opacity-70' : 'bg-white'
                }`}
              />
              <Lock className="w-4 h-4 text-[#48454d] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {isLocked ? (
              <div className="flex items-center gap-2 bg-[#ffdad6] text-[#ba1a1a] p-2.5 rounded-xl border-2 border-[#1c1c17] shadow-[2px_2px_0px_#1c1c17] font-['Space_Grotesk'] text-xs font-bold mt-1">
                <Clock className="w-3.5 h-3.5 shrink-0 animate-spin" />
                <span>Too many failed attempts (3/3). Locked for {lockoutRemaining}s.</span>
              </div>
            ) : error ? (
              <p className="flex items-center gap-1 font-['Space_Grotesk'] text-xs font-bold text-[#ba1a1a] mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </p>
            ) : null}
          </div>

          {/* Action Buttons: Sign and Cancel */}
          <div className="pt-3 border-t-2 border-[#1c1c17] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLocked}
              className={`px-4 py-2 rounded-xl border-2 border-[#1c1c17] font-['Space_Grotesk'] text-xs font-bold transition-all ${
                isLocked
                  ? 'bg-[#ebe8df] text-[#48454d] opacity-40 cursor-not-allowed shadow-none border-[#1c1c17]/50'
                  : 'bg-white hover:bg-[#ebe8df] text-[#1c1c17] shadow-[2px_2px_0px_#1c1c17] cursor-pointer'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLocked}
              className={`px-5 py-2 rounded-xl border-2 border-[#1c1c17] font-['Space_Grotesk'] text-xs font-bold transition-all flex items-center gap-1.5 ${
                isLocked
                  ? 'bg-[#ebe8df] text-[#48454d] opacity-60 cursor-not-allowed border-[#1c1c17]/50 shadow-none'
                  : 'bg-[#ffe24c] hover:bg-yellow-300 text-[#1c1c17] shadow-[2px_2px_0px_#1c1c17] cursor-pointer active:translate-x-[1px] active:translate-y-[1px]'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isLocked ? `Locked (${lockoutRemaining}s)` : 'Sign'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
