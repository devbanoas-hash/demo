import { useLocation } from 'react-router-dom';
import { UserCircle, Clock, Zap, Package, Truck, Users, Contact, LayoutGrid, LucideIcon } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { roleLabels } from '@/constants/role.constant';
import { useHeader } from '@/contexts/HeaderContext';

interface PageConfig {
  title: string;
  icon: LucideIcon;
  defaultSubtitle?: string;
}

const pageConfigs: Record<string, PageConfig> = {
  '/': {
    title: 'Trang chủ',
    icon: LayoutGrid,
    defaultSubtitle: 'Tổng quan hệ thống'
  },
  '/orders': {
    title: 'Quản lý Đơn hàng',
    icon: Package,
    defaultSubtitle: 'Danh sách đơn hàng'
  },
  '/production': {
    title: 'Khu Vực Sản Xuất',
    icon: Clock,
    defaultSubtitle: 'Danh sách đơn hàng'
  },
  '/delivery': {
    title: 'Quản lý Giao hàng',
    icon: Zap,
    defaultSubtitle: 'Điều phối đơn hàng'
  },
  '/products': {
    title: 'Sản phẩm',
    icon: Package,
    defaultSubtitle: 'Quản lý sản phẩm'
  },
  '/shippers': {
    title: 'Quản lý Shipper',
    icon: Truck,
    defaultSubtitle: 'Danh sách shipper'
  },
  '/customers': {
    title: 'Khách hàng',
    icon: Contact,
    defaultSubtitle: 'Danh sách khách hàng'
  },
  '/users': {
    title: 'Người dùng',
    icon: Users,
    defaultSubtitle: 'Quản lý người dùng'
  },
};

export function Header() {
  const location = useLocation();
  const { user } = useAuthStore();
  const userRole = user?.role_name || '';
  const { subtitle } = useHeader();

  const config = pageConfigs[location.pathname] || {
    title: 'Tiệm Bánh Vani',
    icon: LayoutGrid,
    defaultSubtitle: ''
  };

  const Icon = config.icon;
  const displaySubtitle = subtitle || config.defaultSubtitle || '';

  return (
    <header className="h-auto bg-white border-b border-slate-200 flex items-center justify-between px-6 py-4 shrink-0">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-[#B1454A] rounded-2xl text-white shadow-lg shadow-red-100">
          <Icon size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
            {config.title}
          </h1>
          {displaySubtitle && (
            <p className="text-xs font-bold text-slate-400">
              {displaySubtitle}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-slate-700">
            {user?.username || user?.email || 'Hệ thống Admin'}
          </p>
          <p className="text-xs text-slate-500">
            {userRole 
              ? (roleLabels[userRole as keyof typeof roleLabels] || userRole)
              : new Date().toLocaleDateString('vi-VN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })
            }
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 border border-slate-300">
          <UserCircle size={20} />
        </div>
      </div>
    </header>
  );
}
