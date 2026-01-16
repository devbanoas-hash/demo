import { useMemo } from 'react';
import { AlertCircle, AlertTriangle, Clock, CheckCircle, Camera, ImageIcon, MapPin } from 'lucide-react';
import { IOrder } from '@/types/order';
import { splitDeliveryDateTime } from '@/lib/utils';

interface TimelineOrderCardProps {
  order: IOrder;
  viewMode: 'kitchen' | 'manager';
  onAction: () => void;
}

const TimelineOrderCard = ({ order, viewMode, onAction }: TimelineOrderCardProps) => {
    const isReady = order.status === 'ready_to_deliver';
  
  // Alert Logic: Late (Red) vs Risk (Yellow)
  const alertState = useMemo<'late' | 'risk' | 'none'>(() => {
     if (['out_for_delivery', 'completed', 'delivery_failed'].includes(order.status)) return 'none';
     
     // DEMO TIME: 10:00 AM
     const now = new Date();
     now.setHours(10, 0, 0, 0);

     const { day, time } = splitDeliveryDateTime(order.delivery_at);
     const todayStr = now.toISOString().split('T')[0];
     
     // Past dates not completed -> LATE
     if (day < todayStr) return 'late';
     // Future dates -> SAFE
     if (day > todayStr) return 'none';

     // Today: Check Time
     const [h, m] = time.split(':').map(Number);
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
         <div className={`absolute top-0 left-0 ${styleConfig.badge} text-white px-2 py-0.5 text-xs font-bold rounded-br-lg z-10 flex items-center gap-1 animate-pulse`}>
            <BadgeIcon size={12} /> {styleConfig.badgeText}
         </div>
      )}

      {/* Left: Time Column */}
      <div className={`w-24 md:w-32 border-r flex flex-col items-center justify-center p-4 shrink-0 ${styleConfig.timeCol}`}>
        <span className="text-3xl md:text-4xl font-black tracking-tight">{splitDeliveryDateTime(order.delivery_at).time}</span>
        <span className="text-xs font-bold opacity-60 mt-1">{splitDeliveryDateTime(order.delivery_at).day}</span>
      </div>

      {/* Middle: Content */}
      <div className="flex-1 p-5 flex flex-col justify-center relative">
        {(() => {
          const firstItem = order.cake_orders && order.cake_orders.length > 0 ? order.cake_orders[0] : null;
          const totalQuantity = order.cake_orders?.reduce((sum, item) => sum + item.quantity, 0) || 0;
          const hasCustomImage = firstItem && 'image_upload' in firstItem && Array.isArray(firstItem.image_upload) && firstItem.image_upload.length > 0;
          
          return (
            <>
              {/* Layout for Manager (All Tab) */}
              {viewMode === 'manager' ? (
                  <>
                     <div className="flex items-center gap-2 mb-2">
                         <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-sm font-black uppercase">{order.order_id}</span>
                         <h3 className="text-xl font-black text-slate-900 leading-none">{order.customer.customer_name}</h3>
                         {hasCustomImage && (
                           <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100 ml-auto">
                             <Camera size={14} /> Ảnh
                           </span>
                         )}
                     </div>
                     <div className="text-lg font-medium text-slate-700 mb-3 pl-1 border-l-2 border-slate-100">
                         {firstItem ? firstItem.cake_name : 'Chưa có sản phẩm'} <span className="font-bold text-[#B1454A] ml-1">x{totalQuantity}</span>
                     </div>
                  </>
              ) : (
              /* Layout for Kitchen (Specific Tab) */
                  <>
                      <div className="flex justify-between items-start mb-2">
                         <h3 className="text-xl font-black text-slate-900 leading-snug pr-20">{firstItem ? firstItem.cake_name : 'Chưa có sản phẩm'}</h3>
                         {hasCustomImage && (
                           <div className="absolute top-5 right-5 flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-bold border border-blue-100">
                             <Camera size={16} /> Chụp hình
                           </div>
                         )}
                      </div>
                      <p className="text-base font-bold text-slate-500 mb-3">SL: {totalQuantity} • Khách: {order.customer.customer_name}</p>
                  </>
              )}
              
              {/* Note Box */}
              <div className={`rounded-lg p-3 text-sm border mb-3 flex flex-col gap-2 ${order.order_note ? 'bg-slate-50 border-slate-100 text-slate-700' : 'bg-slate-50/50 border-slate-100 text-slate-400'}`}>
                 <div className="italic">
                   {order.order_note ? <><span className="font-bold text-slate-400 not-italic mr-1">Yêu cầu:</span> {order.order_note}</> : 'Không có yêu cầu thêm'}
                 </div>
                 
                 {/* Sample Images Button - Show if custom cake has image */}
                 {hasCustomImage && (
                   <div className="pt-2 border-t border-slate-200/50 flex">
                     <button className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                        <ImageIcon size={14} /> Xem ảnh mẫu đính kèm
                     </button>
                   </div>
                 )}
              </div>

              {/* Footer Info */}
              <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
                 <span className="flex items-center gap-1"><Clock size={14}/> Tạo lúc: {order.created_at ? new Date(order.created_at).toLocaleString('vi-VN') : 'N/A'}</span>
                 {order.fulfillment_method === 'home_delivery' && (
                    <span className="flex items-center gap-1 text-orange-500 font-bold"><MapPin size={14}/> Giao đi</span>
                 )}
              </div>
            </>
          );
        })()}
      </div>

      {/* Right: Action Button */}
      <div className="w-32 md:w-40 border-l border-slate-100 flex items-center justify-center p-4 bg-white shrink-0">
         <button 
           onClick={onAction}
           disabled={isActionDisabled}
           className={`w-full h-12 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all ${
             isActionDisabled 
               ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
               : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200 active:scale-95'
           }`}
         >
           <CheckCircle size={20} />
           {buttonText}
         </button>
      </div>

    </div>
  );
}
 
export default TimelineOrderCard;