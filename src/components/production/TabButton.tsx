interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    label: string;
    icon: React.ReactNode;
    count: number;
    color: 'pink' | 'amber' | 'slate';
}

const TabButton = ({ active, onClick, label, icon, count, color }: TabButtonProps) => {
    const styles = {
    pink: active ? 'bg-pink-50 text-pink-700 ring-1 ring-pink-200 shadow-sm' : 'text-slate-500 hover:bg-slate-50',
    amber: active ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200 shadow-sm' : 'text-slate-500 hover:bg-slate-50',
    slate: active ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50',
  };

  return (
    <button 
      onClick={onClick}
      className={`flex-1 min-w-[180px] flex items-center justify-center gap-2 p-2.5 rounded-xl text-sm font-bold transition-all ${styles[color]}`}
    >
      {icon}
      {label}
      {count > 0 && (
        <span className={`px-1.5 py-0.5 rounded text-[10px] ${active ? 'bg-white/20' : 'bg-slate-200 text-slate-600'}`}>
          {count}
        </span>
      )}
    </button>
  );
}
 
export default TabButton;