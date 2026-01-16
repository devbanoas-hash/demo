interface BoardColumnProps {
    title: string;
    count: number;
    icon: React.ReactNode;
    children: React.ReactNode;
}

const BoardColumn = ({ title, count, icon, children }: BoardColumnProps) => {
  return (
    <div className="bg-slate-100/50 rounded-[2.5rem] border border-slate-200 flex flex-col min-h-[600px]">
    <div className="bg-white p-5 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10 rounded-t-[2.5rem]">
      <div className="flex items-center gap-2.5">
         {icon}
         <h3 className="text-xs font-black uppercase text-slate-700 tracking-tight">{title}</h3>
      </div>
      <span className="bg-slate-200 text-[11px] font-black px-2.5 py-0.5 rounded-full text-slate-600">{count}</span>
    </div>
    <div className="p-4 space-y-4">
      {children}
    </div>
  </div>
  );
}
 
export default BoardColumn;