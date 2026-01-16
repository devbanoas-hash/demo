import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface LoadingModalProps {
  open: boolean;
}

export function LoadingModal({
  open,
}: LoadingModalProps) {
  if (!open) return null;

  const [messageIndex, setMessageIndex] = useState(0);
  const messages = [
    "Đang nướng bánh...",
    "Chuẩn bị nguyên liệu...",
    "Đang kiểm tra đơn hàng...",
    "Sắp xếp shipper...",
    "Hệ thống Vani sẵn sàng!"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[999] bg-white flex flex-col items-center justify-center animate-in fade-in duration-500">
      <div className="relative">
        {/* Outer Glow Effect */}
        <div className="absolute inset-0 bg-[#B1454A]/20 rounded-full blur-3xl animate-pulse"></div>
        
        {/* Branded Logo with Pulse */}
        <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl border-2 border-[#B1454A]/10 overflow-hidden animate-bounce">
          <img src={"logo-vani.jpg"} alt="Vani Logo" loading="lazy" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-4">
        <h2 className="text-xl font-black text-slate-800 tracking-tight">TIỆM BÁNH VANI</h2>
        <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
          <Loader2 size={16} className="animate-spin text-[#B1454A]" />
          <span>{messages[messageIndex]}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
          <div className="h-full bg-[#B1454A] rounded-full animate-progress-loading"></div>
        </div>
      </div>

      <style>{`
        @keyframes progress-loading {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 70%; transform: translateX(0%); }
          100% { width: 100%; transform: translateX(100%); }
        }
        .animate-progress-loading {
          animation: progress-loading 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
