interface SummaryCardProps { 
    title: string; 
    value: number | string; 
    icon: React.ReactNode; 
    color: 'amber' | 'pink' | 'indigo' | 'emerald';
}

const SummaryCard = ({ title, value, icon, color }: SummaryCardProps) => {
   const themes = {
      amber: 'bg-[#FFFBEB] border-[#FDE68A] text-amber-900 icon-bg-amber-200 icon-text-amber-700',
      pink: 'bg-[#FDF2F8] border-[#FBCFE8] text-pink-900 icon-bg-pink-200 icon-text-pink-700',
      indigo: 'bg-[#F5F3FF] border-[#DDD6FE] text-indigo-900 icon-bg-indigo-200 icon-text-indigo-700',
      emerald: 'bg-[#ECFDF5] border-[#A7F3D0] text-emerald-900 icon-bg-emerald-200 icon-text-emerald-700',
   };

   const theme = themes[color];

   return (
      <div className={`${theme.split(' ')[0]} ${theme.split(' ')[1]} p-5 rounded-2xl border flex items-center justify-between relative overflow-hidden`}>
         <div className="relative z-10">
            <p className={`font-bold text-sm mb-1 opacity-90`}>{title}</p>
            <p className="text-3xl font-black tracking-tight">{value}</p>
         </div>
         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${theme.match(/icon-bg-\S+/)?.[0].replace('icon-bg-', 'bg-')} ${theme.match(/icon-text-\S+/)?.[0].replace('icon-text-', 'text-')}`}>
            {icon}
         </div>
      </div>
   );
}
 
export default SummaryCard;