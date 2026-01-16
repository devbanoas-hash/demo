import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { IShipper } from '@/types/shipper';

interface ShipperSelectorProps {
  shippers: IShipper[];
  onSelect: (id: string, isExternal: boolean) => void | Promise<void>;
  disabled?: boolean;
}

const ShipperSelector = ({ 
  shippers, 
  onSelect, 
  disabled = false 
}: ShipperSelectorProps) => {
    const [isOpen, setIsOpen] = useState(false);
   const buttonRef = useRef<HTMLButtonElement>(null);
   const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

   const toggle = (e: React.MouseEvent) => {
       e.stopPropagation();
       if (!isOpen && buttonRef.current) {
           const rect = buttonRef.current.getBoundingClientRect();
           setCoords({
               top: rect.bottom + window.scrollY + 4,
               left: rect.left + window.scrollX,
               width: rect.width
           });
       }
       setIsOpen(!isOpen);
   }

   useEffect(() => {
       if (!isOpen) return;
       const close = () => setIsOpen(false);
       window.addEventListener('click', close);
       return () => window.removeEventListener('click', close);
   }, [isOpen]);

   return (
       <>
         <button 
           ref={buttonRef}
           onClick={toggle}
           disabled={disabled}
           className={`w-full bg-slate-100 hover:bg-slate-200 py-2 rounded-lg text-[10px] font-bold text-slate-600 flex items-center justify-between px-3 transition-colors ${
             disabled ? 'opacity-50 cursor-not-allowed' : ''
           }`}
         >
           <span>Chọn Shipper</span>
           <ChevronDown size={14} className="text-slate-400" />
         </button>
         {isOpen && createPortal(
             <div 
                className="fixed bg-white border border-slate-200 shadow-xl rounded-xl p-1 z-[9999] flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-100"
                style={{ top: coords.top, left: coords.left, minWidth: '160px' }}
                onClick={(e) => e.stopPropagation()}
             >
                {shippers.map(s => (
                    <button
                        key={s.app_id}
                        onClick={() => { onSelect(s.app_id, false); setIsOpen(false); }}
                        className="text-left px-3 py-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-xs font-bold text-slate-600 transition-colors flex items-center justify-between group"
                    >
                        {s.shipper_name}
                        {s.status === 'free' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>}
                    </button>
                ))}
                <div className="h-px bg-slate-100 my-0.5"></div>
                <button
                    onClick={() => { onSelect('external_ship', true); setIsOpen(false); }}
                    className="text-left px-3 py-2 hover:bg-amber-50 hover:text-amber-600 rounded-lg text-xs font-bold text-slate-600 transition-colors"
                >
                    Ship Ngoài
                </button>
             </div>,
             document.body
         )}
       </>
   )
}
 
export default ShipperSelector;