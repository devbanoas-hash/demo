interface StatItemProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
}

const StatItem = ({ label, value, icon, color }: StatItemProps) => {
    const themes: Record<string, string> = {
    slate: 'bg-slate-50 text-slate-600 border-slate-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    red: 'bg-red-50 text-[#B1454A] border-red-100',
  };
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${themes[color]}`}>{icon}</div>
        <div>
          <p className="text-2xl font-black text-slate-800 leading-none mb-1">{value}</p>
          <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">{label}</p>
        </div>
      </div>
    </div>
  );
}
 
export default StatItem;