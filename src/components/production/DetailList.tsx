interface DetailListProps {
    title: string;
    items: Record<string, number>;
    icon: React.ReactNode;
    color: 'amber' | 'pink';
}

const DetailList = ({ title, items, icon, color }: DetailListProps) => {
    const textColor = color === 'amber' ? 'text-amber-700' : 'text-pink-700';
   const countColor = color === 'amber' ? 'text-amber-600' : 'text-pink-600';
   
   return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm h-full">
         <h3 className={`flex items-center gap-2 ${textColor} font-black uppercase text-sm mb-4`}>
            {icon} {title}
         </h3>
         <div className="space-y-3">
            {Object.entries(items).map(([name, count]) => (
               <div key={name} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 rounded px-1 transition-colors">
                  <span className="text-slate-700 font-medium text-sm">{name}</span>
                  <span className={`${countColor} font-black text-lg`}>{count}</span>
               </div>
            ))}
            {Object.keys(items).length === 0 && (
              <p className="text-slate-400 text-sm italic text-center py-8">Chưa có dữ liệu</p>
            )}
         </div>
      </div>
   );
}
 
export default DetailList;