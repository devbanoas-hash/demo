import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Settings,
  BarChart3,
  Package,
  Stethoscope,
  Search,
  Building2,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Tổng quan", icon: <LayoutDashboard className="w-5 h-5" />, href: "/" },
  { label: "CEO", icon: <TrendingUp className="w-5 h-5" />, href: "/ceo" },
  { label: "Phòng Ban", icon: <BarChart3 className="w-5 h-5" />, href: "/phong-ban" },
  { label: "Phòng Khám", icon: <Building2 className="w-5 h-5" />, href: "/phong-kham" },
  { label: "Khách hàng", icon: <Users className="w-5 h-5" />, href: "/customer-hub" },
  { label: "Bác sĩ", icon: <Stethoscope className="w-5 h-5" />, href: "/doctor-hub" },
  { label: "Vật tư", icon: <Package className="w-5 h-5" />, href: "/material-hub" },
];

interface DashboardSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function DashboardSidebar({ collapsed = false }: DashboardSidebarProps) {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
          <Stethoscope className="h-6 w-6 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-lg font-bold">DentalCare</h1>
            <p className="text-xs text-sidebar-foreground/70">Quản lý phòng khám</p>
          </div>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="p-4">
          <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent px-3 py-2">
            <Search className="h-4 w-4 text-sidebar-foreground/60" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-sidebar-foreground/50"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-sidebar-accent",
                  isActive(item.href) && "bg-sidebar-primary text-sidebar-primary-foreground shadow-purple"
                )}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Settings */}
      <div className="border-t border-sidebar-border p-3">
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-sidebar-accent",
            isActive("/settings") && "bg-sidebar-primary text-sidebar-primary-foreground"
          )}
        >
          <Settings className="h-5 w-5" />
          {!collapsed && <span>Cài đặt</span>}
        </Link>
      </div>
    </aside>
  );
}
