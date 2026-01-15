
import React, { useState, useMemo } from 'react';
import { 
  ChefHat, Cake, Package, DollarSign, 
  ChevronRight, ChevronLeft, RefreshCw, 
  Camera, CheckCircle, Clock, MapPin, AlertTriangle, AlertCircle,
  ListFilter, Image as ImageIcon
} from 'lucide-react';
import { Order } from '../types';
import { MOCK_ORDERS } from '../store/mockData';

const ProductionPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [activeTab, setActiveTab] = useState<'cream' | 'pastry' | 'all'>('cream');
  const [viewDate, setViewDate] = useState(new Date());

  // Format Date for Display
  const formattedDate = useMemo(() => {
    return viewDate.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  }, [viewDate]);

  // Update Status Helper
  const updateStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  // --- STATS LOGIC ---
  const stats = useMemo(() => {
    // Active Production orders (In Kitchen)
    const activeProduction = orders.filter(o => o.status === 'in_production');
    
    // Counts for Top Cards
    const pastryCount = activeProduction.filter(o => o.kitchen === 'pastry').reduce((sum, o) => sum + (o.quantity || 1), 0);
    const creamCount = activeProduction.filter(o => o.kitchen === 'cream').reduce((sum, o) => sum + (o.quantity || 1), 0);
    const customCount = activeProduction.filter(o => o.kitchen === 'custom').length;

    // Ready to Handover stats (Money & Count)
    const readyOrders = orders.filter(o => o.status === 'ready_to_handover');
    const readyCount = readyOrders.length;
    const readyMoney = readyOrders.reduce((sum, o) => sum + o.collection, 0);

    // Breakdown Details (Product Name -> Quantity)
    const pastryDetails = activeProduction
      .filter(o => o.kitchen === 'pastry')
      .reduce((acc, o) => {
        const name = o.productName || 'Bánh khác';
        acc[name] = (acc[name] || 0) + (o.quantity || 1);
        return acc;
      }, {} as Record<string, number>);

    const creamDetails = activeProduction
      .filter(o => o.kitchen === 'cream')
      .reduce((acc, o) => {
        const name = o.productName || 'Bánh khác';
        acc[name] = (acc[name] || 0) + (o.quantity || 1);
        return acc;
      }, {} as Record<string, number>);

    // Tab Counts
    const tabCreamCount = activeProduction.filter(o => o.kitchen === 'cream').length;
    const tabPastryCount = activeProduction.filter(o => o.kitchen === 'pastry' || o.kitchen === 'custom').length;
    const tabAllCount = orders.filter(o => ['in_production', 'ready_to_handover'].includes(o.status)).length;

    return { 
        pastryCount, creamCount, customCount, 
        readyCount, readyMoney, 
        pastryDetails, creamDetails,
        tabCreamCount, tabPastryCount, tabAllCount
    };
  }, [orders]);

  // --- TAB LIST FILTER LOGIC ---
  const filteredOrders = useMemo(() => {
    let filtered = [];
    
    if (activeTab === 'cream') {
      filtered = orders.filter(o => o.status === 'in_production' && o.kitchen === 'cream');
    } else if (activeTab === 'pastry') {
      filtered = orders.filter(o => o.status === 'in_production' && (o.kitchen === 'pastry' || o.kitchen === 'custom'));
    } else {
      filtered = orders.filter(o => ['in_production', 'ready_to_handover'].includes(o.status));
    }

    // Sort by Date + Time (Full Timestamp) to ensure Late (Past) < Risk (Near Future) < Normal
    return filtered.sort((a, b) => {
       const dateA = new Date(`${a.deliveryDate}T${a.deliveryTime}`);
       const dateB = new Date(`${b.deliveryDate}T${b.deliveryTime}`);
       return dateA.getTime() - dateB.getTime();
    });
  }, [orders, activeTab]);

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8">
      
      {/* SECTION 1: TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
           title="Bánh Âu" 
           value={stats.pastryCount} 
           icon={<ChefHat size={20} />} 
           color="amber" 
        />
        <SummaryCard 
           title="Bánh Kem" 
           value={stats.creamCount} 
           icon={<Cake size={20} />} 
           color="pink" 
        />
        <SummaryCard 
           title="Bánh đặt riêng" 
           value={stats.customCount} 
           icon={<Package size={20} />} 
           color="indigo" 
        />
        <SummaryCard 
           title={`Tiền bàn giao (${stats.readyCount} đơn)`} 
           value={`${stats.readyMoney.toLocaleString()} đ`} 
           icon={<DollarSign size={20} />} 
           color="emerald" 
        />
      </div>

      {/* SECTION 2: DETAILS BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Pastry Details */}
         <DetailList 
            title="CHI TIẾT BÁNH ÂU" 
            items={stats.pastryDetails} 
            icon={<ChefHat size={18} />} 
            color="amber"
         />
         {/* Cream Details */}
         <DetailList 
            title="CHI TIẾT BÁNH KEM" 
            items={stats.creamDetails} 
            icon={<Cake size={18} />} 
            color="pink"
         />
      </div>

      {/* SECTION 3: TIMELINE TABS & LIST */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
         
         {/* Controls */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-1 w-full md:w-auto overflow-x-auto">
                <TabButton 
                  active={activeTab === 'cream'} 
                  onClick={() => setActiveTab('cream')}
                  label="Bếp Bánh Kem"
                  icon={<Cake size={18} />}
                  count={stats.tabCreamCount}
                  color="pink"
                />
                <TabButton 
                  active={activeTab === 'pastry'} 
                  onClick={() => setActiveTab('pastry')}
                  label="Bếp Bánh Âu"
                  icon={<ChefHat size={18} />}
                  count={stats.tabPastryCount}
                  color="amber"
                />
                <div className="w-px h-6 bg-slate-200 mx-2 hidden sm:block"></div>
                <TabButton 
                  active={activeTab === 'all'} 
                  onClick={() => setActiveTab('all')}
                  label="Tất cả đơn"
                  icon={<ListFilter size={18} />}
                  count={stats.tabAllCount}
                  color="slate"
                />
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
               <div className="hidden sm:flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-500">
                  <Clock size={14}/> {formattedDate}
               </div>
               <button 
                  onClick={() => setOrders(MOCK_ORDERS)}
                  className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <RefreshCw size={18} />
                </button>
            </div>
         </div>

         {/* Order Timeline List */}
         <div className="space-y-4">
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <TimelineOrderCard 
                  key={order.id} 
                  order={order} 
                  viewMode={activeTab === 'all' ? 'manager' : 'kitchen'}
                  onAction={() => {
                     if (activeTab === 'all') {
                        if (order.status === 'ready_to_handover') {
                            updateStatus(order.id, 'waiting_delivery');
                        }
                     } else {
                        updateStatus(order.id, 'ready_to_handover');
                     }
                  }}
                />
              ))
            ) : (
              <div className="py-12 text-center bg-white rounded-3xl border border-slate-200 border-dashed">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                    <Package size={32} />
                 </div>
                 <p className="text-slate-400 font-medium text-sm">Không có đơn hàng nào</p>
              </div>
            )}
         </div>

      </div>
    </div>
  );
};

