import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  ChefHat, 
  Truck, 
  Package,
  Users,
  UserCog,
  Contact,
  Box
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { canRoleAccessRoute, ADMIN_ROLE } from '@/config/routePermissions';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/orders', icon: ClipboardList, label: 'Đơn hàng' },
  { to: '/production', icon: ChefHat, label: 'Sản xuất' },
  { to: '/delivery', icon: Truck, label: 'Giao hàng' },
];

const managementItems = [
  { to: '/customers', icon: Contact, label: 'Khách hàng' },
  { to: '/products', icon: Box, label: 'Sản phẩm' },
  { to: '/shippers', icon: Truck, label: 'Shipper' },
  { to: '/users', icon: UserCog, label: 'Người dùng' },
];

export function Sidebar() {
  const { user } = useAuthStore();
  const userRole = user?.role_name || '';

  // Filter nav items based on role permissions
  const filteredNavItems = navItems.filter(item => {
    if (userRole === ADMIN_ROLE) return true;
    return canRoleAccessRoute(userRole, item.to);
  });

  // Filter management items based on role permissions
  const filteredManagementItems = managementItems.filter(item => {
    if (userRole === ADMIN_ROLE) return true;
    return canRoleAccessRoute(userRole, item.to);
  });

  return (
    <aside className="w-64 bg-[#B1454A] text-white hidden md:flex flex-col shrink-0 transition-all overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-red-100 overflow-hidden">
            <img src={"logo-vani.jpg"} alt="Vani Logo" loading="lazy" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Tiệm Bánh Vani</h1>
            <p className="text-xs text-white/70">Quản lý đơn hàng</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 mt-2 pb-6">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive 
                  ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10' 
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              )
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}

        {filteredManagementItems.length > 0 && (
          <>
            <div className="px-4 mt-8 mb-2 text-xs font-bold text-white/50 uppercase tracking-wider">
              Quản Lý
            </div>
            
            {filteredManagementItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive 
                      ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10' 
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  )
                }
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-white/10 text-xs text-white/50">
        Strategic Technology by Bano AI
      </div>
    </aside>
  );
}
