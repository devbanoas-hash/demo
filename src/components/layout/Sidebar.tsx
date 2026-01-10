import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  ChefHat, 
  Truck, 
  Package,
  Users,
  UserCircle,
  Contact
} from 'lucide-react';
import logoVani from '@/assets/logo-vani.jpg';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/orders', icon: ClipboardList, label: 'Đơn hàng' },
  { to: '/production', icon: ChefHat, label: 'Sản xuất' },
  { to: '/delivery', icon: Truck, label: 'Giao hàng' },
];

const managementItems = [
  { to: '/customers', icon: Contact, label: 'Khách hàng' },
  { to: '/products', icon: Package, label: 'Sản phẩm' },
  { to: '/shippers', icon: Truck, label: 'Shipper' },
  { to: '/users', icon: Users, label: 'Người dùng' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col">
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
        <img src={logoVani} alt="Vani Bakery" className="w-12 h-12 rounded-full object-cover" />
        <div>
          <h1 className="font-bold text-lg">Tiệm Bánh Vani</h1>
          <p className="text-xs opacity-80">Quản lý đơn hàng</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <p className="text-xs uppercase opacity-60 mb-2 px-3">Điều hướng</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/50'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div className="pt-4">
          <p className="text-xs uppercase opacity-60 mb-2 px-3">Quản lý</p>
          {managementItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                  isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/50'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <UserCircle className="w-8 h-8" />
          <div>
            <p className="text-sm font-medium">Admin Vani</p>
            <p className="text-xs opacity-80">Quản trị viên</p>
          </div>
        </div>
      </div>
    </aside>
  );
}