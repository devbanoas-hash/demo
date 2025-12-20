import { Bell, Download, Calendar, ChevronDown, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 hover:bg-muted transition-colors lg:hidden"
        >
          <Menu className="h-5 w-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Tổng quan Phòng khám</h1>
          <p className="text-sm text-muted-foreground">Chào mừng trở lại, Dr. Nguyễn!</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-40 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* Date Filter */}
        <button className="hidden sm:flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>Tháng 12, 2024</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Export Button */}
        <Button className="hidden sm:flex shadow-purple">
          <Download className="h-4 w-4 mr-2" />
          Xuất Excel
        </Button>

        {/* Notifications */}
        <button className="relative rounded-lg p-2 hover:bg-muted transition-colors">
          <Bell className="h-5 w-5 text-foreground" />
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            3
          </span>
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-3 border-l pl-3">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
            N
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-foreground">Dr. Nguyễn</p>
            <p className="text-xs text-muted-foreground">Quản lý</p>
          </div>
        </div>
      </div>
    </header>
  );
}
