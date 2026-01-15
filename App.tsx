
import React, { useState } from 'react';
import DeliveryPage from './pages/DeliveryPage';
import ProductionPage from './pages/ProductionPage';
import OrderManagementPage from './pages/OrderManagementPage';
import { Package, LayoutDashboard, Truck, Users, ChefHat, UserCircle, UserCog, Box, Contact } from 'lucide-react';

const LOGO_URL = "logo-vani.jpg"; // Vani Logo

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<'overview' | 'orders' | 'production' | 'delivery' | 'shipper' | 'customers' | 'products' | 'users'>('orders');

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-[#B1454A] text-white hidden md:flex flex-col shrink-0 transition-all overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-red-100 overflow-hidden">
               <img src={LOGO_URL} alt="Vani Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Tiệm Bánh Vani</h1>
              <p className="text-xs text-white/70">Quản lý đơn hàng</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-2 pb-6">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Tổng quan" 
            active={activePage === 'overview'} 
            onClick={() => setActivePage('overview')}
          />
          <SidebarItem 
            icon={<Package size={20} />} 
            label="Đơn hàng" 
            active={activePage === 'orders'} 
            onClick={() => setActivePage('orders')}
          />
          <SidebarItem 
            icon={<ChefHat size={20} />} 
            label="Sản xuất" 
            active={activePage === 'production'} 
            onClick={() => setActivePage('production')}
          />
          <SidebarItem 
            icon={<Truck size={20} />} 
            label="Giao hàng" 
            active={activePage === 'delivery'} 
            onClick={() => setActivePage('delivery')}
          />
          
          {/* Management Section */}
          <div className="px-4 mt-8 mb-2 text-xs font-bold text-white/50 uppercase tracking-wider">
             Quản Lý
          </div>
          
          <SidebarItem 
            icon={<Contact size={20} />} 
            label="Khách hàng" 
            active={activePage === 'customers'} 
            onClick={() => setActivePage('customers')}
          />
          <SidebarItem 
            icon={<Box size={20} />} 
            label="Sản phẩm" 
            active={activePage === 'products'} 
            onClick={() => setActivePage('products')}
          />
          <SidebarItem 
            icon={<Users size={20} />} 
            label="Shipper" 
            active={activePage === 'shipper'} 
            onClick={() => setActivePage('shipper')}
          />
           <SidebarItem 
            icon={<UserCog size={20} />} 
            label="Người dùng" 
            active={activePage === 'users'} 
            onClick={() => setActivePage('users')}
          />
        </nav>

        <div className="p-4 border-t border-white/10 text-xs text-white/50">
          © 2024 Vani Bakery ERP
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <h2 className="text-xl font-semibold text-slate-800">
            {activePage === 'production' ? 'Quản lý Sản xuất' : 
             activePage === 'delivery' ? 'Quản lý Giao hàng' : 
             activePage === 'orders' ? 'Quản lý Đơn hàng' : 
             activePage === 'shipper' ? 'Quản lý Shipper' :
             activePage === 'customers' ? 'Khách hàng' :
             activePage === 'products' ? 'Sản phẩm' :
             activePage === 'users' ? 'Người dùng' : 'Trang chủ'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-700">Hệ thống Admin</p>
              <p className="text-xs text-slate-500">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 border border-slate-300">
              <UserCircle size={20} />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {activePage === 'production' && <ProductionPage />}
          {activePage === 'delivery' && <DeliveryPage />}
          {activePage === 'orders' && <OrderManagementPage />}
          {['overview', 'shipper', 'customers', 'products', 'users'].includes(activePage) && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
               <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                  <LayoutDashboard size={32} className="opacity-50" />
               </div>
              <p>Tính năng đang phát triển</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
    active ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10' : 'text-white/70 hover:bg-white/5 hover:text-white'
  }`}>
    {icon}
    {label}
  </button>
);

export default App;
