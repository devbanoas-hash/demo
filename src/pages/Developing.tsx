import { LayoutDashboard } from "lucide-react";

const Developing = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                <LayoutDashboard size={32} className="opacity-50" />
            </div>
            <p>Tính năng đang phát triển</p>
        </div>
    )
}
 
export default Developing;