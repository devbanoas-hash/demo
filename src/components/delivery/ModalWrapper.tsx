import React from 'react';
import { X } from 'lucide-react';

interface ModalWrapperProps {
    title: string;
    children: React.ReactNode;
    onClose: () => void;
}

const ModalWrapper = ({ title, children, onClose }: ModalWrapperProps) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={18}/></button>
        <h3 className="text-xl font-black text-slate-900 mb-6">{title}</h3>
        {children}
      </div>
    </div>
  );
}
 
export default ModalWrapper;