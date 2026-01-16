import React, { useMemo } from 'react';
import { Phone, Cookie, Cake, Info, Camera, CheckCircle2, User } from 'lucide-react';
import { IOrder } from '@/types/order';
import { TCakeOrderItem } from '@/types/order';
import { splitDeliveryDateTime } from '@/lib/utils';
import ProductThumbnail from './ProductThumbnail';
import LateIndicator from './LateIndicator';

type ViewFilter = 'all' | 'cream' | 'pastry';

interface ProductionCardProps {
  order: IOrder;
  viewFilter: ViewFilter;
  onImageClick: (url: string, allImages?: string[]) => void;
  onDonePastry?: () => void;
  onDoneCream?: () => void;
  onHandover?: () => void;
}

const ProductionCard: React.FC<ProductionCardProps> = ({ 
  order, 
  viewFilter, 
  onImageClick, 
  onDonePastry,
  onDoneCream,
  onHandover
}) => {
  const { day, time } = splitDeliveryDateTime(order.delivery_at);
  
  // Filter items based on cake type
  const pastryItems: TCakeOrderItem[] = (order.cake_orders || []).filter(
    item => item.type === 'european'
  );
  
  const creamItems: TCakeOrderItem[] = (order.cake_orders || []).filter(
    item => item.type === 'cream_cake'
  );
  
  // Check production status for each type
  const pastryCompleted = useMemo(() => {
    if (pastryItems.length === 0) return true; // No pastry items means "completed"
    return pastryItems.every(item => item.production_status === 'completed');
  }, [pastryItems]);
  
  const creamCompleted = useMemo(() => {
    if (creamItems.length === 0) return true; // No cream items means "completed"
    return creamItems.every(item => item.production_status === 'completed');
  }, [creamItems]);
  
  // Check if order has both pastry and cream items
  const hasPastry = pastryItems.length > 0;
  const hasCream = creamItems.length > 0;
  
  const allCompleted = pastryCompleted && creamCompleted;
  const isHandedOver = order.status === 'ready';
  
  // Decide which sections to show based on filter
  const showPastry = viewFilter === 'all' || viewFilter === 'pastry';
  const showCream = viewFilter === 'all' || viewFilter === 'cream';

  return (
    <div className={`bg-white rounded-[2rem] border-2 transition-all shadow-lg flex flex-col relative overflow-visible ${isHandedOver ? 'border-emerald-500 ring-4 ring-emerald-50' : 'border-slate-300'}`}>
      
      {/* Header Section */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex justify-between items-start mb-2">
          <div className="text-right flex flex-col items-end shrink-0">
            <span className="text-lg font-black text-slate-800 leading-none">{time}</span>
          </div>
          <div className="text-right flex flex-col items-end shrink-0">
            <span className="text-lg font-black italic text-slate-900 leading-none">
              {order.order_id}
            </span>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-black text-slate-900 leading-tight">
            Khách: {order.customer.customer_name}
          </h3>
          {/* {order.received_by && (
            <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-slate-500">
              <User size={12} className="text-slate-400" />
              <span>Người nhận: {order.received_by.username || order.received_by.user_id}</span>
            </div>
          )} */}
        </div>
        
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
            <Phone size={14} className="text-slate-400" />
            {order.customer.customer_phone_number}
          </div>
          <div className="text-2xl font-black text-[#B1454A] tracking-tight">
            {order.total_amount.toLocaleString()} đ
          </div>
        </div>
      </div>

      {/* Body Section */}
      <div className="p-4 space-y-4 bg-slate-50/30 flex-1">
        
        {/* Pastry Section (Bánh Âu) */}
        {showPastry && pastryItems.length > 0 && (
          <div className="bg-[#FFFCE8] rounded-2xl border border-yellow-200 p-4 shadow-sm">
            <h4 className="text-lg font-black text-slate-900 mb-3 border-b border-yellow-200/60 pb-2 flex justify-between items-center">
              Bánh Âu
              <Cookie size={16} className="text-yellow-500" />
            </h4>
            <div className="space-y-3">
              {pastryItems.map((item, idx) => {
                const isItemCompleted = item.production_status === 'completed';
                return (
                  <div key={idx} className={`space-y-1 p-2 rounded-lg ${isItemCompleted ? 'bg-green-50 border border-green-200' : ''}`}>
                    <div className="flex justify-between items-center text-sm gap-2">
                      <span className={`italic font-medium flex-1 leading-tight ${isItemCompleted ? 'text-green-700 line-through' : 'text-slate-800'}`}>
                        {item.cake_name}
                      </span>
                      <span className="font-bold text-slate-600 w-10 text-center">
                        x{item.quantity}
                      </span>
                      <span className="font-bold text-slate-900 w-24 text-right">
                        {(item.unit_price * item.quantity).toLocaleString()} đ
                      </span>
                    </div>
                    {isItemCompleted && (
                      <div className="text-[10px] font-black text-green-600 flex items-center gap-1">
                        <CheckCircle2 size={10} /> Đã hoàn thành
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cream Section (Bánh Kem) - WITH IMAGES */}
        {showCream && creamItems.length > 0 && (
          <div className="bg-[#FDF2F8] rounded-2xl border border-pink-200 p-4 shadow-sm">
            <h4 className="text-lg font-black text-slate-900 mb-3 border-b border-pink-200/60 pb-2 flex justify-between items-center">
              Bánh Kem
              <Cake size={16} className="text-pink-500" />
            </h4>
            <div className="space-y-4">
              {creamItems.map((item, idx) => {
                const isCustom = 'image_upload' in item && Array.isArray(item.image_upload) && item.image_upload.length > 0;
                const images = isCustom ? item.image_upload : [];
                const note = isCustom ? item.note : '';
                const isItemCompleted = item.production_status === 'completed';
                
                return (
                  <div key={idx} className={`space-y-3 p-2 rounded-lg ${isItemCompleted ? 'bg-green-50 border border-green-200' : ''}`}>
                    <div className="flex justify-between items-center text-sm gap-2">
                      <span className={`italic font-medium flex-1 leading-tight ${isItemCompleted ? 'text-green-700 line-through' : 'text-slate-800'}`}>
                        {item.cake_name}
                      </span>
                      <span className="font-bold text-slate-600 w-10 text-center">
                        x{item.quantity}
                      </span>
                      <span className="font-bold text-slate-900 w-24 text-right">
                        {(item.unit_price * item.quantity).toLocaleString()} đ
                      </span>
                    </div>
                    {isItemCompleted && (
                      <div className="text-[10px] font-black text-green-600 flex items-center gap-1">
                        <CheckCircle2 size={10} /> Đã hoàn thành
                      </div>
                    )}
                    
                    {isCustom && (
                      <div className="space-y-3">
                        {images.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {images.map((img, i) => (
                              <ProductThumbnail 
                                key={i} 
                                url={img} 
                                onClick={() => onImageClick(img, images)} 
                              />
                            ))}
                          </div>
                        )}

                        {note && (
                          <div className="bg-white/60 p-3 rounded-xl text-[11px] text-pink-900 leading-normal border border-pink-100/50">
                            <span className="font-black uppercase text-[9px] block mb-1 text-pink-400">
                              Mô tả:
                            </span>
                            <span className="italic">{note}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Special Order Instructions */}
      {order.order_note && (
        <div className="mx-4 mt-2 px-4 py-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <Info size={14} className="text-amber-600" />
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">
              Lưu ý quan trọng
            </span>
          </div>
          <div className="space-y-1.5">
            {order.order_note && (
              <p className="text-[11px] font-bold text-slate-700 italic leading-relaxed">
                "{order.order_note}"
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action Button Area */}
      <div className="mx-4 mb-4 mt-2">
        {viewFilter === 'pastry' && (
          <>
            {pastryCompleted ? (
              <div className="py-3 bg-emerald-100 text-emerald-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 border border-emerald-200">
                <CheckCircle2 size={14} /> Đã làm xong bánh âu
              </div>
            ) : (
              <button 
                onClick={(e) => { e.stopPropagation(); onDonePastry?.(); }}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg shadow-amber-100 transition-all active:scale-95"
              >
                <CheckCircle2 size={16} /> Làm xong tại bếp
              </button>
            )}
          </>
        )}
        
        {viewFilter === 'cream' && (
          <>
            {creamCompleted ? (
              <div className="py-3 bg-emerald-100 text-emerald-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 border border-emerald-200">
                <CheckCircle2 size={14} /> Đã làm xong bánh kem
              </div>
            ) : (
              <button 
                onClick={(e) => { e.stopPropagation(); onDoneCream?.(); }}
                className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg shadow-pink-100 transition-all active:scale-95"
              >
                <CheckCircle2 size={16} /> Làm xong tại bếp
              </button>
            )}
          </>
        )}
        
        {viewFilter === 'all' && (
          <>
            {isHandedOver ? (
              <div className="py-3 bg-emerald-100 text-emerald-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 border border-emerald-200">
                <CheckCircle2 size={14} /> Đã bàn giao
              </div>
            ) : (
              <button 
                onClick={(e) => { e.stopPropagation(); onHandover?.(); }}
                disabled={!allCompleted}
                className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg transition-all ${
                  allCompleted 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100 active:scale-95' 
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
                title={!allCompleted ? `Cần hoàn thành: ${!pastryCompleted && hasPastry ? 'Bánh Âu' : ''} ${!pastryCompleted && hasPastry && !creamCompleted && hasCream ? 'và ' : ''} ${!creamCompleted && hasCream ? 'Bánh Kem' : ''}` : ''}
              >
                <CheckCircle2 size={16} /> Bàn giao
              </button>
            )}
          </>
        )}
      </div>

      {/* Quick Alert for Late Orders */}
      <LateIndicator order={order} />
    </div>
  );
};

export default ProductionCard;
