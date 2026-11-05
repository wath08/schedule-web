import { Megaphone } from 'lucide-react';
import { useApp } from '../context/useApp';

export default function Toast() {
  const { toast } = useApp();

  if (!toast.show) return null;

  const getBgColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-[#a6f2cf] text-[#002115]';
      case 'warning':
        return 'bg-[#ffe24c] text-[#211b00]';
      case 'error':
        return 'bg-[#ffdad6] text-[#93000a]';
      default:
        return 'bg-[#ffe24c] text-[#211b00]';
    }
  };

  return (
    <div
      className={`fixed top-24 right-4 sm:right-8 z-[70] transition-all duration-300 transform flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 border-[#1c1c17] shadow-[4px_4px_0px_#1c1c17] ${getBgColor()}`}
    >
      <Megaphone className="w-5 h-5 flex-shrink-0" />
      <span className="font-['Space_Grotesk'] text-sm font-bold">{toast.message}</span>
    </div>
  );
}
