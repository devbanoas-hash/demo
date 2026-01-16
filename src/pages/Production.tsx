import React, { useState, useMemo, useEffect } from 'react';
import { 
  Package, RefreshCw, 
  Calendar, LayoutGrid, Cake, Cookie
} from 'lucide-react';
import { IOrder } from '@/types/order';
import { TOrderStatus } from '@/constants/order.constant';
import { useAppData } from '@/contexts/AppDataContext';
import { useHeader } from '@/contexts/HeaderContext';
import { splitDeliveryDateTime } from '@/lib/utils';
import ProductionCard from '@/components/production/ProductionCard';
import ImageZoomModal from '@/components/orders/ImageZoomModal';
import { createPortal } from 'react-dom';

type ViewFilter = 'all' | 'cream' | 'pastry';

const ProductionPage: React.FC = () => {
  const { orders, updateOrder, refreshOrders } = useAppData();
  const { setSubtitle } = useHeader();
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Update header subtitle when viewDate changes
  useEffect(() => {
    setSubtitle(`Danh sách đơn hàng ngày ${viewDate}`);
    return () => setSubtitle(null);
  }, [viewDate, setSubtitle]);

  // Define hours to display in columns
  const hourSlots = [
    '07:00', '08:00', '09:00', '10:00', '11:00', 
    '12:00', '13:00', '14:00', '15:00', '16:00', 
    '17:00', '18:00', '19:00', '20:00'
  ];

  const handleDonePastry = async (orderId: string) => {
    const order = orders.find(o => o.order_id === orderId);
    if (!order) return;
    
    const updatedCakeOrders = order.cake_orders.map(item => 
      item.type === 'european' 
        ? { ...item, production_status: 'completed' as const }
        : item
    );
    
    await updateOrder(orderId, { cake_orders: updatedCakeOrders });
  };

  const handleDoneCream = async (orderId: string) => {
    const order = orders.find(o => o.order_id === orderId);
    if (!order) return;
    
    const updatedCakeOrders = order.cake_orders.map(item => 
      item.type === 'cream_cake' 
        ? { ...item, production_status: 'completed' as const }
        : item
    );
    
    await updateOrder(orderId, { cake_orders: updatedCakeOrders });
  };

  const handleHandover = async (orderId: string) => {
    await updateOrder(orderId, { status: 'ready' as TOrderStatus });
  };

  const getOrdersForHour = (hour: string): IOrder[] => {
    return orders.filter(o => {
      const { day, time } = splitDeliveryDateTime(o.delivery_at);
      const matchTime = day === viewDate && time.startsWith(hour.split(':')[0]);
      const matchStatus = ['in_production', 'ready_to_deliver'].includes(o.status);
      
      if (!matchTime || !matchStatus) return false;

      // Filter by kitchen type if not 'all'
      if (viewFilter === 'cream') {
        return o.cake_orders?.some(item => item.type === 'cream_cake') || false;
      }
      if (viewFilter === 'pastry') {
        return o.cake_orders?.some(item => item.type === 'european') || false;
      }
      
      return true;
    });
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4">
      {/* Header Info */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between px-2 gap-4 shrink-0">
        {/* View Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setViewFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${viewFilter === 'all' ? 'bg-[#B1454A] text-white shadow-md' : 'text-slate-500 hover:bg-white'}`}
          >
            <LayoutGrid size={14} /> TẤT CẢ
          </button>
          <button 
            onClick={() => setViewFilter('cream')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${viewFilter === 'cream' ? 'bg-[#B1454A] text-white shadow-md' : 'text-slate-500 hover:bg-white'}`}
          >
            <Cake size={14} /> BÁNH KEM
          </button>
          <button 
            onClick={() => setViewFilter('pastry')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${viewFilter === 'pastry' ? 'bg-[#B1454A] text-white shadow-md' : 'text-slate-500 hover:bg-white'}`}
          >
            <Cookie size={14} /> BÁNH ÂU
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm">
            <Calendar size={16} className="text-[#B1454A]" />
            <input 
              type="date" 
              value={viewDate}
              onChange={(e) => setViewDate(e.target.value)}
              className="text-sm font-black text-slate-700 outline-none cursor-pointer bg-transparent"
            />
          </div>

          <button 
            onClick={() => refreshOrders()}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw size={16} /> Làm mới
          </button>
        </div>
      </div>

      {/* Horizontal Timeline Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar bg-slate-100/30 rounded-[3rem] border border-slate-200/50 p-6">
        <div className="flex gap-6 h-full min-w-max">
          {hourSlots.map((hour, idx) => {
            const hourOrders = getOrdersForHour(hour);
            const colBg = idx % 2 === 0 ? 'bg-white/60' : 'bg-slate-200/40';
            
            return (
              <div 
                key={hour} 
                className={`w-[400px] flex flex-col h-full ${colBg} rounded-[2.5rem] border border-white shadow-sm overflow-hidden transition-colors`}
              >
                {/* Column Header */}
                {/* <div className="p-6 text-center shrink-0 border-b border-white/50 bg-white/30">
                  <span className="text-4xl font-black text-slate-800 tracking-tighter drop-shadow-sm">
                    {hour}
                  </span>
                </div> */}

                {/* Orders List in Column */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                  {hourOrders.length > 0 ? (
                    hourOrders.map(order => (
                      <ProductionCard 
                        key={order.order_id} 
                        order={order} 
                        viewFilter={viewFilter}
                        onImageClick={(imageUrl, allImages) => {
                          setSelectedImages(allImages || [imageUrl]);
                          setCurrentImageIndex(allImages ? allImages.indexOf(imageUrl) : 0);
                        }}
                        onDonePastry={() => handleDonePastry(order.order_id)}
                        onDoneCream={() => handleDoneCream(order.order_id)}
                        onHandover={() => handleHandover(order.order_id)}
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full opacity-10 grayscale">
                      <Package size={64} className="mb-4" />
                      <span className="text-xs font-black uppercase tracking-[0.3em]">
                        Trống
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Image Zoom Modal */}
      {selectedImages.length > 0 &&  createPortal(
        <ImageZoomModal 
          images={selectedImages}
          currentIndex={currentImageIndex}
          onClose={() => {
            setSelectedImages([]);
            setCurrentImageIndex(0);
          }}
          onNavigate={setCurrentImageIndex}
        />, document.body
      )}
    </div>
  );
};

export default ProductionPage;
