import { useMemo, useState } from "react";
import { AlertCircle, AlertTriangle, Truck, Check, X, MessageCircle, Loader2 } from "lucide-react";
import { IOrder } from "@/types/order";
import { IShipper } from "@/types/shipper";
import { TOrderStatus } from "@/constants/order.constant";
import { splitDeliveryDateTime } from "@/lib/utils";
import ShipperSelector from "./ShipperSelector";
import { assignShipperToOrder } from "@/services/shipper.service";
import { toast } from "sonner";

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

interface MiniOrderCardProps {
    order: IOrder; 
    shippers: IShipper[];
    onUpdate: any; 
    // onZalo: any; 
    onIssue: any; 
    onProcess: any;
    isUnassigned: boolean;
}

const MiniOrderCard = ({ order, shippers, onUpdate, onIssue, onProcess, isUnassigned }: MiniOrderCardProps) => {
    const [isAssigningShipper, setIsAssigningShipper] = useState(false);

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

  const borderClass = useMemo(() => {
    if (order.status === 'completed') return 'opacity-50 border-emerald-100 bg-emerald-50/20';
    if (alertState === 'late') return 'border-red-200 bg-red-50/30';
    if (alertState === 'risk') return 'border-amber-200 bg-amber-50/30';
    return 'border-slate-200';
  }, [order.status, alertState]);

  return (
    <div className={`p-3 rounded-2xl border transition-all hover:shadow-lg bg-white relative group ${borderClass}`}>
      <div className="flex justify-between items-start mb-1.5">
         <div className="flex gap-1">
             <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${getStatusBadgeColor(order.status)}`}>{order.order_id}</span>
             {alertState === 'late' && <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase bg-red-500 text-white flex items-center gap-1"><AlertCircle size={8} /> TRỄ</span>}
             {alertState === 'risk' && <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase bg-amber-500 text-white flex items-center gap-1"><AlertTriangle size={8} /> GẤP</span>}
         </div>
         {order.status === 'out_for_delivery' && <Truck size={12} className="text-blue-500 animate-pulse" />}
      </div>
      <p className="text-[11px] font-black text-slate-800 line-clamp-1 mb-1">{order.customer.customer_name}</p>
      
      {isUnassigned ? (
        <div className="space-y-2 mt-2">
           <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight italic">
            {order.fulfillment_method === 'home_delivery' ? order.customer.address.street : 'Nhận tại quầy'}
           </p>
           <div className="relative">
              {order.status === 'in_production' ? (
                <div className="w-full bg-purple-50 border border-purple-200 py-2 rounded-lg text-[10px] font-bold text-purple-700 text-center px-3">
                  Đang sản xuất
                </div>
              ) : (
                <ShipperSelector 
                  shippers={shippers} 
                  onSelect={async (id, isExternal) => {
                  setIsAssigningShipper(true);
                  try {
                    // Tìm shipper object từ id
                    let selectedShipper: IShipper | { app_id: 'external_ship'; shipper_name: 'Ship Ngoài' };
                    
                    if (isExternal) {
                      selectedShipper = { app_id: 'external_ship' as const, shipper_name: 'Ship Ngoài' as const };
                    }
                    else {
                      const found = shippers.find(s => s.app_id === id);
                      if (!found) {
                        toast.error('Không tìm thấy shipper');
                        setIsAssigningShipper(false);
                        return;
                      }
                      selectedShipper = found;
                    }

                    // Gọi webhook n8n để gửi tin nhắn cho shipper qua Telegram
                    // n8n sẽ gửi tin nhắn và shipper sẽ phản hồi qua Telegram
                    // Sau đó n8n sẽ gửi webhook callback về backend, backend sẽ emit socket event
                    // Frontend sẽ nhận được update qua socket event 'shipper:response'
                    const result = await assignShipperToOrder(order, selectedShipper);

                    if (!result.success) {
                      toast.error(result.error || 'Không thể gửi yêu cầu đến shipper');
                      setIsAssigningShipper(false);
                      return;
                    }

                    // Optimistic update: Cập nhật order ngay lập tức để chuyển sang cột shipper
                    // Nếu shipper reject, socket event sẽ cập nhật lại về ready và clear shipper
                    if ('shipper_phone_number' in selectedShipper && selectedShipper.shipper_phone_number) {
                      // Cập nhật order với shipper để chuyển sang cột shipper ngay lập tức
                      onUpdate(order.order_id, order.status, { 
                        shipper: selectedShipper as IShipper 
                      });
                    } else if (isExternal) {
                      // External shipper - cần tạo object với app_id
                      onUpdate(order.order_id, order.status, { 
                        shipper: { 
                          app_id: 'external_ship',
                          shipper_name: 'Ship Ngoài',
                          shipper_phone_number: '',
                          status: 'free'
                        } as IShipper 
                      });
                    }

                    // Hiển thị thông báo chờ phản hồi
                    toast.info(result.message || 'Đã gửi yêu cầu đến shipper, đang chờ phản hồi');
                  }
                  catch (error: any) {
                    console.error('Error assigning shipper:', error);
                    toast.error('Có lỗi xảy ra khi assign shipper');
                  }
                  finally {
                    setIsAssigningShipper(false);
                  }
                }}
                disabled={isAssigningShipper}
              />
              )}
              {isAssigningShipper && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg z-10">
                  <Loader2 size={16} className="animate-spin text-indigo-600" />
                </div>
              )}
           </div>
        </div>
      ) : (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 justify-end mt-2">
           {order.status !== 'completed' && (
             <>
               <button onClick={() => onUpdate(order.order_id, 'completed', {})} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><Check size={12} /></button>
               <button onClick={() => onIssue(order.order_id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg"><X size={12} /></button>
               {/* <button onClick={() => onZalo(order)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><MessageCircle size={12} /></button> */}
             </>
           )}
        </div>
      )}
    </div>
  );
}
 
export default MiniOrderCard;