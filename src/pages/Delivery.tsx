import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Truck, Clock, Store, CheckCircle, Search, Zap, Calendar, DollarSign, LayoutList, CalendarDays,
  Package, RefreshCw, Settings, Check, Lock, ChevronLeft, ChevronRight
} from 'lucide-react';
import { IOrder } from '@/types/order';
import { TOrderStatus } from '@/constants/order.constant';
import { useAppData } from '@/contexts/AppDataContext';
import { useHeader } from '@/contexts/HeaderContext';
import { splitDeliveryDateTime } from '@/lib/utils';
import StatItem from '@/components/delivery/StatItem';
import BoardColumn from '@/components/delivery/BoardColumn';
import FullOrderCard from '@/components/delivery/FullOrderCard';
import ScheduleView from '@/components/delivery/ScheduleView';
import ModalWrapper from '@/components/delivery/ModalWrapper';

export default function Delivery() {
  const { orders, shippers, updateOrder } = useAppData();
  const { setSubtitle } = useHeader();
  
  // New State Structure
  const [activeTab, setActiveTab] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryViewMode, setDeliveryViewMode] = useState<'schedule' | 'board'>('schedule');

  // Shipper Visibility Config State (Lifted from ScheduleView)
  const [visibleShipperIds, setVisibleShipperIds] = useState<string[]>([]);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const [issueModal, setIssueModal] = useState<{orderId: string; isOpen: boolean}>({orderId: '', isOpen: false});
  const [processModal, setProcessModal] = useState<{orderId: string; isOpen: boolean}>({orderId: '', isOpen: false});
  const [issueReason, setIssueReason] = useState('');
  const [newTime, setNewTime] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewDate, setViewDate] = useState(new Date());

  const selectedDateStr = viewDate.toISOString().split('T')[0];

  // Filter orders based on Tab, Date, and Search
  const currentOrders = useMemo(() => {
    return orders.filter(o => {
      const matchTab = activeTab === 'delivery' ? o.fulfillment_method === 'home_delivery' : o.fulfillment_method === 'store_pickup';
      const { day } = splitDeliveryDateTime(o.delivery_at);
      const matchDate = day === selectedDateStr;
      const matchSearch = !searchTerm || 
        o.customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        o.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer.customer_phone_number.includes(searchTerm);
      return matchTab && matchDate && matchSearch;
    });
  }, [orders, activeTab, searchTerm, selectedDateStr]);

  // --- Logic for Shipper Config ---
  // Use shipper_name instead of app_id for identification
  // Initial load: show all shippers
  useEffect(() => {
    setVisibleShipperIds([...shippers.map(s => s.shipper_name), 'external']);
  }, [shippers]);

  // Determine which shippers have active orders (Locked) - using shipper_name
  const lockedShipperIds = useMemo(() => {
    const ids = new Set<string>();
    
    // Check currentOrders (already filtered by tab, date, search) for assigned shippers
    currentOrders.forEach(order => {
      if (order.shipper) {
        // Check if it's an internal shipper
        if (order.shipper.shipper_phone_number) {
          const assignedShipper = shippers.find(s => s.shipper_phone_number === order.shipper.shipper_phone_number);
          if (assignedShipper) {
            ids.add(assignedShipper.shipper_name);
          }
        }
        // Check if it's external shipper
        if (order.shipper.app_id === 'external_ship') {
          ids.add('external');
        }
      }
    });
    
    return ids;
  }, [currentOrders, shippers]);

  // Ensure locked shippers are always visible
  useEffect(() => {
    setVisibleShipperIds(prev => {
      const prevSet = new Set(prev);
      let changed = false;
      lockedShipperIds.forEach(name => {
        if (!prevSet.has(name)) {
          prevSet.add(name);
          changed = true;
        }
      });
      // Only update if there are changes, and create a new array reference
      if (changed) {
        return Array.from(prevSet);
      }
      return prev; // Return same reference if no changes
    });
  }, [lockedShipperIds]);

  // Update header subtitle when activeTab changes
  useEffect(() => {
    setSubtitle(`Điều phối đơn hàng ${activeTab === 'delivery' ? 'giao tận nơi' : 'nhận tại quầy'}`);
    return () => setSubtitle(null);
  }, [activeTab, setSubtitle]);

  const toggleShipper = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    if (lockedShipperIds.has(id)) {
      return; // Prevent toggling if locked
    }
    
    setVisibleShipperIds(prev => {
      const currentSet = new Set(prev);
      
      if (currentSet.has(id)) {
        // Remove shipper from visible list
        currentSet.delete(id);
      } else {
        // Add shipper to visible list
        currentSet.add(id);
      }
      
      // Convert back to array - this ensures a new array reference
      return Array.from(currentSet);
    });
  }, [lockedShipperIds]);

  const allShipperOptions = [
    ...shippers.map(s => ({ id: s.shipper_name, name: s.shipper_name })),
    { id: 'external', name: 'Ship Ngoài' }
  ];
  // -------------------------------

  const updateOrderStatus = async (orderId: string, newStatus: TOrderStatus, extra?: Partial<IOrder>) => {
    await updateOrder(orderId, { status: newStatus, ...extra });
  };

  const hourSlots = Array.from({ length: 17 }, (_, i) => `${(i + 7).toString().padStart(2, '0')}:00`);

  // Stats derived from CURRENT TAB orders (already filtered by date in currentOrders)
  const stats = useMemo(() => {
    return {
      total: currentOrders.length,
      production: currentOrders.filter(o => ['ready', 'in_production'].includes(o.status)).length,
      waiting: currentOrders.filter(o => ['ready_to_deliver'].includes(o.status)).length,
      delivering: currentOrders.filter(o => o.status === 'out_for_delivery').length,
      completed: currentOrders.filter(o => o.status === 'completed').length,
      revenue: currentOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.total_amount - o.deposit_amount), 0),
    };
  }, [currentOrders]);

  // const sendZaloMsg = (order: IOrder, type: 'assignment' | 'update' = 'update') => {
  //   const destination = order.fulfillment_method === 'home_delivery' 
  //     ? `${order.customer.address.street}, ${order.customer.address.district}`
  //     : 'Nhận tại quầy';
  //   const statusText = order.status === 'ready_to_deliver' ? 'CHỜ GIAO' : 'CẬP NHẬT';
  //   const remaining = order.total_amount - order.deposit_amount;
  //   const msg = `[VANI] ${statusText}\nĐơn: ${order.order_id}\nKhách: ${order.customer.customer_name}\nSĐT: ${order.customer.customer_phone_number}\nĐịa chỉ: ${destination}\nThu hộ: ${remaining.toLocaleString()}đ`;
  //   const phone = order.customer.customer_phone_number;
  //   window.open(`https://zalo.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  // };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-6">
      <div className='flex items-center justify-between'>
        {/* Main Tabs */}
        <div className="flex items-center gap-6 border-b-2 border-slate-100">
          <button 
            onClick={() => setActiveTab('delivery')}
            className={`pb-3 text-sm font-black flex items-center gap-2 transition-all relative ${activeTab === 'delivery' ? 'text-[#B1454A]' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Truck size={18} /> GIAO TẬN NƠI (SHIP)
            {activeTab === 'delivery' && <div className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-[#B1454A] rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('pickup')}
            className={`pb-3 text-sm font-black flex items-center gap-2 transition-all relative ${activeTab === 'pickup' ? 'text-[#B1454A]' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Store size={18} /> NHẬN TẠI QUẦY (PICKUP)
            {activeTab === 'pickup' && <div className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-[#B1454A] rounded-t-full"></div>}
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Tìm khách hàng, SĐT..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#B1454A]/10 focus:outline-none shadow-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Date Selector */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
              <button
                onClick={() => {
                  const prevDate = new Date(viewDate);
                  prevDate.setDate(prevDate.getDate() - 1);
                  setViewDate(prevDate);
                }}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={16} className="text-slate-500" />
              </button>
              <input
                type="date"
                value={selectedDateStr}
                onChange={(e) => setViewDate(new Date(e.target.value))}
                className="px-2 py-1 text-sm font-bold border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#B1454A]/20 focus:outline-none"
              />
              <button
                onClick={() => {
                  const nextDate = new Date(viewDate);
                  nextDate.setDate(nextDate.getDate() + 1);
                  setViewDate(nextDate);
                }}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronRight size={16} className="text-slate-500" />
              </button>
              <button
                onClick={() => setViewDate(new Date())}
                className="px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Hôm nay
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats (Context Aware) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatItem label="Tổng đơn" value={stats.total} icon={<Calendar size={20} />} color="slate" />
        <StatItem label="Sản xuất" value={stats.production} icon={<RefreshCw size={20} />} color="amber" />
        <StatItem label={activeTab === 'delivery' ? "Chờ ship" : "Chờ lấy"} value={stats.waiting} icon={<Clock size={20} />} color="indigo" />
        {activeTab === 'delivery' && (
          <StatItem label="Đang giao" value={stats.delivering} icon={<Truck size={20} />} color="blue" />
        )}
        <StatItem label="Hoàn tất" value={stats.completed} icon={<CheckCircle size={20} />} color="emerald" />
        <StatItem label="Doanh thu" value={`${(stats.revenue / 1000).toLocaleString()}k`} icon={<DollarSign size={20} />} color="red" />
      </div>

      {/* Sub-Controls (Only for Delivery) */}
      {activeTab === 'delivery' && (
        <div className="py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                <button 
                  onClick={() => setDeliveryViewMode('schedule')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all ${deliveryViewMode === 'schedule' ? 'bg-[#B1454A] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <CalendarDays size={14} /> Lịch Giờ
                </button>
                <button 
                  onClick={() => setDeliveryViewMode('board')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all ${deliveryViewMode === 'board' ? 'bg-[#B1454A] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <LayoutList size={14} /> Bảng Trạng Thái
                </button>
              </div>

              {/* Shipper Display Config - Only show in Schedule Mode */}
              {deliveryViewMode === 'schedule' && (
                <div className="relative">
                  <button 
                    onClick={() => setIsConfigOpen(!isConfigOpen)}
                    className={`p-2 rounded-xl border border-slate-200 transition-colors shadow-sm flex items-center gap-2 ${isConfigOpen ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                    title="Cấu hình hiển thị Shipper"
                  >
                    <Settings size={16} />
                  </button>
                  
                  {isConfigOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsConfigOpen(false)} />
                      <div 
                        className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-3 w-56 z-50 animate-in fade-in zoom-in duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Hiển thị Shipper</h4>
                        <div className="space-y-1">
                          {allShipperOptions.map(s => {
                              const isLocked = lockedShipperIds.has(s.id);
                              const isVisible = visibleShipperIds.includes(s.id);
                              return (
                                <button 
                                  key={s.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    if (!isLocked) {
                                      toggleShipper(s.id, e);
                                    }
                                  }}
                                  disabled={isLocked}
                                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                                    isVisible ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'
                                  } ${isLocked ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${isVisible ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>
                                      {isVisible && <Check size={10} className="text-white" />}
                                    </div>
                                    {s.name}
                                  </div>
                                  {isLocked && <Lock size={12} className="text-slate-400" />}
                                </button>
                              );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
              {deliveryViewMode === 'schedule' ? 'Xem theo khung giờ' : 'Xem theo tiến trình'}
            </div>
          </div>
        </div>
      )}

      {/* Content Rendering */}
      <div className="relative">
          {/* 1. DELIVERY TAB - SCHEDULE VIEW */}
          {activeTab === 'delivery' && deliveryViewMode === 'schedule' && (
            <ScheduleView 
              orders={currentOrders} 
              shippers={shippers} 
              hourSlots={hourSlots} 
              onUpdate={updateOrderStatus}
              //
              onIssue={(id) => setIssueModal({orderId: id, isOpen: true})}
              onProcess={(id) => setProcessModal({orderId: id, isOpen: true})}
              visibleShipperIds={visibleShipperIds}
            />
          )}

          {/* 2. DELIVERY TAB - KANBAN BOARD */}
          {activeTab === 'delivery' && deliveryViewMode === 'board' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-20">
              <BoardColumn title="Sản xuất & Bàn giao" count={currentOrders.filter(o => ['in_production', 'ready', 'ready_to_deliver'].includes(o.status)).length} icon={<Package className="text-amber-500" />}>
                {currentOrders.filter(o => ['in_production', 'ready', 'ready_to_deliver'].includes(o.status)).map(o => (
                  <FullOrderCard key={o.order_id} order={o} onUpdate={updateOrderStatus} shippers={shippers} onIssue={() => setIssueModal({orderId: o.order_id, isOpen: true})} />
                ))}
              </BoardColumn>
              <BoardColumn title="Chờ & Đang Giao" count={currentOrders.filter(o => o.status === 'out_for_delivery').length} icon={<Truck className="text-blue-500" />}>
                {currentOrders.filter(o => o.status === 'out_for_delivery').map(o => (
                  <FullOrderCard key={o.order_id} order={o} onUpdate={updateOrderStatus} shippers={shippers} onIssue={() => setIssueModal({orderId: o.order_id, isOpen: true})} />
                ))}
              </BoardColumn>
              <BoardColumn title="Hoàn tất" count={currentOrders.filter(o => o.status === 'completed').length} icon={<CheckCircle className="text-emerald-500" />}>
                {currentOrders.filter(o => o.status === 'completed').map(o => (
                  <FullOrderCard key={o.order_id} order={o} onUpdate={updateOrderStatus} shippers={shippers} onIssue={() => setIssueModal({orderId: o.order_id, isOpen: true})} />
                ))}
              </BoardColumn>
            </div>
          )}

          {/* 3. PICKUP TAB - KANBAN BOARD */}
          {activeTab === 'pickup' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-20">
              <BoardColumn title="Sản xuất & Bàn giao" count={currentOrders.filter(o => ['in_production', 'ready'].includes(o.status)).length} icon={<RefreshCw className="text-amber-500" />}>
                {currentOrders.filter(o => ['in_production', 'ready'].includes(o.status)).map(o => (
                  <FullOrderCard key={o.order_id} order={o} onUpdate={updateOrderStatus} shippers={shippers} onIssue={() => setIssueModal({orderId: o.order_id, isOpen: true})} />
                ))}
              </BoardColumn>
              <BoardColumn title="Chờ khách lấy (Tại quầy)" count={currentOrders.filter(o => o.status === 'ready_to_deliver').length} icon={<Store className="text-indigo-500" />}>
                {currentOrders.filter(o => o.status === 'ready_to_deliver').map(o => (
                  <FullOrderCard key={o.order_id} order={o} onUpdate={updateOrderStatus} shippers={shippers} onIssue={() => setIssueModal({orderId: o.order_id, isOpen: true})} />
                ))}
              </BoardColumn>
              <BoardColumn title="Đã hoàn tất" count={currentOrders.filter(o => o.status === 'completed').length} icon={<CheckCircle className="text-emerald-500" />}>
                {currentOrders.filter(o => o.status === 'completed').map(o => (
                  <FullOrderCard key={o.order_id} order={o} onUpdate={updateOrderStatus} shippers={shippers} onIssue={() => setIssueModal({orderId: o.order_id, isOpen: true})} />
                ))}
              </BoardColumn>
            </div>
          )}
      </div>

      {/* Modal: Báo cáo sự cố */}
      {issueModal.isOpen && (
        <ModalWrapper title="Báo cáo sự cố" onClose={() => setIssueModal({orderId: '', isOpen: false})}>
          <textarea 
            className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:outline-none h-32 text-sm bg-slate-50 font-medium"
            placeholder="Nhập lý do đơn cần xử lý (Khách không nghe máy, sai địa chỉ...)"
            value={issueReason}
            onChange={(e) => setIssueReason(e.target.value)}
          />
          <div className="flex gap-4 mt-6">
            <button onClick={() => setIssueModal({orderId: '', isOpen: false})} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl">Hủy</button>
            <button 
              onClick={() => {
                // Update order status to delivery_failed when reporting issue
                updateOrderStatus(issueModal.orderId, 'delivery_failed', { order_note: issueReason });
                setIssueModal({orderId: '', isOpen: false});
                setIssueReason('');
              }}
              disabled={!issueReason.trim()}
              className="flex-1 py-3 text-sm font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
            >Xác nhận lỗi</button>
          </div>
        </ModalWrapper>
      )}

      {/* Modal: Chờ xử lý -> Giao lại */}
      {processModal.isOpen && (
        <ModalWrapper title="Cập nhật thông tin giao lại" onClose={() => setProcessModal({orderId: '', isOpen: false})}>
          <div className="space-y-4">
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Giờ giao mới</label>
                <input 
                  type="time" 
                  className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
             </div>
             <p className="text-xs text-slate-500 italic">Hệ thống sẽ chuyển đơn về trạng thái "Chờ giao" với thời gian mới.</p>
          </div>
          <div className="flex gap-4 mt-8">
            <button onClick={() => setProcessModal({orderId: '', isOpen: false})} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl">Hủy</button>
            <button 
              onClick={() => {
                const { day } = splitDeliveryDateTime(orders.find(o => o.order_id === processModal.orderId)?.delivery_at || '');
                const newDeliveryAt = newTime ? `${day}T${newTime}:00` : orders.find(o => o.order_id === processModal.orderId)?.delivery_at || '';
                updateOrderStatus(processModal.orderId, 'ready_to_deliver', { delivery_at: newDeliveryAt, order_note: '' });
                setProcessModal({orderId: '', isOpen: false});
                setNewTime('');
              }}
              className="flex-1 py-3 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
            >Xác nhận giao lại</button>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
}