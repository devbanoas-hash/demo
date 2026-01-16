interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

export const SidebarItem = ({ icon, label, active, onClick }: SidebarItemProps) => {
    return (
        <button 
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            active ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10' : 'text-white/70 hover:bg-white/5 hover:text-white'
        }`}>
            {icon}
            {label}
        </button>
    );
};