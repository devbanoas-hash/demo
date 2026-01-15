
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Truck, Package, Clock, Filter, Store, Phone, MapPin, 
  MessageCircle, CheckCircle, AlertCircle, ArrowRight,
  RefreshCw, Search, Check, X, CreditCard, History, 
  ExternalLink, Zap, Calendar, User, ChevronRight,
  UserPlus, DollarSign, LayoutList, CalendarDays,
  Settings, Lock, ChevronDown, AlertTriangle
} from 'lucide-react';
import { Order, OrderStatus, Shipper } from '../types';
import { MOCK_ORDERS, MOCK_SHIPPERS } from '../store/mockData';

const DeliveryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [shippers] = useState<Shipper[]>(MOCK_SHIPPERS);
  
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

  const today = new Date().toISOString().split('T')[0];

  // --- Logic for Shipper Config ---
  // Initial load: show all shippers
  useEffect(() => {
    setVisibleShipperIds([...shippers.map(s => s.id), 'external']);
  }, [shippers]);

  // Determine which shippers have active orders (Locked)
  const lockedShipperIds = useMemo(() => {
    const ids = new Set<string>();
    orders.forEach(o => {
      if (o.status !== 'completed' && o.status !== 'issue_needed') {
        if (o.isExternalShip || o.shipperId === 'external_ship') ids.add('external');
        else if (o.shipperId) ids.add(o.shipperId);
      }
    });
    return ids;
  }, [orders]);

  // Ensure locked shippers are always visible
  useEffect(() => {
    setVisibleShipperIds(prev => {
      const next = new Set(prev);
      let changed = false;
      lockedShipperIds.forEach(id => {
        if (!next.has(id)) {
            next.add(id);
            changed = true;
        }
      });
      return changed ? Array.from(next) : prev;
    });
  }, [lockedShipperIds]);

  const toggleShipper = (id: string) => {
    if (lockedShipperIds.has(id)) return; // Prevent toggling if locked
    setVisibleShipperIds(prev => 
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const allShipperOptions = [
    ...shippers.map(s => ({ id: s.id, name: s.name })),
    { id: 'external', name: 'Ship Ngoài' }
  ];
  // -------------------------------

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, extra?: Partial<Order>) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: newStatus, ...extra } : o
    ));
  };

  const createNewOrder = () => {
    const id = `VANI-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id,
      customerName: 'Khách hàng mới',
      customerPhone: '090' + Math.floor(Math.random() * 10000000),
      deliveryMethod: activeTab, // Auto set method based on current tab
      deliveryAddress: activeTab === 'delivery' ? { street: 'Địa chỉ mới', ward: 'Phường 1', district: 'Quận 1' } : undefined,
      deliveryDate: today,
      deliveryTime: `${new Date().getHours() + 1}:00`,
      status: activeTab === 'delivery' ? 'waiting_delivery' : 'in_production',
      collection: 500000,
      createdAt: today,
    };
    setOrders([newOrder, ...orders]);
  };

  const hourSlots = Array.from({ length: 15 }, (_, i) => `${(i + 7).toString().padStart(2, '0')}:00`);

  // Filter orders based on Tab and Search
  const currentOrders = useMemo(() => {
    return orders.filter(o => {
      const matchTab = activeTab === 'delivery' ? o.deliveryMethod === 'delivery' : o.deliveryMethod === 'pickup';
      const matchSearch = !searchTerm || 
        o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerPhone.includes(searchTerm);
      return matchTab && matchSearch;
    });
  }, [orders, activeTab, searchTerm]);

  // Stats derived from CURRENT TAB orders
  const stats = useMemo(() => {
    const tOrders = currentOrders.filter(o => o.deliveryDate === today);
    return {
      total: tOrders.length,
      production: tOrders.filter(o => o.status === 'in_production').length,
      waiting: tOrders.filter(o => ['ready_to_handover', 'waiting_delivery'].includes(o.status)).length,
      delivering: tOrders.filter(o => o.status === 'delivering').length,
      completed: tOrders.filter(o => o.status === 'completed').length,
      revenue: tOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.collection, 0),
    };
  }, [currentOrders, today]);

  const sendZaloMsg = (order: Order, type: 'assignment' | 'update' = 'update') => {
    const shipper = shippers.find(s => s.id === order.shipperId);
    const destination = order.deliveryMethod === 'delivery' 
      ? `${order.deliveryAddress?.street}, ${order.deliveryAddress?.district}`
      : 'Nhận tại quầy';
    const statusText = order.status === 'waiting_delivery' ? 'CHỜ GIAO' : 'CẬP NHẬT';
    const msg = `[VANI] ${statusText}\nĐơn: ${order.id}\nKhách: ${order.customerName}\nSĐT: ${order.customerPhone}\nĐịa chỉ: ${destination}\nThu hộ: ${order.collection.toLocaleString()}đ`;
    const phone = shipper ? shipper.phone : order.customerPhone;
    window.open(`https://zalo.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-6 h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Zap className="text-[#B1454A] fill-[#B1454A]" size={28} />
            Quản lý Giao hàng
          </h1>
          <p className="text-slate-500 text-sm font-medium">Điều phối đơn hàng {activeTab === 'delivery' ? 'giao tận nơi' : 'nhận tại quầy'}</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
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
          <button 
            onClick={createNewOrder}
            className="bg-[#B1454A] hover:bg-[#8e373b] text-white px-5 py-2.5 rounded-2xl text-sm font-black flex items-center gap-2 shadow-lg shadow-[#B1454A]/20 transition-all active:scale-95"
          >
            <UserPlus size={18} /> Đơn mới
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-6 border-b-2 border-slate-100 shrink-0">
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

      {/* Summary Stats (Context Aware) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 shrink-0">
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
        <div className="py-2 shrink-0">
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
                      <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-3 w-56 z-50 animate-in fade-in zoom-in duration-200">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Hiển thị Shipper</h4>
                        <div className="space-y-1">
                          {allShipperOptions.map(s => {
                              const isLocked = lockedShipperIds.has(s.id);
                              const isVisible = visibleShipperIds.includes(s.id);
                              return (
                                <button 
                                  key={s.id}
                                  onClick={() => toggleShipper(s.id)}
                                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                                    isVisible ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'
                                  } ${isLocked ? 'opacity-70 cursor-not-allowed' : ''}`}
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

      {/* Content Rendering - Flexible Grow */}
      <div className="flex-1 min-h-0">
          {/* 1. DELIVERY TAB - SCHEDULE VIEW */}
          {activeTab === 'delivery' && deliveryViewMode === 'schedule' && (
            <ScheduleView 
              orders={currentOrders} 
              shippers={shippers} 
              hourSlots={hourSlots} 
              onUpdate={updateOrderStatus}
              onZalo={sendZaloMsg}
              onIssue={(id) => setIssueModal({orderId: id, isOpen: true})}
              onProcess={(id) => setProcessModal({orderId: id, isOpen: true})}
              visibleShipperIds={visibleShipperIds}
            />
          )}

          {/* 2. DELIVERY TAB - KANBAN BOARD */}
          {activeTab === 'delivery' && deliveryViewMode === 'board' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full overflow-y-auto pb-20 custom-scrollbar pr-2">
              <BoardColumn title="Sản xuất & Bàn giao" count={currentOrders.filter(o => ['in_production', 'ready_to_handover'].includes(o.status)).length} icon={<Package className="text-amber-500" />}>
                {currentOrders.filter(o => ['in_production', 'ready_to_handover'].includes(o.status)).map(o => (
                  <FullOrderCard key={o.id} order={o} onUpdate={updateOrderStatus} onZalo={sendZaloMsg} shippers={shippers} onIssue={() => setIssueModal({orderId: o.id, isOpen: true})} />
                ))}
              </BoardColumn>
              <BoardColumn title="Chờ & Đang Giao" count={currentOrders.filter(o => ['waiting_delivery', 'delivering'].includes(o.status)).length} icon={<Truck className="text-blue-500" />}>
                {currentOrders.filter(o => ['waiting_delivery', 'delivering'].includes(o.status)).map(o => (
                  <FullOrderCard key={o.id} order={o} onUpdate={updateOrderStatus} onZalo={sendZaloMsg} shippers={shippers} onIssue={() => setIssueModal({orderId: o.id, isOpen: true})} />
                ))}
              </BoardColumn>
              <BoardColumn title="Sự cố & Xử lý" count={currentOrders.filter(o => ['issue_needed', 'waiting_processing'].includes(o.status)).length} icon={<AlertCircle className="text-red-500" />}>
                {currentOrders.filter(o => ['issue_needed', 'waiting_processing'].includes(o.status)).map(o => (
                  <FullOrderCard key={o.id} order={o} onUpdate={updateOrderStatus} onZalo={sendZaloMsg} shippers={shippers} onIssue={() => setIssueModal({orderId: o.id, isOpen: true})} onProcess={() => setProcessModal({orderId: o.id, isOpen: true})} />
                ))}
              </BoardColumn>
              <BoardColumn title="Hoàn tất" count={currentOrders.filter(o => o.status === 'completed').length} icon={<CheckCircle className="text-emerald-500" />}>
                {currentOrders.filter(o => o.status === 'completed').map(o => (
                  <FullOrderCard key={o.id} order={o} onUpdate={updateOrderStatus} onZalo={sendZaloMsg} shippers={shippers} onIssue={() => setIssueModal({orderId: o.id, isOpen: true})} />
                ))}
              </BoardColumn>
            </div>
          )}

          {/* 3. PICKUP TAB - KANBAN BOARD */}
          {activeTab === 'pickup' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-y-auto pb-20 custom-scrollbar pr-2">
              <BoardColumn title="Sản xuất (Bếp)" count={currentOrders.filter(o => o.status === 'in_production').length} icon={<RefreshCw className="text-amber-500" />}>
                {currentOrders.filter(o => o.status === 'in_production').map(o => (
                  <FullOrderCard key={o.id} order={o} onUpdate={updateOrderStatus} onZalo={sendZaloMsg} shippers={shippers} onIssue={() => setIssueModal({orderId: o.id, isOpen: true})} />
                ))}
              </BoardColumn>
              <BoardColumn title="Chờ khách lấy (Tại quầy)" count={currentOrders.filter(o => o.status === 'ready_to_handover').length} icon={<Store className="text-indigo-500" />}>
                {currentOrders.filter(o => o.status === 'ready_to_handover').map(o => (
                  <FullOrderCard key={o.id} order={o} onUpdate={updateOrderStatus} onZalo={sendZaloMsg} shippers={shippers} onIssue={() => setIssueModal({orderId: o.id, isOpen: true})} />
                ))}
              </BoardColumn>
              <BoardColumn title="Đã hoàn tất" count={currentOrders.filter(o => o.status === 'completed').length} icon={<CheckCircle className="text-emerald-500" />}>
                {currentOrders.filter(o => o.status === 'completed').map(o => (
                  <FullOrderCard key={o.id} order={o} onUpdate={updateOrderStatus} onZalo={sendZaloMsg} shippers={shippers} onIssue={() => setIssueModal({orderId: o.id, isOpen: true})} />
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
                updateOrderStatus(issueModal.orderId, 'issue_needed', { issueReason });
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
                updateOrderStatus(processModal.orderId, 'waiting_delivery', { deliveryTime: newTime || 'ASAP', issueReason: '' });
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
};

// --- Helper Component: Shipper Selector Dropdown (with Portal) ---
const ShipperSelector = ({ shippers, onSelect }: { shippers: Shipper[], onSelect: (id: string, isExternal: boolean) => void }) => {
   const [isOpen, setIsOpen] = useState(false);
   const buttonRef = useRef<HTMLButtonElement>(null);
   const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

   const toggle = (e: React.MouseEvent) => {
       e.stopPropagation();
       if (!isOpen && buttonRef.current) {
           const rect = buttonRef.current.getBoundingClientRect();
           setCoords({
               top: rect.bottom + window.scrollY + 4,
               left: rect.left + window.scrollX,
               width: rect.width
           });
       }
       setIsOpen(!isOpen);
   }

   useEffect(() => {
       if (!isOpen) return;
       const close = () => setIsOpen(false);
       window.addEventListener('click', close);
       return () => window.removeEventListener('click', close);
   }, [isOpen]);

   return (
       <>
         <button 
           ref={buttonRef}
           onClick={toggle}
           className="w-full bg-slate-100 hover:bg-slate-200 py-2 rounded-lg text-[10px] font-bold text-slate-600 flex items-center justify-between px-3 transition-colors"
         >
           <span>Chọn Shipper</span>
           <ChevronDown size={14} className="text-slate-400" />
         </button>
         {isOpen && createPortal(
             <div 
                className="fixed bg-white border border-slate-200 shadow-xl rounded-xl p-1 z-[9999] flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-100"
                style={{ top: coords.top, left: coords.left, minWidth: '160px' }}
                onClick={(e) => e.stopPropagation()}
             >
                {shippers.map(s => (
                    <button
                        key={s.id}
                        onClick={() => { onSelect(s.id, false); setIsOpen(false); }}
                        className="text-left px-3 py-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-xs font-bold text-slate-600 transition-colors flex items-center justify-between group"
                    >
                        {s.name}
                        {s.active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>}
                    </button>
                ))}
                <div className="h-px bg-slate-100 my-0.5"></div>
                <button
                    onClick={() => { onSelect('external_ship', true); setIsOpen(false); }}
                    className="text-left px-3 py-2 hover:bg-amber-50 hover:text-amber-600 rounded-lg text-xs font-bold text-slate-600 transition-colors"
                >
                    Ship Ngoài
                </button>
             </div>,
             document.body
         )}
       </>
   )
}

// --- View: Schedule View ---
const ScheduleView: React.FC<{
  orders: Order[];
  shippers: Shipper[];
  hourSlots: string[];
  onUpdate: any;
  onZalo: any;
  onIssue: (id: string) => void;
  onProcess: (id: string) => void;
  visibleShipperIds: string[];
}> = ({ orders, shippers, hourSlots, onUpdate, onZalo, onIssue, onProcess, visibleShipperIds }) => {
  
  // Construct Columns
  const baseColumns = [
    { id: 'time', label: 'Thời gian', width: 'w-24' },
    { id: 'unassigned', label: 'Đơn cần giao', width: 'flex-1 min-w-[300px]' },
  ];
  
  const shipperColumns = [
    ...shippers.map(s => ({ id: s.id, label: `Shipper ${s.name}`, width: 'w-1/6 min-w-[200px]' })),
    { id: 'external', label: 'Ship Ngoài', width: 'w-1/6 min-w-[200px]' }
  ].filter(c => visibleShipperIds.includes(c.id));

  const columns = [...baseColumns, ...shipperColumns];

  const getOrdersByCol = (hour: string, colId: string) => {
    return orders.filter(o => {
      const matchTime = o.deliveryTime.startsWith(hour.split(':')[0]);
      if (!matchTime) return false;
      if (colId === 'unassigned') return !o.shipperId && !o.isExternalShip;
      if (colId === 'external') return o.isExternalShip || o.shipperId === 'external_ship';
      return o.shipperId === colId;
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col h-full relative">
      <div className="overflow-auto flex-1 custom-scrollbar">
        <div className="min-w-[1200px] relative">
          {/* Header Row - STICKY TOP */}
          <div className="flex bg-slate-50 border-b border-slate-200 sticky top-0 z-40 shadow-sm">
            {columns.map((col, idx) => (
              <div 
                key={col.id} 
                className={`${col.width} p-4 text-center border-r border-slate-200 last:border-0 relative group 
                  ${idx === 0 ? 'sticky left-0 z-50 bg-slate-50 border-r-2 border-r-slate-200/50' : ''}`}
              >
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">{col.label}</span>
              </div>
            ))}
          </div>

          {/* Data Rows */}
          <div className="divide-y divide-slate-100">
            {hourSlots.map(hour => (
              <div key={hour} className="flex min-h-[120px] hover:bg-slate-50/40 transition-colors group/row">
                
                {/* Time Slot Column - STICKY LEFT */}
                <div className="w-24 p-4 flex flex-col items-center justify-center border-r border-slate-200 bg-white sticky left-0 z-30 group-hover/row:bg-slate-50 transition-colors">
                  <span className="text-xl font-black text-slate-900">{hour.split(':')[0]}h</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Slot</span>
                </div>
                
                {columns.slice(1).map(col => {
                  const colOrders = getOrdersByCol(hour, col.id);
                  return (
                    <div key={col.id} className={`${col.width} p-3 border-r border-slate-200 last:border-0 space-y-3`}>
                      {colOrders.map(o => (
                        <MiniOrderCard 
                          key={o.id} 
                          order={o} 
                          shippers={shippers}
                          onUpdate={onUpdate} 
                          onZalo={onZalo} 
                          onIssue={onIssue}
                          onProcess={onProcess}
                          isUnassigned={col.id === 'unassigned'} 
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Mini Card for Schedule Grid ---
const MiniOrderCard: React.FC<{ 
  order: Order; 
  shippers: Shipper[];
  onUpdate: any; 
  onZalo: any; 
  onIssue: any; 
  onProcess: any;
  isUnassigned: boolean; 
}> = ({ order, shippers, onUpdate, onZalo, onIssue, onProcess, isUnassigned }) => {
  
  // Alert Logic (Hardcoded NOW = 10:00 AM)
  const alertState = useMemo<'late' | 'risk' | 'none'>(() => {
    if (order.status === 'completed' || order.status === 'issue_needed') return 'none';
    
    // DEMO TIME: 10:00 AM
    const now = new Date();
    now.setHours(10, 0, 0, 0); 
    
    const todayStr = now.toISOString().split('T')[0];
    if (order.deliveryDate < todayStr) return 'late';
    if (order.deliveryDate > todayStr) return 'none';
    
    const [h, m] = order.deliveryTime.split(':').map(Number);
    const deadline = new Date();
    deadline.setHours(h, m, 0, 0);
    
    const diffMinutes = (deadline.getTime() - now.getTime()) / 60000;
    
    if (diffMinutes < 0) return 'late';
    if (diffMinutes <= 30) return 'risk';
    return 'none';
  }, [order]);

  const borderClass = useMemo(() => {
    if (order.status === 'issue_needed') return 'border-red-200 ring-2 ring-red-50';
    if (order.status === 'completed') return 'opacity-50 border-emerald-100 bg-emerald-50/20';
    if (alertState === 'late') return 'border-red-200 bg-red-50/30';
    if (alertState === 'risk') return 'border-amber-200 bg-amber-50/30';
    return 'border-slate-200';
  }, [order.status, alertState]);

  return (
    <div className={`p-3 rounded-2xl border transition-all hover:shadow-lg bg-white relative group ${borderClass}`}>
      <div className="flex justify-between items-start mb-1.5">
         <div className="flex gap-1">
             <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${getStatusBadgeColor(order.status)}`}>{order.id}</span>
             {alertState === 'late' && <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase bg-red-500 text-white flex items-center gap-1"><AlertCircle size={8} /> TRỄ</span>}
             {alertState === 'risk' && <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase bg-amber-500 text-white flex items-center gap-1"><AlertTriangle size={8} /> GẤP</span>}
         </div>
         {order.status === 'delivering' && <Truck size={12} className="text-blue-500 animate-pulse" />}
      </div>
      <p className="text-[11px] font-black text-slate-800 line-clamp-1 mb-1">{order.customerName}</p>
      
      {isUnassigned ? (
        <div className="space-y-2 mt-2">
           <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight italic">
            {order.deliveryAddress?.street}
           </p>
           <div className="relative">
              <ShipperSelector 
                shippers={shippers} 
                onSelect={(id, isExternal) => {
                  onUpdate(order.id, 'waiting_delivery', { 
                    shipperId: isExternal ? 'external_ship' : id, 
                    isExternalShip: isExternal 
                  });
                }}
              />
           </div>
        </div>
      ) : (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 justify-end mt-2">
           {order.status !== 'completed' && (
             <>
               <button onClick={() => onUpdate(order.id, 'completed', { completedAt: new Date().toISOString() })} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><Check size={12} /></button>
               <button onClick={() => onIssue(order.id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg"><X size={12} /></button>
               <button onClick={() => onZalo(order)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><MessageCircle size={12} /></button>
             </>
           )}
           {order.status === 'issue_needed' && (
             <button onClick={() => onProcess(order.id)} className="p-1.5 bg-slate-100 text-slate-600 rounded-lg"><RefreshCw size={12} /></button>
           )}
        </div>
      )}
    </div>
  );
};

// --- Full Order Card for Kanban View ---
const FullOrderCard: React.FC<{ order: Order; onUpdate: any; onZalo: any; shippers: Shipper[]; onIssue: any; onProcess?: any }> = ({ order, onUpdate, onZalo, shippers, onIssue, onProcess }) => {
  const shipperName = order.shipperId 
    ? (shippers.find(s => s.id === order.shipperId)?.name || (order.shipperId === 'external_ship' ? 'Ship Ngoài' : order.shipperId))
    : null;

  // Alert Logic (Hardcoded NOW = 10:00 AM)
  const alertState = useMemo<'late' | 'risk' | 'none'>(() => {
    if (order.status === 'completed' || order.status === 'issue_needed') return 'none';
    
    // DEMO TIME: 10:00 AM
    const now = new Date();
    now.setHours(10, 0, 0, 0); 
    
    const todayStr = now.toISOString().split('T')[0];
    if (order.deliveryDate < todayStr) return 'late';
    if (order.deliveryDate > todayStr) return 'none';
    const [h, m] = order.deliveryTime.split(':').map(Number);
    const deadline = new Date();
    deadline.setHours(h, m, 0, 0);
    const diffMinutes = (deadline.getTime() - now.getTime()) / 60000;
    if (diffMinutes < 0) return 'late';
    if (diffMinutes <= 30) return 'risk';
    return 'none';
  }, [order]);

  const styleConfig = useMemo(() => {
    if (order.status === 'issue_needed') return { border: 'border-red-200 ring-4 ring-red-50', badge: null };
    if (order.status === 'completed') return { border: 'border-emerald-100 opacity-75', badge: null };
    
    if (alertState === 'late') return {
        border: 'border-red-200 ring-2 ring-red-50',
        badge: { color: 'bg-red-500', text: 'BỊ TRỄ', icon: AlertCircle }
    };
    if (alertState === 'risk') return {
        border: 'border-amber-200 ring-2 ring-amber-50',
        badge: { color: 'bg-amber-500', text: 'NGUY CƠ', icon: AlertTriangle }
    };
    return { border: 'border-slate-200', badge: null };
  }, [order.status, alertState]);

  return (
    <div className={`bg-white rounded-2xl border p-4 space-y-4 transition-all hover:shadow-xl relative group ${styleConfig.border}`}>
       
       {styleConfig.badge && (
         <div className={`absolute top-0 right-0 ${styleConfig.badge.color} text-white px-2 py-0.5 text-[9px] font-bold rounded-bl-xl rounded-tr-xl z-10 flex items-center gap-1 animate-pulse`}>
            <styleConfig.badge.icon size={10} /> {styleConfig.badge.text}
         </div>
       )}

       <div className="flex justify-between items-center">
          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${getStatusBadgeColor(order.status)}`}>{order.id}</span>
          <div className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full ${alertState !== 'none' && order.status !== 'completed' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>
             <Clock size={12} className={alertState !== 'none' && order.status !== 'completed' ? "text-red-500" : "text-[#B1454A]"} /> {order.deliveryTime}
          </div>
       </div>
       
       <div>
          <h4 className="font-black text-slate-900 text-sm leading-none mb-1">{order.customerName}</h4>
          <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-tighter">
            <Phone size={10} /> {order.customerPhone}
          </p>
          <div className="text-[11px] text-slate-600 mt-2 line-clamp-2 leading-relaxed">
            {order.deliveryAddress ? `${order.deliveryAddress.street}, ${order.deliveryAddress.district}` : 'Khách nhận tại quầy'}
          </div>
       </div>

       {/* Shipper Info Section */}
       {shipperName && (
         <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
           <div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Shipper</p>
             <p className="text-xs font-bold text-slate-700">{shipperName}</p>
           </div>
           {/* You could add a call button here */}
         </div>
       )}

       <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiền thu hộ:</span>
          <span className="text-sm font-black text-[#B1454A]">{order.collection.toLocaleString()}đ</span>
       </div>

       {order.issueReason && (
          <div className="p-2.5 bg-red-50 border border-red-100 rounded-xl">
             <p className="text-[10px] font-black text-red-700 uppercase mb-1">Sự cố:</p>
             <p className="text-[11px] text-red-800 font-medium italic">"{order.issueReason}"</p>
          </div>
       )}

       <div className="pt-2 grid grid-cols-2 gap-2">
          {order.status === 'in_production' && (
             <button onClick={() => onUpdate(order.id, 'ready_to_handover')} className="col-span-2 bg-amber-500 text-white py-2.5 rounded-xl text-[11px] font-black shadow-md shadow-amber-100">Xong sản xuất</button>
          )}
          {order.status === 'ready_to_handover' && (
             order.deliveryMethod === 'delivery' 
               ? <div className="col-span-2">
                   <ShipperSelector 
                      shippers={shippers} 
                      onSelect={(id, isExternal) => onUpdate(order.id, 'waiting_delivery', { shipperId: isExternal ? 'external_ship' : id, isExternalShip: isExternal })} 
                   />
                 </div>
               : <button onClick={() => onUpdate(order.id, 'completed', {completedAt: new Date().toISOString()})} className="col-span-2 bg-indigo-600 text-white py-2.5 rounded-xl text-[11px] font-black shadow-lg shadow-indigo-100">Khách đã lấy</button>
          )}
          {order.status === 'waiting_delivery' && (
             <button onClick={() => onUpdate(order.id, 'delivering')} className="col-span-2 bg-blue-600 text-white py-2.5 rounded-xl text-[11px] font-black shadow-lg shadow-blue-100">Lên đường giao</button>
          )}
          {order.status === 'delivering' && (
             <>
                <button onClick={() => onUpdate(order.id, 'completed', {completedAt: new Date().toISOString()})} className="bg-emerald-600 text-white py-2.5 rounded-xl text-[11px] font-black">Giao xong</button>
                <button onClick={onIssue} className="bg-red-50 text-red-600 border border-red-100 py-2.5 rounded-xl text-[11px] font-black">Báo lỗi</button>
             </>
          )}
          {order.status === 'issue_needed' && (
             <>
                <button onClick={() => onUpdate(order.id, 'waiting_processing')} className="bg-slate-800 text-white py-2.5 rounded-xl text-[10px] font-black">Chờ xử lý</button>
                <button onClick={() => onUpdate(order.id, 'waiting_delivery')} className="bg-indigo-50 text-indigo-600 border border-indigo-100 py-2.5 rounded-xl text-[10px] font-black">Giao lại</button>
             </>
          )}
          {order.status === 'waiting_processing' && onProcess && (
             <button onClick={onProcess} className="col-span-2 bg-slate-100 text-slate-700 py-2.5 rounded-xl text-[11px] font-black border border-slate-200 border-dashed">Cập nhật giao lại</button>
          )}
       </div>
       
       {order.status !== 'completed' && (
         <button onClick={() => onZalo(order)} className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><MessageCircle size={14}/></button>
       )}
    </div>
  );
};

// --- UI Helpers ---
const StatItem: React.FC<{ label: string; value: string | number; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => {
  const themes: Record<string, string> = {
    slate: 'bg-slate-50 text-slate-600 border-slate-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    red: 'bg-red-50 text-[#B1454A] border-red-100',
  };
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${themes[color]}`}>{icon}</div>
        <div>
          <p className="text-2xl font-black text-slate-800 leading-none mb-1">{value}</p>
          <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">{label}</p>
        </div>
      </div>
    </div>
  );
};

const BoardColumn: React.FC<{ title: string; count: number; icon: React.ReactNode; children: React.ReactNode }> = ({ title, count, icon, children }) => (
  <div className="bg-slate-100/50 rounded-[2.5rem] border border-slate-200 flex flex-col h-full overflow-hidden min-h-[600px]">
    <div className="bg-white p-5 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center gap-2.5">
         {icon}
         <h3 className="text-xs font-black uppercase text-slate-700 tracking-tight">{title}</h3>
      </div>
      <span className="bg-slate-200 text-[11px] font-black px-2.5 py-0.5 rounded-full text-slate-600">{count}</span>
    </div>
    <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-320px)] custom-scrollbar">
      {children}
    </div>
  </div>
);

const ModalWrapper: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
      <h3 className="text-xl font-black text-slate-900 mb-6">{title}</h3>
      {children}
    </div>
  </div>
);

const getStatusBadgeColor = (status: OrderStatus) => {
  switch (status) {
    case 'in_production': return 'bg-amber-100 text-amber-700';
    case 'ready_to_handover': return 'bg-indigo-100 text-indigo-700';
    case 'waiting_delivery': return 'bg-blue-100 text-blue-700';
    case 'delivering': return 'bg-purple-100 text-purple-700';
    case 'completed': return 'bg-emerald-100 text-emerald-700';
    case 'issue_needed': return 'bg-red-100 text-red-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

export default DeliveryPage;