// --- SUB COMPONENTS ---

const SummaryCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; color: 'amber' | 'pink' | 'indigo' | 'emerald' }> = ({ title, value, icon, color }) => {
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
};

const DetailList: React.FC<{ title: string; items: Record<string, number>; icon: React.ReactNode; color: 'amber' | 'pink' }> = ({ title, items, icon, color }) => {
   const textColor = color === 'amber' ? 'text-amber-700' : 'text-pink-700';
   const countColor = color === 'amber' ? 'text-amber-600' : 'text-pink-600';
   
   return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm h-full">
         <h3 className={`flex items-center gap-2 ${textColor} font-black uppercase text-sm mb-4`}>
            {icon} {title}
         </h3>
         <div className="space-y-3">
            {Object.entries(items).map(([name, count]) => (
               <div key={name} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 rounded px-1 transition-colors">
                  <span className="text-slate-700 font-medium text-sm">{name}</span>
                  <span className={`${countColor} font-black text-lg`}>{count}</span>
               </div>
            ))}
            {Object.keys(items).length === 0 && (
              <p className="text-slate-400 text-sm italic text-center py-8">Chưa có dữ liệu</p>
            )}
         </div>
      </div>
   );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  count: number;
  color: 'pink' | 'amber' | 'slate';
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, label, icon, count, color }) => {
  const styles = {
    pink: active ? 'bg-pink-50 text-pink-700 ring-1 ring-pink-200 shadow-sm' : 'text-slate-500 hover:bg-slate-50',
    amber: active ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200 shadow-sm' : 'text-slate-500 hover:bg-slate-50',
    slate: active ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50',
  };

  return (
    <button 
      onClick={onClick}
      className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${styles[color]}`}
    >
      {icon}
      {label}
      {count > 0 && (
        <span className={`px-1.5 py-0.5 rounded text-[10px] ${active ? 'bg-white/20' : 'bg-slate-200 text-slate-600'}`}>
          {count}
        </span>
      )}
    </button>
  );
};

interface TimelineOrderCardProps {
  order: Order;
  viewMode: 'kitchen' | 'manager';
  onAction: () => void;
}

const TimelineOrderCard: React.FC<TimelineOrderCardProps> = ({ order, viewMode, onAction }) => {
  const isReady = order.status === 'ready_to_handover';
  
  // Alert Logic: Late (Red) vs Risk (Yellow)
  const alertState = useMemo<'late' | 'risk' | 'none'>(() => {
     if (['waiting_delivery', 'delivering', 'completed'].includes(order.status)) return 'none';
     
     // DEMO TIME: 10:00 AM
     const now = new Date();
     now.setHours(10, 0, 0, 0);

     const todayStr = now.toISOString().split('T')[0];
     
     // Past dates not completed -> LATE
     if (order.deliveryDate < todayStr) return 'late';
     // Future dates -> SAFE
     if (order.deliveryDate > todayStr) return 'none';

     // Today: Check Time
     const [h, m] = order.deliveryTime.split(':').map(Number);
     const deadline = new Date();
     deadline.setHours(h, m, 0, 0);
     
     const diffMinutes = (deadline.getTime() - now.getTime()) / 60000;
     
     if (diffMinutes < 0) return 'late'; // Overdue
     if (diffMinutes <= 30) return 'risk'; // Within 30 mins
     
     return 'none';
  }, [order]);

  const styleConfig = {
    late: {
      border: 'border-red-200 ring-2 ring-red-50',
      timeCol: 'bg-red-50/50 border-red-100 text-red-600',
      badge: 'bg-red-500',
      badgeText: 'BỊ TRỄ',
      badgeIcon: AlertCircle
    },
    risk: {
      border: 'border-amber-200 ring-2 ring-amber-50',
      timeCol: 'bg-amber-50/50 border-amber-100 text-amber-700',
      badge: 'bg-amber-500',
      badgeText: 'NGUY CƠ',
      badgeIcon: AlertTriangle
    },
    none: {
      border: 'border-slate-200',
      timeCol: 'bg-slate-50 border-slate-100 text-slate-800',
      badge: null,
      badgeText: '',
      badgeIcon: null
    }
  }[alertState];

  const buttonLabel = viewMode === 'kitchen' ? 'Sẵn sàng' : 'Bàn giao';
  const isActionDisabled = viewMode === 'manager' && !isReady;
  const buttonText = viewMode === 'manager' && !isReady ? 'Đang làm...' : buttonLabel;

  const BadgeIcon = styleConfig.badgeIcon;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow flex overflow-hidden min-h-[140px] relative ${styleConfig.border}`}>
      
      {/* Alert Badge */}
      {alertState !== 'none' && BadgeIcon && (
         <div className={`absolute top-0 left-0 ${styleConfig.badge} text-white px-2 py-0.5 text-[10px] font-bold rounded-br-lg z-10 flex items-center gap-1 animate-pulse`}>
            <BadgeIcon size={10} /> {styleConfig.badgeText}
         </div>
      )}

      {/* Left: Time Column */}
      <div className={`w-24 md:w-32 border-r flex flex-col items-center justify-center p-4 shrink-0 ${styleConfig.timeCol}`}>
        <span className="text-2xl md:text-3xl font-black tracking-tight">{order.deliveryTime}</span>
        <span className="text-[10px] font-bold opacity-60 mt-1">{order.deliveryDate}</span>
      </div>

      {/* Middle: Content */}
      <div className="flex-1 p-5 flex flex-col justify-center relative">
        
        {/* Layout for Manager (All Tab) */}
        {viewMode === 'manager' ? (
            <>
               <div className="flex items-center gap-2 mb-2">
                   <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-black uppercase">{order.id}</span>
                   <h3 className="text-lg font-black text-slate-900 leading-none">{order.customerName}</h3>
                   {order.requiresPhoto && (
                     <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold border border-blue-100 ml-auto">
                       <Camera size={12} /> Ảnh
                     </span>
                   )}
               </div>
               <div className="text-base font-medium text-slate-700 mb-3 pl-1 border-l-2 border-slate-100">
                   {order.productName} <span className="font-bold text-[#B1454A] ml-1">x{order.quantity}</span>
               </div>
            </>
        ) : (
        /* Layout for Kitchen (Specific Tab) */
            <>
                <div className="flex justify-between items-start mb-2">
                   <h3 className="text-lg font-black text-slate-900 leading-snug pr-20">{order.productName}</h3>
                   {order.requiresPhoto && (
                     <div className="absolute top-5 right-5 flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">
                       <Camera size={14} /> Chụp hình
                     </div>
                   )}
                </div>
                <p className="text-sm font-bold text-slate-500 mb-3">SL: {order.quantity} • Khách: {order.customerName}</p>
            </>
        )}
        
        {/* Note Box */}
        <div className={`rounded-lg p-3 text-sm border mb-3 flex flex-col gap-2 ${order.notes ? 'bg-slate-50 border-slate-100 text-slate-700' : 'bg-slate-50/50 border-slate-100 text-slate-400'}`}>
           <div className="italic">
             {order.notes ? <><span className="font-bold text-slate-400 not-italic mr-1">Yêu cầu:</span> {order.notes}</> : 'Không có yêu cầu thêm'}
           </div>
           
           {/* Sample Images Button */}
           <div className="pt-2 border-t border-slate-200/50 flex">
             <button className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                <ImageIcon size={14} /> Xem ảnh mẫu đính kèm
             </button>
           </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
           <span className="flex items-center gap-1"><Clock size={12}/> Tạo lúc: {order.createdAt}</span>
           {order.deliveryMethod === 'delivery' && (
              <span className="flex items-center gap-1 text-orange-500 font-bold"><MapPin size={12}/> Giao đi</span>
           )}
        </div>
      </div>

      {/* Right: Action Button */}
      <div className="w-32 md:w-40 border-l border-slate-100 flex items-center justify-center p-4 bg-white shrink-0">
         <button 
           onClick={onAction}
           disabled={isActionDisabled}
           className={`w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
             isActionDisabled 
               ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
               : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200 active:scale-95'
           }`}
         >
           <CheckCircle size={18} />
           {buttonText}
         </button>
      </div>

    </div>
  );
};

export default ProductionPage;
