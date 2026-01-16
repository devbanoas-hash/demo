import { useMemo } from 'react';
import { Clock, Phone, AlertCircle, AlertTriangle, MessageCircle } from 'lucide-react';
import { IOrder } from '@/types/order';
import { IShipper } from '@/types/shipper';
import { TOrderStatus } from '@/constants/order.constant';
import { splitDeliveryDateTime } from '@/lib/utils';
import ShipperSelector from './ShipperSelector';

function getStatusBadgeColor(status: TOrderStatus): string {
  const colors: Record<TOrderStatus, string> = {
    draft: 'bg-slate-100 text-slate-600',
    created: 'bg-indigo-100 text-indigo-700',
    in_production: 'bg-purple-100 text-purple-700',
    ready: 'bg-amber-100 text-amber-700',
    ready_to_deliver: 'bg-green-100 text-green-700',
    out_for_delivery: 'bg-blue-100 text-blue-700',
    delivery_failed: 'bg-red-100 text-red-700',
    completed: 'bg-emerald-100 text-emerald-700',
  };
  return colors[status] || 'bg-slate-100 text-slate-600';
}

interface FullOrderCardProps { order: IOrder; onUpdate: any; shippers: IShipper[]; onIssue: any; onProcess?: any }

const FullOrderCard = ({ order, onUpdate, shippers, onIssue, onProcess }: FullOrderCardProps) => {
    // Note: IOrder doesn't have shipperId field, so shipperName is null for now
    const shipperName = null;

  // Alert Logic (Hardcoded NOW = 10:00 AM)
  const alertState = useMemo<'late' | 'risk' | 'none'>(() => {
    if (order.status === 'completed') return 'none';
    
    // DEMO TIME: 10:00 AM
    const now = new Date();
    now.setHours(10, 0, 0, 0); 
    
    const { day, time } = splitDeliveryDateTime(order.delivery_at);
    const todayStr = now.toISOString().split('T')[0];
    
    if (day < todayStr) return 'late';
    if (day > todayStr) return 'none';
    
    const [h, m] = time.split(':').map(Number);
    const deadline = new Date();
    deadline.setHours(h, m, 0, 0);
    const diffMinutes = (deadline.getTime() - now.getTime()) / 60000;
    if (diffMinutes < 0) return 'late';
    if (diffMinutes <= 30) return 'risk';
    return 'none';
  }, [order]);

  const styleConfig = useMemo(() => {
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
          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${getStatusBadgeColor(order.status)}`}>{order.order_id}</span>
          <div className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full ${alertState !== 'none' && order.status !== 'completed' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>
             <Clock size={12} className={alertState !== 'none' && order.status !== 'completed' ? "text-red-500" : "text-[#B1454A]"} /> {splitDeliveryDateTime(order.delivery_at).time}
          </div>
       </div>
       
       <div>
          <h4 className="font-black text-slate-900 text-sm leading-none mb-1">{order.customer.customer_name}</h4>
          <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-tighter">
            <Phone size={10} /> {order.customer.customer_phone_number}
          </p>
          <div className="text-[11px] text-slate-600 mt-2 line-clamp-2 leading-relaxed">
            {order.fulfillment_method === 'home_delivery' ? `${order.customer.address.street}, ${order.customer.address.district}` : 'Khách nhận tại quầy'}
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
          <span className="text-sm font-black text-[#B1454A]">{(order.total_amount - order.deposit_amount).toLocaleString()}đ</span>
       </div>

       {order.order_note && (
          <div className="p-2.5 bg-red-50 border border-red-100 rounded-xl">
             <p className="text-[10px] font-black text-red-700 uppercase mb-1">Ghi chú:</p>
             <p className="text-[11px] text-red-800 font-medium italic">"{order.order_note}"</p>
          </div>
       )}

       <div className="pt-2 grid grid-cols-2 gap-2">
          {order.status === 'in_production' && (
             <button onClick={() => onUpdate(order.order_id, 'ready_to_deliver')} className="col-span-2 bg-purple-500 text-white py-2.5 rounded-xl text-[11px] font-black shadow-md shadow-purple-100">Xong sản xuất</button>
          )}
          {order.status === 'ready' && (
             <button onClick={() => onUpdate(order.order_id, 'ready_to_deliver')} className="col-span-2 bg-amber-500 text-white py-2.5 rounded-xl text-[11px] font-black shadow-md shadow-amber-100">Sẵn sàng giao</button>
          )}
          {order.status === 'ready_to_deliver' && (
             order.fulfillment_method === 'home_delivery' 
               ? <div className="col-span-2">
                   <ShipperSelector 
                      shippers={shippers} 
                      onSelect={(id, isExternal) => onUpdate(order.order_id, 'out_for_delivery', {})} 
                   />
                 </div>
               : <button onClick={() => onUpdate(order.order_id, 'completed', {})} className="col-span-2 bg-indigo-600 text-white py-2.5 rounded-xl text-[11px] font-black shadow-lg shadow-indigo-100">Khách đã lấy</button>
          )}
          {order.status === 'out_for_delivery' && (
             <>
                <button onClick={() => onUpdate(order.order_id, 'completed', {})} className="bg-emerald-600 text-white py-2.5 rounded-xl text-[11px] font-black">Giao xong</button>
                <button onClick={() => onUpdate(order.order_id, 'delivery_failed', {})} className="bg-red-50 text-red-600 border border-red-100 py-2.5 rounded-xl text-[11px] font-black">Báo lỗi</button>
             </>
          )}
          {order.status === 'delivery_failed' && (
             <>
                <button onClick={() => onUpdate(order.order_id, 'ready_to_deliver', {})} className="bg-indigo-600 text-white py-2.5 rounded-xl text-[11px] font-black">Giao lại</button>
                <button onClick={onIssue} className="bg-red-50 text-red-600 border border-red-100 py-2.5 rounded-xl text-[11px] font-black">Xử lý lỗi</button>
             </>
          )}
       </div>
       
       {/* {order.status !== 'completed' && (
         <button onClick={() => onZalo(order)} className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><MessageCircle size={14}/></button>
       )} */}
    </div>
  );
}
 
export default FullOrderCard;